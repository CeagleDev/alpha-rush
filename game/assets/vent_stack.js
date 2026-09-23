// vent_stack — from the rooftops board: the stubby ventilation stacks on the roofs. A 0.32 m
// galvanised pipe 1.6 m tall on a square concrete curb with a flashing skirt, two guy braces to
// foot plates, a conical rain cowl on three struts, a bird-mesh band, a rust ring at every joint
// and a sooty streak down the leeward side. Base y = 0, centred.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); g.add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (rt, rb, h, s, open) => new THREE.CylinderGeometry(rt, rb, h, s, 1, !!open);
  const GALV = M(0x8a8f8f, 'metal', { roughness: 0.72, metalness: 0.3 });
  const GALV2 = M(0x767b7c, 'metal', { roughness: 0.78, metalness: 0.3, side: DS });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.2 });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2 });
  const CONC = M(0x8a8378, 'stone', { roughness: 0.9 });
  const BLACK = M(0x110f12, 'stone', { roughness: 0.95 });
  const SOOT = M(0x231718, 'metal', { roughness: 0.95 });
  const MESH = M(0x4a4a4c, 'metal', { roughness: 0.7, metalness: 0.4, side: DS });

  const R = 0.16;
  add(B(0.6, 0.22, 0.6), CONC, 0, 0.11, 0);                                 // curb
  add(B(0.62, 0.05, 0.62), BLACK, 0, 0.025, 0);
  add(C(R + 0.08, R + 0.14, 0.10, 12), GALV2, 0, 0.27, 0);                  // flashing skirt
  add(C(R, R, 1.10, 12), GALV, 0, 0.22 + 0.55, 0);                          // pipe
  add(C(R + 0.004, R + 0.004, 0.06, 12, true), RUST, 0, 0.78, 0);           // joint rings
  add(C(R + 0.004, R + 0.004, 0.06, 12, true), RUST, 0, 1.2, 0);
  add(C(R + 0.006, R + 0.006, 0.12, 12, true), MESH, 0, 1.28, 0);           // bird-mesh band under the cowl
  add(B(0.05, 0.9, 0.006), SOOT, 0, 0.75, R + 0.003, 0, 0, 0);              // soot streak
  add(B(0.08, 0.3, 0.006), RUSTD, 0, 0.45, -R - 0.003);
  add(C(R - 0.02, R - 0.02, 0.02, 12), BLACK, 0, 1.335, 0);                 // the dark throat
  for (let k = 0; k < 3; k++) { const a = k * Math.PI * 2 / 3; add(C(0.012, 0.012, 0.26, 5), GALV, Math.cos(a) * (R - 0.03), 1.45, Math.sin(a) * (R - 0.03)); }
  add(C(0.02, R + 0.12, 0.16, 12), GALV2, 0, 1.53, 0);                      // cowl
  add(new THREE.TorusGeometry(R + 0.12, 0.012, 4, 12), RUST, 0, 1.45, 0, Math.PI / 2, 0, 0);
  add(C(0.03, 0.03, 0.05, 8), RUST, 0, 1.6, 0);
  // guy braces: two flat bars from a collar to foot plates
  for (const s of [-1, 1]) {
    const P = new THREE.Vector3(s * 0.42, 0.03, 0.30), Q = new THREE.Vector3(s * (R + 0.01), 1.05, 0.05), d = Q.clone().sub(P);
    const b = add(B(0.03, d.length(), 0.008), RUST, 0, 0, 0); b.position.copy(P.clone().add(Q).multiplyScalar(0.5)); b.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    add(B(0.12, 0.02, 0.12), BLACK, P.x, 0.01, P.z); add(B(0.1, 0.012, 0.1), RUSTD, P.x, 0.026, P.z);
  }
  add(C(R + 0.01, R + 0.01, 0.05, 12, true), RUSTD, 0, 1.05, 0);            // brace collar
  g.userData.lights = [];
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
