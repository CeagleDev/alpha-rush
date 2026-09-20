// litter_set — arm B: built from profiles.
// `cup` and `can` are LatheGeometry profiles with the crush drawn into the
// profile (a stepped-on cup, a can with a folded waist), `bag` is a lathe with a
// tied neck and a scatter on its rim, `paper` is an irregular Shape extruded
// 3 mm and folded from three panels. Each piece a named Group, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => { const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 }); if (dbl) s.side = THREE.DoubleSide; s.name = name; return s; };
  const PAPER = mat(0xd9d0bc, 'plaster', 0.95, 0, true);
  const PAPER2 = mat(0xb8ada0, 'plaster', 0.95, 0, true);
  const INK   = mat(0xb8302a, 'plaster', 0.9);
  const INK2  = mat(0x40559f, 'plaster', 0.9);
  const CUP   = mat(0xc9bfae, 'plaster', 0.9, 0, true);
  const CAN   = mat(0x8e9296, 'metal', 0.45, 0.6, true);
  const CANL  = mat(0xb8302a, 'metal', 0.55, 0.3, true);
  const BAG   = mat(0xcfc7b8, 'fabric', 0.7, 0, true);
  const KNOT  = mat(0xb8302a, 'fabric', 0.9);
  const GRIME = mat(0x37201b, 'plaster', 0.95);
  const V2 = (x, y) => new THREE.Vector2(x, y);
  const part = (name, x, z) => { const p = new THREE.Group(); p.name = name; p.position.set(x, 0, z); g.add(p); return p; };
  const add = (parent, geo, m, x, y, z, rx, ry, rz) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.rotation.set(rx || 0, ry || 0, rz || 0); parent.add(o); return o; };
  const poly = (pts) => { const s = new THREE.Shape(); pts.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]))); s.closePath(); return s; };
  const sheet = (pts, t, m) => { const geo = new THREE.ExtrudeGeometry(poly(pts), { depth: t, bevelEnabled: false, steps: 1 }); geo.rotateX(-Math.PI / 2); return geo; };

  // paper: a torn sheet in three creased panels
  const paper = part('paper', -0.35, -0.35);
  add(paper, sheet([[-0.11, -0.07], [0.0, -0.08], [0.02, -0.03], [0.0, 0.06], [-0.09, 0.08], [-0.12, 0.0]], 0.003, PAPER), 0, 0.01, 0, 0.12, 0.2, 0.05);
  add(paper, sheet([[0.0, -0.08], [0.11, -0.06], [0.12, 0.05], [0.03, 0.07], [0.0, 0.06], [0.02, -0.03]], 0.003, PAPER2), 0.005, 0.012, 0, -0.3, 0.2, -0.35);
  add(paper, sheet([[-0.05, -0.04], [0.05, -0.05], [0.06, 0.03], [-0.04, 0.04]], 0.003, PAPER), 0.02, 0.045, 0.02, 0.6, 0.9, 0.2);
  add(paper, sheet([[-0.03, -0.02], [0.03, -0.02], [0.03, 0.02], [-0.03, 0.02]], 0.004, INK), -0.05, 0.012, 0.0, 0.12, 0.2, 0.05);
  add(paper, sheet([[-0.02, -0.015], [0.02, -0.015], [0.02, 0.015], [-0.02, 0.015]], 0.004, INK2), 0.06, 0.014, 0.0, -0.3, 0.2, -0.35);
  add(paper, sheet([[-0.02, -0.02], [0.02, -0.02], [0.02, 0.02], [-0.02, 0.02]], 0.004, GRIME), 0.0, 0.013, 0.05, 0.12, 0.2, 0.05);

  // cup: a stepped-on paper cup - lathe profile with a folded wall, then flattened
  const cup = part('cup', 0.35, -0.35);
  const cupProf = [V2(0, 0), V2(0.030, 0), V2(0.032, 0.004), V2(0.036, 0.03), V2(0.030, 0.045), V2(0.040, 0.07), V2(0.046, 0.085), V2(0.049, 0.088), V2(0.047, 0.092)];
  add(cup, new THREE.LatheGeometry(cupProf, 12), CUP, 0, 0.047, 0, 1.35, 0, 0.9).scale.set(1, 1, 0.5);
  add(cup, new THREE.CylinderGeometry(0.03, 0.03, 0.005, 10), GRIME, 0, 0.004, 0.02);   // the spill

  // can: lathe with a folded waist and a domed end, lying down
  const can = part('can', 0.35, 0.35);
  const canProf = [V2(0, 0), V2(0.026, 0), V2(0.033, 0.006), V2(0.033, 0.03), V2(0.024, 0.045), V2(0.020, 0.058), V2(0.030, 0.07), V2(0.033, 0.10), V2(0.028, 0.114), V2(0.022, 0.116), V2(0, 0.116)];
  add(can, new THREE.LatheGeometry(canProf, 12), CAN, 0, 0.032, 0, 0.1, 0, Math.PI / 2 + 0.2).scale.set(1, 1, 0.85);
  add(can, new THREE.LatheGeometry([V2(0.0335, 0.031), V2(0.0335, 0.043), V2(0.025, 0.046)], 12), CANL, 0, 0.032, 0, 0.1, 0, Math.PI / 2 + 0.2).scale.set(1, 1, 0.85);
  add(can, new THREE.LatheGeometry([V2(0.0335, 0.07), V2(0.0335, 0.098)], 12), CANL, 0, 0.032, 0, 0.1, 0, Math.PI / 2 + 0.2).scale.set(1, 1, 0.85);
  add(can, new THREE.TorusGeometry(0.008, 0.002, 3, 8), CAN, -0.035, 0.036, 0.0, 0, Math.PI / 2, 0);
  add(can, new THREE.CylinderGeometry(0.02, 0.02, 0.004, 8), GRIME, 0.06, 0.003, 0.02);

  // bag: lathe body with a gathered neck, tipped over, plus a knot and tails
  const bag = part('bag', -0.35, 0.35);
  const bagProf = [V2(0, 0), V2(0.07, 0), V2(0.095, 0.03), V2(0.10, 0.07), V2(0.085, 0.11), V2(0.055, 0.14), V2(0.03, 0.16), V2(0.018, 0.19), V2(0.022, 0.21), V2(0.012, 0.23), V2(0, 0.24)];
  add(bag, new THREE.LatheGeometry(bagProf, 11), BAG, 0, 0.02, 0, 0.28, 0.3, -0.45).scale.set(1, 1, 0.85);
  add(bag, new THREE.TorusGeometry(0.02, 0.006, 4, 8), KNOT, 0.085, 0.175, -0.02, 0.5, 0.3, 0.9);
  add(bag, new THREE.CapsuleGeometry(0.011, 0.04, 3, 5), BAG, 0.11, 0.18, -0.04, 1.0, 0.2, -1.3);
  add(bag, new THREE.BoxGeometry(0.05, 0.02, 0.04), GRIME, -0.02, 0.05, 0.03, 0.2, 0.4, 0.1);
  add(bag, new THREE.BoxGeometry(0.03, 0.03, 0.03), INK, 0.03, 0.07, -0.03, -0.2, 0.7, 0.2);

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
