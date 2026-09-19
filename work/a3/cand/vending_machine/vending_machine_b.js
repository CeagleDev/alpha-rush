// vending_machine — arm B: profiles. The cabinet is a plan Shape with rounded
// front corners extruded 1.83 m upward; the strip light and its end caps, the
// feet and every can are LatheGeometry; the shelves are L-section extrusions
// and the dispensing flap a bent-plate profile. 1.0 × 0.8 × 1.83 m, cool-lit
// display recess behind glass, warm tube on top, blue skirt, rust band,
// black plinth. Front = +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const WHITE = mk(0xd9d3c4, "metal", { roughness: 0.8 });
  const WHITE2 = mk(0xc9c2b1, "metal", { roughness: 0.85 });   // faded panel
  const BLUE = mk(0x35478a, "metal", { roughness: 0.85 });
  const BLUE2 = mk(0x2c3c74, "metal", { roughness: 0.9 });
  const RUST = mk(0x4f2d21, "metal", { roughness: 0.95, metalness: 0.15 });
  const RUST2 = mk(0x37201b, "metal", { roughness: 0.95, metalness: 0.15 });
  const STEEL = mk(0x8a8a86, "metal", { roughness: 0.65, metalness: 0.45 });
  const GUN = mk(0x3a3a3c, "metal", { roughness: 0.75, metalness: 0.35 });
  const BLACK = mk(0x110f12, "metal", { roughness: 0.9 });
  const PAPER = mk(0xeee2c8, "plaster", { roughness: 0.95, metalness: 0 });
  const PAPER2 = mk(0xbf7c42, "plaster", { roughness: 0.95, metalness: 0 });
  const PAPER3 = mk(0x8b6141, "plaster", { roughness: 0.95, metalness: 0 });
  const SHELF = mk(0xb9c4cc, "metal", { roughness: 0.6, metalness: 0.4 });
  const CAN = [0xb8302a, 0xe5b055, 0x40559f, 0xa7e761, 0xeee2c8, 0xc98a45].map((c) => mk(c, "metal", { roughness: 0.5, metalness: 0.5 }));
  const GLASS = new THREE.MeshStandardMaterial({ color: 0xa9c4d8, roughness: 0.2, metalness: 0.1, transparent: true, opacity: 0.9, forceSinglePass: true });
  const COOL = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0x9accf2), emissiveIntensity: 2.2, roughness: 0.35 });
  const WARM = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xf1d899), emissiveIntensity: 2.6, roughness: 0.35 });
  const AMBER = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xe8852a), emissiveIntensity: 1.8, roughness: 0.35 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const poly = (pts, holes) => {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    if (holes) for (const h of holes) { const p = new THREE.Path(); p.moveTo(h[0][0], h[0][1]);
      for (let i = 1; i < h.length; i++) p.lineTo(h[i][0], h[i][1]); p.closePath(); s.holes.push(p); }
    return s;
  };
  const ex = (shape, depth, seg = 3) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: seg, steps: 1 });
    geo.translate(0, 0, -depth / 2); return geo;
  };
  const V2 = (a) => a.map(([x, y]) => new THREE.Vector2(x, y));

  const W = 1.0, D = 0.8, H = 1.83, ZF = D / 2;
  // ---- cabinet: plan profile (x, -z) with 4 cm rounded front corners, swept up -
  const plan = (w, d, r) => {
    const s = new THREE.Shape();
    // drawn in (x, y) where y = -z, so the front (+z) is at y = -d/2
    s.moveTo(-w / 2, d / 2); s.lineTo(w / 2, d / 2); s.lineTo(w / 2, -d / 2 + r);
    s.quadraticCurveTo(w / 2, -d / 2, w / 2 - r, -d / 2); s.lineTo(-w / 2 + r, -d / 2);
    s.quadraticCurveTo(-w / 2, -d / 2, -w / 2, -d / 2 + r); s.closePath();
    return s;
  };
  const up = (geo, mat, y0, h) => add(geo, mat, 0, y0 + h / 2, 0, -Math.PI / 2, 0, 0);
  up(ex(plan(W, D, 0.04), H - 0.55), WHITE, 0.50, H - 0.55);
  up(ex(plan(W + 0.01, D + 0.01, 0.05), 0.05), WHITE2, H - 0.05, 0.05);
  up(ex(plan(W, D, 0.04), 0.32), BLUE, 0.18, 0.32);
  up(ex(plan(W, D, 0.04), 0.09), RUST, 0.09, 0.09);
  up(ex(plan(W - 0.05, D - 0.05, 0.03), 0.05), BLACK, 0.04, 0.05);           // grounding band
  const FOOT = V2([[0, 0], [0.035, 0], [0.035, 0.012], [0.025, 0.02], [0.025, 0.04], [0, 0.04]]);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(new THREE.LatheGeometry(FOOT, 8), GUN, sx * 0.42, 0, sz * 0.32);
  // wear: faded side panel, stickers, rust runs
  add(new THREE.BoxGeometry(0.004, 0.9, 0.55), WHITE2, W / 2 + 0.002, 1.15, 0.0);
  add(new THREE.BoxGeometry(0.004, 0.2, 0.15), PAPER, W / 2 + 0.005, 1.3, 0.18, 0, 0, -0.06);
  add(new THREE.BoxGeometry(0.004, 0.12, 0.12), PAPER2, W / 2 + 0.005, 0.9, -0.1, 0, 0, 0.1);
  add(new THREE.BoxGeometry(0.004, 0.16, 0.12), PAPER3, -W / 2 - 0.005, 1.1, 0.1, 0, 0, 0.04);
  add(new THREE.BoxGeometry(0.03, 0.5, 0.004), RUST2, W / 2 - 0.06, 0.9, ZF + 0.002);
  add(new THREE.BoxGeometry(0.025, 0.28, 0.004), RUST, -W / 2 + 0.06, 1.4, ZF + 0.002);
  add(new THREE.BoxGeometry(0.5, 0.03, 0.004), RUST2, 0.05, 0.515, ZF + 0.002);
  add(new THREE.BoxGeometry(0.004, 0.35, 0.03), RUST, -W / 2 - 0.002, 0.75, 0.3);

  // ---- top tube: lathe with end caps ------------------------------------------
  const TUBE = V2([[0, -0.4], [0.03, -0.4], [0.03, 0.4], [0, 0.4]]);
  add(new THREE.LatheGeometry(TUBE, 8), WARM, 0, H - 0.09, ZF + 0.01, 0, 0, Math.PI / 2);
  const CAP = V2([[0, 0], [0.04, 0], [0.04, 0.05], [0.032, 0.06], [0, 0.06]]);
  add(new THREE.LatheGeometry(CAP, 8), GUN, -0.40, H - 0.09, ZF + 0.01, 0, 0, -Math.PI / 2);
  add(new THREE.LatheGeometry(CAP, 8), GUN, 0.40, H - 0.09, ZF + 0.01, 0, 0, Math.PI / 2);
  add(new THREE.BoxGeometry(0.88, 0.05, 0.05), STEEL, 0, H - 0.09, ZF - 0.025);

  // ---- display recess -------------------------------------------------------
  const dx0 = -0.42, dx1 = 0.17, dy0 = 0.95, dy1 = 1.62, dd = 0.14;
  const dw = dx1 - dx0, dh = dy1 - dy0, dcx = (dx0 + dx1) / 2, dcy = (dy0 + dy1) / 2;
  add(new THREE.BoxGeometry(dw, dh, 0.01), COOL, dcx, dcy, ZF - dd);
  // recess walls as one extruded ring (front face), 14 cm deep
  const ring = poly([[dx0 - 0.03, dy0 - 0.03], [dx1 + 0.03, dy0 - 0.03], [dx1 + 0.03, dy1 + 0.03], [dx0 - 0.03, dy1 + 0.03]],
                    [[[dx0, dy0], [dx0, dy1], [dx1, dy1], [dx1, dy0]]]);
  const rg = ex(ring, dd); rg.translate(0, 0, ZF - dd / 2);
  add(rg, BLACK, 0, 0, 0);
  const lip = poly([[dx0 - 0.03, dy0 - 0.03], [dx1 + 0.03, dy0 - 0.03], [dx1 + 0.03, dy1 + 0.03], [dx0 - 0.03, dy1 + 0.03]],
                   [[[dx0 + 0.005, dy0 + 0.005], [dx0 + 0.005, dy1 - 0.005], [dx1 - 0.005, dy1 - 0.005], [dx1 - 0.005, dy0 + 0.005]]]);
  add(ex(lip, 0.02), STEEL, 0, 0, ZF + 0.005);
  add(new THREE.BoxGeometry(dw, dh, 0.006), GLASS, dcx, dcy, ZF - 0.008);
  const Lsh = poly([[0, 0], [dd - 0.03, 0], [dd - 0.03, 0.012], [0.012, 0.012], [0.012, 0.03], [0, 0.03]]);
  const CANP = V2([[0, 0], [0.026, 0], [0.03, 0.006], [0.03, 0.105], [0.026, 0.112], [0.02, 0.115], [0, 0.115]]);
  [dy0 + 0.05, dy0 + 0.27, dy0 + 0.49].forEach((ry, r) => {
    // shelf: L-section drawn in (z, y), extruded across x
    add(ex(Lsh, dw - 0.04), SHELF, dcx, ry, ZF - dd + 0.005, 0, -Math.PI / 2, 0);
    add(new THREE.BoxGeometry(dw - 0.04, 0.025, 0.006), SHELF, dcx, ry + 0.02, ZF - 0.03);
    for (let i = 0; i < 7; i++) {
      const x = dx0 + 0.05 + i * ((dw - 0.1) / 6);
      add(new THREE.LatheGeometry(CANP, 7), CAN[(i + r * 2) % CAN.length], x, ry + 0.012, ZF - dd / 2 - 0.02);
    }
  });

  // ---- controls column and lower front ----------------------------------------
  add(new THREE.BoxGeometry(0.24, 0.62, 0.012), WHITE2, 0.33, 1.28, ZF + 0.004);
  add(new THREE.BoxGeometry(0.10, 0.09, 0.02), GUN, 0.33, 1.52, ZF + 0.012);
  add(new THREE.BoxGeometry(0.05, 0.008, 0.01), BLACK, 0.33, 1.52, ZF + 0.024);
  for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.05, 0.03, 0.012), i === 2 ? AMBER : GUN, 0.33, 1.40 - i * 0.06, ZF + 0.012);
  const KNOB = V2([[0, 0], [0.022, 0], [0.022, 0.02], [0.012, 0.03], [0, 0.03]]);
  add(new THREE.LatheGeometry(KNOB, 8), STEEL, 0.33, 1.08, ZF + 0.006, Math.PI / 2, 0, 0);
  add(new THREE.BoxGeometry(0.10, 0.10, 0.02), GUN, 0.33, 0.86, ZF + 0.01);
  add(new THREE.BoxGeometry(0.06, 0.05, 0.02), BLACK, 0.33, 0.85, ZF + 0.02);
  add(new THREE.BoxGeometry(0.40, 0.18, 0.006), PAPER, -0.2, 0.80, ZF + 0.003);
  add(new THREE.BoxGeometry(0.12, 0.06, 0.007), PAPER2, -0.30, 0.84, ZF + 0.004);
  // flap: bent-plate profile in (z, y), extruded across x
  const FLAP = poly([[0, 0], [0.05, 0.05], [0.05, 0.13], [0.03, 0.13], [0.03, 0.065], [0, 0.03]]);
  add(ex(FLAP, 0.62), STEEL, -0.12, 0.54, ZF, 0, -Math.PI / 2, 0);
  add(new THREE.BoxGeometry(0.66, 0.02, 0.06), GUN, -0.12, 0.68, ZF + 0.02);
  add(new THREE.BoxGeometry(0.58, 0.04, 0.02), BLACK, -0.12, 0.535, ZF + 0.004);
  // vent grille
  add(new THREE.BoxGeometry(0.36, 0.10, 0.01), BLACK, 0.0, 0.30, ZF + 0.002);
  for (let i = 0; i < 5; i++) add(new THREE.BoxGeometry(0.36, 0.008, 0.012), BLUE2, 0.0, 0.26 + i * 0.02, ZF + 0.004);
  // back service panel and cable
  add(new THREE.BoxGeometry(0.6, 0.9, 0.01), WHITE2, 0, 0.9, -ZF - 0.005);
  add(new THREE.BoxGeometry(0.2, 0.2, 0.02), GUN, 0.25, 0.4, -ZF - 0.01);
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), BLACK, -0.3, 0.3, -ZF - 0.012);

  const LIGHTS = [
    { x: dcx, y: dcy, z: ZF + 0.35, color: 0x9accf2, intensity: 1.0, range: 3.0 },
    { x: 0, y: H - 0.06, z: ZF + 0.15, color: 0xf1d899, intensity: 1.2, range: 3.0 },
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
