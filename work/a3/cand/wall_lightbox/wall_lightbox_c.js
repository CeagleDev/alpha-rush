// wall_lightbox — arm C: a different breakdown. Read as a hinged sign door on
// a wall pan: the deep pan carries a drip hood along the top, two hinge
// knuckles on the right, a latch on the left and bottom vent slots; the lit
// door is a separate proud rim with the cream acrylic and a red cap strip set
// into it. Bracket: wall channel with two gussets; conduit riser and flex loop.
// 0.9 × 0.6 × 0.15 m, mounts 'back', front = +Z, base y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2 });
  const RUST2 = mk(0x4f2d21, 'metal', { roughness: 0.95, metalness: 0.15 });
  const TIN = mk(0x6a655d, 'metal', { roughness: 0.8 });
  const TIN2 = mk(0x57524b, 'metal', { roughness: 0.85 });
  const GALV = mk(0x8a8a86, 'metal', { roughness: 0.7, metalness: 0.4 });
  const BLACK = mk(0x110f12, 'metal', { roughness: 0.9 });
  const STAIN = mk(0x8b6141, 'plaster', { roughness: 0.95, metalness: 0 });
  const CREAM = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xd8ae70), emissiveIntensity: 2.4, roughness: 0.35 });
  const RED = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xb8302a), emissiveIntensity: 2.0, roughness: 0.35 });

  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);

  const W = 0.9, H = 0.6;
  const zb = -0.055;                 // pan back; bracket 2 cm behind
  const PD = 0.09;                   // pan depth
  const zp = zb + PD;                // pan front
  // pan: back plate, side walls, bottom wall
  add(B(W, H, 0.02), TIN2, 0, H / 2, zb + 0.01);
  for (const sx of [-1, 1]) add(B(0.03, H, PD), RUST, sx * (W / 2 - 0.015), H / 2, zb + PD / 2);
  add(B(W, 0.03, PD), RUST2, 0, H - 0.015, zb + PD / 2);
  add(B(W, 0.04, PD), BLACK, 0, 0.02, zb + PD / 2);                    // grounding band
  // drip hood along the top, overhanging the door
  add(B(W + 0.02, 0.03, 0.15), RUST, 0, H - 0.015, zb + 0.075);
  // the lit door: a proud rim 4 cm deep standing 1 cm in from the pan edges
  const dw = W - 0.06, dh = H - 0.08, dz = zp;
  add(B(dw, 0.035, 0.04), RUST2, 0, 0.04 + dh - 0.0175, dz + 0.02);
  add(B(dw, 0.035, 0.04), RUST, 0, 0.04 + 0.0175, dz + 0.02);
  for (const sx of [-1, 1]) add(B(0.035, dh, 0.04), sx < 0 ? RUST : RUST2, sx * (dw / 2 - 0.0175), 0.04 + dh / 2, dz + 0.02);
  // acrylic set 1 cm into the rim: cream field, red cap strip, a dark divider
  const iw = dw - 0.07;
  add(B(iw, 0.10, 0.012), RED, 0, 0.04 + dh - 0.035 - 0.05, dz + 0.024);
  add(B(iw, 0.012, 0.012), TIN2, 0, 0.04 + dh - 0.035 - 0.106, dz + 0.022);
  const ch = dh - 0.07 - 0.112;
  add(B(iw, ch, 0.012), CREAM, 0, 0.04 + 0.035 + ch / 2, dz + 0.024);
  // grime: stain patches proud 1 mm, a soot smear under the hood
  add(B(0.16, 0.04, 0.002), STAIN, -0.22, 0.09, dz + 0.031);
  add(B(0.07, 0.10, 0.002), STAIN, 0.30, 0.22, dz + 0.031);
  add(B(0.3, 0.02, 0.002), STAIN, 0.05, 0.04 + dh - 0.15, dz + 0.031);
  // hinge knuckles on the right, latch on the left
  for (const y of [0.16, 0.44]) add(new THREE.CylinderGeometry(0.014, 0.014, 0.08, 6), GALV, W / 2 - 0.02, y, dz + 0.03);
  add(B(0.03, 0.06, 0.02), GALV, -W / 2 + 0.008, 0.30, dz + 0.035);
  add(B(0.05, 0.015, 0.012), TIN, -W / 2 + 0.02, 0.30, dz + 0.045);
  // rust runs and a chipped hood corner
  add(B(0.03, 0.20, 0.004), RUST, -0.32, 0.30, dz + 0.042);
  add(B(0.025, 0.14, 0.004), RUST2, 0.36, 0.20, dz + 0.042);
  add(B(0.06, 0.03, 0.15), BLACK, -W / 2 + 0.02, H - 0.015, zb + 0.076);
  // bottom vent slots, recessed dark
  for (let i = 0; i < 5; i++) add(B(0.08, 0.012, 0.004), BLACK, -0.24 + i * 0.12, 0.06, dz + 0.001);
  // back: wall channel and gussets, junction box, conduit riser with a flex loop
  add(B(0.56, 0.05, 0.02), GALV, 0, H - 0.10, zb - 0.01);
  for (const sx of [-1, 1]) add(B(0.05, 0.34, 0.02), GALV, sx * 0.23, 0.28, zb - 0.01);
  add(B(0.10, 0.07, 0.02), TIN, -0.24, 0.09, zb - 0.01);
  add(new THREE.CylinderGeometry(0.011, 0.011, 0.28, 6), GALV, -0.24, 0.27, zb - 0.012);
  add(new THREE.TorusGeometry(0.05, 0.011, 4, 8, Math.PI), GALV, -0.19, 0.41, zb - 0.012);
  add(new THREE.CylinderGeometry(0.011, 0.011, 0.12, 6), GALV, -0.14, 0.35, zb - 0.012);

  g.userData.mounts = 'back';
  const LIGHTS = [{ x: 0, y: 0.3, z: 0.35, color: 0xd8ae70, intensity: 1.2, range: 3.0 }];
  // ---- the six lines ----------------------------------------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3(), m = new THREE.Matrix4(), im = new THREE.Matrix4();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    const put = (mat) => { for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(mat)); };
    if (n.isInstancedMesh) { for (let c = 0; c < n.count; c++) { n.getMatrixAt(c, im); put(m.multiplyMatrices(n.matrixWorld, im)); } return; }
    put(n.matrixWorld); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  g.userData.lights = LIGHTS.map((l) => ({ ...l, x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
  return g;
}
