// awning_strut_low — arm C: a different breakdown. Two pipe sections joined by a bolted
// coupler sleeve; SQUARE-tube uprights with a row of punched holes and gusseted feet; the
// tape is short straight bands (red / white / red) clustered near each clamp the way a
// tape that has slid down the pipe does; the flag hangs from a short cord on two ties.
// 2.6 m pole at 1.3 m; ROLL obstacle: userData.obstacle = { kind: 'roll', lanes: 1 }.
// Base y = 0, centred, depth along Z ≤ 0.4 m.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.25 });
  const RUST2 = mk(0x6e4128, 'metal', { roughness: 0.95, metalness: 0.2 });
  const RUST3 = mk(0x4f2d21, 'metal', { roughness: 0.95, metalness: 0.2 });
  const GALV = mk(0x8a8a86, 'metal', { roughness: 0.7, metalness: 0.45 });
  const BLACK = mk(0x110f12, 'metal', { roughness: 0.9 });
  const REDT = mk(0xb8302a, 'fabric', { roughness: 0.8, metalness: 0, side: DS });
  const WHITET = mk(0xcfc2a8, 'fabric', { roughness: 0.8, metalness: 0, side: DS });
  const FLAG = mk(0xeee2c8, 'fabric', { roughness: 0.95, metalness: 0, side: DS });
  const FLAG2 = mk(0x8b6141, 'fabric', { roughness: 0.95, metalness: 0, side: DS });
  const CORD = mk(0x8b6141, 'fabric', { roughness: 0.95 });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const rnd = (i) => Math.abs(Math.sin(i * 12.9898 + 4.1414) * 43758.5453) % 1;

  const PL = 2.6, PR = 0.045, PY = 1.30, UX = 1.10;
  // two pipe sections and the coupler
  add(new THREE.CylinderGeometry(PR, PR, PL / 2 - 0.02, 12, 1, true), RUST2, -PL / 4 - 0.01, PY, 0, 0, 0, Math.PI / 2).material.side = DS;
  add(new THREE.CylinderGeometry(PR, PR, PL / 2 - 0.02, 12, 1, true), RUST3, PL / 4 + 0.01, PY, 0, 0, 0, Math.PI / 2).material.side = DS;
  add(new THREE.CylinderGeometry(PR + 0.012, PR + 0.012, 0.16, 12), GALV, 0.0, PY, 0, 0, 0, Math.PI / 2);
  for (const sx of [-1, 1]) add(new THREE.CylinderGeometry(0.012, 0.012, 0.13, 6), BLACK, sx * 0.05, PY, 0, Math.PI / 2, 0, 0);
  for (const sx of [-1, 1]) add(new THREE.TorusGeometry(PR - 0.006, 0.006, 5, 12), RUST, sx * PL / 2, PY, 0, 0, Math.PI / 2, 0);
  add(new THREE.CylinderGeometry(PR + 0.002, PR + 0.002, 0.25, 12, 1, true, 0.4, 1.2), RUST, -0.75, PY, 0, 0, 0, Math.PI / 2);   // deep rust run (wear)
  // square-tube uprights with punched holes, gusseted feet
  for (const sx of [-1, 1]) {
    const x = sx * UX;
    add(new THREE.BoxGeometry(0.26, 0.02, 0.26), BLACK, x, 0.01, 0);                       // grounding band
    add(new THREE.BoxGeometry(0.22, 0.014, 0.22), RUST, x, 0.027, 0);
    for (const bx of [-1, 1]) for (const bz of [-1, 1]) add(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 6), GALV, x + bx * 0.085, 0.04, bz * 0.085);
    add(new THREE.BoxGeometry(0.06, 1.40, 0.06), sx < 0 ? RUST2 : RUST3, x, 0.734, 0);
    for (const gz of [-1, 1]) add(new THREE.BoxGeometry(0.03, 0.12, 0.06), RUST, x, 0.094, gz * 0.06, gz * 0.5, 0, 0);   // gussets
    for (let i = 0; i < 5; i++) add(new THREE.BoxGeometry(0.02, 0.02, 0.064), BLACK, x, 0.25 + i * 0.2, 0);
    // clamp: a U-bracket over the pole bolted to the upright top
    add(new THREE.BoxGeometry(0.08, 0.02, 0.12), GALV, x, PY + PR + 0.01, 0);
    for (const bz of [-1, 1]) add(new THREE.BoxGeometry(0.08, 0.10, 0.02), GALV, x, PY, bz * 0.06);
    add(new THREE.CylinderGeometry(0.009, 0.009, 0.14, 6), BLACK, x - sx * 0.025, PY - 0.035, 0, Math.PI / 2, 0, 0);
    add(new THREE.BoxGeometry(0.06, 0.03, 0.06), GALV, x, PY + PR + 0.035, 0);
  }
  // tape: bands clustered near each clamp (red/white/red) plus a stray band mid-pole
  const band = (x, mat, tilt) => add(new THREE.CylinderGeometry(PR + 0.006, PR + 0.006, 0.045, 12, 1, true), mat, x, PY, 0, 0, 0, Math.PI / 2 + tilt);
  for (const sx of [-1, 1]) for (let i = 0; i < 5; i++) band(sx * (0.35 + i * 0.06) + (rnd(i) - 0.5) * 0.01, i % 2 ? WHITET : REDT, (rnd(i + sx) - 0.5) * 0.5);
  band(0.22, REDT, 0.3); band(-0.16, WHITET, -0.25);
  // tape tails
  add(new THREE.BoxGeometry(0.03, 0.18, 0.006), REDT, -0.62, PY - 0.11, PR + 0.01, 0.15, 0, 0.35);
  add(new THREE.BoxGeometry(0.03, 0.12, 0.006), WHITET, 0.60, PY - 0.08, -PR - 0.01, -0.1, 0, -0.25);
  // flag on a cord: two ties round the pole, a cord between, the cloth folded over the cord
  for (const tx of [-0.14, 0.14]) add(new THREE.TorusGeometry(PR + 0.004, 0.005, 4, 10), CORD, 0.05 + tx, PY, 0, 0, Math.PI / 2, 0);
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.30, 5), CORD, 0.05, PY - PR - 0.02, 0.0, 0, 0, Math.PI / 2);
  add(new THREE.BoxGeometry(0.28, 0.30, 0.008), FLAG, 0.05, PY - PR - 0.17, 0.006, 0.05, 0, 0);
  add(new THREE.BoxGeometry(0.28, 0.08, 0.009), FLAG2, 0.05, PY - PR - 0.34, 0.006, 0.05, 0, 0);
  for (let s = 0; s < 5; s++) add(new THREE.BoxGeometry(0.04, 0.04 + rnd(s) * 0.05, 0.007), s % 2 ? FLAG2 : FLAG, -0.06 + s * 0.055, PY - PR - 0.40 - rnd(s) * 0.02, 0.006, 0.05, 0, 0);

  g.userData.obstacle = { kind: 'roll', lanes: 1 };
  finish(THREE, g);
  return g;
}
function finish(THREE, g) {
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
}
