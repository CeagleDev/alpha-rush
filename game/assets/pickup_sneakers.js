// pickup_sneakers — midnight-dash power-up pickup (super sneakers: high jump).
// ONE chunky high-top trainer, 0.5 m long, toe pointing +Z, tilted heel-down 15 degrees. Bright teal
// upper, thick white midsole (wedge, thicker at the heel) over a dark treaded outsole, white toe cap,
// white laces, padded collar, heel counter, ankle patch, and two small white wings at the heel with
// three feathers each. The upper, toe cap and soles are lofted superellipse sections (hand-built
// BufferGeometry) so every edge is rounded and the shading is smooth.
export default function (THREE) {
  const g = new THREE.Group();
  const teal = new THREE.MeshStandardMaterial({ color: 0x1f9e8f, roughness: 0.8, metalness: 0.0 }); teal.name = 'fabric';
  const tealDark = new THREE.MeshStandardMaterial({ color: 0x167368, roughness: 0.85, metalness: 0.0 }); tealDark.name = 'fabric';
  const white = new THREE.MeshStandardMaterial({ color: 0xe6ddd0, roughness: 0.7, metalness: 0.0 }); white.name = 'plaster';
  const dark = new THREE.MeshStandardMaterial({ color: 0x231718, roughness: 0.9, metalness: 0.0 }); dark.name = 'ground';

  const shoe = new THREE.Group(); shoe.name = 'shoe';

  // Toe spring: everything forward of the ball of the foot lifts a little.
  const spring = (z) => { const k = Math.max(0, (z - 0.06) / 0.19); return 0.028 * k * k; };
  // Plan half-width of the foot along z (heel -0.25 .. toe +0.25).
  const PLAN = [
    [-0.247, 0.030], [-0.238, 0.054], [-0.22, 0.072], [-0.185, 0.083], [-0.12, 0.088], [-0.05, 0.091],
    [0.02, 0.096], [0.09, 0.100], [0.15, 0.098], [0.195, 0.088], [0.225, 0.070], [0.241, 0.048], [0.249, 0.024],
  ];

  // Loft closed superellipse rings (N points) through stations {z, hw, yb, yt, n, taper}; ends capped.
  const loft = (st, N, mat, name) => {
    const pos = [], idx = [];
    for (const s of st) {
      const e = 2 / s.n, yc = (s.yb + s.yt) / 2, hh = (s.yt - s.yb) / 2;
      for (let i = 0; i < N; i++) {
        const a = (i / N) * Math.PI * 2, c = Math.cos(a), sn = Math.sin(a);
        const ny = Math.sign(sn) * Math.pow(Math.abs(sn), e);
        const tt = (ny + 1) / 2;
        const x = s.hw * Math.sign(c) * Math.pow(Math.abs(c), e) * (1 - (s.taper || 0) * tt * tt);
        pos.push(x, yc + hh * ny + spring(s.z), s.z);
      }
    }
    for (let k = 0; k < st.length - 1; k++) for (let i = 0; i < N; i++) {
      const a = k * N + i, b = k * N + (i + 1) % N, c = a + N, d = b + N;
      idx.push(a, b, c, b, d, c);
    }
    // Caps: a centre vertex at each end.
    const cap = (k, flip) => {
      const s = st[k], ci = pos.length / 3;
      pos.push(0, (s.yb + s.yt) / 2 + spring(s.z), s.z + (flip ? -0.004 : 0.004));
      for (let i = 0; i < N; i++) { const a = k * N + i, b = k * N + (i + 1) % N; if (flip) idx.push(ci, b, a); else idx.push(ci, a, b); }
    };
    cap(0, true); cap(st.length - 1, false);
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    geo.setIndex(idx); geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, mat); mesh.name = name;
    return mesh;
  };

  // Soles: the plan, a little proud of the upper. Midsole is a wedge, thicker at the heel.
  const midTop = (z) => 0.105 - 0.03 * (z + 0.25) / 0.5;
  shoe.add(loft(PLAN.map(([z, hw]) => ({ z, hw: hw + 0.012, yb: 0.0, yt: 0.048, n: 5 })).filter((s, i) => i % 2 === 0), 12, dark, 'outsole'));
  shoe.add(loft(PLAN.map(([z, hw]) => ({ z, hw: hw + 0.014, yb: 0.036, yt: midTop(z) + 0.006, n: 4.5 })), 16, white, 'midsole'));

  // Upper: tall ankle shaft at the back, steep laced throat, low rounded forefoot.
  const TOP = [
    [-0.243, 0.030, 0.395, 4, 0.10], [-0.234, 0.054, 0.405, 4, 0.16], [-0.215, 0.072, 0.412, 4, 0.2],
    [-0.18, 0.083, 0.418, 4, 0.22], [-0.12, 0.088, 0.422, 4, 0.22], [-0.06, 0.090, 0.418, 4, 0.22],
    [-0.03, 0.091, 0.400, 3.6, 0.2], [0.0, 0.093, 0.340, 3.2, 0.18], [0.04, 0.096, 0.270, 2.8, 0.14],
    [0.09, 0.098, 0.215, 2.5, 0.1], [0.14, 0.097, 0.182, 2.4, 0.08], [0.19, 0.087, 0.160, 2.4, 0.06],
    [0.22, 0.070, 0.145, 2.4, 0.04], [0.237, 0.048, 0.128, 2.4, 0], [0.245, 0.024, 0.11, 2.4, 0],
  ];
  shoe.add(loft(TOP.map(([z, hw, yt, n, taper]) => ({ z, hw, yb: 0.05, yt, n, taper })), 16, teal, 'upper'));

  // White toe cap: the front of the upper again, 5 mm fatter, so it ends in a visible seam step.
  const CAP = TOP.filter((s) => s[0] >= 0.14);
  const capSt = [[0.125, 0.099, 0.19, 2.4, 0.08], ...CAP].map(([z, hw, yt, n, taper], i) => ({ z: z + 0.003, hw: hw + 0.005, yb: 0.05, yt: yt + 0.006, n, taper }));
  shoe.add(loft(capSt, 16, white, 'toe_cap'));

  // Heel counter: a white wrap low round the back of the heel.
  const HEEL = TOP.filter((s) => s[0] <= -0.12);
  shoe.add(loft([...HEEL.map(([z, hw, yt, n, taper]) => ({ z: z - 0.004, hw: hw + 0.005, yb: 0.06, yt: 0.2, n: 5, taper: 0.06 })),
    { z: -0.09, hw: 0.094, yb: 0.06, yt: 0.15, n: 5, taper: 0.04 }], 12, white, 'heel_counter'));

  // Padded collar round the opening, with the dark opening inside it.
  const collar = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.022, 6, 16), white);
  collar.rotation.x = Math.PI / 2; collar.scale.set(0.95, 1.42, 1); // scale.y is world z after the turn
  collar.position.set(0, 0.422, -0.137); collar.name = 'collar';
  shoe.add(collar);
  const opening = new THREE.Mesh(new THREE.SphereGeometry(1, 8, 4), dark);
  opening.scale.set(0.055, 0.012, 0.088); opening.position.set(0, 0.43, -0.137); opening.name = 'opening';
  shoe.add(opening);

  // Tongue: a teal pad standing proud at the front of the collar, leaning forward.
  const tongue = new THREE.Mesh(new THREE.SphereGeometry(1, 10, 6), tealDark);
  tongue.scale.set(0.05, 0.085, 0.017); tongue.position.set(0, 0.4, -0.03); tongue.rotation.x = 0.5; tongue.name = 'tongue';
  shoe.add(tongue);

  // Laces: five chunky white bars across the throat, following its slope, plus a dark-teal placket.
  const throat = [[0.118, 0.205], [0.082, 0.232], [0.05, 0.268], [0.022, 0.312], [-0.002, 0.358]];
  throat.forEach(([z, y], i) => {
    const hwAt = 0.058 - i * 0.004;
    const lace = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.011, hwAt * 2, 6), white);
    lace.rotation.z = Math.PI / 2; lace.position.set(0, y + spring(z) + 0.004, z + 0.004); lace.name = 'lace';
    shoe.add(lace);
  });

  // Ankle patch: a plain white disc each side (no logo).
  for (const sx of [-1, 1]) {
    const patch = new THREE.Mesh(new THREE.CylinderGeometry(0.038, 0.038, 0.012, 14), white);
    patch.rotation.z = Math.PI / 2; patch.position.set(sx * 0.078, 0.315, -0.12); patch.rotation.y = 0; patch.name = 'ankle_patch';
    shoe.add(patch);
  }

  // Tread: five dark bars under the sole so the underside is not blank when the toe is up.
  for (let i = 0; i < 5; i++) {
    const z = -0.19 + i * 0.095;
    const hwAt = 0.07 + 0.02 * Math.sin((i / 4) * Math.PI);
    const bar = new THREE.Mesh(new THREE.BoxGeometry(hwAt * 2, 0.014, 0.04), dark);
    bar.position.set(0, -0.004 + spring(z), z); bar.name = 'tread';
    shoe.add(bar);
  }

  // Wings: three white feathers each side of the heel, fanning up and back, splayed outward.
  const feather = (L, wd) => {
    const s = new THREE.Shape();
    s.moveTo(0, -wd * 0.35); s.quadraticCurveTo(L * 0.55, -wd * 0.95, L, 0.0);
    s.quadraticCurveTo(L * 0.6, wd * 1.05, 0, wd * 0.45); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 0.008, bevelEnabled: true, bevelThickness: 0.005, bevelSize: 0.005, bevelSegments: 1, curveSegments: 3 });
    geo.translate(0, 0, -0.004);
    return geo;
  };
  const feathers = [[0.23, 0.04, 1.0], [0.2, 0.038, 0.58], [0.155, 0.034, 0.16]];
  for (const sx of [-1, 1]) {
    const wing = new THREE.Group(); wing.name = sx > 0 ? 'wing_right' : 'wing_left';
    wing.position.set(sx * 0.088, 0.235, -0.15);
    wing.rotation.y = Math.PI / 2 - sx * 0.42;
    feathers.forEach(([L, wd, ang], i) => {
      const f = new THREE.Mesh(feather(L, wd), white);
      f.rotation.z = ang; f.position.z = sx * i * 0.004; f.name = 'feather';
      wing.add(f);
    });
    const root = new THREE.Mesh(new THREE.SphereGeometry(0.03, 6, 4), white);
    root.scale.set(1, 1, 0.5); root.name = 'wing_root'; wing.add(root);
    shoe.add(wing);
  }

  shoe.rotation.x = -15 * Math.PI / 180;   // heel down, toe up
  g.add(shoe);

  recentre(THREE, g);
  g.userData.pickup = 'sneakers';
  return g;
}

function recentre(THREE, g) {
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => {
    const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld);
  });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
}
