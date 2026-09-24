// fallen_log — JUMP obstacle: a 1.9 m length of fallen cedar lying ACROSS a lane (authored along X),
// 1.0 m tall to the top of its broken branch stub. A cylinder with bark ridges written into its
// vertices, a sawn end showing heartwood and growth rings (+X) and a splintered break (-X), long bark
// plates, moss on the top, bracket fungus on the +Z side, a second stub poking toward the path, and
// needle litter around a dark contact band. userData.obstacle = { kind: 'jump', lanes: 1 }. Base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, r, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0, ...o }); m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, mat); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  const BARK = mk(0x4f2d21, 'timber', 0.95);
  const BARK2 = mk(0x37201b, 'timber', 0.95);
  const BARK3 = mk(0x6c4028, 'timber', 0.92);
  const HEART = mk(0x8b6141, 'timber', 0.85);
  const RING = mk(0x6c4028, 'timber', 0.90);
  const MOSS = mk(0x3d4a22, 'foliage', 0.95);
  const MOSS2 = mk(0x4a5a2a, 'foliage', 0.95);
  const FUNGUS = mk(0xd8ae70, 'plaster', 0.80, { side: DS });
  const FUNGUS2 = mk(0xbf7c42, 'plaster', 0.80, { side: DS });
  const BLACK = mk(0x110f12, 'ground', 0.90);
  const NEEDLE = mk(0x6c4028, 'plaster', 0.90);

  const R = 0.40, LEN = 1.7, CY = R + 0.02;
  const geo = new THREE.CylinderGeometry(R * 0.92, R, LEN, 16, 5, false);
  { const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) { const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (Math.hypot(x, z) < 1e-3) continue; const a = Math.atan2(z, x); const k = 1 + 0.06 * Math.sin(a * 7 + y * 3) + 0.03 * Math.sin(a * 15 - y * 5); p.setXYZ(i, x * k, y, z * k); }
    geo.computeVertexNormals(); }
  add(geo, BARK, 0, CY, 0, 0, 0, Math.PI / 2);                 // axis along X, wide end at +X
  add(new THREE.BoxGeometry(1.7, 0.08, 0.62), BLACK, 0, 0.04, 0);   // contact band
  // sawn end (+X): heartwood and rings
  add(new THREE.CylinderGeometry(R * 0.82, R * 0.82, 0.02, 14), HEART, LEN / 2 + 0.005, CY, 0, 0, 0, Math.PI / 2);
  for (const rr of [0.62, 0.42, 0.22]) add(new THREE.TorusGeometry(R * rr, 0.008, 3, 14), RING, LEN / 2 + 0.02, CY, 0, 0, Math.PI / 2, 0);
  add(new THREE.BoxGeometry(0.008, 0.02, R * 1.2), BARK2, LEN / 2 + 0.018, CY + 0.06, 0, 0.5, 0, 0);   // a check crack in the face
  // splintered end (-X)
  add(new THREE.CylinderGeometry(R * 0.7, R * 0.7, 0.02, 12), HEART, -LEN / 2 - 0.005, CY, 0, 0, 0, Math.PI / 2);
  add(new THREE.ConeGeometry(R * 0.5, 0.22, 7), HEART, -LEN / 2 - 0.10, CY, 0, 0, 0, Math.PI / 2);
  for (let k = 0; k < 6; k++) {
    const a = k * 1.05 + 0.3, rr = R * (0.45 + hash(k, 1) * 0.35);
    add(new THREE.BoxGeometry(0.16 + hash(k, 2) * 0.10, 0.05, 0.06), k % 2 ? HEART : BARK3, -LEN / 2 - 0.06, CY + Math.cos(a) * rr, Math.sin(a) * rr, a, 0, (hash(k, 3) - 0.5) * 0.5);
  }
  // branch stubs: one up (the 1.0 m top), one toward the path
  add(new THREE.CylinderGeometry(0.065, 0.09, 0.50, 8), BARK2, 0.42, CY + 0.36, 0.02, 0.1, 0, -0.3);
  add(new THREE.CylinderGeometry(0.065, 0.065, 0.012, 8), HEART, 0.42 + 0.25 * Math.sin(0.3), CY + 0.36 + 0.25 * Math.cos(0.3), 0.02 + 0.025, 0.1, 0, -0.3);
  add(new THREE.CylinderGeometry(0.05, 0.07, 0.34, 8), BARK, -0.45, CY + 0.12, 0.40, Math.PI / 2 - 0.5, 0, 0);
  add(new THREE.CylinderGeometry(0.05, 0.05, 0.012, 8), HEART, -0.45, CY + 0.12 + 0.17 * Math.cos(Math.PI / 2 - 0.5), 0.40 + 0.17 * Math.sin(Math.PI / 2 - 0.5), Math.PI / 2 - 0.5, 0, 0);
  // bark plates around the log
  for (let i = 0; i < 10; i++) {
    const a = hash(i, 4) * Math.PI * 2, L = 0.5 + hash(i, 5) * 0.6, x = (hash(i, 6) - 0.5) * (1.6 - L);
    const rr = R * 0.98 * (1 + 0.06 * Math.sin(a * 7)) ;
    add(new THREE.BoxGeometry(L, 0.04, 0.07 + hash(i, 7) * 0.04), i % 3 === 0 ? BARK3 : i % 3 === 1 ? BARK2 : BARK, x, CY + Math.cos(a) * rr, Math.sin(a) * rr, a, 0, (hash(i, 8) - 0.5) * 0.05);
  }
  // moss on top, fungus brackets on the +Z side
  add(new THREE.SphereGeometry(0.18, 8, 4), MOSS, -0.1, CY + R * 0.92, -0.05).scale.set(1.6, 0.35, 1);
  add(new THREE.SphereGeometry(0.14, 8, 4), MOSS2, 0.62, CY + R * 0.85, 0.15).scale.set(1.2, 0.35, 1);
  add(new THREE.SphereGeometry(0.12, 8, 4), MOSS, -0.6, CY + 0.1, -0.35).scale.set(1.2, 0.5, 0.6);
  for (const [x, y, rr, m] of [[-0.2, CY - 0.05, 0.11, FUNGUS], [0.08, CY + 0.02, 0.09, FUNGUS2], [0.3, CY - 0.12, 0.08, FUNGUS]]) {
    add(new THREE.CylinderGeometry(rr, rr * 0.8, 0.03, 8, 1, false, 0, Math.PI), m, x, y, R * 0.97, 0.15, -Math.PI / 2, 0);
  }
  // needle litter
  for (let i = 0; i < 5; i++) add(new THREE.BoxGeometry(0.3 + hash(i, 9) * 0.3, 0.008, 0.12), NEEDLE, -0.8 + hash(i, 10) * 1.6, 0.004, (hash(i, 11) - 0.5) * 0.9, 0, hash(i, 12) * 3, 0);

  g.userData.obstacle = { kind: 'jump', lanes: 1 };
  finish(THREE, g);
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
  if (lights) g.userData.lights = lights.map((l) => ({ ...l, x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
}
