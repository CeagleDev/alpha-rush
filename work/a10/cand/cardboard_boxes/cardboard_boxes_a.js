// cardboard_boxes — arm A: primitives. Four damp boxes stacked and each turned a little, the
// top one open with four flaps and crumpled paper inside, tape strips as thin boxes, crushed
// corners as dark overlapping blocks, a strapping band round the bottom one. 1.15 m tall.
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
  const box = (w, h, d, x, y, z, ry, mat) => { const b = new THREE.Group(); b.position.set(x, y, z); b.rotation.y = ry; g.add(b); add(B(w, h, d), mat, 0, h / 2, 0, 0, 0, 0, b); return b; };
  // bottom box 0.60 x 0.36 x 0.50
  let b = box(0.60, 0.36, 0.50, 0, 0, 0, 0.05, CARD);
  add(B(0.60, 0.06, 0.50), GROUND, 0, 0.03, 0, 0, 0, 0, b);
  add(B(0.61, 0.12, 0.51), DAMP, 0, 0.12, 0, 0, 0, 0, b);           // damp tide line
  add(B(0.05, 0.36, 0.51), TAPE, 0.12, 0.18, 0, 0, 0, 0, b);        // tape round it
  add(B(0.61, 0.36, 0.05), TAPE, 0, 0.18, 0.05, 0, 0, 0, b);
  add(B(0.10, 0.10, 0.10), DAMP, 0.28, 0.02, 0.23, 0, 0.3, 0.2, b);  // crushed corner
  add(B(0.22, 0.14, 0.012), CARD2, -0.15, 0.22, 0.251, 0, 0, 0, b);  // a peeling label, no glyphs
  // second box 0.50 x 0.30 x 0.42
  b = box(0.50, 0.30, 0.42, 0.03, 0.36, -0.02, -0.18, CARD2);
  add(B(0.51, 0.05, 0.43), TAPE2, 0, 0.27, 0, 0, 0, 0, b);
  add(B(0.05, 0.30, 0.43), TAPE, -0.10, 0.15, 0, 0, 0, 0, b);
  add(B(0.51, 0.09, 0.43), DAMP, 0, 0.045, 0, 0, 0, 0, b);
  add(B(0.08, 0.08, 0.08), DAMP, -0.23, 0.26, -0.19, 0.3, 0, 0.3, b);
  // third box 0.42 x 0.28 x 0.38
  b = box(0.42, 0.28, 0.38, -0.02, 0.66, 0.03, 0.12, CARD3);
  add(B(0.05, 0.28, 0.39), TAPE, 0.06, 0.14, 0, 0, 0, 0, b);
  add(B(0.43, 0.06, 0.39), DAMP, 0, 0.03, 0, 0, 0, 0, b);
  add(B(0.16, 0.10, 0.012), CARD2, 0.08, 0.16, 0.191, 0, 0, 0.1, b);
  // top box 0.36 x 0.25 x 0.32, open: four walls, floor, flaps folded out, crumpled paper
  b = box(0.36, 0.02, 0.32, 0.02, 0.94, 0.0, -0.08, INNER);
  add(B(0.36, 0.22, 0.012), CARD, 0, 0.12, 0.154, 0, 0, 0, b);
  add(B(0.36, 0.22, 0.012), CARD2, 0, 0.12, -0.154, 0, 0, 0, b);
  add(B(0.012, 0.22, 0.32), CARD, 0.174, 0.12, 0, 0, 0, 0, b);
  add(B(0.012, 0.22, 0.32), CARD3, -0.174, 0.12, 0, 0, 0, 0, b);
  add(B(0.36, 0.012, 0.16), CARD, 0, 0.26, 0.23, 0.35, 0, 0, b);     // front flap out and down
  add(B(0.36, 0.012, 0.16), CARD2, 0, 0.27, -0.22, -0.9, 0, 0, b);   // back flap up
  add(B(0.16, 0.012, 0.32), CARD3, 0.25, 0.25, 0, 0, 0, -0.5, b);    // side flaps
  add(B(0.16, 0.012, 0.32), CARD, -0.24, 0.28, 0, 0, 0, 1.2, b);
  add(new THREE.SphereGeometry(0.09, 6, 4), PAPER, 0.04, 0.20, 0.02, 0, 0.4, 0, b);
  add(new THREE.SphereGeometry(0.07, 6, 4), PAPER, -0.08, 0.17, -0.06, 0.3, 0, 0.5, b);
  add(new THREE.SphereGeometry(0.06, 6, 4), PAPER, 0.10, 0.16, -0.08, 0, 0, 0.9, b);
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
