// kei_van — arm A: primitives. A boxy cab-over kei delivery van, 3.4 × 1.5 ×
// 1.9 m, built as stacked masses: sills between open wheel wells, a belt-line
// body, an upper body with a raked windscreen box and flat side glass, a roof
// slab and a tube roof rack. Flat nose with two round headlights, amber
// indicators, slatted grille and a dented steel bumper; sliding-door seam and
// runner on the left side; rear double doors with red tail-lights. Faded
// white with rust panels. No maker's badge: the nose panel is blank.
// Front = +Z, base y = 0 (tyre contact), block obstacle.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const BODY = mk(0xd9d3c4, "metal", { roughness: 0.75 });       // faded white
  const BODY2 = mk(0xc9c2b1, "metal", { roughness: 0.85 });      // dirtier panel
  const BODY3 = mk(0xe6ddd0, "metal", { roughness: 0.7 });       // roof, less weathered
  const RUST = mk(0x4f2d21, "metal", { roughness: 0.95, metalness: 0.15 });
  const RUST2 = mk(0x37201b, "metal", { roughness: 0.95, metalness: 0.15 });
  const RUSTL = mk(0x8b6141, "metal", { roughness: 0.92, metalness: 0.1 });
  const STEEL = mk(0x8a8a86, "metal", { roughness: 0.6, metalness: 0.5 });
  const CHROME = mk(0xb9c4cc, "metal", { roughness: 0.4, metalness: 0.7 });
  const GUN = mk(0x3a3a3c, "metal", { roughness: 0.75, metalness: 0.35 });
  const BLACK = mk(0x110f12, "metal", { roughness: 0.9, metalness: 0.1 });
  const RUB = mk(0x1b1c1e, "metal", { roughness: 0.95, metalness: 0 });
  const GLASS = new THREE.MeshStandardMaterial({ color: 0x2f3a48, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.9, forceSinglePass: true });
  const HEAD = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xe5b055), emissiveIntensity: 2.4, roughness: 0.35 });
  const TAIL = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xb8302a), emissiveIntensity: 1.8, roughness: 0.35 });
  const AMBER = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xbf7c42), emissiveIntensity: 2.0, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const CYL = (r1, r2, h, s) => new THREE.CylinderGeometry(r1, r2, h, s);

  const L = 3.4, W = 1.5, R = 0.27, AXF = 1.05, AXR = -0.95, TX = 0.62;
  // ---- underbody: sills between and outside the wheel wells, black foot band --
  add(B(1.2, 0.30, 3.0), GUN, 0, 0.40, -0.05);                                  // chassis pan
  for (const sx of [-1, 1]) {
    add(B(0.15, 0.30, 1.30), BODY2, sx * (W / 2 - 0.075), 0.45, 0.05);        // mid sill
    add(B(0.15, 0.30, 0.25), BODY2, sx * (W / 2 - 0.075), 0.45, 1.525);       // front of the front wheel
    add(B(0.15, 0.30, 0.30), BODY2, sx * (W / 2 - 0.075), 0.45, -1.50);       // behind the rear wheel
    add(B(0.152, 0.05, 1.30), BLACK, sx * (W / 2 - 0.075), 0.325, 0.05);      // grounding band
    add(B(0.152, 0.05, 0.25), BLACK, sx * (W / 2 - 0.075), 0.325, 1.525);
    add(B(0.152, 0.05, 0.30), BLACK, sx * (W / 2 - 0.075), 0.325, -1.50);
    add(B(0.02, 0.4, 0.62), BLACK, sx * 0.55, 0.45, AXF);                     // arch liners
    add(B(0.02, 0.4, 0.62), BLACK, sx * 0.55, 0.45, AXR);
    add(B(0.16, 0.06, 0.62), BLACK, sx * (W / 2 - 0.08), 0.62, AXF);           // arch tops
    add(B(0.16, 0.06, 0.62), BLACK, sx * (W / 2 - 0.08), 0.62, AXR);
  }
  // ---- belt-line body and upper body ------------------------------------------
  add(B(W, 0.32, 3.3), BODY, 0, 0.76, 0);                                       // 0.60..0.92
  add(B(W - 0.02, 0.78, 3.1), BODY, 0, 1.31, -0.10);                            // 0.92..1.70, back to -1.65
  add(B(W - 0.06, 0.06, 3.14), BODY3, 0, 1.73, -0.10);                          // roof slab 1.70..1.76
  add(B(W - 0.16, 0.02, 3.0), BODY3, 0, 1.77, -0.10);                           // roof crown
  // nose: flat, blank panel below the windscreen; windscreen box leans back
  add(B(W - 0.02, 0.30, 0.10), BODY, 0, 1.07, 1.50);                            // scuttle
  add(B(1.30, 0.62, 0.03), GLASS, 0, 1.40, 1.485, -0.16, 0, 0);                 // windscreen (top leans back)
  add(B(W - 0.02, 0.10, 0.08), BODY, 0, 1.66, 1.42);                            // header over the screen
  for (const sx of [-1, 1]) add(B(0.06, 0.62, 0.05), BODY, sx * 0.68, 1.36, 1.44, -0.16, 0, 0);   // A pillars
  add(B(0.5, 0.02, 0.012), GUN, -0.25, 1.12, 1.55, -0.3, 0, 0.35);            // wipers
  add(B(0.5, 0.02, 0.012), GUN, 0.35, 1.12, 1.55, -0.3, 0, 0.35);
  // ---- front face: headlights, indicators, grille, bumper ----------------------
  for (const sx of [-1, 1]) {
    add(new THREE.TorusGeometry(0.095, 0.018, 6, 14), CHROME, sx * 0.5, 0.92, 1.655, 0, 0, 0);
    add(CYL(0.085, 0.085, 0.03, 14), HEAD, sx * 0.5, 0.92, 1.655, Math.PI / 2, 0, 0);
    add(B(0.14, 0.07, 0.03), AMBER, sx * 0.55, 0.60, 1.66);                   // indicators
    add(B(0.16, 0.09, 0.02), GUN, sx * 0.55, 0.60, 1.655);
  }
  add(B(0.6, 0.12, 0.03), GUN, 0, 0.66, 1.655);                                  // grille housing
  for (let i = 0; i < 4; i++) add(B(0.56, 0.012, 0.02), CHROME, 0, 0.62 + i * 0.026, 1.665);
  add(B(W, 0.14, 0.09), STEEL, 0, 0.48, 1.655);                                  // front bumper
  add(B(0.32, 0.10, 0.03), GUN, -0.42, 0.47, 1.68);                              // the dent: caved corner
  add(B(0.10, 0.14, 0.05), RUST2, 0.55, 0.48, 1.69);                             // rust at the bumper end
  add(B(0.36, 0.14, 0.012), BODY2, 0, 0.66, 1.71);                               // blank number plate pad
  add(B(0.26, 0.14, 0.03), RUST, 0.30, 0.85, 1.656);                             // rust patch on the nose
  // ---- sides: glass, door seams, sliding-door runner, mirrors, rust ------------
  for (const sx of [-1, 1]) {
    const xo = sx * (W / 2 - 0.01);
    add(B(0.02, 0.50, 0.75), GLASS, xo + sx * 0.005, 1.35, 1.03);               // front door window
    add(B(0.02, 0.48, 0.70), GLASS, xo + sx * 0.005, 1.33, 0.20);               // sliding-door window
    add(B(0.02, 0.48, 1.0), GLASS, xo + sx * 0.005, 1.33, -0.90);               // rear quarter window
    add(B(0.03, 0.05, 0.75), BODY2, xo + sx * 0.01, 1.08, 1.03);                // belt trims
    add(B(0.03, 0.05, 0.70), BODY2, xo + sx * 0.01, 1.08, 0.20);
    // door seams: thin dark lines proud 3 mm
    add(B(0.006, 1.0, 0.012), BLACK, xo + sx * 0.01, 0.95, 1.42);
    add(B(0.006, 1.0, 0.012), BLACK, xo + sx * 0.01, 0.95, 0.60);
    add(B(0.006, 1.0, 0.012), BLACK, xo + sx * 0.01, 0.95, -0.20);
    add(B(0.006, 0.012, 0.8), BLACK, xo + sx * 0.01, 0.47, 1.0);
    // sliding door runner along the body behind the door
    add(B(0.03, 0.04, 1.0), GUN, xo + sx * 0.012, 1.00, -0.70);
    add(B(0.04, 0.10, 0.06), STEEL, xo + sx * 0.02, 0.90, 0.95);                // door handle
    // mirrors
    add(B(0.06, 0.04, 0.04), GUN, sx * 0.765, 1.28, 1.35);
    add(B(0.10, 0.16, 0.05), GUN, sx * 0.80, 1.28, 1.30);
    // rust: sill flakes and a big lower panel patch on the left side
    add(B(0.006, 0.12, 0.45), RUST, xo + sx * 0.012, 0.66, sx > 0 ? 1.05 : -1.1);
    add(B(0.006, 0.08, 0.30), RUST2, xo + sx * 0.012, 0.62, sx > 0 ? -0.6 : 0.3);
    add(B(0.006, 0.06, 0.5), RUSTL, xo + sx * 0.012, 0.95, -1.0);
  }
  add(B(0.012, 0.36, 0.55), BODY2, -(W / 2 - 0.004), 0.78, -0.85);               // faded/replaced lower panel
  add(B(0.012, 0.16, 0.30), RUST, -(W / 2 - 0.0), 0.72, -0.90);
  add(B(0.6, 0.014, 0.4), RUST, 0.3, 1.767, -0.5);                                 // roof rust bloom
  // ---- rear: double doors, tail-lights, bumper --------------------------------
  const zr = -1.65;
  add(B(0.012, 1.0, 0.012), BLACK, 0, 1.12, zr - 0.004);                        // centre seam
  add(B(1.3, 0.012, 0.012), BLACK, 0, 0.63, zr - 0.004);                          // door bottom seam
  for (const sx of [-1, 1]) {
    add(B(0.55, 0.40, 0.02), GLASS, sx * 0.34, 1.35, zr - 0.006);               // rear door windows
    add(B(0.12, 0.28, 0.04), TAIL, sx * 0.62, 0.92, zr - 0.01);                 // tail-lights
    add(B(0.16, 0.32, 0.02), GUN, sx * 0.62, 0.92, zr - 0.004);
    for (const y of [0.85, 1.45]) add(B(0.05, 0.10, 0.04), STEEL, sx * 0.69, y, zr - 0.02);  // hinges
    add(B(0.04, 0.12, 0.05), STEEL, sx * 0.08, 1.0, zr - 0.03);                  // handles
  }
  add(B(0.36, 0.14, 0.012), BODY2, 0, 0.78, zr - 0.006);                          // blank rear plate
  add(B(W, 0.12, 0.08), STEEL, 0, 0.50, zr - 0.02);                                // rear bumper
  add(B(0.5, 0.05, 0.04), RUST2, -0.3, 0.50, zr - 0.05);
  add(B(0.6, 0.2, 0.012), RUST, 0.3, 0.72, zr - 0.006);                            // rust bloom on a door
  // ---- wheels: 12-inch steel wheels on small tyres -----------------------------
  for (const [x, z] of [[TX, AXF], [-TX, AXF], [TX, AXR], [-TX, AXR]]) {
    add(CYL(R, R, 0.14, 16), RUB, x, R, z, 0, 0, Math.PI / 2);
    add(CYL(R * 0.6, R * 0.6, 0.145, 12), STEEL, x, R, z, 0, 0, Math.PI / 2);
    add(CYL(R * 0.22, R * 0.22, 0.16, 8), RUST, x, R, z, 0, 0, Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      add(CYL(0.014, 0.014, 0.16, 6), GUN, x, R + Math.cos(a) * R * 0.4, z + Math.sin(a) * R * 0.4, 0, 0, Math.PI / 2);
    }
  }
  // ---- roof rack: thin tubes on six legs ---------------------------------------
  const RY = 1.86;
  for (const sx of [-1, 1]) {
    add(CYL(0.015, 0.015, 2.5, 8), STEEL, sx * 0.58, RY, -0.35, Math.PI / 2, 0, 0);
    for (const z of [-1.5, -0.35, 0.8]) add(CYL(0.014, 0.014, 0.10, 6), GUN, sx * 0.58, RY - 0.05, z);
  }
  for (let i = 0; i < 6; i++) add(CYL(0.012, 0.012, 1.16, 6), STEEL, 0, RY, -1.55 + i * 0.48, 0, 0, Math.PI / 2);
  add(CYL(0.012, 0.012, 2.5, 6), RUST, 0, RY + 0.01, -0.35, Math.PI / 2, 0, 0);

  const LIGHTS = [
    { x: 0.5, y: 0.92, z: 1.9, color: 0xe5b055, intensity: 1.6, range: 6.0 },
    { x: -0.5, y: 0.92, z: 1.9, color: 0xe5b055, intensity: 1.6, range: 6.0 },
    { x: 0.62, y: 0.92, z: -1.85, color: 0xb8302a, intensity: 0.6, range: 2.5 },
    { x: -0.62, y: 0.92, z: -1.85, color: 0xb8302a, intensity: 0.6, range: 2.5 },
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
