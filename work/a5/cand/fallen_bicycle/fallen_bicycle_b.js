/**
 * fallen_bicycle — arm B: profiles. Wheels are LatheGeometry rings (tyre + rim in one profile),
 * the step-through frame is ONE ExtrudeGeometry sweep of a circle along a CatmullRom extrudePath
 * (head tube down to the rear dropouts), the basket is an open lathe-less wire cage from thin
 * boxes, mudguards are lathe arcs, the saddle is a lathe. Rusty mamachari lying on its left side.
 * Footprint ≈ 1.8 × 0.6, height ≈ 0.65. userData.obstacle = {kind:'jump', lanes:1}.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.85, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (name) m.name = name;
    return m;
  };
  const frame = M(0x7a3a2a, 'metal', 0.8, 0.3);
  const rust = M(0x37201b, 'metal', 0.95, 0.3);
  const chrome = M(0x8a8a86, 'metal', 0.55, 0.3);
  const tyre = M(0x1c1a19, 'metal', 0.95, 0.0, { side: THREE.DoubleSide });
  const mudTyre = M(0x8b6141, 'metal', 0.95, 0.0);
  const wire = M(0x6e6a62, 'metal', 0.7, 0.3, { side: THREE.DoubleSide });
  const saddle = M(0x231718, 'fabric', 0.9);
  const grip = M(0x4f2d21, 'fabric', 0.9);
  const dark = M(0x110f12, undefined, 0.6);
  const tail = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xb8302a, emissiveIntensity: 1.8, roughness: 0.35 });

  const bike = new THREE.Object3D(); g.add(bike);
  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const V = (a) => new THREE.Vector3(...a);
  const SWEEP = (r, pts, mat, seg = 6, steps = 24) => {
    const path = new THREE.CatmullRomCurve3(pts.map(V));
    const geo = new THREE.TubeGeometry(path, steps, r, seg, false);
    const m = new THREE.Mesh(geo, mat); bike.add(m); return m;
  };
  const LINE = (r, a, b, mat, seg = 6) => {
    const path = new THREE.LineCurve3(V(a), V(b));
    const m = new THREE.Mesh(new THREE.TubeGeometry(path, 1, r, seg, false), mat); bike.add(m); return m;
  };
  const LATHE = (pts, mat, parent, x, y, z, seg = 24) => {
    const geo = new THREE.LatheGeometry(pts.map(([r, h]) => new THREE.Vector2(r, h)), seg);
    return MESH(geo, mat, parent, x, y, z);
  };
  const B = (w, h, d, x, y, z, mat, parent = bike) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);

  // ---- wheels: one lathe profile = tyre tread + sidewall + rim, axis along z --
  const R = 0.31;
  function wheel(x, squash) {
    const w = new THREE.Object3D(); w.position.set(x, R, 0); bike.add(w);
    const prof = [[R - 0.05, -0.012], [R - 0.045, -0.012], [R - 0.045, -0.006], [R - 0.03, -0.02], [R - 0.005, -0.018], [R, 0], [R - 0.005, 0.018], [R - 0.03, 0.02], [R - 0.045, 0.006], [R - 0.045, 0.012], [R - 0.05, 0.012]];
    const t = LATHE(prof, tyre, w, 0, 0, 0, 26); t.rotation.x = Math.PI / 2; t.scale.set(1, squash, 1);
    const hub = LATHE([[0.0, -0.04], [0.03, -0.04], [0.035, 0], [0.03, 0.04], [0.0, 0.04]], rust, w, 0, 0, 0, 10); hub.rotation.x = Math.PI / 2;
    for (let i = 0; i < 12; i++) {
      const s = MESH(new THREE.CylinderGeometry(0.0025, 0.0025, (R - 0.05) * 2, 3), chrome, w, 0, 0, i % 2 ? 0.012 : -0.012);
      s.rotation.z = i * Math.PI / 12; s.scale.set(1, i % 2 ? squash : 1, 1);
    }
    const mud = MESH(new THREE.TorusGeometry(R - 0.015, 0.024, 6, 12, 1.8), mudTyre, w, 0, 0, 0); mud.rotation.z = -2.4; mud.scale.set(1, squash, 1);
    return w;
  }
  wheel(-0.52, 1.0);
  const front = wheel(0.52, 0.86); front.rotation.z = 0.18;                    // bent front wheel

  // ---- frame: one swept step-through curve + stays + fork --------------------
  SWEEP(0.017, [[0.40, 0.98, 0], [0.40, 0.70, 0], [0.30, 0.55, 0], [0.05, 0.36, 0], [-0.10, 0.31, 0], [-0.52, R, 0]], frame, 7, 30);   // head → down tube → chainstay
  SWEEP(0.016, [[-0.02, 0.28, 0], [-0.14, 0.60, 0], [-0.24, 0.84, 0]], frame, 7, 8);                                              // seat tube + post
  for (const s of [-1, 1]) {
    LINE(0.011, [-0.20, 0.74, s * 0.04], [-0.52, R, s * 0.045], frame);                                                            // seat stays
    LINE(0.011, [-0.05, 0.30, s * 0.04], [-0.52, R, s * 0.045], frame);                                                            // chainstays
    SWEEP(0.011, [[0.40, 0.70, s * 0.02], [0.45, 0.55, s * 0.04], [0.52, R, s * 0.045]], chrome, 6, 6);                             // fork blades, curved
  }
  // rust bands (wear)
  LINE(0.019, [0.24, 0.50, 0], [0.12, 0.42, 0], rust); LINE(0.018, [-0.09, 0.48, 0], [-0.12, 0.56, 0], rust);
  // bottom bracket, chainring, crank, pedals, chain guard from a lathe disc + slab
  const bbm = LATHE([[0.0, -0.05], [0.035, -0.05], [0.035, 0.05], [0.0, 0.05]], rust, bike, -0.02, 0.28, 0, 10); bbm.rotation.x = Math.PI / 2;
  const ring = LATHE([[0.0, -0.01], [0.09, -0.01], [0.09, 0.01], [0.0, 0.01]], rust, bike, -0.02, 0.28, 0.06, 16); ring.rotation.x = Math.PI / 2;
  const crank = B(0.03, 0.30, 0.012, -0.02, 0.28, 0.06, chrome); crank.rotation.z = 0.5;
  for (const s of [-1, 1]) B(0.09, 0.025, 0.05, -0.02 + s * 0.07, 0.28 + s * 0.12, s * 0.08, grip);
  const guard = B(0.42, 0.13, 0.03, -0.24, 0.30, 0.05, rust); guard.rotation.z = 0.05;
  // handlebar: a swept bar with grips and levers
  SWEEP(0.011, [[0.34, 1.02, -0.27], [0.36, 1.03, -0.10], [0.40, 1.00, 0], [0.36, 1.03, 0.10], [0.34, 1.02, 0.27]], chrome, 6, 12);
  for (const s of [-1, 1]) { SWEEP(0.011, [[0.34, 1.02, s * 0.27], [0.28, 1.01, s * 0.30], [0.20, 1.00, s * 0.30]], chrome, 6, 4); LINE(0.016, [0.30, 1.005, s * 0.29], [0.19, 0.99, s * 0.31], grip); LINE(0.005, [0.30, 1.00, s * 0.26], [0.18, 0.95, s * 0.22], rust); }
  LINE(0.013, [0.40, 0.98, 0], [0.40, 1.00, 0], chrome);
  // saddle: a lathe pear, squashed flat, on two coil-spring tori
  const sd = LATHE([[0.0, 0.0], [0.05, 0.0], [0.09, 0.02], [0.12, 0.04], [0.09, 0.06], [0.0, 0.07]], saddle, bike, -0.26, 0.86, 0, 12);
  sd.rotation.z = -Math.PI / 2; sd.scale.set(1.0, 1.0, 0.7);
  for (const s of [-1, 1]) MESH(new THREE.TorusGeometry(0.02, 0.006, 5, 10), chrome, bike, -0.32, 0.86, s * 0.04).rotation.x = Math.PI / 2;
  // basket: floor + rails + verticals
  const bx = 0.46, by = 0.88;
  B(0.30, 0.012, 0.28, bx, by - 0.12, 0, wire);
  for (let i = 0; i < 5; i++) { const y = by - 0.10 + i * 0.05; B(0.30, 0.006, 0.006, bx, y, 0.14, wire); B(0.30, 0.006, 0.006, bx, y, -0.14, wire); B(0.006, 0.006, 0.28, bx + 0.15, y, 0, wire); B(0.006, 0.006, 0.28, bx - 0.15, y, 0, wire); }
  for (let i = 0; i < 6; i++) { const x = bx - 0.15 + i * 0.06; B(0.006, 0.24, 0.006, x, by, 0.14, wire); B(0.006, 0.24, 0.006, x, by, -0.14, wire); }
  for (let i = 0; i < 5; i++) { const z = -0.14 + i * 0.07; B(0.006, 0.24, 0.006, bx + 0.15, by, z, wire); B(0.006, 0.24, 0.006, bx - 0.15, by, z, wire); }
  // rear rack + struts
  B(0.36, 0.012, 0.16, -0.58, 0.68, 0, rust);
  for (let i = 0; i < 3; i++) B(0.36, 0.008, 0.008, -0.58, 0.685, -0.06 + i * 0.06, chrome);
  for (const s of [-1, 1]) LINE(0.008, [-0.62, 0.66, s * 0.07], [-0.52, R, s * 0.05], rust);
  // mudguards: lathe arcs (partial lathes) around each wheel
  const MG = (x, start) => { const geo = new THREE.LatheGeometry([new THREE.Vector2(R + 0.012, -0.03), new THREE.Vector2(R + 0.02, 0), new THREE.Vector2(R + 0.012, 0.03)], 14, start, 2.5);
    const m = new THREE.Mesh(geo, rust.clone()); m.material.side = THREE.DoubleSide; m.material.name = 'metal'; m.position.set(x, R, 0); m.rotation.x = Math.PI / 2; bike.add(m); return m; };
  MG(-0.52, 0.2); MG(0.52, 0.5);
  const lamp = B(0.035, 0.03, 0.05, -0.83, 0.42, 0, tail);
  LINE(0.007, [-0.30, 0.26, 0.05], [-0.36, 0.05, 0.16], rust);               // kickstand
  SWEEP(0.004, [[0.20, 0.96, -0.24], [0.30, 0.85, -0.15], [0.44, 0.70, -0.06]], dark, 4, 8);   // brake cable
  B(0.62, 0.03, 0.10, -0.52, 0.015, 0, dark); B(0.62, 0.03, 0.10, 0.52, 0.015, 0, dark);      // grounding bands

  bike.rotation.x = -Math.PI / 2 + 0.6;   // propped on the bar end and pedal, wheels leaning ~35° off the road

  g.userData.obstacle = { kind: 'jump', lanes: 1 };

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.updateMatrixWorld(true);
  const lp = lamp.getWorldPosition(new THREE.Vector3());
  g.userData.lights = [{ x: lp.x, y: lp.y, z: lp.z, color: 0xb8302a, intensity: 0.4, range: 1.0 }];
  return g;
}
