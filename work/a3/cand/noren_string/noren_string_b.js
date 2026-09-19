// noren_string — arm B: profiles. The frayed hem of every banner is a single
// jagged THREE.Shape strip extruded 8 mm, the cloth loops are half-torus sweeps
// over the rope, and the rope is a TubeGeometry on a sagging CatmullRom curve
// between x = ±3 with a lathe-turned wooden toggle at either end.
// Base y = 0 is the LOWEST HEM. Rope ends sit at y ≈ 1.31; the game hangs the
// rope at 3.2 m, so it places this group at y ≈ 3.2 − 1.31 = 1.89.
// Banner faces are single thin BoxGeometry quads (UV 0..1 per face), material
// named `fabric` for a later stroke sprite. No strokes, no text here.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...o });
    if (name) m.name = name;
    return m;
  };
  const ROPE = mk(0x8b6141, 'timber', { roughness: 0.95 });
  const TOGGLE = mk(0x4f2d21, 'timber', { roughness: 0.9 });
  const TAB = mk(0x181c2d, 'fabric', { side: DS });
  const FRAY = mk(0x110f12, 'fabric', { side: DS, roughness: 0.98 });
  const CLOTH = [0x1f2740, 0x242b45, 0x1c2238, 0x212841, 0x262e49].map((c) => mk(c, 'fabric', { side: DS, roughness: 0.92 }));

  const add = (geo, mat, x, y, z, rx, ry, rz, parent) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    (parent || g).add(m); return m;
  };
  // bevelEnabled false always: a bevel grows the profile and hangs it below its base
  const ex = (shape, depth) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 3, steps: 1 });
    geo.translate(0, 0, -depth / 2);
    return geo;
  };

  // ---- rope ------------------------------------------------------------------
  const Y0 = 1.31, SAG = 0.09;
  const ropeY = (x) => Y0 - SAG * (1 - (x / 3) * (x / 3));
  const pts = [];
  for (let i = 0; i <= 10; i++) { const x = -3 + i * 0.6; pts.push(new THREE.Vector3(x, ropeY(x), 0)); }
  g.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.017, 5, false), ROPE));
  // wooden toggles the rope is tied through (lathe), one each end
  const TP = [[0, -0.07], [0.018, -0.07], [0.024, -0.03], [0.02, 0], [0.024, 0.03], [0.018, 0.07], [0, 0.07]]
    .map(([r, y]) => new THREE.Vector2(r, y));
  for (const sx of [-1, 1]) add(new THREE.LatheGeometry(TP, 7), TOGGLE, sx * 2.98, ropeY(sx * 2.98), 0, 0, 0, 0);

  // ---- banners ---------------------------------------------------------------
  const W = 0.5, H = 1.2, T = 0.006;
  const xs = [-1.1, -0.55, 0, 0.55, 1.1];
  const rots = [[-0.02, -0.05], [0.015, 0.03], [-0.01, -0.02], [0.02, 0.06], [-0.025, 0.04]];
  // one jagged fray strip profile, reused with mirrored / shifted teeth per banner
  const frayShape = (seed) => {
    const s = new THREE.Shape();
    const n = 14, top = 0.045;
    s.moveTo(-W / 2, top);
    s.lineTo(W / 2, top);
    for (let k = n; k >= 0; k--) {
      const x = -W / 2 + (k / n) * W;
      const deep = -(0.02 + 0.05 * (((k * 3 + seed * 5) % 5) / 4));
      s.lineTo(x + 0.004, k % 2 ? deep : -0.006);
    }
    s.closePath();
    return s;
  };
  xs.forEach((bx, i) => {
    const pivot = new THREE.Group();
    pivot.position.set(bx, ropeY(bx), 0);
    pivot.rotation.set(rots[i][0], rots[i][1], 0);
    g.add(pivot);
    // loops: half-torus sweeps over the rope, closed by a short tab below
    for (const lx of [-0.2, 0, 0.2]) {
      add(new THREE.TorusGeometry(0.03, 0.009, 4, 7, Math.PI), TAB, lx, 0.0, 0, 0, Math.PI / 2, 0, pivot);
      add(new THREE.BoxGeometry(0.03, 0.05, 0.012), TAB, lx, -0.035, 0, 0, 0, 0, pivot);
    }
    const top = -0.055;
    add(new THREE.BoxGeometry(W, H, T), CLOTH[i], 0, top - H / 2, 0, 0, 0, 0, pivot);
    // frayed hem strip: the extruded jagged profile sits over the last 4.5 cm
    add(ex(frayShape(i), 0.012), FRAY, 0, top - H, 0, 0, 0, 0, pivot);
  });

  // ---- the six lines ----------------------------------------------------------
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
