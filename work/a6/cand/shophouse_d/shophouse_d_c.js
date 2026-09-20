// shophouse_d — arm C: a different reading of the same corner. The upper floor is JETTIED,
// overhanging 0.22 m on both lit faces on timber brackets, and the emissive lightboxes are
// fixed to that jetty fascia rather than flat on the wall; the tin awning is a lean-to
// standing on its own posts down to the ground, wrapping the corner, with the red lantern
// hung from the corner post; the ground floor is boarded timber over a stone plinth; and the
// tiled roof is a GABLE with its ridge running along Z, so the +Z street face shows a gable
// end with a barge board. CORNER unit 5.0 w x 7.0 h x 6.0 d: sliding door on +Z, narrow
// window on +X, both plain faces modelled. Lantern and both lightboxes publish userData.lights.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const E = (emissive, intensity) => new THREE.MeshStandardMaterial({ color: 0x110f12, emissive, emissiveIntensity: intensity, roughness: 0.35 });
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);

  const plaster = M(0x8a8378, 'plaster', { roughness: 0.95 });
  const plasterStain = M(0x6f6a5f, 'plaster', { roughness: 0.95 });
  const plasterDirty = M(0x5c564d, 'plaster', { roughness: 0.95 });
  const stone = M(0x4a4a4c, 'stone', { roughness: 0.92 });
  const stonePale = M(0x5f6063, 'stone', { roughness: 0.92 });
  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const timberDk = M(0x37201b, 'timber', { roughness: 0.92 });
  const timberLit = M(0x6c4028, 'timber', { roughness: 0.9 });
  const timberGrey = M(0x8b6141, 'timber', { roughness: 0.92 });
  const tin = M(0x7d817f, 'metal', { roughness: 0.8, metalness: 0.3, side: THREE.DoubleSide });
  const tinRust = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.3, side: THREE.DoubleSide });
  const tinPale = M(0x8b6141, 'metal', { roughness: 0.88, metalness: 0.3, side: THREE.DoubleSide });
  const steel = M(0x5b6167, 'metal', { roughness: 0.8, metalness: 0.3 });
  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const tile = M(0x3a3d40, 'tile', { roughness: 0.88 });
  const tileMoss = M(0x4a5a42, 'tile', { roughness: 0.9 });
  const tilePale = M(0x53565a, 'tile', { roughness: 0.88 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });
  const cable = M(0x1b1c1e, 'metal', { roughness: 0.9 });
  const red = M(0xb8302a, 'fabric', { roughness: 0.8 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xc9c2ae, roughness: 0.4, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });
  const signFace = E(0xd8ae70, 2.2);
  const lanternFace = E(0xb8302a, 2.4);
  const lanternCore = E(0xf1d899, 2.6);

  const HX = 2.20, HZ = 2.40, WT = 0.14, Y0 = 0.20, F1 = 3.20, WTOP = 5.55;
  const JX = HX + 0.22, JZ = HZ + 0.22;                     // the jettied upper floor
  const RX = 2.76, RZ = 2.86, RIDGE = 6.95;                 // gable ridge along Z
  const lights = [];

  // --- stone plinth, grounding band -------------------------------------------------
  box(2 * HX + 0.16, Y0, 2 * HZ + 0.16, [0, Y0 / 2, 0], stone);
  box(2 * HX + 0.18, 0.07, 2 * HZ + 0.18, [0, 0.035, 0], dark);
  for (let i = 0; i < 9; i++) box(0.48, 0.09, 0.05, [-1.92 + i * 0.48, 0.13, HZ + 0.09], i % 3 ? stonePale : stone);   // coursed plinth stones
  for (let i = 0; i < 10; i++) box(0.05, 0.09, 0.46, [HX + 0.09, 0.13, -2.15 + i * 0.48], i % 3 === 1 ? stonePale : stone);

  // --- ground floor: boarded timber walls on a frame ------------------------------------
  const DR_X0 = -0.55, DR_X1 = 1.35, DR_TOP = 2.15;
  const WN_Z0 = -0.30, WN_Z1 = 0.80, WN_Y0 = 1.15, WN_Y1 = 2.10;
  const FZ = HZ - WT / 2, FX = HX - WT / 2;
  const pz = (x0, x1, y0, y1, mat) => box(x1 - x0, y1 - y0, WT, [(x0 + x1) / 2, (y0 + y1) / 2, FZ], mat);
  const px = (z0, z1, y0, y1, mat) => box(WT, y1 - y0, z1 - z0, [FX, (y0 + y1) / 2, (z0 + z1) / 2], mat);
  pz(-HX, DR_X0, Y0, F1, timber); pz(DR_X1, HX, Y0, F1, timberDk); pz(DR_X0, DR_X1, DR_TOP, F1, timberGrey);
  px(-HZ, WN_Z0, Y0, F1, timberDk); px(WN_Z1, HZ, Y0, F1, timber);
  px(WN_Z0, WN_Z1, Y0, WN_Y0, timber); px(WN_Z0, WN_Z1, WN_Y1, F1, timberGrey);
  box(2 * HX, F1 - Y0, WT, [0, (F1 + Y0) / 2, -FZ], plasterStain);
  box(WT, F1 - Y0, 2 * HZ - 2 * WT, [-FX, (F1 + Y0) / 2, 0], plaster);
  box(2 * HX - 2 * WT, 0.06, 2 * HZ - 2 * WT, [0, Y0 + 0.03, 0], stone);
  // board lines on the two lit faces, and the posts at the corners
  for (let i = 0; i < 11; i++) box(2 * HX, 0.05, 0.03, [0, Y0 + 0.14 + i * 0.27, FZ + WT / 2], i % 3 === 1 ? timberGrey : timberDk);
  for (let i = 0; i < 11; i++) box(0.03, 0.05, 2 * HZ, [FX + WT / 2, Y0 + 0.14 + i * 0.27, 0], i % 3 === 2 ? timberGrey : timberDk);
  for (const [x, z] of [[HX - 0.07, HZ - 0.07], [-HX + 0.07, HZ - 0.07], [HX - 0.07, -HZ + 0.07]]) box(0.16, F1 - Y0, 0.16, [x, (F1 + Y0) / 2, z], timberDk);
  box(DR_X1 - DR_X0, DR_TOP - Y0, 0.10, [(DR_X0 + DR_X1) / 2, (DR_TOP + Y0) / 2, FZ - WT], dark);
  box(0.10, WN_Y1 - WN_Y0, WN_Z1 - WN_Z0, [FX - WT, (WN_Y0 + WN_Y1) / 2, (WN_Z0 + WN_Z1) / 2], dark);
  box(1.00, 0.60, 0.02, [-1.55, 1.60, FZ + WT / 2], timberGrey);                            // a faded board patch
  box(0.02, 0.50, 0.80, [FX + WT / 2, 2.50, -1.50], timberGrey);

  // --- sliding door and the narrow window ------------------------------------------------
  box(DR_X1 - DR_X0 + 0.16, DR_TOP - Y0 + 0.14, 0.10, [(DR_X0 + DR_X1) / 2, Y0 + (DR_TOP - Y0) / 2, FZ + 0.04], timberDk);
  for (let i = 0; i < 2; i++) {
    const cx = DR_X0 + 0.48 + i * 0.94, off = i ? 0.06 : 0.0;
    box(0.92, DR_TOP - Y0 - 0.06, 0.05, [cx, Y0 + (DR_TOP - Y0) / 2, FZ + 0.06 + off], timber);
    put(new THREE.BoxGeometry(0.80, DR_TOP - Y0 - 0.34, 0.02), glass, [cx, Y0 + (DR_TOP - Y0) / 2 + 0.08, FZ + 0.075 + off]);
    box(0.84, 0.07, 0.03, [cx, Y0 + 0.26, FZ + 0.085 + off], timberLit);
    box(0.84, 0.05, 0.03, [cx, Y0 + (DR_TOP - Y0) - 0.36, FZ + 0.085 + off], timber);
    box(0.04, 0.18, 0.03, [cx + (i ? -0.40 : 0.40), 1.05, FZ + 0.095 + off], steel);
  }
  box(DR_X1 - DR_X0 + 0.24, 0.10, 0.30, [(DR_X0 + DR_X1) / 2, Y0 - 0.02, FZ + 0.16], stonePale);
  box(DR_X1 - DR_X0 + 0.24, 0.05, 0.32, [(DR_X0 + DR_X1) / 2, 0.035, FZ + 0.16], dark);
  box(0.10, WN_Y1 - WN_Y0 + 0.14, WN_Z1 - WN_Z0 + 0.14, [FX + 0.04, (WN_Y0 + WN_Y1) / 2, (WN_Z0 + WN_Z1) / 2], timberDk);
  put(new THREE.BoxGeometry(0.02, WN_Y1 - WN_Y0, WN_Z1 - WN_Z0), glass, [FX + 0.075, (WN_Y0 + WN_Y1) / 2, (WN_Z0 + WN_Z1) / 2]);
  for (let i = 0; i < 5; i++) cyl(0.012, 0.012, WN_Y1 - WN_Y0 + 0.04, 6, [FX + 0.105, (WN_Y0 + WN_Y1) / 2, WN_Z0 + 0.1 + i * 0.23], rustDk);
  box(0.22, 0.08, WN_Z1 - WN_Z0 + 0.18, [FX + 0.07, WN_Y0 - 0.06, (WN_Z0 + WN_Z1) / 2], timberLit);

  // --- the jetty: a projecting floor on brackets, fascia carrying the lightboxes ------------
  box(2 * JX, 0.20, 2 * JZ, [0, F1 + 0.10, 0], timberDk);
  box(2 * JX - 0.06, 0.08, 2 * JZ - 0.06, [0, F1 + 0.24, 0], timber);
  for (let i = 0; i < 7; i++) { const x = -1.80 + i * 0.60; box(0.10, 0.34, 0.34, [x, F1 - 0.12, HZ + 0.10], timber, [0, 0, 0]); box(0.10, 0.10, 0.44, [x, F1 - 0.02, HZ + 0.12], timberDk, [0.5, 0, 0]); }
  for (let i = 0; i < 7; i++) { const z = -1.80 + i * 0.60; box(0.34, 0.34, 0.10, [HX + 0.10, F1 - 0.12, z], timber); box(0.44, 0.10, 0.10, [HX + 0.12, F1 - 0.02, z], timberDk, [0, 0, -0.5]); }
  // the fascia and its lightboxes
  const LBY = F1 + 0.42;
  box(2 * JX, 0.60, 0.10, [0, LBY, JZ + 0.05], timberDk);
  box(0.10, 0.60, 2 * JZ, [JX + 0.05, LBY, 0], timberDk);
  {
    const h = 0.50, d = 0.16;
    box(2.86 + 0.08, h + 0.08, d, [-0.20, LBY, JZ + 0.12], timber);
    put(new THREE.BoxGeometry(2.86, h, 0.04), signFace, [-0.20, LBY, JZ + 0.12 + d / 2 + 0.01]);
    box(2.98, 0.06, d + 0.06, [-0.20, LBY + h / 2 + 0.06, JZ + 0.12], rustDk);
    box(2.98, 0.06, d + 0.06, [-0.20, LBY - h / 2 - 0.06, JZ + 0.12], rust);
    lights.push([-0.20, LBY, JZ + 0.60, 0xd8ae70, 2.4, 7.5]);
    box(d, h + 0.08, 2.96 + 0.08, [JX + 0.12, LBY, -0.16], timber);
    put(new THREE.BoxGeometry(0.04, h, 2.96), signFace, [JX + 0.12 + d / 2 + 0.01, LBY, -0.16]);
    box(d + 0.06, 0.06, 3.08, [JX + 0.12, LBY + h / 2 + 0.06, -0.16], rustDk);
    box(d + 0.06, 0.06, 3.08, [JX + 0.12, LBY - h / 2 - 0.06, -0.16], rust);
    lights.push([JX + 0.60, LBY, -0.16, 0xd8ae70, 2.4, 7.5]);
  }

  // --- the awning: a lean-to on its own posts, wrapping the corner --------------------------
  const AY = 2.72, AD = 0.62, AA = 0.18;
  box(2 * HX + 0.40, 0.05, AD + 0.10, [0, AY + 0.12, HZ + AD / 2], tinRust, [AA, 0, 0]);
  for (let i = 0; i < 24; i++) box(0.05, 0.035, AD + 0.06, [-(HX + 0.16) + i * ((2 * HX + 0.32) / 23), AY + 0.155, HZ + AD / 2], i % 4 === 1 ? tinPale : tin, [AA, 0, 0]);
  box(AD + 0.10, 0.05, 2 * HZ + 0.40, [HX + AD / 2, AY + 0.12, 0], tinRust, [0, 0, -AA]);
  for (let i = 0; i < 26; i++) box(AD + 0.06, 0.035, 0.05, [HX + AD / 2, AY + 0.155, -(HZ + 0.16) + i * ((2 * HZ + 0.32) / 25)], i % 4 === 3 ? tinPale : tin, [0, 0, -AA]);
  box(0.56, 0.05, 0.56, [HX + 0.16, AY + 0.20, HZ + 0.16], tinPale, [AA * 0.7, Math.PI / 4, -AA * 0.7]);
  // the beam and the posts to the ground
  box(2 * HX + 0.40, 0.12, 0.10, [0, AY, HZ + AD - 0.02], timberDk, [AA, 0, 0]);
  box(0.10, 0.12, 2 * HZ + 0.40, [HX + AD - 0.02, AY, 0], timberDk, [0, 0, -AA]);
  const postX = [-1.70, 0.30], postZ = [-1.70, 0.30];
  for (const x of postX) { cyl(0.055, 0.055, AY - 0.10, 7, [x, (AY - 0.10) / 2, HZ + AD - 0.06], timber); box(0.14, 0.10, 0.14, [x, 0.05, HZ + AD - 0.06], dark); }
  for (const z of postZ) { cyl(0.055, 0.055, AY - 0.10, 7, [HX + AD - 0.06, (AY - 0.10) / 2, z], timber); box(0.14, 0.10, 0.14, [HX + AD - 0.06, 0.05, z], dark); }
  const CPX = HX + AD - 0.06, CPZ = HZ + AD - 0.06;
  cyl(0.07, 0.07, AY + 0.30, 7, [CPX, (AY + 0.30) / 2, CPZ], timber);                        // the corner post, taller
  box(0.18, 0.10, 0.18, [CPX, 0.05, CPZ], dark);
  for (const [x, z] of [[-1.70, HZ + 0.10], [0.30, HZ + 0.10]]) box(0.06, 0.06, 0.46, [x, AY - 0.16, z + 0.20], rustDk, [0.75, 0, 0]);
  for (const [x, z] of [[HX + 0.10, -1.70], [HX + 0.10, 0.30]]) box(0.46, 0.06, 0.06, [x + 0.20, AY - 0.16, z], rustDk, [0, 0, -0.75]);

  // --- the red paper lantern, hung off the corner post --------------------------------------
  {
    const LY = 2.30;
    box(0.05, 0.05, 0.34, [CPX - 0.10, AY + 0.26, CPZ - 0.10], timberDk, [0, -Math.PI / 4, 0]);
    cyl(0.012, 0.012, 0.26, 5, [CPX - 0.20, LY + 0.76, CPZ - 0.20], cable);
    const LX = CPX - 0.20, LZ = CPZ - 0.20;
    cyl(0.085, 0.085, 0.05, 10, [LX, LY + 0.60, LZ], timberDk);
    cyl(0.20, 0.20, 0.32, 12, [LX, LY + 0.42, LZ], lanternFace);
    cyl(0.225, 0.20, 0.06, 12, [LX, LY + 0.58, LZ], lanternFace);
    cyl(0.20, 0.225, 0.06, 12, [LX, LY + 0.26, LZ], lanternFace);
    cyl(0.19, 0.19, 0.22, 10, [LX, LY + 0.42, LZ], lanternCore);
    for (let i = 0; i < 4; i++) put(new THREE.TorusGeometry(0.205, 0.008, 4, 12), red, [LX, LY + 0.30 + i * 0.08, LZ], [Math.PI / 2, 0, 0]);
    cyl(0.075, 0.075, 0.05, 10, [LX, LY + 0.22, LZ], timberDk);
    cyl(0.012, 0.012, 0.12, 5, [LX, LY + 0.15, LZ], red);
    lights.push([LX, LY + 0.42, LZ, 0xd8552a, 2.8, 6.0]);
  }

  // --- upper floor: timber cladding on the jetty, balcony rails, windows ----------------------
  const UY0 = F1 + 0.72;
  box(2 * JX, WTOP - UY0, 0.10, [0, (WTOP + UY0) / 2, JZ - 0.05], timberDk);
  box(0.10, WTOP - UY0, 2 * JZ, [JX - 0.05, (WTOP + UY0) / 2, 0], timberDk);
  for (let i = 0; i < 24; i++) box(0.16, WTOP - UY0 - 0.04, 0.04, [-(JX - 0.10) + i * ((2 * JX - 0.20) / 23), (WTOP + UY0) / 2, JZ + 0.02], i % 4 === 1 ? timberGrey : (i % 3 === 0 ? timber : timberLit));
  for (let i = 0; i < 26; i++) box(0.04, WTOP - UY0 - 0.04, 0.16, [JX + 0.02, (WTOP + UY0) / 2, -(JZ - 0.10) + i * ((2 * JZ - 0.20) / 25)], i % 4 === 3 ? timberGrey : (i % 3 === 1 ? timber : timberLit));
  for (const y of [UY0 + 0.50, UY0 + 1.30]) { box(2 * JX, 0.05, 0.06, [0, y, JZ + 0.05], timberDk); box(0.06, 0.05, 2 * JZ, [JX + 0.05, y, 0], timberDk); }
  box(2 * JX, WTOP - UY0, 0.10, [0, (WTOP + UY0) / 2, -JZ + 0.05], plasterStain);
  box(0.10, WTOP - UY0, 2 * JZ - 0.20, [-JX + 0.05, (WTOP + UY0) / 2, 0], plaster);
  // upper windows
  box(1.80, 1.20, 0.10, [-1.00, UY0 + 0.90, JZ + 0.06], timberDk);
  put(new THREE.BoxGeometry(1.64, 1.06, 0.02), glass, [-1.00, UY0 + 0.90, JZ + 0.085]);
  box(0.05, 1.06, 0.04, [-1.00, UY0 + 0.90, JZ + 0.10], timber);
  box(1.64, 0.04, 0.04, [-1.00, UY0 + 0.90, JZ + 0.10], timber);
  box(0.10, 1.20, 1.80, [JX + 0.06, UY0 + 0.90, 0.85], timberDk);
  put(new THREE.BoxGeometry(0.02, 1.06, 1.64), glass, [JX + 0.085, UY0 + 0.90, 0.85]);
  box(0.04, 1.06, 0.05, [JX + 0.10, UY0 + 0.90, 0.85], timber);
  box(0.04, 0.04, 1.64, [JX + 0.10, UY0 + 0.90, 0.85], timber);
  // small balcony rails on both lit faces
  {
    const y0 = UY0 + 0.05, h = 0.58;
    box(2 * JX - 0.30, 0.08, 0.28, [0, y0, JZ + 0.16], timber);
    box(2 * JX - 0.30, 0.07, 0.06, [0, y0 + h, JZ + 0.28], timberLit);
    box(2 * JX - 0.30, 0.05, 0.05, [0, y0 + h - 0.24, JZ + 0.28], timber);
    for (let i = 0; i < 12; i++) box(0.05, h, 0.05, [-(JX - 0.22) + i * ((2 * JX - 0.44) / 11), y0 + h / 2, JZ + 0.28], timberDk);
    box(0.28, 0.08, 2 * JZ - 0.30, [JX + 0.16, y0, 0], timber);
    box(0.06, 0.07, 2 * JZ - 0.30, [JX + 0.28, y0 + h, 0], timberLit);
    box(0.05, 0.05, 2 * JZ - 0.30, [JX + 0.28, y0 + h - 0.24, 0], timber);
    for (let i = 0; i < 13; i++) box(0.05, h, 0.05, [JX + 0.28, y0 + h / 2, -(JZ - 0.22) + i * ((2 * JZ - 0.44) / 12)], timberDk);
  }

  // --- the plain faces --------------------------------------------------------------------------
  const BZ = -HZ - 0.005, BX = -HX - 0.005;
  box(0.94, 2.00, 0.06, [0.70, Y0 + 1.00, BZ - 0.03], timberDk);
  box(0.84, 1.88, 0.05, [0.70, Y0 + 1.00, BZ - 0.05], timber);
  for (let i = 0; i < 4; i++) box(0.19, 1.84, 0.02, [0.39 + i * 0.21, Y0 + 1.00, BZ - 0.075], i % 2 ? timberLit : timber);
  box(0.05, 0.16, 0.03, [1.10, 1.05, BZ - 0.09], galv);
  box(1.50, 1.00, 0.02, [-1.20, 2.60, BZ], plasterDirty);
  box(2 * HX, 0.30, 0.02, [0, 0.38, BZ], plasterDirty);
  cyl(0.055, 0.055, F1 + 2.10, 8, [-1.85, (F1 + 2.10) / 2, BZ - 0.10], galv);
  for (const y of [1.0, 2.5, 4.0, 5.0]) box(0.10, 0.05, 0.14, [-1.85, y, BZ - 0.04], rustDk);
  box(0.22, 0.32, 0.16, [1.70, 2.20, BZ - 0.10], steel);
  box(0.02, 1.20, 0.90, [BX, 2.30, 0.9], plasterDirty);
  box(0.08, 0.34, 0.44, [BX - 0.04, 2.40, -1.20], steel);
  for (let k = 0; k < 4; k++) { const bl = box(0.05, 0.02, 0.38, [BX - 0.07, 2.29 + k * 0.06, -1.20], galv); bl.rotation.x = 0.5; }
  cyl(0.04, 0.04, 4.80, 8, [BX - 0.10, 2.55, -1.90], galv);
  for (const y of [1.2, 3.0, 4.6]) box(0.10, 0.05, 0.12, [BX - 0.04, y, -1.90], rustDk);
  cyl(0.008, 0.008, 2.60, 5, [BX - 0.06, 3.40, 1.40], cable, [0.04, 0, 0]);
  box(0.70, 0.46, 0.40, [1.20, 0.43, BZ - 0.28], tinRust);                                      // a bin at the back
  box(0.74, 0.06, 0.44, [1.20, 0.68, BZ - 0.28], tinPale);

  // --- gable tiled roof, ridge along Z, barge boards on the +Z street gable ----------------------
  {
    const RH = RIDGE - WTOP, ang = Math.atan2(RH, RX), SL = Math.hypot(RX, RH);
    for (const sx of [-1, 1]) {
      box(SL, 0.08, 2 * RZ, [sx * RX / 2, WTOP + RH / 2, 0], tile, [0, 0, sx > 0 ? -ang : ang]);
      for (let i = 0; i < 7; i++) {
        const t = (i + 0.45) / 7;
        box(0.26, 0.06, 2 * RZ - 0.10, [sx * RX * (1 - t), WTOP + 0.06 + t * RH, 0], i % 3 === 1 ? tileMoss : (i % 3 === 2 ? tilePale : tile), [0, 0, sx > 0 ? -ang : ang]);
      }
      box(0.16, 0.18, 2 * RZ + 0.10, [sx * (RX - 0.04), WTOP + 0.09, 0], timberDk);            // eaves board
      for (let i = 0; i < 9; i++) box(0.34, 0.09, 0.09, [sx * (RX - 0.20), WTOP + 0.20, -2.60 + i * 0.65], timber, [0, 0, sx > 0 ? -ang : ang]);   // rafter feet
    }
    box(0.34, 0.16, 2 * RZ + 0.14, [0, RIDGE - 0.04, 0], tilePale);                              // ridge
    box(0.16, 0.10, 2 * RZ + 0.20, [0, RIDGE + 0.06, 0], tile);
    // the +Z gable: a barge board pair and the tympanum boarding
    for (const sx of [-1, 1]) box(SL, 0.16, 0.10, [sx * RX / 2, WTOP + RH / 2 + 0.10, RZ + 0.05], timberDk, [0, 0, sx > 0 ? -ang : ang]);
    for (let i = 0; i < 9; i++) {
      const x = -RX + 0.30 + i * ((2 * RX - 0.60) / 8);
      const h = (RH - 0.10) * (1 - Math.abs(x) / RX);
      box((2 * RX - 0.60) / 8 - 0.02, Math.max(h, 0.08), 0.06, [x, WTOP + Math.max(h, 0.08) / 2, RZ - 0.02], i % 3 === 1 ? timberGrey : timber);
    }
    box(0.30, 0.34, 0.16, [0, RIDGE - 0.34, RZ + 0.02], timberDk);                                // the gable's little vent board
    for (const sx of [-1, 1]) box(SL, 0.16, 0.10, [sx * RX / 2, WTOP + RH / 2 + 0.10, -RZ - 0.05], timberDk, [0, 0, sx > 0 ? -ang : ang]);
    for (let i = 0; i < 9; i++) {
      const x = -RX + 0.30 + i * ((2 * RX - 0.60) / 8);
      const h = (RH - 0.10) * (1 - Math.abs(x) / RX);
      box((2 * RX - 0.60) / 8 - 0.02, Math.max(h, 0.08), 0.06, [x, WTOP + Math.max(h, 0.08) / 2, -RZ + 0.02], i % 3 === 2 ? timberGrey : plasterStain);
    }
    for (const [x, z] of [[-1.2, 1.1], [1.4, -0.9], [0.4, 1.9]]) box(0.30, 0.05, 0.22, [x, WTOP + 0.5 + Math.abs(x) * 0.1, z], tileMoss);
  }

  g.userData.lights = lights.map(([x, y, z, color, intensity, range]) => ({ x, y, z, color, intensity, range }));
  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  for (const L of g.userData.lights) { L.x -= c.x; L.y -= bb.min.y; L.z -= c.z; }
  return g;
}
