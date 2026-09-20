// standing_lightbox — WINNER (arm B): profiles. The frame is ONE rounded-rectangle ring (Shape with
// a hole) extruded 0.14 m, so the corners are genuinely round like the reference; the
// cream/red faces are quads recessed inside it on both sides; the pedestal is a lathe
// column with a collar; the base a rounded extruded plate; the cable a TubeGeometry.
// 0.6 × 1.5 m, front = +Z, base y = 0, userData.lights one warm entry each side.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2 });
  const RUST2 = mk(0x4f2d21, 'metal', { roughness: 0.95, metalness: 0.15 });
  const TIN = mk(0x6f6a62, 'metal', { roughness: 0.8 });
  const TIN2 = mk(0x5a554e, 'metal', { roughness: 0.85 });
  const BLACK = mk(0x110f12, 'metal', { roughness: 0.9 });
  const STAIN = mk(0x8b6141, 'plaster', { roughness: 0.95, metalness: 0 });
  const RUBBER = mk(0x110f12, 'fabric', { roughness: 0.9, metalness: 0.05 });   // cable sheath
  const CREAM = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xd8ae70), emissiveIntensity: 2.4, roughness: 0.35 });
  const RED = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xb8302a), emissiveIntensity: 2.0, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const rrect = (w, h, r) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2);
    s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r);
    s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  };

  const W = 0.6, H = 1.16, D = 0.14, Y0 = 0.34, yc = Y0 + H / 2;
  // the ring frame
  const ring = rrect(W, H, 0.05);
  ring.holes.push(rrect(W - 0.08, H - 0.08, 0.025));
  const frameGeo = new THREE.ExtrudeGeometry(ring, { depth: D, bevelEnabled: false, curveSegments: 4 });
  frameGeo.translate(0, 0, -D / 2);
  add(frameGeo, RUST, 0, yc, 0);
  // a thinner inner ring proud on each face in a second rust tone (the bezel lip), plus a core slab
  const lip = rrect(W - 0.06, H - 0.06, 0.03); lip.holes.push(rrect(W - 0.10, H - 0.10, 0.02));
  for (const sz of [-1, 1]) {
    const lg = new THREE.ExtrudeGeometry(lip, { depth: 0.012, bevelEnabled: false, curveSegments: 3 });
    add(lg, RUST2, 0, yc, sz * (D / 2) - (sz < 0 ? 0 : 0.012));
  }
  add(new THREE.BoxGeometry(W - 0.08, H - 0.08, 0.08), TIN2, 0, yc, 0);
  // faces both sides
  const iw = W - 0.10, ih = H - 0.10;
  for (const sz of [-1, 1]) {
    const z = sz * (D / 2 - 0.008), ry = sz < 0 ? Math.PI : 0;
    add(new THREE.PlaneGeometry(iw, 0.15), RED, 0, Y0 + H - 0.05 - 0.075, z, 0, ry, 0);
    add(new THREE.PlaneGeometry(iw, ih - 0.15), CREAM, 0, Y0 + 0.05 + (ih - 0.15) / 2, z, 0, ry, 0);
    add(new THREE.BoxGeometry(iw, 0.02, 0.012), TIN2, 0, Y0 + H - 0.05 - 0.15, z, 0, ry, 0);
    add(new THREE.PlaneGeometry(0.12, 0.07), STAIN, sz * 0.15, Y0 + 0.10, z + sz * 0.002, 0, ry, 0);   // grime (wear)
  }
  // side: a hinge strip and screws down one cheek
  add(new THREE.BoxGeometry(0.02, 0.8, 0.03), TIN, W / 2 + 0.005, yc, 0.03);
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.009, 0.009, 0.008, 6), RUST2, W / 2 + 0.018, yc - 0.3 + i * 0.2, 0.03, 0, 0, Math.PI / 2);
  // pedestal: a lathe column with a collar and a foot flare
  const prof = [new THREE.Vector2(0, 0), new THREE.Vector2(0.11, 0), new THREE.Vector2(0.11, 0.02), new THREE.Vector2(0.075, 0.03), new THREE.Vector2(0.07, 0.22),
    new THREE.Vector2(0.085, 0.24), new THREE.Vector2(0.085, 0.27), new THREE.Vector2(0.10, 0.28), new THREE.Vector2(0.10, 0.30), new THREE.Vector2(0, 0.30)];
  add(new THREE.LatheGeometry(prof, 12), TIN2, 0, 0.04, 0);
  // base plate, rounded, and the grounding band under it
  const plate = new THREE.ExtrudeGeometry(rrect(0.44, 0.30, 0.04), { depth: 0.014, bevelEnabled: false, curveSegments: 3 });
  add(plate, RUST2, 0, 0.04, 0, Math.PI / 2, 0, 0);
  add(new THREE.BoxGeometry(0.40, 0.026, 0.26), BLACK, 0, 0.013, 0);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 6), RUST, sx * 0.17, 0.046, sz * 0.10);
  // trailing cable and plug
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.06, 0.20, -0.05), new THREE.Vector3(-0.14, 0.12, -0.14), new THREE.Vector3(-0.10, 0.012, -0.26),
    new THREE.Vector3(0.04, 0.012, -0.29), new THREE.Vector3(0.14, 0.012, -0.32),
  ]);
  add(new THREE.TubeGeometry(curve, 16, 0.007, 5, false), RUBBER, 0, 0, 0);
  add(new THREE.BoxGeometry(0.05, 0.03, 0.035), RUBBER, 0.17, 0.015, -0.33);

  finish(THREE, g, [
    { x: 0, y: yc, z: 0.22, color: 0xd8ae70, intensity: 1.4, range: 3 },
    { x: 0, y: yc, z: -0.22, color: 0xd8ae70, intensity: 1.4, range: 3 },
  ]);
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
