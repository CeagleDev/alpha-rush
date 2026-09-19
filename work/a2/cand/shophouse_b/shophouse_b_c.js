// shophouse_b — arm C: a different reading.
// The ground floor is a recessed porch (shop front set back 0.45 m under the upper storey,
// on two clad piers); the signs are read as the reference shows them, two small boxes
// stacked on the left pier plus one tall box on the right and the blue tube over the door;
// the cladding is separate overlapping tin sheets with instanced half-round ribs; the roof
// is a mono-pitch shed sloping to the back with a front fascia; the tank sits on the high side.
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
  const tinM = (hex, o) => mat(hex, 'metal', { metalness: 0.3, roughness: 0.82, ...(o || {}) });
  const green = tinM(0x4d6b55), greenDark = tinM(0x3b5243), greenPale = tinM(0x6a8a70);
  const rustRed = tinM(0x7a3f2b), rustDark = tinM(0x4f2d21), rustRun = tinM(0x37201b);
  const creamTin = tinM(0x8b6141), creamPale = tinM(0xa8875f);
  const ribMat = tinM(0x5a4a3a, { side: THREE.DoubleSide }), ribGreen = tinM(0x3b5243, { side: THREE.DoubleSide }), ribRust = tinM(0x37201b, { side: THREE.DoubleSide });
  const tinRoof = tinM(0x6c4028, { side: THREE.DoubleSide }), tinRoofRust = tinM(0x37201b, { side: THREE.DoubleSide });
  const galv = tinM(0x8a8378), steel = tinM(0x6f6a62), steelPale = tinM(0x9a9588), steelDark = tinM(0x3a3a38);
  const timber = mat(0x4f2d21, 'timber'), timberDark = mat(0x37201b, 'timber'), timberLit = mat(0x6c4028, 'timber');
  const concrete = mat(0x4a4a4c, 'stone');
  const cable = mat(0x110f12, 'metal', { roughness: 0.9 });
  const frosted = new THREE.MeshStandardMaterial({ color: 0xb9c2c4, roughness: 0.55, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });
  const doorGlass = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.3, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });
  const eCream = emis(0xd8ae70, 2.4), eYellow = emis(0xe5b055, 2.2), eBlue = emis(0x40559f, 2.6), eWarm = emis(0xbf7c42, 1.4);

  const HX = 2.4, ZF = 2.3, ZB = -2.7, W = 2 * HX, DEP = ZF - ZB, ZC = (ZF + ZB) / 2;
  const PZ = ZF - 0.45;   // the recessed shop front plane
  const RY_F = 6.9, RY_B = 6.1; // shed roof: high at the front, low at the back

  // --- plinth and floor ------------------------------------------------------------------------
  box(W + 0.08, 0.08, DEP + 0.08, 0, 0.04, ZC, black);
  box(W, 0.12, DEP, 0, 0.1, ZC, concrete);
  // --- ground floor: rear mass, two piers, the recessed front with the door ---------------------
  box(W, 3.1, PZ - ZB, 0, 1.65, (PZ + ZB) / 2, rustRed);
  for (const s of [1, -1]) box(0.7, 3.1, ZF - PZ + 0.02, s * (HX - 0.35), 1.65, (ZF + PZ) / 2, rustRed);
  box(W - 1.4, 0.3, ZF - PZ, 0, 3.05, (ZF + PZ) / 2, timberDark);   // porch head beam
  box(1.0, 2.35, 0.1, -0.6, 1.25, PZ + 0.05, galv);
  box(0.9, 2.2, 0.3, -0.6, 1.2, PZ - 0.12, black);
  box(0.86, 2.15, 0.02, -0.6, 1.2, PZ - 0.25, eWarm);
  box(0.42, 2.1, 0.05, -0.83, 1.2, PZ + 0.0, steelDark);
  box(0.3, 0.6, 0.02, -0.83, 1.6, PZ + 0.03, doorGlass);
  box(1.0, 0.06, 0.12, -0.6, 2.42, PZ + 0.08, galv);
  lights.push({ x: -0.6, y: 1.5, z: PZ, color: 0xbf7c42, intensity: 0.6, range: 2.5 });
  // a menu board and a crate in the porch
  box(0.5, 0.7, 0.04, 1.2, 1.5, PZ + 0.03, timberDark); box(0.42, 0.6, 0.02, 1.2, 1.5, PZ + 0.06, mat(0xeee2c8, 'plaster'));
  box(0.5, 0.35, 0.3, 1.4, 0.34, PZ + 0.25, mat(0xf8e845, 'plaster'));
  // --- upper storey mass -------------------------------------------------------------------------
  box(W, 2.8, DEP, 0, 4.6, ZC, creamTin);
  box(0.02, 2.7, DEP, HX + 0.01, 4.6, ZC, green);
  box(0.02, 2.7, DEP, -HX - 0.01, 4.6, ZC, rustRed);
  box(W, 2.7, 0.02, 0, 4.6, ZB - 0.01, greenDark);
  box(0.02, 3.0, PZ - ZB, HX + 0.01, 1.6, (PZ + ZB) / 2, green);
  box(W, 3.0, 0.02, 0, 1.6, ZB - 0.01, greenDark);
  box(0.02, 3.0, 0.9, HX + 0.02, 1.6, ZF - 0.35, green);

  // --- cladding as overlapping sheets with instanced half-round ribs ----------------------------
  const sheetsOn = (face, a0, a1, y0, y1, mats, ribM, skip) => {
    const isZ = face === 'F' || face === 'B';
    const off = face === 'F' ? ZF + 0.012 : face === 'B' ? ZB - 0.012 : face === 'R' ? HX + 0.012 : -HX - 0.012;
    const H = y1 - y0, y = (y0 + y1) / 2;
    let k = 0;
    for (let a = a0; a < a1 - 0.01; a += 0.9) {
      const w = Math.min(0.92, a1 - a), ac = a + w / 2;
      if (skip && skip(ac)) { k++; continue; }
      const m = mats[k % mats.length]; k++;
      const tilt = (k % 3 === 0) ? 0.01 : 0;    // a sheet lifted at one edge (wear)
      if (isZ) box(w, H, 0.02, ac, y, off + tilt, m); else box(0.02, H, w, off + (face === 'R' ? tilt : -tilt), y, ac, m);
    }
    const ribGeo = new THREE.CylinderGeometry(0.025, 0.025, H - 0.06, 5, 1, true, -Math.PI / 2, Math.PI);
    const list = [];
    for (let a = a0 + 0.05; a < a1; a += 0.1) { if (skip && skip(a)) continue; list.push(a); }
    const im = new THREE.InstancedMesh(ribGeo, ribM, list.length);
    const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), p = new THREE.Vector3(), s1 = new THREE.Vector3(1, 1, 1);
    const ry = face === 'F' ? 0 : face === 'B' ? Math.PI : face === 'R' ? Math.PI / 2 : -Math.PI / 2;
    // the half cylinder opens toward -z by default (thetaStart -pi/2 .. pi/2 covers +x..); rotate it so the bulge faces outward
    list.forEach((a, i) => {
      q.setFromEuler(new THREE.Euler(0, ry + Math.PI / 2, 0));
      if (isZ) p.set(a, y, off + 0.012); else p.set(off + (face === 'R' ? 0.012 : -0.012), y, a);
      im.setMatrixAt(i, m4.compose(p, q, s1));
    });
    im.instanceMatrix.needsUpdate = true; g.add(im);
  };
  sheetsOn('F', -HX, HX, 3.25, 5.95, [creamTin, creamPale, creamTin, rustDark], ribMat, (a) => Math.abs(a) < 0.95);
  sheetsOn('F', -HX, -HX + 0.7, 0.14, 3.0, [rustRed, rustDark], ribRust);
  sheetsOn('F', HX - 0.7, HX, 0.14, 3.0, [rustDark, rustRed], ribRust);
  sheetsOn('R', ZB, ZF, 0.14, 5.95, [green, greenDark, greenPale, green, greenDark], ribGreen);
  sheetsOn('L', ZB, ZF, 0.14, 5.95, [rustRed, rustDark, rustRed, green, rustRed], ribRust, (a) => a > -0.4 && a < 0.5 ? false : false);
  sheetsOn('B', -HX, HX, 0.14, 5.95, [greenDark, green, greenDark, greenPale], ribGreen, (a) => a > 0.9 && a < 1.9);
  // wear: rust runs on sheets
  box(0.02, 1.4, 0.6, HX + 0.04, 1.0, -1.0, rustRun); box(0.02, 0.8, 0.9, -HX - 0.04, 2.6, -1.3, rustRun);
  box(0.6, 1.2, 0.02, -1.5, 3.9, ZF + 0.035, rustRun);

  // --- sign cluster: two stacked on the left pier, one tall on the right, blue over the door -----
  const lightbox = (w, h, d, x, y, z, e) => {
    box(w, h, d, x, y, z, steelDark);
    box(w - 0.08, h - 0.08, 0.03, x, y, z + d / 2 + 0.01, e);
    box(w - 0.08, 0.08, 0.035, x, y - h / 2 + 0.1, z + d / 2 + 0.01, rustRun);
    for (const s of [-1, 1]) box(0.05, 0.05, 0.16, x + s * (w / 2 - 0.1), y + h / 2 - 0.1, z - d / 2 - 0.06, steel);
    lights.push({ x, y, z: z + d / 2 + 0.35, color: 0xd8ae70, intensity: 0.9, range: 3.2 });
  };
  lightbox(0.8, 1.0, 0.25, -2.1, 5.2, ZF + 0.16, eCream);
  lightbox(0.8, 1.0, 0.25, -2.1, 4.05, ZF + 0.16, eYellow);
  lightbox(0.8, 1.9, 0.25, 2.1, 4.75, ZF + 0.16, eCream);
  box(0.6, 0.4, 0.12, -0.6, 2.75, PZ + 0.1, steelDark);
  box(0.52, 0.32, 0.03, -0.6, 2.75, PZ + 0.17, eBlue);
  lights.push({ x: -0.6, y: 2.75, z: PZ + 0.45, color: 0x40559f, intensity: 0.6, range: 2.5 });

  // --- tin awning off the porch beam, struts to the piers ----------------------------------------
  {
    const a = new THREE.Group(); a.position.set(0, 3.0, ZF); a.rotation.x = 0.18; g.add(a);
    for (let i = 0; i < 5; i++) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.06, 0.03, 0.8), i === 3 ? tinRoofRust : tinRoof); s.position.set(-2.0 + i * 1.0, i % 2 ? 0.015 : 0, 0.4); a.add(s); }
    const rib = new THREE.CylinderGeometry(0.025, 0.025, 0.8, 5, 1, true, -Math.PI / 2, Math.PI); rib.rotateX(Math.PI / 2); rib.rotateY(Math.PI);
    for (let i = 0; i < 27; i++) { const r = new THREE.Mesh(rib, i % 10 === 5 ? tinRoofRust : tinRoof); r.position.set(-2.43 + i * 0.187, 0.03, 0.4); a.add(r); }
    const lip = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.07, 0.04), tinRoofRust); lip.position.set(0, -0.01, 0.8); a.add(lip);
  }
  for (const x of [-2.1, 2.1]) cyl(0.02, 0.02, 0.9, 6, x, 2.6, ZF + 0.38, steel, 1.05, 0, 0);

  // --- frosted window, cables, conduit ---------------------------------------------------------
  box(1.9, 1.3, 0.08, 0, 4.8, ZF + 0.05, steelPale);
  box(1.76, 1.16, 0.02, 0, 4.8, ZF + 0.1, frosted);
  box(0.04, 1.16, 0.04, 0, 4.8, ZF + 0.11, steelPale);
  box(1.9, 0.08, 0.16, 0, 4.11, ZF + 0.09, steelPale);
  box(1.76, 0.4, 0.02, 0, 4.4, ZF + 0.03, eWarm);
  lights.push({ x: 0, y: 4.8, z: ZF + 0.4, color: 0xd8ae70, intensity: 0.35, range: 2.0 });
  cyl(0.03, 0.03, 2.6, 6, 1.5, 4.6, ZF + 0.09, galv);
  box(0.3, 0.4, 0.14, 1.5, 3.7, ZF + 0.1, steelPale);
  cyl(0.012, 0.012, 3.0, 4, -0.4, 5.6, ZF + 0.08, cable, 0, 0, Math.PI / 2 + 0.1);
  cyl(0.012, 0.012, 1.6, 4, 1.6, 5.7, ZF + 0.08, cable, 0, 0, Math.PI / 2 - 0.2);

  // --- shed roof: high at the front, sloping to the back, with a front fascia -------------------
  {
    const len = Math.hypot(DEP + 0.8, RY_F - RY_B), ang = Math.atan2(RY_F - RY_B, DEP + 0.8);
    const r = new THREE.Group(); r.position.set(0, (RY_F + RY_B) / 2, (ZF + 0.6 + ZB - 0.2) / 2); r.rotation.x = ang; g.add(r);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(5.1, 0.06, len), tinRoof); r.add(slab);
    for (let i = 0; i < 26; i++) { const rb = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.03, len), i % 9 === 4 ? tinRoofRust : tinRoof); rb.position.set(-2.5 + i * 0.2, 0.04, 0); r.add(rb); }
    const patch = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.02, 0.8), tinRoofRust); patch.position.set(0.9, 0.045, -1.2); r.add(patch);
    for (const s of [1, -1]) { const b = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.16, len + 0.05), timberDark); b.position.set(s * 2.57, 0, 0); r.add(b); }
  }
  // gable-less: fill the wall up to the roof line on the front and sides
  {
    const sh = new THREE.Shape(); sh.moveTo(ZB, 6.0); sh.lineTo(ZF, 6.0); sh.lineTo(ZF, RY_F - 0.15); sh.lineTo(ZB, RY_B + 0.1); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: W, bevelEnabled: false }); geo.rotateY(-Math.PI / 2);
    add(geo, creamTin, HX, 0, 0);
    box(0.02, 0.8, DEP, HX + 0.01, 6.3, ZC, green); box(0.02, 0.8, DEP, -HX - 0.01, 6.3, ZC, rustRed);
  }
  box(W + 0.2, 0.3, 0.06, 0, RY_F - 0.2, ZF + 0.62, timberDark);                       // front fascia
  for (let a = -2.3; a <= 2.3; a += 0.1) box(0.032, 0.7, 0.03, a, 6.4, ZF + 0.02, creamPale);
  cyl(0.045, 0.045, W + 0.2, 8, 0, RY_B - 0.05, ZB - 0.25, galv, 0, 0, Math.PI / 2);   // back gutter
  cyl(0.04, 0.04, 5.9, 8, HX + 0.1, 3.05, ZB - 0.2, galv);
  for (const y of [1.0, 3.2, 5.4]) box(0.14, 0.05, 0.14, HX + 0.05, y, ZB - 0.2, steel);

  // --- water tank on the high side -------------------------------------------------------------
  {
    const tx = -1.2, tz = 1.2, ty = 7.0;
    cyl(0.55, 0.55, 0.7, 14, tx, ty + 0.35, tz, steelPale);
    cyl(0.5, 0.52, 0.06, 14, tx, ty + 0.72, tz, steel);
    for (const yy of [0.1, 0.62]) add(new THREE.TorusGeometry(0.55, 0.025, 5, 14), steel, tx, ty + yy, tz, Math.PI / 2, 0, 0);
    box(0.02, 0.4, 0.5, tx + 0.55, ty + 0.3, tz, rustRun);
    for (const [dx, dz] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
      const lz = tz + dz, roofY = RY_B + (RY_F - RY_B) * (lz - (ZB - 0.2)) / (DEP + 0.8);
      box(0.06, ty - roofY + 0.06, 0.06, tx + dx, (ty + roofY) / 2, lz, steel);
    }
    box(1.1, 0.08, 1.1, tx, ty - 0.04, tz, steel);
    cyl(0.03, 0.03, 1.2, 6, tx + 0.9, ty + 0.2, tz + 0.3, galv);
  }

  // --- right side fittings ---------------------------------------------------------------------
  box(0.16, 0.5, 0.4, HX + 0.12, 4.2, 0.8, steelPale); box(0.16, 0.35, 0.3, HX + 0.12, 3.5, 1.3, steelPale);
  box(0.2, 0.6, 0.35, HX + 0.14, 1.5, 0.3, steelPale);
  for (const y of [3.9, 3.82]) cyl(0.02, 0.02, 4.8, 6, HX + 0.08, y, -0.4, cable, Math.PI / 2, 0, 0);
  for (let z = ZB + 0.3; z < ZF; z += 0.5) box(0.06, 0.12, 0.05, HX + 0.07, 3.86, z, galv);
  box(0.25, 0.5, 0.5, HX + 0.15, 2.4, -1.0, steelDark);
  add(new THREE.TorusGeometry(0.16, 0.025, 5, 14), steel, HX + 0.29, 2.4, -1.0, 0, Math.PI / 2, 0);
  box(0.12, 0.25, 0.25, HX + 0.1, 5.3, 1.6, steel);
  // --- left side fittings ----------------------------------------------------------------------
  box(0.08, 0.8, 0.9, -HX - 0.06, 4.7, 0.2, steelPale); box(0.02, 0.7, 0.8, -HX - 0.11, 4.7, 0.2, frosted);
  for (const z of [-0.05, 0.2, 0.45]) box(0.03, 0.75, 0.02, -HX - 0.12, 4.7, z, steel);
  box(0.3, 0.55, 0.75, -HX - 0.19, 2.7, -1.2, steelPale);
  add(new THREE.TorusGeometry(0.17, 0.02, 5, 16), steel, -HX - 0.35, 2.7, -1.1, 0, Math.PI / 2, 0);
  for (const z of [-1.5, -0.9]) box(0.34, 0.04, 0.04, -HX - 0.19, 2.4, z, steel);
  cyl(0.04, 0.04, 5.9, 8, -HX - 0.12, 3.05, 1.6, galv);
  for (const y of [1.0, 3.2, 5.4]) box(0.14, 0.05, 0.14, -HX - 0.08, y, 1.6, steel);
  cyl(0.3, 0.28, 0.85, 10, -HX - 0.45, 0.43, -2.2, steelDark);
  // --- back ------------------------------------------------------------------------------------
  box(1.0, 2.2, 0.1, 1.4, 1.2, ZB - 0.07, timberDark); box(0.86, 2.06, 0.05, 1.4, 1.2, ZB - 0.11, timber);
  box(0.06, 0.2, 0.05, 1.05, 1.1, ZB - 0.15, steel);
  box(0.6, 0.3, 0.3, 1.4, 2.55, ZB - 0.2, tinRoof);
  for (const x of [-1.5, 0.2]) { box(0.7, 0.6, 0.08, x, 4.7, ZB - 0.06, steelPale); box(0.6, 0.5, 0.02, x, 4.7, ZB - 0.11, frosted); }
  cyl(0.13, 0.13, 4.8, 8, -0.8, 2.8, ZB - 0.22, galv);
  add(new THREE.TorusGeometry(0.2, 0.13, 6, 8, Math.PI / 2), galv, -0.8, 5.2, ZB - 0.04, Math.PI, Math.PI / 2, 0);
  box(0.9, 0.5, 0.45, -0.8, 3.3, ZB - 0.3, steelPale);
  for (const x of [-2.15, -1.75]) box(0.05, 6.2, 0.05, x, 3.15, ZB - 0.22, steel);
  for (let y = 0.5; y < 6.1; y += 0.4) cyl(0.015, 0.015, 0.4, 5, -1.95, y, ZB - 0.22, steel, 0, 0, Math.PI / 2);
  box(0.3, 0.5, 0.15, 2.0, 3.8, ZB - 0.1, steelPale);

  const bb = new THREE.Box3(), v = new THREE.Vector3(), m4 = new THREE.Matrix4(), im4 = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mm) => { for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mm)); };
    if (n.isInstancedMesh) { for (let k = 0; k < n.count; k++) { n.getMatrixAt(k, im4); put(m4.multiplyMatrices(n.matrixWorld, im4)); } return; }
    put(n.matrixWorld);
  });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((L) => ({ ...L, x: L.x - c.x, y: L.y - bb.min.y, z: L.z - c.z }));
  return g;
}
