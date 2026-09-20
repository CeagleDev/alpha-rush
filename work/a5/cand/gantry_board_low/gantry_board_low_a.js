/**
 * gantry_board_low — arm A: primitives. A 2.6 m wide portal frame of two clad steel columns
 * (box posts wrapped in corrugated-tin panels as stacked thin boxes, with rust runs), a top beam of
 * two pipes, a plain green sign board (0x2f6b3a, white border frame of thin boxes, NO text) hung
 * from the beam with its bottom edge at 1.3 m, small orange dome lamps on the corners (emissive
 * + userData.lights), and a base sill of pipes and a dark grounding band. Depth 0.6 m along Z.
 * Faces +Z. userData.obstacle = {kind:'roll', lanes:1}.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.85, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (name) m.name = name;
    return m;
  };
  const steel = M(0x7a766e, 'metal', 0.6, 0.3);
  const steelDark = M(0x4a4744, 'metal', 0.7, 0.3);
  const tin = M(0x8b6141, 'metal', 0.85, 0.3);
  const tinShade = M(0x6c4028, 'metal', 0.9, 0.3);
  const rust = M(0x37201b, 'metal', 0.95, 0.3);
  const green = M(0x2f6b3a, 'metal', 0.8, 0.2);
  const greenFade = M(0x3f7a48, 'metal', 0.85, 0.2);
  const white = M(0xd9d4c4, 'metal', 0.8, 0.2);
  const housing = M(0xb85a2a, 'metal', 0.7, 0.3);
  const dark = M(0x110f12, undefined, 0.6);
  const lampMat = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xe5b055, emissiveIntensity: 2.2, roughness: 0.35 });

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const B = (w, h, d, x, y, z, mat, parent = g) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);
  const CYL = (r, h, x, y, z, mat, axis = 'y', seg = 10) => { const m = MESH(new THREE.CylinderGeometry(r, r, h, seg), mat, g, x, y, z); if (axis === 'x') m.rotation.z = Math.PI / 2; if (axis === 'z') m.rotation.x = Math.PI / 2; return m; };

  const W = 2.60, H = 2.30, D = 0.56, colW = 0.24;
  // ---- columns at x = ±1.18: post + cladding panels + rust ----------------------
  for (const s of [-1, 1]) {
    const x = s * (W / 2 - colW / 2);
    B(colW, 0.06, D, x, 0.03, 0, dark);                                           // grounding band
    B(colW - 0.04, H - 0.06, D - 0.10, x, H / 2 + 0.03, 0, steelDark);            // core post
    // cladding: overlapping tin sheets, front and back, and the outer face; alternating shades = corrugation
    for (let i = 0; i < 4; i++) {
      const y = 0.35 + i * 0.5, mat = i % 2 ? tinShade : tin;
      B(colW, 0.52, 0.02, x, y, D / 2 - 0.01, mat); B(colW, 0.52, 0.02, x, y, -D / 2 + 0.01, mat);
      B(0.02, 0.52, D, x + s * (colW / 2 - 0.01), y, 0, i % 2 ? tin : tinShade);
    }
    for (let k = 0; k < 5; k++) B(0.03, H - 0.4, 0.008, x - colW / 2 + 0.03 + k * 0.045, H / 2, D / 2 + 0.008, k % 2 ? tinShade : tin);   // corrugation ribs, front
    B(0.06, 0.9, 0.006, x + s * 0.05, 1.4, D / 2 + 0.014, rust);                    // rust run down the front
    B(colW + 0.02, 0.08, D + 0.02, x, H - 0.04, 0, rust);                          // rusted cap
    B(colW + 0.04, 0.05, D + 0.04, x, 0.085, 0, steelDark);                        // base plate
    CYL(0.03, D, x, 0.12, 0, steel, 'z');                                          // base pipe stub
  }
  // ---- top beam: two pipes with collars, a tie bar ----------------------------------
  for (const z of [-0.18, 0.18]) { CYL(0.035, W - 0.10, 0, H - 0.05, z, steel, 'x', 12); for (const x of [-0.6, 0.6]) CYL(0.045, 0.06, x, H - 0.05, z, rust, 'x', 12); }
  B(W - 0.10, 0.05, 0.06, 0, H - 0.05, 0, steelDark);
  for (const s of [-1, 1]) { const b = B(0.03, 0.03, 0.40, s * 0.9, H - 0.02, 0, steel); b.rotation.x = 0; b.rotation.y = s * 0.6; }   // diagonal ties
  // ---- sign board: 1.9 wide, 0.8 tall, bottom edge at 1.30 ----------------------------
  const bw = 1.90, bh = 0.80, by = 1.30 + bh / 2;
  B(bw, bh, 0.04, 0, by, 0, green);
  B(bw + 0.03, 0.04, 0.05, 0, by + bh / 2, 0, white); B(bw + 0.03, 0.04, 0.05, 0, by - bh / 2, 0, white);   // white border
  B(0.04, bh + 0.03, 0.05, -bw / 2, by, 0, white); B(0.04, bh + 0.03, 0.05, bw / 2, by, 0, white);
  B(0.60, 0.30, 0.006, -0.30, by + 0.10, 0.023, greenFade);                                                  // faded panel (wear)
  B(0.25, 0.12, 0.006, 0.55, by - 0.25, 0.023, rust);                                                        // rust stain low right
  B(bw, 0.03, 0.006, 0, by - bh / 2 + 0.05, -0.023, rust);                                                   // rust along the back bottom
  for (const x of [-0.7, 0.7]) { CYL(0.012, H - 0.05 - (by + bh / 2), x, (H - 0.05 + by + bh / 2) / 2, 0, steel, 'y', 6); B(0.06, 0.04, 0.06, x, by + bh / 2 + 0.02, 0, steelDark); }   // hangers
  for (const x of [-0.85, 0.85]) B(0.02, 0.06, 0.03, x, by, 0.03, steelDark);                                  // corner bolts
  // ---- corner lamps: orange housings with amber lenses --------------------------------
  g.userData.lights = [];
  for (const s of [-1, 1]) {
    const x = s * (W / 2 - 0.10), y = H + 0.02;
    B(0.05, 0.10, 0.05, x, H - 0.05, D / 2 - 0.05, steelDark);                                                 // bracket
    const shade = MESH(new THREE.SphereGeometry(0.11, 12, 8, 0, Math.PI * 2, 0, Math.PI * 0.55), housing, g, x, y, D / 2 - 0.05); shade.rotation.x = -0.5;
    const lens = MESH(new THREE.SphereGeometry(0.075, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2), lampMat, g, x, y - 0.02, D / 2 - 0.02); lens.rotation.x = Math.PI / 2 + 0.5;
    g.userData.lights.push({ x, y: y - 0.06, z: D / 2 + 0.05, color: 0xe5b055, intensity: 1.0, range: 3.0 });
  }
  // ---- base sill between the columns (pipes lying on a plate) ------------------------
  B(W - 2 * colW, 0.03, D - 0.1, 0, 0.015, 0, dark);
  for (const z of [-0.14, 0.0, 0.14]) CYL(0.03, W - 2 * colW, 0, 0.06, z, z === 0 ? rust : steel, 'x', 10);

  g.userData.obstacle = { kind: 'roll', lanes: 1 };

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights.forEach((l) => { l.x -= c.x; l.y -= box.min.y; l.z -= c.z; });
  return g;
}
