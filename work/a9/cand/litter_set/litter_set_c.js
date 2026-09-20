// litter_set — arm C: a different reading of the reference.
// The reference litter is FLAT and trodden: the paper is a fanned, folded
// newspaper (three overlapping leaves), the cup is a stamped-flat disc with the
// rim still showing, the can is crushed nearly flat (an elliptical slab with
// the two ends still round), the bag is a low, sagging blob with its knot
// drooping to the ground. Built from stretched primitives so every piece is low
// enough to run over. Each piece a named Group, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => { const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 }); if (dbl) s.side = THREE.DoubleSide; s.name = name; return s; };
  const PAPER = mat(0xd9d0bc, 'plaster', 0.95, 0, true);
  const PAPER2 = mat(0xc4b9a8, 'plaster', 0.95, 0, true);
  const PAPER3 = mat(0xa89d90, 'plaster', 0.95, 0, true);
  const INK   = mat(0xb8302a, 'plaster', 0.9);
  const INK2  = mat(0x40559f, 'plaster', 0.9);
  const INK3  = mat(0x241a1a, 'plaster', 0.9);
  const CUP   = mat(0xc9bfae, 'plaster', 0.9, 0, true);
  const CUPIN = mat(0x8b6141, 'plaster', 0.9, 0, true);
  const CAN   = mat(0x8e9296, 'metal', 0.45, 0.6);
  const CANL  = mat(0xe5b055, 'metal', 0.55, 0.3);
  const CANR  = mat(0xb8302a, 'metal', 0.55, 0.3);
  const BAG   = mat(0xcfc7b8, 'fabric', 0.7, 0, true);
  const KNOT  = mat(0xb8302a, 'fabric', 0.9);
  const GRIME = mat(0x37201b, 'plaster', 0.95);
  const part = (name, x, z) => { const p = new THREE.Group(); p.name = name; p.position.set(x, 0, z); g.add(p); return p; };
  const add = (parent, geo, m, x, y, z, rx, ry, rz) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx || 0, ry || 0, rz || 0); parent.add(o); return o; };

  // paper: a fanned newspaper, three leaves, one folded up at the corner, print blocks
  const paper = part('paper', -0.35, -0.35);
  add(paper, new THREE.BoxGeometry(0.26, 0.003, 0.18), PAPER3, 0, 0.0015, 0, 0, 0.15, 0);
  add(paper, new THREE.BoxGeometry(0.24, 0.003, 0.17), PAPER2, 0.02, 0.005, -0.01, 0, 0.32, 0);
  add(paper, new THREE.BoxGeometry(0.22, 0.003, 0.16), PAPER, 0.04, 0.0085, -0.02, 0, 0.48, 0);
  add(paper, new THREE.BoxGeometry(0.08, 0.003, 0.07), PAPER, 0.12, 0.03, -0.08, -0.6, 0.48, 0.15);       // the corner curled up
  add(paper, new THREE.BoxGeometry(0.06, 0.004, 0.05), INK, 0.0, 0.011, -0.02, 0, 0.48, 0);
  add(paper, new THREE.BoxGeometry(0.09, 0.004, 0.02), INK3, -0.05, 0.011, 0.04, 0, 0.48, 0);
  add(paper, new THREE.BoxGeometry(0.04, 0.004, 0.04), INK2, 0.07, 0.011, 0.03, 0, 0.48, 0);
  add(paper, new THREE.BoxGeometry(0.05, 0.004, 0.03), GRIME, -0.08, 0.011, -0.04, 0, 0.48, 0);

  // cup: stamped flat - a wide low disc with a squashed rim ring, the base circle still visible
  const cup = part('cup', 0.35, -0.35);
  add(cup, new THREE.CylinderGeometry(0.05, 0.055, 0.014, 12), CUP, 0, 0.007, 0).scale.set(1, 1, 0.7);
  add(cup, new THREE.TorusGeometry(0.052, 0.006, 5, 12), CUPIN, 0, 0.014, 0, Math.PI / 2, 0, 0).scale.set(1, 0.7, 1);
  add(cup, new THREE.CylinderGeometry(0.028, 0.028, 0.006, 10), CUPIN, 0.005, 0.017, 0.005).scale.set(1, 1, 0.7);
  add(cup, new THREE.BoxGeometry(0.06, 0.003, 0.05), GRIME, 0.05, 0.0015, 0.04, 0, 0.4, 0);

  // can: crushed nearly flat, the two round ends survive as squashed discs
  const can = part('can', 0.35, 0.35);
  add(can, new THREE.BoxGeometry(0.11, 0.022, 0.065), CAN, 0, 0.011, 0, 0, 0.2, 0);
  add(can, new THREE.BoxGeometry(0.05, 0.024, 0.066), CANR, -0.02, 0.012, 0, 0, 0.2, 0);
  add(can, new THREE.BoxGeometry(0.015, 0.024, 0.066), CANL, 0.02, 0.012, 0, 0, 0.2, 0);
  add(can, new THREE.CylinderGeometry(0.03, 0.03, 0.006, 10), CAN, 0.056, 0.014, 0.012, 0, 0.2, Math.PI / 2).scale.set(1, 1, 0.45);
  add(can, new THREE.CylinderGeometry(0.03, 0.03, 0.006, 10), CAN, -0.056, 0.014, -0.012, 0, 0.2, Math.PI / 2).scale.set(1, 1, 0.45);
  add(can, new THREE.BoxGeometry(0.04, 0.008, 0.03), CAN, 0.03, 0.026, -0.01, 0.1, 0.5, 0.3);              // a fold standing proud
  add(can, new THREE.TorusGeometry(0.007, 0.002, 3, 8), CAN, 0.062, 0.02, 0.012, 0, Math.PI / 2 + 0.2, 0);

  // bag: a low sagging blob, knot drooped to the ground, contents pushing through
  const bag = part('bag', -0.35, 0.35);
  add(bag, new THREE.SphereGeometry(0.09, 10, 6), BAG, 0, 0.05, 0, 0, 0.3, 0).scale.set(1.2, 0.55, 0.9);
  add(bag, new THREE.SphereGeometry(0.05, 8, 5), BAG, 0.06, 0.07, -0.03, 0, 0.3, 0).scale.set(1, 0.7, 0.8);   // a lump in it
  add(bag, new THREE.CapsuleGeometry(0.016, 0.06, 3, 6), BAG, -0.1, 0.02, 0.03, 1.4, 0, 1.1);                    // the neck, on the ground
  add(bag, new THREE.TorusGeometry(0.018, 0.006, 4, 8), KNOT, -0.13, 0.02, 0.045, 0.3, 0.6, 1.1);
  add(bag, new THREE.CapsuleGeometry(0.01, 0.035, 3, 5), BAG, -0.16, 0.01, 0.06, 1.5, 0.4, 0.9);
  add(bag, new THREE.BoxGeometry(0.04, 0.02, 0.03), GRIME, 0.02, 0.05, 0.03, 0.2, 0.4, 0.1);
  add(bag, new THREE.BoxGeometry(0.03, 0.02, 0.03), INK, -0.03, 0.045, -0.02, -0.2, 0.7, 0.2);

  g.userData.instanceable = ['paper', 'cup', 'can', 'bag'];

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
