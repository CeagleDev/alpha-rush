// drink_cases — winner (arm C): a different reading. The bottom case is a real timber crate (three
// slats a side on corner posts, gaps between), the two above are plastic with vertical rib
// slots (rows of short rib boxes between the rails) rather than hand-holes; the stack leans
// a few degrees; bottles are shoulders plus necks so they read from above.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  const GREEN = M(0x2f5a3a, 'plaster', { roughness: 0.8, side: DS });
  const GREEN2 = M(0x24472d, 'plaster', { roughness: 0.85 });
  const RED = M(0x8e3a2e, 'plaster', { roughness: 0.8, side: DS });
  const RED2 = M(0x6e2c22, 'plaster', { roughness: 0.85 });
  const WOOD = M(0xb59a4a, 'timber', { roughness: 0.9 });
  const WOOD2 = M(0x8b6141, 'timber', { roughness: 0.92 });
  const WOOD3 = M(0x6c4028, 'timber', { roughness: 0.92 });
  const INNER = M(0x1a1618, 'plaster', { roughness: 0.95, side: DS });
  const GLASS = M(0xb9c8d0, 'metal', { roughness: 0.25, metalness: 0.1 });
  const CAP = M(0x8a1e1a, 'metal', { roughness: 0.5, metalness: 0.2 });
  const SCUFF = M(0x9a9a92, 'plaster', { roughness: 0.9 });
  const W = 0.50, D = 0.35, H = 0.30;
  // timber crate: floor, four posts, three slats a side with gaps
  let cr = new THREE.Group(); cr.position.set(0, 0, 0); cr.rotation.y = 0.04; g.add(cr);
  add(B(W, 0.025, D), WOOD3, 0, 0.0125, 0, 0, 0, 0, cr);
  add(B(W, 0.06, D), GROUND, 0, 0.03, 0, 0, 0, 0, cr);
  add(B(W - 0.08, H - 0.06, D - 0.08), INNER, 0, H / 2, 0, 0, 0, 0, cr);
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(B(0.04, H, 0.04), WOOD2, sx * (W / 2 - 0.02), H / 2, sz * (D / 2 - 0.02), 0, 0, 0, cr);
  for (let i = 0; i < 3; i++) {
    const y = 0.06 + i * 0.09, m = [WOOD, WOOD2, WOOD][i];
    add(B(W, 0.06, 0.015), m, 0, y, D / 2 - 0.0075, 0, 0, 0, cr);
    add(B(W, 0.06, 0.015), m, 0, y, -D / 2 + 0.0075, 0, 0, 0, cr);
    add(B(0.015, 0.06, D - 0.08), m, W / 2 - 0.0075, y, 0, 0, 0, 0, cr);
    add(B(0.015, 0.06, D - 0.08), m, -W / 2 + 0.0075, y, 0, 0, 0, 0, cr);
  }
  add(B(0.18, 0.05, 0.006), SCUFF, 0.08, 0.15, D / 2 + 0.002, 0, 0, 0, cr);
  // plastic crates with rib slots
  const ribbed = (x, y, z, ry, mat, dark) => {
    const c = new THREE.Group(); c.position.set(x, y, z); c.rotation.y = ry; g.add(c);
    add(B(W, 0.025, D), dark, 0, 0.0125, 0, 0, 0, 0, c);
    add(B(W - 0.02, H - 0.05, D - 0.02), INNER, 0, H / 2 - 0.01, 0, 0, 0, 0, c);
    add(B(W, 0.09, D), mat, 0, 0.055, 0, 0, 0, 0, c);                           // solid lower band
    add(B(W + 0.004, 0.03, D + 0.004), dark, 0, H - 0.015, 0, 0, 0, 0, c);
    add(B(W + 0.004, 0.02, D + 0.004), dark, 0, 0.11, 0, 0, 0, 0, c);
    for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(B(0.035, H, 0.035), dark, sx * (W / 2 - 0.0175), H / 2, sz * (D / 2 - 0.0175), 0, 0, 0, c);
    for (let i = 0; i < 4; i++) { const x = -0.165 + i * 0.11; add(B(0.025, 0.16, 0.015), mat, x, 0.20, D / 2 - 0.0075, 0, 0, 0, c); add(B(0.025, 0.16, 0.015), mat, x, 0.20, -D / 2 + 0.0075, 0, 0, 0, c); }
    for (let i = 0; i < 3; i++) { const z = -0.10 + i * 0.10; add(B(0.015, 0.16, 0.025), mat, W / 2 - 0.0075, 0.20, z, 0, 0, 0, c); add(B(0.015, 0.16, 0.025), mat, -W / 2 + 0.0075, 0.20, z, 0, 0, 0, c); }
    return c;
  };
  cr = ribbed(0.03, 0.30, -0.02, -0.10, RED, RED2);
  add(B(0.18, 0.05, 0.006), INNER, -0.10, 0.05, D / 2 + 0.002, 0, 0, 0, cr);
  cr = ribbed(-0.02, 0.60, 0.02, 0.07, GREEN, GREEN2);
  cr.rotation.z = 0.03;
  add(B(0.22, 0.05, 0.006), SCUFF, -0.06, 0.06, D / 2 + 0.002, 0, 0, 0, cr);
  for (let i = 0; i < 4; i++) for (let j = 0; j < 2; j++) {
    const x = -0.18 + i * 0.12, z = -0.08 + j * 0.16;
    add(C(0.026, 0.026, 0.05, 4, true), GLASS, x, 0.225, z, 0, 0.4, 0, cr);
    add(C(0.012, 0.026, 0.05, 4, true), GLASS, x, 0.275, z, 0, 0.4, 0, cr);
    add(C(0.013, 0.013, 0.01, 4), (i + j) % 3 ? GLASS : CAP, x, 0.305, z, 0, 0.4, 0, cr);
  }
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
