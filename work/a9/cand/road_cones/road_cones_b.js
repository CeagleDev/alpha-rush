// road_cones — arm B: built from profiles.
// Each cone is ONE LatheGeometry profile: a moulded base lip, a hollow shell
// with a rolled top, and the white bands are lathe rings of the same profile
// slightly proud. The bar is an extruded hexagonal section with the stripes
// as extruded sleeves. Two standing, one toppled. Footprint 1.3 x 0.6, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => { const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 }); if (dbl) s.side = THREE.DoubleSide; s.name = name; return s; };
  const ORANGE = mat(0xd8542a, 'plaster', 0.8, 0, true);
  const ORANGE2 = mat(0xb9461f, 'plaster', 0.85, 0, true);
  const WHITE  = mat(0xd9d0bc, 'plaster', 0.75, 0, true);
  const BLACK  = mat(0x110f12, 'plaster', 0.9, 0, true);
  const YELLOW = mat(0xe5b055, 'metal', 0.7, 0.2);
  const STRIPE = mat(0x1a1616, 'metal', 0.7, 0.2);
  const GRIME  = mat(0x37201b, 'plaster', 0.95);
  const V2 = (x, y) => new THREE.Vector2(x, y);
  const H = 0.52, RB = 0.10, RT = 0.028;
  const rAt = (y) => RB + (RT - RB) * ((y - 0.04) / (H - 0.04));
  // base plate as a square shape extruded, then the shell as a lathe
  const cone = (x, z, rotZ, rotY, dark) => {
    const c = new THREE.Group();
    const sq = new THREE.Shape(); sq.moveTo(-0.15, -0.15); sq.lineTo(0.15, -0.15); sq.lineTo(0.15, 0.15); sq.lineTo(-0.15, 0.15); sq.closePath();
    const plate = new THREE.ExtrudeGeometry(sq, { depth: 0.025, bevelEnabled: false }); plate.rotateX(-Math.PI / 2);
    c.add(new THREE.Mesh(plate, dark ? ORANGE2 : ORANGE));
    const prof = [V2(RB + 0.03, 0.025), V2(RB + 0.03, 0.04), V2(RB + 0.005, 0.045), V2(RB, 0.05)];
    for (let i = 1; i <= 6; i++) { const y = 0.05 + (i / 6) * (H - 0.07); prof.push(V2(rAt(y), y)); }
    prof.push(V2(RT + 0.006, H - 0.01), V2(RT + 0.006, H), V2(RT - 0.006, H), V2(RT - 0.01, H - 0.02));
    c.add(new THREE.Mesh(new THREE.LatheGeometry(prof, 14), dark ? ORANGE2 : ORANGE));
    for (const [y0, y1] of [[0.30, 0.37], [0.15, 0.20]]) {
      c.add(new THREE.Mesh(new THREE.LatheGeometry([V2(rAt(y0) + 0.004, y0), V2(rAt((y0 + y1) / 2) + 0.005, (y0 + y1) / 2), V2(rAt(y1) + 0.004, y1)], 14), WHITE));
    }
    const grime = new THREE.Mesh(new THREE.LatheGeometry([V2(RB + 0.035, 0.0), V2(RB + 0.035, 0.03), V2(RB + 0.005, 0.03)], 14), GRIME); c.add(grime);
    c.position.set(x, 0, z); c.rotation.set(0, rotY, rotZ); g.add(c); return c;
  };
  cone(-0.5, -0.12, 0, 0.2, false);
  cone(0.5, -0.1, 0, -0.4, true);
  // hexagonal bar swept along X with striped sleeves
  const hex = new THREE.Shape(); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; i ? hex.lineTo(Math.cos(a) * 0.02, Math.sin(a) * 0.02) : hex.moveTo(Math.cos(a) * 0.02, Math.sin(a) * 0.02); } hex.closePath();
  const barGeo = new THREE.ExtrudeGeometry(hex, { depth: 1.16, bevelEnabled: false }); barGeo.rotateY(Math.PI / 2); barGeo.translate(-0.58, 0, 0);
  const bar = new THREE.Mesh(barGeo, YELLOW); bar.position.set(0, 0.44, -0.11); g.add(bar);
  const hex2 = new THREE.Shape(); for (let i = 0; i < 6; i++) { const a = (i / 6) * Math.PI * 2; i ? hex2.lineTo(Math.cos(a) * 0.022, Math.sin(a) * 0.022) : hex2.moveTo(Math.cos(a) * 0.022, Math.sin(a) * 0.022); } hex2.closePath();
  for (let i = 0; i < 6; i++) { const sg = new THREE.ExtrudeGeometry(hex2, { depth: 0.09, bevelEnabled: false }); sg.rotateY(Math.PI / 2); const s = new THREE.Mesh(sg, STRIPE); s.position.set(-0.525 + i * 0.19, 0.44, -0.11); g.add(s); }
  for (const x of [-0.5, 0.5]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.008, 5, 10), BLACK); r.position.set(x, 0.44, -0.11); r.rotation.x = Math.PI / 2; g.add(r); }
  const t = cone(0, 0, -Math.PI / 2 + 0.08, 0, false);
  t.position.set(0.12, RB + 0.02, 0.22); t.rotation.y = 0.25;

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
