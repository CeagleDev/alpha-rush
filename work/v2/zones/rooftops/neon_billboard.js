// neon_billboard — from the rooftops board: the big glowing panels on steel frames at the roof
// edges. A 3 m x 2 m lightbox on two braced steel posts with a rear kicker and a service catwalk,
// the face a magenta neon panel with cyan abstract blobs and a neon tube border (no text, lit
// shape only), two dead floodlight arms over the top, a junction box and conduit, rust and a
// grounding band. Panel 1.0-3.0 m up, faces +Z. Base y = 0 at the foot plates, centred.
// userData.lights: one magenta practical in front of the face.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o }); if (name) m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); g.add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (rt, rb, h, s) => new THREE.CylinderGeometry(rt, rb, h, s);
  const STEEL = M(0x4a4a4c, 'metal', { roughness: 0.75 });
  const STEEL2 = M(0x5b6167, 'metal', { roughness: 0.7 });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.2 });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2, side: DS });
  const BLACK = M(0x110f12, 'metal', { roughness: 0.95 });
  const TIN = M(0x6a655d, 'metal', { roughness: 0.8, side: DS });
  const MAG = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xff3fa4), emissiveIntensity: 2.2, roughness: 0.35 });
  const MAG2 = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xd42a86), emissiveIntensity: 1.6, roughness: 0.35 });
  const CYAN = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0x35e6ff), emissiveIntensity: 2.6, roughness: 0.35 });
  const PALE = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xffc8e6), emissiveIntensity: 2.8, roughness: 0.35 });

  const W = 3.0, H = 2.0, Y0 = 1.0, D = 0.16, ZF = 0.10;   // face at z = ZF + D/2
  // posts, foot plates, knee braces, rear kickers, a catwalk under the panel
  for (const sx of [-1, 1]) {
    const x = sx * 1.2;
    add(B(0.3, 0.03, 0.3), BLACK, x, 0.015, 0);
    add(B(0.26, 0.015, 0.26), RUST, x, 0.037, 0);
    add(B(0.10, Y0 + H + 0.1, 0.10), sx < 0 ? STEEL : STEEL2, x, (Y0 + H + 0.1) / 2, 0);
    add(B(0.11, 0.25, 0.11), RUSTD, x, 0.17, 0);                                        // rust at the foot
    add(B(0.06, 1.55, 0.06), STEEL2, x + sx * 0.3, 0.75, -0.62, 0.72, 0, 0);          // rear kicker
    add(B(0.25, 0.03, 0.25), BLACK, x + sx * 0.3, 0.015, -1.25);
    add(B(0.06, 0.06, 0.9), STEEL, x, Y0 - 0.15, -0.5);                                  // catwalk bearer
  }
  add(B(W + 0.3, 0.05, 0.6), TIN, 0, Y0 - 0.18, -0.45);                                 // catwalk: a tin tread with a toe board
  for (let k = 0; k < 8; k++) add(B(0.35, 0.02, 0.02), RUSTD, -1.4 + k * 0.4, Y0 - 0.15, -0.45);
  add(B(W + 0.3, 0.15, 0.03), RUST, 0, Y0 - 0.08, -0.16);
  add(B(W + 0.3, 0.05, 0.05), STEEL, 0, Y0 + 0.65, -0.72);                               // catwalk handrail
  for (const x of [-1.5, 0, 1.5]) add(B(0.04, 0.8, 0.04), STEEL, x, Y0 + 0.25, -0.72);
  add(B(0.06, 0.06, W - 0.2), STEEL2, 0, Y0 + H - 0.08, -0.36, 0, Math.PI / 2, 0);     // top rail behind the panel
  add(B(0.05, Math.hypot(2.4, H), 0.05), STEEL2, 0, Y0 + H / 2, -0.32, 0, 0, Math.atan2(2.4, H));  // diagonal across the back
  // the box: frame ring, tin back, magenta face set 1.5 cm behind a proud bezel
  add(B(W + 0.12, H + 0.12, D), RUSTD, 0, Y0 + H / 2, ZF);
  add(B(W + 0.12, 0.05, D + 0.01), BLACK, 0, Y0 + 0.025, ZF);
  add(B(W, H, 0.012), MAG, 0, Y0 + H / 2, ZF + D / 2 - 0.012);
  add(B(W + 0.16, 0.05, 0.05), RUST, 0, Y0 + H + 0.085, ZF + D / 2 - 0.02);             // bezel top & bottom, proud
  add(B(W + 0.16, 0.05, 0.05), RUST, 0, Y0 - 0.085, ZF + D / 2 - 0.02);
  for (const sx of [-1, 1]) add(B(0.05, H + 0.16, 0.05), RUST, sx * (W / 2 + 0.055), Y0 + H / 2, ZF + D / 2 - 0.02);
  // neon tube border (pale) and a cyan inner line
  const zf = ZF + D / 2 + 0.006;
  add(B(W - 0.2, 0.025, 0.02), PALE, 0, Y0 + H - 0.12, zf); add(B(W - 0.2, 0.025, 0.02), PALE, 0, Y0 + 0.12, zf);
  for (const sx of [-1, 1]) add(B(0.025, H - 0.24, 0.02), PALE, sx * (W / 2 - 0.1), Y0 + H / 2, zf);
  add(B(W - 0.34, 0.012, 0.012), CYAN, 0, Y0 + H - 0.19, zf); add(B(W - 0.34, 0.012, 0.012), CYAN, 0, Y0 + 0.19, zf);
  // abstract blobs (the board's bokeh shapes): cyan discs and a paler ring, magenta darker pools
  for (const [x, y, r] of [[-0.7, 0.55, 0.28], [0.25, 0.3, 0.18], [0.85, 0.9, 0.36], [-0.15, 1.35, 0.14]]) add(new THREE.CylinderGeometry(r, r, 0.008, 18), CYAN, x, Y0 + 0.35 + y, zf, Math.PI / 2, 0, 0);
  add(new THREE.TorusGeometry(0.42, 0.03, 4, 20), PALE, 0.4, Y0 + 1.15, zf);
  for (const [x, y, r] of [[-1.1, 1.3, 0.22], [0.0, 0.8, 0.26], [1.15, 0.35, 0.2]]) add(new THREE.CylinderGeometry(r, r, 0.006, 14), MAG2, x, Y0 + 0.3 + y, zf - 0.002, Math.PI / 2, 0, 0);
  add(B(0.9, 0.06, 0.02), PALE, -0.5, Y0 + 0.62, zf, 0, 0, 0.25);                        // a diagonal neon stroke
  // dead floodlight arms over the top, junction box, conduit down a post, rust streaks on the face frame
  for (const x of [-0.9, 0.9]) {
    add(B(0.05, 0.05, 0.7), STEEL, x, Y0 + H + 0.12, ZF + 0.25, -0.5, 0, 0);
    add(C(0.09, 0.12, 0.2, 8), TIN, x, Y0 + H + 0.18, ZF + 0.55, -2.4, 0, 0);
    add(new THREE.CircleGeometry(0.11, 8), BLACK, x, Y0 + H + 0.13, ZF + 0.53, -2.4 + Math.PI / 2, 0, 0);
  }
  add(B(0.18, 0.14, 0.08), TIN, 1.2, Y0 - 0.4, 0.08);
  add(C(0.012, 0.012, Y0 + H - 0.5, 6), STEEL2, 1.28, (Y0 + H - 0.5) / 2 + 0.2, 0.06);
  for (let i = 0; i < 3; i++) add(B(0.03, 0.4 + i * 0.15, 0.006), RUST, -1.2 + i * 1.1, Y0 + 0.3 + i * 0.4, ZF + D / 2 + 0.002);
  g.userData.lights = [{ x: 0, y: Y0 + H / 2, z: ZF + 0.7, color: 0xff3fa4, intensity: 1.4, range: 7.0 }];
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
