// bamboo_clump — a 4 m clump of seven culms from the env_torii board (the bamboo behind the left
// lanterns): each culm a stack of tapering internodes with raised node rings, leaning a little
// outward from a common root, one of them dead and straw-coloured; thin branchlets from the upper
// nodes each carrying a fan of drooping leaves (double-sided planes); a litter disc of fallen
// leaves, two cut stumps and a dead culm lying at the foot. Grounding band on every culm foot.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, r, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0, ...o }); m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0, parent = g) => { const n = new THREE.Mesh(geo, mat); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); parent.add(n); return n; };
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  const CULM = mk(0x8a9a52, 'timber', 0.75);
  const CULM2 = mk(0x9fa860, 'timber', 0.75);
  const CULM3 = mk(0x6f7d3f, 'timber', 0.80);
  const DEAD = mk(0xbf9a5a, 'timber', 0.85);
  const NODE = mk(0x5c6a33, 'timber', 0.80, { side: DS });
  const BLACK = mk(0x110f12, 'timber', 0.90);
  const LEAF = mk(0x3d4a22, 'foliage', 0.95, { side: DS });
  const LEAF2 = mk(0x55683a, 'foliage', 0.95, { side: DS });
  const LITTER = mk(0x8b6141, 'ground', 0.90);
  const TWIG = mk(0x6f7d3f, 'timber', 0.80);
  const leafGeo = new THREE.PlaneGeometry(0.035, 0.24);
  leafGeo.translate(0, -0.12, 0);   // hang from the tip

  const fan = (parent, x, y, z, seed, n = 5) => {
    for (let k = 0; k < n; k++) {
      const lf = add(leafGeo, hash(seed, k) < 0.5 ? LEAF : LEAF2, x, y, z, 0.35 + hash(seed, k + 10) * 0.7, hash(seed, k + 20) * Math.PI * 2, (hash(seed, k + 30) - 0.5) * 0.6, parent);
      void lf;
    }
  };
  const N = 7;
  for (let i = 0; i < N; i++) {
    const a = i * Math.PI * 2 / N + hash(i, 1) * 0.6, rb = 0.12 + hash(i, 2) * 0.16;
    const H = 3.0 + hash(i, 3) * 1.0, lean = 0.04 + hash(i, 4) * 0.08;
    const culm = new THREE.Group(); culm.position.set(Math.cos(a) * rb, 0, Math.sin(a) * rb);
    culm.rotation.set(Math.sin(a) * lean, 0, -Math.cos(a) * lean); g.add(culm);
    const mat = i === 2 ? DEAD : i % 3 === 0 ? CULM : i % 3 === 1 ? CULM2 : CULM3;
    const r0 = 0.045 + hash(i, 5) * 0.02, seg = 0.38 + hash(i, 6) * 0.1;
    add(new THREE.CylinderGeometry(r0 + 0.004, r0 + 0.006, 0.05, 7), BLACK, 0, 0.025, 0, 0, 0, 0, culm);
    let y = 0, k = 0;
    while (y < H - 0.05) {
      const len = Math.min(seg, H - y), t0 = y / H, t1 = (y + len) / H;
      add(new THREE.CylinderGeometry(r0 * (1 - 0.35 * t1), r0 * (1 - 0.35 * t0), len - 0.02, 7), mat, 0, y + len / 2, 0, 0, 0, 0, culm);
      add(new THREE.CylinderGeometry(r0 * (1 - 0.35 * t1) + 0.008, r0 * (1 - 0.35 * t1) + 0.008, 0.035, 7, 1, true), NODE, 0, y + len, 0, 0, 0, 0, culm);
      if (y + len > H * 0.5 && i !== 2) {
        // a branchlet from this node, tilted up 40 deg, leaves fanned from its tip
        const b = hash(i, 40 + k) * Math.PI * 2, phi = Math.PI / 2 - 0.7, bl = 0.35 + hash(i, 50 + k) * 0.2;
        const grp = new THREE.Group(); grp.position.set(0, y + len, 0); grp.rotation.y = -b; culm.add(grp);
        add(new THREE.CylinderGeometry(0.005, 0.008, bl, 5), TWIG, bl / 2 * Math.sin(phi), bl / 2 * Math.cos(phi), 0, 0, 0, -phi, grp);
        fan(grp, bl * Math.sin(phi), bl * Math.cos(phi), 0, i * 7 + k, 6);
      }
      y += len; k++;
    }
    // crown: a tuft of leaves and two short twigs at the top
    if (i !== 2) { fan(culm, 0, H, 0, i * 11, 6); fan(culm, 0.12, H - 0.15, 0.05, i * 13, 4); }
  }
  // the foot: litter, stumps, a dead culm lying down
  add(new THREE.CylinderGeometry(0.55, 0.60, 0.02, 9), LITTER, 0, 0.01, 0);
  for (const [x, z] of [[0.42, 0.2], [-0.35, -0.3]]) { add(new THREE.CylinderGeometry(0.04, 0.045, 0.22, 7), CULM2, x, 0.11, z); add(new THREE.CylinderGeometry(0.03, 0.03, 0.01, 7), BLACK, x, 0.225, z); }
  add(new THREE.CylinderGeometry(0.03, 0.035, 0.9, 6), DEAD, 0.15, 0.05, 0.45, 0, 0.5, Math.PI / 2);

  finish(THREE, g);
  return g;
}
function finish(THREE, g, lights) {
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
  if (lights) g.userData.lights = lights.map((l) => ({ ...l, x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
}
