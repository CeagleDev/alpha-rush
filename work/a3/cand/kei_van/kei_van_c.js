// kei_van — arm C: a different breakdown. Read as a cab-over van assembled
// from a cab module (the front 1.05 m, with its own raked screen and a proud
// scuttle) and a taller cargo module behind it, joined by a roof drip rail;
// wheel-arch flares as proud box rings, a running-board step under the doors,
// the sliding door as a proud panel on a runner, round tail-lights, 6-lug
// steel wheels, a stepped rear bumper and a spare wheel on the rear door.
// 3.4 × 1.5 × 1.9 m, faded white two-tone with rust flakes, blank nose (no
// badge), tube roof rack. Front = +Z, base y = 0, block obstacle.
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

  const W = 1.5, R = 0.27, AXF = 1.05, AXR = -0.95, TX = 0.62;
  // ---- chassis and sills with a black foot band ----------------------------------
  add(B(1.16, 0.25, 3.0), GUN, 0, 0.40, 0.0);
  for (const sx of [-1, 1]) {
    add(B(0.16, 0.28, 1.25), BODY2, sx * (W / 2 - 0.08), 0.50, 0.05);
    add(B(0.16, 0.28, 0.22), BODY2, sx * (W / 2 - 0.08), 0.50, 1.52);
    add(B(0.16, 0.28, 0.28), BODY2, sx * (W / 2 - 0.08), 0.50, -1.50);
    add(B(0.164, 0.05, 1.25), BLACK, sx * (W / 2 - 0.08), 0.385, 0.05);      // grounding band
    add(B(0.164, 0.05, 0.22), BLACK, sx * (W / 2 - 0.08), 0.385, 1.52);
    add(B(0.164, 0.05, 0.28), BLACK, sx * (W / 2 - 0.08), 0.385, -1.50);
    // wheel-arch flares: proud rings of three boxes, arch liners behind
    for (const az of [AXF, AXR]) {
      add(B(0.04, 0.05, 0.74), RUST, sx * (W / 2 + 0.005), 0.66, az);
      add(B(0.04, 0.32, 0.05), BODY2, sx * (W / 2 + 0.005), 0.52, az + 0.36);
      add(B(0.04, 0.32, 0.05), BODY2, sx * (W / 2 + 0.005), 0.52, az - 0.36);
      add(B(0.02, 0.4, 0.66), BLACK, sx * 0.54, 0.45, az);
      add(B(0.16, 0.05, 0.66), BLACK, sx * (W / 2 - 0.08), 0.64, az);
    }
    // running-board step under the doors
    add(B(0.10, 0.03, 1.5), STEEL, sx * (W / 2 + 0.03), 0.42, 0.55);
  }
  // ---- cab module: front 1.05 m, its own screen and a proud scuttle ----------------
  add(B(W, 0.28, 1.05), BODY, 0, 0.78, 1.125);                                  // belt band 0.64..0.92
  add(B(W - 0.02, 0.24, 1.0), BODY, 0, 1.04, 1.10);                             // dash line 0.92..1.16
  add(B(W - 0.02, 0.10, 0.95), BODY, 0, 1.67, 1.075);                           // header
  add(B(W - 0.02, 0.6, 0.55), BODY, 0, 1.40, 0.80);                             // cab side walls
  add(B(W + 0.02, 0.06, 0.18), BODY2, 0, 1.13, 1.58);                           // proud scuttle / cowl
  add(B(1.32, 0.56, 0.03), GLASS, 0, 1.42, 1.56, -0.20, 0, 0);                  // windscreen, leans back
  for (const sx of [-1, 1]) add(B(0.07, 0.58, 0.06), BODY, sx * 0.68, 1.42, 1.55, -0.20, 0, 0);
  add(B(W - 0.06, 0.05, 1.05), BODY3, 0, 1.745, 1.05);                          // cab roof
  // ---- cargo module: 3 cm taller, drip rail joins it to the cab --------------------
  add(B(W, 1.1, 2.25), BODY, 0, 1.19, -0.525);                                  // 0.64..1.74
  add(B(W - 0.06, 0.06, 2.25), BODY3, 0, 1.77, -0.525);                         // cargo roof 1.74..1.80
  add(B(W + 0.02, 0.03, 0.04), STEEL, 0, 1.75, 0.60);                           // drip rail at the join
  for (const sx of [-1, 1]) add(B(0.03, 0.03, 2.3), STEEL, sx * (W / 2 - 0.02), 1.755, -0.5);   // roof gutters
  // ---- nose: blank panel, round headlights, indicators, grille, stepped bumper ------
  const zn = 1.65;
  add(B(W - 0.1, 0.5, 0.02), BODY2, 0, 0.92, zn + 0.005);                       // nose skin, faded
  for (const sx of [-1, 1]) {
    add(CYL(0.10, 0.11, 0.03, 14), CHROME, sx * 0.5, 0.95, zn + 0.02, Math.PI / 2, 0, 0);
    add(CYL(0.082, 0.082, 0.02, 14), HEAD, sx * 0.5, 0.95, zn + 0.04, Math.PI / 2, 0, 0);
    add(B(0.16, 0.08, 0.03), GUN, sx * 0.56, 0.60, zn + 0.01);
    add(B(0.12, 0.06, 0.02), AMBER, sx * 0.56, 0.60, zn + 0.025);
  }
  add(B(0.56, 0.16, 0.02), GUN, 0, 0.66, zn + 0.01);
  for (let i = 0; i < 5; i++) add(B(0.52, 0.012, 0.02), CHROME, 0, 0.60 + i * 0.03, zn + 0.02);
  add(B(0.34, 0.12, 0.012), BODY, 0, 0.62, zn + 0.035);                          // blank plate over the grille
  add(B(0.32, 0.12, 0.014), RUST, 0.35, 1.05, zn + 0.005);
  add(B(0.24, 0.10, 0.014), RUST2, -0.4, 0.78, zn + 0.005);
  add(B(W, 0.10, 0.08), STEEL, 0, 0.44, zn + 0.02);                              // bumper, lower step
  add(B(W - 0.3, 0.06, 0.06), STEEL, 0, 0.52, zn + 0.01);                        // upper step
  add(B(0.34, 0.09, 0.03), GUN, 0.40, 0.44, zn + 0.05);                          // dented corner
  add(B(0.14, 0.10, 0.05), RUST2, -0.60, 0.44, zn + 0.05);
  add(B(0.45, 0.02, 0.012), GUN, -0.22, 1.16, zn - 0.05, -0.3, 0, 0.35);         // wipers
  add(B(0.45, 0.02, 0.012), GUN, 0.32, 1.16, zn - 0.05, -0.3, 0, 0.35);
  // ---- sides: glass, sliding door as a proud panel, seams, mirrors, rust ------------
  for (const sx of [-1, 1]) {
    const xo = sx * (W / 2);
    add(B(0.02, 0.48, 0.72), GLASS, xo + sx * 0.004, 1.38, 1.02);               // cab door window
    add(B(0.02, 0.44, 1.05), GLASS, xo + sx * 0.004, 1.36, -0.95);              // rear quarter window
    add(B(0.02, 0.9, 0.85), BODY, xo + sx * 0.01, 1.10, 0.20);                  // sliding door panel, 1 cm proud
    add(B(0.02, 0.42, 0.62), GLASS, xo + sx * 0.022, 1.36, 0.20);
    add(B(0.03, 0.035, 1.3), GUN, xo + sx * 0.02, 0.98, -0.75);                 // runner rail
    add(B(0.06, 0.03, 0.10), GUN, xo + sx * 0.03, 0.98, -0.20);                 // runner carriage
    add(B(0.006, 1.0, 0.012), BLACK, xo + sx * 0.012, 0.95, 1.40);              // cab door seam
    add(B(0.006, 1.0, 0.012), BLACK, xo + sx * 0.012, 0.95, 0.62);
    add(B(0.006, 0.012, 0.78), BLACK, xo + sx * 0.012, 0.46, 1.0);
    add(B(0.04, 0.10, 0.06), STEEL, xo + sx * 0.02, 0.95, 0.95);                // handles
    add(B(0.04, 0.08, 0.05), STEEL, xo + sx * 0.03, 1.0, 0.55);
    add(B(0.06, 0.04, 0.04), GUN, sx * 0.765, 1.32, 1.35);                       // mirrors
    add(B(0.10, 0.16, 0.05), GUN, sx * 0.80, 1.32, 1.30);
    add(B(0.006, 0.12, 0.5), RUST, xo + sx * 0.012, 0.70, sx > 0 ? -1.2 : 1.0);
    add(B(0.006, 0.08, 0.3), RUST2, xo + sx * 0.012, 0.80, sx > 0 ? -0.5 : -1.3);
    add(B(0.006, 0.05, 0.7), RUSTL, xo + sx * 0.012, 1.10, -0.9);
    add(B(0.012, 0.3, 0.4), BODY2, xo + sx * 0.008, 0.85, sx > 0 ? -1.2 : -0.9);   // faded panel
  }
  add(B(0.5, 0.012, 0.3), RUST, 0.3, 1.806, -1.0);                               // roof rust bloom
  // ---- rear: double doors, round tail-lights, spare wheel, stepped bumper ------------
  const zr = -1.65;
  add(B(0.012, 1.02, 0.012), BLACK, 0, 1.15, zr - 0.004);
  add(B(1.3, 0.012, 0.012), BLACK, 0, 0.66, zr - 0.004);
  for (const sx of [-1, 1]) {
    add(B(0.5, 0.36, 0.02), GLASS, sx * 0.35, 1.40, zr - 0.006);
    add(CYL(0.08, 0.08, 0.03, 12), GUN, sx * 0.62, 0.90, zr - 0.01, Math.PI / 2, 0, 0);
    add(CYL(0.065, 0.065, 0.02, 12), TAIL, sx * 0.62, 0.90, zr - 0.03, Math.PI / 2, 0, 0);
    for (const y of [0.85, 1.5]) add(B(0.05, 0.10, 0.04), STEEL, sx * 0.69, y, zr - 0.02);
    add(B(0.04, 0.12, 0.05), STEEL, sx * 0.08, 1.05, zr - 0.03);
  }
  // spare wheel on the left rear door
  add(CYL(0.24, 0.24, 0.12, 14), RUB, -0.36, 1.0, zr - 0.08, Math.PI / 2, 0, 0);
  add(CYL(0.15, 0.15, 0.13, 10), RUST, -0.36, 1.0, zr - 0.08, Math.PI / 2, 0, 0);
  add(B(0.36, 0.14, 0.012), BODY2, 0.4, 0.78, zr - 0.006);                       // blank rear plate
  add(B(W, 0.10, 0.08), STEEL, 0, 0.44, zr - 0.02);
  add(B(W - 0.3, 0.06, 0.06), STEEL, 0, 0.52, zr - 0.01);
  add(B(0.5, 0.05, 0.04), RUST2, 0.3, 0.44, zr - 0.05);
  add(B(0.5, 0.16, 0.012), RUST, 0.45, 1.25, zr - 0.006);
  // ---- wheels: 6-lug steel wheels --------------------------------------------------
  for (const [x, z] of [[TX, AXF], [-TX, AXF], [TX, AXR], [-TX, AXR]]) {
    add(CYL(R, R, 0.14, 16), RUB, x, R, z, 0, 0, Math.PI / 2);
    add(CYL(R * 0.62, R * 0.62, 0.146, 12), STEEL, x, R, z, 0, 0, Math.PI / 2);
    add(CYL(R * 0.5, R * 0.5, 0.15, 12), GUN, x, R, z, 0, 0, Math.PI / 2);
    add(CYL(R * 0.2, R * 0.2, 0.165, 8), RUST, x, R, z, 0, 0, Math.PI / 2);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      add(CYL(0.012, 0.012, 0.165, 6), CHROME, x, R + Math.cos(a) * R * 0.36, z + Math.sin(a) * R * 0.36, 0, 0, Math.PI / 2);
    }
  }
  // ---- roof rack -------------------------------------------------------------------
  const RY = 1.86;
  for (const sx of [-1, 1]) {
    add(CYL(0.015, 0.015, 2.6, 8), STEEL, sx * 0.6, RY, -0.3, Math.PI / 2, 0, 0);
    for (const z of [-1.5, -0.3, 0.9]) add(CYL(0.014, 0.014, 0.06, 6), GUN, sx * 0.6, RY - 0.03, z);
  }
  for (let i = 0; i < 7; i++) add(CYL(0.012, 0.012, 1.2, 6), i === 4 ? RUST : STEEL, 0, RY, -1.5 + i * 0.4, 0, 0, Math.PI / 2);
  add(CYL(0.012, 0.012, 2.6, 6), STEEL, 0, RY + 0.012, -0.3, Math.PI / 2, 0, 0);

  const LIGHTS = [
    { x: 0.5, y: 0.95, z: 1.92, color: 0xe5b055, intensity: 1.6, range: 6.0 },
    { x: -0.5, y: 0.95, z: 1.92, color: 0xe5b055, intensity: 1.6, range: 6.0 },
    { x: 0.62, y: 0.90, z: -1.9, color: 0xb8302a, intensity: 0.6, range: 2.5 },
    { x: -0.62, y: 0.90, z: -1.9, color: 0xb8302a, intensity: 0.6, range: 2.5 },
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
