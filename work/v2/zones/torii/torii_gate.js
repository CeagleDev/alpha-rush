// torii_gate — a weathered vermilion torii from the env_torii board, 7.5 m wide x 6 m tall. Two round
// pillars on stone plinths (feet at x = +-3.6, OUTSIDE the lanes; the 6 m carriageway runs between
// them), a nuki tie beam through the pillars with kusabi wedges, a gakuzuka strut carrying a gaku
// plaque, the shimaki, and a kasagi lintel that sweeps up at the ends (extruded profile) with its
// top face painted black. Wear: a grime skirt at each foot, paint flaked to the timber and chalky
// faded patches (partial open cylinders on different sides of each pillar), drip streaks under the
// nuki, moss and grass on the lintel tops. A straw shimenawa sags under the nuki with paper shide
// and tassels hanging from it. Front faces +Z; the gate is symmetric so a chunk may yaw it freely.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, r, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0, ...o }); m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, mat); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };
  const box = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  const VERM  = mk(0xb8302a, 'timber', 0.80);
  const VERM2 = mk(0xa83a2c, 'timber', 0.82);                  // beams, a shade browner
  const FADE  = mk(0x9a4a3a, 'timber', 0.90, { side: DS });    // chalky, sun-faded paint (wear)
  const BARE  = mk(0x6c4028, 'timber', 0.92, { side: DS });    // paint flaked to the timber (wear)
  const GRIME = mk(0x37201b, 'timber', 0.95, { side: DS });
  const STREAK = mk(0x37201b, 'timber', 0.95);
  const BLACK = mk(0x110f12, 'timber', 0.85);                  // kasagi cap, daiwa collars, grounding
  const STONE = mk(0x6f6a62, 'stone', 0.40);
  const MOSS  = mk(0x2f3a1e, 'foliage', 0.95);
  const GRASS = mk(0x3d4a22, 'foliage', 0.95);
  const ROPE  = mk(0x8b6141, 'fabric', 0.95);
  const ROPE2 = mk(0x6c4028, 'fabric', 0.95);
  const KNOT  = mk(0x37201b, 'fabric', 0.95);
  const PAPER = mk(0xe6ddd0, 'fabric', 0.90, { side: DS });
  const PAPER2 = mk(0xeee2c8, 'fabric', 0.90, { side: DS });
  const PLAQ  = mk(0x231718, 'timber', 0.85);
  const GOLD  = mk(0xd8ae70, 'metal', 0.45, { metalness: 0.3 });

  const PX = 3.6, R0 = 0.31, R1 = 0.27, YTOP = 5.10;
  const rAt = (y) => R0 + (R1 - R0) * ((y - 0.28) / (YTOP - 0.28));
  for (const s of [-1, 1]) {
    const x = s * PX;
    add(new THREE.CylinderGeometry(0.44, 0.45, 0.06, 14), BLACK, x, 0.03, 0);           // grounding band
    add(new THREE.CylinderGeometry(0.36, 0.43, 0.22, 14), STONE, x, 0.17, 0);           // stone plinth
    add(new THREE.CylinderGeometry(R1, R0, YTOP - 0.28, 14), s > 0 ? VERM : VERM2, x, 0.28 + (YTOP - 0.28) / 2, 0);
    add(new THREE.CylinderGeometry(0.34, 0.31, 0.14, 14), BLACK, x, YTOP + 0.07, 0);    // daiwa collar
    // wear: grime skirt, flaked and faded patches on different sides of each pillar
    add(new THREE.CylinderGeometry(R0 + 0.003, R0 + 0.006, 0.55, 14, 1, true), GRIME, x, 0.56, 0);
    for (let k = 0; k < 3; k++) {
      const y = 1.3 + k * 1.35 + s * 0.3, h = 0.45 + hash(k, s) * 0.6, r = rAt(y) + 0.005;
      add(new THREE.CylinderGeometry(r, r + 0.003, h, 14, 1, true, s > 0 ? 1.0 + k * 1.1 : 3.6 + k * 0.9, 0.7 + hash(k, 3 + s) * 0.9), k % 2 ? FADE : BARE, x, y, 0);
    }
    // drip streaks under the nuki, front and back
    for (const sz of [-1, 1]) add(box(0.05, 0.55, 0.012), STREAK, x + s * 0.06, 3.95, sz * (rAt(3.95) - 0.002));
    // moss at the foot, on the shaded side
    const mo = add(new THREE.SphereGeometry(0.22, 7, 4), MOSS, x - s * 0.2, 0.32, -0.16); mo.scale.set(1, 0.4, 0.55);
    // kusabi wedges either side of the pillar where the nuki passes through
    for (const d of [-1, 1]) add(box(0.10, 0.34, 0.24), VERM, x + d * 0.33, 4.45, 0);
  }
  // nuki, gakuzuka, gaku plaque (both faces), shimaki
  add(box(7.5, 0.26, 0.20), VERM2, 0, 4.45, 0);
  add(box(0.30, 0.66, 0.20), VERM, 0, 4.91, 0);
  for (const sz of [-1, 1]) { add(box(0.40, 0.56, 0.05), PLAQ, 0, 4.91, sz * 0.125); add(box(0.32, 0.46, 0.02), GOLD, 0, 4.91, sz * 0.16); }
  add(box(7.3, 0.26, 0.42), VERM2, 0, YTOP + 0.14 + 0.13, 0);                            // shimaki 5.24..5.50
  // kasagi: an extruded profile that sweeps up at the ends, vermilion body and a black cap
  const f = (x) => 0.10 * (x / 3.75) ** 2;
  const kasagi = (y0, y1, xe, depth, mat) => {
    const sh = new THREE.Shape(), N = 16, xb = xe - 0.05;
    sh.moveTo(-xb, y0 + f(-xb));
    for (let i = 1; i <= N; i++) { const x = -xb + 2 * xb * i / N; sh.lineTo(x, y0 + f(x)); }
    sh.lineTo(xe, y1 + f(xe));
    for (let i = N - 1; i >= 0; i--) { const x = -xe + 2 * xe * i / N; sh.lineTo(x, y1 + f(x)); }
    sh.lineTo(-xb, y0 + f(-xb));
    const geo = new THREE.ExtrudeGeometry(sh, { depth, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 1 });
    geo.translate(0, 0, -depth / 2);
    return add(geo, mat, 0, 0, 0);
  };
  kasagi(5.50, 5.80, 3.75, 0.50, VERM);
  kasagi(5.80, 5.90, 3.76, 0.52, BLACK);
  // moss and grass tufts on the lintel tops, dirt on the nuki
  for (let i = 0; i < 11; i++) {
    const x = -3.4 + i * 0.68 + (hash(i, 7) - 0.5) * 0.4;
    const mo = add(new THREE.SphereGeometry(0.10 + hash(i, 8) * 0.10, 7, 4), i % 3 === 1 ? GRASS : MOSS, x, 5.90 + f(x) + 0.01, (hash(i, 9) - 0.5) * 0.36);
    mo.scale.set(2.2, 0.22, 0.6);
  }
  for (let i = 0; i < 3; i++) { const x = -2.4 + i * 2.1; const mo = add(new THREE.SphereGeometry(0.14, 7, 4), MOSS, x, 4.58, (hash(i, 10) - 0.5) * 0.1); mo.scale.set(2.0, 0.22, 0.6); }
  // shimenawa under the nuki: a straw cord with a wound strand, lashed at the pillars
  const L = 3.29, ry = (x) => 4.30 - 0.32 * (1 - (x / L) ** 2);
  const pts = []; for (let i = 0; i <= 14; i++) { const x = -L + i * (2 * L / 14); pts.push(new THREE.Vector3(x, ry(x), 0)); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 40, 0.035, 5, false), ROPE, 0, 0, 0);
  { const p = []; for (let i = 0; i <= 80; i++) { const x = -L + i * (2 * L / 80), a = i * 0.8; p.push(new THREE.Vector3(x, ry(x) + 0.036 * Math.sin(a), 0.036 * Math.cos(a))); }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p), 90, 0.012, 3, false), ROPE2, 0, 0, 0); }
  for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.055, 0.014, 4, 8), KNOT, s * (L - 0.1), ry(s * (L - 0.1)), 0, 0, Math.PI / 2, 0);
  // shide: zigzag paper, four folds each, with a little yaw so the folds catch light
  for (let k = 0; k < 7; k++) {
    const x = -2.7 + k * 0.9, y0 = ry(x), yaw = (hash(k, 11) - 0.5) * 0.5;
    add(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 5), KNOT, x, y0 - 0.04, 0);
    for (let j = 0; j < 4; j++) {
      const b = add(box(0.10, 0.11, 0.004), j % 2 ? PAPER : PAPER2, x + (j % 2 ? 0.045 : -0.045), y0 - 0.08 - 0.055 - j * 0.105, 0);
      b.rotation.y = yaw + (j % 2 ? 0.35 : -0.35); b.rotation.z = j % 2 ? 0.06 : -0.06;
    }
  }
  for (const x of [-1.35, 0.45, 2.25]) { add(new THREE.ConeGeometry(0.05, 0.26, 7), ROPE, x, ry(x) - 0.17, 0); add(new THREE.CylinderGeometry(0.02, 0.02, 0.05, 6), KNOT, x, ry(x) - 0.06, 0); }

  finish(THREE, g);
  return g;
}
function finish(THREE, g, lights) {
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  if (lights) g.userData.lights = lights.map((l) => ({ ...l, x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
}
