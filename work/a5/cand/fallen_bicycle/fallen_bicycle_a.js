/**
 * fallen_bicycle — arm A: primitives. A rusty city bicycle (mamachari) lying on its LEFT side:
 * torus wheels (the front one squashed), cylinder tube frame, wire basket, rear rack, saddle,
 * chain guard, mudguards, pedals, kickstand. Built upright along +x then rotated to lie flat on
 * its side, so the wheels lie in a plane just above the road.
 * Footprint 1.8 (x) × 0.6 (z), max height ~0.65. userData.obstacle = {kind:'jump', lanes:1}.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.85, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (name) m.name = name;
    return m;
  };
  const frame = M(0x7a3a2a, 'metal', 0.8, 0.3);        // faded red paint under rust
  const rust = M(0x37201b, 'metal', 0.95, 0.3);
  const chrome = M(0x8a8a86, 'metal', 0.55, 0.3);      // pitted chrome rims, bars
  const tyre = M(0x1c1a19, 'metal', 0.95, 0.0);
  const mudTyre = M(0x8b6141, 'metal', 0.95, 0.0);
  const wire = M(0x6e6a62, 'metal', 0.7, 0.3, { side: THREE.DoubleSide });
  const saddle = M(0x231718, 'fabric', 0.9);
  const grip = M(0x4f2d21, 'fabric', 0.9);
  const dark = M(0x110f12, undefined, 0.6);
  const tail = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xb8302a, emissiveIntensity: 1.8, roughness: 0.35 });

  const bike = new THREE.Object3D(); g.add(bike);
  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  // a tube between two points in the bike's upright frame (x along the bike, y up, z sideways)
  const TUBE = (r, a, b, mat, seg = 7) => {
    const A = new THREE.Vector3(...a), B = new THREE.Vector3(...b), d = B.clone().sub(A), len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
    m.position.copy(A).add(B).multiplyScalar(0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    bike.add(m); return m;
  };
  const B = (w, h, d, x, y, z, mat, parent = bike) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);

  // ---- wheels (upright frame: axles along z) --------------------------------
  const R = 0.31;
  function wheel(x, squash) {
    const w = new THREE.Object3D(); w.position.set(x, R, 0); bike.add(w);
    const t = MESH(new THREE.TorusGeometry(R - 0.02, 0.022, 7, 24), tyre, w, 0, 0, 0); t.scale.set(1, squash, 1);
    const rim = MESH(new THREE.TorusGeometry(R - 0.045, 0.008, 5, 24), chrome, w, 0, 0, 0); rim.scale.set(1, squash, 1);
    MESH(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8), rust, w, 0, 0, 0).rotation.x = Math.PI / 2;      // hub
    for (let i = 0; i < 12; i++) {                                                                       // spokes
      const s = MESH(new THREE.CylinderGeometry(0.0025, 0.0025, (R - 0.05) * 2, 3), chrome, w, 0, 0, i % 2 ? 0.012 : -0.012);
      s.rotation.z = i * Math.PI / 12; s.scale.set(1, i % 2 ? squash : 1, 1);
    }
    // mud cake on the tyre, a fat arc
    const mud = MESH(new THREE.TorusGeometry(R - 0.02, 0.026, 6, 12, 1.6), mudTyre, w, 0, 0, 0); mud.rotation.z = -2.2; mud.scale.set(1, squash, 1);
    return w;
  }
  wheel(-0.52, 1.0);
  const front = wheel(0.52, 0.86);  front.rotation.z = 0.15;                   // the bent wheel, slightly squashed and skewed

  // ---- frame: a step-through mamachari ------------------------------------
  const bb = [-0.02, 0.28, 0], head = [0.40, 0.72, 0], seatTop = [-0.22, 0.78, 0], rearAxle = [-0.52, R, 0], frontAxle = [0.52, R, 0];
  TUBE(0.017, [0.42, 0.62, 0], [-0.14, 0.32, 0], frame);          // down tube, one long sweep (step-through)
  TUBE(0.017, [0.40, 0.66, 0], [0.40, 0.98, 0], frame);            // head tube
  TUBE(0.017, bb, seatTop, frame);                                  // seat tube
  TUBE(0.012, [-0.05, 0.30, 0.04], rearAxle.map((v, i) => i === 2 ? 0.045 : v), frame);   // chainstays
  TUBE(0.012, [-0.05, 0.30, -0.04], rearAxle.map((v, i) => i === 2 ? -0.045 : v), frame);
  TUBE(0.012, [-0.20, 0.74, 0.04], rearAxle.map((v, i) => i === 2 ? 0.045 : v), frame);   // seat stays
  TUBE(0.012, [-0.20, 0.74, -0.04], rearAxle.map((v, i) => i === 2 ? -0.045 : v), frame);
  TUBE(0.012, [0.42, 0.66, 0.04], frontAxle.map((v, i) => i === 2 ? 0.045 : v), chrome);   // fork blades
  TUBE(0.012, [0.42, 0.66, -0.04], frontAxle.map((v, i) => i === 2 ? -0.045 : v), chrome);
  // rust runs: darker sleeves on the down tube and seat tube (wear signature)
  TUBE(0.019, [0.20, 0.50, 0], [0.08, 0.435, 0], rust);
  TUBE(0.019, [-0.10, 0.50, 0], [-0.14, 0.60, 0], rust);
  // bottom bracket, crank, pedals, chain guard
  MESH(new THREE.CylinderGeometry(0.035, 0.035, 0.10, 10), rust, bike, ...bb).rotation.x = Math.PI / 2;
  const crank = B(0.03, 0.30, 0.012, bb[0], bb[1], 0.06, chrome); crank.rotation.z = 0.5;
  for (const s of [-1, 1]) B(0.09, 0.025, 0.05, bb[0] + s * 0.07, bb[1] + s * 0.12, s * 0.08, grip);
  const guard = B(0.42, 0.13, 0.03, -0.24, 0.30, 0.05, rust); guard.rotation.z = 0.05;    // chain guard slab
  MESH(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 14), rust, bike, bb[0], bb[1], 0.06).rotation.x = Math.PI / 2;   // chainring
  // handlebar: stem, a swept bar, grips, brake levers
  TUBE(0.014, [0.40, 0.98, 0], [0.34, 1.02, 0], chrome);
  TUBE(0.011, [0.34, 1.02, -0.27], [0.34, 1.02, 0.27], chrome);
  for (const s of [-1, 1]) { TUBE(0.011, [0.34, 1.02, s * 0.27], [0.22, 1.00, s * 0.30], chrome); TUBE(0.016, [0.30, 1.005, s * 0.29], [0.19, 0.99, s * 0.31], grip); TUBE(0.005, [0.30, 1.00, s * 0.26], [0.18, 0.95, s * 0.22], rust); }
  // saddle on a post, with springs
  TUBE(0.013, seatTop, [-0.25, 0.86, 0], chrome);
  const sd = MESH(new THREE.SphereGeometry(0.12, 10, 6), saddle, bike, -0.26, 0.90, 0); sd.scale.set(1.0, 0.28, 0.7);
  for (const s of [-1, 1]) MESH(new THREE.TorusGeometry(0.02, 0.006, 5, 10), chrome, bike, -0.32, 0.86, s * 0.04).rotation.x = Math.PI / 2;
  // wire basket on the front: open box of thin slats
  const bx = 0.46, by = 0.88, bz = 0;
  B(0.30, 0.012, 0.28, bx, by - 0.12, bz, wire);
  for (let i = 0; i < 5; i++) { const y = by - 0.10 + i * 0.05; B(0.30, 0.006, 0.006, bx, y, bz + 0.14, wire); B(0.30, 0.006, 0.006, bx, y, bz - 0.14, wire); B(0.006, 0.006, 0.28, bx + 0.15, y, bz, wire); B(0.006, 0.006, 0.28, bx - 0.15, y, bz, wire); }
  for (let i = 0; i < 6; i++) { const x = bx - 0.15 + i * 0.06; B(0.006, 0.24, 0.006, x, by, bz + 0.14, wire); B(0.006, 0.24, 0.006, x, by, bz - 0.14, wire); }
  for (let i = 0; i < 5; i++) { const z = bz - 0.14 + i * 0.07; B(0.006, 0.24, 0.006, bx + 0.15, by, z, wire); B(0.006, 0.24, 0.006, bx - 0.15, by, z, wire); }
  // rear rack: a flat grid over the back wheel with two struts
  B(0.36, 0.012, 0.16, -0.58, 0.68, 0, rust);
  for (let i = 0; i < 3; i++) B(0.36, 0.008, 0.008, -0.58, 0.685, -0.06 + i * 0.06, chrome);
  for (const s of [-1, 1]) TUBE(0.008, [-0.62, 0.66, s * 0.07], rearAxle.map((v, i) => i === 2 ? s * 0.05 : v), rust);
  // mudguards: half-torus arcs over each wheel
  const mg1 = MESH(new THREE.TorusGeometry(R + 0.015, 0.012, 5, 16, 2.6), rust, bike, -0.52, R, 0); mg1.rotation.z = 0.3; mg1.scale.set(1, 1, 3.5);
  const mg2 = MESH(new THREE.TorusGeometry(R + 0.015, 0.012, 5, 16, 2.4), rust, bike, 0.52, R, 0); mg2.rotation.z = 0.5; mg2.scale.set(1, 1, 3.5);
  const lamp = B(0.035, 0.03, 0.05, -0.83, 0.42, 0, tail);                     // rear reflector / tail lamp
  // kickstand hanging out, and a bent brake cable
  TUBE(0.007, [-0.30, 0.26, 0.05], [-0.36, 0.05, 0.16], rust);
  TUBE(0.004, [0.20, 0.96, -0.24], [0.44, 0.70, -0.06], dark);
  // wheel contact / shade band: the ground-touching sides of the tyres (bottom 3 cm) darkened
  B(0.62, 0.03, 0.10, -0.52, 0.015, 0, dark); B(0.62, 0.03, 0.10, 0.52, 0.015, 0, dark);

  // ---- lay it down on its left side: the bike's +z (its right) becomes up ----
  bike.rotation.x = -Math.PI / 2 + 0.22;   // not quite flat: it rests on the bar end and the pedal, wheels leaning

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
