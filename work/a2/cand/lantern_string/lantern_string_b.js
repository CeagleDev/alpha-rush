// lantern_string — arm B: profiles.
// Six 0.35 m paper lanterns as ribbed LatheGeometry profiles (a chochin: flat top and
// bottom, ten bamboo ribs in the profile), alternating red and cream, on a sagging 6 m
// rope tube (ends x = +-3, y = 3.4, sag 0.35). Dark top and bottom collars are lathes
// too; each lantern has a wire loop and a userData.lights entry.
// PLACEMENT: recentred so the lowest lantern bottom sits at y = 0 (rope ends then at
// ~0.95). The game hangs the group at y = 3.0.
export default function (THREE) {
  const g = new THREE.Group();
  const lights = [];
  const mat = (hex, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, m); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };
  const V2 = (a, b) => new THREE.Vector2(a, b);

  const rope = mat(0x6c4028, 'fabric', { roughness: 0.95 });
  const ropeDark = mat(0x37201b, 'fabric', { roughness: 0.95 });
  const ring = mat(0x231718, 'metal', { metalness: 0.3, roughness: 0.8, side: THREE.DoubleSide });
  const ringRust = mat(0x37201b, 'metal', { metalness: 0.3, roughness: 0.9, side: THREE.DoubleSide });
  const wire = mat(0x110f12, 'metal', { roughness: 0.9 });
  const eRed = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xb8302a, emissiveIntensity: 2.4, roughness: 0.35, side: THREE.DoubleSide });
  const eCream = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xeee2c8, emissiveIntensity: 1.9, roughness: 0.35, side: THREE.DoubleSide });
  const eCreamDirty = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xc9b89a, emissiveIntensity: 1.6, roughness: 0.4, side: THREE.DoubleSide });

  const ropeY = (x) => 3.4 - 0.35 * (1 - (x / 3) * (x / 3));
  const pts = []; for (let i = 0; i <= 12; i++) { const x = -3 + i * 0.5; pts.push(new THREE.Vector3(x, ropeY(x), 0)); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 30, 0.018, 4, false), rope, 0, 0, 0);
  const pts2 = []; for (let i = 0; i <= 24; i++) { const x = -3 + i * 0.25, a = i * 1.1; pts2.push(new THREE.Vector3(x, ropeY(x) + 0.03 * Math.sin(a), 0.03 * Math.cos(a))); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts2), 36, 0.007, 3, false), ropeDark, 0, 0, 0);

  // lantern body profile: a chochin, ribbed, open at top and bottom (the collars close it)
  const prof = [];
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const t = i / N, y = -0.17 + 0.34 * t;
    const base = 0.175 * Math.pow(Math.sin(Math.PI * (0.08 + 0.84 * t)), 0.6);
    const rib = 1 + 0.04 * Math.cos(2 * Math.PI * 9 * t);
    prof.push(V2(Math.max(0.07, base * rib), y));
  }
  const bodyGeo = new THREE.LatheGeometry(prof, 9);
  const collarGeo = new THREE.LatheGeometry([V2(0.06, 0), V2(0.08, 0.005), V2(0.078, 0.05)], 8);
  const loopGeo = new THREE.TorusGeometry(0.05, 0.005, 3, 8, Math.PI);

  const xs = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
  xs.forEach((x, i) => {
    const ry = ropeY(x), y = ry - 0.02 - 0.09 - 0.19;
    add(bodyGeo, i % 2 ? (i === 3 ? eCreamDirty : eCream) : eRed, x, y, 0);
    add(collarGeo, i === 1 ? ringRust : ring, x, y + 0.15, 0);
    add(collarGeo, ring, x, y - 0.2, 0);
    add(loopGeo, wire, x, y + 0.2, 0);
    add(new THREE.CylinderGeometry(0.005, 0.005, 0.1, 4), wire, x, ry - 0.07, 0);
    add(new THREE.TorusGeometry(0.03, 0.006, 3, 6), wire, x, ry, 0, 0, Math.PI / 2, 0);
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
