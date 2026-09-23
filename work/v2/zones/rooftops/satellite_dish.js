// satellite_dish — from the rooftops board: the pink-and-grey dishes on the parapets. A 1.2 m
// offset dish (a lathed paraboloid, DoubleSide, with a rim bead and a rusted patch), an LNB on a
// three-strut feed arm, clamped by a tilt bracket to a short galvanised post on a square base
// plate with anchor bolts and a grounding band; a coax cable loops down the post to a clip.
// Tilted up 35 degrees and looking toward +Z. 1.5 m tall. Base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (rt, rb, h, s) => new THREE.CylinderGeometry(rt, rb, h, s);
  const DISH = M(0xd6cfc4, 'metal', { roughness: 0.6, metalness: 0.3, side: DS });    // chalky off-white
  const DISHB = M(0x9a958a, 'metal', { roughness: 0.75, metalness: 0.3, side: DS });
  const GALV = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.2, side: DS });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2 });
  const BLACK = M(0x110f12, 'metal', { roughness: 0.95 });
  const CABLE = M(0x1b1c1e, 'metal', { roughness: 0.9 });
  const LNB = M(0x3a3a3c, 'metal', { roughness: 0.7, metalness: 0.3 });

  // base plate, bolts, post, clamp
  add(B(0.36, 0.03, 0.36), BLACK, 0, 0.015, 0);
  add(B(0.30, 0.015, 0.30), GALV, 0, 0.037, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(C(0.014, 0.014, 0.02, 6), RUSTD, sx * 0.12, 0.05, sz * 0.12);
  add(C(0.035, 0.035, 0.85, 8), GALV, 0, 0.47, 0);
  add(C(0.04, 0.04, 0.05, 8), RUSTD, 0, 0.10, 0);
  add(C(0.045, 0.045, 0.12, 8), RUSTD, 0, 0.86, 0);                                  // tilt clamp collar
  add(B(0.10, 0.14, 0.04), GALV, 0, 0.90, -0.05);
  for (const y of [0.85, 0.96]) add(C(0.012, 0.012, 0.06, 6), BLACK, 0, y, -0.06, Math.PI / 2, 0, 0);
  // the dish assembly, pivoted at the clamp: a group tilted back 35 degrees, looking +Z
  const a = new THREE.Group(); a.position.set(0, 0.92, 0); a.rotation.x = -0.61; g.add(a);
  // paraboloid: r from 0 to 0.6, depth 0.10; the rim slightly rolled
  const pts = []; for (let i = 0; i <= 8; i++) { const r = 0.6 * i / 8; pts.push(new THREE.Vector2(r + 0.001, 0.28 * r * r)); }
  pts.push(new THREE.Vector2(0.615, 0.105), new THREE.Vector2(0.612, 0.085));
  const dish = add(new THREE.LatheGeometry(pts, 22), DISH, 0, 0.35, 0.05, Math.PI / 2, 0, 0, a);   // faces +z (in the tilted frame)
  add(new THREE.TorusGeometry(0.61, 0.012, 4, 22), DISHB, 0, 0.35, 0.155, 0, 0, 0, a);
  add(new THREE.LatheGeometry([new THREE.Vector2(0.18, 0.09), new THREE.Vector2(0.42, 0.05), new THREE.Vector2(0.45, 0.06), new THREE.Vector2(0.2, 0.1)], 22, 0.9, 1.4), RUST, 0, 0.35, 0.05, Math.PI / 2, 0, 0, a);   // a rust patch on the face
  // back-frame: a spine and two ribs, so the back is not a bare shell
  add(B(0.05, 1.05, 0.04), GALV, 0, 0.35, 0.02, 0, 0, 0, a);
  add(B(1.0, 0.05, 0.04), GALV, 0, 0.35, 0.02, 0, 0, 0, a);
  add(B(0.12, 0.2, 0.06), RUSTD, 0, 0.12, 0.0, 0, 0, 0, a);
  // feed arm: three struts from the lower rim to the LNB at the focus (~0.5 m in front, below centre)
  const F = new THREE.Vector3(0, 0.1, 0.6);
  for (const [x, y] of [[-0.25, 0.0], [0.25, 0.0], [0, -0.22]]) {
    const P = new THREE.Vector3(x, 0.35 + y, 0.12), d = F.clone().sub(P), L = d.length();
    const s = add(C(0.008, 0.008, L, 5), GALV, 0, 0, 0, 0, 0, 0, a);
    s.position.copy(P.clone().add(F).multiplyScalar(0.5)); s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
  }
  add(C(0.03, 0.035, 0.14, 8), LNB, F.x, F.y, F.z, Math.PI / 2, 0, 0, a);
  add(C(0.045, 0.03, 0.05, 8), LNB, F.x, F.y, F.z - 0.09, Math.PI / 2, 0, 0, a);
  // coax: from the LNB along a strut, down the post, to a clip
  const cable = new THREE.CatmullRomCurve3([new THREE.Vector3(0.02, 0.98, 0.55), new THREE.Vector3(0.06, 0.9, 0.2), new THREE.Vector3(0.05, 0.75, -0.04), new THREE.Vector3(0.05, 0.4, -0.03), new THREE.Vector3(0.08, 0.1, 0.02), new THREE.Vector3(0.16, 0.03, 0.06)]);
  add(new THREE.TubeGeometry(cable, 16, 0.006, 4, false), CABLE, 0, 0, 0);
  add(B(0.03, 0.03, 0.02), RUSTD, 0.05, 0.4, -0.05);
  g.userData.lights = [];
  place(THREE, g);
  return g;
}
function place(THREE, g) {
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  if (g.userData.lights) g.userData.lights.forEach((l) => { l.x -= c.x; l.y -= box.min.y; l.z -= c.z; });
}
