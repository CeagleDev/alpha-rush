// cardboard_boxes — arm C: a different reading. The bottom box is sheared over (Matrix4.makeShear
// on its geometry) as a wet box slumps, the second is squashed on one side by two overlapping
// boxes of different heights, the third has a burst side with a dark hole, and the top box has
// one flap hanging down over the stack. A rope band round the base.
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
  const ROPE = M(0x8a7a5a, 'fabric', { roughness: 0.95 });
  const PAPER = M(0xb59a74, 'fabric', { roughness: 0.95 });
  const sheared = (w, h, d, kx, kz) => { const geo = new THREE.BoxGeometry(w, h, d); geo.translate(0, h / 2, 0); geo.applyMatrix4(new THREE.Matrix4().makeShear(0, 0, kx, 0, kz, 0)); return geo; };
  // bottom: 0.60 x 0.34 x 0.50, leaning 8 cm over to +x
  add(sheared(0.60, 0.34, 0.50, 0.22, 0.05), CARD, 0, 0, 0);
  add(B(0.60, 0.06, 0.50), GROUND, 0, 0.03, 0);
  add(sheared(0.61, 0.10, 0.51, 0.22, 0.05), DAMP, 0, 0.0, 0);
  add(B(0.62, 0.03, 0.52), ROPE, 0.04, 0.20, 0.0);          // rope band
  add(B(0.05, 0.34, 0.52), TAPE, 0.14, 0.17, 0.0, 0, 0, -0.22);
  add(B(0.10, 0.10, 0.10), DAMP, -0.28, 0.02, -0.23, 0, 0.4, 0.3);
  // second: squashed one side, two boxes at different heights side by side
  add(B(0.26, 0.30, 0.42), CARD2, -0.08, 0.49, 0.0, 0, 0.1, 0);
  add(B(0.26, 0.24, 0.42), CARD2, 0.17, 0.46, 0.0, 0, 0.1, 0.05);
  add(B(0.52, 0.05, 0.43), TAPE, 0.04, 0.60, 0.0, 0, 0.1, 0.08);
  add(B(0.52, 0.07, 0.43), DAMP, 0.04, 0.375, 0.0, 0, 0.1, 0);
  // third: burst side with a hole
  add(B(0.42, 0.28, 0.38), CARD3, -0.03, 0.78, 0.03, 0, -0.12, 0);
  add(B(0.14, 0.12, 0.02), INNER, 0.15, 0.80, 0.16, 0, -0.12, 0.2);
  add(B(0.05, 0.28, 0.39), TAPE, -0.10, 0.78, 0.03, 0, -0.12, 0);
  add(B(0.43, 0.06, 0.39), DAMP, -0.03, 0.67, 0.03, 0, -0.12, 0);
  // top: 0.36 x 0.24 x 0.32, open, one flap hanging down the front of the stack
  const b = new THREE.Group(); b.position.set(0.0, 0.92, 0.0); b.rotation.y = 0.15; g.add(b);
  add(B(0.36, 0.02, 0.32), INNER, 0, 0.01, 0, 0, 0, 0, b);
  add(B(0.36, 0.22, 0.012), CARD, 0, 0.12, 0.154, 0, 0, 0, b);
  add(B(0.36, 0.22, 0.012), CARD2, 0, 0.12, -0.154, 0, 0, 0, b);
  add(B(0.012, 0.22, 0.32), CARD3, 0.174, 0.12, 0, 0, 0, 0, b);
  add(B(0.012, 0.22, 0.32), CARD, -0.174, 0.12, 0, 0, 0, 0, b);
  add(B(0.36, 0.012, 0.16), CARD, 0, 0.16, 0.16, Math.PI / 2 + 0.1, 0, 0, b);   // front flap hanging down
  add(B(0.36, 0.012, 0.16), CARD2, 0, 0.26, -0.22, -0.7, 0, 0, b);
  add(B(0.16, 0.012, 0.32), CARD3, 0.25, 0.25, 0, 0, 0, -0.4, b);
  add(B(0.16, 0.012, 0.32), CARD, -0.25, 0.22, 0, 0, 0, 0.6, b);
  add(new THREE.SphereGeometry(0.09, 6, 4), PAPER, 0.03, 0.20, 0.02, 0, 0.4, 0, b);
  add(new THREE.SphereGeometry(0.07, 6, 4), PAPER, -0.08, 0.18, -0.06, 0.3, 0, 0.5, b);
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
