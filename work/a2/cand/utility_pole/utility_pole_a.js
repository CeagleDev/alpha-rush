// utility_pole — arm A: primitives.
// 9 m tapered concrete pole, three steel cross-arms with six white insulators, a
// transformer drum on a bracket, a curved lamp arm with a sodium lamp head (emissive
// underside + userData.lights), cable stubs drooping from the insulators, step bolts,
// steel bands, a yellow band near the base and a black grounding band. Front +Z: the
// lamp arm reaches out over +X so the pole reads from every side.
export default function (THREE) {
  const g = new THREE.Group();
  const lights = [];
  const mat = (hex, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, m); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };
  const box = (w, h, d, x, y, z, m, rx, ry, rz) => add(new THREE.BoxGeometry(w, h, d), m, x, y, z, rx, ry, rz);
  const cyl = (r0, r1, h, seg, x, y, z, m, rx, ry, rz) => add(new THREE.CylinderGeometry(r0, r1, h, seg), m, x, y, z, rx, ry, rz);

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
  const lamp = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xe5b055, emissiveIntensity: 2.6, roughness: 0.35 });

  // --- pole: tapered concrete in three stacked sections (a stain band, a yellow band, the grounding band)
  cyl(0.17, 0.19, 0.08, 12, 0, 0.04, 0, black);
  cyl(0.168, 0.17, 0.42, 12, 0, 0.29, 0, concreteStain);
  cyl(0.166, 0.168, 0.4, 12, 0, 0.7, 0, yellow);
  cyl(0.163, 0.166, 0.6, 12, 0, 1.2, 0, concreteStain);
  cyl(0.11, 0.163, 7.5, 12, 0, 5.25, 0, concrete);
  cyl(0.11, 0.11, 0.06, 12, 0, 9.0, 0, steel);                       // cap
  // rust streaks and bands
  for (const y of [3.2, 5.6, 6.9]) { const r = y > 5 ? 0.13 : 0.15; cyl(r + 0.012, r + 0.012, 0.06, 12, 0, y, 0, rust); }
  cyl(0.13, 0.13, 0.05, 12, 0, 6.35, 0, galv);
  cyl(0.128, 0.128, 0.05, 12, 0, 7.05, 0, galv);
  box(0.02, 1.1, 0.12, 0.14, 4.4, 0.04, rust);                        // a rust run from a step bolt
  // step bolts, alternating sides
  for (let i = 0; i < 7; i++) { const y = 2.2 + i * 0.7, s = i % 2 ? 1 : -1; cyl(0.014, 0.014, 0.28, 5, s * 0.22, y, 0.0, rust, 0, 0, Math.PI / 2); cyl(0.024, 0.024, 0.03, 6, s * 0.35, y, 0, rust, 0, 0, Math.PI / 2); }

  // --- three cross-arms with insulators ------------------------------------------------
  const insulator = (x, y, z) => {
    cyl(0.03, 0.03, 0.3, 6, x, y - 0.08, z, galv);                    // pin
    cyl(0.055, 0.045, 0.07, 8, x, y + 0.03, z, white);
    cyl(0.065, 0.05, 0.07, 8, x, y + 0.1, z, white);
    cyl(0.05, 0.055, 0.06, 8, x, y + 0.17, z, white);
    cyl(0.03, 0.03, 0.05, 6, x, y + 0.22, z, rust);
  };
  const arms = [[8.55, 1.7, 0.0], [7.9, 1.7, 0.0], [7.3, 1.5, 0.15]];
  for (const [y, len, zo] of arms) {
    box(len, 0.08, 0.08, 0, y, zo, steel);
    box(0.26, 0.14, 0.2, 0, y, zo - 0.02, rust);                      // pole clamp
    for (const s of [1, -1]) {
      insulator(s * (len / 2 - 0.1), y + 0.04, zo);
      box(0.04, 0.5, 0.04, s * 0.45, y - 0.28, zo, steel, 0, 0, s * 0.7);   // brace
    }
    box(0.03, 0.3, 0.03, 0, y - 0.05, zo - 0.08, cable);
  }
  // cable stubs drooping from each insulator
  for (const [y, len, zo] of arms) for (const s of [1, -1]) {
    const x = s * (len / 2 - 0.1);
    const path = new THREE.CatmullRomCurve3([new THREE.Vector3(x, y + 0.22, zo), new THREE.Vector3(x + s * 0.2, y + 0.12, zo + 0.15), new THREE.Vector3(x + s * 0.3, y - 0.35, zo + 0.25)]);
    add(new THREE.TubeGeometry(path, 5, 0.012, 4, false), cable, 0, 0, 0);
  }
  // a jumper cable between the top two arms
  {
    const path = new THREE.CatmullRomCurve3([new THREE.Vector3(-0.75, 8.8, 0), new THREE.Vector3(-0.5, 8.3, 0.2), new THREE.Vector3(-0.75, 8.15, 0)]);
    add(new THREE.TubeGeometry(path, 6, 0.012, 4, false), cable, 0, 0, 0);
  }

  // --- transformer drum on a bracket, +X side -------------------------------------------------
  cyl(0.3, 0.3, 0.8, 14, 0.55, 6.55, 0.0, drum);
  cyl(0.32, 0.32, 0.05, 14, 0.55, 6.93, 0.0, steel);                   // lid rim
  cyl(0.32, 0.32, 0.05, 14, 0.55, 6.17, 0.0, steel);
  cyl(0.04, 0.04, 0.12, 6, 0.55, 7.0, 0.0, rust);                     // bushing
  cyl(0.03, 0.03, 0.2, 6, 0.45, 7.05, 0.1, white);
  cyl(0.03, 0.03, 0.2, 6, 0.65, 7.05, -0.1, white);
  box(0.06, 0.25, 0.06, 0.62, 6.55, 0.33, rust);                      // cooling ribs
  box(0.06, 0.25, 0.06, 0.55, 6.55, -0.33, rust);
  box(0.02, 0.5, 0.2, 0.86, 6.45, 0.0, rust);                         // rust run
  box(0.5, 0.06, 0.06, 0.25, 6.12, 0.0, steel);                       // bracket
  box(0.5, 0.06, 0.06, 0.25, 7.0, 0.0, steel);
  box(0.06, 0.9, 0.06, 0.25, 6.56, 0.0, steel);
  cyl(0.012, 0.012, 1.4, 4, 0.5, 5.9, 0.15, cable, 0.3, 0, 0);       // drop lead

  // --- lamp arm and sodium lamp head, reaching over +X ----------------------------------------
  {
    const path = new THREE.CatmullRomCurve3([new THREE.Vector3(0.12, 4.9, 0), new THREE.Vector3(0.3, 5.3, 0), new THREE.Vector3(0.7, 5.75, 0), new THREE.Vector3(1.45, 5.95, 0)]);
    add(new THREE.TubeGeometry(path, 10, 0.035, 7, false), galv, 0, 0, 0);
    box(0.12, 0.18, 0.12, 0.13, 4.9, 0, steel);
    box(0.12, 0.18, 0.12, 0.13, 5.55, 0, steel);
    box(0.3, 0.05, 0.05, 0.3, 5.55, 0, galv, 0, 0, -0.4);
  }
  box(0.62, 0.16, 0.34, 1.65, 5.98, 0, galv);                         // lamp housing
  box(0.5, 0.06, 0.26, 1.7, 5.88, 0, steel);                          // frame
  box(0.44, 0.03, 0.22, 1.7, 5.87, 0, lamp);                          // the lit face, underneath
  box(0.14, 0.05, 0.3, 1.94, 6.05, 0, rust);                          // rust at the far end
  lights.push({ x: 1.7, y: 5.8, z: 0, color: 0xe5b055, intensity: 1.4, range: 7.0 });

  // --- conduit and a junction box down the pole ------------------------------------------------
  cyl(0.02, 0.02, 4.5, 6, -0.14, 3.75, 0.12, galv);
  for (const y of [2.0, 3.5, 5.0]) box(0.08, 0.05, 0.06, -0.12, y, 0.14, steel);
  box(0.16, 0.24, 0.1, -0.2, 1.7, 0.1, steel);
  box(0.1, 0.16, 0.05, 0.0, 2.3, -0.2, white);                        // a plastic notice plate on the back
  box(0.12, 0.3, 0.05, 0.05, 3.9, -0.2, rust);                        // a rusted plate on the back

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((L) => ({ ...L, x: L.x - c.x, y: L.y - bb.min.y, z: L.z - c.z }));
  return g;
}
