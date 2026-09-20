// laundry_line — arm B: profiles. Each garment is an ExtrudeGeometry of its outline (t-shirt,
// shirt, trousers, towel with a sagging curved hem, hooded jacket), hung on wire hangers from a
// bamboo pole (a lathe with node bulges) on two hooks with timber plates.
// Base y=0 is the lowest hem; THE GAME MOUNTS THIS AT 2.2 m so the pole lands ~3.25 m. mounts = 'back'.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  g.userData.mounts = 'back';
  const BAMBOO = M(0xb99a5e, 'timber', { roughness: 0.7 });
  const WOOD = M(0x4f2d21, 'timber', { roughness: 0.9 });
  const TIN = M(0x5f6a5c, 'metal', { roughness: 0.85, metalness: 0.2 });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1 });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95 });
  const WIRE = M(0x9aa0a3, 'metal', { roughness: 0.5, metalness: 0.4 });
  const CREAM = M(0xd9c9a8, 'fabric', { roughness: 0.9 });
  const CREAM2 = M(0xbfae8e, 'fabric', { roughness: 0.9 });
  const DENIM = M(0x6e86a3, 'fabric', { roughness: 0.9 });
  const DARK = M(0x2a2a2e, 'fabric', { roughness: 0.9 });
  const TOWEL = M(0x5c6b47, 'fabric', { roughness: 0.95 });
  const TOWEL2 = M(0x4d5a3b, 'fabric', { roughness: 0.95 });
  const JACK = M(0x7a6558, 'fabric', { roughness: 0.9 });
  const JACK2 = M(0x8d7a6b, 'fabric', { roughness: 0.9 });
  const PY = 1.05;
  // bamboo pole as a lathe along Y, tipped to X: bulges at each node
  const pp = [[0.02, 0]];
  for (let i = 0; i < 6; i++) { const x = 0.1 + i * 0.5; pp.push([0.02, x - 0.02], [0.024, x], [0.02, x + 0.02]); }
  pp.push([0.02, 3.0]);
  add(L(pp, 8), BAMBOO, -1.5, PY, 0, 0, 0, -Math.PI / 2);
  add(C(0.02, 0.02, 0.01, 8), WOOD, -1.5, PY, 0, 0, 0, Math.PI / 2);
  add(C(0.02, 0.02, 0.01, 8), WOOD, 1.5, PY, 0, 0, 0, Math.PI / 2);
  for (const x of [-1.0, 1.0]) {
    add(B(0.22, 0.40, 0.03), WOOD, x, PY, -0.085);
    add(B(0.10, 0.14, 0.012), TIN, x + 0.04, PY + 0.10, -0.064);
    add(B(0.06, 0.09, 0.012), RUST, x - 0.05, PY - 0.10, -0.064);
    add(new THREE.TorusGeometry(0.04, 0.008, 3, 6, Math.PI), RUSTD, x, PY - 0.02, -0.03, 0, Math.PI / 2, 0);
    add(B(0.03, 0.03, 0.06), RUSTD, x, PY - 0.06, -0.05);
  }
  const shape = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath(); return s; };
  const ex = (sh, d, mat, x, y, z, rx, ry, rz) => add(new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false, curveSegments: 4 }), mat, x, y, z - d / 2, rx, ry, rz);
  const hanger = (x, ry) => {
    const h = new THREE.Group(); h.position.set(x, PY, 0); h.rotation.y = ry; g.add(h);
    add(new THREE.TorusGeometry(0.03, 0.004, 3, 5, Math.PI), WIRE, 0, 0.03, 0, 0, 0, 0, h);
    add(C(0.004, 0.004, 0.10, 3, true), WIRE, 0, -0.05, 0, 0, 0, 0, h);
    add(B(0.40, 0.006, 0.006), WIRE, 0, -0.10, 0, 0, 0, 0, h);
    add(B(0.22, 0.006, 0.006), WIRE, -0.1, -0.05, 0, 0, 0, Math.PI / 4, h);
    add(B(0.22, 0.006, 0.006), WIRE, 0.1, -0.05, 0, 0, 0, -Math.PI / 4, h);
    return h;
  };
  // t-shirt outline (y down from the hanger bar at -0.10)
  const tee = shape([[-0.08, -0.12], [0.08, -0.12], [0.20, -0.16], [0.30, -0.32], [0.22, -0.38], [0.17, -0.31], [0.19, -0.74], [-0.19, -0.74], [-0.17, -0.31], [-0.22, -0.38], [-0.30, -0.32], [-0.20, -0.16]]);
  let h = hanger(-1.05, 0.12);
  ex(tee, 0.04, CREAM, -1.05, PY, 0, 0.05, 0.12, 0.02);
  add(B(0.10, 0.12, 0.046), CREAM2, -1.05 + 0.06, PY - 0.55, 0.0, 0, 0.12, 0.2);
  h = hanger(-0.55, -0.15);
  ex(tee, 0.04, DENIM, -0.55, PY, 0, -0.04, -0.15, 0).scale.set(0.95, 0.9, 1);
  // trousers
  const trs = shape([[-0.15, -0.12], [0.15, -0.12], [0.16, -0.30], [0.14, -1.02], [0.02, -1.02], [0.0, -0.45], [-0.02, -1.00], [-0.14, -1.00], [-0.16, -0.30]]);
  h = hanger(-0.10, 0.08);
  ex(trs, 0.05, DARK, -0.10, PY, 0, 0.03, 0.08, 0.02);
  // towel folded over the pole with a sagging hem: front and back drops
  const tw = new THREE.Shape(); tw.moveTo(-0.18, 0); tw.lineTo(0.18, 0); tw.lineTo(0.18, -0.66); tw.quadraticCurveTo(0, -0.74, -0.18, -0.66); tw.closePath();
  const tb = new THREE.Shape(); tb.moveTo(-0.18, 0); tb.lineTo(0.18, 0); tb.lineTo(0.18, -0.46); tb.quadraticCurveTo(0, -0.52, -0.18, -0.46); tb.closePath();
  ex(tw, 0.03, TOWEL, 0.42, PY + 0.02, 0.04, 0.06, 0.05, 0);
  ex(tb, 0.03, TOWEL2, 0.42, PY + 0.02, -0.04, -0.06, 0.05, 0);
  add(B(0.36, 0.05, 0.11), TOWEL, 0.42, PY + 0.03, 0, 0, 0.05, 0);
  // small hooded jacket
  const jk = shape([[-0.06, -0.02], [0.06, -0.02], [0.10, -0.10], [0.17, -0.12], [0.24, -0.40], [0.17, -0.42], [0.15, -0.30], [0.16, -0.58], [-0.16, -0.58], [-0.15, -0.30], [-0.17, -0.42], [-0.24, -0.40], [-0.17, -0.12], [-0.10, -0.10]]);
  h = hanger(1.05, -0.2);
  ex(jk, 0.09, JACK, 1.05, PY, 0, 0.03, -0.2, 0);
  add(new THREE.SphereGeometry(0.10, 6, 4), JACK2, 1.05, PY - 0.06, -0.04);
  add(B(0.03, 0.40, 0.095), RUSTD, 1.05, PY - 0.36, 0.0, 0, -0.2, 0);
  add(B(0.28, 0.05, 0.095), JACK2, 1.05, PY - 0.56, 0.0, 0, -0.2, 0);
  // --- the six lines: measure vertices, base to y=0, centre x/z ---------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), mm = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(mm.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
