// beer_keg — arm C: a different reading of the reference. The keg as a stack of three slightly
// bellied sections (the belly between the swages), each a tapered open cylinder, with the
// swage lines read as dark grooves rather than proud ribs, chimes as lathe rings with a real
// hand-hole slot, and the tag looped through the hand-hole.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  const STEEL = M(0xa9adaf, 'metal', { roughness: 0.45, metalness: 0.3, side: DS });
  const STEEL2 = M(0x8a8e91, 'metal', { roughness: 0.55, metalness: 0.3, side: DS });
  const STEEL3 = M(0x6c7073, 'metal', { roughness: 0.6, metalness: 0.3, side: DS });
  const RUBBER = M(0x2a2628, 'metal', { roughness: 0.9, side: DS });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1, side: DS });
  const PAPER = M(0xd8c9a8, 'fabric', { roughness: 0.9, side: DS });
  const INK = M(0x37201b, 'fabric', { roughness: 0.9 });
  const S = 14;
  // three bellied sections: 0.07..0.21, 0.22..0.33, 0.34..0.53
  add(C(0.19, 0.20, 0.07, S, true), STEEL, 0, 0.105, 0);
  add(C(0.20, 0.19, 0.07, S, true), STEEL2, 0, 0.175, 0);
  add(C(0.20, 0.20, 0.11, S, true), STEEL, 0, 0.275, 0);
  add(C(0.19, 0.20, 0.10, S, true), STEEL2, 0, 0.39, 0);
  add(C(0.20, 0.19, 0.09, S, true), STEEL, 0, 0.485, 0);
  add(C(0.185, 0.185, 0.012, S, true), STEEL3, 0, 0.215, 0);   // swage grooves
  add(C(0.185, 0.185, 0.012, S, true), STEEL3, 0, 0.335, 0);
  add(C(0.196, 0.196, 0.06, S, true), RUST, 0, 0.30, 0);       // stain ring mid-body
  // chimes
  add(L([[0.13, 0.0], [0.20, 0.0], [0.21, 0.03], [0.20, 0.07], [0.185, 0.07]], S), RUBBER);
  add(L([[0.06, 0.53], [0.18, 0.53], [0.20, 0.55], [0.21, 0.58], [0.20, 0.60], [0.17, 0.60], [0.165, 0.565]], S), RUBBER);
  add(C(0.205, 0.205, 0.06, S, true), GROUND, 0, 0.03, 0);
  for (const a of [0.9, 0.9 + Math.PI]) add(B(0.10, 0.035, 0.05), GROUND, Math.sin(a) * 0.19, 0.575, Math.cos(a) * 0.19, 0, a, 0);
  add(C(0.04, 0.04, 0.015, 8), STEEL3, 0, 0.537, 0);
  add(C(0.024, 0.024, 0.03, 8), STEEL, 0, 0.555, 0);
  add(B(0.036, 0.012, 0.012), STEEL2, 0, 0.575, 0);
  // tag on a loop through the hand hole
  add(new THREE.TorusGeometry(0.03, 0.003, 3, 8), INK, Math.sin(0.9) * 0.215, 0.56, Math.cos(0.9) * 0.215, 0, 0.9, 0);
  add(C(0.003, 0.003, 0.12, 3, true), INK, Math.sin(0.9) * 0.222, 0.47, Math.cos(0.9) * 0.222, 0, 0, 0.1);
  add(B(0.07, 0.11, 0.006), PAPER, Math.sin(0.9) * 0.24, 0.35, Math.cos(0.9) * 0.24, 0, 0.9, 0.1);
  add(B(0.04, 0.03, 0.008), INK, Math.sin(0.9) * 0.241, 0.34, Math.cos(0.9) * 0.241, 0, 0.9, 0.4);
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
