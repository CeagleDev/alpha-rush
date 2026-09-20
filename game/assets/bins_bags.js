// bins_bags — winner (arm C): a different breakdown. The galvanised bin is three drum sections with the
// middle one knocked off-centre (a real dent in the silhouette) and fat rolled beads; the lid is
// propped wide open on its hinge; the blue bin is a tapered four-sided cylinder (wider at the
// top like a real moulded bin) with a rim; bags are capsules slumped at angles.
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
  const GALV3 = M(0x7a7e80, 'metal', { roughness: 0.65, metalness: 0.3, side: DS });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.1, side: DS });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, side: DS });
  const BLUE = M(0x4a5f85, 'plaster', { roughness: 0.8 });
  const BLUE2 = M(0x5b6f93, 'plaster', { roughness: 0.85 });
  const BLUED = M(0x2f3f5c, 'plaster', { roughness: 0.9 });
  const BAG = M(0x1b191c, 'fabric', { roughness: 0.55 });
  const BAG2 = M(0x55565a, 'fabric', { roughness: 0.5 });
  const BAG3 = M(0x3a3d36, 'fabric', { roughness: 0.6 });
  const CARD = M(0x8b6141, 'timber', { roughness: 0.95 });
  const CARD2 = M(0x6c4028, 'timber', { roughness: 0.95 });

  const gx = -0.35, gz = -0.12;
  add(C(0.235, 0.225, 0.22, 14, true), GALV, gx, 0.13, gz);              // lower drum
  add(C(0.228, 0.232, 0.22, 14, true), GALV3, gx + 0.018, 0.36, gz - 0.012); // dented middle, off-centre
  add(C(0.242, 0.236, 0.22, 14, true), GALV, gx, 0.59, gz);              // upper drum
  add(C(0.225, 0.225, 0.02, 14), GALV2, gx, 0.03, gz);
  add(C(0.228, 0.228, 0.06, 14, true), GROUND, gx, 0.03, gz);
  add(C(0.255, 0.255, 0.04, 14, true), RUST, gx, 0.24, gz);               // fat beads, rusted
  add(C(0.255, 0.255, 0.04, 14, true), GALV2, gx, 0.47, gz);
  add(new THREE.TorusGeometry(0.245, 0.016, 4, 14), RUST, gx, 0.70, gz, Math.PI / 2, 0, 0);
  add(B(0.04, 0.40, 0.02), RUSTD, gx + 0.2, 0.30, gz + 0.14, 0, -0.6, 0);
  // lid thrown open on a back hinge, standing almost vertical
  const hinge = add(B(0.08, 0.03, 0.04), RUSTD, gx, 0.71, gz - 0.25);
  const lid = new THREE.Group(); lid.position.set(gx, 0.72, gz - 0.25); lid.rotation.x = -1.25; g.add(lid);
  add(C(0.26, 0.26, 0.025, 14), GALV2, 0, 0, 0.26, 0, 0, 0, lid);
  add(C(0.24, 0.24, 0.02, 14, true), GALV3, 0, -0.02, 0.26, 0, 0, 0, lid);   // lid skirt
  add(B(0.12, 0.04, 0.03), RUST, 0, 0.03, 0.26, 0, 0, 0, lid);
  for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.045, 0.01, 4, 8, Math.PI), GALV2, gx + s * 0.245, 0.40, gz, 0, s * Math.PI / 2, 0);

  // blue bin: a tapered square bin (4-segment cylinder turned 45deg), 0.45 at the base, 0.5 at the rim
  const bx = 0.42, bz = -0.10;
  add(C(0.355, 0.32, 0.76, 4), BLUE, bx, 0.40, bz, 0, Math.PI / 4, 0);
  add(C(0.322, 0.32, 0.06, 4, true), GROUND, bx, 0.03, bz, 0, Math.PI / 4, 0);
  add(C(0.37, 0.36, 0.04, 4, true), BLUED, bx, 0.76, bz, 0, Math.PI / 4, 0);   // rim
  add(C(0.385, 0.35, 0.07, 4), BLUE2, bx, 0.82, bz + 0.02, -0.1, Math.PI / 4, 0); // lid, cocked
  add(B(0.32, 0.035, 0.08), BLUED, bx, 0.87, bz - 0.04, -0.1, 0, 0);
  add(B(0.36, 0.14, 0.012), BLUE2, bx, 0.45, bz + 0.238);   // sun-faded panel
  add(B(0.012, 0.16, 0.34), RUSTD, bx - 0.245, 0.20, bz);
  add(B(0.10, 0.10, 0.012), RUST, bx + 0.12, 0.62, bz + 0.238);

  // bags: capsules slumped over, each tied with a neck and two ears
  const bag = (x, z, r, len, mat, rz, ry) => {
    const cap = add(new THREE.CapsuleGeometry(r, len, 3, 8), mat, x, r * 0.95, z, 0, ry, rz);
    add(C(0.035, 0.05, 0.06, 6), mat, x, r * 1.75, z);
    add(new THREE.ConeGeometry(0.03, 0.09, 5), mat, x - 0.035, r * 1.75 + 0.04, z, 0.2, 0, 0.7);
    add(new THREE.ConeGeometry(0.025, 0.08, 5), mat, x + 0.035, r * 1.75 + 0.03, z, -0.3, 0, -0.9);
  };
  bag(-0.50, 0.28, 0.17, 0.12, BAG, 1.35, 0.4);
  bag(-0.12, 0.18, 0.19, 0.06, BAG3, 0.25, 1.1);
  bag(0.28, 0.30, 0.16, 0.14, BAG2, 1.2, 2.3);

  // flattened box: two folded layers leaning against the blue bin's side
  const cb = new THREE.Group(); cb.position.set(0.62, 0, 0.12); cb.rotation.set(0.05, -0.3, 0.30); g.add(cb);
  add(B(0.50, 0.66, 0.03), CARD, 0, 0.33, 0, 0, 0, 0, cb);
  add(B(0.50, 0.30, 0.03), CARD2, 0, 0.51, 0.03, 0.0, 0, 0, cb);   // folded-over flap
  add(B(0.50, 0.02, 0.035), RUSTD, 0, 0.36, 0.03, 0, 0, 0, cb);
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
