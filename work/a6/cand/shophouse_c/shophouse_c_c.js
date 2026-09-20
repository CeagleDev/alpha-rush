// shophouse_c — arm C: a different reading of the same reference. The shutter is HALF
// ROLLED UP, so the shopfront is a dark recess behind it with a step, a counter and a
// back wall; the ground floor sits back 0.30 m behind two piers; the upper floor is clad
// in corrugated tin over the render rather than bare plaster; the roof is a mono-pitch
// tin lean-to falling to the BACK with a low front parapet and 0.6 m eaves; the two AC
// units share one bracket rack on the +X flank with the ducts running up to the roof.
// Still 5.0 w x 7.0 h x 6.0 d, front +Z, all four sides modelled, dark unlit lightbox,
// frosted sliding window, laundry pole, exposed pipes.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);

  const plaster = M(0x8a8378, 'plaster', { roughness: 0.95 });
  const plasterStain = M(0x6f6a5f, 'plaster', { roughness: 0.95 });
  const plasterPale = M(0x9a9287, 'plaster', { roughness: 0.95 });
  const plasterDirty = M(0x5c564d, 'plaster', { roughness: 0.95 });
  const stone = M(0x4a4a4c, 'stone', { roughness: 0.92 });
  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const timberDk = M(0x37201b, 'timber', { roughness: 0.92 });
  const timberLit = M(0x6c4028, 'timber', { roughness: 0.9 });
  const tin = M(0x7d817f, 'metal', { roughness: 0.8, metalness: 0.3 });
  const tinRust = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.3 });
  const tinPale = M(0x8b6141, 'metal', { roughness: 0.88, metalness: 0.3 });
  const shutter = M(0x6f7477, 'metal', { roughness: 0.82, metalness: 0.3 });
  const shutterRust = M(0x7a4a2e, 'metal', { roughness: 0.9, metalness: 0.3 });
  const steel = M(0x5b6167, 'metal', { roughness: 0.8, metalness: 0.3 });
  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const white = M(0xb9b3a4, 'metal', { roughness: 0.85, metalness: 0.3 });
  const tile = M(0x3a3d40, 'tile', { roughness: 0.88 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });
  const cable = M(0x1b1c1e, 'metal', { roughness: 0.9 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xc9c2ae, roughness: 0.4, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });

  const HX = 2.5, HZ = 2.6, WT = 0.16, Y0 = 0.16, WTOP = 5.90, FZ = HZ - WT / 2;
  const RF_F = 6.85, RF_B = 5.55, EAVE = 3.02;                 // mono-pitch: high at the front
  const ANG = Math.atan((RF_F - RF_B) / (2 * EAVE));

  // --- plinth, grounding band, step -------------------------------------------------
  box(2 * HX + 0.10, Y0, 2 * HZ + 0.10, [0, Y0 / 2, 0], stone);
  box(2 * HX + 0.12, 0.06, 2 * HZ + 0.12, [0, 0.03, 0], dark);
  box(3.20, 0.16, 0.36, [-0.80, 0.08, HZ + 0.14], stone);                                  // shopfront step
  box(3.20, 0.05, 0.38, [-0.80, 0.02, HZ + 0.15], dark);

  // --- the recessed shopfront: two piers, a dark interior, a counter -------------------
  const REC = 0.34;                                                                         // how far the front is set back
  const SH_X0 = -2.26, SH_X1 = 0.66, SH_TOP = 2.90;
  box(0.24, 3.20 - Y0, 0.50, [-2.38, Y0 + (3.20 - Y0) / 2, HZ - 0.25], plaster);            // left pier
  box(0.44, 3.20 - Y0, 0.50, [0.88, Y0 + (3.20 - Y0) / 2, HZ - 0.25], plasterStain);        // mid pier
  box(0.24, 3.20 - Y0, 0.50, [2.38, Y0 + (3.20 - Y0) / 2, HZ - 0.25], plaster);             // right pier
  box(2 * HX, 0.34, 0.54, [0, 3.03, HZ - 0.27], plasterPale);                                // head beam over the piers
  // the recess itself: floor, back wall, side returns, all dark
  box(2.92, 0.04, REC, [-0.80, Y0 + 0.02, HZ - REC / 2 - 0.16], stone);
  box(2.92, 3.20 - Y0, 0.10, [-0.80, Y0 + (3.20 - Y0) / 2, HZ - REC - 0.16], dark);
  box(1.30, 2.10, 0.06, [-1.50, Y0 + 1.05, HZ - REC - 0.12], plasterDirty);                  // a lit-once back panel
  for (const x of [SH_X0 - 0.06, SH_X1 + 0.06]) box(0.12, 3.20 - Y0, REC, [x, Y0 + (3.20 - Y0) / 2, HZ - REC / 2 - 0.16], plasterDirty);
  box(1.70, 0.90, 0.50, [0.00, Y0 + 0.45, HZ - 0.42], timberDk);                              // counter inside the recess
  box(1.76, 0.06, 0.56, [0.00, Y0 + 0.92, HZ - 0.42], timberLit);
  for (const x of [-0.70, 0.70]) box(0.08, 0.86, 0.08, [x, Y0 + 0.43, HZ - 0.20], timber);
  // crates stacked in the recess
  box(0.50, 0.34, 0.34, [-1.90, Y0 + 0.17, HZ - 0.36], tinPale);
  box(0.50, 0.34, 0.34, [-1.90, Y0 + 0.51, HZ - 0.36], timber);
  box(0.46, 0.30, 0.30, [-1.28, Y0 + 0.15, HZ - 0.30], timberDk);

  // --- the shutter, half rolled up, its curtain hanging from the box ---------------------
  box(2.98, 0.34, 0.40, [-0.80, SH_TOP - 0.05, HZ - 0.30], steel);                            // shutter box
  box(3.04, 0.06, 0.44, [-0.80, SH_TOP + 0.14, HZ - 0.30], rustDk);
  for (const x of [SH_X0, SH_X1]) box(0.10, 2.70, 0.10, [x, Y0 + 1.35, HZ - 0.18], steel);    // guides
  for (let i = 0; i < 6; i++) {
    const y = SH_TOP - 0.28 - i * 0.168;
    box(2.86, 0.15, 0.05, [-0.80, y, HZ - 0.20], i % 3 === 1 ? shutterRust : shutter);
  }
  box(2.86, 0.10, 0.07, [-0.80, SH_TOP - 1.18, HZ - 0.20], rustDk);                            // bottom rail, hanging at 1.7 m
  box(0.28, 0.05, 0.04, [-0.80, SH_TOP - 1.26, HZ - 0.15], galv);
  box(0.60, 0.30, 0.006, [-1.70, SH_TOP - 0.60, HZ - 0.17], shutterRust);

  // --- the side door, in the mid pier's return, on the front ------------------------------
  const DR_X0 = 1.20, DR_X1 = 2.10, DR_TOP = 2.28;
  box(DR_X1 - DR_X0 + 0.12, DR_TOP - Y0 + 0.10, 0.10, [(DR_X0 + DR_X1) / 2, Y0 + (DR_TOP - Y0) / 2, FZ + 0.03], steel);
  box(DR_X1 - DR_X0, DR_TOP - Y0, 0.06, [(DR_X0 + DR_X1) / 2, Y0 + (DR_TOP - Y0) / 2, FZ + 0.06], shutter);
  box(DR_X1 - DR_X0 - 0.12, 0.05, 0.02, [(DR_X0 + DR_X1) / 2, DR_TOP - 0.32, FZ + 0.09], steel);
  box(DR_X1 - DR_X0 - 0.06, 0.30, 0.006, [(DR_X0 + DR_X1) / 2, Y0 + 0.22, FZ + 0.09], rust);
  box(0.05, 0.22, 0.03, [DR_X1 - 0.16, 1.12, FZ + 0.10], galv);
  for (const y of [0.58, 1.24, 1.90]) cyl(0.012, 0.012, 0.06, 6, [DR_X0 + 0.07, y, FZ + 0.08], rustDk);
  box(0.18, 0.22, 0.04, [DR_X1 - 0.24, 1.76, FZ + 0.09], white);
  box(0.90, 0.10, 0.24, [(DR_X0 + DR_X1) / 2, DR_TOP + 0.16, FZ + 0.12], tinRust, [0.14, 0, 0]);   // little door canopy

  // --- upper floor: render behind corrugated tin cladding ----------------------------------
  const W_X0 = -2.10, W_X1 = 0.90, W_Y0 = 4.20, W_Y1 = 5.78;
  box(2 * HX, WTOP - 3.20, WT, [0, (WTOP + 3.20) / 2, FZ], plaster);
  box(W_X1 - W_X0, W_Y1 - W_Y0, WT + 0.04, [(W_X0 + W_X1) / 2, (W_Y0 + W_Y1) / 2, FZ], dark);      // window reveal
  // tin cladding: vertical sheets over the render, left of the window and above it
  for (let i = 0; i < 9; i++) box(0.05, 0.94, 0.04, [1.12 + i * 0.16, 4.65, FZ + WT / 2 + 0.01], i % 3 === 1 ? tinRust : tin);
  box(1.44, 0.94, 0.02, [1.76, 4.65, FZ + WT / 2], tinPale);
  for (let i = 0; i < 26; i++) box(0.05, 0.50, 0.04, [-2.42 + i * 0.185, 5.60, FZ + WT / 2 + 0.01], i % 4 === 2 ? tinRust : tin);
  box(2 * HX, 0.50, 0.02, [0, 5.60, FZ + WT / 2], tin);
  box(2 * HX, 0.10, 0.10, [0, 5.33, FZ + WT / 2 + 0.02], timberDk);                                // cladding batten
  box(1.10, 0.60, 0.02, [1.70, 3.60, FZ + WT / 2], plasterDirty);
  box(2 * HX, 0.26, 0.02, [0, 3.34, FZ + WT / 2], plasterDirty);

  // --- frosted sliding window, rail, laundry pole -------------------------------------------
  box(W_X1 - W_X0 + 0.14, W_Y1 - W_Y0 + 0.14, 0.08, [(W_X0 + W_X1) / 2, (W_Y0 + W_Y1) / 2, FZ + 0.06], timberDk);
  put(new THREE.BoxGeometry(W_X1 - W_X0, W_Y1 - W_Y0, 0.02), glass, [(W_X0 + W_X1) / 2, (W_Y0 + W_Y1) / 2, FZ + 0.08]);
  for (const x of [-1.35, -0.60, 0.15]) box(0.05, W_Y1 - W_Y0, 0.05, [x, (W_Y0 + W_Y1) / 2, FZ + 0.09], timber);
  box(W_X1 - W_X0, 0.05, 0.05, [(W_X0 + W_X1) / 2, 4.99, FZ + 0.09], timber);
  box(W_X1 - W_X0 + 0.24, 0.10, 0.20, [(W_X0 + W_X1) / 2, W_Y0 - 0.06, FZ + 0.10], timberLit);
  box(W_X1 - W_X0 + 0.18, 0.10, 0.10, [(W_X0 + W_X1) / 2, W_Y1 + 0.07, FZ + 0.06], timberDk);
  for (const x of [W_X0 + 0.10, W_X1 - 0.10]) box(0.05, 0.62, 0.05, [x, W_Y0 + 0.29, FZ + 0.30], rust);
  box(W_X1 - W_X0, 0.05, 0.05, [(W_X0 + W_X1) / 2, W_Y0 + 0.58, FZ + 0.30], rust);
  box(W_X1 - W_X0, 0.04, 0.04, [(W_X0 + W_X1) / 2, W_Y0 + 0.31, FZ + 0.30], rustDk);
  for (const x of [W_X0 + 0.10, W_X1 - 0.10]) box(0.04, 0.04, 0.28, [x, W_Y0 + 0.56, FZ + 0.18], rust);
  for (const x of [-1.80, 0.55]) { box(0.05, 0.05, 0.30, [x, 5.42, FZ + 0.19], galv); box(0.05, 0.16, 0.05, [x, 5.35, FZ + 0.32], galv); }
  cyl(0.022, 0.022, 2.45, 6, [-0.62, 5.42, FZ + 0.33], galv, [0, 0, Math.PI / 2]);
  for (const x of [-1.2, -0.3]) cyl(0.012, 0.012, 0.10, 5, [x, 5.36, FZ + 0.33], cable);

  // --- the dark unlit lightbox, high on the right pier --------------------------------------
  box(0.85, 0.52, 0.24, [1.70, 3.72, FZ + 0.18], plasterDirty);
  box(0.79, 0.46, 0.02, [1.70, 3.72, FZ + 0.31], stone);
  box(0.89, 0.05, 0.28, [1.70, 4.00, FZ + 0.18], rustDk);
  box(0.89, 0.05, 0.28, [1.70, 3.44, FZ + 0.18], rust);
  for (const x of [1.38, 2.02]) box(0.04, 0.22, 0.16, [x, 4.07, FZ + 0.12], rustDk);
  cyl(0.008, 0.008, 0.70, 5, [2.06, 4.35, FZ + 0.05], cable, [0.1, 0, 0.12]);

  // --- both AC units on one rack on the +X flank, ducts up to the roof -----------------------
  {
    const x = HX + 0.20;
    for (const bz of [-1.20, 0.20]) { box(0.06, 1.60, 0.06, [x - 0.06, 3.60, bz], rust); }
    for (const y of [2.98, 3.98]) { box(0.40, 0.05, 1.50, [x, y, -0.50], rustDk); for (const bz of [-1.15, 0.15]) box(0.05, 0.34, 0.05, [x + 0.16, y - 0.20, bz], rust, [0.5, 0, 0]); }
    const unit = (y, m) => {
      box(0.34, 0.50, 0.76, [x, y, -0.50], m);
      box(0.34, 0.06, 0.76, [x, y - 0.22, -0.50], plasterDirty);
      cyl(0.17, 0.17, 0.02, 12, [x + 0.17, y, -0.66], dark, [0, 0, Math.PI / 2]);
      put(new THREE.TorusGeometry(0.17, 0.012, 4, 12), steel, [x + 0.18, y, -0.66], [0, Math.PI / 2, 0]);
      for (let k = 0; k < 3; k++) box(0.01, 0.012, 0.34, [x + 0.185, y, -0.66], steel, [k * Math.PI / 3, 0, 0]);
      for (let k = 0; k < 5; k++) box(0.012, 0.012, 0.24, [x + 0.185, y - 0.10 + k * 0.05, -0.16], steel);
      box(0.02, 0.06, 0.20, [x + 0.18, y + 0.18, -0.86], rust);
    };
    unit(3.26, white); unit(4.26, tinPale);
    cyl(0.05, 0.05, 1.90, 8, [x - 0.02, 5.10, -0.90], white);
    put(new THREE.TorusGeometry(0.09, 0.05, 6, 8, Math.PI / 2), white, [x - 0.02, 4.05, -0.81], [Math.PI / 2, 0, Math.PI / 2]);
    cyl(0.05, 0.05, 0.30, 8, [x - 0.02, 3.96, -0.72], white, [Math.PI / 2, 0, 0]);
    for (const y of [4.50, 5.40]) box(0.12, 0.05, 0.12, [x - 0.08, y, -0.90], rustDk);
    cyl(0.035, 0.035, 1.20, 8, [x - 0.04, 4.60, 0.60], galv);
    box(0.24, 0.32, 0.18, [x, 2.40, 0.90], steel);                                              // isolator box below the rack
    cyl(0.008, 0.008, 1.40, 5, [x - 0.06, 3.20, 0.95], cable, [0.05, 0, 0.03]);
  }

  // --- side walls, vent, soil stack, and the gable-free mono-pitch tops ------------------------
  for (const sx of [-1, 1]) {
    const x = sx * (HX - WT / 2);
    box(WT, WTOP - Y0, 2 * HZ - 2 * WT, [x, Y0 + (WTOP - Y0) / 2, 0], sx > 0 ? plaster : plasterStain);
    // the wall follows the mono-pitch above WTOP: slices falling to the back
    for (let i = 0; i < 12; i++) {
      const z = -HZ + WT + (i + 0.5) * ((2 * HZ - 2 * WT) / 12);
      const top = RF_F - (HZ - z) * ((RF_F - RF_B) / (2 * EAVE)) - 0.12;
      box(WT, Math.max(top - WTOP, 0.04), (2 * HZ - 2 * WT) / 12 + 0.005, [x, WTOP + Math.max(top - WTOP, 0.04) / 2, z], sx > 0 ? plasterPale : plaster);
    }
    box(0.02, 1.50, 1.00, [x + sx * WT / 2, 2.90, sx * -1.1], plasterDirty);
    box(0.02, 0.70, 0.60, [x + sx * WT / 2, 5.00, 1.3], plasterDirty);
    box(0.08, 0.34, 0.44, [x + sx * (WT / 2 + 0.02), 4.30, 1.40], steel);
    for (let k = 0; k < 4; k++) { const bl = box(0.05, 0.02, 0.38, [x + sx * (WT / 2 + 0.05), 4.19 + k * 0.06, 1.40], galv); bl.rotation.x = 0.5; }
    cyl(0.055, 0.055, 5.30, 8, [x + sx * 0.09, 2.80, -2.00], galv);
    for (const y of [0.90, 2.40, 3.90, 5.10]) box(0.10, 0.05, 0.14, [x + sx * 0.05, y, -2.00], rustDk);
    cyl(0.065, 0.065, 0.10, 8, [x + sx * 0.09, 3.10, -2.00], rust);
  }
  // a fixed ladder up the -X flank: the way to the roof
  for (const s of [-1, 1]) cyl(0.022, 0.022, 4.60, 6, [-HX - 0.14, 3.10, s * 0.24 + 1.40], galv);
  for (let i = 0; i < 12; i++) cyl(0.016, 0.016, 0.48, 6, [-HX - 0.14, 0.95 + i * 0.38, 1.40], galv, [Math.PI / 2, 0, 0]);
  for (const y of [1.40, 4.40]) for (const s of [-1, 1]) box(0.16, 0.05, 0.05, [-HX - 0.07, y, s * 0.24 + 1.40], rustDk);

  // --- back wall with a door, and a stain --------------------------------------------------------
  const BZ = -HZ + WT / 2;
  box(2 * HX, WTOP - Y0, WT, [0, Y0 + (WTOP - Y0) / 2, BZ], plasterStain);
  box(0.94, 2.06, WT + 0.04, [-0.50, Y0 + 1.03, BZ], dark);
  box(1.02, 2.14, 0.06, [-0.50, Y0 + 1.05, BZ - 0.08], timberDk);
  box(0.90, 2.02, 0.05, [-0.50, Y0 + 1.03, BZ - 0.10], timber);
  for (let i = 0; i < 4; i++) box(0.20, 1.96, 0.02, [-0.83 + i * 0.22, Y0 + 1.03, BZ - 0.13], i % 2 ? timberLit : timber);
  box(0.05, 0.16, 0.03, [-0.12, 1.05, BZ - 0.14], galv);
  box(0.90, 0.24, 0.02, [-0.50, Y0 + 0.17, BZ - 0.13], timberDk);
  box(1.70, 1.20, 0.02, [1.30, 3.20, BZ - WT / 2], plasterDirty);
  box(2 * HX, 0.30, 0.02, [0, 0.34, BZ - WT / 2], plasterDirty);
  box(0.70, 0.55, 0.02, [-1.85, 4.60, BZ - WT / 2], plasterPale);
  cyl(0.04, 0.04, 5.00, 8, [1.95, 2.70, BZ - 0.10], galv);
  for (const y of [1.20, 3.00, 4.60]) box(0.10, 0.05, 0.12, [1.95, y, BZ - 0.04], rustDk);
  box(0.22, 0.32, 0.16, [-1.60, 2.40, BZ - 0.10], steel);
  box(0.80, 0.50, 0.40, [0.90, 0.36, BZ - 0.28], tinRust);                                      // a bin against the back wall
  box(0.84, 0.06, 0.44, [0.90, 0.62, BZ - 0.28], tinPale);

  // --- mono-pitch corrugated roof, front parapet, eaves ----------------------------------------------
  const SL = Math.hypot(2 * EAVE, RF_F - RF_B);
  box(2 * HX + 0.24, 0.08, SL, [0, (RF_F + RF_B) / 2 - 0.03, 0], tinRust, [-ANG, 0, 0]);
  for (let i = 0; i < 34; i++) {
    const x = -HX - 0.10 + i * ((2 * HX + 0.20) / 33);
    const m = i % 7 === 2 ? tinPale : (i % 5 === 1 ? tin : tinRust);
    box(0.055, 0.04, SL - 0.04, [x, (RF_F + RF_B) / 2 + 0.02, 0], m, [-ANG, 0, 0]);
  }
  box(2 * HX + 0.28, 0.40, 0.14, [0, RF_F + 0.10, EAVE - 0.06], plasterPale);                    // front parapet
  box(2 * HX + 0.28, 0.08, 0.20, [0, RF_F + 0.28, EAVE - 0.06], tile);
  box(2 * HX + 0.24, 0.14, 0.05, [0, RF_B - 0.08, -EAVE], timberDk);                              // back fascia
  for (let i = 0; i < 9; i++) box(0.07, 0.09, 0.34, [-2.20 + i * 0.55, RF_B + 0.02, -EAVE + 0.16], timber, [-ANG, 0, 0]);
  box(2 * HX + 0.10, 0.10, 0.24, [0, RF_B + 0.10, -EAVE + 0.32], timberDk, [-ANG, 0, 0]);
  cyl(0.04, 0.04, 2 * HX, 8, [0, RF_B - 0.14, -EAVE + 0.06], galv, [0, 0, Math.PI / 2]);          // gutter pipe at the low edge
  for (const sx of [-1, 1]) box(0.10, 0.34, 0.10, [sx * 1.35, 6.30, -1.2], rust);
  box(0.95, 0.07, 0.75, [0, 6.48, -1.2], tinPale);
  box(0.30, 0.60, 0.30, [-1.85, 6.35, 0.9], plasterStain);
  box(0.36, 0.06, 0.36, [-1.85, 6.68, 0.9], tin);

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
