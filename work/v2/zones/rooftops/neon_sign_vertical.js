// neon_sign_vertical — from the rooftops board: the tall cyan strip signs on the building faces.
// A 2.5 m x 0.4 m x 0.14 m steel housing with a tin back, a proud bezel, a cyan neon tube running
// round the border and five abstract strokes inside (bars, a ring, a chevron — no text), mounted
// off the wall on two L-brackets with a conduit and junction box, rust runs down the housing and a
// grounding band. Faces +Z, mounts 'back'. Base y = 0 at the housing foot. userData.lights: cyan.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o }); if (name) m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); g.add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2, side: DS });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.2 });
  const TIN = M(0x6a655d, 'metal', { roughness: 0.8, side: DS });
  const GALV = M(0x8a8a86, 'metal', { roughness: 0.7, metalness: 0.4 });
  const BLACK = M(0x110f12, 'metal', { roughness: 0.9 });
  const FACE = M(0x1a1c22, 'metal', { roughness: 0.5, metalness: 0.2 });   // the dark acrylic behind the tubes
  const CYAN = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0x35e6ff), emissiveIntensity: 2.6, roughness: 0.35 });
  const CYAN2 = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0x1fb4d6), emissiveIntensity: 1.6, roughness: 0.35 });
  const PALE = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xd8fbff), emissiveIntensity: 3.0, roughness: 0.35 });

  const W = 0.40, H = 2.5, D = 0.14, ZB = 0.05;         // housing from z = ZB-D/2 .. ZB+D/2, brackets behind
  add(B(W, H, D), RUSTD, 0, H / 2, ZB);
  add(B(W + 0.01, 0.05, D + 0.01), BLACK, 0, 0.025, ZB);                     // grounding band
  add(B(W - 0.06, H - 0.06, 0.01), FACE, 0, H / 2, ZB + D / 2 - 0.004);
  add(B(W + 0.03, 0.04, 0.04), RUST, 0, H + 0.005, ZB + D / 2 - 0.01);        // bezel rails, proud
  add(B(W + 0.03, 0.04, 0.04), RUST, 0, -0.005 + 0.02, ZB + D / 2 - 0.01);
  for (const sx of [-1, 1]) add(B(0.04, H + 0.04, 0.04), RUST, sx * (W / 2 + 0.005), H / 2, ZB + D / 2 - 0.01);
  // corrugated tin back with 9 ribs
  for (let k = 0; k < 9; k++) add(B(0.02, H - 0.1, 0.016), TIN, -0.16 + k * 0.04, H / 2, ZB - D / 2 - 0.006);
  // the neon: border tube, then strokes
  const zf = ZB + D / 2 + 0.008;
  add(B(0.018, H - 0.16, 0.018), CYAN, -W / 2 + 0.06, H / 2, zf); add(B(0.018, H - 0.16, 0.018), CYAN, W / 2 - 0.06, H / 2, zf);
  add(B(W - 0.12, 0.018, 0.018), CYAN, 0, H - 0.08, zf); add(B(W - 0.12, 0.018, 0.018), CYAN, 0, 0.08, zf);
  add(B(0.20, 0.025, 0.02), PALE, 0, H - 0.35, zf);                            // strokes: a bar
  add(new THREE.TorusGeometry(0.09, 0.012, 4, 14), PALE, 0, H - 0.72, zf);     // a ring
  add(B(0.16, 0.022, 0.02), CYAN, -0.02, H - 1.05, zf, 0, 0, 0.6);             // a chevron
  add(B(0.16, 0.022, 0.02), CYAN, -0.02, H - 1.05, zf, 0, 0, -0.6);
  add(B(0.025, 0.36, 0.02), PALE, 0.06, H - 1.55, zf);                         // a tall stroke and a dot
  add(B(0.025, 0.2, 0.02), CYAN2, -0.07, H - 1.5, zf);
  add(new THREE.CylinderGeometry(0.03, 0.03, 0.02, 10), PALE, 0, H - 1.95, zf, Math.PI / 2, 0, 0);
  add(B(0.22, 0.022, 0.02), CYAN2, 0, H - 2.2, zf);
  // the "dead" segment: one border piece unlit
  add(B(0.018, 0.4, 0.019), FACE, W / 2 - 0.06, 0.5, zf + 0.001);
  // brackets: two L-sections off the back, a conduit and a junction box
  for (const y of [0.35, H - 0.35]) { add(B(0.05, 0.05, 0.16), GALV, 0.08, y, ZB - D / 2 - 0.08); add(B(0.05, 0.14, 0.03), GALV, 0.08, y, ZB - D / 2 - 0.15); add(new THREE.CylinderGeometry(0.01, 0.01, 0.02, 6), BLACK, 0.08, y + 0.04, ZB - D / 2 - 0.165, Math.PI / 2, 0, 0); }
  add(new THREE.CylinderGeometry(0.012, 0.012, H - 0.5, 6), GALV, -0.12, H / 2 - 0.1, ZB - D / 2 - 0.02);
  add(B(0.10, 0.08, 0.05), TIN, -0.12, 0.2, ZB - D / 2 - 0.03);
  // rust runs down the face bezel and the side
  add(B(0.03, 0.5, 0.004), RUST, -W / 2 + 0.02, H - 0.5, ZB + D / 2 + 0.006);
  add(B(0.004, 0.7, 0.05), RUST, W / 2 + 0.002, 0.8, ZB);
  g.userData.mounts = 'back';
  g.userData.lights = [{ x: 0, y: H / 2, z: ZB + 0.45, color: 0x35e6ff, intensity: 1.0, range: 5.5 }];
  place(THREE, g);
  return g;
}
function place(THREE, g) {
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  if (g.userData.lights) g.userData.lights.forEach((l) => { l.x -= c.x; l.y -= box.min.y; l.z -= c.z; });
}
