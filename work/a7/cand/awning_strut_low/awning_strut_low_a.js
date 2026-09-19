// awning_strut_low — arm A: primitives. A 2.6 m rusty scaffold pole lying along X at 1.3 m,
// held in two swivel clamps on short uprights that stand on bolted base plates. Red-and-white
// hazard tape is wound round it as alternating partial tori (red, tilted like a spiral wrap)
// and short tilted cylinder bands (white); a small torn cloth flag hangs from the middle.
// ROLL obstacle across one lane: userData.obstacle = { kind: 'roll', lanes: 1 }.
// Base y = 0 at the plates, centred, depth along Z ≤ 0.4 m.
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
  const GALV = mk(0x8a8a86, 'metal', { roughness: 0.7, metalness: 0.45 });
  const BLACK = mk(0x110f12, 'metal', { roughness: 0.9 });
  const REDT = mk(0xb8302a, 'fabric', { roughness: 0.8, metalness: 0, side: DS });
  const WHITET = mk(0xcfc2a8, 'fabric', { roughness: 0.8, metalness: 0, side: DS });
  const FLAG = mk(0xeee2c8, 'fabric', { roughness: 0.95, metalness: 0, side: DS });
  const FLAG2 = mk(0x8b6141, 'fabric', { roughness: 0.95, metalness: 0, side: DS });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const rnd = (i) => Math.abs(Math.sin(i * 12.9898 + 4.1414) * 43758.5453) % 1;

  const PL = 2.6, PR = 0.045, PY = 1.30, UX = 1.10;
  // pole (open ends, so you see the bore) with end rings
  add(new THREE.CylinderGeometry(PR, PR, PL, 12, 1, true), RUST2, 0, PY, 0, 0, 0, Math.PI / 2).material.side = DS;
  for (const sx of [-1, 1]) add(new THREE.TorusGeometry(PR - 0.006, 0.006, 5, 12), RUST, sx * PL / 2, PY, 0, 0, Math.PI / 2, 0);
  // a bare-steel worn patch and a rust streak (wear)
  add(new THREE.CylinderGeometry(PR + 0.002, PR + 0.002, 0.30, 12, 1, true, 0.6, 1.6), GALV, 0.55, PY, 0, 0, 0, Math.PI / 2);
  // uprights: tube on a plate, a clamp collar at the pole, a bolt through, and the top stub
  for (const sx of [-1, 1]) {
    const x = sx * UX;
    add(new THREE.BoxGeometry(0.26, 0.02, 0.26), BLACK, x, 0.01, 0);                       // plate: grounding band
    add(new THREE.BoxGeometry(0.22, 0.014, 0.22), RUST, x, 0.027, 0);
    for (const bx of [-1, 1]) for (const bz of [-1, 1]) add(new THREE.CylinderGeometry(0.012, 0.012, 0.012, 6), GALV, x + bx * 0.085, 0.04, bz * 0.085);
    add(new THREE.CylinderGeometry(0.03, 0.032, 1.40, 10), sx < 0 ? RUST2 : RUST, x, 0.72, 0);
    add(new THREE.CylinderGeometry(0.036, 0.036, 0.06, 10), RUST, x, 0.06, 0);           // foot collar
    // clamp: a collar round the pole and a collar round the upright, a bolt between
    add(new THREE.CylinderGeometry(PR + 0.014, PR + 0.014, 0.07, 12, 1, true), GALV, x, PY, 0, 0, 0, Math.PI / 2).material.side = DS;
    add(new THREE.CylinderGeometry(0.044, 0.044, 0.08, 10), GALV, x, PY - 0.06, 0);
    add(new THREE.BoxGeometry(0.03, 0.06, 0.09), GALV, x + sx * 0.05, PY - 0.03, 0);
    add(new THREE.CylinderGeometry(0.01, 0.01, 0.06, 6), BLACK, x + sx * 0.05, PY - 0.03, 0, Math.PI / 2, 0, 0);
    add(new THREE.CylinderGeometry(0.014, 0.014, 0.012, 6), BLACK, x + sx * 0.05, PY - 0.03, 0.05, Math.PI / 2, 0, 0);
    // drilled holes down the upright (dark studs)
    for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.008, 0.008, 0.066, 6), BLACK, x, 0.30 + i * 0.22, 0, Math.PI / 2, 0, 0);
  }
  // tape wrap: 16 turns, alternating red partial tori and white bands, tilted like a spiral
  for (let i = 0; i < 16; i++) {
    const x = -0.95 + i * 0.125 + (rnd(i) - 0.5) * 0.02;
    if (i % 2 === 0) add(new THREE.TorusGeometry(PR + 0.005, 0.008, 3, 12, Math.PI * 1.5), REDT, x, PY, 0, rnd(i + 3) * 6.28, Math.PI / 2, 0.28);
    else add(new THREE.CylinderGeometry(PR + 0.006, PR + 0.006, 0.05, 12, 1, true), WHITET, x, PY, 0, 0, 0, Math.PI / 2 + 0.25);
  }
  // a loose tail of tape hanging off one end
  add(new THREE.BoxGeometry(0.03, 0.22, 0.006), REDT, -0.98, PY - 0.13, PR + 0.01, 0.2, 0, 0.3);
  // hanging cloth flag: a strip folded over the pole with a stained, torn bottom
  add(new THREE.BoxGeometry(0.30, 0.012, 0.11), FLAG, 0.05, PY + PR + 0.004, 0);
  add(new THREE.BoxGeometry(0.30, 0.36, 0.008), FLAG, 0.05, PY - 0.14, PR + 0.006, 0.05, 0, 0);
  add(new THREE.BoxGeometry(0.30, 0.10, 0.009), FLAG2, 0.05, PY - 0.35, PR + 0.006, 0.05, 0, 0);
  for (let s = 0; s < 6; s++) add(new THREE.BoxGeometry(0.035, 0.04 + rnd(s) * 0.05, 0.007), s % 2 ? FLAG2 : FLAG, -0.08 + s * 0.05, PY - 0.42 - rnd(s) * 0.02, PR + 0.006, 0.05, 0, 0);

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
