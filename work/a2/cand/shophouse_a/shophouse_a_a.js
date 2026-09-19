// shophouse_a — arm A: primitives assembly.
// Two-storey ramen shophouse, 5.0 w x 7.0 h x 6.0 d, front +Z. Ground floor is a lit
// cavity behind a sliding glass front; the rest of the mass is solid. Gable roof with the
// ridge along x (front slope over the street). All four faces carry fittings.
// Lights: 4 lanterns, the lightbox, the interior, the upper window.
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

  // materials
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
  const eLantern = emis(0xb8302a, 2.6);

  const HX = 2.4, ZF = 2.3, ZB = -2.7; // body half width, front, back

  // --- grounding band, plinth, step ---------------------------------------------------
  box(2 * HX + 0.06, 0.08, ZF - ZB + 0.06, 0, 0.04, (ZF + ZB) / 2, black);
  box(3.6, 0.08, 0.5, 0, 0.04, ZF + 0.25, concrete);            // concrete step
  box(0.5, 0.06, 0.25, 2.0, 0.11, ZF + 0.15, concrete);           // a loose slab

  // --- ground floor mass and the lit cavity ------------------------------------------
  box(2 * HX, 3.12, 0.9 - ZB, 0, 1.64, (0.9 + ZB) / 2, plank);    // solid back-of-house
  box(2 * HX, 0.1, ZF - 0.9, 0, 0.13, (ZF + 0.9) / 2, plankLit);  // cavity floor
  box(2 * HX, 0.2, ZF - 0.9, 0, 3.1, (ZF + 0.9) / 2, plankLit);   // cavity ceiling
  for (const s of [1, -1]) box(0.16, 3.0, ZF - 0.9, s * (HX - 0.08), 1.6, (ZF + 0.9) / 2, plank); // cavity side walls
  box(2 * HX - 0.3, 2.7, 0.04, 0, 1.55, 0.93, eInterior);        // lit back wall
  lights.push({ x: 0, y: 1.9, z: 1.6, color: 0xd8ae70, intensity: 1.0, range: 4.0 });
  box(2.6, 0.9, 0.5, 0.4, 0.63, 1.45, plank);                     // counter
  box(2.7, 0.06, 0.6, 0.4, 1.11, 1.45, plankLit);                 // counter top
  for (const x of [-0.5, 0.2, 0.9]) { cyl(0.15, 0.15, 0.05, 8, x, 0.66, 1.95, plankFaded); cyl(0.03, 0.03, 0.5, 6, x, 0.4, 1.95, steel); }
  for (const y of [2.0, 2.4]) box(2.4, 0.04, 0.25, 0.3, y, 1.06, plankLit);   // shelves
  for (let i = 0; i < 6; i++) box(0.08, 0.22, 0.08, -0.7 + i * 0.4, 2.13, 1.06, i % 2 ? red : cream); // bottles
  box(0.7, 1.4, 0.6, -1.8, 0.85, 1.35, steelPale);               // fridge / stock box
  box(0.8, 0.4, 0.6, 1.9, 0.35, 1.3, plankFaded);                 // a crate

  // --- sliding glass front ---------------------------------------------------------------
  box(2 * HX, 0.14, 0.16, 0, 0.25, ZF, plankDark);                // sill
  box(2 * HX, 0.22, 0.2, 0, 3.05, ZF, plankDark);                 // head beam
  for (const s of [1, -1]) box(0.16, 3.2, 0.16, s * (HX - 0.08), 1.6, ZF, plankDark); // corner posts
  box(2 * HX - 0.3, 2.65, 0.02, 0, 1.65, ZF + 0.02, glass);        // the glass, one sheet
  for (const x of [-1.25, -0.42, 0.42, 1.25]) box(0.06, 2.65, 0.08, x, 1.65, ZF + 0.04, steelPale); // sash stiles
  for (const y of [0.34, 1.05, 2.25, 2.95]) box(2 * HX - 0.3, 0.05, 0.08, 0, y, ZF + 0.04, steelPale); // sash rails
  box(0.05, 0.3, 0.04, 0.34, 1.3, ZF + 0.1, steel);               // door pull
  box(0.9, 0.04, 0.06, 0, 0.36, ZF + 0.08, galv);                 // door track
  box(0.7, 0.9, 0.3, -1.9, 0.53, ZF + 0.3, steelPale);            // a stacked beer crate by the door
  box(0.7, 0.9, 0.3, -1.9, 0.5, ZF + 0.3, mat(0xf8e845, 'plaster')); // bright yellow crate behind

  // --- noren curtain: three panels of red/cream stripes -------------------------------------
  cyl(0.015, 0.015, 3.6, 6, 0, 2.6, ZF + 0.3, steel, 0, 0, Math.PI / 2);
  for (const cx of [-1.15, 0, 1.15]) {
    for (let i = 0; i < 10; i++) {
      const x = cx - 0.45 + 0.045 + i * 0.09;
      box(0.09, 0.85, 0.02, x, 2.18, ZF + 0.3 + (i % 2 ? 0.01 : -0.01), i % 2 ? cream : red);
    }
  }

  // --- tin awning at 3.0 m with ribs and struts ------------------------------------------
  {
    const a = new THREE.Group(); a.position.set(0, 3.0, ZF); a.rotation.x = 0.2; g.add(a);
    const sheet = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.03, 0.78), tin); sheet.position.set(0, 0, 0.39); a.add(sheet);
    for (let i = 0; i < 26; i++) {
      const x = -2.4 + i * 0.192;
      const r = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.03, 0.78), (i % 7 === 3 || i === 12) ? tinRust : tin);
      r.position.set(x, 0.03, 0.39); a.add(r);
    }
    const lip = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.08, 0.04), tinRust); lip.position.set(0, -0.02, 0.78); a.add(lip);
    const rustRun = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.035, 0.6), tinRust); rustRun.position.set(1.4, 0.005, 0.35); a.add(rustRun);
  }
  for (const x of [-2.1, 0, 2.1]) cyl(0.02, 0.02, 0.83, 6, x, 2.625, ZF + 0.36, steel, 1.0, 0, 0);

  // --- four red lanterns under the awning --------------------------------------------------
  for (const x of [-1.5, -0.5, 0.5, 1.5]) {
    const y = 2.5, z = ZF + 0.55;
    const l = add(new THREE.SphereGeometry(0.225, 10, 8), eLantern, x, y, z); l.scale.set(1, 0.85, 1);
    cyl(0.09, 0.09, 0.05, 8, x, y + 0.2, z, ringMat);
    cyl(0.09, 0.09, 0.05, 8, x, y - 0.2, z, ringMat);
    cyl(0.006, 0.006, 0.22, 4, x, y + 0.32, z, steel);
    lights.push({ x, y, z, color: 0xe86a3a, intensity: 0.8, range: 3.5 });
  }

  // --- horizontal lightbox above the awning -----------------------------------------------
  box(3.8, 0.95, 0.22, 0, 3.78, ZF + 0.11, steel);
  box(3.7, 0.72, 0.03, 0, 3.86, ZF + 0.23, eSign);
  box(3.7, 0.12, 0.035, 0, 3.4, ZF + 0.23, redPaint);
  box(0.5, 0.95, 0.01, -1.45, 3.78, ZF + 0.23, tinRust);           // a rust bloom down the frame
  lights.push({ x: 0, y: 3.85, z: ZF + 0.6, color: 0xd8ae70, intensity: 1.2, range: 4.0 });

  // --- upper floor body and front wall ----------------------------------------------------
  box(2 * HX, 2.8, ZF - 0.2 - ZB, 0, 4.6, (ZF - 0.2 + ZB) / 2, plank);
  box(2 * HX, 2.8, 0.2, 0, 4.6, ZF - 0.1, plank);
  // plank battens on the front wall, skipping the window bay
  for (let x = -2.25; x <= 2.26; x += 0.3) if (Math.abs(x) > 1.2) box(0.035, 2.7, 0.03, x, 4.6, ZF + 0.01, plankDark);
  box(0.03, 2.7, 0.9, 0, 4.6, ZF + 0.005, plankFaded).scale.set(1, 1, 1); // (kept simple)
  // window: sash frame, lit pane behind, glass in front
  box(0.06, 1.4, 0.06, -1.13, 5.0, ZF + 0.03, steelPale); box(0.06, 1.4, 0.06, 1.13, 5.0, ZF + 0.03, steelPale);
  box(2.32, 0.06, 0.06, 0, 5.67, ZF + 0.03, steelPale); box(2.32, 0.06, 0.06, 0, 4.33, ZF + 0.03, steelPale);
  box(0.04, 1.3, 0.05, 0, 5.0, ZF + 0.04, steelPale);
  box(2.2, 1.28, 0.02, 0, 5.0, ZF - 0.02, eWindow);
  box(2.2, 1.28, 0.02, 0, 5.0, ZF + 0.03, glass);
  lights.push({ x: 0, y: 5.0, z: ZF + 0.4, color: 0xe5b055, intensity: 0.5, range: 2.5 });
  // balcony platform and rail
  box(2.7, 0.08, 0.42, 0, 4.26, ZF + 0.21, plankDark);
  for (const x of [-1.32, -0.66, 0, 0.66, 1.32]) box(0.035, 0.95, 0.035, x, 4.75, ZF + 0.4, steel);
  box(2.7, 0.04, 0.04, 0, 5.22, ZF + 0.4, steel); box(2.7, 0.03, 0.03, 0, 4.75, ZF + 0.4, steel);
  box(0.28, 0.42, 0.03, -0.9, 5.0, ZF + 0.44, mat(0x3a4a6a, 'fabric', { side: THREE.DoubleSide }));   // laundry
  box(0.25, 0.5, 0.03, -0.55, 4.96, ZF + 0.44, cream);
  box(0.3, 0.38, 0.03, 0.7, 5.02, ZF + 0.44, plankFaded);
  // AC unit on a bracket, with a rust run under it (wear)
  box(0.75, 0.55, 0.3, 1.85, 4.95, ZF + 0.15, steelPale);
  add(new THREE.TorusGeometry(0.17, 0.02, 5, 16), steel, 1.72, 4.95, ZF + 0.31);
  box(0.16, 0.4, 0.01, 2.12, 4.95, ZF + 0.31, steel);
  box(0.04, 0.04, 0.34, 1.55, 4.65, ZF + 0.17, steel); box(0.04, 0.04, 0.34, 2.15, 4.65, ZF + 0.17, steel);
  box(0.5, 0.5, 0.015, 1.85, 4.4, ZF + 0.01, tinRust);
  // an electrical box and cables on the front pier
  box(0.28, 0.4, 0.12, -2.2, 3.55, ZF + 0.06, steel);
  cyl(0.015, 0.015, 2.6, 5, -2.25, 4.9, ZF + 0.03, black);

  // --- roof: gable, ridge along x ---------------------------------------------------------
  {
    const f = new THREE.Group(); f.position.set(0, 6.5, 1.4); f.rotation.x = Math.atan2(1.0, 3.0); g.add(f);
    const slab = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.12, 3.16), tile); f.add(slab);
    for (let k = 0; k < 10; k++) { const r = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.045, 0.06), k % 3 === 1 ? tileWorn : tile); r.position.set(0, 0.08, -1.5 + k * 0.33); f.add(r); }
    const b = new THREE.Group(); b.position.set(0, 6.5, -1.55); b.rotation.x = -Math.atan2(1.0, 2.9); g.add(b);
    const slab2 = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.12, 3.07), tile); b.add(slab2);
    for (let k = 0; k < 9; k++) { const r = new THREE.Mesh(new THREE.BoxGeometry(5.0, 0.045, 0.06), k % 4 === 2 ? tileWorn : tile); r.position.set(0, 0.08, -1.4 + k * 0.34); b.add(r); }
  }
  cyl(0.08, 0.08, 5.1, 6, 0, 7.0, -0.1, tileWorn, 0, 0, Math.PI / 2);   // ridge cap
  {
    const sh = new THREE.Shape(); sh.moveTo(2.9, 6.0); sh.lineTo(-0.1, 7.0); sh.lineTo(-3.0, 6.0); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.1, bevelEnabled: false });
    add(geo, plankDark, HX + 0.05, 0, 0, 0, -Math.PI / 2, 0);
    add(geo, plankDark, -HX + 0.05, 0, 0, 0, -Math.PI / 2, 0);
  }
  box(5.0, 0.15, 0.05, 0, 5.95, 2.9, plankDark);                 // front fascia
  cyl(0.05, 0.05, 5.0, 8, 0, 5.92, 2.95, galv, 0, 0, Math.PI / 2); // gutter
  box(5.0, 0.15, 0.05, 0, 5.95, -3.0, plankDark);                // back fascia
  // drainpipe down the left front corner
  cyl(0.04, 0.04, 5.7, 8, -HX - 0.06, 3.0, ZF + 0.1, galv);
  box(0.1, 0.1, 0.1, -HX - 0.06, 5.9, ZF + 0.1, galv);
  cyl(0.04, 0.04, 0.5, 8, -HX - 0.06, 5.9, ZF + 0.35, galv, Math.PI / 2, 0, 0);
  for (const y of [1.0, 3.3, 5.3]) box(0.14, 0.05, 0.14, -HX - 0.03, y, ZF + 0.1, steel);
  cyl(0.06, 0.05, 0.3, 8, -HX - 0.06, 0.2, ZF + 0.1, black);       // shoe

  // --- left side (x = -HX): battens, pipe, barred window, meter, faded panel ---------------
  for (let z = ZB + 0.15; z < ZF - 0.05; z += 0.3) box(0.03, 5.8, 0.035, -HX - 0.01, 3.1, z, plankDark);
  box(0.02, 1.7, 1.1, -HX - 0.02, 1.9, -1.8, plankFaded);         // faded/patched panel
  cyl(0.04, 0.04, 5.6, 8, -HX - 0.08, 3.0, -0.9, galv);
  for (const y of [1.2, 3.4, 5.4]) box(0.14, 0.05, 0.12, -HX - 0.05, y, -0.9, steel);
  box(0.06, 0.8, 0.7, -HX - 0.03, 4.8, 0.6, steelPale);
  box(0.02, 0.7, 0.6, -HX - 0.07, 4.8, 0.6, glass);
  for (const z of [0.4, 0.6, 0.8]) box(0.03, 0.75, 0.02, -HX - 0.08, 4.8, z, steel);
  box(0.25, 0.3, 0.3, -HX - 0.1, 2.7, 1.3, galv);                 // vent hood
  box(0.02, 0.5, 0.3, -HX - 0.02, 2.3, 1.3, tinRust);             // stain under it
  box(0.2, 0.4, 0.3, -HX - 0.08, 1.2, 0.3, steel);                // gas meter
  cyl(0.02, 0.02, 1.0, 6, -HX - 0.1, 0.6, 0.3, galv);
  box(0.02, 0.4, 2.0, -HX - 0.02, 0.25, -1.3, tinRust);           // splash stain band

  // --- right side (x = +HX): battens, ACs, conduit, small window, panel box ---------------
  for (let z = ZB + 0.15; z < ZF - 0.05; z += 0.3) box(0.03, 5.8, 0.035, HX + 0.01, 3.1, z, plankDark);
  box(0.3, 0.55, 0.75, HX + 0.15, 4.7, 0.3, steelPale);
  add(new THREE.TorusGeometry(0.17, 0.02, 5, 16), steel, HX + 0.31, 4.7, 0.42, 0, Math.PI / 2, 0);
  box(0.34, 0.04, 0.04, HX + 0.17, 4.4, 0.0, steel); box(0.34, 0.04, 0.04, HX + 0.17, 4.4, 0.6, steel);
  box(0.015, 0.5, 0.6, HX + 0.01, 4.1, 0.3, tinRust);
  box(0.3, 0.5, 0.65, HX + 0.15, 2.5, -1.5, steelPale);
  add(new THREE.TorusGeometry(0.15, 0.02, 5, 16), steel, HX + 0.31, 2.5, -1.4, 0, Math.PI / 2, 0);
  box(0.34, 0.04, 0.04, HX + 0.17, 2.2, -1.8, steel); box(0.34, 0.04, 0.04, HX + 0.17, 2.2, -1.2, steel);
  cyl(0.025, 0.025, 4.6, 6, HX + 0.05, 3.5, -0.3, galv, Math.PI / 2, 0, 0);
  cyl(0.025, 0.025, 3.0, 6, HX + 0.05, 2.0, -2.4, galv);
  box(0.12, 0.35, 0.28, HX + 0.06, 1.3, 1.6, steel);
  box(0.06, 0.7, 0.6, HX + 0.03, 5.0, -1.6, steelPale);
  box(0.02, 0.6, 0.5, HX + 0.07, 5.0, -1.6, glass);
  box(0.02, 1.4, 0.9, HX + 0.02, 1.4, 1.2, plankFaded);

  // --- back (z = ZB): battens, door, duct and hood, small window ---------------------------
  for (let x = -HX + 0.15; x < HX - 0.05; x += 0.3) box(0.035, 5.8, 0.03, x, 3.1, ZB - 0.01, plankDark);
  box(1.0, 2.2, 0.08, -1.3, 1.18, ZB - 0.03, plankDark);
  box(0.86, 2.06, 0.05, -1.3, 1.18, ZB - 0.06, plank);
  box(0.06, 0.2, 0.05, -1.65, 1.1, ZB - 0.1, steel);
  box(0.6, 0.3, 0.3, -1.3, 2.55, ZB - 0.15, tin);                 // door hood
  cyl(0.13, 0.13, 5.0, 8, 1.5, 2.9, ZB - 0.18, galv);             // duct
  add(new THREE.TorusGeometry(0.2, 0.13, 6, 8, Math.PI / 2), galv, 1.5, 5.4, ZB - 0.0, Math.PI, Math.PI / 2, 0);
  box(0.9, 0.5, 0.45, 1.5, 3.4, ZB - 0.25, steelPale);            // extractor hood
  box(0.02, 1.2, 0.6, 1.5, 4.3, ZB - 0.02, tinRust);              // grease stain above it
  box(0.7, 0.6, 0.06, 0.2, 4.9, ZB - 0.03, steelPale);
  box(0.6, 0.5, 0.02, 0.2, 4.9, ZB - 0.07, glass);
  box(0.3, 0.2, 0.05, -2.1, 3.9, ZB - 0.04, plankFaded);          // a patch
  box(2 * HX, 0.4, 0.02, 0, 0.3, ZB - 0.02, tinRust);             // splash band

  // --- contract placement ----------------------------------------------------------------
  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((L) => ({ ...L, x: L.x - c.x, y: L.y - bb.min.y, z: L.z - c.z }));
  return g;
}
