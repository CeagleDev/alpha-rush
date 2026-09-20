// litter_set — arm A: assembled from primitives.
// Four litter pieces laid out within 1.2 x 1.2 m, each its own named Group with
// its base at y = 0 and a footprint under 0.3 m, so the level can clone them by
// name: `paper` (a crumpled sheet of tilted thin boxes), `cup` (a squashed cup
// from cylinders), `can` (a crushed short cylinder), `bag` (a small tied capsule).
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => { const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 }); if (dbl) s.side = THREE.DoubleSide; s.name = name; return s; };
  const PAPER = mat(0xd9d0bc, 'plaster', 0.95, 0, true);
  const PAPER2 = mat(0xb8ada0, 'plaster', 0.95, 0, true);
  const INK   = mat(0xb8302a, 'plaster', 0.9);
  const CUP   = mat(0xc9bfae, 'plaster', 0.9, 0, true);
  const CUPIN = mat(0x8b6141, 'plaster', 0.9, 0, true);
  const CAN   = mat(0x8e9296, 'metal', 0.45, 0.6);
  const CANL  = mat(0x40559f, 'metal', 0.55, 0.3);
  const CANR  = mat(0xb8302a, 'metal', 0.55, 0.3);
  const BAG   = mat(0xcfc7b8, 'fabric', 0.7, 0, true);
  const KNOT  = mat(0xb8302a, 'fabric', 0.9);
  const GRIME = mat(0x37201b, 'plaster', 0.95);
  const part = (name, x, z) => { const p = new THREE.Group(); p.name = name; p.position.set(x, 0, z); g.add(p); return p; };
  const add = (parent, geo, m, x, y, z, rx, ry, rz) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx || 0, ry || 0, rz || 0); parent.add(o); return o; };

  // paper: a crumpled sheet, five tilted panels plus a red print patch
  const paper = part('paper', -0.35, -0.35);
  add(paper, new THREE.BoxGeometry(0.22, 0.004, 0.16), PAPER, 0, 0.012, 0, 0.10, 0.3, -0.06);
  add(paper, new THREE.BoxGeometry(0.14, 0.004, 0.12), PAPER2, 0.05, 0.035, -0.03, -0.35, 0.1, 0.25);
  add(paper, new THREE.BoxGeometry(0.12, 0.004, 0.10), PAPER, -0.06, 0.03, 0.04, 0.4, -0.2, 0.15);
  add(paper, new THREE.BoxGeometry(0.10, 0.004, 0.07), PAPER2, 0.02, 0.05, 0.05, -0.2, 0.9, -0.5);
  add(paper, new THREE.BoxGeometry(0.08, 0.004, 0.06), PAPER, -0.07, 0.015, -0.05, 0.05, 0.5, 0.02);
  add(paper, new THREE.BoxGeometry(0.06, 0.005, 0.04), INK, 0.03, 0.014, 0.02, 0.10, 0.3, -0.06);
  add(paper, new THREE.BoxGeometry(0.03, 0.005, 0.03), GRIME, -0.05, 0.014, 0.0, 0.10, 0.3, -0.06);

  // cup: a paper cup squashed flat, cylinder frustum flattened, lid ring, lying tipped
  const cup = part('cup', 0.35, -0.35);
  add(cup, new THREE.CylinderGeometry(0.045, 0.033, 0.09, 10, 1, true), CUP, 0, 0.03, 0, 0.35, 0, 1.25).scale.set(1, 1, 0.45);
  add(cup, new THREE.CylinderGeometry(0.033, 0.033, 0.006, 10), CUPIN, -0.043, 0.024, 0.0, 0.35, 0, 1.25).scale.set(1, 1, 0.45);
  add(cup, new THREE.TorusGeometry(0.046, 0.005, 4, 10), CUPIN, 0.045, 0.036, 0, 0.35, 0, 1.25).scale.set(1, 1, 0.45);
  add(cup, new THREE.BoxGeometry(0.05, 0.003, 0.04), GRIME, 0.02, 0.002, 0.03);

  // can: a crushed drinks can lying on its side, waist dented in
  const can = part('can', 0.35, 0.35);
  add(can, new THREE.CylinderGeometry(0.033, 0.033, 0.05, 10), CAN, -0.04, 0.03, 0, 0, 0, Math.PI / 2 + 0.15).scale.set(0.9, 1, 1);
  add(can, new THREE.CylinderGeometry(0.030, 0.026, 0.04, 10), CANL, 0.0, 0.028, 0, 0, 0, Math.PI / 2 + 0.05).scale.set(0.75, 1, 1);
  add(can, new THREE.CylinderGeometry(0.033, 0.033, 0.035, 10), CANR, 0.035, 0.03, 0.003, 0, 0, Math.PI / 2 - 0.1).scale.set(0.9, 1, 1);
  add(can, new THREE.CylinderGeometry(0.028, 0.028, 0.004, 10), CAN, 0.055, 0.029, 0.005, 0, 0, Math.PI / 2 - 0.1);
  add(can, new THREE.TorusGeometry(0.008, 0.002, 3, 8), CAN, 0.058, 0.032, 0.004, 0, Math.PI / 2, 0);   // ring pull
  add(can, new THREE.BoxGeometry(0.04, 0.003, 0.05), GRIME, -0.01, 0.002, 0.02);

  // bag: a small knotted plastic bag, a squashed sphere body with a capsule neck and a knot
  const bag = part('bag', -0.35, 0.35);
  add(bag, new THREE.SphereGeometry(0.09, 10, 7), BAG, 0, 0.07, 0, 0.1, 0.4, 0).scale.set(1.1, 0.78, 0.95);
  add(bag, new THREE.CapsuleGeometry(0.02, 0.05, 3, 6), BAG, 0.02, 0.16, -0.02, 0.5, 0, -0.3);
  add(bag, new THREE.TorusGeometry(0.022, 0.006, 4, 8), KNOT, 0.028, 0.155, -0.03, 0.5, 0.3, -0.3);
  add(bag, new THREE.CapsuleGeometry(0.012, 0.04, 3, 5), BAG, 0.06, 0.18, -0.05, 0.9, 0.2, -1.2);   // the tied ends
  add(bag, new THREE.BoxGeometry(0.05, 0.02, 0.04), GRIME, -0.03, 0.05, 0.05, 0.2, 0.4, 0.1);        // something dark inside, showing through
  add(bag, new THREE.BoxGeometry(0.04, 0.03, 0.03), INK, 0.04, 0.06, 0.03, -0.2, 0.7, 0.2);

  g.userData.instanceable = ['paper', 'cup', 'can', 'bag'];

  // ground each named piece on its own, then centre the set on x/z
  const v = new THREE.Vector3();
  for (const p of g.children) {
    const box = new THREE.Box3(); p.updateMatrixWorld(true);
    p.traverse((n) => { const a = n.isMesh && n.geometry.attributes.position; if (!a) return; for (let i = 0; i < a.count; i++) box.expandByPoint(v.fromBufferAttribute(a, i).applyMatrix4(n.matrixWorld)); });
    p.children.forEach((o) => { o.position.y -= box.min.y; });
    p.userData.footprint = [box.max.x - box.min.x, box.max.z - box.min.z];
  }
  const box = new THREE.Box3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const a = n.isMesh && n.geometry.attributes.position; if (!a) return; for (let i = 0; i < a.count; i++) box.expandByPoint(v.fromBufferAttribute(a, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.z -= c.z; });
  return g;
}
