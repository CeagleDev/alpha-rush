// shophouse_a — arm B: profiles.
// Walls are extruded Shapes (the glass front and the upper window are real holes), the
// board-and-batten cladding is a ridged profile extruded up the wall on the sides and
// back, the tiled roof is one stepped profile extruded across (its caps are the gables),
// the awning is a corrugated profile extrude, lanterns are ribbed lathes, the lightbox
// and AC are rounded-rect extrudes, the drainpipe is a tube along a curve.
export default function (THREE) {
  const g = new THREE.Group();
  const lights = [];
  const mat = (hex, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.88, metalness: 0, ...o });
    if (name) m.name = name;
    return m;
  };
  const emis = (hex, i = 2.2, o = {}) => new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: hex, emissiveIntensity: i, roughness: 0.35, ...o });
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const n = new THREE.Mesh(geo, m); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n;
  };
  const box = (w, h, d, x, y, z, m, rx, ry, rz) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, rx, ry, rz);
  const cyl = (r0, r1, h, seg, x, y, z, m, rx, ry, rz) => add(new THREE.CylinderGeometry(r0, r1, h, seg), m, x, y, z, rx, ry, rz);
  const rect = (sh, x0, y0, w, h) => { sh.moveTo(x0, y0); sh.lineTo(x0 + w, y0); sh.lineTo(x0 + w, y0 + h); sh.lineTo(x0, y0 + h); sh.closePath(); return sh; };
  const hole = (x0, y0, w, h) => { const p = new THREE.Path(); p.moveTo(x0, y0); p.lineTo(x0 + w, y0); p.lineTo(x0 + w, y0 + h); p.lineTo(x0, y0 + h); p.closePath(); return p; };
  const roundRect = (w, h, r) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; };
  const extrude = (sh, depth) => new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 4 });

  const black = mat(0x110f12, 'stone', { roughness: 0.95 });
  const plankDark = mat(0x37201b, 'timber');
  const plank = mat(0x4f2d21, 'timber');
  const plankLit = mat(0x6c4028, 'timber');
  const plankFaded = mat(0x8b6141, 'timber');
  const tin = mat(0x8b6141, 'metal', { metalness: 0.3, roughness: 0.8, side: THREE.DoubleSide });
  const tinRust = mat(0x37201b, 'metal', { metalness: 0.3, roughness: 0.9, side: THREE.DoubleSide });
  const steel = mat(0x6f6a62, 'metal', { metalness: 0.3, roughness: 0.75 });
  const steelPale = mat(0x9a9588, 'metal', { metalness: 0.3, roughness: 0.7 });
  const galv = mat(0x8a8378, 'metal', { metalness: 0.3, roughness: 0.7 });
  const tile = mat(0x2e2622, 'tile', { roughness: 0.9 });
  const tileWorn = mat(0x3d3330, 'tile', { roughness: 0.9 });
  const concrete = mat(0x4a4a4c, 'stone');
  const red = mat(0xb8302a, 'fabric', { roughness: 0.9, side: THREE.DoubleSide });
  const cream = mat(0xeee2c8, 'fabric', { roughness: 0.9, side: THREE.DoubleSide });
  const redPaint = mat(0xb8302a, 'metal', { metalness: 0.3, roughness: 0.8 });
  const ringMat = mat(0x231718, 'metal', { metalness: 0.3 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xc9b489, roughness: 0.3, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });
  const eInterior = emis(0xd8ae70, 1.6);
  const eSign = emis(0xd8ae70, 2.4);
  const eWindow = emis(0xe5b055, 1.8);
  const eLantern = emis(0xb8302a, 2.6, { side: THREE.DoubleSide });

  const HX = 2.4, ZF = 2.3, ZB = -2.7, W = 2 * HX, DEP = ZF - ZB;

  // --- plinth ---------------------------------------------------------------------------
  box(W + 0.06, 0.08, DEP + 0.06, 0, 0.04, (ZF + ZB) / 2, black);
  box(3.6, 0.08, 0.5, 0, 0.04, ZF + 0.25, concrete);
  box(0.6, 0.06, 0.3, -1.9, 0.11, ZF + 0.2, concrete);

  // --- walls as extruded shapes ----------------------------------------------------------
  // front: one shape, the ground-floor glass opening and the upper window are holes
  {
    const sh = rect(new THREE.Shape(), -HX, 0.08, W, 5.92);
    sh.holes.push(hole(-HX + 0.16, 0.3, W - 0.32, 2.7));
    sh.holes.push(hole(-1.1, 4.35, 2.2, 1.3));
    add(extrude(sh, 0.2), plank, 0, 0, ZF - 0.2);
  }
  // back: door hole
  {
    const sh = rect(new THREE.Shape(), -HX, 0.08, W, 5.92);
    sh.holes.push(hole(-1.75, 0.1, 0.9, 2.1));
    add(extrude(sh, 0.2), plank, 0, 0, ZB);
  }
  // sides: drawn in (z, y), extruded along -x, one small window hole each
  for (const s of [1, -1]) {
    const sh = rect(new THREE.Shape(), ZB, 0.08, DEP, 5.92);
    sh.holes.push(hole(s > 0 ? -1.9 : 0.3, 4.4, 0.6, 0.7));
    add(extrude(sh, 0.2), plank, s > 0 ? HX : -HX + 0.2, 0, 0, 0, -Math.PI / 2, 0);
  }
  // floors and the solid back-of-house so the cavity is only the shop
  box(W - 0.4, 0.2, DEP - 0.4, 0, 3.2, (ZF + ZB) / 2, plankLit);
  box(W - 0.4, 3.0, 0.9 - ZB - 0.2, 0, 1.6, (0.9 + ZB) / 2, plank);
  box(W - 0.4, 0.12, ZF - 0.9, 0, 0.14, (ZF + 0.9) / 2, plankLit);
  box(W - 0.4, 2.7, 0.04, 0, 1.55, 0.93, eInterior);
  lights.push({ x: 0, y: 1.9, z: 1.6, color: 0xd8ae70, intensity: 1.0, range: 4.0 });
  // interior fit-out
  box(2.6, 0.9, 0.5, 0.4, 0.65, 1.45, plank);
  box(2.7, 0.06, 0.6, 0.4, 1.13, 1.45, plankLit);
  for (const x of [-0.5, 0.2, 0.9]) { cyl(0.15, 0.15, 0.05, 8, x, 0.68, 1.95, plankFaded); cyl(0.03, 0.03, 0.5, 6, x, 0.42, 1.95, steel); }
  for (const y of [2.0, 2.4]) box(2.4, 0.04, 0.25, 0.3, y, 1.06, plankLit);
  for (let i = 0; i < 6; i++) box(0.08, 0.22, 0.08, -0.7 + i * 0.4, 2.13, 1.06, i % 2 ? red : cream);
  box(0.7, 1.4, 0.6, -1.8, 0.9, 1.35, steelPale);

  // --- glass front in its hole -------------------------------------------------------------
  box(W - 0.32, 0.12, 0.2, 0, 0.36, ZF - 0.1, plankDark);           // sill
  box(W - 0.32, 0.14, 0.2, 0, 2.93, ZF - 0.1, plankDark);           // head
  box(W - 0.32, 2.4, 0.02, 0, 1.65, ZF - 0.04, glass);
  for (const x of [-1.25, -0.42, 0.42, 1.25]) box(0.06, 2.4, 0.08, x, 1.65, ZF - 0.03, steelPale);
  for (const y of [1.05, 2.25]) box(W - 0.32, 0.05, 0.08, 0, y, ZF - 0.03, steelPale);
  box(0.05, 0.3, 0.04, 0.34, 1.3, ZF + 0.02, steel);
  box(0.7, 0.9, 0.3, -1.9, 0.53, ZF + 0.3, steelPale);
  box(0.7, 0.9, 0.3, -1.9, 0.5, ZF + 0.3, mat(0xf8e845, 'plaster'));

  // --- noren ------------------------------------------------------------------------------
  cyl(0.015, 0.015, 3.6, 6, 0, 2.6, ZF + 0.3, steel, 0, 0, Math.PI / 2);
  for (const cx of [-1.15, 0, 1.15]) for (let i = 0; i < 10; i++) {
    box(0.09, 0.85, 0.02, cx - 0.45 + 0.045 + i * 0.09, 2.18, ZF + 0.3 + (i % 2 ? 0.01 : -0.01), i % 2 ? cream : red);
  }

  // --- awning: corrugated profile extruded forward ---------------------------------------
  {
    const a = new THREE.Group(); a.position.set(0, 3.0, ZF); a.rotation.x = 0.2; g.add(a);
    const sh = new THREE.Shape(); sh.moveTo(-2.5, 0);
    for (let i = 0; i <= 66; i++) sh.lineTo(-2.5 + i * (5.0 / 66), i % 2 ? 0.05 : 0.02);
    sh.lineTo(2.5, 0); sh.closePath();
    const m = new THREE.Mesh(extrude(sh, 0.78), tin); a.add(m);
    const lip = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.08, 0.04), tinRust); lip.position.set(0, 0.0, 0.78); a.add(lip);
    const rust = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.02, 0.6), tinRust); rust.position.set(1.4, 0.055, 0.35); a.add(rust);
    const rust2 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.02, 0.4), tinRust); rust2.position.set(-1.9, 0.055, 0.5); a.add(rust2);
  }
  for (const x of [-2.1, 0, 2.1]) cyl(0.02, 0.02, 0.83, 6, x, 2.625, ZF + 0.36, steel, 1.0, 0, 0);

  // --- lanterns: ribbed lathes ----------------------------------------------------------
  {
    const pts = [];
    for (let i = 0; i <= 20; i++) {
      const t = i / 20, r = 0.225 * Math.pow(Math.sin(Math.PI * t), 0.55) * (1 + 0.035 * Math.cos(2 * Math.PI * 8 * t));
      pts.push(new THREE.Vector2(Math.max(r, 0.08), -0.19 + 0.38 * t));
    }
    const lathe = new THREE.LatheGeometry(pts, 10);
    for (const x of [-1.5, -0.5, 0.5, 1.5]) {
      const y = 2.5, z = ZF + 0.55;
      add(lathe, eLantern, x, y, z);
      cyl(0.09, 0.09, 0.05, 8, x, y + 0.2, z, ringMat);
      cyl(0.09, 0.09, 0.05, 8, x, y - 0.2, z, ringMat);
      cyl(0.006, 0.006, 0.22, 4, x, y + 0.32, z, steel);
      lights.push({ x, y, z, color: 0xe86a3a, intensity: 0.8, range: 3.5 });
    }
  }

  // --- lightbox: rounded-rect extrude with an emissive face and a red band -----------------
  add(extrude(roundRect(3.8, 0.95, 0.08), 0.22), steel, 0, 3.78, ZF);
  box(3.7, 0.72, 0.03, 0, 3.86, ZF + 0.23, eSign);
  box(3.7, 0.12, 0.035, 0, 3.4, ZF + 0.23, redPaint);
  box(0.5, 0.95, 0.01, -1.45, 3.78, ZF + 0.23, tinRust);
  lights.push({ x: 0, y: 3.85, z: ZF + 0.6, color: 0xd8ae70, intensity: 1.2, range: 4.0 });

  // --- upper window in its hole, balcony, AC --------------------------------------------
  box(2.2, 1.3, 0.02, 0, 5.0, ZF - 0.17, eWindow);
  box(2.2, 1.3, 0.02, 0, 5.0, ZF - 0.05, glass);
  for (const x of [-1.13, 1.13]) box(0.06, 1.42, 0.08, x, 5.0, ZF - 0.02, steelPale);
  for (const y of [4.32, 5.68]) box(2.32, 0.06, 0.08, 0, y, ZF - 0.02, steelPale);
  box(0.04, 1.3, 0.05, 0, 5.0, ZF - 0.02, steelPale);
  lights.push({ x: 0, y: 5.0, z: ZF + 0.4, color: 0xe5b055, intensity: 0.5, range: 2.5 });
  box(2.7, 0.08, 0.42, 0, 4.26, ZF + 0.21, plankDark);
  for (const x of [-1.32, -0.66, 0, 0.66, 1.32]) cyl(0.018, 0.018, 0.95, 6, x, 4.75, ZF + 0.4, steel);
  cyl(0.02, 0.02, 2.7, 6, 0, 5.22, ZF + 0.4, steel, 0, 0, Math.PI / 2);
  cyl(0.015, 0.015, 2.7, 6, 0, 4.75, ZF + 0.4, steel, 0, 0, Math.PI / 2);
  box(0.28, 0.42, 0.03, -0.9, 5.0, ZF + 0.44, mat(0x3a4a6a, 'fabric', { side: THREE.DoubleSide }));
  box(0.25, 0.5, 0.03, -0.55, 4.96, ZF + 0.44, cream);
  box(0.3, 0.38, 0.03, 0.7, 5.02, ZF + 0.44, plankFaded);
  add(extrude(roundRect(0.75, 0.55, 0.05), 0.3), steelPale, 1.85, 4.95, ZF);
  add(new THREE.TorusGeometry(0.17, 0.02, 5, 16), steel, 1.72, 4.95, ZF + 0.31);
  box(0.16, 0.4, 0.01, 2.12, 4.95, ZF + 0.31, steel);
  for (const x of [1.55, 2.15]) box(0.04, 0.04, 0.34, x, 4.65, ZF + 0.17, steel);
  box(0.5, 0.5, 0.015, 1.85, 4.4, ZF + 0.01, tinRust);
  box(0.28, 0.4, 0.12, -2.2, 3.55, ZF + 0.06, steel);
  // battens on the front wall beside the window
  for (let x = -2.25; x <= 2.26; x += 0.3) if (Math.abs(x) > 1.2) box(0.035, 2.7, 0.03, x, 4.6, ZF + 0.01, plankDark);

  // --- ridged board-and-batten skins on both sides and the back ---------------------------
  const skin = (L, H) => {
    const sh = new THREE.Shape(); sh.moveTo(0, 0);
    const n = Math.round(L / 0.3), p = L / n;
    for (let i = 0; i < n; i++) {
      const x0 = i * p;
      sh.lineTo(x0, -0.02); sh.lineTo(x0 + p - 0.05, -0.02); sh.lineTo(x0 + p - 0.05, -0.05); sh.lineTo(x0 + p - 0.01, -0.05); sh.lineTo(x0 + p - 0.01, -0.02);
    }
    sh.lineTo(L, -0.02); sh.lineTo(L, 0); sh.closePath();
    const geo = extrude(sh, H); geo.rotateX(-Math.PI / 2); return geo;
  };
  { const geo = skin(DEP, 5.8); geo.rotateY(Math.PI / 2); add(geo, plank, HX, 0.1, ZF); }
  { const geo = skin(DEP, 5.8); geo.rotateY(-Math.PI / 2); add(geo, plank, -HX, 0.1, ZB); }
  { const geo = skin(W, 5.8); geo.rotateY(Math.PI); add(geo, plank, HX, 0.1, ZB); }

  // --- side fittings ---------------------------------------------------------------------
  // left
  box(0.02, 1.7, 1.1, -HX - 0.06, 1.9, -1.8, plankFaded);
  cyl(0.04, 0.04, 5.6, 8, -HX - 0.12, 3.0, -0.9, galv);
  for (const y of [1.2, 3.4, 5.4]) box(0.14, 0.05, 0.12, -HX - 0.09, y, -0.9, steel);
  box(0.08, 0.8, 0.7, -HX - 0.07, 4.75, 0.6, steelPale);
  box(0.02, 0.7, 0.6, -HX - 0.12, 4.75, 0.6, glass);
  for (const z of [0.4, 0.6, 0.8]) box(0.03, 0.75, 0.02, -HX - 0.13, 4.75, z, steel);
  box(0.25, 0.3, 0.3, -HX - 0.15, 2.7, 1.3, galv);
  box(0.02, 0.5, 0.3, -HX - 0.06, 2.3, 1.3, tinRust);
  box(0.2, 0.4, 0.3, -HX - 0.12, 1.2, 0.3, steel);
  cyl(0.02, 0.02, 1.0, 6, -HX - 0.14, 0.6, 0.3, galv);
  box(0.02, 0.4, 2.0, -HX - 0.06, 0.3, -1.3, tinRust);
  // right
  box(0.3, 0.55, 0.75, HX + 0.2, 4.7, 0.3, steelPale);
  add(new THREE.TorusGeometry(0.17, 0.02, 5, 16), steel, HX + 0.36, 4.7, 0.42, 0, Math.PI / 2, 0);
  for (const z of [0.0, 0.6]) box(0.34, 0.04, 0.04, HX + 0.2, 4.4, z, steel);
  box(0.015, 0.5, 0.6, HX + 0.06, 4.1, 0.3, tinRust);
  box(0.3, 0.5, 0.65, HX + 0.2, 2.5, -1.5, steelPale);
  add(new THREE.TorusGeometry(0.15, 0.02, 5, 16), steel, HX + 0.36, 2.5, -1.4, 0, Math.PI / 2, 0);
  for (const z of [-1.8, -1.2]) box(0.34, 0.04, 0.04, HX + 0.2, 2.2, z, steel);
  cyl(0.025, 0.025, 4.6, 6, HX + 0.09, 3.5, -0.3, galv, Math.PI / 2, 0, 0);
  cyl(0.025, 0.025, 3.0, 6, HX + 0.09, 2.0, -2.4, galv);
  box(0.12, 0.35, 0.28, HX + 0.1, 1.3, 1.6, steel);
  box(0.08, 0.8, 0.7, HX + 0.07, 4.75, -1.6, steelPale);
  box(0.02, 0.7, 0.6, HX + 0.12, 4.75, -1.6, glass);
  box(0.02, 1.4, 0.9, HX + 0.06, 1.4, 1.2, plankFaded);
  // back
  box(1.0, 2.2, 0.08, -1.3, 1.18, ZB - 0.07, plankDark);
  box(0.86, 2.06, 0.05, -1.3, 1.18, ZB - 0.1, plank);
  box(0.06, 0.2, 0.05, -1.65, 1.1, ZB - 0.14, steel);
  box(0.6, 0.3, 0.3, -1.3, 2.55, ZB - 0.2, tin);
  cyl(0.13, 0.13, 5.0, 8, 1.5, 2.9, ZB - 0.22, galv);
  add(new THREE.TorusGeometry(0.2, 0.13, 6, 8, Math.PI / 2), galv, 1.5, 5.4, ZB - 0.04, Math.PI, Math.PI / 2, 0);
  box(0.9, 0.5, 0.45, 1.5, 3.4, ZB - 0.3, steelPale);
  box(0.02, 1.2, 0.6, 1.5, 4.3, ZB - 0.06, tinRust);
  box(0.7, 0.6, 0.06, 0.2, 4.9, ZB - 0.07, steelPale);
  box(0.6, 0.5, 0.02, 0.2, 4.9, ZB - 0.11, glass);
  box(W, 0.4, 0.02, 0, 0.3, ZB - 0.06, tinRust);

  // --- roof: stepped tile profile extruded across; caps are the gables --------------------
  {
    const sh = new THREE.Shape();
    const along = (a, b, n, k) => new THREE.Vector2(a.x + (b.x - a.x) * k / n, a.y + (b.y - a.y) * k / n);
    const eF = new THREE.Vector2(2.9, 5.92), ridge = new THREE.Vector2(-0.1, 6.92), eB = new THREE.Vector2(-3.0, 5.92);
    const stepped = (a, b, n) => {
      const d = new THREE.Vector2().subVectors(b, a).normalize(), nn = new THREE.Vector2(-d.y, d.x);
      for (let k = 0; k < n; k++) {
        const p0 = along(a, b, n, k), p1 = along(a, b, n, k + 1);
        sh.lineTo(p0.x + nn.x * 0.04, p0.y + nn.y * 0.04);
        sh.lineTo(p1.x - d.x * 0.02 + nn.x * 0.04, p1.y - d.y * 0.02 + nn.y * 0.04);
        sh.lineTo(p1.x - d.x * 0.02, p1.y - d.y * 0.02);
      }
    };
    sh.moveTo(eF.x, eF.y); stepped(eF, ridge, 10); sh.lineTo(ridge.x, ridge.y);
    // the back slope runs downhill so its normal must still point up: walk it uphill in reverse
    const backPts = [];
    {
      const a = eB, b = ridge, n = 9, d = new THREE.Vector2().subVectors(b, a).normalize(), nn = new THREE.Vector2(-d.y, d.x);
      for (let k = 0; k < n; k++) {
        const p0 = along(a, b, n, k), p1 = along(a, b, n, k + 1);
        backPts.push(new THREE.Vector2(p0.x + nn.x * 0.04, p0.y + nn.y * 0.04));
        backPts.push(new THREE.Vector2(p1.x - d.x * 0.02 + nn.x * 0.04, p1.y - d.y * 0.02 + nn.y * 0.04));
        backPts.push(new THREE.Vector2(p1.x - d.x * 0.02, p1.y - d.y * 0.02));
      }
    }
    for (let i = backPts.length - 1; i >= 0; i--) sh.lineTo(backPts[i].x, backPts[i].y);
    sh.lineTo(eB.x, eB.y); sh.lineTo(eB.x, 5.8); sh.lineTo(-0.1, 6.8); sh.lineTo(eF.x, 5.8); sh.closePath();
    const geo = extrude(sh, 5.0); geo.rotateY(-Math.PI / 2);
    add(geo, tile, 2.5, 0, 0);
  }
  cyl(0.08, 0.08, 5.1, 6, 0, 6.98, -0.1, tileWorn, 0, 0, Math.PI / 2);
  box(5.0, 0.15, 0.05, 0, 5.87, 2.9, plankDark);
  box(5.0, 0.15, 0.05, 0, 5.87, -3.0, plankDark);
  for (const x of [-1.6, 0.4]) box(0.7, 0.05, 0.4, x, 6.95 - 0.33 * 0, 1.0, tileWorn, Math.atan2(1, 3), 0, 0); // patched tiles (wear)
  {
    const gutter = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 5.0, 8, 1, true, 0, Math.PI), galv); gutter.rotation.set(0, 0, Math.PI / 2); gutter.position.set(0, 5.84, 2.95); gutter.material = mat(0x8a8378, 'metal', { metalness: 0.3, side: THREE.DoubleSide }); g.add(gutter);
  }
  {
    const path = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-HX - 0.1, 5.86, ZF + 0.6), new THREE.Vector3(-HX - 0.1, 5.86, ZF + 0.2),
      new THREE.Vector3(-HX - 0.1, 5.6, ZF + 0.1), new THREE.Vector3(-HX - 0.1, 0.15, ZF + 0.1)], false, 'catmullrom', 0.2);
    add(new THREE.TubeGeometry(path, 12, 0.04, 7, false), galv, 0, 0, 0);
    for (const y of [1.0, 3.3, 5.3]) box(0.14, 0.05, 0.14, -HX - 0.07, y, ZF + 0.1, steel);
  }

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((L) => ({ ...L, x: L.x - c.x, y: L.y - bb.min.y, z: L.z - c.z }));
  return g;
}
