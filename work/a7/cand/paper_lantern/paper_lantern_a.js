// paper_lantern — arm A: primitives. A 0.45 m red chochin: a squashed sphere body
// (emissive red over near-black, per STYLE.md) with nine thin rib bands as open
// cylinders, a black tin ring top and bottom, a wire bail arc and a hanging loop.
// Base y = 0 at the bottom ring; the game hangs it by the loop. One warm light at the core.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const RING = mk(0x110f12, 'metal', { roughness: 0.9, metalness: 0.3, side: DS });   // black tin, grounding band
  const RING2 = mk(0x231718, 'metal', { roughness: 0.9, metalness: 0.3, side: DS });
  const WIRE = mk(0x37201b, 'metal', { roughness: 0.8, metalness: 0.4 });
  const BODY = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xb8302a), emissiveIntensity: 2.4, roughness: 0.35 });
  const BODY2 = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xa62a24), emissiveIntensity: 2.0, roughness: 0.4, side: DS }); // rib creases, a shade darker (wear)
  const CORE = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xf1d899), emissiveIntensity: 3.0, roughness: 0.35 });

  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };

  const R = 0.225, RY = 0.19, CY = 0.245;           // body radii and centre height
  // body
  const body = add(new THREE.SphereGeometry(R, 16, 12), BODY, 0, CY, 0);
  body.scale.set(1, RY / R, 1);
  // rib bands: open cylinders sitting 3 mm proud of the paper
  for (let i = -4; i <= 4; i++) {
    const y = CY + i * 0.041;
    const rr = Math.sqrt(Math.max(0, 1 - ((y - CY) / RY) ** 2)) * R + 0.003;
    add(new THREE.CylinderGeometry(rr, rr, 0.006, 16, 1, true), BODY2, 0, y, 0);
  }
  // bright core seen through the paper at the bottom opening
  add(new THREE.SphereGeometry(0.06, 8, 6), CORE, 0, CY, 0);
  // bottom ring (grounding band) and top ring
  add(new THREE.CylinderGeometry(0.10, 0.105, 0.05, 16, 1, true), RING, 0, 0.025, 0);
  add(new THREE.CircleGeometry(0.10, 16), RING, 0, 0.004, 0, Math.PI / 2, 0, 0);
  add(new THREE.CylinderGeometry(0.105, 0.10, 0.06, 16, 1, true), RING2, 0, 0.445, 0);
  add(new THREE.CircleGeometry(0.105, 16), RING2, 0, 0.474, 0, -Math.PI / 2, 0, 0);
  // rivet dots on the rings
  for (const [y, mat] of [[0.02, RING2], [0.45, RING]]) for (let k = 0; k < 4; k++) {
    const a = k * Math.PI / 2 + 0.4;
    add(new THREE.CylinderGeometry(0.006, 0.006, 0.006, 6), mat, Math.sin(a) * 0.105, y, Math.cos(a) * 0.105, Math.PI / 2, 0, a);
  }
  // wire bail: an arc over the top, and a loop at the crown
  add(new THREE.TorusGeometry(0.075, 0.004, 4, 12, Math.PI), WIRE, 0, 0.475, 0, 0, 0, 0);
  add(new THREE.CylinderGeometry(0.004, 0.004, 0.03, 6), WIRE, 0, 0.56, 0);
  add(new THREE.TorusGeometry(0.018, 0.004, 4, 10), WIRE, 0, 0.59, 0, 0, 0, 0);

  const LIGHTS = [{ x: 0, y: CY, z: 0, color: 0xf0a060, intensity: 1.2, range: 3 }];
  finish(THREE, g, LIGHTS);
  return g;
}
function finish(THREE, g, lights) {
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
  g.userData.lights = lights.map((l) => ({ ...l, x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
}
