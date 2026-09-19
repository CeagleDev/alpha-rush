// shophouse_a — arm C: a different reading. The house is an exposed post-and-beam
// timber frame with faded plaster infill on every face, a hipped tile roof (a four-sided
// frustum with ring tile courses), a full-width balcony, the lightbox standing on the
// awning roof, two separate sliding windows, and the awning built as overlapping sheets.
export default function (THREE) {
  const g = new THREE.Group();
  const lights = [];
  const mat = (hex, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.88, metalness: 0, ...o });
    if (name) m.name = name;
    return m;
  };
  const emis = (hex, i = 2.2) => new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: hex, emissiveIntensity: i, roughness: 0.35 });
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => {
    const n = new THREE.Mesh(geo, m); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n;
  };
  const box = (w, h, d, x, y, z, m, rx, ry, rz) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, rx, ry, rz);
  const cyl = (r0, r1, h, seg, x, y, z, m, rx, ry, rz) => add(new THREE.CylinderGeometry(r0, r1, h, seg), m, x, y, z, rx, ry, rz);

  const black = mat(0x110f12, 'stone', { roughness: 0.95 });
  const post = mat(0x37201b, 'timber');
  const beam = mat(0x4f2d21, 'timber');
  const timberLit = mat(0x6c4028, 'timber');
  const plaster = mat(0x8b6141, 'plaster');
  const plasterDark = mat(0x6c4028, 'plaster');
  const plasterStain = mat(0x4f2d21, 'plaster');
  const tin = mat(0x8b6141, 'metal', { metalness: 0.3, roughness: 0.8, side: THREE.DoubleSide });
  const tinLit = mat(0xbf7c42, 'metal', { metalness: 0.3, roughness: 0.8, side: THREE.DoubleSide });
  const tinRust = mat(0x37201b, 'metal', { metalness: 0.3, roughness: 0.9, side: THREE.DoubleSide });
  const steel = mat(0x6f6a62, 'metal', { metalness: 0.3, roughness: 0.75 });
  const steelPale = mat(0x9a9588, 'metal', { metalness: 0.3, roughness: 0.7 });
  const galv = mat(0x8a8378, 'metal', { metalness: 0.3, roughness: 0.7 });
  const tile = mat(0x2e2622, 'tile', { roughness: 0.9 });
  const tileWorn = mat(0x3d3330, 'tile', { roughness: 0.9, side: THREE.DoubleSide });
  const concrete = mat(0x4a4a4c, 'stone');
  const red = mat(0xb8302a, 'fabric', { roughness: 0.9, side: THREE.DoubleSide });
  const cream = mat(0xeee2c8, 'fabric', { roughness: 0.9, side: THREE.DoubleSide });
  const redPaint = mat(0xb8302a, 'metal', { metalness: 0.3, roughness: 0.8 });
  const ringMat = mat(0x231718, 'metal', { metalness: 0.3 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xc9b489, roughness: 0.3, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });
  const eInterior = emis(0xd8ae70, 1.6);
  const eSign = emis(0xd8ae70, 2.4);
  const eWindow = emis(0xe5b055, 1.8);
  const eLantern = emis(0xb8302a, 2.6);

  const HX = 2.4, ZF = 2.3, ZB = -2.7, W = 2 * HX, DEP = ZF - ZB, ZC = (ZF + ZB) / 2;

  // --- plinth and step ------------------------------------------------------------------
  box(W + 0.1, 0.08, DEP + 0.1, 0, 0.04, ZC, black);
  box(W, 0.3, 0.3, 0, 0.15, ZF + 0.15, concrete);

  // --- masses: ground floor cavity + solid rear, upper floor solid, infill colour per bay ----
  box(W, 3.12, 0.9 - ZB, 0, 1.64, (0.9 + ZB) / 2, plasterDark);
  box(W, 0.12, ZF - 0.9, 0, 0.14, (ZF + 0.9) / 2, timberLit);
  box(W, 0.2, ZF - 0.9, 0, 3.1, (ZF + 0.9) / 2, timberLit);
  for (const s of [1, -1]) box(0.16, 3.0, ZF - 0.9, s * (HX - 0.08), 1.6, (ZF + 0.9) / 2, plasterDark);
  box(W - 0.3, 2.7, 0.04, 0, 1.55, 0.93, eInterior);
  lights.push({ x: 0, y: 1.9, z: 1.6, color: 0xd8ae70, intensity: 1.0, range: 4.0 });
  box(W, 2.8, DEP, 0, 4.6, ZC, plaster);
  // faded/stained infill patches (wear): a few bays on every face
  box(1.1, 2.5, 0.02, -1.75, 4.55, ZF + 0.01, plasterDark);
  box(0.02, 2.5, 1.3, -HX - 0.01, 4.55, -1.6, plasterStain);
  box(0.02, 2.0, 1.1, HX + 0.01, 1.8, -0.9, plasterDark);
  box(1.3, 2.4, 0.02, 1.4, 4.5, ZB - 0.01, plasterStain);
  box(W, 0.9, 0.02, 0, 0.55, ZB - 0.01, plasterStain);
  // interior
  box(2.6, 0.9, 0.5, 0.4, 0.65, 1.45, beam); box(2.7, 0.06, 0.6, 0.4, 1.13, 1.45, timberLit);
  for (const x of [-0.5, 0.2, 0.9]) { cyl(0.15, 0.15, 0.05, 8, x, 0.68, 1.95, plaster); cyl(0.03, 0.03, 0.5, 6, x, 0.42, 1.95, steel); }
  for (const y of [2.0, 2.4]) box(2.4, 0.04, 0.25, 0.3, y, 1.06, timberLit);
  for (let i = 0; i < 6; i++) box(0.08, 0.22, 0.08, -0.7 + i * 0.4, 2.13, 1.06, i % 2 ? red : cream);
  box(0.7, 1.4, 0.6, -1.8, 0.9, 1.35, steelPale);

  // --- the timber frame, proud on all four faces ------------------------------------------
  const frame = (face) => {
    // face: 'F' | 'B' | 'L' | 'R'
    const isZ = face === 'F' || face === 'B';
    const len = isZ ? W : DEP, off = isZ ? (face === 'F' ? ZF + 0.04 : ZB - 0.04) : (face === 'R' ? HX + 0.04 : -HX - 0.04);
    const P = (a, y, h, m) => isZ ? box(0.12, h, 0.08, a, y, off, m) : box(0.08, h, 0.12, off, y, a, m);
    const B = (y, m) => isZ ? box(len + 0.1, 0.16, 0.08, 0, y, off, m) : box(0.08, 0.16, len + 0.1, off, y, 0 + ZC, m);
    const c0 = isZ ? 0 : ZC;
    const posts = isZ ? [-HX, -1.2, 0, 1.2, HX] : [ZB, ZB + 1.25, ZC, ZF - 1.25, ZF];
    for (const a of posts) P(c0 * 0 + a, face === 'F' && Math.abs(a) < HX ? 4.6 : 3.05, face === 'F' && Math.abs(a) < HX ? 2.9 : 6.0, post);
    B(3.2, beam); B(6.0, beam); if (face !== 'F') B(4.4, beam);
    if (face !== 'F') { // a diagonal brace in one bay per face (wear/variation in the joinery)
      const d = isZ ? box(0.1, 1.5, 0.06, len / 2 - 0.65, 5.2, off, post, 0, 0, 0.6) : box(0.06, 1.5, 0.1, off, 5.2, c0 + len / 2 - 0.65, post, -0.6, 0, 0);
    }
  };
  frame('F'); frame('B'); frame('L'); frame('R');

  // --- ground floor glass front, door, noren ---------------------------------------------
  box(W, 0.14, 0.16, 0, 0.36, ZF, post);
  box(W - 0.3, 2.65, 0.02, 0, 1.68, ZF + 0.02, glass);
  for (const x of [-1.25, -0.42, 0.42, 1.25]) box(0.06, 2.65, 0.08, x, 1.68, ZF + 0.04, steelPale);
  for (const y of [1.05, 2.3, 2.98]) box(W - 0.3, 0.05, 0.08, 0, y, ZF + 0.04, steelPale);
  box(0.05, 0.3, 0.04, 0.34, 1.3, ZF + 0.1, steel);
  box(0.7, 0.9, 0.3, -1.9, 0.53, ZF + 0.3, steelPale);
  cyl(0.015, 0.015, 3.6, 6, 0, 2.6, ZF + 0.3, steel, 0, 0, Math.PI / 2);
  for (const cx of [-1.15, 0, 1.15]) {
    box(0.9, 0.85, 0.02, cx, 2.18, ZF + 0.3, red);
    for (let i = 0; i < 5; i++) box(0.09, 0.85, 0.02, cx - 0.36 + i * 0.18, 2.18, ZF + 0.315, cream);
  }

  // --- awning: five overlapping tin sheets on a sloped frame, half-round ribs -------------
  {
    const a = new THREE.Group(); a.position.set(0, 3.0, ZF); a.rotation.x = 0.2; g.add(a);
    const sheetMats = [tin, tinLit, tin, tinRust, tin];
    for (let i = 0; i < 5; i++) {
      const s = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.03, 0.78), sheetMats[i]); s.position.set(-2.0 + i * 1.0, i % 2 ? 0.02 : 0, 0.39); a.add(s);
    }
    const rib = new THREE.CylinderGeometry(0.025, 0.025, 0.78, 5, 1, true, -Math.PI / 2, Math.PI);
    rib.rotateX(Math.PI / 2); rib.rotateY(Math.PI);
    for (let i = 0; i < 28; i++) { const r = new THREE.Mesh(rib, i % 9 === 4 ? tinRust : tin); r.position.set(-2.43 + i * 0.18, (Math.floor((i * 0.18) / 1.0) % 2 ? 0.02 : 0) + 0.015, 0.39); a.add(r); }
    const lip = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.08, 0.04), tinRust); lip.position.set(0, 0.0, 0.78); a.add(lip);
    for (const x of [-2.4, -0.8, 0.8, 2.4]) { const p = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.06, 0.78), post); p.position.set(x, -0.04, 0.39); a.add(p); }
  }
  for (const x of [-2.1, 0, 2.1]) cyl(0.02, 0.02, 0.83, 6, x, 2.625, ZF + 0.36, steel, 1.0, 0, 0);

  // --- lanterns as capsules -----------------------------------------------------------
  for (const x of [-1.5, -0.5, 0.5, 1.5]) {
    const y = 2.5, z = ZF + 0.55;
    const l = add(new THREE.CapsuleGeometry(0.2, 0.06, 3, 10), eLantern, x, y, z); l.scale.set(1.1, 0.85, 1.1);
    add(new THREE.TorusGeometry(0.2, 0.012, 4, 10), ringMat, x, y, z, Math.PI / 2, 0, 0);
    cyl(0.09, 0.09, 0.05, 8, x, y + 0.2, z, ringMat);
    cyl(0.09, 0.09, 0.05, 8, x, y - 0.2, z, ringMat);
    cyl(0.006, 0.006, 0.22, 4, x, y + 0.32, z, steel);
    lights.push({ x, y, z, color: 0xe86a3a, intensity: 0.8, range: 3.5 });
  }

  // --- lightbox standing on the awning, leaning back on the wall ------------------------
  {
    const lb = new THREE.Group(); lb.position.set(0, 3.55, ZF + 0.3); lb.rotation.x = -0.12; g.add(lb);
    const f = new THREE.Mesh(new THREE.BoxGeometry(3.6, 0.9, 0.22), steel); lb.add(f);
    const e = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.66, 0.03), eSign); e.position.set(0, 0.06, 0.12); lb.add(e);
    const r = new THREE.Mesh(new THREE.BoxGeometry(3.5, 0.14, 0.035), redPaint); r.position.set(0, -0.36, 0.12); lb.add(r);
    const rr = new THREE.Mesh(new THREE.BoxGeometry(0.4, 0.9, 0.01), tinRust); rr.position.set(1.3, 0, 0.12); lb.add(rr);
    for (const x of [-1.5, 1.5]) { const s = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.5), steel); s.position.set(x, 0.4, -0.2); lb.add(s); }
  }
  lights.push({ x: 0, y: 3.65, z: ZF + 0.8, color: 0xd8ae70, intensity: 1.2, range: 4.0 });

  // --- upper floor: full-width balcony, two sliding windows, AC, laundry ----------------
  box(W - 0.2, 0.08, 0.5, 0, 4.42, ZF + 0.25, post);
  for (let x = -2.2; x <= 2.21; x += 0.55) box(0.035, 0.9, 0.035, x, 4.9, ZF + 0.48, steel);
  box(W - 0.2, 0.05, 0.05, 0, 5.36, ZF + 0.48, steel); box(W - 0.2, 0.03, 0.03, 0, 4.85, ZF + 0.48, steel);
  for (const wx of [-0.6, 0.6]) {
    box(1.0, 1.1, 0.02, wx, 5.1, ZF - 0.02, eWindow);
    box(1.0, 1.1, 0.02, wx, 5.1, ZF + 0.05, glass);
    for (const s of [-1, 1]) box(0.06, 1.2, 0.08, wx + s * 0.52, 5.1, ZF + 0.06, steelPale);
    for (const y of [4.53, 5.67]) box(1.1, 0.06, 0.08, wx, y, ZF + 0.06, steelPale);
    box(0.04, 1.1, 0.05, wx, 5.1, ZF + 0.07, steelPale);
    lights.push({ x: wx, y: 5.1, z: ZF + 0.4, color: 0xe5b055, intensity: 0.4, range: 2.2 });
  }
  box(0.28, 0.42, 0.03, -1.6, 5.05, ZF + 0.52, mat(0x3a4a6a, 'fabric', { side: THREE.DoubleSide }));
  box(0.25, 0.5, 0.03, -1.25, 5.0, ZF + 0.52, cream);
  box(0.3, 0.38, 0.03, 1.6, 5.06, ZF + 0.52, plaster);
  box(0.7, 0.55, 0.3, 1.9, 5.0, ZF + 0.55, steelPale);           // AC sitting on the balcony
  add(new THREE.TorusGeometry(0.16, 0.02, 5, 16), steel, 1.78, 5.0, ZF + 0.71);
  box(0.5, 0.6, 0.015, 1.9, 4.1, ZF + 0.05, plasterStain);

  // --- hipped tile roof: 4-sided frustum + ring courses + ridge -------------------------
  {
    // rotation then scale baked into the geometry: a mesh scale would be applied before the
    // 45 degree turn (TRS) and squash the square into a rhombus
    const hip = (rTop, rBot, h, open) => { const geo = new THREE.CylinderGeometry(rTop, rBot, h, 4, 1, open); geo.rotateY(Math.PI / 4); geo.scale(2.5 / 3.0, 1, 1); return geo; };
    add(hip(0.75 * Math.SQRT2, 3.0 * Math.SQRT2, 1.0, false), tile, 0, 6.5, ZC);
    const tileOpen = mat(0x2e2622, 'tile', { side: THREE.DoubleSide });
    for (let k = 0; k < 8; k++) {
      const t = k / 8, rad = (3.0 - t * 2.25) * Math.SQRT2 + 0.05;
      add(hip(rad - 0.03, rad, 0.05, true), k % 3 === 1 ? tileWorn : tileOpen, 0, 6.02 + t * 1.0, ZC);
    }
    cyl(0.08, 0.08, 1.5, 6, 0, 7.0, ZC, tileWorn, 0, 0, Math.PI / 2);   // ridge cap along x
  }
  box(W + 0.2, 0.14, 0.05, 0, 5.94, ZF + 0.6, post);               // fascias
  box(W + 0.2, 0.14, 0.05, 0, 5.94, ZB - 0.3, post);
  cyl(0.05, 0.05, 5.2, 8, 0, 5.9, ZF + 0.65, galv, 0, 0, Math.PI / 2);
  cyl(0.04, 0.04, 5.75, 8, HX + 0.1, 3.0, ZF + 0.12, galv);          // drainpipe, right corner this time
  cyl(0.04, 0.04, 0.55, 8, HX + 0.1, 5.88, ZF + 0.4, galv, Math.PI / 2, 0, 0);
  for (const y of [1.0, 3.3, 5.3]) box(0.14, 0.05, 0.14, HX + 0.07, y, ZF + 0.12, steel);
  cyl(0.06, 0.05, 0.3, 8, HX + 0.1, 0.2, ZF + 0.12, black);

  // --- side and back fittings ------------------------------------------------------------
  // left: pipe, meter, barred window, vent, stain
  cyl(0.04, 0.04, 5.6, 8, -HX - 0.14, 3.0, -0.4, galv);
  for (const y of [1.2, 3.4, 5.4]) box(0.14, 0.05, 0.12, -HX - 0.1, y, -0.4, steel);
  box(0.08, 0.8, 0.7, -HX - 0.08, 5.0, 1.0, steelPale); box(0.02, 0.7, 0.6, -HX - 0.13, 5.0, 1.0, glass);
  for (const z of [0.8, 1.0, 1.2]) box(0.03, 0.75, 0.02, -HX - 0.14, 5.0, z, steel);
  box(0.25, 0.3, 0.3, -HX - 0.16, 2.7, 1.5, galv); box(0.02, 0.6, 0.3, -HX - 0.09, 2.25, 1.5, plasterStain);
  box(0.2, 0.4, 0.3, -HX - 0.14, 1.2, 0.5, steel); cyl(0.02, 0.02, 1.0, 6, -HX - 0.16, 0.6, 0.5, galv);
  box(0.5, 0.6, 0.4, -HX - 0.3, 0.38, -2.0, plaster);              // a crate against the wall
  // right: two ACs, conduit, window
  box(0.3, 0.55, 0.75, HX + 0.22, 4.9, 0.3, steelPale);
  add(new THREE.TorusGeometry(0.17, 0.02, 5, 16), steel, HX + 0.38, 4.9, 0.42, 0, Math.PI / 2, 0);
  for (const z of [0.0, 0.6]) box(0.34, 0.04, 0.04, HX + 0.22, 4.6, z, steel);
  box(0.3, 0.5, 0.65, HX + 0.22, 2.5, -1.5, steelPale);
  add(new THREE.TorusGeometry(0.15, 0.02, 5, 16), steel, HX + 0.38, 2.5, -1.4, 0, Math.PI / 2, 0);
  for (const z of [-1.8, -1.2]) box(0.34, 0.04, 0.04, HX + 0.22, 2.2, z, steel);
  cyl(0.025, 0.025, 4.6, 6, HX + 0.1, 3.7, -0.3, galv, Math.PI / 2, 0, 0);
  box(0.12, 0.35, 0.28, HX + 0.12, 1.3, 1.6, steel);
  box(0.08, 0.8, 0.7, HX + 0.08, 5.0, -1.6, steelPale); box(0.02, 0.7, 0.6, HX + 0.13, 5.0, -1.6, glass);
  // back: door, hood, duct, window
  box(1.0, 2.2, 0.08, -1.3, 1.18, ZB - 0.08, post); box(0.86, 2.06, 0.05, -1.3, 1.18, ZB - 0.11, beam);
  box(0.06, 0.2, 0.05, -1.65, 1.1, ZB - 0.15, steel);
  box(0.6, 0.3, 0.3, -1.3, 2.55, ZB - 0.22, tin);
  cyl(0.13, 0.13, 5.0, 8, 1.5, 2.9, ZB - 0.24, galv);
  add(new THREE.TorusGeometry(0.2, 0.13, 6, 8, Math.PI / 2), galv, 1.5, 5.4, ZB - 0.06, Math.PI, Math.PI / 2, 0);
  box(0.9, 0.5, 0.45, 1.5, 3.4, ZB - 0.32, steelPale);
  box(0.7, 0.6, 0.06, 0.2, 5.0, ZB - 0.08, steelPale); box(0.6, 0.5, 0.02, 0.2, 5.0, ZB - 0.12, glass);

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((L) => ({ ...L, x: L.x - c.x, y: L.y - bb.min.y, z: L.z - c.z }));
  return g;
}
