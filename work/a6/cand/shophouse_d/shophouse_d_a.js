// shophouse_d — arm A: primitives. CORNER unit, 5.0 w x 7.0 h x 6.0 d, with TWO lit street
// faces meeting at the +X/+Z corner: a tiny bar with a glazed sliding door on +Z and a narrow
// window on +X, a horizontal emissive cream lightbox on each face, a red paper lantern hung at
// the corner (emissive, with a userData.lights entry), a corrugated tin awning wrapping the
// corner at 3.0 m, timber-clad upper floor with a small balcony rail on both lit faces, and a
// tiled hip roof. The -X and -Z faces are plain but modelled: plaster, a back door, a soil
// stack, a vent and a meter box.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const E = (emissive, intensity) => new THREE.MeshStandardMaterial({ color: 0x110f12, emissive, emissiveIntensity: intensity, roughness: 0.35 });
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r, open) => put(new THREE.CylinderGeometry(rt, rb, h, seg, 1, !!open), mat, p, r);

  const plaster = M(0x8a8378, 'plaster', { roughness: 0.95 });
  const plasterStain = M(0x6f6a5f, 'plaster', { roughness: 0.95 });
  const plasterDirty = M(0x5c564d, 'plaster', { roughness: 0.95 });
  const plasterPale = M(0x9a9287, 'plaster', { roughness: 0.95 });
  const stone = M(0x4a4a4c, 'stone', { roughness: 0.92 });
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
  const signFace = E(0xd8ae70, 2.2);          // lit sign faces: near-black base + emissive, unnamed
  const lanternFace = E(0xb8302a, 2.4);
  const lanternCore = E(0xf1d899, 2.6);

  const HX = 2.38, HZ = 2.55, WT = 0.16, Y0 = 0.16, WTOP = 5.60, FZ = HZ - WT / 2, FX = HX - WT / 2;
  const RX = 2.80, RZ = 3.10, RIDGE = 6.95;
  const lights = [];

  // --- plinth and grounding band ---------------------------------------------------
  box(2 * HX + 0.12, Y0, 2 * HZ + 0.12, [0, Y0 / 2, 0], stone);
  box(2 * HX + 0.14, 0.06, 2 * HZ + 0.14, [0, 0.03, 0], dark);
  box(2 * HX + 0.08, 0.06, 2 * HZ + 0.08, [0, Y0 + 0.02, 0], plasterDirty);

  // --- ground floor walls: plaster, with the bar's openings on the two lit faces -------
  const DR_X0 = -0.60, DR_X1 = 1.30, DR_TOP = 2.15;             // sliding door on +Z
  const WN_Z0 = -0.30, WN_Z1 = 0.80, WN_Y0 = 1.15, WN_Y1 = 2.10; // narrow window on +X
  const pz = (x0, x1, y0, y1, mat) => box(x1 - x0, y1 - y0, WT, [(x0 + x1) / 2, (y0 + y1) / 2, FZ], mat);
  const px = (z0, z1, y0, y1, mat) => box(WT, y1 - y0, z1 - z0, [FX, (y0 + y1) / 2, (z0 + z1) / 2], mat);
  pz(-HX, DR_X0, Y0, 3.20, plaster);
  pz(DR_X1, HX, Y0, 3.20, plasterStain);
  pz(DR_X0, DR_X1, DR_TOP, 3.20, plaster);
  px(-HZ, WN_Z0, Y0, 3.20, plasterStain);
  px(WN_Z1, HZ, Y0, 3.20, plaster);
  px(WN_Z0, WN_Z1, Y0, WN_Y0, plaster);
  px(WN_Z0, WN_Z1, WN_Y1, 3.20, plasterStain);
  box(2 * HX, WTOP - Y0, WT, [0, Y0 + (WTOP - Y0) / 2, -FZ], plasterStain);                 // -Z wall, full height
  box(WT, WTOP - Y0, 2 * HZ - 2 * WT, [-FX, Y0 + (WTOP - Y0) / 2, 0], plaster);             // -X wall
  box(2 * HX - 2 * WT, 0.08, 2 * HZ - 2 * WT, [0, 3.20, 0], timberDk);                       // upper floor slab
  box(2 * HX - 2 * WT, 0.06, 2 * HZ - 2 * WT, [0, Y0 + 0.03, 0], stone);
  // dark interiors behind the openings
  box(DR_X1 - DR_X0, DR_TOP - Y0, 0.10, [(DR_X0 + DR_X1) / 2, (DR_TOP + Y0) / 2, FZ - WT], dark);
  box(0.10, WN_Y1 - WN_Y0, WN_Z1 - WN_Z0, [FX - WT, (WN_Y0 + WN_Y1) / 2, (WN_Z0 + WN_Z1) / 2], dark);
  // wear on the plaster
  box(2 * HX, 0.34, 0.02, [0, 0.38, FZ + WT / 2], plasterDirty);
  box(WT * 0.15, 0.34, 2 * HZ, [FX + WT / 2, 0.38, 0], plasterDirty);
  box(0.80, 0.70, 0.02, [-1.70, 2.30, FZ + WT / 2], plasterDirty);
  box(0.02, 0.90, 0.60, [FX + WT / 2, 2.40, -1.60], plasterDirty);

  // --- the sliding door: two glazed leaves in a timber frame, a step and a sill -----------
  box(DR_X1 - DR_X0 + 0.14, DR_TOP - Y0 + 0.12, 0.10, [(DR_X0 + DR_X1) / 2, Y0 + (DR_TOP - Y0) / 2, FZ + 0.04], timberDk);
  for (let i = 0; i < 2; i++) {
    const cx = DR_X0 + 0.48 + i * 0.94, off = i ? 0.06 : 0.0;
    box(0.92, DR_TOP - Y0 - 0.06, 0.05, [cx, Y0 + (DR_TOP - Y0) / 2, FZ + 0.06 + off], timber);
    put(new THREE.BoxGeometry(0.80, DR_TOP - Y0 - 0.30, 0.02), glass, [cx, Y0 + (DR_TOP - Y0) / 2 + 0.06, FZ + 0.075 + off]);
    box(0.84, 0.06, 0.03, [cx, Y0 + 0.24, FZ + 0.085 + off], timberLit);
    box(0.84, 0.05, 0.03, [cx, Y0 + (DR_TOP - Y0) - 0.34, FZ + 0.085 + off], timber);
    box(0.04, 0.16, 0.03, [cx + (i ? -0.40 : 0.40), 1.05, FZ + 0.095 + off], steel);
  }
  box(DR_X1 - DR_X0 + 0.20, 0.08, 0.26, [(DR_X0 + DR_X1) / 2, Y0 + 0.02, FZ + 0.14], stone);
  box(DR_X1 - DR_X0 + 0.20, 0.05, 0.28, [(DR_X0 + DR_X1) / 2, 0.03, FZ + 0.14], dark);
  box(DR_X1 - DR_X0 + 0.14, 0.10, 0.12, [(DR_X0 + DR_X1) / 2, DR_TOP + 0.10, FZ + 0.06], timberDk);

  // --- the narrow window on +X ----------------------------------------------------------------
  box(0.10, WN_Y1 - WN_Y0 + 0.12, WN_Z1 - WN_Z0 + 0.12, [FX + 0.04, (WN_Y0 + WN_Y1) / 2, (WN_Z0 + WN_Z1) / 2], timberDk);
  put(new THREE.BoxGeometry(0.02, WN_Y1 - WN_Y0, WN_Z1 - WN_Z0), glass, [FX + 0.075, (WN_Y0 + WN_Y1) / 2, (WN_Z0 + WN_Z1) / 2]);
  box(0.04, WN_Y1 - WN_Y0, 0.05, [FX + 0.085, (WN_Y0 + WN_Y1) / 2, (WN_Z0 + WN_Z1) / 2], timber);
  for (let i = 0; i < 5; i++) cyl(0.012, 0.012, WN_Y1 - WN_Y0 + 0.04, 6, [FX + 0.105, (WN_Y0 + WN_Y1) / 2, WN_Z0 + 0.1 + i * 0.23], rustDk);   // bars
  box(0.20, 0.07, WN_Z1 - WN_Z0 + 0.16, [FX + 0.08, WN_Y0 - 0.05, (WN_Z0 + WN_Z1) / 2], timberLit);
  box(0.12, 0.09, WN_Z1 - WN_Z0 + 0.14, [FX + 0.05, WN_Y1 + 0.06, (WN_Z0 + WN_Z1) / 2], timberDk);

  // --- the tin awning, wrapping the corner at 3.0 m --------------------------------------------
  const AY = 3.00, AD = 1.05, AA = 0.16;
  // +Z face run
  box(2 * HX + 0.30, 0.04, AD, [0.05, AY + 0.06, HZ + AD / 2 - 0.10], tinRust, [AA, 0, 0]);
  for (let i = 0; i < 26; i++) box(0.05, 0.03, AD - 0.02, [-2.45 + i * 0.19, AY + 0.09, HZ + AD / 2 - 0.10], i % 4 === 1 ? tinPale : tin, [AA, 0, 0]);
  box(2 * HX + 0.30, 0.10, 0.05, [0.05, AY - 0.02, HZ + AD - 0.12], timberDk, [AA, 0, 0]);
  // +X face run
  box(AD, 0.04, 2 * HZ + 0.30, [HX + AD / 2 - 0.10, AY + 0.06, 0.05], tinRust, [0, 0, -AA]);
  for (let i = 0; i < 28; i++) box(AD - 0.02, 0.03, 0.05, [HX + AD / 2 - 0.10, AY + 0.09, -2.60 + i * 0.19], i % 4 === 3 ? tinPale : tin, [0, 0, -AA]);
  box(0.05, 0.10, 2 * HZ + 0.30, [HX + AD - 0.12, AY - 0.02, 0.05], timberDk, [0, 0, -AA]);
  // the corner itself: a small mitre panel and a corner post
  box(0.60, 0.05, 0.60, [HX + 0.22, AY + 0.14, HZ + 0.22], tinPale, [AA * 0.7, Math.PI / 4, -AA * 0.7]);
  cyl(0.05, 0.05, AY - Y0, 8, [HX + 0.52, Y0 + (AY - Y0) / 2, HZ + 0.52], timber);
  box(0.10, 0.10, 0.10, [HX + 0.52, Y0 + 0.03, HZ + 0.52], dark);
  // struts back to the wall
  for (const [x, z, rz, rx] of [[-1.60, HZ + 0.50, 0, 1], [1.60, HZ + 0.50, 0, 1], [HX + 0.50, -1.60, 1, 0], [HX + 0.50, 1.60, 1, 0]]) {
    const m = box(0.05, 0.05, 0.86, [x, AY - 0.22, z], rustDk, rx ? [0.62, 0, 0] : [0, Math.PI / 2, 0.62]);
    if (rz) m.rotation.set(0, Math.PI / 2, -0.62);
    box(0.08, 0.12, 0.08, [x, AY - 0.44, rx ? HZ + 0.06 : z], rust);
  }

  // --- the two emissive lightboxes, one per lit face --------------------------------------------
  const lbZ = { w: 3.10, h: 0.56, d: 0.18, x: -0.25, y: 3.72, z: HZ + 0.10 };
  box(lbZ.w + 0.08, lbZ.h + 0.08, lbZ.d, [lbZ.x, lbZ.y, lbZ.z], timberDk);
  put(new THREE.BoxGeometry(lbZ.w, lbZ.h, 0.04), signFace, [lbZ.x, lbZ.y, lbZ.z + lbZ.d / 2 + 0.01]);
  box(lbZ.w + 0.12, 0.06, lbZ.d + 0.06, [lbZ.x, lbZ.y + lbZ.h / 2 + 0.06, lbZ.z], rustDk);
  box(lbZ.w + 0.12, 0.06, lbZ.d + 0.06, [lbZ.x, lbZ.y - lbZ.h / 2 - 0.06, lbZ.z], rust);
  for (const x of [lbZ.x - 1.30, lbZ.x + 1.30]) box(0.05, 0.24, 0.16, [x, lbZ.y + 0.40, lbZ.z - 0.06], rustDk);
  lights.push([lbZ.x, lbZ.y, lbZ.z + 0.45, 0xd8ae70, 2.4, 7.5]);
  const lbX = { d: 3.20, h: 0.56, w: 0.18, z: -0.20, y: 3.72, x: HX + 0.10 };
  box(lbX.w, lbX.h + 0.08, lbX.d + 0.08, [lbX.x, lbX.y, lbX.z], timberDk);
  put(new THREE.BoxGeometry(0.04, lbX.h, lbX.d), signFace, [lbX.x + lbX.w / 2 + 0.01, lbX.y, lbX.z]);
  box(lbX.w + 0.06, 0.06, lbX.d + 0.12, [lbX.x, lbX.y + lbX.h / 2 + 0.06, lbX.z], rustDk);
  box(lbX.w + 0.06, 0.06, lbX.d + 0.12, [lbX.x, lbX.y - lbX.h / 2 - 0.06, lbX.z], rust);
  for (const z of [lbX.z - 1.35, lbX.z + 1.35]) box(0.16, 0.24, 0.05, [lbX.x - 0.06, lbX.y + 0.40, z], rustDk);
  lights.push([lbX.x + 0.45, lbX.y, lbX.z, 0xd8ae70, 2.4, 7.5]);

  // --- the red paper lantern at the corner -------------------------------------------------------
  const LX = HX + 0.52, LZ = HZ + 0.52, LY = 3.52;
  box(0.06, 0.06, 0.52, [LX, LY + 0.62, LZ - 0.20], rustDk, [0, -Math.PI / 4, 0]);          // bracket arm off the corner
  cyl(0.012, 0.012, 0.22, 5, [LX, LY + 0.50, LZ], cable);
  cyl(0.085, 0.085, 0.05, 10, [LX, LY + 0.36, LZ], timberDk);                                 // top cap
  cyl(0.20, 0.20, 0.30, 12, [LX, LY + 0.18, LZ], lanternFace);                                 // the body
  cyl(0.225, 0.20, 0.06, 12, [LX, LY + 0.33, LZ], lanternFace);
  cyl(0.20, 0.225, 0.06, 12, [LX, LY + 0.03, LZ], lanternFace);
  cyl(0.19, 0.19, 0.20, 10, [LX, LY + 0.18, LZ], lanternCore);
  for (let i = 0; i < 4; i++) put(new THREE.TorusGeometry(0.205, 0.008, 4, 12), red, [LX, LY + 0.06 + i * 0.08, LZ], [Math.PI / 2, 0, 0]);
  cyl(0.075, 0.075, 0.05, 10, [LX, LY - 0.02, LZ], timberDk);                                  // bottom cap
  cyl(0.012, 0.012, 0.12, 5, [LX, LY - 0.09, LZ], red);                                        // tassel
  lights.push([LX, LY + 0.18, LZ, 0xd8552a, 2.8, 6.0]);

  // --- upper floor: timber cladding, balcony rails on both lit faces ------------------------------
  const clad = (face) => {
    if (face === 'z') {
      box(2 * HX, WTOP - 3.20, WT, [0, (WTOP + 3.20) / 2, FZ], timberDk);
      for (let i = 0; i < 26; i++) box(0.17, WTOP - 3.24, 0.04, [-2.29 + i * 0.185, (WTOP + 3.20) / 2, FZ + WT / 2 + 0.01], i % 4 === 1 ? timberGrey : (i % 3 === 0 ? timber : timberLit));
      for (const y of [3.90, 4.70, 5.40]) box(2 * HX, 0.05, 0.06, [0, y, FZ + WT / 2 + 0.03], timberDk);
    } else {
      box(WT, WTOP - 3.20, 2 * HZ, [FX, (WTOP + 3.20) / 2, 0], timberDk);
      for (let i = 0; i < 28; i++) box(0.04, WTOP - 3.24, 0.17, [FX + WT / 2 + 0.01, (WTOP + 3.20) / 2, -2.46 + i * 0.185], i % 4 === 3 ? timberGrey : (i % 3 === 1 ? timber : timberLit));
      for (const y of [3.90, 4.70, 5.40]) box(0.06, 0.05, 2 * HZ, [FX + WT / 2 + 0.03, y, 0], timberDk);
    }
  };
  clad('z'); clad('x');
  box(2 * HX, WTOP - 3.20, WT, [0, (WTOP + 3.20) / 2, -FZ], plasterStain);
  box(WT, WTOP - 3.20, 2 * HZ - 2 * WT, [-FX, (WTOP + 3.20) / 2, 0], plaster);
  // upper windows, one per lit face, behind the balcony rails
  for (const [isZ, c] of [[true, -1.10], [false, 0.90]]) {
    if (isZ) {
      box(1.70, 1.15, 0.10, [c, 4.62, FZ + 0.06], timberDk);
      put(new THREE.BoxGeometry(1.56, 1.02, 0.02), glass, [c, 4.62, FZ + 0.085]);
      box(0.05, 1.02, 0.04, [c, 4.62, FZ + 0.10], timber);
      box(1.56, 0.04, 0.04, [c, 4.62, FZ + 0.10], timber);
    } else {
      box(0.10, 1.15, 1.70, [FX + 0.06, 4.62, c], timberDk);
      put(new THREE.BoxGeometry(0.02, 1.02, 1.56), glass, [FX + 0.085, 4.62, c]);
      box(0.04, 1.02, 0.05, [FX + 0.10, 4.62, c], timber);
      box(0.04, 0.04, 1.56, [FX + 0.10, 4.62, c], timber);
    }
  }
  // balcony rails: a timber handrail on turned posts, one per lit face
  const rail = (isZ) => {
    const y0 = 4.00, h = 0.62;
    if (isZ) {
      box(2 * HX - 0.20, 0.10, 0.34, [0, y0 - 0.05, FZ + 0.24], timber);                    // little deck
      box(2 * HX - 0.20, 0.08, 0.06, [0, y0 + h, FZ + 0.38], timberLit);
      box(2 * HX - 0.20, 0.05, 0.05, [0, y0 + h - 0.26, FZ + 0.38], timber);
      for (let i = 0; i < 13; i++) box(0.05, h, 0.05, [-2.16 + i * 0.36, y0 + h / 2, FZ + 0.38], timberDk);
    } else {
      box(0.34, 0.10, 2 * HZ - 0.20, [FX + 0.24, y0 - 0.05, 0], timber);
      box(0.06, 0.08, 2 * HZ - 0.20, [FX + 0.38, y0 + h, 0], timberLit);
      box(0.05, 0.05, 2 * HZ - 0.20, [FX + 0.38, y0 + h - 0.26, 0], timber);
      for (let i = 0; i < 14; i++) box(0.05, h, 0.05, [FX + 0.38, y0 + h / 2, -2.33 + i * 0.36], timberDk);
    }
  };
  rail(true); rail(false);

  // --- the plain faces: back door, soil stack, vent, meter box -------------------------------------
  const BZ = -HZ - 0.005, BX = -HX - 0.005;
  box(0.94, 2.02, 0.06, [0.70, Y0 + 1.01, BZ - 0.03], timberDk);
  box(0.84, 1.90, 0.05, [0.70, Y0 + 1.01, BZ - 0.05], timber);
  for (let i = 0; i < 4; i++) box(0.19, 1.86, 0.02, [0.39 + i * 0.21, Y0 + 1.01, BZ - 0.075], i % 2 ? timberLit : timber);
  box(0.05, 0.16, 0.03, [1.10, 1.05, BZ - 0.09], galv);
  box(0.84, 0.22, 0.02, [0.70, Y0 + 0.15, BZ - 0.075], timberDk);
  box(1.60, 1.10, 0.02, [-1.20, 3.10, BZ], plasterDirty);
  box(2 * HX, 0.30, 0.02, [0, 0.34, BZ], plasterDirty);
  cyl(0.055, 0.055, 5.10, 8, [-1.90, 2.70, BZ - 0.10], galv);
  for (const y of [1.0, 2.5, 4.0, 5.2]) box(0.10, 0.05, 0.14, [-1.90, y, BZ - 0.04], rustDk);
  box(0.22, 0.32, 0.16, [1.70, 2.20, BZ - 0.10], steel);
  box(0.02, 1.30, 1.00, [BX, 2.90, 0.9], plasterDirty);
  box(0.02, 0.60, 0.50, [BX, 4.90, -1.3], plasterPale);
  box(0.08, 0.34, 0.44, [BX - 0.04, 4.10, 0.50], steel);
  for (let k = 0; k < 4; k++) { const bl = box(0.05, 0.02, 0.38, [BX - 0.07, 3.99 + k * 0.06, 0.50], galv); bl.rotation.x = 0.5; }
  cyl(0.04, 0.04, 4.90, 8, [BX - 0.10, 2.60, -1.80], galv);
  for (const y of [1.2, 3.0, 4.6]) box(0.10, 0.05, 0.12, [BX - 0.04, y, -1.80], rustDk);
  cyl(0.008, 0.008, 3.00, 5, [BX - 0.06, 3.40, 1.40], cable, [0.04, 0, 0]);

  // --- tiled hip roof: a four-sided pyramid with tile courses, ridge and hip caps ---------------
  const RH = RIDGE - WTOP;
  {
    const r = Math.max(RX, RZ) * Math.SQRT2 / 2 + 0.02;
    const roof = cyl(0.001, r, RH, 4, [0, WTOP + RH / 2, 0], tile, [0, Math.PI / 4, 0]);
    roof.scale.set(RX / (r * Math.SQRT1_2), 1, RZ / (r * Math.SQRT1_2));
  }
  box(2 * RX, 0.14, 2 * RZ, [0, WTOP + 0.05, 0], timberDk);                                  // eaves board
  box(2 * RX - 0.10, 0.10, 2 * RZ - 0.10, [0, WTOP + 0.16, 0], timber);
  // tile courses on the two street-facing slopes (and a lighter pass on the other two)
  for (let i = 0; i < 6; i++) {
    const t = i / 6, y = WTOP + 0.10 + t * (RH - 0.20);
    const sx = RX * (1 - t) * 2 - 0.16, sz = RZ * (1 - t) * 2 - 0.16;
    const ang = Math.atan2(RH, RZ), angX = Math.atan2(RH, RX);
    box(sx, 0.07, 0.30, [0, y + 0.06, RZ * (1 - t) - 0.14], i % 3 === 1 ? tileMoss : tile, [ang - Math.PI / 2 + Math.PI / 2 - ang + ang, 0, 0]).rotation.x = ang - Math.PI / 2 + Math.PI / 2;
    box(sz, 0.07, 0.30, [RX * (1 - t) - 0.14, y + 0.06, 0], i % 3 === 2 ? tilePale : tile, [0, Math.PI / 2, 0]).rotation.set(0, Math.PI / 2, -(Math.PI / 2 - angX) + (Math.PI / 2 - angX));
    box(sx, 0.06, 0.26, [0, y + 0.05, -(RZ * (1 - t) - 0.14)], i % 3 === 0 ? tileMoss : tile);
    box(sz, 0.06, 0.26, [-(RX * (1 - t) - 0.14), y + 0.05, 0], tile, [0, Math.PI / 2, 0]);
  }
  for (let k = 0; k < 4; k++) {                                                               // hip capping along the four arrises
    const a = k * Math.PI / 2 + Math.PI / 4;
    const len = Math.hypot(Math.hypot(RX, RZ), RH);
    const m = box(0.16, 0.10, len, [Math.cos(a) * Math.hypot(RX, RZ) / 2 * 0.98, WTOP + RH / 2, Math.sin(a) * Math.hypot(RX, RZ) / 2 * 0.98], tilePale);
    m.rotation.set(0, -a + Math.PI / 2, 0);
    m.rotation.x = -Math.atan2(RH, Math.hypot(RX, RZ));
    m.rotateX(0);
  }
  cyl(0.14, 0.14, 0.22, 8, [0, RIDGE - 0.02, 0], tilePale);
  box(0.30, 0.10, 0.30, [0, RIDGE + 0.05, 0], tile);
  for (const [x, z] of [[-1.1, 1.3], [1.4, -0.9], [0.3, 1.9]]) box(0.34, 0.05, 0.22, [x, WTOP + 0.6, z], tileMoss);   // moss patches

  g.userData.lights = lights.map(([x, y, z, color, intensity, range]) => ({ x, y, z, color, intensity, range }));

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  // the lights live in the asset's own space, so they move with the recentre
  for (const L of g.userData.lights) { L.x -= c.x; L.y -= bb.min.y; L.z -= c.z; }
  return g;
}
