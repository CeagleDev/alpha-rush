// paper_lantern — arm B: one LatheGeometry with a ribbed profile. The paper is a single
// swept profile whose radius wobbles 11 times between the tin rings, so the creases are
// real geometry catching light; rings are two short lathes with a rolled lip; the bail
// is a TubeGeometry arc with a wire loop. 0.45 m dia, base y = 0 at the bottom ring,
// hung by the loop. Emissive red over near-black (STYLE.md), one warm light at the core.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const RING = mk(0x110f12, 'metal', { roughness: 0.9, side: DS });
  const RING2 = mk(0x231718, 'metal', { roughness: 0.9, side: DS });
  const WIRE = mk(0x37201b, 'metal', { roughness: 0.8, metalness: 0.4 });
  const BODY = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xb8302a), emissiveIntensity: 2.4, roughness: 0.35, side: DS });
  const CORE = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xf1d899), emissiveIntensity: 3.0, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };

  // ribbed body profile: y from 0.045 to 0.445, radius = ellipse * (1 + rib wobble)
  const R = 0.225, RY = 0.20, CY = 0.245, N = 34, RIBS = 11;
  const pts = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const y = 0.045 + t * 0.40;
    const e = Math.sqrt(Math.max(0, 1 - ((y - CY) / RY) ** 2));
    const rib = 1 + 0.022 * Math.cos(t * Math.PI * 2 * RIBS);
    pts.push(new THREE.Vector2(Math.max(0.095, e * R * rib), y));
  }
  add(new THREE.LatheGeometry(pts, 16), BODY, 0, 0, 0);
  // bright core
  add(new THREE.SphereGeometry(0.06, 8, 6), CORE, 0, CY, 0);
  // rings with a rolled lip: bottom (grounding band) and top
  const ringProfile = (y0, flip) => {
    const p = [new THREE.Vector2(0, 0), new THREE.Vector2(0.098, 0), new THREE.Vector2(0.104, 0.008), new THREE.Vector2(0.104, 0.042), new THREE.Vector2(0.110, 0.05), new THREE.Vector2(0.098, 0.05)];
    return p.map((q) => new THREE.Vector2(q.x, flip ? y0 + 0.05 - q.y : y0 + q.y));
  };
  add(new THREE.LatheGeometry(ringProfile(0, false), 16), RING, 0, 0, 0);
  add(new THREE.LatheGeometry(ringProfile(0.435, true), 16), RING2, 0, 0, 0);
  // rivets
  for (const [y, mat] of [[0.02, RING2], [0.46, RING]]) for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + 0.6;
    add(new THREE.CylinderGeometry(0.006, 0.006, 0.006, 6), mat, Math.sin(a) * 0.106, y, Math.cos(a) * 0.106, Math.PI / 2, 0, a);
  }
  // bail: a tube arc from ring to ring over the crown, then a stem and a loop
  const arc = new THREE.QuadraticBezierCurve3(new THREE.Vector3(-0.08, 0.478, 0), new THREE.Vector3(0, 0.60, 0), new THREE.Vector3(0.08, 0.478, 0));
  add(new THREE.TubeGeometry(arc, 10, 0.004, 5, false), WIRE, 0, 0, 0);
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 6), WIRE, 0, 0.552, 0);
  add(new THREE.TorusGeometry(0.018, 0.004, 4, 10), WIRE, 0, 0.583, 0, 0, 0, 0);

  finish(THREE, g, [{ x: 0, y: CY, z: 0, color: 0xf0a060, intensity: 1.2, range: 3 }]);
  return g;
}
function finish(THREE, g, lights) {
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((l) => ({ ...l, x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
}
