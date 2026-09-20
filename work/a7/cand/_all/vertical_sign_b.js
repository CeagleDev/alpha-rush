// vertical_sign — arm B: profiles. The box shell is one U-channel Shape (open toward +Z)
// extruded 2.4 m up the Y axis so the two sides and the back are a single bent-tin skin;
// the lit acrylic is a second U (front + both sides) of emissive quads inside it. The
// wall fragment is an extruded plaster profile with a broken lower corner; the bracket an
// extruded L-profile with bolt heads. 0.4 × 2.4 × 0.25 m box; userData.mounts = 'back'.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const mk = (color, name, o = {}) => {
    const m = new THREE.MeshStandardMaterial({ color, roughness: 0.85, metalness: 0.3, ...o });
    if (name) m.name = name;
    return m;
  };
  const RUST = mk(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2, side: DS });
  const RUST2 = mk(0x4f2d21, 'metal', { roughness: 0.95, metalness: 0.15 });
  const TIN2 = mk(0x5a554e, 'metal', { roughness: 0.85 });
  const GALV = mk(0x8a8a86, 'metal', { roughness: 0.7, metalness: 0.4, side: DS });
  const BLACK = mk(0x110f12, 'metal', { roughness: 0.9 });
  const WALL = mk(0x8a8378, 'plaster', { roughness: 0.95, metalness: 0 });
  const WOOD = mk(0x4f2d21, 'timber', { roughness: 0.9, metalness: 0 });
  const CREAM = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xd8ae70), emissiveIntensity: 2.4, roughness: 0.35, side: DS });
  const GRIME = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0x8b6141), emissiveIntensity: 1.2, roughness: 0.5, side: DS });
  const RED = new THREE.MeshStandardMaterial({ color: 0x110f12, emissive: new THREE.Color(0xb8302a), emissiveIntensity: 2.0, roughness: 0.35, side: DS });
  const add = (geo, mat, x, y, z, rx, ry, rz) => {
    const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
    if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0);
    g.add(m); return m;
  };
  // an extrusion along +Y: draw the plan (x, -z) and rotate -90 about X so depth runs up
  const upY = (shape, h, mat, y0, opts = {}) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: h, bevelEnabled: false, curveSegments: 3, ...opts });
    geo.rotateX(-Math.PI / 2);          // extrude +z -> +y, shape y -> -z
    return add(geo, mat, 0, y0, 0);
  };
  const W = 0.4, H = 2.4, D = 0.25, Y0 = 0.10, t = 0.025;
  // wall fragment: plaster with a bite out of the lower corner, drawn in plan (x, z)
  const WZ = -0.19;
  const wall = new THREE.Shape();
  wall.moveTo(-0.40, 0.10); wall.lineTo(0.40, 0.10); wall.lineTo(0.40, 0); wall.lineTo(-0.40, 0); wall.lineTo(-0.40, 0.10);
  const wallGeo = new THREE.ExtrudeGeometry(wall, { depth: 2.60, bevelEnabled: false });
  wallGeo.rotateX(-Math.PI / 2);
  add(wallGeo, WALL, 0, 0, WZ - 0.10);
  add(new THREE.BoxGeometry(0.80, 0.06, 0.102), BLACK, 0, 0.03, WZ - 0.05);      // grounding band
  add(new THREE.BoxGeometry(0.18, 0.22, 0.14), BLACK, -0.31, 0.11, WZ - 0.05);    // the broken corner (wear)
  add(new THREE.BoxGeometry(0.14, 2.50, 0.05), WOOD, 0, 1.30, WZ + 0.025);
  // shell: U-channel plan, open to +Z (shape y = -z, so open toward negative shape y)
  const u = new THREE.Shape();
  u.moveTo(-W / 2, -D / 2); u.lineTo(-W / 2, D / 2); u.lineTo(W / 2, D / 2); u.lineTo(W / 2, -D / 2);
  u.lineTo(W / 2 - t, -D / 2); u.lineTo(W / 2 - t, D / 2 - t); u.lineTo(-W / 2 + t, D / 2 - t); u.lineTo(-W / 2 + t, -D / 2); u.lineTo(-W / 2, -D / 2);
  upY(u, H, RUST, Y0);
  // top and bottom plates, front rails
  add(new THREE.BoxGeometry(W, 0.03, D), RUST2, 0, Y0 + H - 0.015, 0);
  add(new THREE.BoxGeometry(W, 0.04, D), BLACK, 0, Y0 + 0.02, 0);
  add(new THREE.BoxGeometry(W, 0.03, 0.03), RUST2, 0, Y0 + H - 0.015, D / 2 - 0.015);
  add(new THREE.BoxGeometry(W - 0.05, H - 0.07, D - 0.06), TIN2, 0, Y0 + H / 2, -0.01);    // core
  // lit acrylic: a U of quads (front + two sides), split into cream / red band / grime
  const ih = H - 0.08, yb = Y0 + 0.04;
  const bands = [[ih * 0.3, GRIME, 0], [0.10, RED, ih * 0.3], [ih * 0.7 - 0.10, CREAM, ih * 0.3 + 0.10]];
  for (const [bh, mat, y] of bands) {
    add(new THREE.PlaneGeometry(W - 2 * t, bh), mat, 0, yb + y + bh / 2, D / 2 - 0.004);
    for (const sx of [-1, 1]) add(new THREE.PlaneGeometry(D - 0.04, bh), mat === RED ? CREAM : mat, sx * (W / 2 - t + 0.002), yb + y + bh / 2, 0, 0, sx * Math.PI / 2, 0);
  }
  // bracket: an L-profile extruded across the width, holes as dark studs, bolts into the batten
  const L = new THREE.Shape();
  L.moveTo(0, 0); L.lineTo(0.22, 0); L.lineTo(0.22, 0.025); L.lineTo(0.025, 0.025); L.lineTo(0.025, 0.14); L.lineTo(0, 0.14); L.lineTo(0, 0);
  const lGeo = new THREE.ExtrudeGeometry(L, { depth: 0.36, bevelEnabled: false });
  lGeo.rotateY(-Math.PI / 2);          // extrude +z -> -x, shape x -> +z (the leg runs out under the box)
  lGeo.translate(0.18, 0, 0);
  add(lGeo, GALV, 0, Y0 - 0.14, WZ + 0.05);
  for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.012, 0.012, 0.03, 6), BLACK, -0.12 + i * 0.08, Y0 - 0.125, WZ + 0.05 + 0.15);
  for (const sx of [-1, 1]) add(new THREE.CylinderGeometry(0.01, 0.01, 0.012, 6), RUST2, sx * 0.05, Y0 - 0.05, WZ + 0.08, Math.PI / 2, 0, 0);
  // top hanger strap
  add(new THREE.BoxGeometry(0.06, 0.03, 0.15), GALV, 0.14, Y0 + H - 0.06, WZ + 0.115);
  add(new THREE.BoxGeometry(0.06, 0.03, 0.15), GALV, -0.14, Y0 + H - 0.06, WZ + 0.115);
  add(new THREE.BoxGeometry(0.40, 0.03, 0.02), GALV, 0, Y0 + H - 0.06, WZ + 0.06);
  // conduit up the wall
  add(new THREE.CylinderGeometry(0.012, 0.012, 1.1, 8), GALV, 0.26, 0.65, WZ + 0.02);
  add(new THREE.CylinderGeometry(0.012, 0.012, 0.18, 8), GALV, 0.26, 1.2, WZ + 0.10, Math.PI / 2, 0, 0);

  g.userData.mounts = 'back';
  finish(THREE, g, [
    { x: 0, y: 0.9, z: 0.35, color: 0xd8ae70, intensity: 1.4, range: 3 },
    { x: 0, y: 2.0, z: 0.35, color: 0xd8ae70, intensity: 1.4, range: 3 },
  ]);
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
