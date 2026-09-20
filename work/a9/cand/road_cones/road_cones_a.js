// road_cones — arm A: assembled from primitives.
// Three orange cones with white bands (cone + frustum band cylinders + square
// base plate), two standing joined by a yellow-and-black striped bar, one
// toppled in front lying along X. Footprint 1.3 x 0.6 m, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => { const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 }); if (dbl) s.side = THREE.DoubleSide; s.name = name; return s; };
  const ORANGE = mat(0xd8542a, 'plaster', 0.8);
  const ORANGE2 = mat(0xb9461f, 'plaster', 0.85);
  const WHITE  = mat(0xd9d0bc, 'plaster', 0.75);
  const BLACK  = mat(0x110f12, 'plaster', 0.9);
  const YELLOW = mat(0xe5b055, 'metal', 0.7, 0.2);
  const STRIPE = mat(0x1a1616, 'metal', 0.7, 0.2);
  const GRIME  = mat(0x37201b, 'plaster', 0.95);
  const H = 0.52, RB = 0.10, RT = 0.028;
  const rAt = (y) => RB + (RT - RB) * (y / H);

  const cone = (x, z, rotZ, rotY, dark) => {
    const c = new THREE.Group();
    const body = new THREE.Mesh(new THREE.ConeGeometry(RB, H, 14, 1, true), dark ? ORANGE2 : ORANGE); body.material.side = THREE.DoubleSide;
    body.position.y = H / 2; c.add(body);
    for (const [y0, y1] of [[0.30, 0.37], [0.15, 0.20]]) {
      const b = new THREE.Mesh(new THREE.CylinderGeometry(rAt(y1) + 0.004, rAt(y0) + 0.004, y1 - y0, 14, 1, true), WHITE); b.material.side = THREE.DoubleSide;
      b.position.y = (y0 + y1) / 2; c.add(b);
    }
    const base = new THREE.Mesh(new THREE.BoxGeometry(0.30, 0.025, 0.30), dark ? ORANGE2 : ORANGE); base.position.y = 0.0125; c.add(base);
    const grime = new THREE.Mesh(new THREE.BoxGeometry(0.305, 0.008, 0.305), GRIME); grime.position.y = 0.004; c.add(grime);
    const foot = new THREE.Mesh(new THREE.CylinderGeometry(RB + 0.01, RB + 0.02, 0.03, 14), BLACK); foot.position.y = 0.04; c.add(foot);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(RT + 0.005, RT + 0.005, 0.02, 8), BLACK); cap.position.y = H - 0.01; c.add(cap);
    c.position.set(x, 0, z); c.rotation.set(0, rotY, rotZ); g.add(c); return c;
  };
  // two standing cones, a bar between them at 0.44 m
  cone(-0.5, -0.12, 0, 0.2, false);
  cone(0.5, -0.1, 0, -0.4, true);
  const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 1.16, 8), YELLOW);
  bar.rotation.z = Math.PI / 2; bar.position.set(0, 0.44, -0.11); g.add(bar);
  for (let i = 0; i < 6; i++) { const s = new THREE.Mesh(new THREE.CylinderGeometry(0.021, 0.021, 0.09, 8), STRIPE); s.rotation.z = Math.PI / 2; s.position.set(-0.48 + i * 0.19, 0.44, -0.11); g.add(s); }
  for (const x of [-0.5, 0.5]) { const r = new THREE.Mesh(new THREE.TorusGeometry(0.034, 0.008, 5, 10), BLACK); r.position.set(x, 0.44, -0.11); r.rotation.x = Math.PI / 2; g.add(r); }
  // the toppled cone: lying along -X in front, tip to the left, base plate up on edge
  const t = cone(0, 0, -Math.PI / 2 + 0.08, 0, false);
  t.position.set(0.12, RB - 0.01, 0.22); t.rotation.y = 0.25;

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
