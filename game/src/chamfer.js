/**
 * chamfer.js — E4. A THREE namespace whose BoxGeometry comes out rounded.
 *
 *   import { wrapTHREE } from './chamfer.js?v=202609211301';
 *   const built = assetModule.default(wrapTHREE(THREE));
 *
 * Hard box edges were a named "not AAA" cause (rust17 item 24). Every asset in this repo is a
 * function of THREE, so instead of editing fifty-eight assets we hand them a Proxy over the
 * namespace whose `BoxGeometry` returns a RoundedBoxGeometry (1.5 cm radius, 2 segments) when the
 * box's smallest side is >= 25 cm, and a plain box otherwise. Everything else on the namespace
 * passes straight through, so `THREE.MeshStandardMaterial`, `THREE.Group` and friends are the
 * real ones and `instanceof` still holds (the rounded box extends THREE.BoxGeometry).
 *
 * The rounded box is written here rather than imported from three/addons so this file has no
 * import of its own and works with whatever THREE it is handed. It is the same construction as
 * three's addons/geometries/RoundedBoxGeometry.js: a 5x5 grid per face (segments*2+1), with
 * the outer two rings per side bent into the radius and the centre cell left flat, so the flat
 * stays one quad and the tris go into the edge. Cost: 300 tris per rounded box against 12 for a
 * plain one. `CHAMFER.segments = 1` gives 108 tris per box if a budget needs it.
 *
 * `?chamfer=0` turns it off (A/B toggle, rust17 item 10). A box asked for with its own
 * subdivision (segments > 1 on any axis) is left plain: the author wanted those vertices for
 * something (bending, vertex colour), and rounding would move them.
 *
 * UVs: each face maps its full extent to 0..1 from the finished positions, which is what
 * surfaces.js scales for texel density. The edge band gets a few percent of stretch that is
 * invisible at 1.5 cm.
 */

export const CHAMFER = { radius: 0.015, segments: 2, minSide: 0.25, enabled: true };
try {
  const q = new URLSearchParams(globalThis.location ? globalThis.location.search : '');
  if (q.get('chamfer') === '0') CHAMFER.enabled = false;
} catch (e) { /* no location */ }

const classes = new WeakMap();   // THREE namespace -> RoundedBoxGeometry class bound to it
const wrapped = new WeakMap();   // THREE namespace -> Proxy

/** RoundedBoxGeometry(width, height, depth, segments, radius), bound to one THREE. */
export function roundedBoxClass(THREE) {
  let C = classes.get(THREE);
  if (C) return C;
  C = class RoundedBoxGeometry extends THREE.BoxGeometry {
    constructor(width = 1, height = 1, depth = 1, segments = 2, radius = 0.015) {
      const seg = segments * 2 + 1;                                  // odd, so a flat cell sits in the middle
      const r = Math.min(width / 2, height / 2, depth / 2, radius);
      super(1, 1, 1, seg, seg, seg);
      this.type = 'RoundedBoxGeometry';
      this.parameters = { width, height, depth, segments, radius: r };
      if (seg === 1) { this.scale(width, height, depth); return; }

      const g2 = this.toNonIndexed();
      this.index = null;
      this.setAttribute('position', g2.attributes.position);
      this.setAttribute('normal', g2.attributes.normal);
      this.setAttribute('uv', g2.attributes.uv);

      const p = new THREE.Vector3(), n = new THREE.Vector3();
      const box = new THREE.Vector3(width, height, depth).multiplyScalar(0.5).subScalar(r);
      const pos = this.attributes.position.array;
      const nrm = this.attributes.normal.array;
      const uv = this.attributes.uv.array;
      const perFace = pos.length / 6;
      const half = 0.5 / seg;
      const sgn = (v) => (v > 0 ? 1 : v < 0 ? -1 : 0);
      for (let i = 0, j = 0; i < pos.length; i += 3, j += 2) {
        p.fromArray(pos, i);
        // pull the vertex inward by half a cell on every axis: a vertex in the centre cell lands on
        // the axis and stays flat, a vertex in the outer two rings picks up a bend
        n.set(p.x - sgn(p.x) * half, p.y - sgn(p.y) * half, p.z - sgn(p.z) * half).normalize();
        const x = box.x * sgn(p.x) + n.x * r;
        const y = box.y * sgn(p.y) + n.y * r;
        const z = box.z * sgn(p.z) + n.z * r;
        pos[i] = x; pos[i + 1] = y; pos[i + 2] = z;
        nrm[i] = n.x; nrm[i + 1] = n.y; nrm[i + 2] = n.z;
        // BoxGeometry face order: +x, -x, +y, -y, +z, -z
        const side = Math.floor(i / perFace);
        let u, v;
        if (side < 2) { u = z / depth + 0.5; v = y / height + 0.5; }
        else if (side < 4) { u = x / width + 0.5; v = z / depth + 0.5; }
        else { u = x / width + 0.5; v = y / height + 0.5; }
        uv[j] = u; uv[j + 1] = v;
      }
      this.attributes.position.needsUpdate = true;
      this.attributes.normal.needsUpdate = true;
      this.attributes.uv.needsUpdate = true;
      this.computeBoundingBox();
      this.computeBoundingSphere();
    }
  };
  classes.set(THREE, C);
  return C;
}

/**
 * wrapTHREE(THREE) -> a Proxy over the namespace. Cached per namespace, so calling it for every
 * asset load costs nothing. With chamfering disabled it returns THREE itself.
 */
export function wrapTHREE(THREE) {
  if (!CHAMFER.enabled) return THREE;
  let P = wrapped.get(THREE);
  if (P) return P;
  const Rounded = roundedBoxClass(THREE);
  const Plain = THREE.BoxGeometry;
  function ChamferBox(w = 1, h = 1, d = 1, ws = 1, hs = 1, ds = 1) {
    const s = Math.min(w, h, d);
    if (CHAMFER.enabled && Number.isFinite(s) && s >= CHAMFER.minSide && ws === 1 && hs === 1 && ds === 1) {
      return new Rounded(w, h, d, CHAMFER.segments, CHAMFER.radius);
    }
    return new Plain(w, h, d, ws, hs, ds);
  }
  ChamferBox.prototype = Plain.prototype;      // `instanceof THREE.BoxGeometry` keeps working
  ChamferBox.fromJSON = Plain.fromJSON;
  const handler = { get(t, k, r) { return k === 'BoxGeometry' ? ChamferBox : Reflect.get(t, k, r); } };
  try { P = new Proxy(THREE, handler); }
  catch (e) { P = Object.assign(Object.create(null), THREE, { BoxGeometry: ChamferBox }); }
  wrapped.set(THREE, P);
  return P;
}
