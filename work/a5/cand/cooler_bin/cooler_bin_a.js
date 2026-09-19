/**
 * cooler_bin — arm A: primitives. A white styrofoam cooler 0.6 × 0.4 × 0.4 (body box, lid box with
 * a lip, recessed side handles as inset dark slots, a crack across the lid as a thin dark seam,
 * grey scuffs) with a dented galvanised steel bucket beside it (open cylinder, rolled rim torus,
 * wire handle arc, timber grip, rust bloom, a dent as a pressed-in patch). Together 0.98 m wide.
 * userData.obstacle = {kind:'jump', lanes:1}.
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
  const steel = M(0x8a8a86, 'metal', 0.55, 0.3, { side: THREE.DoubleSide });
  const steelDark = M(0x5c5c5a, 'metal', 0.6, 0.3);
  const rust = M(0x37201b, 'metal', 0.95, 0.3);
  const timber = M(0x4f2d21, 'timber', 0.9);
  const dark = M(0x110f12, undefined, 0.6);

  const MESH = (geo, mat, parent, x, y, z) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); parent.add(m); return m; };
  const B = (w, h, d, x, y, z, mat, parent = g) => MESH(new THREE.BoxGeometry(w, h, d), mat, parent, x, y, z);

  // ---- cooler: centred at x = -0.16 --------------------------------------
  const cx = -0.16, W = 0.60, D = 0.40, H = 0.40;
  B(W, 0.04, D, cx, 0.02, 0, dark);                                  // grounding band 0–0.04
  B(W, 0.27, D, cx, 0.175, 0, foam);                                  // body
  B(W + 0.01, 0.02, D + 0.01, cx, 0.31, 0, foamShade);                // seam / lid seat
  B(W + 0.02, 0.08, D + 0.02, cx, 0.36, 0, foam);                     // lid (slight overhang)
  B(0.40, 0.012, 0.26, cx, 0.406, 0, foamShade);                      // lid top recess panel
  // crack across the lid: two thin dark seams meeting at an angle
  const c1 = B(0.26, 0.006, 0.008, cx - 0.06, 0.402, 0.04, dark); c1.rotation.y = 0.35;
  const c2 = B(0.18, 0.006, 0.008, cx + 0.12, 0.402, -0.02, dark); c2.rotation.y = -0.5;
  const c3 = B(0.012, 0.09, 0.008, cx + 0.19, 0.355, 0.10, dark); c3.rotation.x = 0.4;   // running down the lid edge
  // handle recesses on the ends: dark inset slots with a foam grip bar
  for (const s of [-1, 1]) {
    B(0.02, 0.09, 0.16, cx + s * (W / 2 - 0.005), 0.20, 0, dark);
    B(0.02, 0.03, 0.16, cx + s * (W / 2 + 0.002), 0.235, 0, foam);
  }
  // front recessed label panel (a raised rectangle) and a lid notch
  B(0.16, 0.06, 0.012, cx + 0.10, 0.17, D / 2 + 0.001, foamShade);
  B(0.10, 0.02, 0.02, cx, 0.32, D / 2 + 0.005, foamShade);
  // scuffs and grime: grey flat patches on the front and left end
  B(0.10, 0.05, 0.006, cx - 0.16, 0.10, D / 2 + 0.003, scuff);
  B(0.05, 0.12, 0.006, cx + 0.22, 0.20, D / 2 + 0.003, scuff);
  B(0.006, 0.08, 0.12, cx - W / 2 - 0.003, 0.14, -0.08, scuff);
  B(0.07, 0.006, 0.06, cx + 0.14, 0.412, 0.09, scuff);

  // ---- bucket: centred at x = +0.36, 0.30 dia, 0.30 tall --------------
  const bx = 0.36, br = 0.15, bh = 0.30;
  MESH(new THREE.CylinderGeometry(br, br - 0.025, bh, 16, 1, true), steel, g, bx, bh / 2, 0);   // wall (open, double-sided)
  MESH(new THREE.CylinderGeometry(br - 0.025, br - 0.025, 0.01, 16), steelDark, g, bx, 0.03, 0);   // floor, seen from above
  MESH(new THREE.CylinderGeometry(br - 0.024, br - 0.024, 0.03, 16, 1, true), dark, g, bx, 0.015, 0);   // grounding ring 0–0.03
  MESH(new THREE.TorusGeometry(br, 0.008, 6, 16), steelDark, g, bx, bh, 0).rotation.x = Math.PI / 2;   // rolled rim
  MESH(new THREE.TorusGeometry(br - 0.005, 0.005, 5, 16), steelDark, g, bx, 0.20, 0).rotation.x = Math.PI / 2;   // swage band
  for (const s of [-1, 1]) B(0.02, 0.03, 0.025, bx + s * (br + 0.005), bh - 0.03, 0, steelDark);   // ears
  const handle = MESH(new THREE.TorusGeometry(br + 0.01, 0.005, 5, 14, Math.PI), steelDark, g, bx, bh - 0.02, 0);
  handle.rotation.set(0, Math.PI / 2, -0.35);   // the arc stands up in the x-y plane, leaning slightly
  // timber grip on the handle apex, a dent (pressed-in dark patch) and rust bloom
  const gripY = bh - 0.02 + (br + 0.01) * Math.cos(0.35), gripZ = 0;
  MESH(new THREE.CylinderGeometry(0.012, 0.012, 0.08, 8), timber, g, bx - 0.05, gripY - 0.01, gripZ).rotation.z = Math.PI / 2;
  B(0.05, 0.07, 0.01, bx - br + 0.003, 0.14, 0.03, steelDark).rotation.y = 0.5;   // dent shadow
  B(0.006, 0.10, 0.06, bx + br - 0.001, 0.09, -0.02, rust);                      // rust run
  B(0.06, 0.03, 0.006, bx - 0.03, 0.26, br - 0.002, rust);                       // rust at the rim

  g.userData.obstacle = { kind: 'jump', lanes: 1 };

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
