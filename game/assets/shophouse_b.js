// shophouse_b — arm A: primitives assembly.
// Two-storey tin-clad bar, 5.0 w x 7.0 h x 6.0 d, front +Z. Corrugated cladding is a
// field of thin vertical rib boxes over flat panels in faded green and rust red; gable
// tin roof with the ridge along z (gable to the street); three vertical lightboxes, one
// blue fluorescent sign, tin awning on struts, frosted upper window, rooftop water tank,
// cables and pipes stapled to the walls. All four faces carry fittings.
export default function (THREE) {
  const g = new THREE.Group();
  const lights = [];
  const mat = (hex, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.85, metalness: 0, ...o });
    if (name) m.name = name;
    return m;
  };
  const emis = (hex, i = 2.2) => new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: hex, emissiveIntensity: i, roughness: 0.35 });
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, m); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };
  const box = (w, h, d, x, y, z, m, rx, ry, rz) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, rx, ry, rz);
  const cyl = (r0, r1, h, seg, x, y, z, m, rx, ry, rz) => add(new THREE.CylinderGeometry(r0, r1, h, seg), m, x, y, z, rx, ry, rz);

  const black = mat(0x110f12, 'stone', { roughness: 0.95 });
  const tinM = (hex) => mat(hex, 'metal', { metalness: 0.3, roughness: 0.82 });
  const green = tinM(0x4d6b55), greenDark = tinM(0x3b5243), greenPale = tinM(0x6a8a70);
  const rustRed = tinM(0x7a3f2b), rustDark = tinM(0x4f2d21), rustRun = tinM(0x37201b);
  const creamTin = tinM(0x8b6141), creamPale = tinM(0xa8875f);
  const tinRoof = mat(0x6c4028, 'metal', { metalness: 0.3, roughness: 0.85, side: THREE.DoubleSide });
  const tinRoofRust = mat(0x37201b, 'metal', { metalness: 0.3, roughness: 0.9, side: THREE.DoubleSide });
  const galv = tinM(0x8a8378), steel = tinM(0x6f6a62), steelPale = tinM(0x9a9588), steelDark = tinM(0x3a3a38);
  const timber = mat(0x4f2d21, 'timber'), timberDark = mat(0x37201b, 'timber');
  const concrete = mat(0x4a4a4c, 'stone');
  const cable = mat(0x110f12, 'metal', { roughness: 0.9 });
  const frosted = new THREE.MeshStandardMaterial({ color: 0xb9c2c4, roughness: 0.55, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });
  const doorGlass = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.3, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });
  const eCream = emis(0xd8ae70, 2.4), eYellow = emis(0xe5b055, 2.2), eBlue = emis(0x40559f, 2.6), eWarm = emis(0xbf7c42, 1.4);

  const HX = 2.4, ZF = 2.3, ZB = -2.7, W = 2 * HX, DEP = ZF - ZB, ZC = (ZF + ZB) / 2;

  // --- plinth ------------------------------------------------------------------------
  box(W + 0.08, 0.08, DEP + 0.08, 0, 0.04, ZC, black);
  box(W, 0.2, 0.4, 0, 0.1, ZF + 0.2, concrete);                       // concrete apron
  box(0.6, 0.06, 0.4, 1.6, 0.23, ZF + 0.2, concrete);

  // --- masses --------------------------------------------------------------------------
  box(W, 6.0, DEP, 0, 3.04, ZC, rustRed);                              // the body, rust red base colour
  // panel fields: faded green on the right side and the back, cream on the upper front
  box(0.02, 5.9, DEP, HX + 0.01, 3.05, ZC, green);
  box(W, 5.9, 0.02, 0, 3.05, ZB - 0.01, greenDark);
  box(W, 2.7, 0.02, 0, 4.65, ZF + 0.01, creamTin);
  box(0.02, 2.7, 2.6, -HX - 0.01, 4.65, 1.0, green);                   // green patch on the left
  // rust and fade patches (wear)
  box(1.2, 0.9, 0.03, -1.6, 4.0, ZF + 0.015, rustRun);
  box(0.9, 1.6, 0.03, 1.2, 1.4, ZF + 0.015, rustDark);
  box(0.03, 2.2, 1.4, HX + 0.02, 1.3, -1.6, greenDark);
  box(0.03, 1.2, 1.8, HX + 0.02, 4.4, 0.9, greenPale);
  box(0.03, 1.5, 1.2, -HX - 0.02, 2.0, -1.4, rustRun);
  box(1.4, 1.8, 0.03, 1.2, 4.2, ZB - 0.02, greenPale);

  // --- corrugation: vertical rib boxes on every face (skipping openings) ----------------
  const ribs = (face, fromA, toA, y0, y1, m, skip) => {
    for (let a = fromA; a <= toA + 1e-6; a += 0.1) {
      if (skip && skip(a)) continue;
      const h = y1 - y0, y = (y0 + y1) / 2;
      if (face === 'F') box(0.032, h, 0.03, a, y, ZF + 0.025, m);
      else if (face === 'B') box(0.032, h, 0.03, a, y, ZB - 0.025, m);
      else if (face === 'R') box(0.03, h, 0.032, HX + 0.025, y, a, m);
      else box(0.03, h, 0.032, -HX - 0.025, y, a, m);
    }
  };
  ribs('F', -2.35, 2.35, 0.1, 3.05, rustDark, (a) => a > -1.05 && a < -0.15);      // ground floor, door gap
  ribs('F', -2.35, 2.35, 3.25, 5.95, creamPale, (a) => Math.abs(a) < 0.95);       // upper, window gap
  ribs('R', ZB + 0.05, ZF - 0.05, 0.1, 5.95, greenDark);
  ribs('L', ZB + 0.05, ZF - 0.05, 0.1, 5.95, rustDark, (a) => a > -0.3 && a < 0.5 ? false : false);
  ribs('B', -2.35, 2.35, 0.1, 5.95, greenDark, (a) => a > 0.9 && a < 1.9);

  // --- narrow sliding door with a dark interior behind ---------------------------------
  box(1.0, 2.3, 0.1, -0.6, 1.25, ZF - 0.05, galv);                      // frame
  box(0.9, 2.2, 0.3, -0.6, 1.2, ZF - 0.2, black);                       // the recess
  box(0.86, 2.15, 0.02, -0.6, 1.2, ZF - 0.32, eWarm);                   // warm glow deep inside
  box(0.42, 2.1, 0.05, -0.83, 1.2, ZF - 0.1, steelDark);                // the slid door leaf
  box(0.3, 0.6, 0.02, -0.83, 1.6, ZF - 0.07, doorGlass);
  box(0.03, 0.4, 0.02, -0.66, 1.15, ZF - 0.06, galv);                   // pull
  box(1.0, 0.06, 0.12, -0.6, 2.42, ZF - 0.02, galv);                    // track
  lights.push({ x: -0.6, y: 1.5, z: ZF - 0.1, color: 0xbf7c42, intensity: 0.6, range: 2.5 });

  // --- sign cluster: three vertical lightboxes, one blue fluorescent -------------------
  const lightbox = (w, h, d, x, y, z, e) => {
    box(w, h, d, x, y, z, steelDark);
    box(w - 0.08, h - 0.08, 0.03, x, y, z + d / 2 + 0.01, e);
    box(w - 0.08, 0.08, 0.035, x, y - h / 2 + 0.1, z + d / 2 + 0.01, rustRun);     // a rust bloom at the foot of the face
    for (const s of [-1, 1]) box(0.05, 0.05, 0.12, x + s * (w / 2 - 0.1), y + h / 2 - 0.1, z - d / 2 - 0.04, steel);
    lights.push({ x, y, z: z + d / 2 + 0.35, color: 0xd8ae70, intensity: 0.9, range: 3.2 });
  };
  lightbox(0.8, 2.0, 0.25, -2.05, 4.55, ZF + 0.14, eCream);            // left, tall
  lightbox(0.8, 1.6, 0.25, 2.05, 4.55, ZF + 0.14, eYellow);            // right
  lightbox(0.7, 1.2, 0.2, 0.95, 2.05, ZF + 0.12, eCream);              // lower right of the door
  box(0.45, 0.6, 0.12, 0.2, 2.3, ZF + 0.06, steelDark);                // blue fluorescent sign
  box(0.37, 0.52, 0.03, 0.2, 2.3, ZF + 0.13, eBlue);
  lights.push({ x: 0.2, y: 2.3, z: ZF + 0.4, color: 0x40559f, intensity: 0.6, range: 2.5 });
  cyl(0.02, 0.02, 0.3, 5, 0.2, 2.7, ZF + 0.06, cable);

  // --- tin awning on struts -------------------------------------------------------------
  {
    const a = new THREE.Group(); a.position.set(0, 3.0, ZF); a.rotation.x = 0.18; g.add(a);
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.03, 0.8), tinRoof); sheet.position.set(0, 0, 0.4); a.add(sheet);
    for (let i = 0; i < 26; i++) { const r = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, 0.8), (i % 8 === 2 || i === 15) ? tinRoofRust : tinRoof); r.position.set(-2.4 + i * 0.192, 0.03, 0.4); a.add(r); }
    const lip = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.07, 0.04), tinRoofRust); lip.position.set(0, -0.01, 0.8); a.add(lip);
    const rr = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 0.5), tinRoofRust); rr.position.set(-1.2, 0.05, 0.45); a.add(rr);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.05, 0.05), steel); bar.position.set(0, -0.04, 0.05); a.add(bar);
  }
  for (const x of [-2.2, 2.2]) cyl(0.02, 0.02, 0.9, 6, x, 2.6, ZF + 0.38, steel, 1.05, 0, 0);
  for (const x of [-2.2, 2.2]) box(0.08, 0.08, 0.08, x, 2.2, ZF + 0.03, steel);

  // --- frosted upper window ---------------------------------------------------------------
  box(1.9, 1.3, 0.08, 0, 4.8, ZF + 0.04, steelPale);
  box(1.76, 1.16, 0.02, 0, 4.8, ZF + 0.09, frosted);
  box(0.04, 1.16, 0.04, 0, 4.8, ZF + 0.1, steelPale);
  box(1.9, 0.08, 0.16, 0, 4.11, ZF + 0.08, steelPale);                 // sill
  box(1.76, 0.4, 0.02, 0, 4.4, ZF + 0.02, eWarm);
  lights.push({ x: 0, y: 4.8, z: ZF + 0.4, color: 0xd8ae70, intensity: 0.35, range: 2.0 });

  // --- pipes, cables, boxes on the front ------------------------------------------------
  cyl(0.03, 0.03, 5.6, 6, 2.3, 3.0, ZF + 0.07, galv);
  for (const y of [1.4, 3.6, 5.4]) box(0.1, 0.05, 0.1, 2.3, y, ZF + 0.05, steel);
  box(0.25, 0.35, 0.12, 2.15, 1.6, ZF + 0.08, steelPale);
  box(0.3, 0.4, 0.14, 2.1, 3.7, ZF + 0.08, steelPale);
  cyl(0.012, 0.012, 3.3, 4, 1.1, 5.5, ZF + 0.06, cable, 0, 0, Math.PI / 2 + 0.08);
  cyl(0.012, 0.012, 2.6, 4, 0.9, 5.75, ZF + 0.05, cable, 0, 0, Math.PI / 2 - 0.05);
  cyl(0.012, 0.012, 2.0, 4, 1.7, 2.7, ZF + 0.06, cable, 0, 0, Math.PI / 2 + 0.3);
  box(0.15, 0.15, 0.1, -2.2, 1.0, ZF + 0.05, steelDark);

  // --- gable roof, ridge along z --------------------------------------------------------
  const RX = 2.55, RY0 = 6.0, RY1 = 6.8, ROOF_Z0 = ZB - 0.2, ROOF_Z1 = ZF + 0.6, RL = ROOF_Z1 - ROOF_Z0, RZC = (ROOF_Z0 + ROOF_Z1) / 2;
  const slopeLen = Math.hypot(RX, RY1 - RY0), ang = Math.atan2(RY1 - RY0, RX);
  for (const s of [1, -1]) {
    const r = new THREE.Group(); r.position.set(s * RX / 2, (RY0 + RY1) / 2, RZC); r.rotation.z = -s * ang; g.add(r);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.06, RL), tinRoof); r.add(slab);
    for (let i = 0; i < 26; i++) { const rb = new THREE.Mesh(new THREE.BoxGeometry(slopeLen, 0.03, 0.035), (i % 9 === 4) ? tinRoofRust : tinRoof); rb.position.set(0, 0.04, -RL / 2 + 0.1 + i * 0.2); r.add(rb); }
    const patch = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 1.1), tinRoofRust); patch.position.set(s * 0.4, 0.045, s * 1.2); r.add(patch);
  }
  box(0.12, 0.1, RL, 0, RY1 + 0.02, RZC, tinRoofRust);                 // ridge cap
  {
    const sh = new THREE.Shape(); sh.moveTo(-HX, RY0 - 0.02); sh.lineTo(HX, RY0 - 0.02); sh.lineTo(0, RY1 - 0.02); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: false });
    add(geo, creamTin, 0, 0, ZF - 0.12);                               // front gable
    add(geo, greenDark, 0, 0, ZB);                                     // back gable
  }
  for (let a = -2.3; a <= 2.3; a += 0.1) { const h = Math.max(0.05, (RY1 - RY0) * (1 - Math.abs(a) / HX) - 0.04); box(0.032, h, 0.03, a, RY0 + h / 2, ZF + 0.02, creamPale); }
  for (const s of [1, -1]) {                                            // barge boards
    const l = new THREE.Group(); l.position.set(s * RX / 2, (RY0 + RY1) / 2 + 0.01, ROOF_Z1 + 0.02); l.rotation.z = -s * ang; g.add(l);
    const b = new THREE.Mesh(new THREE.BoxGeometry(slopeLen + 0.1, 0.16, 0.04), timberDark); l.add(b);
  }
  for (const s of [1, -1]) cyl(0.045, 0.045, RL, 8, s * (RX + 0.03), RY0 - 0.04, RZC, galv, Math.PI / 2, 0, 0);   // gutters
  cyl(0.04, 0.04, 5.7, 8, RX + 0.05, 3.05, ZF - 0.3, galv);             // downpipe, right front
  for (const y of [1.0, 3.2, 5.4]) box(0.14, 0.05, 0.14, RX, y, ZF - 0.3, steel);
  cyl(0.06, 0.05, 0.3, 8, RX + 0.05, 0.25, ZF - 0.3, black);

  // --- rooftop water tank on a stand ----------------------------------------------------
  {
    const tx = -0.9, tz = -1.4, ty = 6.3 + 0.35 * (1 - Math.abs(tx) / RX) * 0 + 0.3;
    cyl(0.55, 0.55, 0.7, 14, tx, ty + 0.35, tz, steelPale);
    cyl(0.5, 0.52, 0.06, 14, tx, ty + 0.72, tz, steel);                 // lid
    add(new THREE.TorusGeometry(0.55, 0.025, 5, 14), steel, tx, ty + 0.1, tz, Math.PI / 2, 0, 0);
    add(new THREE.TorusGeometry(0.55, 0.025, 5, 14), steel, tx, ty + 0.62, tz, Math.PI / 2, 0, 0);
    box(0.02, 0.4, 0.5, tx + 0.55, ty + 0.3, tz, rustRun);              // rust run down the side
    for (const [dx, dz] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
      const lx = tx + dx, roofY = RY1 - (RY1 - RY0) * Math.abs(lx) / RX;
      box(0.06, ty - roofY + 0.06, 0.06, lx, (ty + roofY) / 2, tz + dz, steel);
    }
    box(1.1, 0.08, 1.1, tx, ty - 0.04, tz, steel);
    cyl(0.03, 0.03, 0.8, 6, tx + 0.5, ty + 0.9, tz + 0.3, galv, 0, 0, Math.PI / 2);   // fill pipe
    cyl(0.03, 0.03, 1.4, 6, tx + 0.9, ty + 0.3, tz + 0.3, galv);
  }

  // --- right side (green): meters, stapled cable run, conduit, exhaust fan, vent --------
  box(0.16, 0.5, 0.4, HX + 0.1, 4.2, 0.8, steelPale); box(0.16, 0.35, 0.3, HX + 0.1, 3.5, 1.3, steelPale);
  box(0.2, 0.6, 0.35, HX + 0.12, 1.5, 0.3, steelPale);
  cyl(0.02, 0.02, 4.8, 6, HX + 0.06, 3.9, -0.4, cable, Math.PI / 2, 0, 0);
  cyl(0.02, 0.02, 4.8, 6, HX + 0.06, 3.82, -0.4, cable, Math.PI / 2, 0, 0);
  for (let z = ZB + 0.3; z < ZF; z += 0.5) box(0.06, 0.12, 0.05, HX + 0.05, 3.86, z, galv);   // staples
  cyl(0.03, 0.03, 5.6, 6, HX + 0.08, 3.0, -2.1, galv);
  for (const y of [1.0, 3.0, 5.2]) box(0.1, 0.05, 0.1, HX + 0.06, y, -2.1, steel);
  box(0.25, 0.5, 0.5, HX + 0.13, 2.4, -1.0, steelDark);                 // exhaust fan housing
  add(new THREE.TorusGeometry(0.16, 0.025, 5, 14), steel, HX + 0.27, 2.4, -1.0, 0, Math.PI / 2, 0);
  box(0.03, 0.9, 0.5, HX + 0.02, 1.8, -1.0, rustRun);
  cyl(0.012, 0.012, 3.5, 4, HX + 0.07, 5.2, 0.3, cable, Math.PI / 2 + 0.15, 0, 0);
  box(0.12, 0.25, 0.25, HX + 0.08, 5.3, 1.6, steel);                     // vent

  // --- left side (rust): barred window, AC, pipe, bin ------------------------------------
  box(0.08, 0.8, 0.9, -HX - 0.04, 4.7, 0.2, steelPale); box(0.02, 0.7, 0.8, -HX - 0.09, 4.7, 0.2, frosted);
  for (const z of [-0.05, 0.2, 0.45]) box(0.03, 0.75, 0.02, -HX - 0.1, 4.7, z, steel);
  box(0.3, 0.55, 0.75, -HX - 0.17, 2.7, -1.2, steelPale);
  add(new THREE.TorusGeometry(0.17, 0.02, 5, 16), steel, -HX - 0.33, 2.7, -1.1, 0, Math.PI / 2, 0);
  for (const z of [-1.5, -0.9]) box(0.34, 0.04, 0.04, -HX - 0.17, 2.4, z, steel);
  box(0.03, 0.6, 0.7, -HX - 0.02, 2.0, -1.2, rustRun);
  cyl(0.04, 0.04, 5.7, 8, -HX - 0.1, 3.0, 1.6, galv);
  for (const y of [1.0, 3.2, 5.4]) box(0.14, 0.05, 0.14, -HX - 0.06, y, 1.6, steel);
  cyl(0.3, 0.28, 0.85, 10, -HX - 0.45, 0.43, -2.2, steelDark);           // a bin at the wall
  box(0.15, 0.25, 0.2, -HX - 0.08, 1.4, 0.4, steelDark);

  // --- back: door, two windows, duct, ladder ------------------------------------------------
  box(1.0, 2.2, 0.1, 1.4, 1.2, ZB - 0.05, timberDark); box(0.86, 2.06, 0.05, 1.4, 1.2, ZB - 0.09, timber);
  box(0.06, 0.2, 0.05, 1.05, 1.1, ZB - 0.13, steel);
  box(0.6, 0.3, 0.3, 1.4, 2.55, ZB - 0.18, tinRoof);
  for (const x of [-1.5, 0.2]) { box(0.7, 0.6, 0.08, x, 4.7, ZB - 0.04, steelPale); box(0.6, 0.5, 0.02, x, 4.7, ZB - 0.09, frosted); }
  cyl(0.13, 0.13, 4.8, 8, -0.8, 2.8, ZB - 0.2, galv);
  add(new THREE.TorusGeometry(0.2, 0.13, 6, 8, Math.PI / 2), galv, -0.8, 5.2, ZB - 0.02, Math.PI, Math.PI / 2, 0);
  box(0.9, 0.5, 0.45, -0.8, 3.3, ZB - 0.28, steelPale);
  box(0.03, 1.2, 0.6, -0.8, 4.2, ZB - 0.035, rustRun);
  for (const x of [-2.15, -1.75]) box(0.05, 6.4, 0.05, x, 3.25, ZB - 0.2, steel);                 // ladder stiles
  for (let y = 0.5; y < 6.3; y += 0.4) cyl(0.015, 0.015, 0.4, 5, -1.95, y, ZB - 0.2, steel, 0, 0, Math.PI / 2);
  box(0.3, 0.5, 0.15, 2.0, 3.8, ZB - 0.08, steelPale);

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((L) => ({ ...L, x: L.x - c.x, y: L.y - bb.min.y, z: L.z - c.z }));
  return g;
}
