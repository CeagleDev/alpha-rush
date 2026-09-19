// bins_bags — arm B: profiles. Galvanised bin and its lid are LatheGeometry with swaged ribs
// and a rolled rim; the blue bin is an extruded rounded-rectangle shell; each rubbish bag is one
// lathe of a tied sack (bulge, neck, knot); the cardboard is an extruded torn outline.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o) => { const m = new THREE.MeshStandardMaterial(Object.assign({ color, roughness: 0.85, metalness: 0 }, o || {})); m.name = name; return m; };
  const add = (geo, m, x, y, z, rx, ry, rz, parent) => { const o = new THREE.Mesh(geo, m); o.position.set(x || 0, y || 0, z || 0); if (rx || ry || rz) o.rotation.set(rx || 0, ry || 0, rz || 0); (parent || g).add(o); return o; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (r1, r2, h, s, open) => new THREE.CylinderGeometry(r1, r2, h, s, 1, !!open);
  const L = (pts, s) => new THREE.LatheGeometry(pts.map(([x, y]) => new THREE.Vector2(x, y)), s);
  const GROUND = M(0x110f12, 'metal', { roughness: 0.95, side: DS });
  const GALV = M(0x8d9093, 'metal', { roughness: 0.6, metalness: 0.3, side: DS });
  const GALV2 = M(0x6b6e6f, 'metal', { roughness: 0.7, metalness: 0.3, side: DS });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1, side: DS });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, side: DS });
  const BLUE = M(0x4a5f85, 'plaster', { roughness: 0.8, side: DS });
  const BLUE2 = M(0x5b6f93, 'plaster', { roughness: 0.85, side: DS });
  const BLUED = M(0x2f3f5c, 'plaster', { roughness: 0.9 });
  const BAG = M(0x1b191c, 'fabric', { roughness: 0.55 });
  const BAG2 = M(0x55565a, 'fabric', { roughness: 0.5 });
  const BAG3 = M(0x3a3d36, 'fabric', { roughness: 0.6 });
  const CARD = M(0x8b6141, 'timber', { roughness: 0.95 });
  const CARD2 = M(0x6c4028, 'timber', { roughness: 0.95 });

  // galvanised bin: one swept skin, base to rolled rim
  const gx = -0.35, gz = -0.12;
  add(L([[0, 0.02], [0.20, 0.02], [0.22, 0.0], [0.225, 0.06], [0.23, 0.24], [0.248, 0.26], [0.23, 0.28],
         [0.236, 0.46], [0.252, 0.48], [0.236, 0.50], [0.242, 0.68], [0.262, 0.70], [0.262, 0.73], [0.24, 0.73], [0.236, 0.70]], 14), GALV, gx, 0, gz);
  add(C(0.226, 0.226, 0.06, 14, true), GROUND, gx, 0.03, gz);
  add(C(0.239, 0.239, 0.10, 14, true), RUST, gx, 0.60, gz);         // rust band under the rim
  add(B(0.16, 0.12, 0.03), GALV2, gx - 0.06, 0.36, gz + 0.225, 0, -0.3, 0); // dent
  const lid = new THREE.Group(); lid.position.set(gx, 0.74, gz - 0.24); lid.rotation.x = -0.55; g.add(lid);
  add(L([[0, 0.035], [0.14, 0.035], [0.24, 0.02], [0.27, 0.0], [0.27, -0.02], [0.25, -0.02], [0.25, 0.0]], 14), RUST, 0, 0, 0.25, 0, 0, 0, lid);
  add(L([[0, 0.02], [0.05, 0.02], [0.05, 0.06], [0.0, 0.06]], 8), GALV2, 0, 0.03, 0.25, 0, 0, 0, lid);  // knob
  for (const s of [-1, 1]) add(B(0.03, 0.08, 0.10), GALV2, gx + s * 0.245, 0.42, gz);

  // blue bin: extruded rounded rectangle, open top, with a lid shell on top
  const rr = (w, d, r) => { const s = new THREE.Shape(); const x = w / 2, z = d / 2;
    s.moveTo(-x + r, -z); s.lineTo(x - r, -z); s.quadraticCurveTo(x, -z, x, -z + r); s.lineTo(x, z - r);
    s.quadraticCurveTo(x, z, x - r, z); s.lineTo(-x + r, z); s.quadraticCurveTo(-x, z, -x, z - r);
    s.lineTo(-x, -z + r); s.quadraticCurveTo(-x, -z, -x + r, -z); return s; };
  const bx = 0.42, bz = -0.10;
  const shell = new THREE.ExtrudeGeometry(rr(0.50, 0.45, 0.05), { depth: 0.76, bevelEnabled: false, curveSegments: 2 });
  add(shell, BLUE, bx, 0.0, bz, -Math.PI / 2, 0, 0);
  add(B(0.44, 0.76, 0.39), BLUED, bx, 0.38, bz);                                              // dark interior fill
  add(new THREE.ExtrudeGeometry(rr(0.50, 0.45, 0.05), { depth: 0.06, bevelEnabled: false, curveSegments: 2 }), GROUND, bx, 0.0, bz, -Math.PI / 2, 0, 0);
  add(new THREE.ExtrudeGeometry(rr(0.54, 0.49, 0.06), { depth: 0.07, bevelEnabled: false, curveSegments: 2 }), BLUE2, bx, 0.79, bz + 0.03, -Math.PI / 2 - 0.1, 0, 0);
  add(B(0.28, 0.03, 0.08), BLUED, bx, 0.85, bz - 0.05, -0.1, 0, 0);
  add(B(0.45, 0.12, 0.012), BLUE2, bx, 0.50, bz + 0.226);
  add(B(0.012, 0.22, 0.28), RUST, bx - 0.247, 0.20, bz);
  add(B(0.10, 0.26, 0.012), RUSTD, bx + 0.10, 0.20, bz + 0.226);

  // bags: one lathe each, a tied sack
  const sack = (x, z, r, mat, ry) => {
    const k = r / 0.2;
    const m = add(L([[0, 0], [0.12, 0], [0.19, 0.06], [0.205, 0.17], [0.17, 0.28], [0.09, 0.34], [0.045, 0.37], [0.055, 0.41], [0.02, 0.44], [0, 0.44]], 10), mat, x, 0, z, 0, ry, 0);
    m.scale.set(k, k * 0.9, k * 0.95);
    add(new THREE.ConeGeometry(0.03 * k, 0.09 * k, 5), mat, x - 0.04 * k, 0.40 * k, z, 0.2, 0, 0.7);
    add(new THREE.ConeGeometry(0.025 * k, 0.08 * k, 5), mat, x + 0.04 * k, 0.39 * k, z, -0.2, 0, -0.8);
  };
  sack(-0.50, 0.28, 0.19, BAG, 0.3);
  sack(-0.12, 0.18, 0.21, BAG3, 1.4);
  sack(0.28, 0.30, 0.18, BAG2, 2.4);

  // flattened cardboard, one corner torn off, leaning on the bin
  const cs = new THREE.Shape(); cs.moveTo(-0.27, 0); cs.lineTo(0.27, 0); cs.lineTo(0.27, 0.58); cs.lineTo(0.12, 0.72); cs.lineTo(-0.27, 0.70); cs.lineTo(-0.27, 0);
  const cb = new THREE.Group(); cb.position.set(-0.72, 0, 0.02); cb.rotation.set(0.1, 0.25, -0.32); g.add(cb);
  add(new THREE.ExtrudeGeometry(cs, { depth: 0.03, bevelEnabled: false }), CARD, 0, 0, -0.015, 0, 0, 0, cb);
  add(B(0.54, 0.02, 0.034), CARD2, 0, 0.35, 0, 0, 0, 0, cb);
  add(B(0.16, 0.10, 0.034), CARD2, 0.08, 0.20, 0, 0, 0, 0.2, cb);
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
