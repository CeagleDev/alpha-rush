// shophouse_b — arm B: profiles.
// The upper storey and gable are one pentagon section extruded along z; the ground floor
// is an extruded rectangle with the door as a real hole; the corrugated cladding on every
// face is a zigzag profile extruded up the wall; the tin roof halves and the awning are
// corrugated profile extrudes; the lightboxes are rounded-rect extrudes; the water tank
// is a lathe with a rolled rim and a dished lid.
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
  const extrude = (sh, depth) => new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: false, curveSegments: 4 });
  const roundRect = (w, h, r) => { const s = new THREE.Shape(); s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r); s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2); s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2); return s; };

  const black = mat(0x110f12, 'stone', { roughness: 0.95 });
  const tinM = (hex, o) => mat(hex, 'metal', { metalness: 0.3, roughness: 0.82, ...(o || {}) });
  const green = tinM(0x4d6b55), greenDark = tinM(0x3b5243), greenPale = tinM(0x6a8a70);
  const rustRed = tinM(0x7a3f2b), rustDark = tinM(0x4f2d21), rustRun = tinM(0x37201b);
  const creamTin = tinM(0x8b6141), creamPale = tinM(0xa8875f);
  const tinRoof = tinM(0x6c4028, { side: THREE.DoubleSide }), tinRoofRust = tinM(0x37201b, { side: THREE.DoubleSide });
  const galv = tinM(0x8a8378), steel = tinM(0x6f6a62), steelPale = tinM(0x9a9588), steelDark = tinM(0x3a3a38);
  const timber = mat(0x4f2d21, 'timber'), timberDark = mat(0x37201b, 'timber');
  const concrete = mat(0x4a4a4c, 'stone');
  const cable = mat(0x110f12, 'metal', { roughness: 0.9 });
  const frosted = new THREE.MeshStandardMaterial({ color: 0xb9c2c4, roughness: 0.55, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });
  const doorGlass = new THREE.MeshStandardMaterial({ color: 0x8a7a5a, roughness: 0.3, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });
  const eCream = emis(0xd8ae70, 2.4), eYellow = emis(0xe5b055, 2.2), eBlue = emis(0x40559f, 2.6), eWarm = emis(0xbf7c42, 1.4);

  const HX = 2.4, ZF = 2.3, ZB = -2.7, W = 2 * HX, DEP = ZF - ZB, ZC = (ZF + ZB) / 2;
  const RY0 = 6.0, RY1 = 6.8, RX = 2.55, ROOF_Z0 = ZB - 0.2, ROOF_Z1 = ZF + 0.6, RL = ROOF_Z1 - ROOF_Z0, RZC = (ROOF_Z0 + ROOF_Z1) / 2;

  // --- plinth ---------------------------------------------------------------------------
  box(W + 0.08, 0.08, DEP + 0.08, 0, 0.04, ZC, black);
  box(W, 0.2, 0.4, 0, 0.1, ZF + 0.2, concrete);

  // --- ground floor: extruded rectangle with the door hole ---------------------------------
  {
    const sh = new THREE.Shape(); sh.moveTo(-HX, 0.08); sh.lineTo(HX, 0.08); sh.lineTo(HX, 3.2); sh.lineTo(-HX, 3.2); sh.closePath();
    const h = new THREE.Path(); h.moveTo(-1.05, 0.12); h.lineTo(-0.15, 0.12); h.lineTo(-0.15, 2.35); h.lineTo(-1.05, 2.35); h.closePath(); sh.holes.push(h);
    add(extrude(sh, DEP), rustRed, 0, 0, ZB);
  }
  // --- upper storey + gable: pentagon section extruded along z ---------------------------------
  {
    const sh = new THREE.Shape(); sh.moveTo(-HX, 3.2); sh.lineTo(HX, 3.2); sh.lineTo(HX, RY0); sh.lineTo(0, RY1 - 0.02); sh.lineTo(-HX, RY0); sh.closePath();
    add(extrude(sh, DEP), creamTin, 0, 0, ZB);
  }
  // panel colour fields
  box(0.02, 5.9, DEP, HX + 0.01, 3.05, ZC, green);
  box(W, 5.9, 0.02, 0, 3.05, ZB - 0.01, greenDark);
  box(0.02, 2.7, 2.6, -HX - 0.01, 4.65, 1.0, green);
  box(1.2, 0.9, 0.03, -1.6, 4.0, ZF + 0.015, rustRun);
  box(0.9, 1.6, 0.03, 1.2, 1.4, ZF + 0.015, rustDark);
  box(0.03, 2.2, 1.4, HX + 0.02, 1.3, -1.6, greenDark);
  box(0.03, 1.2, 1.8, HX + 0.02, 4.4, 0.9, greenPale);
  box(0.03, 1.5, 1.2, -HX - 0.02, 2.0, -1.4, rustRun);
  box(1.4, 1.8, 0.03, 1.2, 4.2, ZB - 0.02, greenPale);

  // --- corrugated skins: zigzag profile extruded up the wall ---------------------------------
  const skin = (L, H, m) => {
    const sh = new THREE.Shape(); sh.moveTo(0, 0);
    const n = Math.round(L / 0.05);
    for (let i = 0; i <= n; i++) sh.lineTo(i * (L / n), i % 2 ? -0.035 : -0.005);
    sh.lineTo(L, 0); sh.closePath();
    const geo = extrude(sh, H); geo.rotateX(-Math.PI / 2); return geo;
  };
  // front, in pieces around the door and window; right/left/back full height
  { const geo = skin(1.35, 3.0, rustDark); add(geo, rustDark, -2.4, 0.1, ZF); }
  { const geo = skin(2.5, 3.0, rustDark); add(geo, rustDark, -0.1, 0.1, ZF); }
  { const geo = skin(1.4, 2.7, creamPale); add(geo, creamPale, -2.4, 3.25, ZF); }
  { const geo = skin(1.4, 2.7, creamPale); add(geo, creamPale, 1.0, 2.25 + 1.0, ZF); }
  { const geo = skin(1.9, 0.8, creamPale); add(geo, creamPale, -0.95, 3.25, ZF); }
  { const geo = skin(1.9, 0.5, creamPale); add(geo, creamPale, -0.95, 5.45, ZF); }
  { const geo = skin(DEP, 5.85, greenDark); geo.rotateY(Math.PI / 2); add(geo, greenDark, HX, 0.1, ZF); }
  { const geo = skin(DEP, 5.85, rustDark); geo.rotateY(-Math.PI / 2); add(geo, rustDark, -HX, 0.1, ZB); }
  { const geo = skin(W, 5.85, greenDark); geo.rotateY(Math.PI); add(geo, greenDark, HX, 0.1, ZB); }
  // front gable skin: a triangle profile with ribs, extruded thin
  {
    const sh = new THREE.Shape(); sh.moveTo(-HX, RY0); sh.lineTo(HX, RY0); sh.lineTo(0, RY1 - 0.02); sh.closePath();
    add(extrude(sh, 0.03), creamPale, 0, 0, ZF);
    for (let a = -2.3; a <= 2.3; a += 0.1) { const h = Math.max(0.05, (RY1 - RY0) * (1 - Math.abs(a) / HX) - 0.06); box(0.032, h, 0.03, a, RY0 + h / 2, ZF + 0.04, creamTin); }
  }

  // --- door in its hole -------------------------------------------------------------------
  box(1.0, 2.35, 0.1, -0.6, 1.25, ZF + 0.02, galv);
  box(0.9, 2.2, 0.02, -0.6, 1.2, ZF - 0.4, eWarm);
  for (const s of [-1, 1]) box(0.06, 2.2, 0.5, -0.6 + s * 0.45, 1.2, ZF - 0.25, black);
  box(0.9, 0.06, 0.5, -0.6, 2.33, ZF - 0.25, black);
  box(0.42, 2.1, 0.05, -0.83, 1.2, ZF - 0.05, steelDark);
  box(0.3, 0.6, 0.02, -0.83, 1.6, ZF - 0.02, doorGlass);
  box(0.03, 0.4, 0.02, -0.66, 1.15, ZF - 0.01, galv);
  lights.push({ x: -0.6, y: 1.5, z: ZF - 0.1, color: 0xbf7c42, intensity: 0.6, range: 2.5 });

  // --- sign cluster: rounded-rect extruded boxes ------------------------------------------------
  const lightbox = (w, h, d, x, y, e) => {
    add(extrude(roundRect(w, h, 0.06), d), steelDark, x, y, ZF + 0.02);
    box(w - 0.1, h - 0.1, 0.03, x, y, ZF + 0.02 + d + 0.01, e);
    box(w - 0.1, 0.08, 0.035, x, y - h / 2 + 0.1, ZF + 0.02 + d + 0.01, rustRun);
    for (const s of [-1, 1]) box(0.05, 0.05, 0.14, x + s * (w / 2 - 0.1), y + h / 2 - 0.1, ZF - 0.03, steel);
    lights.push({ x, y, z: ZF + d + 0.4, color: 0xd8ae70, intensity: 0.9, range: 3.2 });
  };
  lightbox(0.8, 2.0, 0.25, -2.05, 4.55, eCream);
  lightbox(0.8, 1.6, 0.25, 2.05, 4.55, eYellow);
  lightbox(0.7, 1.2, 0.2, 0.95, 2.05, eCream);
  add(extrude(roundRect(0.45, 0.6, 0.05), 0.12), steelDark, 0.2, 2.3, ZF + 0.02);
  box(0.37, 0.52, 0.03, 0.2, 2.3, ZF + 0.15, eBlue);
  lights.push({ x: 0.2, y: 2.3, z: ZF + 0.4, color: 0x40559f, intensity: 0.6, range: 2.5 });

  // --- awning: corrugated profile extruded forward, on struts --------------------------------
  {
    const a = new THREE.Group(); a.position.set(0, 3.0, ZF); a.rotation.x = 0.18; g.add(a);
    const sh = new THREE.Shape(); sh.moveTo(-2.5, 0);
    for (let i = 0; i <= 66; i++) sh.lineTo(-2.5 + i * (5.0 / 66), i % 2 ? 0.05 : 0.02);
    sh.lineTo(2.5, 0); sh.closePath();
    a.add(new THREE.Mesh(extrude(sh, 0.8), tinRoof));
    const lip = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.07, 0.04), tinRoofRust); lip.position.set(0, 0.0, 0.8); a.add(lip);
    const rr = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.02, 0.5), tinRoofRust); rr.position.set(-1.2, 0.055, 0.45); a.add(rr);
  }
  for (const x of [-2.2, 2.2]) { cyl(0.02, 0.02, 0.9, 6, x, 2.6, ZF + 0.38, steel, 1.05, 0, 0); box(0.08, 0.08, 0.08, x, 2.2, ZF + 0.03, steel); }

  // --- frosted window ----------------------------------------------------------------------
  box(1.9, 1.3, 0.08, 0, 4.8, ZF + 0.04, steelPale);
  box(1.76, 1.16, 0.02, 0, 4.8, ZF + 0.09, frosted);
  box(0.04, 1.16, 0.04, 0, 4.8, ZF + 0.1, steelPale);
  box(1.9, 0.08, 0.16, 0, 4.11, ZF + 0.08, steelPale);
  box(1.76, 0.4, 0.02, 0, 4.4, ZF + 0.02, eWarm);
  lights.push({ x: 0, y: 4.8, z: ZF + 0.4, color: 0xd8ae70, intensity: 0.35, range: 2.0 });

  // --- front pipes, cables, boxes --------------------------------------------------------------
  cyl(0.03, 0.03, 5.6, 6, 2.3, 3.0, ZF + 0.08, galv);
  for (const y of [1.4, 3.6, 5.4]) box(0.1, 0.05, 0.1, 2.3, y, ZF + 0.06, steel);
  box(0.25, 0.35, 0.12, 2.15, 1.6, ZF + 0.09, steelPale);
  box(0.3, 0.4, 0.14, 2.1, 3.7, ZF + 0.09, steelPale);
  {
    const path = new THREE.CatmullRomCurve3([new THREE.Vector3(-2.3, 5.6, ZF + 0.07), new THREE.Vector3(-0.5, 5.35, ZF + 0.07), new THREE.Vector3(1.4, 5.5, ZF + 0.07), new THREE.Vector3(2.25, 5.0, ZF + 0.07)]);
    add(new THREE.TubeGeometry(path, 10, 0.012, 4, false), cable, 0, 0, 0);
    const p2 = new THREE.CatmullRomCurve3([new THREE.Vector3(2.25, 3.9, ZF + 0.08), new THREE.Vector3(1.4, 3.0, ZF + 0.08), new THREE.Vector3(0.5, 2.75, ZF + 0.08)]);
    add(new THREE.TubeGeometry(p2, 6, 0.012, 4, false), cable, 0, 0, 0);
  }
  box(0.15, 0.15, 0.1, -2.2, 1.0, ZF + 0.06, steelDark);

  // --- tin roof: corrugated profile (across z) extruded down each slope ------------------------
  const slopeLen = Math.hypot(RX, RY1 - RY0), ang = Math.atan2(RY1 - RY0, RX);
  for (const s of [1, -1]) {
    const r = new THREE.Group(); r.position.set(s * RX / 2, (RY0 + RY1) / 2, RZC); r.rotation.z = -s * ang; g.add(r);
    const sh = new THREE.Shape(); sh.moveTo(-RL / 2, 0);
    const n = Math.round(RL / 0.1);
    for (let i = 0; i <= n; i++) sh.lineTo(-RL / 2 + i * (RL / n), i % 2 ? 0.05 : 0.02);
    sh.lineTo(RL / 2, 0); sh.closePath();
    const geo = extrude(sh, slopeLen); geo.rotateY(Math.PI / 2); geo.translate(-slopeLen / 2, 0, 0);
    r.add(new THREE.Mesh(geo, tinRoof));
    const patch = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.02, 1.1), tinRoofRust); patch.position.set(s * 0.4, 0.055, s * 1.2); r.add(patch);
    const barge = new THREE.Mesh(new THREE.BoxGeometry(slopeLen + 0.1, 0.16, 0.04), timberDark); barge.position.set(0, 0, RL / 2 + 0.02); r.add(barge);
  }
  box(0.12, 0.1, RL, 0, RY1 + 0.02, RZC, tinRoofRust);
  for (const s of [1, -1]) cyl(0.045, 0.045, RL, 8, s * (RX + 0.03), RY0 - 0.04, RZC, galv, Math.PI / 2, 0, 0);
  {
    const path = new THREE.CatmullRomCurve3([new THREE.Vector3(RX + 0.05, RY0 - 0.04, ZF - 0.3), new THREE.Vector3(RX + 0.1, 5.5, ZF - 0.3), new THREE.Vector3(RX + 0.1, 0.4, ZF - 0.3), new THREE.Vector3(RX + 0.3, 0.1, ZF - 0.3)], false, 'catmullrom', 0.1);
    add(new THREE.TubeGeometry(path, 10, 0.04, 7, false), galv, 0, 0, 0);
    for (const y of [1.0, 3.2, 5.4]) box(0.14, 0.05, 0.14, RX + 0.02, y, ZF - 0.3, steel);
  }

  // --- water tank: lathe, on a stand ----------------------------------------------------------
  {
    const tx = -0.9, tz = -1.4, ty = 6.6;
    const pts = [new THREE.Vector2(0.0, 0), new THREE.Vector2(0.5, 0), new THREE.Vector2(0.55, 0.04), new THREE.Vector2(0.55, 0.62), new THREE.Vector2(0.58, 0.66), new THREE.Vector2(0.55, 0.7), new THREE.Vector2(0.5, 0.72), new THREE.Vector2(0.3, 0.75), new THREE.Vector2(0.0, 0.76)];
    add(new THREE.LatheGeometry(pts, 14), steelPale, tx, ty, tz);
    add(new THREE.TorusGeometry(0.56, 0.02, 4, 14), steel, tx, ty + 0.3, tz, Math.PI / 2, 0, 0);
    box(0.02, 0.4, 0.5, tx + 0.56, ty + 0.3, tz, rustRun);
    for (const [dx, dz] of [[-0.4, -0.4], [0.4, -0.4], [-0.4, 0.4], [0.4, 0.4]]) {
      const lx = tx + dx, roofY = RY1 - (RY1 - RY0) * Math.abs(lx) / RX;
      box(0.06, ty - roofY + 0.06, 0.06, lx, (ty + roofY) / 2, tz + dz, steel);
    }
    box(1.1, 0.08, 1.1, tx, ty - 0.04, tz, steel);
    const pipe = new THREE.CatmullRomCurve3([new THREE.Vector3(tx + 0.3, ty + 0.78, tz + 0.3), new THREE.Vector3(tx + 0.9, ty + 0.9, tz + 0.3), new THREE.Vector3(tx + 1.0, ty + 0.5, tz + 0.3), new THREE.Vector3(tx + 1.0, ty - 0.6, tz + 0.3)]);
    add(new THREE.TubeGeometry(pipe, 8, 0.03, 5, false), galv, 0, 0, 0);
  }

  // --- right side ----------------------------------------------------------------------------
  box(0.16, 0.5, 0.4, HX + 0.12, 4.2, 0.8, steelPale); box(0.16, 0.35, 0.3, HX + 0.12, 3.5, 1.3, steelPale);
  box(0.2, 0.6, 0.35, HX + 0.14, 1.5, 0.3, steelPale);
  for (const y of [3.9, 3.82]) cyl(0.02, 0.02, 4.8, 6, HX + 0.08, y, -0.4, cable, Math.PI / 2, 0, 0);
  for (let z = ZB + 0.3; z < ZF; z += 0.5) box(0.06, 0.12, 0.05, HX + 0.07, 3.86, z, galv);
  cyl(0.03, 0.03, 5.6, 6, HX + 0.1, 3.0, -2.1, galv);
  for (const y of [1.0, 3.0, 5.2]) box(0.1, 0.05, 0.1, HX + 0.08, y, -2.1, steel);
  box(0.25, 0.5, 0.5, HX + 0.15, 2.4, -1.0, steelDark);
  add(new THREE.TorusGeometry(0.16, 0.025, 5, 14), steel, HX + 0.29, 2.4, -1.0, 0, Math.PI / 2, 0);
  box(0.03, 0.9, 0.5, HX + 0.04, 1.8, -1.0, rustRun);
  box(0.12, 0.25, 0.25, HX + 0.1, 5.3, 1.6, steel);
  // --- left side ------------------------------------------------------------------------------
  box(0.08, 0.8, 0.9, -HX - 0.06, 4.7, 0.2, steelPale); box(0.02, 0.7, 0.8, -HX - 0.11, 4.7, 0.2, frosted);
  for (const z of [-0.05, 0.2, 0.45]) box(0.03, 0.75, 0.02, -HX - 0.12, 4.7, z, steel);
  add(extrude(roundRect(0.75, 0.55, 0.05), 0.3), steelPale, -HX - 0.05, 2.7, -1.2, 0, -Math.PI / 2, 0);
  add(new THREE.TorusGeometry(0.17, 0.02, 5, 16), steel, -HX - 0.36, 2.7, -1.1, 0, Math.PI / 2, 0);
  for (const z of [-1.5, -0.9]) box(0.34, 0.04, 0.04, -HX - 0.19, 2.4, z, steel);
  box(0.03, 0.6, 0.7, -HX - 0.04, 2.0, -1.2, rustRun);
  cyl(0.04, 0.04, 5.7, 8, -HX - 0.12, 3.0, 1.6, galv);
  for (const y of [1.0, 3.2, 5.4]) box(0.14, 0.05, 0.14, -HX - 0.08, y, 1.6, steel);
  add(new THREE.LatheGeometry([new THREE.Vector2(0, 0), new THREE.Vector2(0.28, 0), new THREE.Vector2(0.3, 0.8), new THREE.Vector2(0.26, 0.85), new THREE.Vector2(0, 0.86)], 10), steelDark, -HX - 0.45, 0.0, -2.2);
  box(0.15, 0.25, 0.2, -HX - 0.1, 1.4, 0.4, steelDark);
  // --- back --------------------------------------------------------------------------------------
  box(1.0, 2.2, 0.1, 1.4, 1.2, ZB - 0.07, timberDark); box(0.86, 2.06, 0.05, 1.4, 1.2, ZB - 0.11, timber);
  box(0.06, 0.2, 0.05, 1.05, 1.1, ZB - 0.15, steel);
  box(0.6, 0.3, 0.3, 1.4, 2.55, ZB - 0.2, tinRoof);
  for (const x of [-1.5, 0.2]) { box(0.7, 0.6, 0.08, x, 4.7, ZB - 0.06, steelPale); box(0.6, 0.5, 0.02, x, 4.7, ZB - 0.11, frosted); }
  cyl(0.13, 0.13, 4.8, 8, -0.8, 2.8, ZB - 0.22, galv);
  add(new THREE.TorusGeometry(0.2, 0.13, 6, 8, Math.PI / 2), galv, -0.8, 5.2, ZB - 0.04, Math.PI, Math.PI / 2, 0);
  box(0.9, 0.5, 0.45, -0.8, 3.3, ZB - 0.3, steelPale);
  box(0.03, 1.2, 0.6, -0.8, 4.2, ZB - 0.055, rustRun);
  for (const x of [-2.15, -1.75]) box(0.05, 6.4, 0.05, x, 3.25, ZB - 0.22, steel);
  for (let y = 0.5; y < 6.3; y += 0.4) cyl(0.015, 0.015, 0.4, 5, -1.95, y, ZB - 0.22, steel, 0, 0, Math.PI / 2);
  box(0.3, 0.5, 0.15, 2.0, 3.8, ZB - 0.1, steelPale);

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((L) => ({ ...L, x: L.x - c.x, y: L.y - bb.min.y, z: L.z - c.z }));
  return g;
}
