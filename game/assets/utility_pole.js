// utility_pole — arm B: profiles.
// The pole is one LatheGeometry (tapered, with a swelling at the foot and stepped bands
// in the profile), the insulators are lathes with proper sheds, the transformer is a lathe
// with a rolled rim and a domed lid, the lamp head is an extruded rounded profile, the arm
// is a tube along a curve, the cable stubs are tubes. Yellow band and grounding band as
// short lathes over the foot.
export default function (THREE) {
  const g = new THREE.Group();
  const lights = [];
  const mat = (hex, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, m); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };
  const box = (w, h, d, x, y, z, m, rx, ry, rz) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, rx, ry, rz);
  const cyl = (r0, r1, h, seg, x, y, z, m, rx, ry, rz) => add(new THREE.CylinderGeometry(r0, r1, h, seg), m, x, y, z, rx, ry, rz);
  const V2 = (a, b) => new THREE.Vector2(a, b);
  const lathe = (pts, seg, m, x, y, z) => add(new THREE.LatheGeometry(pts, seg), m, x, y, z);

  const concrete = mat(0x8a8378, 'stone', { roughness: 0.92 });
  const concreteStain = mat(0x5d5548, 'stone', { roughness: 0.95 });
  const black = mat(0x110f12, 'stone', { roughness: 0.95 });
  const yellow = mat(0xf8e845, 'plaster', { roughness: 0.8 });
  const steel = mat(0x6f6a62, 'metal', { metalness: 0.3, roughness: 0.75 });
  const rust = mat(0x6e4128, 'metal', { metalness: 0.3, roughness: 0.9 });
  const galv = mat(0x8a8378, 'metal', { metalness: 0.3, roughness: 0.7 });
  const drum = mat(0x7a7873, 'metal', { metalness: 0.3, roughness: 0.7 });
  const white = mat(0xd8d2c4, 'plaster', { roughness: 0.6 });
  const cable = mat(0x110f12, 'metal', { roughness: 0.9 });
  const lamp = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xe5b055, emissiveIntensity: 2.6, roughness: 0.35, side: THREE.DoubleSide });

  // --- pole lathe: foot swell, taper, a few cast bands, a capped top ---------------------------
  lathe([V2(0, 0), V2(0.19, 0), V2(0.19, 0.5), V2(0.17, 0.55), V2(0.165, 1.5), V2(0.175, 1.52), V2(0.175, 1.58), V2(0.16, 1.6),
    V2(0.145, 3.6), V2(0.155, 3.62), V2(0.155, 3.68), V2(0.14, 3.7), V2(0.125, 6.3), V2(0.135, 6.32), V2(0.135, 6.38), V2(0.12, 6.4),
    V2(0.11, 8.95), V2(0.1, 9.0), V2(0, 9.0)], 10, concrete, 0, 0, 0);
  lathe([V2(0.2, 0), V2(0.2, 0.08), V2(0.195, 0.08)], 10, black, 0, 0, 0);                  // grounding band
  lathe([V2(0.176, 0.55), V2(0.176, 0.95), V2(0.17, 0.95)], 10, yellow, 0, 0, 0);          // yellow band
  lathe([V2(0.16, 3.0), V2(0.16, 3.4), V2(0.15, 3.4)], 10, concreteStain, 0, 0, 0);          // a stain from the bolt
  for (const y of [5.6, 6.9, 7.6]) lathe([V2(0.128, y), V2(0.142, y + 0.01), V2(0.142, y + 0.05)], 8, rust, 0, 0, 0);
  for (let i = 0; i < 6; i++) { const y = 2.2 + i * 0.8, s = i % 2 ? 1 : -1; cyl(0.014, 0.014, 0.28, 4, s * 0.22, y, 0.0, rust, 0, 0, Math.PI / 2); cyl(0.024, 0.024, 0.03, 5, s * 0.35, y, 0, rust, 0, 0, Math.PI / 2); }

  // --- insulators: lathes with three sheds ------------------------------------------------------
  const insGeo = new THREE.LatheGeometry([V2(0.03, 0), V2(0.06, 0.03), V2(0.04, 0.09), V2(0.065, 0.13), V2(0.045, 0.18), V2(0.06, 0.22), V2(0.03, 0.3)], 6);
  const arms = [[8.55, 1.7, 0.0], [7.9, 1.7, 0.0], [7.3, 1.5, 0.15]];
  for (const [y, len, zo] of arms) {
    box(len, 0.08, 0.08, 0, y, zo, steel);
    box(0.26, 0.14, 0.2, 0, y, zo - 0.02, rust);
    for (const s of [1, -1]) {
      const x = s * (len / 2 - 0.1);
      cyl(0.03, 0.03, 0.3, 5, x, y - 0.04, zo, galv);
      add(insGeo, white, x, y + 0.06, zo);
      cyl(0.03, 0.03, 0.05, 5, x, y + 0.34, zo, rust);
      box(0.04, 0.5, 0.04, s * 0.45, y - 0.28, zo, steel, 0, 0, s * 0.7);
      const path = new THREE.CatmullRomCurve3([new THREE.Vector3(x, y + 0.34, zo), new THREE.Vector3(x + s * 0.2, y + 0.2, zo + 0.15), new THREE.Vector3(x + s * 0.3, y - 0.3, zo + 0.25)]);
      add(new THREE.TubeGeometry(path, 4, 0.012, 3, false), cable, 0, 0, 0);
    }
  }
  {
    const path = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.75, 8.9, 0), new THREE.Vector3(-0.5, 8.4, 0.2), new THREE.Vector3(-0.75, 8.25, 0)]);
    add(new THREE.TubeGeometry(path, 5, 0.012, 3, false), cable, 0, 0, 0);
  }

  // --- transformer: lathe with rolled rims and a domed lid --------------------------------------
  lathe([V2(0, 0), V2(0.28, 0), V2(0.32, 0.02), V2(0.32, 0.06), V2(0.3, 0.08), V2(0.3, 0.72), V2(0.32, 0.74), V2(0.32, 0.8), V2(0.28, 0.82), V2(0.15, 0.86), V2(0.05, 0.88), V2(0, 0.88)], 10, drum, 0.55, 6.15, 0);
  for (const [x, z] of [[0.45, 0.1], [0.65, -0.1]]) add(new THREE.LatheGeometry([V2(0, 0), V2(0.035, 0), V2(0.04, 0.05), V2(0.03, 0.08), V2(0.04, 0.12), V2(0.025, 0.18), V2(0, 0.18)], 5), white, x, 7.0, z);
  box(0.06, 0.25, 0.06, 0.62, 6.55, 0.33, rust); box(0.06, 0.25, 0.06, 0.55, 6.55, -0.33, rust);
  box(0.02, 0.5, 0.2, 0.86, 6.45, 0.0, rust);
  box(0.5, 0.06, 0.06, 0.25, 6.12, 0.0, steel); box(0.5, 0.06, 0.06, 0.25, 7.0, 0.0, steel); box(0.06, 0.9, 0.06, 0.25, 6.56, 0.0, steel);
  cyl(0.012, 0.012, 1.4, 3, 0.5, 5.9, 0.15, cable, 0.3, 0, 0);

  // --- lamp arm (tube) and an extruded lamp head --------------------------------------------------
  {
    const path = new THREE.CatmullRomCurve3([new THREE.Vector3(0.12, 4.9, 0), new THREE.Vector3(0.3, 5.3, 0), new THREE.Vector3(0.7, 5.75, 0), new THREE.Vector3(1.45, 5.95, 0)]);
    add(new THREE.TubeGeometry(path, 8, 0.035, 6, false), galv, 0, 0, 0);
    box(0.12, 0.18, 0.12, 0.13, 4.9, 0, steel); box(0.12, 0.18, 0.12, 0.13, 5.55, 0, steel);
    box(0.3, 0.05, 0.05, 0.3, 5.55, 0, galv, 0, 0, -0.4);
    // head profile in (x, y): a shallow cowl, extruded across z
    const sh = new THREE.Shape(); sh.moveTo(-0.32, 0); sh.lineTo(0.3, 0); sh.quadraticCurveTo(0.34, 0.02, 0.32, 0.08); sh.lineTo(0.2, 0.17); sh.lineTo(-0.2, 0.17); sh.quadraticCurveTo(-0.34, 0.14, -0.32, 0.0); sh.closePath();
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.32, bevelEnabled: false, curveSegments: 3 }); geo.translate(0, 0, -0.16);
    add(geo, galv, 1.66, 5.9, 0);
    add(new THREE.CylinderGeometry(0.2, 0.22, 0.03, 8), lamp, 1.7, 5.885, 0);      // the lit dish underneath
    box(0.14, 0.03, 0.3, 1.94, 6.07, 0, rust);
  }
  lights.push({ x: 1.7, y: 5.8, z: 0, color: 0xe5b055, intensity: 1.4, range: 7.0 });

  cyl(0.02, 0.02, 4.5, 4, -0.14, 3.75, 0.12, galv);
  for (const y of [2.0, 3.5, 5.0]) box(0.08, 0.05, 0.06, -0.12, y, 0.14, steel);
  box(0.16, 0.24, 0.1, -0.2, 1.7, 0.1, steel);
  box(0.1, 0.16, 0.05, 0.0, 2.3, -0.2, white);
  box(0.12, 0.3, 0.05, 0.05, 3.9, -0.2, rust);

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((L) => ({ ...L, x: L.x - c.x, y: L.y - bb.min.y, z: L.z - c.z }));
  return g;
}
