// fire_ext_box — arm A: primitives. Red steel cabinet 0.35 w x 0.70 h x 0.20 d with a glazed
// door showing a red extinguisher, on a short wall fragment (timber post + corrugated tin,
// 0.60 x 1.00). Faded paint patches, scuffed corners, rust at the bottom, hinges right,
// latch left. Mounts on its back; base y=0 is the fragment's dark bottom band.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);

  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const timber2 = M(0x37201b, 'timber', { roughness: 0.92 });
  const tin = M(0x7d817f, 'metal', { roughness: 0.8, metalness: 0.3 });
  const tinPale = M(0x8f9a94, 'metal', { roughness: 0.8, metalness: 0.3 });
  const tinRust = M(0x6e4128, 'metal', { roughness: 0.9, metalness: 0.3 });
  const red = M(0xb8302a, 'metal', { roughness: 0.8, metalness: 0.3 });
  const redFade = M(0xc4635a, 'metal', { roughness: 0.9, metalness: 0.3 });
  const redDk = M(0x8c231f, 'metal', { roughness: 0.85, metalness: 0.3 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const black = M(0x1b1c1e, 'metal', { roughness: 0.9 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });
  const label = M(0xeee2c8, 'fabric', { roughness: 0.9 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xb9c2bd, roughness: 0.35, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });

  // --- fragment: a timber post on the left, corrugated tin to the right ------------
  box(0.22, 0.95, 0.06, [-0.19, 0.525, -0.03], timber);
  box(0.22, 0.03, 0.06, [-0.19, 0.30, -0.028], timber2);
  box(0.38, 0.95, 0.03, [0.11, 0.525, -0.045], tin);
  for (let i = 0; i < 9; i++) box(0.02, 0.95, 0.02, [-0.06 + i * 0.042, 0.525, -0.02], i % 4 === 1 ? tinRust : (i % 4 === 3 ? tinPale : tin));
  box(0.60, 0.05, 0.06, [0, 0.025, -0.03], dark);                           // grounding band
  box(0.60, 0.04, 0.06, [0, 0.98, -0.03], timber2);

  // --- cabinet -------------------------------------------------------------------
  const CW = 0.35, CH = 0.70, CD = 0.20, CY = 0.55, Z0 = 0.0;
  box(CW, CH, 0.02, [0, CY, Z0 + 0.01], redDk);                             // back plate
  for (const sx of [-1, 1]) box(0.02, CH, CD, [sx * (CW / 2 - 0.01), CY, Z0 + CD / 2], red);
  box(CW, 0.02, CD, [0, CY + CH / 2 - 0.01, Z0 + CD / 2], red);
  box(CW, 0.02, CD, [0, CY - CH / 2 + 0.01, Z0 + CD / 2], red);
  // door: a frame around a glass pane, on the front plane
  const F = Z0 + CD;
  box(CW, 0.05, 0.025, [0, CY + CH / 2 - 0.025, F + 0.0125], red);
  box(CW, 0.06, 0.025, [0, CY - CH / 2 + 0.03, F + 0.0125], red);
  box(0.05, CH, 0.025, [-CW / 2 + 0.025, CY, F + 0.0125], red);
  box(0.05, CH, 0.025, [CW / 2 - 0.025, CY, F + 0.0125], red);
  put(new THREE.BoxGeometry(CW - 0.10, CH - 0.11, 0.006), glass, [0, CY - 0.005, F + 0.012]);
  // hinges on the right, latch and a handle on the left
  for (const y of [CY + 0.22, CY - 0.22]) cyl(0.011, 0.011, 0.06, 6, [CW / 2 + 0.008, y, F + 0.012], rust);
  box(0.02, 0.09, 0.02, [-CW / 2 - 0.015, CY + 0.02, F + 0.02], galv);
  cyl(0.009, 0.009, 0.02, 6, [-CW / 2 + 0.025, CY - 0.06, F + 0.03], black, [Math.PI / 2, 0, 0]);   // keyhole
  // paint fade and scuffs: paler patches proud of the paint, rust at the bottom
  box(0.10, 0.04, 0.004, [0.08, CY + CH / 2 - 0.025, F + 0.027], redFade);
  box(0.04, 0.22, 0.004, [CW / 2 - 0.025, CY - 0.10, F + 0.027], redFade);
  box(0.05, 0.06, 0.004, [-CW / 2 + 0.025, CY + 0.18, F + 0.027], redFade);
  box(0.06, 0.03, 0.004, [-0.10, CY - CH / 2 + 0.02, F + 0.027], rust);
  box(0.04, 0.05, 0.004, [0.13, CY - CH / 2 + 0.03, F + 0.027], rust);
  box(0.02, 0.10, 0.004, [0.0, CY - CH / 2 - 0.03, F - 0.03], rust);
  for (const sy of [-1, 1]) box(0.02, 0.06, 0.02, [CW / 2 + 0.005, CY + sy * 0.28, Z0 + 0.07], rust);   // scuffed side edge

  // --- the extinguisher inside ---------------------------------------------------
  const EX = 0.02, EY = CY - 0.06, EZ = Z0 + 0.10;
  cyl(0.055, 0.055, 0.38, 10, [EX, EY, EZ], red);
  put(new THREE.SphereGeometry(0.055, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), red, [EX, EY + 0.19, EZ]);
  cyl(0.05, 0.05, 0.02, 10, [EX, EY - 0.20, EZ], black);                   // base ring
  cyl(0.02, 0.025, 0.05, 8, [EX, EY + 0.26, EZ], galv);                     // valve
  box(0.09, 0.015, 0.02, [EX + 0.02, EY + 0.29, EZ], black);                // lever
  box(0.07, 0.012, 0.02, [EX + 0.03, EY + 0.31, EZ], black);
  cyl(0.008, 0.008, 0.22, 6, [EX - 0.045, EY + 0.06, EZ + 0.03], black, [0, 0, 0.15]);   // hose
  box(0.07, 0.10, 0.002, [EX, EY + 0.02, EZ + 0.056], label);              // label
  box(0.10, 0.02, 0.02, [EX, EY - 0.02, Z0 + 0.03], galv);                  // wall bracket behind

  g.userData.mounts = 'back';
  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
