// road_cones — arm C: a different reading of the reference.
// The reference cones are battered: dented shells, one split, the bar bent and
// its black tape peeling, and the toppled one has been run over so its shell is
// flattened. This arm builds the cones as open frustum shells (hollow at the
// top, visible from above), squashes the fallen one to an ellipse, bends the
// bar in two segments and leaves a torn tin fragment under the pile.
// Footprint 1.35 x 0.6, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => { const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 }); if (dbl) s.side = THREE.DoubleSide; s.name = name; return s; };
  const ORANGE = mat(0xd8542a, 'plaster', 0.8, 0, true);
  const ORANGE2 = mat(0xc04a22, 'plaster', 0.85, 0, true);
  const WHITE  = mat(0xd9d0bc, 'plaster', 0.75, 0, true);
  const BLACK  = mat(0x110f12, 'plaster', 0.9, 0, true);
  const YELLOW = mat(0xe5b055, 'metal', 0.7, 0.2);
  const STRIPE = mat(0x1a1616, 'metal', 0.7, 0.2);
  const GRIME  = mat(0x37201b, 'plaster', 0.95);
  const TIN    = mat(0x6c4028, 'metal', 0.85, 0.3, true);
  const H = 0.52, RB = 0.10, RT = 0.03;
  const rAt = (y) => RB + (RT - RB) * (y / H);
  const cone = (x, z, rotZ, rotY, dark, squash) => {
    const c = new THREE.Group();
    const m = dark ? ORANGE2 : ORANGE;
    // three stacked open frustums so the colour bands are real breaks in the shell
    const bands = [[0.04, 0.15, m], [0.15, 0.21, WHITE], [0.21, 0.30, m], [0.30, 0.37, WHITE], [0.37, H, m]];
    for (const [y0, y1, mm] of bands) {
      const s = new THREE.Mesh(new THREE.CylinderGeometry(rAt(y1), rAt(y0), y1 - y0, 12, 1, true), mm); s.position.y = (y0 + y1) / 2; c.add(s);
    }
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(RB + 0.015, RB + 0.03, 0.04, 12, 1, true), BLACK); foot.position.y = 0.02; c.add(foot);
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.02, 0.30), m); base.position.y = 0.01; c.add(base);
    const chip = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.02, 0.04), GRIME); chip.position.set(0.12, 0.012, 0.13); chip.rotation.y = 0.5; c.add(chip);
    const dent = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.06, 0.05), GRIME); dent.position.set(rAt(0.26) - 0.005, 0.26, 0); dent.rotation.z = 0.15; c.add(dent);
    c.position.set(x, 0, z); c.rotation.set(0, rotY, rotZ); if (squash) c.scale.set(1, 1, 0.7); g.add(c); return c;
  };
  cone(-0.5, -0.12, 0.04, 0.2, false);
  cone(0.5, -0.1, -0.03, -0.4, true);
  // the bar, bent: two cylinders meeting at a kink, tape stripes as short sleeves, one peeled
  const seg = (x0, y0, x1, y1) => { const len = Math.hypot(x1 - x0, y1 - y0); const b = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, len, 8), YELLOW); b.position.set((x0 + x1) / 2, (y0 + y1) / 2, -0.11); b.rotation.z = Math.atan2(y1 - y0, x1 - x0) - Math.PI / 2; g.add(b); return b; };
  seg(-0.58, 0.44, 0.05, 0.40); seg(0.05, 0.40, 0.58, 0.45);
  for (let i = 0; i < 6; i++) { const x = -0.48 + i * 0.19, y = x < 0.05 ? 0.44 - (x + 0.58) * 0.0635 : 0.40 + (x - 0.05) * 0.094; const s = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.09, 8), STRIPE); s.rotation.z = Math.PI / 2 + (x < 0.05 ? 0.063 : -0.094); s.position.set(x, y, -0.11); g.add(s); }
  const peel = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.003, 0.02), STRIPE); peel.position.set(0.28, 0.38, -0.09); peel.rotation.set(0.4, 0, 0.9); g.add(peel);
  for (const x of [-0.5, 0.5]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.008, 5, 10), BLACK); r.position.set(x, x < 0 ? 0.44 : 0.45, -0.11); r.rotation.x = Math.PI / 2; g.add(r); }
  // the run-over cone, on its side and squashed
  const t = cone(0, 0, -Math.PI / 2 + 0.06, 0, false, true);
  t.position.set(0.1, RB * 0.7 - 0.005, 0.22); t.rotation.y = 0.3;
  // torn tin fragment under it
  const tin = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.006, 0.26), TIN); tin.position.set(-0.05, 0.003, 0.2); tin.rotation.y = -0.2; g.add(tin);
  for (let i = 0; i < 6; i++) { const rib = new THREE.Mesh(new THREE.BoxGeometry(0.40, 0.006, 0.012), GRIME); rib.position.set(-0.05, 0.007, 0.09 + i * 0.045); rib.rotation.y = -0.2; g.add(rib); }

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
