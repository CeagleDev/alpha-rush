// rooftop_hut — from the rooftops board: the little stair-head huts on the roofs. A 2.4 m rendered
// concrete box (2.2 x 2.0 footprint) with a shallow-pitched tin roof on a timber edge, overhanging
// eaves, a steel door on the front (+Z) with a frame, hinges, a handle and a kick plate, a small
// lit window on the +x side behind bars, a caged bulkhead lamp over the door, a vent grille on the
// back, a downpipe, a drip stain under the sill and a grounding band. userData.lights: one warm at
// the window and one over the door. Base y = 0, centred.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); g.add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (rt, rb, h, s) => new THREE.CylinderGeometry(rt, rb, h, s);
  const WALL = M(0x9a958a, 'plaster');
  const WALL2 = M(0x847f75, 'plaster');
  const STAIN = M(0x4a4a4c, 'plaster', { roughness: 0.92 });
  const GRIME = M(0x37201b, 'plaster');
  const BLACK = M(0x110f12, 'stone', { roughness: 0.95 });
  const TIN = M(0x6a655d, 'metal', { roughness: 0.8, metalness: 0.3, side: DS });
  const TIN2 = M(0x8b6141, 'metal', { roughness: 0.85, metalness: 0.3 });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.2 });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2 });
  const DOOR = M(0x40559f, 'metal', { roughness: 0.8, metalness: 0.3 });     // a blue steel door (palette 'blue sign')
  const DOOR2 = M(0x2f3f78, 'metal', { roughness: 0.85, metalness: 0.3 });
  const GALV = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.3 });
  const TIMBER = M(0x4f2d21, 'timber');
  const CAGE = M(0x3a3a3c, 'metal', { roughness: 0.7, metalness: 0.4 });
  const LIT = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xe3c58c), emissiveIntensity: 1.8, roughness: 0.35 });
  const BULB = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xeee2c8), emissiveIntensity: 2.6, roughness: 0.35 });

  const W = 2.2, D = 2.0, H = 2.15;
  add(B(W, H, D), WALL, 0, H / 2, 0);
  add(B(W + 0.02, 0.08, D + 0.02), BLACK, 0, 0.04, 0);                              // grounding band
  add(B(W + 0.015, 0.25, D + 0.015), STAIN, 0, 0.22, 0);                            // splash grime
  add(B(0.012, 0.8, 0.35), STAIN, W / 2 + 0.004, 1.2, -0.55);                        // a run below the gutter
  add(B(0.4, 1.0, 0.012), WALL2, -0.7, 1.3, D / 2 + 0.004);                          // a patch of newer render
  // roof: pitched tin on a timber fascia, ridge cap, overhanging 0.25 m, gutter along the +x side
  const pitch = 0.12;
  const roof = add(B(W + 0.5, 0.04, D + 0.5), TIN, 0, H + 0.16, 0, 0, 0, -pitch);
  for (let k = 0; k < 8; k++) add(B(0.04, 0.03, D + 0.5), TIN2, -1.2 + k * 0.35, H + 0.19 + (1.2 - k * 0.35) * pitch, 0, 0, 0, -pitch);   // corrugation ribs
  add(B(0.06, 0.06, D + 0.5), RUST, -W / 2 - 0.22, H + 0.32, 0);                    // high edge trim
  add(B(W + 0.5, 0.08, 0.06), TIMBER, 0, H + 0.14, D / 2 + 0.22, 0, 0, -pitch);     // fascias
  add(B(W + 0.5, 0.08, 0.06), TIMBER, 0, H + 0.14, -D / 2 - 0.22, 0, 0, -pitch);
  add(C(0.05, 0.05, D + 0.5, 6), GALV, W / 2 + 0.25, H + 0.0, 0, Math.PI / 2, 0, 0);   // gutter
  add(C(0.035, 0.035, H - 0.2, 6), RUST, W / 2 + 0.22, H / 2 - 0.05, -D / 2 - 0.1);    // downpipe
  add(B(0.10, 0.04, 0.12), RUSTD, W / 2 + 0.16, 1.0, -D / 2 - 0.1);
  // door on +z: frame, leaf, kick plate, hinges, handle, a vent slot, a threshold band
  const dz = D / 2;
  add(B(1.0, 2.0, 0.06), RUSTD, 0.2, 1.0, dz + 0.02);
  add(B(0.88, 1.9, 0.04), DOOR, 0.2, 0.97, dz + 0.04);
  add(B(0.86, 0.5, 0.01), DOOR2, 0.2, 0.30, dz + 0.065);                            // scuffed kick plate
  add(B(0.84, 0.03, 0.012), DOOR2, 0.2, 1.3, dz + 0.066);
  add(B(0.3, 0.12, 0.012), CAGE, 0.2, 1.7, dz + 0.066);                             // louvre vent
  for (let k = 0; k < 4; k++) add(B(0.28, 0.012, 0.01), BLACK, 0.2, 1.66 + k * 0.03, dz + 0.074);
  add(C(0.02, 0.02, 0.12, 6), GALV, 0.55, 1.05, dz + 0.08, Math.PI / 2, 0, 0);       // handle
  add(B(0.05, 0.05, 0.06), GALV, 0.55, 1.05, dz + 0.10);
  for (const y of [0.35, 1.0, 1.65]) add(B(0.04, 0.12, 0.03), RUST, -0.26, y, dz + 0.07);   // hinges
  add(B(1.0, 0.06, 0.1), BLACK, 0.2, 0.03, dz + 0.04);
  // bulkhead lamp over the door: a cage, a glowing glass, a bracket; one warm light
  add(B(0.14, 0.08, 0.06), TIN, 0.2, 2.08, dz + 0.03);
  add(new THREE.SphereGeometry(0.06, 8, 6, 0, Math.PI * 2, 0, Math.PI / 2), BULB, 0.2, 2.08, dz + 0.06, Math.PI / 2, 0, 0);
  for (let k = 0; k < 3; k++) add(new THREE.TorusGeometry(0.075, 0.005, 3, 10, Math.PI), CAGE, 0.2, 2.08, dz + 0.06, Math.PI / 2, k * Math.PI / 3 - Math.PI / 3, 0);
  // window on +x: frame, lit pane, sill, three bars, a stain below
  const wx = W / 2;
  add(B(0.06, 0.62, 0.72), RUSTD, wx + 0.02, 1.35, -0.2);
  add(B(0.02, 0.52, 0.62), LIT, wx + 0.05, 1.35, -0.2);
  add(B(0.08, 0.04, 0.8), WALL2, wx + 0.03, 1.02, -0.2);
  for (const z of [-0.38, -0.2, -0.02]) add(C(0.01, 0.01, 0.58, 5), CAGE, wx + 0.07, 1.35, z);
  add(B(0.012, 0.5, 0.2), STAIN, wx + 0.005, 0.75, -0.2);
  // back (-z): a louvred vent grille and an old sign bracket; -x: conduit and a meter box
  add(B(0.5, 0.35, 0.03), TIN, -0.4, 1.5, -D / 2 - 0.015);
  for (let k = 0; k < 6; k++) add(B(0.46, 0.02, 0.02), BLACK, -0.4, 1.36 + k * 0.055, -D / 2 - 0.035);
  add(B(0.05, 0.05, 0.4), RUST, 0.6, 1.9, -D / 2 - 0.2); add(B(0.05, 0.4, 0.05), RUST, 0.6, 1.7, -D / 2 - 0.38);
  add(B(0.06, 0.28, 0.2), TIN, -W / 2 - 0.03, 1.2, 0.3);
  add(C(0.012, 0.012, 1.1, 6), GALV, -W / 2 - 0.03, 0.6, 0.3);
  add(C(0.012, 0.012, 0.8, 6), GALV, -W / 2 - 0.03, 1.34, 0.7, Math.PI / 2, 0, 0);
  // a broken tile and a dropped bucket by the door (the board's roofs are cluttered)
  add(C(0.14, 0.11, 0.3, 10), M(0x40559f, 'metal', { roughness: 0.85, metalness: 0.2 }), 0.95, 0.15, dz + 0.35);
  add(C(0.13, 0.13, 0.02, 10), BLACK, 0.95, 0.01, dz + 0.35);
  g.userData.lights = [{ x: wx + 0.4, y: 1.35, z: -0.2, color: 0xe3c58c, intensity: 0.6, range: 4.0 }, { x: 0.2, y: 1.95, z: dz + 0.3, color: 0xeee2c8, intensity: 0.5, range: 3.5 }];
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
