// crate_stack — arm A: primitives. Four plastic beer crates 0.5 × 0.35 × 0.3 m
// (w × d × h) stacked with small offsets, white / yellow / white / yellow from
// the bottom, every crate an open lattice of box slats: corner posts, a top
// and bottom rail, a mid rail, vertical slats and a hand-hole gap on the ends.
// Six brown bottle necks stand in the top crate. Bottom rail of the lowest
// crate is the black grounding band. Jump obstacle. Front = +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.8, metalness: 0, ...o });
    if (name) m.name = name;
    return m;
  };
  // two yellows, two whites, each with its own dirt level (wear as colour variation)
  const YEL = mk(0xf8e845, "plaster", { roughness: 0.75 });
  const YEL2 = mk(0xd9c73a, "plaster", { roughness: 0.85 });
  const WHT = mk(0xeee2c8, "plaster", { roughness: 0.8 });
  const WHT2 = mk(0xc9bda3, "plaster", { roughness: 0.9 });
  const GRIME = mk(0x8b6141, "plaster", { roughness: 0.95 });
  const BLACK = mk(0x110f12, "plaster", { roughness: 0.95 });
  const GLASS = mk(0x4a2a12, "metal", { roughness: 0.35, metalness: 0.1 });
  const GLASS2 = mk(0x5a3416, "metal", { roughness: 0.35, metalness: 0.1 });
  const CAP = mk(0xbf7c42, "metal", { roughness: 0.5, metalness: 0.4 });
  const LABEL = mk(0xb8302a, "plaster", { roughness: 0.9 });
  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || g).add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const CW = 0.5, CD = 0.35, CH = 0.3, T = 0.025, P = 0.035;
  function crate(body, rail, x, y, z, ry, bottom, chipped) {
    const c = new THREE.Group(); c.position.set(x, y, z); c.rotation.y = ry; g.add(c);
    const A = (geo, mat, px, py, pz) => add(geo, mat, px, py, pz, 0, 0, 0, c);
    A(B(CW - 0.06, 0.02, CD - 0.06), rail, 0, 0.035, 0);                        // floor
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
      const chip = chipped && sx > 0 && sz > 0;
      A(B(P, chip ? CH - 0.05 : CH, P), chip ? GRIME : body, sx * (CW / 2 - P / 2), (chip ? CH - 0.05 : CH) / 2, sz * (CD / 2 - P / 2));
    }
    const lo = bottom ? BLACK : rail;
    // bottom rail (4 cm) and top rail (4 cm), long sides then short sides
    for (const sz of [-1, 1]) {
      A(B(CW - 2 * P, 0.04, T), lo, 0, 0.02, sz * (CD / 2 - T / 2));
      A(B(CW - 2 * P, 0.04, T), body, 0, CH - 0.02, sz * (CD / 2 - T / 2));
      A(B(CW - 2 * P, 0.025, T), rail, 0, CH * 0.5, sz * (CD / 2 - T / 2));  // mid rail
      for (let i = 0; i < 5; i++) A(B(0.02, CH - 0.08, T), body, -0.16 + i * 0.08, CH / 2, sz * (CD / 2 - T / 2));
    }
    for (const sx of [-1, 1]) {
      A(B(T, 0.04, CD - 2 * P), lo, sx * (CW / 2 - T / 2), 0.02, 0);
      A(B(T, 0.04, CD - 2 * P), body, sx * (CW / 2 - T / 2), CH - 0.02, 0);
      A(B(T, 0.025, 0.06), rail, sx * (CW / 2 - T / 2), CH * 0.5, -0.11);     // mid rail, split by a hand hole
      A(B(T, 0.025, 0.06), rail, sx * (CW / 2 - T / 2), CH * 0.5, 0.11);
      for (const z of [-0.11, 0.11]) A(B(T, CH - 0.08, 0.02), body, sx * (CW / 2 - T / 2), CH / 2, z);
      A(B(T, 0.1, 0.02), body, sx * (CW / 2 - T / 2), 0.09, 0);                // short slat under the hand hole
    }
    return c;
  }
  crate(WHT2, GRIME, 0.00, 0.00, 0.00, 0.00, true, false);
  crate(YEL2, YEL2, 0.02, 0.30, -0.015, 0.06, false, true);
  crate(WHT, WHT2, -0.015, 0.60, 0.01, -0.04, false, false);
  const top = crate(YEL, YEL2, 0.01, 0.90, -0.01, 0.03, false, false);
  // bottles in the top crate: body, shoulder, neck, cap, one label
  const bottle = (x, z, lean, mat) => {
    const b = new THREE.Group(); b.position.set(x, 0.05, z); b.rotation.set(lean[0], 0, lean[1]); top.add(b);
    add(new THREE.CylinderGeometry(0.03, 0.03, 0.18, 6), mat, 0, 0.09, 0, 0, 0, 0, b);
    add(new THREE.CylinderGeometry(0.012, 0.03, 0.04, 6), mat, 0, 0.20, 0, 0, 0, 0, b);
    add(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 6), mat, 0, 0.255, 0, 0, 0, 0, b);
    add(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 6), CAP, 0, 0.295, 0, 0, 0, 0, b);
    add(new THREE.CylinderGeometry(0.031, 0.031, 0.05, 6), LABEL, 0, 0.10, 0, 0, 0, 0, b);
  };
  bottle(-0.16, -0.09, [0.05, 0.1], GLASS); bottle(-0.05, -0.1, [0, -0.06], GLASS2);
  bottle(0.07, -0.08, [-0.04, 0.02], GLASS); bottle(0.17, 0.02, [0.08, -0.05], GLASS2);
  bottle(-0.1, 0.08, [-0.06, 0.04], GLASS); bottle(0.04, 0.1, [0.03, 0.09], GLASS);
  // ---- the six lines ----------------------------------------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.obstacle = { kind: "jump", lanes: 1 };
  return g;
}
