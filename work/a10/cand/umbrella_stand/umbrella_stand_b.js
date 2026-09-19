// umbrella_stand — arm B: profiles. The tin skirt is one extruded square ring with thickness (an
// open box wall), each closed umbrella is a lathe with a fluted, stepped profile so the folds
// read, handles are lathe-turned hooks on a torus, frame in round tube.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1, side: DS });
  const RUST2 = M(0x8a5a30, 'metal', { roughness: 0.9, metalness: 0.1, side: DS });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, side: DS });
  const TIN = M(0x5f6a5c, 'metal', { roughness: 0.85, metalness: 0.2, side: DS });
  const TIN2 = M(0x8b6141, 'metal', { roughness: 0.9, side: DS });
  const STEEL = M(0x6c7073, 'metal', { roughness: 0.6, metalness: 0.3 });
  const WOOD = M(0x4f2d21, 'timber', { roughness: 0.85 });
  const RED = M(0x8e2f28, 'fabric', { roughness: 0.8, side: DS });
  const NAVY = M(0x2a3350, 'fabric', { roughness: 0.8, side: DS });
  const MUST = M(0xb08a2e, 'fabric', { roughness: 0.8, side: DS });
  const GREEN = M(0x2f4a35, 'fabric', { roughness: 0.8, side: DS });
  const H = 0.6;
  // skirt: square ring shape, 0.40 outside, 0.37 inside, extruded 0.32 tall
  const ring = new THREE.Shape(); ring.moveTo(-0.2, -0.2); ring.lineTo(0.2, -0.2); ring.lineTo(0.2, 0.2); ring.lineTo(-0.2, 0.2); ring.lineTo(-0.2, -0.2);
  const hole = new THREE.Path(); hole.moveTo(-0.185, -0.185); hole.lineTo(-0.185, 0.185); hole.lineTo(0.185, 0.185); hole.lineTo(0.185, -0.185); hole.lineTo(-0.185, -0.185);
  ring.holes.push(hole);
  add(new THREE.ExtrudeGeometry(ring, { depth: 0.32, bevelEnabled: false }), TIN, 0, 0.04, 0, -Math.PI / 2, 0, 0);
  add(new THREE.ExtrudeGeometry(ring, { depth: 0.06, bevelEnabled: false }), GROUND, 0, 0.0, 0, -Math.PI / 2, 0, 0);
  add(B(0.24, 0.16, 0.012), TIN2, 0.05, 0.22, 0.205);                 // faded patch front
  add(B(0.012, 0.20, 0.30), RUST, -0.205, 0.18, 0.02);                // rusted side
  add(B(0.14, 0.10, 0.012), RUST, -0.10, 0.30, -0.205);
  add(B(0.36, 0.015, 0.36), RUSTD, 0, 0.07, 0);                       // tray floor
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) add(C(0.013, 0.013, H, 6, true), RUST, sx * 0.19, H / 2, sz * 0.19);
  const rail = (y, mat) => {
    add(C(0.012, 0.012, 0.4, 6, true), mat, 0, y, 0.19, 0, 0, Math.PI / 2);
    add(C(0.012, 0.012, 0.4, 6, true), mat, 0, y, -0.19, 0, 0, Math.PI / 2);
    add(C(0.012, 0.012, 0.4, 6, true), mat, 0.19, y, 0, Math.PI / 2, 0, 0);
    add(C(0.012, 0.012, 0.4, 6, true), mat, -0.19, y, 0, Math.PI / 2, 0, 0);
  };
  rail(H, RUST2); rail(0.46, RUST);
  add(C(0.012, 0.012, 0.36, 6, true), RUST, 0, 0.46, 0, Math.PI / 2, 0, 0);   // divider bar in the mid rail
  // umbrella as a fluted lathe: tip, sleeve, folds stepping out, gathered neck, then shaft and hook
  const umb = (x, z, mat, len, lean, ry, broken) => {
    const u = new THREE.Group(); u.position.set(x, 0.08, z); u.rotation.set(lean, ry, lean * 0.7); g.add(u);
    const k = len / 0.6;
    const prof = [[0, 0], [0.007, 0], [0.007, 0.05], [0.02, 0.12], [0.03, 0.22], [0.026, 0.28], [0.04, 0.36], [0.036, 0.42], [0.044, 0.52], [0.03, 0.58], [0.012, 0.60], [0, 0.60]];
    const c = add(L(prof, 8), mat, 0, 0, 0, 0, 0, 0, u); c.scale.set(1, k, 1);
    add(C(0.006, 0.006, 0.12, 5, true), STEEL, 0, len + 0.06, 0, 0, 0, 0, u);
    add(L([[0, 0], [0.012, 0], [0.012, 0.03], [0.009, 0.05], [0, 0.05]], 6), WOOD, 0, len + 0.10, 0, 0, 0, 0, u);
    add(new THREE.TorusGeometry(0.035, 0.009, 4, 8, Math.PI), WOOD, 0.035, len + 0.15, 0, 0, 0, 0, u);
    add(C(0.009, 0.009, 0.05, 5, true), WOOD, 0.07, len + 0.125, 0, 0, 0, 0, u);
    if (broken) { for (let i = 0; i < 4; i++) add(C(0.002, 0.002, 0.28, 3, true), STEEL, 0, len * 0.85, 0, 0.5 + i * 0.3, i * 1.4, 0.7, u);
      add(B(0.05, 0.14, 0.012), mat, 0.03, len * 0.8, 0.02, 0.3, 0.4, 0.9, u); }   // a torn panel of fabric hanging
  };
  umb(-0.10, -0.08, RED, 0.60, 0.12, 0.3, false);
  umb(0.02, -0.11, NAVY, 0.68, -0.06, 1.2, true);
  umb(-0.04, 0.09, MUST, 0.58, 0.10, 2.3, false);
  umb(0.11, 0.06, GREEN, 0.64, -0.14, 0.8, false);
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
