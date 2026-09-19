// lantern_string — arm A: primitives.
// A 6 m rope (TubeGeometry along a CatmullRom, ends at x = +-3, sag 0.35) carrying six
// 0.35 m round paper lanterns, alternating red and cream, each a squashed sphere with a
// dark top and bottom ring, a wire hoop and a hanging loop. Lantern bodies are emissive
// (near-black base + emissive), with a userData.lights entry per lantern.
// PLACEMENT: this asset is recentred so its lowest point (the bottom of the lowest
// lantern) sits at y = 0. The rope ends are then at about y = 0.95. The game hangs the
// whole group at y = 3.0 so the lanterns clear the runner and the rope reads at ~3.9 m.
export default function (THREE) {
  const g = new THREE.Group();
  const lights = [];
  const mat = (hex, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, m); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };
  const cyl = (r0, r1, h, seg, x, y, z, m, rx, ry, rz) => add(new THREE.CylinderGeometry(r0, r1, h, seg), m, x, y, z, rx, ry, rz);

  const rope = mat(0x6c4028, 'fabric', { roughness: 0.95 });
  const ropeDark = mat(0x37201b, 'fabric', { roughness: 0.95 });
  const ring = mat(0x231718, 'metal', { metalness: 0.3, roughness: 0.8 });
  const ringRust = mat(0x37201b, 'metal', { metalness: 0.3, roughness: 0.9 });
  const wire = mat(0x110f12, 'metal', { roughness: 0.9 });
  const eRed = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xb8302a, emissiveIntensity: 2.4, roughness: 0.35 });
  const eCream = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xeee2c8, emissiveIntensity: 1.9, roughness: 0.35 });
  const eRedDirty = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0x8c2420, emissiveIntensity: 2.0, roughness: 0.4 });

  // --- the rope -------------------------------------------------------------------------------
  const ropeY = (x) => 3.4 - 0.35 * (1 - (x / 3) * (x / 3));
  const pts = []; for (let i = 0; i <= 12; i++) { const x = -3 + i * 0.5; pts.push(new THREE.Vector3(x, ropeY(x), 0)); }
  const curve = new THREE.CatmullRomCurve3(pts);
  add(new THREE.TubeGeometry(curve, 30, 0.018, 4, false), rope, 0, 0, 0);
  // a second thinner cord wound around it, and bindings at the ends
  const pts2 = []; for (let i = 0; i <= 24; i++) { const x = -3 + i * 0.25, a = i * 1.1; pts2.push(new THREE.Vector3(x, ropeY(x) + 0.03 * Math.sin(a), 0.03 * Math.cos(a))); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 40, 0.007, 3, false), ropeDark, 0, 0, 0);
  for (const s of [1, -1]) cyl(0.03, 0.03, 0.08, 6, s * 2.85, ropeY(2.85), 0, ropeDark, 0, 0, Math.PI / 2 + s * 0.1);

  // --- six lanterns ---------------------------------------------------------------------------
  const xs = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
  xs.forEach((x, i) => {
    const R = 0.175, ry = ropeY(x), loopTop = ry - 0.02, y = loopTop - 0.09 - 0.19;   // lantern centre
    const body = add(new THREE.SphereGeometry(R, 10, 7), i % 2 ? eCream : (i === 4 ? eRedDirty : eRed), x, y, 0);
    body.scale.set(1, 1.05, 1);
    // ribs as thin rings (two per lantern)
    for (const dy of [-0.07, 0.07]) add(new THREE.TorusGeometry(R * Math.sqrt(1 - (dy / (R * 1.05)) ** 2) + 0.004, 0.004, 3, 10), ring, x, y + dy, 0, Math.PI / 2, 0, 0);
    cyl(0.075, 0.075, 0.05, 8, x, y + 0.17, 0, i === 2 ? ringRust : ring);           // top ring
    cyl(0.075, 0.075, 0.05, 8, x, y - 0.17, 0, ring);                                 // bottom ring
    add(new THREE.TorusGeometry(0.055, 0.006, 3, 8, Math.PI), wire, x, y + 0.2, 0);   // wire hoop
    cyl(0.005, 0.005, 0.1, 4, x, loopTop - 0.05, 0, wire);                             // hanging loop
    add(new THREE.TorusGeometry(0.03, 0.006, 3, 6), wire, x, ry, 0, 0, Math.PI / 2, 0); // ring over the rope
    lights.push({ x, y, z: 0, color: i % 2 ? 0xf1d899 : 0xe86a3a, intensity: 0.6, range: 3.0 });
  });

  const bb = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) bb.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = bb.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= bb.min.y; o.position.z -= c.z; });
  g.userData.lights = lights.map((L) => ({ ...L, x: L.x - c.x, y: L.y - bb.min.y, z: L.z - c.z }));
  g.userData.hangAt = 3.0;
  return g;
}
