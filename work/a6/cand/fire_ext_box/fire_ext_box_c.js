// fire_ext_box — arm C: a different reading. The cabinet is a deeper hooded box whose door
// is recessed inside a proud rim, hinged on the right with a bent-strap latch on the left
// and a chained key; the extinguisher hangs on a bracket with a pressure gauge and a horn.
// The fragment is a plank wall with a ledge above and a dark grounding band.
// 0.35 x 0.70 x 0.20 cabinet, 0.60 x 1.00 fragment. Mounts on its back.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const cyl = (rt, rb, h, seg, p, mat, r) => put(new THREE.CylinderGeometry(rt, rb, h, seg), mat, p, r);

  const planks = [M(0x4f2d21, 'timber', { roughness: 0.92 }), M(0x37201b, 'timber', { roughness: 0.92 }), M(0x6c4028, 'timber', { roughness: 0.9 })];
  const tinPale = M(0x8f9a94, 'metal', { roughness: 0.8, metalness: 0.3 });
  const red = M(0xb8302a, 'metal', { roughness: 0.8, metalness: 0.3 });
  const red2 = M(0xa8322c, 'metal', { roughness: 0.82, metalness: 0.3 });
  const redFade = M(0xc4635a, 'metal', { roughness: 0.9, metalness: 0.3 });
  const redDk = M(0x8c231f, 'metal', { roughness: 0.85, metalness: 0.3 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const black = M(0x1b1c1e, 'metal', { roughness: 0.9 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });
  const label = M(0xeee2c8, 'fabric', { roughness: 0.9 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xb9c2bd, roughness: 0.35, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });

  // --- fragment: horizontal planks, a ledge at the top, a pale tin patch low right --------
  for (let i = 0; i < 4; i++) box(0.60, 0.235, 0.06, [0, 0.05 + 0.1175 + i * 0.2375, -0.03], planks[i % 3]);
  box(0.60, 0.05, 0.06, [0, 0.025, -0.03], dark);
  box(0.64, 0.05, 0.12, [0, 1.0, 0.0], planks[1]);
  box(0.16, 0.30, 0.01, [0.20, 0.22, 0.005], tinPale);
  for (const x of [-0.24, 0.24]) for (const y of [0.30, 0.55, 0.80]) cyl(0.006, 0.006, 0.01, 6, [x, y, 0.004], rust, [Math.PI / 2, 0, 0]);   // nails

  // --- cabinet: body, proud rim, recessed door -----------------------------------------
  const CW = 0.35, CH = 0.70, CD = 0.20, CY = 0.55;
  box(CW, CH, CD - 0.04, [0, CY, (CD - 0.04) / 2], red);
  const F = CD - 0.04;
  // rim: four bars standing proud of the body, door set back inside them
  box(CW, 0.04, 0.04, [0, CY + CH / 2 - 0.02, F + 0.02], red2);
  box(CW, 0.04, 0.04, [0, CY - CH / 2 + 0.02, F + 0.02], red2);
  box(0.04, CH, 0.04, [-CW / 2 + 0.02, CY, F + 0.02], red2);
  box(0.04, CH, 0.04, [CW / 2 - 0.02, CY, F + 0.02], red2);
  box(CW - 0.08, CH - 0.08, 0.015, [0, CY, F + 0.005], redDk);                          // door back plate (recess floor)
  box(CW - 0.08, 0.04, 0.02, [0, CY + CH / 2 - 0.06, F + 0.02], red);                   // door frame inside the rim
  box(CW - 0.08, 0.05, 0.02, [0, CY - CH / 2 + 0.065, F + 0.02], red);
  box(0.035, CH - 0.08, 0.02, [-CW / 2 + 0.0575, CY, F + 0.02], red);
  box(0.035, CH - 0.08, 0.02, [CW / 2 - 0.0575, CY, F + 0.02], red);
  put(new THREE.BoxGeometry(CW - 0.15, CH - 0.17, 0.006), glass, [0, CY + 0.005, F + 0.02]);
  for (const y of [CY + 0.20, CY - 0.20]) cyl(0.01, 0.01, 0.05, 6, [CW / 2 - 0.04, y, F + 0.035], rust);
  // latch: a bent strap from the door over the rim, and a chained key
  box(0.06, 0.025, 0.012, [-CW / 2 + 0.05, CY, F + 0.045], galv);
  box(0.012, 0.025, 0.03, [-CW / 2 + 0.024, CY, F + 0.03], galv);
  cyl(0.008, 0.008, 0.02, 6, [-CW / 2 + 0.055, CY, F + 0.055], black, [Math.PI / 2, 0, 0]);
  cyl(0.004, 0.004, 0.10, 4, [-CW / 2 + 0.01, CY - 0.06, F + 0.045], galv, [0, 0, 0.3]);  // chain
  box(0.02, 0.03, 0.005, [-CW / 2 - 0.005, CY - 0.12, F + 0.045], galv);                   // the key
  // wear
  box(0.09, 0.03, 0.004, [0.06, CY + CH / 2 - 0.02, F + 0.042], redFade);
  box(0.03, 0.20, 0.004, [CW / 2 - 0.02, CY - 0.12, F + 0.042], redFade);
  box(0.04, 0.04, 0.004, [-CW / 2 + 0.02, CY + 0.22, F + 0.042], redFade);
  box(0.06, 0.02, 0.004, [-0.08, CY - CH / 2 + 0.015, F + 0.042], rust);
  box(0.04, 0.05, 0.004, [0.10, CY - CH / 2 + 0.02, F + 0.042], rust);
  box(0.02, 0.08, 0.004, [0.05, CY - CH / 2 - 0.04, 0.002], rust);
  box(0.02, 0.05, 0.02, [CW / 2 + 0.005, CY - 0.30, 0.06], rust);                        // chipped corner

  // --- extinguisher on a bracket, with gauge and horn ---------------------------------
  const EX = 0.01, EY = CY - 0.06, EZ = 0.075;
  cyl(0.05, 0.05, 0.36, 10, [EX, EY, EZ], red);
  put(new THREE.SphereGeometry(0.05, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2), red, [EX, EY + 0.18, EZ]);
  cyl(0.045, 0.045, 0.02, 10, [EX, EY - 0.19, EZ], black);
  cyl(0.018, 0.022, 0.05, 8, [EX, EY + 0.245, EZ], galv);
  cyl(0.014, 0.014, 0.01, 8, [EX + 0.03, EY + 0.25, EZ], label, [0, 0, Math.PI / 2]);     // gauge
  box(0.08, 0.014, 0.02, [EX - 0.02, EY + 0.285, EZ], black);
  box(0.07, 0.012, 0.02, [EX - 0.03, EY + 0.305, EZ], black);
  cyl(0.008, 0.008, 0.20, 6, [EX + 0.045, EY + 0.06, EZ + 0.02], black, [0, 0, -0.12]);
  cyl(0.02, 0.008, 0.05, 6, [EX + 0.055, EY - 0.05, EZ + 0.03], black, [0, 0, -0.12]);   // horn
  box(0.07, 0.09, 0.002, [EX, EY + 0.01, EZ + 0.051], label);
  box(0.10, 0.02, 0.02, [EX, EY + 0.05, 0.025], galv);
  box(0.02, 0.02, 0.05, [EX, EY + 0.05, 0.05], galv);

  g.userData.mounts = 'back';
  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
