/**
 * cooler_bin — arm C: a different breakdown. The cooler is read as a thick-walled foam tub with
 * the lid sitting slightly ajar (lifted at one corner, so the crack and the open seam read from
 * every side), a taped-over split on the end, raised moulded handle blocks instead of recesses,
 * and a deep grime band at the base; the bucket is knocked over on its side beside it, rim toward
 * the camera, so its hollow reads. Together ≤ 1.0 m wide. userData.obstacle = {kind:'jump', lanes:1}.
 */
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, roughness = 0.9, metalness = 0, extra = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness, metalness, ...extra });
    if (name) m.name = name;
    return m;
  };
  const foam = M(0xeee2c8, 'plaster', 0.95);
  const foamShade = M(0xd9ccb0, 'plaster', 0.95);
  const scuff = M(0x8a8378, 'plaster', 0.95);
  const tape = M(0x8b6141, 'fabric', 0.8);
  const steel = M(0x8a8a86, 'metal', 0.55, 0.3, { side: THREE.DoubleSide });
  const steelDark = M(0x5c5c5a, 'metal', 0.6, 0.3);
  const rust = M(0x37201b, 'metal', 0.95, 0.3);
  const timber = M(0x4f2d21, 'timber', 0.9);
  const dark = M(0x110f12, undefined, 0.6);

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const B = (w, h, d, x, y, z, mat, parent = g) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);

  // ---- cooler tub at x = -0.18 ---------------------------------------------
  const cx = -0.18, W = 0.60, D = 0.40;
  B(W, 0.06, D, cx, 0.03, 0, dark);                                   // grounding / grime band 0–0.06
  B(W, 0.26, D, cx, 0.19, 0, foam);                                    // tub
  // the tub is open: an inner dark cavity box just below the rim so the lid gap reads
  B(W - 0.07, 0.02, D - 0.07, cx, 0.315, 0, dark);
  B(W, 0.012, D, cx, 0.318, 0, foamShade);                             // rim
  // lid, lifted 3 cm at the +x end and rotated a touch
  const lid = new THREE.Object3D(); lid.position.set(cx, 0.33, 0); lid.rotation.z = 0.05; lid.rotation.y = -0.04; g.add(lid);
  B(W + 0.02, 0.075, D + 0.02, 0, 0.0375, 0, foam, lid);
  B(0.42, 0.012, 0.26, 0, 0.078, 0, foamShade, lid);                   // top recess
  B(W + 0.02, 0.02, 0.02, 0, 0.0, D / 2 + 0.005, foamShade, lid);      // lip
  // crack: split across the lid, opened, with a chip missing at the front edge
  const c1 = B(0.30, 0.09, 0.008, -0.04, 0.04, 0.02, dark, lid); c1.rotation.y = 0.9; c1.rotation.z = 0;
  B(0.06, 0.03, 0.05, 0.12, 0.06, D / 2 - 0.01, dark, lid);            // chipped corner bite
  // raised moulded handles on the ends + a taped split
  for (const s of [-1, 1]) { B(0.03, 0.05, 0.18, cx + s * (W / 2 + 0.01), 0.22, 0, foam); B(0.025, 0.02, 0.14, cx + s * (W / 2 + 0.012), 0.20, 0, dark); }
  B(0.008, 0.20, 0.05, cx - W / 2 - 0.004, 0.18, 0.06, tape); B(0.008, 0.06, 0.10, cx - W / 2 - 0.005, 0.15, 0.06, tape);
  B(0.10, 0.05, 0.006, cx - 0.14, 0.12, D / 2 + 0.003, scuff); B(0.05, 0.10, 0.006, cx + 0.20, 0.22, D / 2 + 0.003, scuff);
  B(0.12, 0.006, 0.05, cx + 0.10, 0.412, -0.08, scuff); B(0.08, 0.06, 0.006, cx + 0.05, 0.18, -D / 2 - 0.003, scuff);
  B(0.14, 0.05, 0.012, cx + 0.12, 0.16, D / 2 + 0.002, foamShade);     // moulded label

  // ---- bucket on its side at x = +0.36, axis along x tilted, rim toward +z -----
  const bk = new THREE.Object3D(); bk.position.set(0.34, 0.14, 0.0); bk.rotation.set(Math.PI / 2 - 0.35, 0, 0.0); bk.rotation.y = 0.5; g.add(bk);
  const br = 0.14, bh = 0.30;
  MESH(new THREE.CylinderGeometry(br, br - 0.025, bh, 16, 1, true), steel, bk, 0, 0, 0);
  MESH(new THREE.CylinderGeometry(br - 0.025, br - 0.025, 0.012, 16), steelDark, bk, 0, -bh / 2 + 0.006, 0);
  MESH(new THREE.TorusGeometry(br, 0.008, 6, 16), steelDark, bk, 0, bh / 2, 0).rotation.x = Math.PI / 2;
  MESH(new THREE.TorusGeometry(br - 0.006, 0.005, 5, 16), steelDark, bk, 0, 0.06, 0).rotation.x = Math.PI / 2;
  for (const s of [-1, 1]) B(0.02, 0.03, 0.025, s * (br + 0.005), bh / 2 - 0.03, 0, steelDark, bk);
  const handle = MESH(new THREE.TorusGeometry(br + 0.01, 0.005, 5, 14, Math.PI), steelDark, bk, 0, bh / 2 - 0.02, 0); handle.rotation.set(0.9, 0, 0);   // handle fallen down
  MESH(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8), timber, bk, 0, bh / 2 - 0.02 + (br + 0.01) * Math.cos(0.9), (br + 0.01) * Math.sin(0.9)).rotation.z = Math.PI / 2;
  B(0.05, 0.08, 0.01, -br + 0.004, 0.0, 0.03, steelDark, bk);         // dent
  B(0.006, 0.10, 0.06, br - 0.001, -0.06, -0.02, rust, bk); B(0.06, 0.03, 0.006, -0.03, 0.10, br - 0.003, rust, bk);
  B(0.03, 0.006, 0.20, 0, -bh / 2 - 0.002, 0, rust, bk);              // rusted base ring
  B(0.28, 0.03, 0.18, 0.34, 0.015, 0.02, dark);                        // shade under the fallen bucket (grounding)

  g.userData.obstacle = { kind: 'jump', lanes: 1 };

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
