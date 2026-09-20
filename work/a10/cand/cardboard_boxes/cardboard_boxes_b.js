// cardboard_boxes — arm B: profiles. Each box is an ExtrudeGeometry of a slightly sagging
// quadrilateral (bowed sides, a dropped corner), so the damp slump shows in the silhouette;
// flaps are extruded trapezoids; tape strips are boxes; crumpled paper is a cone cluster.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  const CARD = M(0x8b6141, 'timber', { roughness: 0.95 });
  const CARD2 = M(0x7a5538, 'timber', { roughness: 0.95 });
  const CARD3 = M(0x9a7350, 'timber', { roughness: 0.95 });
  const DAMP = M(0x5a3d2a, 'timber', { roughness: 0.98 });
  const INNER = M(0x3d2c1e, 'timber', { roughness: 0.98, side: DS });
  const TAPE = M(0xa89a86, 'metal', { roughness: 0.4, metalness: 0.1 });
  const TAPE2 = M(0x6c6256, 'metal', { roughness: 0.4, metalness: 0.1 });
  const PAPER = M(0xb59a74, 'fabric', { roughness: 0.95 });
  const quad = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath(); return s; };
  // a sagging box: front outline (x, y) extruded back by d, corners pulled in by slump
  const sag = (w, h, d, x, y, z, ry, mat, drop) => {
    const b = new THREE.Group(); b.position.set(x, y, z); b.rotation.y = ry; g.add(b);
    const s = quad([[-w / 2, 0], [w / 2, 0], [w / 2 - 0.01, h - drop], [0, h - drop * 0.4], [-w / 2 + 0.005, h]]);
    add(new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }), mat, 0, 0, -d / 2, 0, 0, 0, b);
    return b;
  };
  let b = sag(0.60, 0.36, 0.50, 0, 0, 0, 0.05, CARD, 0.03);
  add(B(0.61, 0.06, 0.51), GROUND, 0, 0.03, 0, 0, 0, 0, b);
  add(B(0.61, 0.11, 0.51), DAMP, 0, 0.11, 0, 0, 0, 0, b);
  add(B(0.05, 0.34, 0.51), TAPE, 0.12, 0.17, 0, 0, 0, 0, b);
  add(B(0.61, 0.33, 0.05), TAPE2, 0, 0.165, 0.06, 0, 0, 0, b);
  add(B(0.22, 0.14, 0.012), CARD2, -0.15, 0.22, 0.251, 0, 0, 0, b);
  b = sag(0.50, 0.30, 0.42, 0.03, 0.34, -0.02, -0.18, CARD2, 0.025);
  add(B(0.51, 0.05, 0.43), TAPE, 0, 0.26, 0, 0, 0, 0, b);
  add(B(0.05, 0.28, 0.43), TAPE2, -0.10, 0.14, 0, 0, 0, 0, b);
  add(B(0.51, 0.08, 0.43), DAMP, 0, 0.04, 0, 0, 0, 0, b);
  b = sag(0.42, 0.28, 0.38, -0.02, 0.56, 0.03, 0.12, CARD3, 0.02);
  add(B(0.05, 0.26, 0.39), TAPE, 0.06, 0.13, 0, 0, 0, 0, b);
  add(B(0.43, 0.06, 0.39), DAMP, 0, 0.03, 0, 0, 0, 0, b);
  add(B(0.16, 0.10, 0.012), CARD2, 0.08, 0.16, 0.191, 0, 0, 0.1, b);
  // open top box: walls as extruded trapezoids, flaps as extruded trapezoids folded out
  b = new THREE.Group(); b.position.set(0.02, 0.79, 0.0); b.rotation.y = -0.08; g.add(b);
  add(B(0.36, 0.02, 0.32), INNER, 0, 0.01, 0, 0, 0, 0, b);
  const wall = quad([[-0.18, 0], [0.18, 0], [0.17, 0.22], [-0.175, 0.21]]);
  add(new THREE.ExtrudeGeometry(wall, { depth: 0.012, bevelEnabled: false }), CARD, 0, 0.01, 0.148, 0, 0, 0, b);
  add(new THREE.ExtrudeGeometry(wall, { depth: 0.012, bevelEnabled: false }), CARD2, 0, 0.01, -0.16, 0, 0, 0, b);
  const wall2 = quad([[-0.16, 0], [0.16, 0], [0.155, 0.21], [-0.15, 0.22]]);
  add(new THREE.ExtrudeGeometry(wall2, { depth: 0.012, bevelEnabled: false }), CARD3, 0.174, 0.01, 0, 0, Math.PI / 2, 0, b);
  add(new THREE.ExtrudeGeometry(wall2, { depth: 0.012, bevelEnabled: false }), CARD, -0.162, 0.01, 0, 0, Math.PI / 2, 0, b);
  const flap = quad([[-0.18, 0], [0.18, 0], [0.16, 0.15], [-0.17, 0.16]]);
  add(new THREE.ExtrudeGeometry(flap, { depth: 0.012, bevelEnabled: false }), CARD, 0, 0.23, 0.16, Math.PI / 2 + 0.4, 0, 0, b);
  add(new THREE.ExtrudeGeometry(flap, { depth: 0.012, bevelEnabled: false }), CARD2, 0, 0.23, -0.16, -0.12, 0, 0, b);
  const flap2 = quad([[-0.16, 0], [0.16, 0], [0.15, 0.14], [-0.15, 0.15]]);
  add(new THREE.ExtrudeGeometry(flap2, { depth: 0.012, bevelEnabled: false }), CARD3, 0.17, 0.23, 0, 0, Math.PI / 2, -Math.PI / 2 - 0.5, b);
  add(new THREE.ExtrudeGeometry(flap2, { depth: 0.012, bevelEnabled: false }), CARD, -0.17, 0.23, 0, 0, Math.PI / 2, Math.PI / 2 - 0.9, b);
  for (let i = 0; i < 5; i++) add(new THREE.ConeGeometry(0.05, 0.10, 4), PAPER, -0.10 + i * 0.05, 0.16, ((i * 5) % 3) * 0.06 - 0.06, 0.4 * (i - 2), i, 0.3, b);
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
