// shophouse_d — arm B: profiles. The shell is an extruded footprint ring; the hipped roof is
// four extruded slope plates (two trapezoids, two hip triangles) oriented with a basis matrix,
// each carrying an extruded pantile profile; the red paper lantern is a LatheGeometry; the
// lightboxes and window frames are extruded rounded rings; the awning is an extruded
// corrugation sweeping both faces of the corner; the timber cladding is a grooved extruded
// profile. CORNER unit 5.0 w x 7.0 h x 6.0 d, lit faces +Z (sliding door) and +X (narrow
// window), emissive lightbox on each, lantern at the +X/+Z corner with userData.lights.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const E = (emissive, intensity) => new THREE.MeshStandardMaterial({ color: 0x110f12, emissive, emissiveIntensity: intensity, roughness: 0.35 });
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);
  const ext = (shape, depth, mat, p, r) => put(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 3 }), mat, p, r);
  const rect = (w, h) => { const s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, h / 2); s.lineTo(-w / 2, h / 2); s.lineTo(-w / 2, -h / 2); return s; };
  const ring = (w, h, t) => { const s = rect(w, h); s.holes.push(rect(w - 2 * t, h - 2 * t)); return s; };
  const V = (x, y, z) => new THREE.Vector3(x, y, z);
  // place a flat extruded plate with its local x along u, local y along v, thickness along u x v
  const plate = (shape, depth, mat, origin, u, v) => {
    const m = new THREE.Mesh(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false }), mat);
    const uu = u.clone().normalize(), vv = v.clone().normalize();
    m.setRotationFromMatrix(new THREE.Matrix4().makeBasis(uu, vv, uu.clone().cross(vv).normalize()));
    m.position.copy(origin); g.add(m); return m;
  };

  const plaster = M(0x8a8378, 'plaster', { roughness: 0.95 });
  const plasterStain = M(0x6f6a5f, 'plaster', { roughness: 0.95 });
  const plasterDirty = M(0x5c564d, 'plaster', { roughness: 0.95 });
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
  const tile = M(0x3a3d40, 'tile', { roughness: 0.88, side: THREE.DoubleSide });
  const tileMoss = M(0x4a5a42, 'tile', { roughness: 0.9, side: THREE.DoubleSide });
  const tilePale = M(0x53565a, 'tile', { roughness: 0.88 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });
  const cable = M(0x1b1c1e, 'metal', { roughness: 0.9 });
  const red = M(0xb8302a, 'fabric', { roughness: 0.8 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xc9c2ae, roughness: 0.4, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });
  const signFace = E(0xd8ae70, 2.2);
  const lanternFace = E(0xb8302a, 2.4);
  const lanternCore = E(0xf1d899, 2.6);

  const HX = 2.30, HZ = 2.50, WT = 0.16, Y0 = 0.16, WTOP = 5.60, FZ = HZ - 0.005, FX = HX - 0.005;
  const RX = 2.62, RZ = 2.95, RIDGE = 6.95, RL = 1.60;                    // RL: the short ridge
  const lights = [];

  // --- shell: the footprint ring extruded up, plus floors ------------------------------
  {
    const s = new THREE.Shape();
    s.moveTo(-HX, -HZ); s.lineTo(HX, -HZ); s.lineTo(HX, HZ); s.lineTo(-HX, HZ); s.lineTo(-HX, -HZ);
    const h = new THREE.Path(); h.moveTo(-HX + WT, -HZ + WT); h.lineTo(-HX + WT, HZ - WT); h.lineTo(HX - WT, HZ - WT); h.lineTo(HX - WT, -HZ + WT); h.lineTo(-HX + WT, -HZ + WT);
    s.holes.push(h);
    ext(s, 3.20 - Y0, plaster, [0, Y0, 0], [-Math.PI / 2, 0, 0]);                    // ground floor: plaster
    ext(s, WTOP - 3.20, timberDk, [0, 3.20, 0], [-Math.PI / 2, 0, 0]);               // upper floor: timber carcass
    box(2 * HX - 2 * WT, 0.08, 2 * HZ - 2 * WT, [0, 3.20, 0], timberDk);
    box(2 * HX - 2 * WT, 0.06, 2 * HZ - 2 * WT, [0, Y0 + 0.03, 0], stone);
    box(2 * HX - 2 * WT - 0.1, 2.9, 0.06, [0, 1.65, -HZ + WT + 0.06], plasterDirty);
  }
  box(2 * HX + 0.12, Y0, 2 * HZ + 0.12, [0, Y0 / 2, 0], stone);
  box(2 * HX + 0.14, 0.06, 2 * HZ + 0.14, [0, 0.03, 0], dark);

  // --- openings on the two lit faces ------------------------------------------------------
  const DR_X0 = -0.60, DR_X1 = 1.30, DR_TOP = 2.15;
  const WN_Z0 = -0.30, WN_Z1 = 0.80, WN_Y0 = 1.15, WN_Y1 = 2.10;
  box(DR_X1 - DR_X0, DR_TOP - Y0, WT + 0.04, [(DR_X0 + DR_X1) / 2, (DR_TOP + Y0) / 2, FZ - WT / 2], dark);
  box(WT + 0.04, WN_Y1 - WN_Y0, WN_Z1 - WN_Z0, [FX - WT / 2, (WN_Y0 + WN_Y1) / 2, (WN_Z0 + WN_Z1) / 2], dark);
  box(2 * HX, 0.34, 0.02, [0, 0.38, FZ], plasterDirty);
  box(0.02, 0.34, 2 * HZ, [FX, 0.38, 0], plasterDirty);
  box(0.80, 0.70, 0.02, [-1.70, 2.30, FZ], plasterDirty);
  box(0.02, 0.90, 0.60, [FX, 2.40, -1.60], plasterDirty);
  // sliding door: an extruded frame ring with two glazed leaves
  ext(ring(DR_X1 - DR_X0 + 0.16, DR_TOP - Y0 + 0.14, 0.09), 0.10, timberDk, [(DR_X0 + DR_X1) / 2, Y0 + (DR_TOP - Y0) / 2, FZ]);
  for (let i = 0; i < 2; i++) {
    const cx = DR_X0 + 0.48 + i * 0.94, off = i ? 0.06 : 0.0;
    ext(ring(0.92, DR_TOP - Y0 - 0.06, 0.07), 0.05, timber, [cx, Y0 + (DR_TOP - Y0) / 2, FZ + 0.03 + off]);
    put(new THREE.BoxGeometry(0.80, DR_TOP - Y0 - 0.30, 0.02), glass, [cx, Y0 + (DR_TOP - Y0) / 2 + 0.06, FZ + 0.055 + off]);
    box(0.84, 0.06, 0.03, [cx, Y0 + 0.24, FZ + 0.07 + off], timberLit);
    box(0.04, 0.16, 0.03, [cx + (i ? -0.40 : 0.40), 1.05, FZ + 0.08 + off], steel);
  }
  box(DR_X1 - DR_X0 + 0.22, 0.08, 0.26, [(DR_X0 + DR_X1) / 2, Y0 + 0.02, FZ + 0.14], stone);
  box(DR_X1 - DR_X0 + 0.22, 0.05, 0.28, [(DR_X0 + DR_X1) / 2, 0.03, FZ + 0.14], dark);
  // narrow window on +X
  ext(ring(WN_Y1 - WN_Y0 + 0.14, WN_Z1 - WN_Z0 + 0.14, 0.08), 0.09, timberDk, [FX, (WN_Y0 + WN_Y1) / 2, (WN_Z0 + WN_Z1) / 2], [0, Math.PI / 2, Math.PI / 2]);
  put(new THREE.BoxGeometry(0.02, WN_Y1 - WN_Y0, WN_Z1 - WN_Z0), glass, [FX + 0.06, (WN_Y0 + WN_Y1) / 2, (WN_Z0 + WN_Z1) / 2]);
  for (let i = 0; i < 5; i++) cyl(0.012, 0.012, WN_Y1 - WN_Y0 + 0.04, 6, [FX + 0.09, (WN_Y0 + WN_Y1) / 2, WN_Z0 + 0.1 + i * 0.23], rustDk);
  box(0.22, 0.07, WN_Z1 - WN_Z0 + 0.18, [FX + 0.07, WN_Y0 - 0.06, (WN_Z0 + WN_Z1) / 2], timberLit);

  // --- the awning: a corrugated profile extruded along each face, mitred at the corner ------
  const AY = 3.00, AD = 0.62, AA = 0.16;
  {
    const s = new THREE.Shape(); const pitch = 0.075, n = Math.round(AD / pitch);
    s.moveTo(0, 0);
    for (let i = 1; i <= n; i++) { s.lineTo((i - 0.5) * pitch, 0.024); s.lineTo(i * pitch, 0); }
    s.lineTo(n * pitch, -0.03); s.lineTo(0, -0.03); s.lineTo(0, 0);
    // +Z run: the profile climbs along -z (toward the wall), so extrude across x
    // profile x runs down the awning's own slope, profile y is the corrugation, and the
    // sweep is across the face: X x Y then points along -x (+Z run) and +z (+X run)
    plate(s, 2 * HX + 0.30, tinRust, V(HX + 0.15, AY + 0.10, HZ),
      V(0, -Math.sin(AA), Math.cos(AA)), V(0, Math.cos(AA), Math.sin(AA)));
    // +X run
    plate(s, 2 * HZ + 0.30, tin, V(HX, AY + 0.10, -HZ - 0.15),
      V(Math.cos(AA), -Math.sin(AA), 0), V(Math.sin(AA), Math.cos(AA), 0));
    box(2 * HX + 0.30, 0.10, 0.05, [0, AY - 0.01, HZ + AD - 0.12], timberDk, [AA, 0, 0]);
    box(0.05, 0.10, 2 * HZ + 0.30, [HX + AD - 0.12, AY - 0.01, 0], timberDk, [0, 0, -AA]);
    box(0.52, 0.05, 0.52, [HX + 0.14, AY + 0.16, HZ + 0.14], tinPale, [AA * 0.7, Math.PI / 4, -AA * 0.7]);
    cyl(0.05, 0.05, AY - Y0, 8, [HX + 0.30, Y0 + (AY - Y0) / 2, HZ + 0.30], timber);
    box(0.10, 0.10, 0.10, [HX + 0.30, Y0 + 0.03, HZ + 0.30], dark);
    for (const x of [-1.60, 1.60]) { box(0.05, 0.05, 0.72, [x, AY - 0.20, HZ + 0.22], rustDk, [0.72, 0, 0]); box(0.08, 0.14, 0.08, [x, AY - 0.44, HZ + 0.05], rust); }
    for (const z of [-1.60, 1.60]) { box(0.72, 0.05, 0.05, [HX + 0.22, AY - 0.20, z], rustDk, [0, 0, -0.72]); box(0.14, 0.08, 0.08, [HX + 0.05, AY - 0.44, z], rust); }
  }

  // --- the two emissive lightboxes -----------------------------------------------------------
  {
    const y = 3.72, h = 0.56, d = 0.18;
    ext(ring(2.90 + 0.08, h + 0.08, 0.06), d, timberDk, [-0.25, y, HZ + 0.02]);
    put(new THREE.BoxGeometry(2.90, h, 0.04), signFace, [-0.25, y, HZ + 0.02 + d - 0.01]);
    box(3.02, 0.06, d + 0.06, [-0.25, y + h / 2 + 0.06, HZ + 0.10], rustDk);
    box(3.02, 0.06, d + 0.06, [-0.25, y - h / 2 - 0.06, HZ + 0.10], rust);
    for (const x of [-1.45, 0.95]) box(0.05, 0.24, 0.16, [x, y + 0.40, HZ + 0.04], rustDk);
    lights.push([-0.25, y, HZ + 0.55, 0xd8ae70, 2.4, 7.5]);
    ext(ring(h + 0.08, 3.00 + 0.08, 0.06), d, timberDk, [HX + 0.02, y, -0.20], [0, Math.PI / 2, Math.PI / 2]);
    put(new THREE.BoxGeometry(0.04, h, 3.00), signFace, [HX + 0.02 + d - 0.01, y, -0.20]);
    box(d + 0.06, 0.06, 3.12, [HX + 0.10, y + h / 2 + 0.06, -0.20], rustDk);
    box(d + 0.06, 0.06, 3.12, [HX + 0.10, y - h / 2 - 0.06, -0.20], rust);
    for (const z of [-1.45, 0.95]) box(0.16, 0.24, 0.05, [HX + 0.04, y + 0.40, z], rustDk);
    lights.push([HX + 0.55, y, -0.20, 0xd8ae70, 2.4, 7.5]);
  }

  // --- the red paper lantern: one lathe profile, with ribs and caps ----------------------------
  {
    const LX = HX + 0.30, LZ = HZ + 0.30, LY = 3.20;
    box(0.06, 0.06, 0.52, [LX, LY + 0.94, LZ - 0.20], rustDk, [0, -Math.PI / 4, 0]);
    cyl(0.012, 0.012, 0.24, 5, [LX, LY + 0.80, LZ], cable);
    const prof = [[0.0, 0.0], [0.075, 0.0], [0.075, 0.04], [0.14, 0.07], [0.20, 0.14], [0.225, 0.24],
      [0.225, 0.34], [0.20, 0.44], [0.14, 0.51], [0.085, 0.54], [0.085, 0.60], [0.0, 0.60]];
    put(new THREE.LatheGeometry(prof.map((q) => new THREE.Vector2(q[0], q[1])), 14), lanternFace, [LX, LY, LZ]);
    cyl(0.185, 0.185, 0.28, 10, [LX, LY + 0.30, LZ], lanternCore);
    for (let i = 0; i < 4; i++) put(new THREE.TorusGeometry(0.21, 0.008, 4, 14), red, [LX, LY + 0.16 + i * 0.10, LZ], [Math.PI / 2, 0, 0]);
    cyl(0.085, 0.085, 0.05, 10, [LX, LY + 0.59, LZ], timberDk);
    cyl(0.075, 0.075, 0.05, 10, [LX, LY + 0.01, LZ], timberDk);
    cyl(0.012, 0.012, 0.12, 5, [LX, LY - 0.06, LZ], red);
    lights.push([LX, LY + 0.30, LZ, 0xd8552a, 2.8, 6.0]);
  }

  // --- upper floor cladding: a grooved plank profile extruded along each face ------------------
  {
    const cl = (len, n) => { const s = new THREE.Shape(); const bw = len / n;
      s.moveTo(-len / 2, 0); s.lineTo(len / 2, 0);
      for (let i = 0; i < n; i++) { const x0 = len / 2 - i * bw; s.lineTo(x0 - 0.012, 0.045); s.lineTo(x0 - bw + 0.012, 0.045); s.lineTo(x0 - bw, 0.03); }
      s.lineTo(-len / 2, 0); return s; };
    plate(cl(2 * HX, 13), WTOP - 3.24, timberGrey, V(0, WTOP, FZ), V(1, 0, 0), V(0, 0, 1));
    plate(cl(2 * HZ, 14), WTOP - 3.24, timber, V(FX, WTOP, 0), V(0, 0, -1), V(1, 0, 0));
    for (const y of [3.90, 4.70, 5.40]) { box(2 * HX, 0.05, 0.06, [0, y, FZ + 0.06], timberDk); box(0.06, 0.05, 2 * HZ, [FX + 0.06, y, 0], timberDk); }
    box(2 * HX, WTOP - 3.20, 0.02, [0, (WTOP + 3.20) / 2, -HZ - 0.01], plasterStain);
    box(0.02, WTOP - 3.20, 2 * HZ, [-HX - 0.01, (WTOP + 3.20) / 2, 0], plaster);
  }
  // upper windows behind the balcony rails
  ext(ring(1.70, 1.15, 0.09), 0.10, timberDk, [-1.10, 4.62, FZ + 0.02]);
  put(new THREE.BoxGeometry(1.56, 1.02, 0.02), glass, [-1.10, 4.62, FZ + 0.07]);
  box(0.05, 1.02, 0.04, [-1.10, 4.62, FZ + 0.09], timber);
  ext(ring(1.15, 1.70, 0.09), 0.10, timberDk, [FX + 0.02, 4.62, 0.90], [0, Math.PI / 2, Math.PI / 2]);
  put(new THREE.BoxGeometry(0.02, 1.02, 1.56), glass, [FX + 0.07, 4.62, 0.90]);
  box(0.04, 1.02, 0.05, [FX + 0.09, 4.62, 0.90], timber);
  // balcony rails
  {
    const y0 = 4.00, h = 0.62;
    box(2 * HX - 0.20, 0.10, 0.34, [0, y0 - 0.05, HZ + 0.20], timber);
    box(2 * HX - 0.20, 0.08, 0.06, [0, y0 + h, HZ + 0.34], timberLit);
    box(2 * HX - 0.20, 0.05, 0.05, [0, y0 + h - 0.26, HZ + 0.34], timber);
    for (let i = 0; i < 13; i++) box(0.05, h, 0.05, [-(HX - 0.14) + i * ((2 * HX - 0.28) / 12), y0 + h / 2, HZ + 0.34], timberDk);
    box(0.34, 0.10, 2 * HZ - 0.20, [HX + 0.20, y0 - 0.05, 0], timber);
    box(0.06, 0.08, 2 * HZ - 0.20, [HX + 0.34, y0 + h, 0], timberLit);
    box(0.05, 0.05, 2 * HZ - 0.20, [HX + 0.34, y0 + h - 0.26, 0], timber);
    for (let i = 0; i < 14; i++) box(0.05, h, 0.05, [HX + 0.34, y0 + h / 2, -(HZ - 0.14) + i * ((2 * HZ - 0.28) / 13)], timberDk);
  }

  // --- the plain faces ---------------------------------------------------------------------------
  const BZ = -HZ - 0.005, BX = -HX - 0.005;
  ext(ring(1.02, 2.10, 0.06), 0.06, timberDk, [0.70, Y0 + 1.05, BZ - 0.06]);
  box(0.90, 1.98, 0.05, [0.70, Y0 + 1.05, BZ - 0.04], timber);
  for (let i = 0; i < 4; i++) box(0.20, 1.94, 0.02, [0.39 + i * 0.21, Y0 + 1.05, BZ - 0.07], i % 2 ? timberLit : timber);
  box(0.05, 0.16, 0.03, [1.12, 1.05, BZ - 0.09], galv);
  box(0.90, 0.22, 0.02, [0.70, Y0 + 0.16, BZ - 0.07], timberDk);
  box(1.60, 1.10, 0.02, [-1.20, 3.10, BZ], plasterDirty);
  box(2 * HX, 0.30, 0.02, [0, 0.34, BZ], plasterDirty);
  cyl(0.055, 0.055, 5.10, 8, [-1.90, 2.70, BZ - 0.10], galv);
  for (const y of [1.0, 2.5, 4.0, 5.2]) box(0.10, 0.05, 0.14, [-1.90, y, BZ - 0.04], rustDk);
  box(0.22, 0.32, 0.16, [1.70, 2.20, BZ - 0.10], steel);
  box(0.02, 1.30, 1.00, [BX, 2.90, 0.9], plasterDirty);
  ext(ring(0.44, 0.34, 0.04), 0.08, steel, [BX - 0.04, 4.10, 0.50], [0, Math.PI / 2, 0]);
  for (let k = 0; k < 4; k++) { const bl = box(0.05, 0.02, 0.38, [BX - 0.07, 3.99 + k * 0.06, 0.50], galv); bl.rotation.x = 0.5; }
  cyl(0.04, 0.04, 4.90, 8, [BX - 0.10, 2.60, -1.80], galv);
  for (const y of [1.2, 3.0, 4.6]) box(0.10, 0.05, 0.12, [BX - 0.04, y, -1.80], rustDk);
  cyl(0.008, 0.008, 3.00, 5, [BX - 0.06, 3.40, 1.40], cable, [0.04, 0, 0]);

  // --- hipped tiled roof: four extruded slope plates, each with a pantile profile ----------------
  {
    const RH = RIDGE - WTOP;
    const angZ = Math.atan2(RH, RZ), angX = Math.atan2(RH, RX - RL / 2);
    const SZ = Math.hypot(RZ, RH), SX = Math.hypot(RX - RL / 2, RH);
    const trap = (eaveHalf, ridgeHalf, len) => { const s = new THREE.Shape();
      s.moveTo(-eaveHalf, 0); s.lineTo(eaveHalf, 0); s.lineTo(ridgeHalf, len); s.lineTo(-ridgeHalf, len); s.lineTo(-eaveHalf, 0); return s; };
    const tri = (half, len) => { const s = new THREE.Shape(); s.moveTo(-half, 0); s.lineTo(half, 0); s.lineTo(0, len); s.lineTo(-half, 0); return s; };
    // pantile courses: a wavy strip laid across each slope
    const course = (half, wave) => { const s = new THREE.Shape(); const pitch = 0.26, n = Math.max(2, Math.round(2 * half / pitch));
      s.moveTo(-half, 0);
      for (let i = 1; i <= n; i++) { const x = -half + i * pitch; s.lineTo(x - pitch / 2, wave); s.lineTo(Math.min(x, half), 0); }
      s.lineTo(half, -0.05); s.lineTo(-half, -0.05); s.lineTo(-half, 0); return s; };
    const slopes = [
      { u: V(1, 0, 0), v: V(0, Math.sin(angZ), -Math.cos(angZ)), o: V(0, WTOP, RZ), sh: trap(RX, RL / 2, SZ), len: SZ, half: RX, m: tile },
      { u: V(-1, 0, 0), v: V(0, Math.sin(angZ), Math.cos(angZ)), o: V(0, WTOP, -RZ), sh: trap(RX, RL / 2, SZ), len: SZ, half: RX, m: tileMoss },
      { u: V(0, 0, -1), v: V(-Math.cos(angX), Math.sin(angX), 0), o: V(RX, WTOP, 0), sh: tri(RZ, SX), len: SX, half: RZ, m: tile },
      { u: V(0, 0, 1), v: V(Math.cos(angX), Math.sin(angX), 0), o: V(-RX, WTOP, 0), sh: tri(RZ, SX), len: SX, half: RZ, m: tileMoss },
    ];
    for (const s of slopes) {
      plate(s.sh, 0.07, s.m, s.o, s.u, s.v);
      const n = Math.max(3, Math.round(s.len / 0.42));
      for (let i = 0; i < n; i++) {
        const t = (i + 0.45) / n, along = t * s.len;
        const isTri = s.sh === slopes[2].sh || s.sh === slopes[3].sh;
        const halfHere = isTri ? s.half * (1 - t) - 0.06 : s.half - t * (s.half - RL / 2) - 0.06;
        if (halfHere < 0.12) continue;
        const nrm = s.u.clone().cross(s.v).normalize();
        const o = s.o.clone().addScaledVector(s.v.clone().normalize(), along + 0.21).addScaledVector(nrm, 0.035);
        plate(course(halfHere, 0.045), 0.21, i % 3 === 1 ? tilePale : s.m, o, s.u.clone(), nrm);
      }
    }
    box(2 * RX, 0.14, 2 * RZ, [0, WTOP + 0.05, 0], timberDk);                       // eaves board
    box(2 * RX - 0.10, 0.10, 2 * RZ - 0.10, [0, WTOP + 0.16, 0], timber);
    box(RL + 0.24, 0.16, 0.30, [0, RIDGE - 0.04, 0], tilePale);                      // ridge capping
    box(RL + 0.30, 0.08, 0.16, [0, RIDGE + 0.06, 0], tile);
    const apexL = V(-RL / 2, RIDGE - 0.08, 0), apexR = V(RL / 2, RIDGE - 0.08, 0);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {                            // hip caps
      const a = V(sx * (RX - 0.04), WTOP + 0.14, sz * (RZ - 0.04)), b = sx > 0 ? apexR : apexL;
      const d = b.clone().sub(a), m = box(0.18, d.length(), 0.18, [0, 0, 0], tilePale);
      m.position.copy(a).add(b).multiplyScalar(0.5);
      m.quaternion.setFromUnitVectors(V(0, 1, 0), d.clone().normalize());
    }
    for (const [x, z] of [[-1.0, 1.1], [1.2, -0.8], [0.3, 1.6]]) box(0.34, 0.05, 0.22, [x, WTOP + 0.62, z], tileMoss);
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
