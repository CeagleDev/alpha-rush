// noren_string — arm A: primitives. A 6 m hemp rope (TubeGeometry on a CatmullRom
// curve, ends at x = ±3, 8 cm of sag) carrying five indigo cloth banners
// 0.5 × 1.2 m on cloth loops, each hung a few degrees off square. Frayed hems
// are a row of thin dark boxes straddling the lower edge.
// Base y = 0 is the LOWEST HEM. Rope ends sit at y ≈ 1.30; the game hangs the
// rope at 3.2 m, so it places this group at y ≈ 3.2 − 1.30 = 1.90.
// Each banner face is a single PlaneGeometry quad (UV 0..1) in a material named
// `fabric`, so a stroke sprite can be applied later. No strokes, no text here.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...o });
    if (name) m.name = name;
    return m;
  };
  const ROPE = mk(0x8b6141, 'timber', { roughness: 0.95 });
  const ROPE2 = mk(0x6c4028, 'timber', { roughness: 0.95 });
  const TAB = mk(0x1a1f33, 'fabric', { side: DS });
  const FRAY = mk(0x110f12, 'fabric', { side: DS, roughness: 0.98 });
  const GRIME = mk(0x231718, 'fabric', { side: DS, roughness: 0.98 });
  // five faded indigo shades: wear as colour variation, banner to banner
  const CLOTH = [0x212841, 0x1e2439, 0x262d47, 0x1c2237, 0x232a42].map((c) => mk(c, 'fabric', { side: DS, roughness: 0.92 }));

  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || g).add(m); return m;
  };

  // ---- rope: sag 8 cm between x = ±3 ----------------------------------------
  const Y0 = 1.30, SAG = 0.08;
  const ropeY = (x) => Y0 - SAG * (1 - (x / 3) * (x / 3));
  const pts = [];
  for (let i = 0; i <= 8; i++) { const x = -3 + i * 0.75; pts.push(new THREE.Vector3(x, ropeY(x), 0)); }
  const curve = new THREE.CatmullRomCurve3(pts);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 36, 0.018, 6, false), ROPE));
  // knots at the ends and a short dangling tail
  for (const sx of [-1, 1]) {
    add(new THREE.TorusGeometry(0.035, 0.016, 5, 8), ROPE2, sx * 2.96, ropeY(sx * 2.96), 0, 0, Math.PI / 2, 0);
    add(new THREE.CylinderGeometry(0.014, 0.010, 0.16, 5), ROPE2, sx * 2.93, ropeY(sx * 2.96) - 0.09, 0.01, 0.15, 0, sx * 0.25);
  }

  // ---- banners ---------------------------------------------------------------
  const W = 0.5, H = 1.2;
  const rots = [[0.02, 0.06], [-0.015, -0.04], [0.01, 0.02], [-0.02, 0.05], [0.025, -0.07]];
  const xs = [-1.08, -0.54, 0, 0.54, 1.08];
  xs.forEach((bx, i) => {
    const ry = ropeY(bx);
    const pivot = new THREE.Group();
    pivot.position.set(bx, ry, 0);
    pivot.rotation.set(rots[i][0], rots[i][1], 0);
    g.add(pivot);
    // three cloth loops over the rope
    for (const lx of [-0.19, 0, 0.19]) add(new THREE.BoxGeometry(0.045, 0.075, 0.05), TAB, lx, -0.005, 0, 0, 0, 0, pivot);
    // the face: one quad, UV 0..1, top edge 5 cm under the rope
    const top = -0.05;
    add(new THREE.PlaneGeometry(W, H), CLOTH[i], 0, top - H / 2, 0, 0, 0, 0, pivot);
    // grime band at the hem, both sides of the quad
    for (const sz of [-1, 1]) add(new THREE.BoxGeometry(W, 0.06, 0.003), GRIME, 0, top - H + 0.05, sz * 0.003, 0, 0, 0, pivot);
    // frayed hem: a jagged row of thin dark boxes hanging below the quad
    const n = 11;
    for (let k = 0; k < n; k++) {
      const u = (k + 0.5) / n;
      const fw = 0.028 + 0.012 * ((k * 7 + i) % 3);
      const fh = 0.03 + 0.045 * (((k * 5 + i * 3) % 4) / 3);
      add(new THREE.BoxGeometry(fw, fh, 0.012), FRAY, -W / 2 + u * W, top - H + 0.02 - fh / 2, 0, 0, 0, 0, pivot);
    }
  });

  // ---- the six lines (plus the lights are none: a noren does not emit) ------
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.hangAt = 3.2;
  return g;
}
