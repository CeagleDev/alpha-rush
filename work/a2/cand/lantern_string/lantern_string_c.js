// lantern_string — arm C: a different reading of the reference.
// The lanterns in the picture are taller than wide and flat-topped, so each is built
// as a stack of eight open cylinder bands (DoubleSide) whose radii follow an egg profile,
// which gives the ribbed paper look with a real inside; the rope is read as a thick
// twisted cord with individual lashings where every lantern hangs; lanterns swing a
// little off vertical, alternating red and cream. Emissive bodies + userData.lights.
// PLACEMENT: recentred so the lowest lantern bottom is at y = 0 (rope ends at ~0.97).
// The game hangs the group at y = 3.0.
export default function (THREE) {
  const g = new THREE.Group();
  const lights = [];
  const mat = (hex, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color: hex, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, m, x, y, z, rx = 0, ry = 0, rz = 0) => { const n = new THREE.Mesh(geo, m); n.position.set(x, y, z); n.rotation.set(rx, ry, rz); g.add(n); return n; };

  const rope = mat(0x6c4028, 'fabric', { roughness: 0.95 });
  const ropeDark = mat(0x37201b, 'fabric', { roughness: 0.95 });
  const ring = mat(0x231718, 'metal', { metalness: 0.3, roughness: 0.8 });
  const ringRust = mat(0x37201b, 'metal', { metalness: 0.3, roughness: 0.9 });
  const wire = mat(0x110f12, 'metal', { roughness: 0.9 });
  const eRed = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xb8302a, emissiveIntensity: 2.4, roughness: 0.35, side: THREE.DoubleSide });
  const eCream = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0xeee2c8, emissiveIntensity: 1.9, roughness: 0.35, side: THREE.DoubleSide });
  const eRedDirty = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: 0x8c2420, emissiveIntensity: 2.0, roughness: 0.4, side: THREE.DoubleSide });

  const ropeY = (x) => 3.4 - 0.35 * (1 - (x / 3) * (x / 3));
  // twisted cord: three strands wound around the centre line
  const centre = []; for (let i = 0; i <= 12; i++) { const x = -3 + i * 0.5; centre.push(new THREE.Vector3(x, ropeY(x), 0)); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(centre), 30, 0.014, 4, false), ropeDark, 0, 0, 0);
  for (let s = 0; s < 2; s++) {
    const p = []; for (let i = 0; i <= 60; i++) { const x = -3 + i * 0.1, a = i * 0.9 + s * Math.PI; p.push(new THREE.Vector3(x, ropeY(x) + 0.016 * Math.sin(a), 0.016 * Math.cos(a))); }
    add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(p), 60, 0.009, 3, false), s === 1 ? ropeDark : rope, 0, 0, 0);
  }

  // lantern: stacked open bands following an egg profile (taller than wide, flat top)
  const profile = (t) => 0.165 * Math.pow(Math.sin(Math.PI * (0.1 + 0.8 * t)), 0.5) * (t < 0.5 ? 1 : 1 - 0.1 * (t - 0.5));
  const bands = 8, H = 0.36;
  const bandGeos = [];
  for (let k = 0; k < bands; k++) {
    const t0 = k / bands, t1 = (k + 1) / bands;
    const geo = new THREE.CylinderGeometry(profile(t1) + 0.006, profile(t0), H / bands, 10, 1, true);
    geo.translate(0, -H / 2 + (k + 0.5) * (H / bands), 0);
    bandGeos.push(geo);
  }
  const xs = [-2.5, -1.5, -0.5, 0.5, 1.5, 2.5];
  xs.forEach((x, i) => {
    const ry = ropeY(x), y = ry - 0.03 - 0.08 - 0.2;
    const l = new THREE.Group(); l.position.set(x, y, 0); l.rotation.z = (i % 3 - 1) * 0.06; l.rotation.x = (i % 2 ? 0.04 : -0.03); g.add(l);
    const m = i % 2 ? eCream : (i === 2 ? eRedDirty : eRed);
    for (const geo of bandGeos) l.add(new THREE.Mesh(geo, m));
    const top = new THREE.Mesh(new THREE.CylinderGeometry(0.075, 0.08, 0.05, 8), i === 5 ? ringRust : ring); top.position.y = H / 2 + 0.005; l.add(top);
    const bot = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.07, 0.05, 8), ring); bot.position.y = -H / 2 - 0.005; l.add(bot);
    const cap = new THREE.Mesh(new THREE.CircleGeometry(0.07, 8), ring); cap.rotation.x = -Math.PI / 2; cap.position.y = H / 2 + 0.03; l.add(cap);
    const hoop = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.005, 3, 8, Math.PI), wire); hoop.position.y = H / 2 + 0.03; l.add(hoop);
    // lashing: a small dark cord bundle where the loop meets the rope
    add(new THREE.CylinderGeometry(0.005, 0.005, 0.1, 4), wire, x, ry - 0.06, 0);
    add(new THREE.TorusGeometry(0.035, 0.008, 3, 6), ropeDark, x, ry, 0, 0, Math.PI / 2, 0);
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
