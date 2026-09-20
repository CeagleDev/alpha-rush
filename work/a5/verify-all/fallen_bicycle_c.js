/**
 * fallen_bicycle — arm C: a different reading and breakdown. The bicycle is built directly in
 * its FALLEN pose in world space (no upright-then-rotate): both wheels lie nearly flat on the
 * road, the front wheel twisted 60° at the fork and squashed, the frame is a set of straight
 * cylinders between measured world points, the basket has spilled forward, the chain guard is
 * a solid slab, and a puddle of rust-brown grime sits under the crank. Lying on its left side.
 * Footprint ≈ 1.8 × 0.6, height ≈ 0.6. userData.obstacle = {kind:'jump', lanes:1}.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.85, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (name) m.name = name;
    return m;
  };
  const frame = M(0x8b3a2a, 'metal', 0.8, 0.3);
  const rust = M(0x37201b, 'metal', 0.95, 0.3);
  const chrome = M(0x8a8a86, 'metal', 0.55, 0.3);
  const tyre = M(0x1c1a19, 'metal', 0.95, 0.0);
  const mudTyre = M(0x8b6141, 'metal', 0.95, 0.0);
  const wire = M(0x6e6a62, 'metal', 0.7, 0.3, { side: THREE.DoubleSide });
  const saddle = M(0x231718, 'fabric', 0.9);
  const grip = M(0x4f2d21, 'fabric', 0.9);
  const dark = M(0x110f12, undefined, 0.6);
  const tail = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xb8302a, emissiveIntensity: 1.8, roughness: 0.35 });

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const V = (a) => new THREE.Vector3(...a);
  const TUBE = (r, a, b, mat, parent = g, seg = 7) => {
    const A = V(a), Bv = V(b), d = Bv.clone().sub(A), len = d.length();
    const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, seg), mat);
    m.position.copy(A).add(Bv).multiplyScalar(0.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    parent.add(m); return m;
  };
  const B = (w, h, d, x, y, z, mat, parent = g) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);

  // world frame: bike length along x (front at +x), the bike's underside faces +z (it fell on its left),
  // wheel planes nearly horizontal. Rear wheel centre, front wheel centre:
  const R = 0.31, RW = [-0.52, 0.06, 0.05], FW = [0.55, 0.08, 0.02];
  function wheel(cx, cy, cz, tiltX, spinY, squash) {
    const w = new THREE.Object3D(); w.position.set(cx, cy, cz); w.rotation.set(tiltX, spinY, 0); g.add(w);
    const t = MESH(new THREE.TorusGeometry(R - 0.02, 0.022, 7, 24), tyre, w, 0, 0, 0); t.rotation.x = Math.PI / 2; t.scale.set(1, 1, squash);
    const rim = MESH(new THREE.TorusGeometry(R - 0.045, 0.008, 5, 24), chrome, w, 0, 0, 0); rim.rotation.x = Math.PI / 2; rim.scale.set(1, 1, squash);
    MESH(new THREE.CylinderGeometry(0.03, 0.03, 0.08, 8), rust, w, 0, 0, 0);
    for (let i = 0; i < 12; i++) { const s = MESH(new THREE.CylinderGeometry(0.0025, 0.0025, (R - 0.05) * 2, 3), chrome, w, 0, i % 2 ? 0.012 : -0.012, 0); s.rotation.set(Math.PI / 2, 0, i * Math.PI / 12); }
    const mud = MESH(new THREE.TorusGeometry(R - 0.02, 0.026, 6, 12, 1.5), mudTyre, w, 0, 0, 0); mud.rotation.set(Math.PI / 2, 0, 0.8); mud.scale.set(1, 1, squash);
    // grounding: the lower rim of the tyre darkened where it meets the wet road
    const gb = MESH(new THREE.TorusGeometry(R - 0.02, 0.023, 5, 24), dark, w, 0, -0.015, 0); gb.rotation.x = Math.PI / 2; gb.scale.set(1, 1, 0.4 * squash);
    return w;
  }
  wheel(...RW, 0.12, 0, 1.0);                                              // rear: almost flat
  wheel(...FW, 0.28, -1.0, 0.84);                                          // front: twisted at the fork, squashed, propped higher

  // frame (world points; the bike's right side faces up, its top points to -z)
  const bb = [-0.02, 0.10, -0.08], head = [0.40, 0.14, -0.52], seat = [-0.24, 0.12, -0.60];
  TUBE(0.017, [0.42, 0.13, -0.45], [-0.14, 0.09, -0.12], frame);          // step-through down tube
  TUBE(0.017, [0.40, 0.13, -0.42], [0.40, 0.16, -0.72], frame);           // head tube
  TUBE(0.017, bb, seat, frame);                                            // seat tube
  for (const s of [-1, 1]) {
    TUBE(0.012, [-0.05, 0.10 + s * 0.04, -0.10], [RW[0], RW[1] + s * 0.045, RW[2]], frame);   // chainstays
    TUBE(0.012, [-0.20, 0.11 + s * 0.04, -0.54], [RW[0], RW[1] + s * 0.045, RW[2]], frame);   // seat stays
    TUBE(0.012, [0.42, 0.13 + s * 0.04, -0.42], [FW[0], FW[1] + s * 0.045, FW[2]], chrome);    // fork
  }
  TUBE(0.019, [0.22, 0.12, -0.33], [0.10, 0.11, -0.26], rust);             // rust run
  TUBE(0.019, [-0.10, 0.11, -0.30], [-0.14, 0.11, -0.40], rust);
  MESH(new THREE.CylinderGeometry(0.035, 0.035, 0.10, 10), rust, g, ...bb);
  const ring = MESH(new THREE.CylinderGeometry(0.09, 0.09, 0.02, 14), rust, g, bb[0], bb[1] + 0.06, bb[2]);
  const crank = B(0.03, 0.012, 0.30, bb[0], bb[1] + 0.07, bb[2], chrome); crank.rotation.y = 0.5;
  B(0.09, 0.05, 0.025, bb[0] + 0.07, bb[1] + 0.09, bb[2] - 0.12, grip);   // upper pedal
  B(0.09, 0.05, 0.025, bb[0] - 0.07, bb[1] - 0.06, bb[2] + 0.12, grip);   // lower pedal (on the ground)
  B(0.42, 0.03, 0.13, -0.24, bb[1] + 0.05, -0.10, rust);                  // chain guard slab
  // spilled grime patch under the crank
  const spill = MESH(new THREE.CylinderGeometry(0.16, 0.16, 0.006, 12), rust, g, -0.05, 0.003, 0.02); spill.scale.set(1.3, 1, 0.8);
  // handlebar: the bar lies across, one end on the road (that is what props the bike up)
  TUBE(0.014, [0.40, 0.16, -0.72], [0.34, 0.18, -0.76], chrome);
  TUBE(0.011, [0.34, 0.02, -0.76], [0.34, 0.48, -0.78], chrome);
  for (const s of [-1, 1]) { const y = 0.25 + s * 0.23; TUBE(0.011, [0.34, y, -0.77], [0.22, y, -0.80], chrome); TUBE(0.016, [0.30, y, -0.79], [0.19, y, -0.81], grip); TUBE(0.005, [0.30, y - s * 0.03, -0.75], [0.18, y - s * 0.07, -0.72], rust); }
  // saddle
  TUBE(0.013, seat, [-0.26, 0.12, -0.68], chrome);
  const sd = MESH(new THREE.SphereGeometry(0.12, 10, 6), saddle, g, -0.27, 0.13, -0.72); sd.scale.set(1.0, 0.7, 0.28);
  for (const s of [-1, 1]) MESH(new THREE.TorusGeometry(0.02, 0.006, 5, 10), chrome, g, -0.32, 0.13 + s * 0.04, -0.68);
  // basket: tipped forward off the front, mouth toward -z, lying on its side
  const bk = new THREE.Object3D(); bk.position.set(0.62, 0.15, -0.60); bk.rotation.set(-Math.PI / 2 + 0.2, 0, 0.3); g.add(bk);
  B(0.30, 0.012, 0.28, 0, -0.12, 0, wire, bk);
  for (let i = 0; i < 5; i++) { const y = -0.10 + i * 0.05; B(0.30, 0.006, 0.006, 0, y, 0.14, wire, bk); B(0.30, 0.006, 0.006, 0, y, -0.14, wire, bk); B(0.006, 0.006, 0.28, 0.15, y, 0, wire, bk); B(0.006, 0.006, 0.28, -0.15, y, 0, wire, bk); }
  for (let i = 0; i < 6; i++) { const x = -0.15 + i * 0.06; B(0.006, 0.24, 0.006, x, 0, 0.14, wire, bk); B(0.006, 0.24, 0.006, x, 0, -0.14, wire, bk); }
  for (let i = 0; i < 5; i++) { const z = -0.14 + i * 0.07; B(0.006, 0.24, 0.006, 0.15, 0, z, wire, bk); B(0.006, 0.24, 0.006, -0.15, 0, z, wire, bk); }
  // rear rack (lying on its side over the back wheel) + mudguards
  B(0.36, 0.16, 0.012, -0.58, 0.14, -0.40, rust);
  for (let i = 0; i < 3; i++) B(0.36, 0.008, 0.008, -0.58, 0.08 + i * 0.06, -0.405, chrome);
  const mg1 = MESH(new THREE.TorusGeometry(R + 0.015, 0.012, 5, 16, 2.6), rust, g, RW[0], RW[1] + 0.03, RW[2]); mg1.rotation.set(Math.PI / 2 + 0.12, 0, 2.2); mg1.scale.set(1, 1, 3.5);
  const mg2 = MESH(new THREE.TorusGeometry(R + 0.015, 0.012, 5, 16, 2.2), rust, g, FW[0], FW[1] + 0.03, FW[2]); mg2.rotation.set(Math.PI / 2 + 0.28, -1.0, 1.4); mg2.scale.set(1, 1, 3.5);
  const lamp = B(0.035, 0.05, 0.03, -0.84, 0.10, -0.20, tail);
  TUBE(0.007, [-0.30, 0.12, -0.08], [-0.36, 0.02, 0.12], rust);           // kickstand
  TUBE(0.004, [0.20, 0.40, -0.75], [0.44, 0.15, -0.55], dark);            // brake cable

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
