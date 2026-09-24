// moss_boulder — a 1 m mossy boulder from the foot of the env_torii board's verges: a sphere with
// its vertices pushed by a low-frequency noise into an irregular lump, flattened and cut level at
// the base so it sits into the ground, a moss cap and two side patches warped by the same noise so
// they lie on the stone, a damp darker band low down, lichen blotches, and a dark disc under the cut
// as the grounding band. Base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, r, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0, ...o }); m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, mat); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };

  const STONE = mk(0x6f6a62, 'stone', 0.55);
  const STONE2 = mk(0x5a5650, 'stone', 0.60, { side: DS });
  const MOSS = mk(0x3d4a22, 'foliage', 0.95, { side: DS });
  const MOSS2 = mk(0x4a5a2a, 'foliage', 0.95, { side: DS });
  const LICHEN = mk(0xa8a08a, 'stone', 0.80, { side: DS });
  const BLACK = mk(0x110f12, 'ground', 0.90);

  const R = 0.50, CUT = -0.28;
  const noise = (x, y, z) => { const th = Math.atan2(z, x), ph = Math.atan2(y, Math.hypot(x, z)); return 1 + 0.10 * Math.sin(3 * th + 2 * ph) + 0.06 * Math.sin(7 * th - 3 * ph + 1) + 0.04 * Math.cos(5 * ph + 2 * th); };
  const warp = (geo, s) => {
    const p = geo.attributes.position;
    for (let i = 0; i < p.count; i++) {
      let x = p.getX(i), y = p.getY(i), z = p.getZ(i);
      const k = noise(x, y, z) * s; x *= k; y *= k * 0.78; z *= k * 0.9;
      if (y < CUT) y = CUT;
      p.setXYZ(i, x, y, z);
    }
    geo.computeVertexNormals(); return geo;
  };
  add(warp(new THREE.SphereGeometry(R, 14, 10), 1.0), STONE, 0, 0, 0);
  add(warp(new THREE.SphereGeometry(R, 14, 4, 0, Math.PI * 2, 0, 0.85), 1.012), MOSS, 0, 0, 0);
  add(warp(new THREE.SphereGeometry(R, 14, 3, 0.9, 1.7, 0.9, 0.9), 1.012), MOSS2, 0, 0, 0);
  add(warp(new THREE.SphereGeometry(R, 14, 3, 3.6, 1.4, 1.1, 0.8), 1.012), MOSS, 0, 0, 0);
  add(warp(new THREE.SphereGeometry(R, 14, 2, 0, Math.PI * 2, 1.9, 0.5), 1.008), STONE2, 0, 0, 0);
  for (const [t0, p0] of [[0.2, 1.2], [2.4, 1.5], [4.6, 1.0], [5.5, 1.7], [3.3, 1.3]]) add(warp(new THREE.SphereGeometry(R, 8, 3, t0, 0.2, p0, 0.16), 1.01), LICHEN, 0, 0, 0);
  add(new THREE.CylinderGeometry(0.44, 0.50, 0.03, 14), BLACK, 0, CUT - 0.01, 0);

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
