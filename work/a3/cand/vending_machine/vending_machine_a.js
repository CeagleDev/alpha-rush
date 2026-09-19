// vending_machine — arm A: primitives. A 1.0 × 0.8 × 1.83 m Japanese can
// machine: white enamel cabinet on a blue skirt over a rust band and a black
// plinth on four feet, warm fluorescent strip along the top front, a cool-lit
// display recess behind glass with three shelves of cans, coin panel and
// button column on the right, a proud dispensing flap, vent grille in the
// skirt, stickers and rust runs on the sides. Front = +Z, base y = 0.
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
  // ---- cabinet masses -------------------------------------------------------
  add(B(W, H - 0.55, D), WHITE, 0, 0.5 + (H - 0.55) / 2, 0);            // white upper cabinet (0.50..1.78)
  add(B(W, 0.05, D), WHITE2, 0, H - 0.025, 0);                        // top cap, faded
  add(B(W, 0.32, D), BLUE, 0, 0.34, 0);                               // blue skirt (0.18..0.50)
  add(B(W, 0.09, D), RUST, 0, 0.135, 0);                              // rust band (0.09..0.18)
  add(B(W - 0.04, 0.05, D - 0.04), BLACK, 0, 0.065, 0);               // grounding band (0.04..0.09)
  for (const sx of [-1, 1]) for (const sz of [-1, 1])
    add(new THREE.CylinderGeometry(0.03, 0.035, 0.04, 8), GUN, sx * 0.42, 0.02, sz * 0.32);   // feet
  // right-hand side: faded panel + stickers (colour variation, 1.5 mm proud)
  add(B(0.004, 1.0, 0.6), WHITE2, W / 2 + 0.002, 1.1, 0.05);
  add(B(0.004, 0.22, 0.16), PAPER, W / 2 + 0.005, 1.35, 0.2, 0, 0, 0.05);
  add(B(0.004, 0.14, 0.12), PAPER2, W / 2 + 0.005, 0.95, -0.12, 0, 0, -0.08);
  add(B(0.004, 0.10, 0.20), PAPER3, W / 2 + 0.005, 0.72, 0.18);
  add(B(0.004, 0.18, 0.13), PAPER, -W / 2 - 0.005, 1.2, -0.05, 0, 0, 0.06);
  add(B(0.004, 0.12, 0.10), PAPER2, -W / 2 - 0.005, 0.8, 0.22);
  // rust runs down the front corners and the back top edge
  add(B(0.03, 0.55, 0.004), RUST2, W / 2 - 0.02, 0.95, ZF + 0.002);
  add(B(0.025, 0.30, 0.004), RUST, -W / 2 + 0.03, 1.35, ZF + 0.002);
  add(B(0.6, 0.03, 0.004), RUST2, 0.1, 0.52, ZF + 0.002);
  add(B(0.004, 0.4, 0.03), RUST, W / 2 + 0.002, 0.7, -D / 2 + 0.03);
  add(B(0.8, 0.03, 0.004), RUST, 0, H - 0.03, -ZF - 0.002);

  // ---- top strip light --------------------------------------------------------
  add(B(0.86, 0.06, 0.05), STEEL, 0, H - 0.09, ZF - 0.02);            // housing
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8), WARM, 0, H - 0.09, ZF + 0.01, 0, 0, Math.PI / 2);
  for (const sx of [-1, 1]) add(new THREE.CylinderGeometry(0.038, 0.038, 0.06, 8), GUN, sx * 0.42, H - 0.09, ZF + 0.01, 0, 0, Math.PI / 2);

  // ---- display recess: glass, backing, shelves, cans -------------------------
  const dx0 = -0.42, dx1 = 0.17, dy0 = 0.95, dy1 = 1.62, dd = 0.14;
  const dw = dx1 - dx0, dh = dy1 - dy0, dcx = (dx0 + dx1) / 2, dcy = (dy0 + dy1) / 2;
  add(B(dw, dh, 0.01), COOL, dcx, dcy, ZF - dd);                                    // lit backing
  add(B(dw, 0.02, dd), BLACK, dcx, dy1 - 0.01, ZF - dd / 2);                         // recess top
  add(B(dw, 0.02, dd), BLACK, dcx, dy0 + 0.01, ZF - dd / 2);                         // recess bottom
  add(B(0.02, dh, dd), BLACK, dx0 + 0.01, dcy, ZF - dd / 2);
  add(B(0.02, dh, dd), BLACK, dx1 - 0.01, dcy, ZF - dd / 2);
  add(B(dw + 0.06, 0.03, 0.02), STEEL, dcx, dy1 + 0.015, ZF + 0.005);                // window frame lips
  add(B(dw + 0.06, 0.03, 0.02), STEEL, dcx, dy0 - 0.015, ZF + 0.005);
  for (const x of [dx0 - 0.015, dx1 + 0.015]) add(B(0.03, dh + 0.06, 0.02), STEEL, x, dcy, ZF + 0.005);
  add(B(dw, dh, 0.006), GLASS, dcx, dcy, ZF - 0.008);                                // glass
  const rows = [dy0 + 0.05, dy0 + 0.27, dy0 + 0.49];
  rows.forEach((ry, r) => {
    add(B(dw - 0.04, 0.015, dd - 0.03), SHELF, dcx, ry, ZF - dd / 2 - 0.01);
    add(B(dw - 0.04, 0.025, 0.006), SHELF, dcx, ry + 0.012, ZF - 0.03);                // price rail
    const n = 7;
    for (let i = 0; i < n; i++) {
      const x = dx0 + 0.05 + i * ((dw - 0.1) / (n - 1));
      add(new THREE.CylinderGeometry(0.03, 0.03, 0.115, 7), CAN[(i + r * 2) % CAN.length], x, ry + 0.065, ZF - dd / 2 - 0.02);
    }
  });

  // ---- coin panel and button column on the right -----------------------------
  add(B(0.24, 0.62, 0.012), WHITE2, 0.33, 1.28, ZF + 0.004);                          // recessed panel
  add(B(0.10, 0.09, 0.02), GUN, 0.33, 1.52, ZF + 0.012);                              // coin slot bezel
  add(B(0.05, 0.008, 0.01), BLACK, 0.33, 1.52, ZF + 0.024);                            // slot
  for (let i = 0; i < 4; i++) add(B(0.05, 0.03, 0.012), i === 1 ? AMBER : GUN, 0.33, 1.40 - i * 0.06, ZF + 0.012);
  add(new THREE.CylinderGeometry(0.02, 0.02, 0.03, 8), STEEL, 0.33, 1.08, ZF + 0.02, Math.PI / 2, 0, 0);  // return lever
  add(B(0.06, 0.02, 0.02), STEEL, 0.36, 1.08, ZF + 0.03);
  // ---- lower front: coin return, ad panel, dispensing flap --------------------
  add(B(0.10, 0.10, 0.02), GUN, 0.33, 0.86, ZF + 0.01);
  add(B(0.06, 0.05, 0.02), BLACK, 0.33, 0.85, ZF + 0.02);
  add(B(0.40, 0.18, 0.006), PAPER, -0.2, 0.80, ZF + 0.003);                           // faded ad panel
  add(B(0.14, 0.05, 0.007), PAPER2, -0.24, 0.84, ZF + 0.004);
  add(B(0.62, 0.14, 0.04), STEEL, -0.12, 0.61, ZF + 0.02, 0.35, 0, 0);                // flap, top pushed out
  add(B(0.66, 0.02, 0.05), GUN, -0.12, 0.69, ZF + 0.01);                              // flap hood
  add(B(0.58, 0.05, 0.02), BLACK, -0.12, 0.55, ZF + 0.004);                            // dark slot below
  // ---- vent grille in the skirt -----------------------------------------------
  add(B(0.36, 0.10, 0.01), BLACK, 0.0, 0.30, ZF + 0.002);
  for (let i = 0; i < 5; i++) add(B(0.36, 0.008, 0.012), BLUE2, 0.0, 0.26 + i * 0.02, ZF + 0.004);
  add(B(0.12, 0.05, 0.008), PAPER3, 0.36, 0.42, ZF + 0.004);                          // small plate
  // ---- back: service panel and a cable ---------------------------------------
  add(B(0.6, 0.9, 0.01), WHITE2, 0, 0.9, -ZF - 0.005);
  add(B(0.2, 0.2, 0.02), GUN, 0.25, 0.4, -ZF - 0.01);
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), BLACK, -0.3, 0.3, -ZF - 0.012);

  const LIGHTS = [
    { x: dcx, y: dcy, z: ZF + 0.35, color: 0x9accf2, intensity: 1.0, range: 3.0 },
    { x: 0, y: H - 0.06, z: ZF + 0.15, color: 0xf1d899, intensity: 1.2, range: 3.0 },
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
