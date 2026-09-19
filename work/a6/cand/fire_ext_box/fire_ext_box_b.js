// fire_ext_box — arm B: profiles. The cabinet shell is an extruded rounded-rectangle ring
// (walls) over a back plate, the door frame is a second extruded ring with the glass in the
// hole, and the extinguisher is a LatheGeometry profile: base ring, cylinder, shoulder,
// neck, valve. The fragment is an extruded plank profile. 0.35 x 0.70 x 0.20 cabinet on
// a 0.60 x 1.00 fragment. Mounts on its back; base y=0 is the fragment's dark bottom band.
export default function (THREE) {
  const g = new THREE.Group();
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const put = (geo, mat, p, r) => { const m = new THREE.Mesh(geo, mat); if (p) m.position.set(p[0], p[1], p[2]); if (r) m.rotation.set(r[0], r[1], r[2]); g.add(m); return m; };
  const box = (w, h, d, p, mat, r) => put(new THREE.BoxGeometry(w, h, d), mat, p, r);
  const rrect = (w, h, rad) => { const s = new THREE.Shape(); const x = -w / 2, y = -h / 2;
    s.moveTo(x + rad, y); s.lineTo(x + w - rad, y); s.quadraticCurveTo(x + w, y, x + w, y + rad);
    s.lineTo(x + w, y + h - rad); s.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    s.lineTo(x + rad, y + h); s.quadraticCurveTo(x, y + h, x, y + h - rad);
    s.lineTo(x, y + rad); s.quadraticCurveTo(x, y, x + rad, y); return s; };
  const ring = (w, h, t, rad) => { const s = rrect(w, h, rad); s.holes.push(rrect(w - 2 * t, h - 2 * t, Math.max(0.004, rad - t))); return s; };
  const ext = (shape, depth, mat, p, r) => put(new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: 3 }), mat, p, r);
  const lathe = (pts, seg, mat, p) => put(new THREE.LatheGeometry(pts.map((q) => new THREE.Vector2(q[0], q[1])), seg), mat, p);

  const timber = M(0x4f2d21, 'timber', { roughness: 0.92 });
  const timber2 = M(0x37201b, 'timber', { roughness: 0.92 });
  const tin = M(0x7d817f, 'metal', { roughness: 0.8, metalness: 0.3, side: THREE.DoubleSide });
  const red = M(0xb8302a, 'metal', { roughness: 0.8, metalness: 0.3, side: THREE.DoubleSide });
  const redFade = M(0xc4635a, 'metal', { roughness: 0.9, metalness: 0.3 });
  const redDk = M(0x8c231f, 'metal', { roughness: 0.85, metalness: 0.3 });
  const rust = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const galv = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const black = M(0x1b1c1e, 'metal', { roughness: 0.9 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });
  const label = M(0xeee2c8, 'fabric', { roughness: 0.9 });
  const glass = new THREE.MeshStandardMaterial({ color: 0xb9c2bd, roughness: 0.35, metalness: 0, transparent: true, opacity: 0.9, forceSinglePass: true });

  // --- fragment: vertical boards with grooves, extruded as one profile ----------------
  {
    const s = new THREE.Shape(); const N = 4, bw = 0.6 / N;
    s.moveTo(-0.3, 0); s.lineTo(-0.3, 1.0);
    for (let i = 0; i < N; i++) { const x0 = -0.3 + i * bw; s.lineTo(x0 + bw - 0.012, 1.0); s.lineTo(x0 + bw - 0.006, 0.99); s.lineTo(x0 + bw, 1.0); }
    s.lineTo(0.3, 0); s.lineTo(-0.3, 0);
    ext(s, 0.06, timber, [0, 0, -0.06]);
    box(0.60, 0.05, 0.06, [0, 0.025, -0.03], dark);
    box(0.60, 0.03, 0.06, [0, 0.72, -0.028], timber2);
    // a tin strip nailed over the right board
    const z = new THREE.Shape(); z.moveTo(0, 0);
    for (let i = 0; i <= 8; i++) z.lineTo(i * 0.02, (i % 2 ? 0.012 : 0));
    z.lineTo(0.16, -0.006); z.lineTo(0, -0.006); z.lineTo(0, 0);
    ext(z, 0.85, tin, [0.13, 0.95, 0.008], [Math.PI / 2, 0, 0]);
  }

  // --- cabinet: ring shell + back plate + framed glass door -----------------------------
  const CW = 0.35, CH = 0.70, CD = 0.20, CY = 0.55;
  ext(ring(CW, CH, 0.02, 0.03), CD, red, [0, CY, 0]);
  box(CW - 0.02, CH - 0.02, 0.015, [0, CY, 0.0125], redDk);
  ext(ring(CW, CH, 0.045, 0.03), 0.025, red, [0, CY, CD]);
  put(new THREE.BoxGeometry(CW - 0.09, CH - 0.09, 0.006), glass, [0, CY, CD + 0.012]);
  const F = CD + 0.025;
  for (const y of [CY + 0.22, CY - 0.22]) put(new THREE.CylinderGeometry(0.011, 0.011, 0.06, 6), rust, [CW / 2 + 0.006, y, CD + 0.012]);
  ext(ring(0.03, 0.10, 0.008, 0.008), 0.015, galv, [-CW / 2 - 0.012, CY + 0.02, F]);      // handle loop
  put(new THREE.CylinderGeometry(0.009, 0.009, 0.02, 6), black, [-CW / 2 + 0.024, CY - 0.06, F + 0.005], [Math.PI / 2, 0, 0]);
  box(0.10, 0.04, 0.004, [0.07, CY + CH / 2 - 0.022, F + 0.002], redFade);
  box(0.04, 0.24, 0.004, [CW / 2 - 0.022, CY - 0.08, F + 0.002], redFade);
  box(0.05, 0.03, 0.004, [-0.09, CY - CH / 2 + 0.02, F + 0.002], rust);
  box(0.04, 0.04, 0.004, [0.12, CY - CH / 2 + 0.03, F + 0.002], rust);
  box(0.02, 0.09, 0.004, [0.02, CY - CH / 2 - 0.045, -0.002], rust);          // run down the wall below

  // --- extinguisher: one lathe --------------------------------------------------------
  const EX = 0.02, EY = CY - 0.26, EZ = 0.10;
  lathe([[0.0, 0.0], [0.05, 0.0], [0.05, 0.02], [0.055, 0.03], [0.055, 0.36], [0.05, 0.40], [0.03, 0.43], [0.02, 0.44], [0.02, 0.48], [0.028, 0.49], [0.028, 0.51], [0.0, 0.51]], 10, red, [EX, EY, EZ]);
  put(new THREE.CylinderGeometry(0.05, 0.05, 0.02, 10), black, [EX, EY + 0.01, EZ]);
  put(new THREE.CylinderGeometry(0.03, 0.03, 0.03, 8), galv, [EX, EY + 0.50, EZ]);
  box(0.09, 0.014, 0.02, [EX + 0.02, EY + 0.52, EZ], black);
  box(0.07, 0.012, 0.02, [EX + 0.03, EY + 0.54, EZ], black);
  put(new THREE.CylinderGeometry(0.008, 0.008, 0.22, 6), black, [EX - 0.045, EY + 0.26, EZ + 0.03], [0, 0, 0.15]);
  box(0.07, 0.10, 0.002, [EX, EY + 0.22, EZ + 0.056], label);
  box(0.10, 0.02, 0.02, [EX, EY + 0.18, 0.03], galv);

  g.userData.mounts = 'back';
  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  return g;
}
