// pickup_magnet — midnight-dash power-up pickup (coin magnet).
// Classic horseshoe magnet standing upright, tips UP: a half-torus bend at the bottom, two straight
// legs, bare steel pole tips with bevelled caps, and a thin dark band where the red paint ends.
// Tube section 0.09 m radius, 0.50 m wide, 0.55 m tall. No emissive (the game adds its own glow ring).
export default function (THREE) {
  const g = new THREE.Group();
  const r = 0.09;            // tube radius
  const Rc = 0.16;           // bend centre-line radius
  const yBend = Rc + r;      // height of the bend centre (legs start here)
  const H = 0.55;            // overall height
  const yPaint = 0.415;      // paint ends here
  const band = 0.022;        // dark band height

  const red = new THREE.MeshStandardMaterial({ color: 0xb3261e, roughness: 0.55, metalness: 0.0 }); red.name = 'metal';
  const dark = new THREE.MeshStandardMaterial({ color: 0x3a1512, roughness: 0.7, metalness: 0.1 }); dark.name = 'metal';
  const steel = new THREE.MeshStandardMaterial({ color: 0xb9bec4, roughness: 0.3, metalness: 0.8 }); steel.name = 'metal';

  // The bend: lower half of a torus in the XY plane.
  const bend = new THREE.Mesh(new THREE.TorusGeometry(Rc, r, 16, 24, Math.PI), red);
  bend.rotation.z = Math.PI; bend.position.y = yBend; bend.name = 'bend';
  g.add(bend);

  for (const sx of [-1, 1]) {
    const x = sx * Rc;
    // Painted leg.
    const legH = yPaint - yBend + 0.004;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(r, r, legH, 24, 1, true), red);
    leg.position.set(x, yBend + legH / 2 - 0.002, 0); leg.name = 'leg';
    g.add(leg);
    // Dark band where the paint ends: a shallow lathe collar standing 5 mm proud, bevelled both ways.
    const b = [
      new THREE.Vector2(r - 0.002, 0), new THREE.Vector2(r + 0.005, 0.004),
      new THREE.Vector2(r + 0.005, band - 0.004), new THREE.Vector2(r - 0.002, band),
    ];
    const collar = new THREE.Mesh(new THREE.LatheGeometry(b, 24), dark);
    collar.position.set(x, yPaint, 0); collar.name = 'band';
    g.add(collar);
    // Bare steel pole tip with a bevelled flat cap, one closed lathe.
    const y0 = yPaint + band - 0.002, tipH = H - y0, bv = 0.02;
    const t = [
      new THREE.Vector2(r - 0.003, 0), new THREE.Vector2(r - 0.003, tipH - bv),
      new THREE.Vector2(r - 0.003 - bv * 0.35, tipH - bv * 0.35), new THREE.Vector2(r - 0.003 - bv, tipH),
      new THREE.Vector2(0, tipH),
    ];
    const tip = new THREE.Mesh(new THREE.LatheGeometry(t, 24), steel);
    tip.position.set(x, y0, 0); tip.name = 'tip';
    g.add(tip);
  }

  recentre(THREE, g);
  g.userData.pickup = 'magnet';
  return g;
}

function recentre(THREE, g) {
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
}
