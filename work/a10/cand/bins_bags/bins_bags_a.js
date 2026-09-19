// bins_bags — arm A: primitives. Galvanised bin from open cylinders + torus rim, lid ajar on the
// rim, blue plastic bin as boxes, three tied bags as squashed spheres with cone knots, a flattened
// cardboard box leaning on the galvanised bin. Footprint ~1.45 x 0.85 m.
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
  const BLUE = M(0x4a5f85, 'plaster', { roughness: 0.8 });
  const BLUE2 = M(0x5b6f93, 'plaster', { roughness: 0.85 });
  const BLUED = M(0x2f3f5c, 'plaster', { roughness: 0.9 });
  const BAG = M(0x1b191c, 'fabric', { roughness: 0.55 });
  const BAG2 = M(0x55565a, 'fabric', { roughness: 0.5 });
  const BAG3 = M(0x3a3d36, 'fabric', { roughness: 0.6 });
  const CARD = M(0x8b6141, 'timber', { roughness: 0.95 });
  const CARD2 = M(0x6c4028, 'timber', { roughness: 0.95 });

  // galvanised bin, 0.5 dia x 0.75, at (-0.35, -0.12)
  const gx = -0.35, gz = -0.12;
  add(C(0.24, 0.22, 0.68, 16, true), GALV, gx, 0.36, gz);
  add(C(0.22, 0.22, 0.02, 16), GALV2, gx, 0.03, gz);
  add(C(0.225, 0.225, 0.06, 16, true), GROUND, gx, 0.03, gz);
  add(C(0.25, 0.25, 0.03, 16, true), GALV2, gx, 0.28, gz);          // swaged rib
  add(C(0.25, 0.25, 0.03, 16, true), GALV2, gx, 0.50, gz);
  add(new THREE.TorusGeometry(0.245, 0.014, 4, 16), RUST, gx, 0.70, gz, Math.PI / 2, 0, 0);  // rusted rolled rim
  add(B(0.14, 0.10, 0.03), GALV2, gx + 0.08, 0.40, gz + 0.235, 0, 0.2, 0);                   // dent (dark patch)
  add(B(0.05, 0.30, 0.02), RUSTD, gx - 0.235, 0.20, gz, 0, 0, 0);                            // rust run
  // lid ajar: hinged at the back rim, propped 35 degrees
  const lid = new THREE.Group(); lid.position.set(gx, 0.72, gz - 0.22); lid.rotation.x = -0.6; g.add(lid);
  add(C(0.26, 0.26, 0.025, 16), GALV, 0, 0, 0.24, 0, 0, 0, lid);
  add(new THREE.TorusGeometry(0.255, 0.012, 4, 16), RUST, 0, 0.005, 0.24, Math.PI / 2, 0, 0, lid);
  add(B(0.12, 0.03, 0.03), GALV2, 0, 0.03, 0.24, 0, 0, 0, lid);
  // side handles
  for (const s of [-1, 1]) {
    add(B(0.03, 0.02, 0.10), GALV2, gx + s * 0.255, 0.42, gz);
    add(B(0.02, 0.06, 0.02), GALV2, gx + s * 0.245, 0.39, gz - 0.04);
    add(B(0.02, 0.06, 0.02), GALV2, gx + s * 0.245, 0.39, gz + 0.04);
  }

  // blue plastic bin 0.5 x 0.8 x 0.45 at (0.42, -0.1), lid slightly open
  const bx = 0.42, bz = -0.10;
  add(B(0.50, 0.74, 0.45), BLUE, bx, 0.40, bz);
  add(B(0.50, 0.06, 0.45), GROUND, bx, 0.03, bz);
  add(B(0.52, 0.03, 0.47), BLUED, bx, 0.75, bz);                       // rim
  add(B(0.54, 0.07, 0.49), BLUE2, bx, 0.81, bz + 0.02, -0.12, 0, 0);   // lid, propped
  add(B(0.30, 0.03, 0.10), BLUED, bx, 0.855, bz - 0.06, -0.12, 0, 0);  // lid ridge / handle
  add(B(0.06, 0.06, 0.03), BLUED, bx - 0.15, 0.78, bz - 0.24);          // hinges
  add(B(0.06, 0.06, 0.03), BLUED, bx + 0.15, 0.78, bz - 0.24);
  add(B(0.45, 0.10, 0.012), BLUE2, bx, 0.55, bz + 0.226);              // faded panel
  add(B(0.012, 0.20, 0.30), RUST, bx + 0.247, 0.20, bz);               // rust stain at the base
  add(B(0.06, 0.16, 0.012), RUSTD, bx - 0.12, 0.18, bz + 0.226);

  // three tied rubbish bags
  const bag = (x, z, r, mat, ry) => {
    const s = add(new THREE.SphereGeometry(r, 8, 6), mat, x, r * 0.8, z, 0, ry, 0); s.scale.set(1, 0.82, 0.95);
    add(C(0.04, 0.06, 0.06, 6), mat, x, r * 1.6, z);
    add(new THREE.ConeGeometry(0.03, 0.09, 5), mat, x - 0.03, r * 1.6 + 0.04, z, 0, 0, 0.6);
    add(new THREE.ConeGeometry(0.025, 0.08, 5), mat, x + 0.03, r * 1.6 + 0.035, z, 0.3, 0, -0.7);
  };
  bag(-0.50, 0.28, 0.19, BAG, 0.4);
  bag(-0.12, 0.18, 0.20, BAG3, 1.2);
  bag(0.28, 0.30, 0.18, BAG2, 2.2);

  // flattened cardboard box leaning against the galvanised bin
  const cb = new THREE.Group(); cb.position.set(-0.72, 0, 0.02); cb.rotation.set(0.1, 0.25, -0.32); g.add(cb);
  add(B(0.55, 0.72, 0.03), CARD, 0, 0.36, 0, 0, 0, 0, cb);
  add(B(0.55, 0.02, 0.034), CARD2, 0, 0.36, 0, 0, 0, 0, cb);    // fold line
  add(B(0.02, 0.72, 0.034), CARD2, 0.12, 0.36, 0, 0, 0, 0, cb);
  add(B(0.18, 0.12, 0.034), CARD2, -0.15, 0.55, 0, 0, 0, 0.3, cb); // stain
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
