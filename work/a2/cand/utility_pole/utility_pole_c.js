// utility_pole — arm C: a different breakdown.
// The three cross-arms are read as a double-arm rack: two arms parallel to the street
// (along x) and the third turned 90 degrees (along z) as a branch take-off, all on a
// bolted steel saddle with a horizontal brace plate; the transformer hangs on the back
// (-Z) side on a platform, and the lamp arm reaches over +X. The pole is stacked concrete
// segments with a visible joint collar. Cables are short stubs from every insulator.
export default function (THREE) {
  const g = new THREE.Group();
  const lights = [];
  const mat = (hex, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, m); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };
  const box = (w, h, d, x, y, z, m, rx, ry, rz) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, rx, ry, rz);
  const cyl = (r0, r1, h, seg, x, y, z, m, rx, ry, rz) => add(new THREE.CylinderGeometry(r0, r1, h, seg), m, x, y, z, rx, ry, rz);

  const concrete = mat(0x8a8378, 'stone', { roughness: 0.92 });
  const concreteDark = mat(0x6e6a60, 'stone', { roughness: 0.92 });
  const concreteStain = mat(0x5d5548, 'stone', { roughness: 0.95 });
  const black = mat(0x110f12, 'stone', { roughness: 0.95 });
  const yellow = mat(0xf8e845, 'plaster', { roughness: 0.8 });
  const steel = mat(0x6f6a62, 'metal', { metalness: 0.3, roughness: 0.75 });
  const rust = mat(0x6e4128, 'metal', { metalness: 0.3, roughness: 0.9 });
  const galv = mat(0x8a8378, 'metal', { metalness: 0.3, roughness: 0.7 });
  const drum = mat(0x7a7873, 'metal', { metalness: 0.3, roughness: 0.7 });
  const white = mat(0xd8d2c4, 'plaster', { roughness: 0.6 });
  const cable = mat(0x110f12, 'metal', { roughness: 0.9 });
  const lamp = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xe5b055, emissiveIntensity: 2.6, roughness: 0.35 });

  // --- pole in two cast segments with a joint collar ------------------------------------------
  cyl(0.17, 0.19, 0.08, 12, 0, 0.04, 0, black);
  cyl(0.168, 0.17, 0.5, 12, 0, 0.33, 0, concreteStain);
  cyl(0.166, 0.168, 0.4, 12, 0, 0.78, 0, yellow);
  cyl(0.14, 0.166, 3.6, 12, 0, 2.78, 0, concrete);
  cyl(0.15, 0.15, 0.12, 12, 0, 4.62, 0, concreteDark);                // joint collar
  cyl(0.105, 0.14, 4.3, 12, 0, 6.83, 0, concrete);
  cyl(0.11, 0.105, 0.05, 12, 0, 9.0, 0, steel);
  box(0.02, 1.4, 0.1, 0.0, 4.0, 0.15, concreteStain);                 // a weep stain below the collar
  cyl(0.15, 0.15, 0.05, 12, 0, 4.7, 0, rust);
  for (let i = 0; i < 8; i++) { const y = 1.9 + i * 0.65, s = i % 2 ? 1 : -1; cyl(0.014, 0.014, 0.28, 5, 0, y, s * 0.22, rust, Math.PI / 2, 0, 0); cyl(0.024, 0.024, 0.03, 6, 0, y, s * 0.35, rust, Math.PI / 2, 0, 0); }

  // --- insulators --------------------------------------------------------------------------------
  const insulator = (x, y, z) => {
    cyl(0.03, 0.03, 0.3, 6, x, y - 0.08, z, galv);
    cyl(0.055, 0.045, 0.07, 8, x, y + 0.03, z, white);
    cyl(0.065, 0.05, 0.07, 8, x, y + 0.1, z, white);
    cyl(0.05, 0.055, 0.06, 8, x, y + 0.17, z, white);
    cyl(0.03, 0.03, 0.05, 6, x, y + 0.22, z, rust);
    const dir = z === 0 ? new THREE.Vector3(Math.sign(x) || 1, 0, 0) : new THREE.Vector3(0, 0, Math.sign(z));
    const p0 = new THREE.Vector3(x, y + 0.22, z), p1 = p0.clone().addScaledVector(dir, 0.2).add(new THREE.Vector3(0, -0.1, 0)), p2 = p0.clone().addScaledVector(dir, 0.3).add(new THREE.Vector3(0, -0.55, 0));
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([p0, p1, p2]), 5, 0.012, 4, false), cable, 0, 0, 0);
  };
  // saddle: two plates clamping the pole, with bolts
  for (const y of [8.55, 7.95]) {
    box(0.34, 0.16, 0.34, 0, y, 0, rust);
    for (const [x, z] of [[0.19, 0.19], [-0.19, 0.19], [0.19, -0.19], [-0.19, -0.19]]) cyl(0.02, 0.02, 0.2, 5, x, y, z, steel);
  }
  // two arms along x
  for (const y of [8.55, 7.95]) {
    box(1.7, 0.08, 0.08, 0, y, 0.21, steel);
    box(1.7, 0.08, 0.08, 0, y, -0.21, steel);
    for (const s of [1, -1]) insulator(s * 0.75, y + 0.04, 0);
    for (const s of [1, -1]) box(0.04, 0.55, 0.04, s * 0.45, y - 0.3, 0.21, steel, 0, 0, s * 0.72);
  }
  // one arm along z (branch take-off), lower
  box(0.08, 0.08, 1.5, 0.21, 7.3, 0, steel); box(0.08, 0.08, 1.5, -0.21, 7.3, 0, steel);
  box(0.34, 0.14, 0.34, 0, 7.3, 0, rust);
  for (const s of [1, -1]) { insulator(0, 7.34, s * 0.65); box(0.04, 0.55, 0.04, 0.21, 7.0, s * 0.4, steel, s * -0.72, 0, 0); }
  // flat brace plate between the two upper arms
  box(0.05, 0.6, 0.6, 0.5, 8.25, 0, galv, Math.PI / 4, 0, 0);

  // --- transformer on a platform, hung on the back (-Z) --------------------------------------------
  box(0.7, 0.06, 0.7, 0, 6.05, -0.5, steel);
  box(0.06, 0.06, 0.7, -0.3, 6.05, -0.5, rust); box(0.06, 0.06, 0.7, 0.3, 6.05, -0.5, rust);
  for (const s of [1, -1]) box(0.04, 0.7, 0.04, s * 0.3, 5.7, -0.4, steel, 0.6, 0, 0);
  cyl(0.3, 0.3, 0.8, 14, 0, 6.48, -0.55, drum);
  cyl(0.32, 0.32, 0.05, 14, 0, 6.86, -0.55, steel); cyl(0.32, 0.32, 0.05, 14, 0, 6.1, -0.55, steel);
  cyl(0.05, 0.05, 0.08, 8, 0, 6.92, -0.55, rust);
  cyl(0.03, 0.03, 0.2, 6, -0.12, 7.0, -0.45, white); cyl(0.03, 0.03, 0.2, 6, 0.12, 7.0, -0.65, white);
  box(0.06, 0.25, 0.06, 0.33, 6.48, -0.55, rust); box(0.06, 0.25, 0.06, -0.33, 6.48, -0.55, rust);
  box(0.2, 0.5, 0.02, 0, 6.35, -0.86, rust);
  cyl(0.012, 0.012, 1.2, 4, 0.1, 7.5, -0.35, cable, 0.2, 0, 0);

  // --- lamp arm over +X --------------------------------------------------------------------------
  {
    const path = new THREE.CatmullRomCurve3([new THREE.Vector3(0.12, 5.0, 0), new THREE.Vector3(0.35, 5.45, 0), new THREE.Vector3(0.8, 5.8, 0), new THREE.Vector3(1.45, 5.95, 0)]);
    add(new THREE.TubeGeometry(path, 10, 0.035, 7, false), galv, 0, 0, 0);
    for (const y of [5.0, 5.6]) box(0.12, 0.18, 0.12, 0.13, y, 0, steel);
    cyl(0.02, 0.02, 0.6, 5, 0.42, 5.4, 0, galv, 0, 0, 0.9);
  }
  box(0.62, 0.16, 0.34, 1.65, 5.98, 0, galv);
  box(0.5, 0.06, 0.26, 1.7, 5.88, 0, steel);
  box(0.44, 0.03, 0.22, 1.7, 5.87, 0, lamp);
  box(0.14, 0.05, 0.3, 1.94, 6.05, 0, rust);
  lights.push({ x: 1.7, y: 5.8, z: 0, color: 0xe5b055, intensity: 1.4, range: 7.0 });

  // conduit + junction box on the front, plates on the back
  cyl(0.02, 0.02, 4.6, 6, 0.0, 3.7, 0.16, galv);
  for (const y of [2.0, 3.5, 5.0]) box(0.08, 0.05, 0.06, 0.0, y, 0.16, steel);
  box(0.16, 0.24, 0.1, 0.0, 1.5, 0.2, steel);
  box(0.1, 0.16, 0.05, -0.12, 2.3, -0.16, white);
  box(0.12, 0.3, 0.05, 0.1, 3.9, -0.16, rust);

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((L) => ({ ...L, x: L.x - c.x, y: L.y - bb.min.y, z: L.z - c.z }));
  return g;
}
