// vending_machine — arm C: a different breakdown. Read as a steel cabinet
// with a separate hinged front door (proud 4 cm, hinge strip on the left, lock
// on the right) that carries the display window, the control column and the
// flap; a separate overhanging top cap with the tube in a hood; a wide lower
// ad board on the door; side cladding panels with peeled stickers; a recessed
// vent box in the blue skirt. 1.0 × 0.8 × 1.83 m, front = +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const WHITE = mk(0xd9d3c4, "metal", { roughness: 0.8 });
  const WHITE2 = mk(0xc9c2b1, "metal", { roughness: 0.85 });   // faded panel
  const BLUE = mk(0x35478a, "metal", { roughness: 0.85 });
  const BLUE2 = mk(0x2c3c74, "metal", { roughness: 0.9 });
  const RUST = mk(0x4f2d21, "metal", { roughness: 0.95, metalness: 0.15 });
  const RUST2 = mk(0x37201b, "metal", { roughness: 0.95, metalness: 0.15 });
  const STEEL = mk(0x8a8a86, "metal", { roughness: 0.65, metalness: 0.45 });
  const GUN = mk(0x3a3a3c, "metal", { roughness: 0.75, metalness: 0.35 });
  const BLACK = mk(0x110f12, "metal", { roughness: 0.9 });
  const PAPER = mk(0xeee2c8, "plaster", { roughness: 0.95, metalness: 0 });
  const PAPER2 = mk(0xbf7c42, "plaster", { roughness: 0.95, metalness: 0 });
  const PAPER3 = mk(0x8b6141, "plaster", { roughness: 0.95, metalness: 0 });
  const SHELF = mk(0xb9c4cc, "metal", { roughness: 0.6, metalness: 0.4 });
  const CAN = [0xb8302a, 0xe5b055, 0x40559f, 0xa7e761, 0xeee2c8, 0xc98a45].map((c) => mk(c, "metal", { roughness: 0.5, metalness: 0.5 }));
  const GLASS = new THREE.MeshStandardMaterial({ color: 0xa9c4d8, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.9, forceSinglePass: true });
  const COOL = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0x9accf2), emissiveIntensity: 2.2, roughness: 0.35 });
  const WARM = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xf1d899), emissiveIntensity: 2.6, roughness: 0.35 });
  const AMBER = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xe8852a), emissiveIntensity: 1.8, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const W = 1.0, D = 0.8, H = 1.83, ZF = D / 2;
  // ---- cabinet body (behind the door), skirt, rust band, plinth, feet ----------
  add(B(W, H - 0.60, D - 0.02), WHITE2, 0, 0.5 + (H - 0.60) / 2, -0.01);          // body 0.50..1.73
  add(B(W + 0.02, 0.10, D + 0.02), WHITE, 0, H - 0.05, 0);                         // top cap, overhanging
  add(B(W, 0.32, D), BLUE, 0, 0.34, 0);
  add(B(W, 0.09, D), RUST, 0, 0.135, 0);
  add(B(W - 0.06, 0.05, D - 0.06), BLACK, 0, 0.065, 0);                            // grounding band
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(B(0.06, 0.04, 0.06), GUN, sx * 0.4, 0.02, sz * 0.3);
  // side cladding panels: a lighter and a dirtier panel each side, stickers
  add(B(0.01, 1.05, 0.72), WHITE, W / 2 + 0.005, 1.1, -0.02);
  add(B(0.004, 0.5, 0.3), WHITE2, W / 2 + 0.012, 0.85, 0.15);
  add(B(0.01, 1.05, 0.72), WHITE, -W / 2 - 0.005, 1.1, -0.02);
  add(B(0.004, 0.24, 0.17), PAPER, W / 2 + 0.013, 1.4, 0.15, 0, 0, 0.05);
  add(B(0.004, 0.15, 0.11), PAPER2, W / 2 + 0.013, 1.12, -0.15, 0, 0, -0.07);
  add(B(0.004, 0.09, 0.22), PAPER3, W / 2 + 0.013, 0.66, 0.05);
  add(B(0.004, 0.2, 0.14), PAPER, -W / 2 - 0.013, 1.25, 0.0, 0, 0, 0.08);
  add(B(0.004, 0.1, 0.1), PAPER3, -W / 2 - 0.013, 0.9, -0.2);
  // rust runs: cap edge, door edge, skirt seam
  add(B(0.3, 0.03, 0.004), RUST2, -0.2, H - 0.10, ZF + 0.012);
  add(B(0.004, 0.45, 0.03), RUST, W / 2 + 0.011, 0.75, 0.3);
  add(B(0.7, 0.025, 0.004), RUST2, 0, 0.51, ZF + 0.002);

  // ---- the door: a 4 cm proud panel, hinge strip left, lock right -------------
  const DW = W - 0.06, DH = 1.18, DY = 0.52 + DH / 2;
  add(B(DW, DH, 0.04), WHITE, 0, DY, ZF + 0.0);
  add(B(0.02, DH, 0.05), STEEL, -DW / 2 + 0.01, DY, ZF + 0.005);                  // hinge strip
  for (const y of [0.7, 1.1, 1.5]) add(new THREE.CylinderGeometry(0.015, 0.015, 0.1, 6), GUN, -DW / 2 - 0.01, y, ZF + 0.012);
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8), STEEL, DW / 2 - 0.05, 0.62, ZF + 0.03, Math.PI / 2, 0, 0);  // lock
  // ---- top hood and tube ------------------------------------------------------
  add(B(0.9, 0.08, 0.10), STEEL, 0, H - 0.14, ZF - 0.03);
  add(B(0.9, 0.03, 0.12), GUN, 0, H - 0.09, ZF + 0.02);                            // hood lip
  add(new THREE.CylinderGeometry(0.028, 0.028, 0.82, 8), WARM, 0, H - 0.135, ZF + 0.025, 0, 0, Math.PI / 2);
  for (const sx of [-1, 1]) add(new THREE.CylinderGeometry(0.036, 0.036, 0.05, 8), GUN, sx * 0.43, H - 0.135, ZF + 0.025, 0, 0, Math.PI / 2);

  // ---- display window in the door: metal frame, glass, cool backing, cans ------
  const zd = ZF + 0.02;                                     // door face
  const dx0 = -0.43, dx1 = 0.15, dy0 = 0.98, dy1 = 1.64, dd = 0.16;
  const dw = dx1 - dx0, dh = dy1 - dy0, dcx = (dx0 + dx1) / 2, dcy = (dy0 + dy1) / 2;
  add(B(dw, dh, 0.01), COOL, dcx, dcy, zd - dd);
  add(B(dw, 0.02, dd), BLACK, dcx, dy1 - 0.01, zd - dd / 2);
  add(B(dw, 0.02, dd), BLACK, dcx, dy0 + 0.01, zd - dd / 2);
  add(B(0.02, dh, dd), BLACK, dx0 + 0.01, dcy, zd - dd / 2);
  add(B(0.02, dh, dd), BLACK, dx1 - 0.01, dcy, zd - dd / 2);
  add(B(dw + 0.07, 0.035, 0.015), STEEL, dcx, dy1 + 0.018, zd + 0.005);
  add(B(dw + 0.07, 0.035, 0.015), STEEL, dcx, dy0 - 0.018, zd + 0.005);
  for (const x of [dx0 - 0.018, dx1 + 0.018]) add(B(0.035, dh + 0.07, 0.015), STEEL, x, dcy, zd + 0.005);
  add(B(dw, dh, 0.006), GLASS, dcx, dcy, zd - 0.006);
  [dy0 + 0.04, dy0 + 0.25, dy0 + 0.46].forEach((ry, r) => {
    add(B(dw - 0.04, 0.012, dd - 0.04), SHELF, dcx, ry, zd - dd / 2 - 0.01);
    const n = 6;
    for (let i = 0; i < n; i++) {
      const x = dx0 + 0.06 + i * ((dw - 0.12) / (n - 1));
      add(new THREE.CylinderGeometry(0.031, 0.031, 0.12, 7), CAN[(i + r * 3) % CAN.length], x, ry + 0.066, zd - dd / 2 - 0.02);
      add(B(0.05, 0.02, 0.006), PAPER, x, ry - 0.018, zd - 0.02);                 // price tag row
    }
  });
  // ---- control column on the door ---------------------------------------------
  add(B(0.22, 0.66, 0.02), GUN, 0.34, 1.31, zd + 0.005);
  add(B(0.08, 0.10, 0.02), STEEL, 0.34, 1.54, zd + 0.02);
  add(B(0.045, 0.008, 0.01), BLACK, 0.34, 1.55, zd + 0.032);
  add(B(0.10, 0.05, 0.015), AMBER, 0.34, 1.42, zd + 0.02);                          // lit price window
  for (let i = 0; i < 3; i++) add(new THREE.CylinderGeometry(0.014, 0.014, 0.015, 8), STEEL, 0.30 + i * 0.04, 1.32, zd + 0.02, Math.PI / 2, 0, 0);
  add(B(0.06, 0.04, 0.02), STEEL, 0.34, 1.20, zd + 0.02);
  add(B(0.10, 0.10, 0.02), GUN, 0.34, 1.02, zd + 0.02);
  add(B(0.06, 0.05, 0.02), BLACK, 0.34, 1.01, zd + 0.03);
  // ---- ad board, flap, dark slot ----------------------------------------------
  add(B(0.56, 0.20, 0.008), PAPER, -0.14, 0.84, zd + 0.004);
  add(B(0.20, 0.06, 0.009), PAPER2, -0.30, 0.88, zd + 0.005);
  add(B(0.10, 0.10, 0.009), PAPER3, 0.05, 0.80, zd + 0.005);
  add(B(0.64, 0.12, 0.045), STEEL, -0.12, 0.65, zd + 0.02, 0.3, 0, 0);
  add(B(0.68, 0.025, 0.06), GUN, -0.12, 0.72, zd + 0.02);
  add(B(0.60, 0.05, 0.02), BLACK, -0.12, 0.585, zd + 0.006);
  // ---- vent box in the skirt ---------------------------------------------------
  add(B(0.40, 0.12, 0.02), BLACK, 0.0, 0.30, ZF + 0.0);
  for (let i = 0; i < 6; i++) add(B(0.40, 0.008, 0.014), BLUE2, 0.0, 0.25 + i * 0.02, ZF + 0.006);
  // ---- back: service hatch and cable ------------------------------------------
  add(B(0.55, 0.8, 0.012), WHITE2, 0, 0.95, -ZF - 0.006);
  add(B(0.2, 0.2, 0.02), GUN, 0.25, 0.42, -ZF - 0.01);
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), BLACK, -0.3, 0.3, -ZF - 0.012);

  const LIGHTS = [
    { x: dcx, y: dcy, z: zd + 0.35, color: 0x9accf2, intensity: 1.0, range: 3.0 },
    { x: 0, y: H - 0.10, z: ZF + 0.18, color: 0xf1d899, intensity: 1.2, range: 3.0 },
  ];
  // ---- the six lines ----------------------------------------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = LIGHTS.map((l) => ({ ...l, x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
  g.userData.obstacle = { kind: "block", lanes: 1 };
  return g;
}
