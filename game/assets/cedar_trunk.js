// cedar_trunk — a 14 m cedar (sugi) trunk from the env_torii board, the kind that stands behind the
// lanterns: a lathe with a wide root flare and bark ridges written into its vertices, six buttress
// roots (bevelled extrusions) radiating from the foot, long bark plates half-proud of the surface,
// two big broken branch stubs at 7 m and 10 m facing the path (+Z) plus three lopped stubs, and a
// moss skirt at the base. The bottom 8 cm is the near-black grounding band, cut from the same
// profile so it stays seamless. No canopy: the game's mist takes the top.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, r, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0, ...o }); m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = g) => { const n = new THREE.Mesh(geo, mat); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); parent.add(n); return n; };
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  const BARK = mk(0x4f2d21, 'timber', 0.95);
  const BARK2 = mk(0x37201b, 'timber', 0.95);
  const BARK3 = mk(0x6c4028, 'timber', 0.92);
  const BLACK = mk(0x110f12, 'timber', 0.95);
  const MOSS = mk(0x3d4a22, 'foliage', 0.95);
  const MOSS2 = mk(0x4a5a2a, 'foliage', 0.95);
  const HEART = mk(0x8b6141, 'timber', 0.90);
  const DEAD = mk(0x8a8378, 'timber', 0.90);

  // trunk profile (radius, height) and the bark noise, shared by every piece that must sit on it
  const prof = [[0.95, 0.08], [0.80, 0.22], [0.64, 0.55], [0.52, 1.1], [0.46, 2.0], [0.43, 3.5], [0.40, 5.5], [0.37, 7.5], [0.34, 9.5], [0.31, 11.5], [0.28, 13.4], [0.24, 14.0], [0.0, 14.0]];
  const kk = (a, y) => 1 + 0.05 * Math.sin(a * 6 + y * 0.9) + 0.03 * Math.sin(a * 13 - y * 2.3) + 0.02 * Math.sin(y * 5.1 + a);
  const rAt = (y) => { for (let i = 1; i < prof.length; i++) if (y <= prof[i][1]) { const [r0, y0] = prof[i - 1], [r1, y1] = prof[i]; return r0 + (r1 - r0) * (y - y0) / (y1 - y0); } return 0.24; };
  const warp = (geo) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      const x = p.getX(i), y = p.getY(i), z = p.getZ(i); if (Math.hypot(x, z) < 0.01) continue;
      const k = kk(Math.atan2(z, x), y); p.setXYZ(i, x * k, y, z * k);
    }
    geo.computeVertexNormals(); return geo;
  };
  add(warp(new THREE.LatheGeometry(prof.map(([r, y]) => new THREE.Vector2(r, y)), 16)), BARK, 0, 0, 0);
  add(warp(new THREE.LatheGeometry([[1.0, 0], [0.95, 0.08]].map(([r, y]) => new THREE.Vector2(r, y)), 16)), BLACK, 0, 0, 0);   // grounding band
  // buttress roots
  for (let i = 0; i < 6; i++) {
    const a = i * Math.PI / 3 + hash(i, 1) * 0.5, L = 0.45 + hash(i, 2) * 0.5, H = 0.9 + hash(i, 3) * 0.6;
    const sh = new THREE.Shape();
    sh.moveTo(0.3, 0.03); sh.lineTo(0.85 + L, 0.03); sh.lineTo(0.85 + L, 0.12); sh.quadraticCurveTo(0.95, 0.25, 0.62, H); sh.lineTo(0.3, H + 0.5); sh.lineTo(0.3, 0.03);
    const dep = 0.30 + hash(i, 4) * 0.14;
    const rg = new THREE.ExtrudeGeometry(sh, { depth: dep, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 1, curveSegments: 5 });
    rg.translate(0, 0, -dep / 2);
    add(rg, i % 2 ? BARK2 : BARK, 0, 0, 0, 0, -a, 0);
  }
  // bark plates, long and thin, half-proud so none floats
  for (let i = 0; i < 20; i++) {
    const a = hash(i, 5) * Math.PI * 2, y0 = 0.6 + hash(i, 6) * 10.5, L = Math.min(1.2 + hash(i, 7) * 2.2, 13.5 - y0), y = y0 + L / 2;
    const r = rAt(y) * kk(a, y);
    const m = add(new THREE.BoxGeometry(0.06 + hash(i, 8) * 0.05, L, 0.05), i % 3 === 0 ? BARK3 : i % 3 === 1 ? BARK2 : BARK, Math.cos(a) * r, y, Math.sin(a) * r, 0, Math.PI / 2 - a, 0);
    m.rotation.z = (hash(i, 9) - 0.5) * 0.05;
  }
  // branch stubs: a group turned to the angle, a cylinder tilted up inside it, a broken end
  const stub = (y, a, len, r, tilt, mat, dead) => {
    const rr = rAt(y) * kk(a, y);
    const grp = new THREE.Group(); grp.position.set(Math.cos(a) * rr * 0.85, y, Math.sin(a) * rr * 0.85); grp.rotation.y = -a; g.add(grp);
    const phi = Math.PI / 2 - tilt;
    const c = add(new THREE.CylinderGeometry(r * 0.72, r, len, 9), mat, len / 2 * Math.sin(phi), len / 2 * Math.cos(phi), 0, 0, 0, -phi, grp);
    c.geometry.translate(0, 0, 0);
    const ex = len * Math.sin(phi), ey = len * Math.cos(phi);
    add(new THREE.ConeGeometry(r * 0.72, r * 1.4, 6), dead ? DEAD : HEART, ex + r * 0.5 * Math.sin(phi), ey + r * 0.5 * Math.cos(phi), 0, 0, 0, -phi, grp);
    for (let k = 0; k < 3; k++) add(new THREE.BoxGeometry(r * 0.35, r * 1.2, r * 0.25), HEART, ex + Math.cos(k * 2.1) * r * 0.5, ey + Math.sin(k * 2.1) * r * 0.5, (k - 1) * r * 0.4, 0.3 * k, 0, -phi + (k - 1) * 0.4, grp);
  };
  stub(7.0, 0.5, 1.6, 0.15, 0.55, BARK, false);
  stub(10.3, 2.5, 1.3, 0.12, 0.45, BARK2, true);
  stub(3.6, 1.3, 0.35, 0.09, 0.3, BARK, false);
  stub(5.2, 4.0, 0.30, 0.08, 0.4, BARK2, false);
  stub(12.0, 5.6, 0.45, 0.07, 0.6, BARK, true);
  // moss skirt at the foot
  for (let i = 0; i < 5; i++) {
    const a = 0.4 + i * 1.3, r = 0.95 * kk(a, 0.18);
    const mo = add(new THREE.SphereGeometry(0.28 + hash(i, 12) * 0.15, 7, 4), i % 2 ? MOSS : MOSS2, Math.cos(a) * r * 0.85, 0.2 + hash(i, 13) * 0.3, Math.sin(a) * r * 0.85, 0, Math.PI / 2 - a, 0);
    mo.scale.set(1.0, 0.7, 0.45);
  }
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
