// roof_water_tank — the game's rooftop_water_tank family (galvanised tank on a rusty four-leg
// stand with ring beams and X braces), rebuilt from the rooftops board at 2.4 m: a 1.4 m dia tank
// with a conical lid, hoop bands and a filler cap, on a 0.8 m stand, with a fixed ladder up one
// side to a top rung at the lid, a hopper and outlet pipe under, an overflow down a leg, rust runs,
// moss on the shaded beams and a grounding band at the foot plates. Base y = 0, centred.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); g.add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (rt, rb, h, s, open) => new THREE.CylinderGeometry(rt, rb, h, s, 1, !!open);
  const galv = M(0x8a8f8f, 'metal', { roughness: 0.72, metalness: 0.3 });
  const galvDirty = M(0x7a7b72, 'metal', { roughness: 0.8, metalness: 0.3 });
  const galvDk = M(0x6f7477, 'metal', { roughness: 0.75, metalness: 0.3, side: DS });
  const rust = M(0x8b4a22, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rust2 = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.3 });
  const rustDk = M(0x37201b, 'metal', { roughness: 0.94, metalness: 0.3 });
  const moss = M(0x4a5a2a, 'foliage', { roughness: 0.95 });
  const dark = M(0x110f12, 'metal', { roughness: 0.9 });

  const L = 0.55, LT = 0.80;
  for (const sx of [-1, 1]) for (const sz of [-1, 1]) {
    add(B(0.2, 0.03, 0.2), dark, sx * L, 0.015, sz * L);
    add(B(0.10, LT - 0.03, 0.10), sx * sz > 0 ? rust : rust2, sx * L, 0.03 + (LT - 0.03) / 2, sz * L);
    add(B(0.11, 0.16, 0.11), rustDk, sx * L, 0.11, sz * L);
  }
  for (const s of [-1, 1]) {
    add(B(2 * L + 0.1, 0.10, 0.10), rust, 0, LT - 0.05, s * L);
    add(B(0.10, 0.10, 2 * L + 0.1), rust2, s * L, LT - 0.05, 0);
    const bl = Math.hypot(2 * L - 0.15, LT - 0.35), ang = Math.atan2(LT - 0.35, 2 * L - 0.15);
    add(B(bl, 0.05, 0.02), rust2, 0, 0.2 + (LT - 0.35) / 2, s * (L + 0.05), 0, 0, ang);
    add(B(bl, 0.05, 0.02), rust, 0, 0.2 + (LT - 0.35) / 2, s * (L + 0.05), 0, 0, -ang);
    add(B(0.02, 0.05, bl), rust2, s * (L + 0.05), 0.2 + (LT - 0.35) / 2, 0, ang, 0, 0);
    add(B(0.02, 0.05, bl), rust, s * (L + 0.05), 0.2 + (LT - 0.35) / 2, 0, -ang, 0, 0);
  }
  add(B(0.3, 0.02, 0.05), moss, -0.4, LT + 0.005, 0.5); add(B(0.12, 0.02, 0.06), moss, 0.45, LT + 0.005, -0.5);
  // tank
  const R = 0.70, TB = LT + 0.02, TH = 1.25;
  add(C(R, R, TH, 16), galv, 0, TB + TH / 2, 0);
  add(C(R + 0.004, R + 0.004, 0.2, 16, true), galvDirty, 0, TB + 0.1, 0);
  add(C(R, 0.18, 0.4, 16, true), galvDk, 0, TB - 0.2, 0);
  add(C(0.18, 0.18, 0.02, 16), galvDk, 0, TB - 0.4, 0);
  for (const y of [TB + 0.04, TB + 0.55, TB + 1.05]) add(new THREE.TorusGeometry(R + 0.01, 0.02, 4, 16), rust2, 0, y, 0, Math.PI / 2, 0, 0);
  add(C(0.08, R + 0.04, 0.16, 16), galvDirty, 0, TB + TH + 0.08, 0);                    // conical lid
  add(new THREE.TorusGeometry(R + 0.03, 0.022, 4, 16), rust, 0, TB + TH + 0.01, 0, Math.PI / 2, 0, 0);
  const tilt = Math.atan2(0.16, R - 0.05);
  for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; add(B(0.64, 0.02, 0.03), rustDk, Math.cos(a) * 0.38, TB + TH + 0.085, -Math.sin(a) * 0.38, 0, a, -tilt); }
  add(C(0.10, 0.10, 0.05, 10), rust2, 0, TB + TH + 0.18, 0);                          // filler cap
  add(C(0.04, 0.04, 0.08, 8), galvDk, 0.28, TB + TH + 0.12, 0.22);                   // vent stub
  for (const [a, h, y] of [[0.3, 0.8, 0.4], [1.5, 0.45, 0.25], [2.7, 0.9, 0.5], [4.2, 0.6, 0.3]]) add(B(0.04, h, 0.008), rust2, Math.sin(a) * (R + 0.004), TB + y, Math.cos(a) * (R + 0.004), 0, a, 0);
  add(B(0.12, 0.10, 0.006), rustDk, Math.sin(2.2) * (R + 0.006), TB + 0.75, Math.cos(2.2) * (R + 0.006), 0, 2.2, 0);   // patch plate
  // ladder up the +z side: two stringers from the roof to the lid, rungs, hoops at the top, a bracket to the tank
  const LZ = R + 0.22, LH = TB + TH + 0.05;
  for (const sx of [-1, 1]) add(C(0.02, 0.02, LH, 6), galv, sx * 0.2, LH / 2, LZ);
  for (const sx of [-1, 1]) add(B(0.08, 0.03, 0.08), dark, sx * 0.2, 0.015, LZ);
  for (let y = 0.3; y < LH - 0.05; y += 0.3) add(C(0.012, 0.012, 0.42, 6), y > 1.5 ? galv : rust2, 0, y, LZ, 0, 0, Math.PI / 2);
  for (const y of [LT + 0.2, TB + 0.9]) add(B(0.04, 0.04, 0.24), rust, 0.2, y, LZ - 0.12);   // standoff brackets to the stand/tank
  add(new THREE.TorusGeometry(0.22, 0.012, 4, 10, Math.PI), galv, 0, LH, LZ, 0, 0, 0);   // hoop at the top, a grab
  // pipework: outlet from the hopper, overflow out the top down past a leg
  add(C(0.04, 0.04, 0.3, 8), galvDk, 0, TB - 0.55, 0);
  add(new THREE.TorusGeometry(0.07, 0.04, 6, 8, Math.PI / 2), galvDk, 0.07, TB - 0.7, 0, 0, 0, Math.PI);
  add(C(0.04, 0.04, 0.5, 8), galvDk, 0.38, TB - 0.77, 0, 0, 0, Math.PI / 2);
  add(C(0.05, 0.05, 0.04, 8), rust2, 0.25, TB - 0.77, 0, 0, 0, Math.PI / 2);
  const PX = L + 0.09, PZ = -(L - 0.08);
  add(C(0.025, 0.025, 0.28, 8), galv, R - 0.08, TB + 1.0, PZ, 0, 0, Math.PI / 2);
  add(new THREE.TorusGeometry(0.05, 0.025, 6, 8, Math.PI / 2), galv, PX - 0.05, TB + 0.95, PZ, 0, 0, 0);
  add(C(0.025, 0.025, TB + 0.95 - 0.02, 8), galv, PX, (TB + 0.95) / 2, PZ);
  for (const y of [0.3, 0.9, 1.5]) add(B(0.07, 0.04, 0.09), rustDk, PX - 0.04, y, PZ);
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
