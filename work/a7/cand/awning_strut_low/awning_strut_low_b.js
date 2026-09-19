// awning_strut_low — arm B: profiles. The pole is a LatheGeometry (rolled lips at each end
// and a swaged joint in the middle); the hazard tape is two TubeGeometry helices (red, and a
// white one a half-turn behind) so it really spirals round the pipe; the flag is an extruded
// Shape with a torn edge; uprights are lathe tubes with a flared foot on extruded plates.
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
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.25, side: DS });
  const RUST2 = mk(0x6e4128, 'metal', { roughness: 0.95, metalness: 0.2, side: DS });
  const GALV = mk(0x8a8a86, 'metal', { roughness: 0.7, metalness: 0.45 });
  const BLACK = mk(0x110f12, 'metal', { roughness: 0.9 });
  const REDT = mk(0xb8302a, 'fabric', { roughness: 0.8, metalness: 0 });
  const WHITET = mk(0xcfc2a8, 'fabric', { roughness: 0.8, metalness: 0 });
  const FLAG = mk(0xeee2c8, 'fabric', { roughness: 0.95, metalness: 0, side: DS });
  const FLAG2 = mk(0x8b6141, 'fabric', { roughness: 0.95, metalness: 0, side: DS });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const rnd = (i) => Math.abs(Math.sin(i * 12.9898 + 4.1414) * 43758.5453) % 1;

  const PL = 2.6, PR = 0.045, PY = 1.30, UX = 1.10;
  // pole profile (along its own Y, then laid along X): lip, body, swage, body, lip
  const pp = [[0.036, 0], [0.050, 0], [0.050, 0.03], [PR, 0.04], [PR, 1.22], [0.052, 1.24], [0.052, 1.36], [PR, 1.38], [PR, PL - 0.04], [0.050, PL - 0.03], [0.050, PL], [0.036, PL]]
    .map(([r, y]) => new THREE.Vector2(r, y - PL / 2));
  add(new THREE.LatheGeometry(pp, 12), RUST2, 0, PY, 0, 0, 0, -Math.PI / 2);
  add(new THREE.CylinderGeometry(PR + 0.002, PR + 0.002, 0.40, 12, 1, true, 3.6, 1.4), GALV, -0.55, PY, 0, 0, 0, Math.PI / 2);   // bare steel patch (wear)
  // tape helices: 7 turns over 1.7 m, white trails red by half a turn
  const helix = (phase) => {
    const pts = [];
    for (let i = 0; i <= 56; i++) { const t = i / 56, a = t * Math.PI * 2 * 7 + phase; pts.push(new THREE.Vector3(-0.85 + t * 1.7, PY + (PR + 0.006) * Math.cos(a), (PR + 0.006) * Math.sin(a))); }
    return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 84, 0.011, 4, false);
  };
  add(helix(0), REDT, 0, 0, 0);
  add(helix(Math.PI), WHITET, 0, 0, 0);
  // uprights: lathe tube with a flared foot, clamp collars, bolt, base plate (extruded square with a notch)
  const up = [[0.048, 0], [0.048, 0.05], [0.032, 0.09], [0.030, 1.42], [0.024, 1.42], [0.024, 0.09], [0.040, 0.05], [0.040, 0]].map(([r, y]) => new THREE.Vector2(r, y));
  const plate = new THREE.Shape();
  plate.moveTo(-0.13, -0.13); plate.lineTo(0.13, -0.13); plate.lineTo(0.13, 0.09); plate.lineTo(0.09, 0.13); plate.lineTo(-0.13, 0.13); plate.lineTo(-0.13, -0.13);
  for (const sx of [-1, 1]) {
    const x = sx * UX;
    const pg = new THREE.ExtrudeGeometry(plate, { depth: 0.03, bevelEnabled: false });
    add(pg, BLACK, x, 0, 0, -Math.PI / 2, 0, 0);                                            // grounding band
    add(new THREE.BoxGeometry(0.22, 0.012, 0.22), RUST, x, 0.036, 0);
    for (const bx of [-1, 1]) for (const bz of [-1, 1]) add(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 6), GALV, x + bx * 0.085, 0.048, bz * 0.085);
    add(new THREE.LatheGeometry(up, 10), sx < 0 ? RUST : RUST2, x, 0.03, 0);
    add(new THREE.CylinderGeometry(PR + 0.014, PR + 0.014, 0.07, 12, 1, true), GALV, x, PY, 0, 0, 0, Math.PI / 2).material.side = DS;
    add(new THREE.CylinderGeometry(0.044, 0.044, 0.08, 10), GALV, x, PY - 0.06, 0);
    add(new THREE.BoxGeometry(0.03, 0.06, 0.09), GALV, x + sx * 0.05, PY - 0.03, 0);
    add(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 6), BLACK, x + sx * 0.05, PY - 0.03, 0.05, Math.PI / 2, 0, 0);
    for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.008, 0.008, 0.066, 6), BLACK, x, 0.30 + i * 0.22, 0, Math.PI / 2, 0, 0);
  }
  // flag: an extruded shape folded over the pole, torn along the bottom
  const fs = new THREE.Shape();
  fs.moveTo(-0.15, 0); fs.lineTo(0.15, 0); fs.lineTo(0.15, -0.30);
  for (let k = 0; k <= 8; k++) fs.lineTo(0.15 - (k / 8) * 0.30, -0.30 - (k % 2 ? 0.02 + rnd(k) * 0.07 : rnd(k + 5) * 0.02));
  fs.lineTo(-0.15, 0);
  const fg = new THREE.ExtrudeGeometry(fs, { depth: 0.008, bevelEnabled: false });
  add(fg, FLAG, 0.05, PY - PR - 0.05, PR + 0.004, 0.06, 0, 0);
  add(new THREE.BoxGeometry(0.30, 0.012, 0.11), FLAG, 0.05, PY + PR + 0.004, 0);
  add(new THREE.BoxGeometry(0.30, 0.09, 0.006), FLAG, 0.05, PY - 0.05, -PR - 0.004);
  add(new THREE.PlaneGeometry(0.28, 0.10), FLAG2, 0.05, PY - PR - 0.30, PR + 0.014, 0.06, 0, 0);            // mud band (wear)

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
