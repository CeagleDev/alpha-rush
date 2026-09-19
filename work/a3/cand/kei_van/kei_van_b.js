// kei_van — arm B: profiles. The whole body is ONE side-elevation THREE.Shape
// (sill line with two wheel arches cut by absarc, flat nose, raked
// windscreen line, rounded roof corners) extruded across the 1.46 m width.
// Windows are rounded-rect extrusions, wheels and headlight buckets are
// LatheGeometry profiles, bumpers a C-channel section with a dent.
// 3.4 × 1.5 × 1.9 m, faded white with rust, blank nose panel (no badge),
// sliding-door seam and runner, rear double doors, red tail-lights, tube
// roof rack. Front = +Z, base y = 0, block obstacle.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const BODY = mk(0xd9d3c4, "metal", { roughness: 0.75 });       // faded white
  const BODY2 = mk(0xc9c2b1, "metal", { roughness: 0.85 });      // dirtier panel
  const BODY3 = mk(0xe6ddd0, "metal", { roughness: 0.7 });       // roof, less weathered
  const RUST = mk(0x4f2d21, "metal", { roughness: 0.95, metalness: 0.15 });
  const RUST2 = mk(0x37201b, "metal", { roughness: 0.95, metalness: 0.15 });
  const RUSTL = mk(0x8b6141, "metal", { roughness: 0.92, metalness: 0.1 });
  const STEEL = mk(0x8a8a86, "metal", { roughness: 0.6, metalness: 0.5 });
  const CHROME = mk(0xb9c4cc, "metal", { roughness: 0.4, metalness: 0.7 });
  const GUN = mk(0x3a3a3c, "metal", { roughness: 0.75, metalness: 0.35 });
  const BLACK = mk(0x110f12, "metal", { roughness: 0.9, metalness: 0.1 });
  const RUB = mk(0x1b1c1e, "metal", { roughness: 0.95, metalness: 0 });
  const GLASS = new THREE.MeshStandardMaterial({ color: 0x2f3a48, roughness: 0.15, metalness: 0.2, transparent: true, opacity: 0.9, forceSinglePass: true });
  const HEAD = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xe5b055), emissiveIntensity: 2.4, roughness: 0.35 });
  const TAIL = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xb8302a), emissiveIntensity: 1.8, roughness: 0.35 });
  const AMBER = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xbf7c42), emissiveIntensity: 2.0, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const CYL = (r1, r2, h, s) => new THREE.CylinderGeometry(r1, r2, h, s);
  const ex = (shape, depth, seg = 6) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: seg, steps: 1 });
    geo.translate(0, 0, -depth / 2); return geo;
  };
  const rrect = (w, h, r) => {
    const s = new THREE.Shape();
    s.moveTo(-w / 2 + r, -h / 2); s.lineTo(w / 2 - r, -h / 2); s.quadraticCurveTo(w / 2, -h / 2, w / 2, -h / 2 + r);
    s.lineTo(w / 2, h / 2 - r); s.quadraticCurveTo(w / 2, h / 2, w / 2 - r, h / 2); s.lineTo(-w / 2 + r, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - r); s.lineTo(-w / 2, -h / 2 + r); s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + r, -h / 2);
    return s;
  };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));
  // a profile drawn in (z, y) and extruded across x: rotation.y = -PI/2 maps local x -> world +z
  const across = (geo, mat, x, y, z) => add(geo, mat, x, y, z, 0, -Math.PI / 2, 0);

  const W = 1.5, R = 0.27, AXF = 1.05, AXR = -0.95, TX = 0.62;
  // ---- the body: side elevation in (z, y) ---------------------------------------
  const AR = 0.36, Y0 = 0.42, dy = Y0 - 0.27, dz = Math.sqrt(AR * AR - dy * dy);
  const a0 = Math.atan2(dy, -dz), a1 = Math.atan2(dy, dz);
  const S = new THREE.Shape();
  S.moveTo(-1.65, Y0);
  S.lineTo(AXR - dz, Y0); S.absarc(AXR, 0.27, AR, a0, a1, true);
  S.lineTo(AXF - dz, Y0); S.absarc(AXF, 0.27, AR, a0, a1, true);
  S.lineTo(1.62, Y0); S.lineTo(1.62, 1.10); S.lineTo(1.50, 1.62);
  S.quadraticCurveTo(1.48, 1.74, 1.34, 1.74); S.lineTo(-1.55, 1.74);
  S.quadraticCurveTo(-1.65, 1.74, -1.65, 1.62); S.closePath();
  across(ex(S, W - 0.04, 6), BODY, 0, 0, 0);
  // black foot band along both sills (grounding), and the chassis pan under it
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.012, 0.05, 0.45), BLACK, sx * (W / 2 - 0.02), Y0 + 0.025, -0.15);
    add(new THREE.BoxGeometry(0.012, 0.05, 0.2), BLACK, sx * (W / 2 - 0.02), Y0 + 0.025, 1.52);
    add(new THREE.BoxGeometry(0.012, 0.05, 0.25), BLACK, sx * (W / 2 - 0.02), Y0 + 0.025, -1.52);
    add(new THREE.BoxGeometry(0.02, 0.36, 0.7), BLACK, sx * 0.53, 0.45, AXF);        // arch liners
    add(new THREE.BoxGeometry(0.02, 0.36, 0.7), BLACK, sx * 0.53, 0.45, AXR);
  }
  add(new THREE.BoxGeometry(1.1, 0.2, 2.9), GUN, 0, 0.32, 0.0);
  // roof crown and a rust bloom along its edge
  add(new THREE.BoxGeometry(W - 0.2, 0.02, 2.8), BODY3, 0, 1.75, -0.15);
  add(new THREE.BoxGeometry(0.5, 0.012, 0.35), RUST, -0.35, 1.762, 0.4);
  // ---- glass: rounded rectangles, proud 4 mm --------------------------------------
  add(ex(rrect(1.28, 0.56, 0.06), 0.02), GLASS, 0, 1.37, 1.565, -0.227, 0, 0);       // windscreen, leans back
  for (const sx of [-1, 1]) {
    const x = sx * (W / 2 - 0.02 + 0.008);
    across(ex(rrect(0.72, 0.46, 0.05), 0.016), GLASS, x, 1.36, 1.02);                 // front door
    across(ex(rrect(0.66, 0.44, 0.05), 0.016), GLASS, x, 1.35, 0.22);                 // sliding door
    across(ex(rrect(0.96, 0.44, 0.05), 0.016), GLASS, x, 1.35, -0.88);                // rear quarter
  }
  for (const sx of [-1, 1]) add(ex(rrect(0.52, 0.38, 0.05), 0.016), GLASS, sx * 0.34, 1.36, -1.655);   // rear doors
  // ---- nose: blank panel, headlight buckets (lathe), indicators, grille, bumper --
  const BUCKET = V2([[0, 0], [0.10, 0], [0.10, 0.05], [0.09, 0.05], [0.085, 0.045], [0.02, 0.045]]);
  for (const sx of [-1, 1]) {
    add(new THREE.LatheGeometry(BUCKET, 14), CHROME, sx * 0.5, 0.92, 1.62, Math.PI / 2, 0, 0);
    add(CYL(0.082, 0.082, 0.02, 14), HEAD, sx * 0.5, 0.92, 1.655, Math.PI / 2, 0, 0);
    add(new THREE.BoxGeometry(0.16, 0.09, 0.02), GUN, sx * 0.55, 0.62, 1.625);
    add(new THREE.BoxGeometry(0.13, 0.06, 0.02), AMBER, sx * 0.55, 0.62, 1.635);
  }
  add(new THREE.BoxGeometry(0.6, 0.12, 0.02), GUN, 0, 0.66, 1.625);
  for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.56, 0.012, 0.02), CHROME, 0, 0.62 + i * 0.026, 1.635);
  add(new THREE.BoxGeometry(0.36, 0.14, 0.012), BODY2, 0, 0.85, 1.626);           // blank plate pad
  add(new THREE.BoxGeometry(0.3, 0.16, 0.014), RUST, -0.35, 1.0, 1.627);           // rust on the nose
  add(new THREE.BoxGeometry(0.5, 0.02, 0.012), GUN, -0.25, 1.13, 1.62, -0.25, 0, 0.35);   // wipers
  add(new THREE.BoxGeometry(0.5, 0.02, 0.012), GUN, 0.35, 1.13, 1.62, -0.25, 0, 0.35);
  // bumpers: C-channel section in (z, y), across the width; front one dented
  const CCH = new THREE.Shape();
  CCH.moveTo(0, 0); CCH.lineTo(0.08, 0); CCH.lineTo(0.08, 0.14); CCH.lineTo(0, 0.14); CCH.lineTo(0, 0.11); CCH.lineTo(0.05, 0.11); CCH.lineTo(0.05, 0.03); CCH.lineTo(0, 0.03); CCH.closePath();
  across(ex(CCH, W, 2), STEEL, 0, 0.42, 1.62);
  add(new THREE.BoxGeometry(0.3, 0.10, 0.04), GUN, -0.4, 0.49, 1.68);              // the dent
  add(new THREE.BoxGeometry(0.12, 0.14, 0.05), RUST2, 0.6, 0.49, 1.69);
  const RCH = new THREE.Shape();
  RCH.moveTo(0, 0); RCH.lineTo(-0.08, 0); RCH.lineTo(-0.08, 0.14); RCH.lineTo(0, 0.14); RCH.closePath();
  across(ex(RCH, W, 2), STEEL, 0, 0.42, -1.65);
  add(new THREE.BoxGeometry(0.5, 0.05, 0.03), RUST2, 0.3, 0.45, -1.72);
  // ---- sides: seams, runner, handles, mirrors, rust ---------------------------------
  for (const sx of [-1, 1]) {
    const x = sx * (W / 2 - 0.02 + 0.006);
    for (const z of [1.42, 0.60, -0.20]) add(new THREE.BoxGeometry(0.006, 1.0, 0.012), BLACK, x, 0.95, z);
    add(new THREE.BoxGeometry(0.006, 0.012, 0.8), BLACK, x, 0.47, 1.0);
    add(new THREE.BoxGeometry(0.03, 0.04, 1.0), GUN, x + sx * 0.008, 1.02, -0.70);   // sliding-door runner
    add(new THREE.BoxGeometry(0.04, 0.10, 0.06), STEEL, x + sx * 0.012, 0.92, 0.95);
    add(new THREE.BoxGeometry(0.06, 0.04, 0.04), GUN, sx * 0.765, 1.30, 1.38);
    add(new THREE.BoxGeometry(0.10, 0.16, 0.05), GUN, sx * 0.80, 1.30, 1.33);
    add(new THREE.BoxGeometry(0.006, 0.10, 0.5), RUST, x, 0.52, sx > 0 ? 0.0 : -0.9);
    add(new THREE.BoxGeometry(0.006, 0.07, 0.35), RUST2, x, 0.60, sx > 0 ? -1.0 : 0.15);
    add(new THREE.BoxGeometry(0.006, 0.05, 0.6), RUSTL, x, 1.0, -0.9);
  }
  add(new THREE.BoxGeometry(0.012, 0.34, 0.55), BODY2, -(W / 2 - 0.02 + 0.006), 0.80, -0.85);   // faded panel
  add(new THREE.BoxGeometry(0.012, 0.14, 0.28), RUST, -(W / 2 - 0.02 + 0.008), 0.72, -0.9);
  // ---- rear: seams, tail-lights, hinges, handles -------------------------------------
  const zr = -1.65 - 0.004;
  add(new THREE.BoxGeometry(0.012, 1.0, 0.012), BLACK, 0, 1.12, zr);
  add(new THREE.BoxGeometry(1.3, 0.012, 0.012), BLACK, 0, 0.62, zr);
  for (const sx of [-1, 1]) {
    add(new THREE.BoxGeometry(0.16, 0.32, 0.02), GUN, sx * 0.62, 0.92, zr);
    add(new THREE.BoxGeometry(0.12, 0.28, 0.04), TAIL, sx * 0.62, 0.92, zr - 0.006);
    for (const y of [0.85, 1.45]) add(new THREE.BoxGeometry(0.05, 0.10, 0.04), STEEL, sx * 0.68, y, zr - 0.015);
    add(new THREE.BoxGeometry(0.04, 0.12, 0.05), STEEL, sx * 0.08, 1.0, zr - 0.025);
  }
  add(new THREE.BoxGeometry(0.36, 0.14, 0.012), BODY2, 0, 0.78, zr);
  add(new THREE.BoxGeometry(0.6, 0.2, 0.012), RUST, 0.3, 0.75, zr - 0.002);
  // ---- wheels: one lathe profile (tyre + dished steel rim), rust on the hubs ---------
  const WP = V2([[0, 0.04], [0.05, 0.05], [0.12, 0.03], [0.16, 0.06], [0.19, 0.07], [0.25, 0.065], [0.27, 0.03],
                 [0.27, -0.03], [0.25, -0.065], [0.19, -0.07], [0.16, -0.06], [0.12, -0.03], [0.05, -0.05], [0, -0.04]]);
  const wheelGeo = new THREE.LatheGeometry(WP, 16);
  const rimGeo = new THREE.LatheGeometry(V2([[0, 0.041], [0.05, 0.051], [0.12, 0.031], [0.16, 0.061], [0.165, 0.05], [0.165, 0.0]]), 16);
  for (const [x, z] of [[TX, AXF], [-TX, AXF], [TX, AXR], [-TX, AXR]]) {
    const m = add(wheelGeo, RUB, x, R, z, 0, 0, x > 0 ? -Math.PI / 2 : Math.PI / 2);
    add(rimGeo, STEEL, x, R, z, 0, 0, x > 0 ? -Math.PI / 2 : Math.PI / 2);
    add(CYL(0.05, 0.05, 0.03, 8), RUST, x + Math.sign(x) * 0.055, R, z, 0, 0, Math.PI / 2);
    for (let i = 0; i < 4; i++) {
      const a = i * Math.PI / 2 + Math.PI / 4;
      add(CYL(0.012, 0.012, 0.02, 6), GUN, x + Math.sign(x) * 0.06, R + Math.cos(a) * 0.1, z + Math.sin(a) * 0.1, 0, 0, Math.PI / 2);
    }
  }
  // ---- roof rack ---------------------------------------------------------------------
  const RY = 1.86;
  for (const sx of [-1, 1]) {
    add(CYL(0.015, 0.015, 2.5, 8), STEEL, sx * 0.58, RY, -0.35, Math.PI / 2, 0, 0);
    for (const z of [-1.5, -0.35, 0.8]) add(CYL(0.014, 0.014, 0.10, 6), GUN, sx * 0.58, RY - 0.05, z);
  }
  for (let i = 0; i < 6; i++) add(CYL(0.012, 0.012, 1.16, 6), i === 2 ? RUST : STEEL, 0, RY, -1.55 + i * 0.48, 0, 0, Math.PI / 2);
  for (const sx of [-1, 1]) add(CYL(0.012, 0.012, 0.6, 6), STEEL, sx * 0.58, RY + 0.03, 0.55, Math.PI / 2, 0, 0);

  const LIGHTS = [
    { x: 0.5, y: 0.92, z: 1.9, color: 0xe5b055, intensity: 1.6, range: 6.0 },
    { x: -0.5, y: 0.92, z: 1.9, color: 0xe5b055, intensity: 1.6, range: 6.0 },
    { x: 0.62, y: 0.92, z: -1.85, color: 0xb8302a, intensity: 0.6, range: 2.5 },
    { x: -0.62, y: 0.92, z: -1.85, color: 0xb8302a, intensity: 0.6, range: 2.5 },
  ];
  // ---- the six lines ----------------------------------------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = LIGHTS.map((l) => ({ ...l, x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
  g.userData.obstacle = { kind: "block", lanes: 1 };
  return g;
}
