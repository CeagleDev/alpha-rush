// beer_keg — arm B: primitives. Straight cylinder body with two short fatter cylinders for the
// swaged ribs, closed cylinders for the rubber chimes, a torus lip, a top plate with the valve,
// and a tag.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  const STEEL = M(0xa9adaf, 'metal', { roughness: 0.45, metalness: 0.3, side: DS });
  const STEEL2 = M(0x7d8184, 'metal', { roughness: 0.55, metalness: 0.3, side: DS });
  const RUBBER = M(0x2a2628, 'metal', { roughness: 0.9, side: DS });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1, side: DS });
  const PAPER = M(0xd8c9a8, 'fabric', { roughness: 0.9, side: DS });
  const INK = M(0x37201b, 'fabric', { roughness: 0.9 });
  const S = 16;
  add(C(0.195, 0.195, 0.44, S, true), STEEL, 0, 0.29, 0);
  add(C(0.19, 0.195, 0.07, S), RUBBER, 0, 0.035, 0);                 // bottom chime
  add(C(0.205, 0.205, 0.06, S, true), GROUND, 0, 0.03, 0);
  add(C(0.205, 0.205, 0.035, S, true), STEEL2, 0, 0.21, 0);          // ribs
  add(C(0.205, 0.205, 0.035, S, true), STEEL2, 0, 0.33, 0);
  add(C(0.196, 0.196, 0.05, S, true), RUST, 0, 0.115, 0);
  add(C(0.195, 0.19, 0.06, S, true), RUBBER, 0, 0.54, 0);            // top chime wall
  add(new THREE.TorusGeometry(0.19, 0.012, 4, S), RUBBER, 0, 0.585, 0, Math.PI / 2, 0, 0);
  add(C(0.16, 0.16, 0.01, S), STEEL2, 0, 0.55, 0);                    // top plate
  for (const a of [0.9, 0.9 + Math.PI]) add(B(0.09, 0.03, 0.03), GROUND, Math.sin(a) * 0.195, 0.56, Math.cos(a) * 0.195, 0, a, 0);
  add(C(0.035, 0.035, 0.02, 8), STEEL2, 0, 0.565, 0);
  add(C(0.022, 0.022, 0.02, 8), STEEL, 0, 0.585, 0);
  add(B(0.03, 0.01, 0.01), STEEL2, 0, 0.60, 0);
  add(C(0.003, 0.003, 0.16, 3, true), INK, 0.212, 0.50, 0.02, 0, 0, 0.2);
  add(B(0.07, 0.11, 0.006), PAPER, 0.232, 0.36, 0.03, 0, 0.3, 0.15);
  add(B(0.03, 0.05, 0.008), INK, 0.233, 0.36, 0.03, 0, 0.3, 0.55);
  // --- the six lines: measure vertices, base to y=0, centre x/z ---------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), mm = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(mm.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
