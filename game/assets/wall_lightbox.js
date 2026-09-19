// wall_lightbox — arm B: profiles. The housing is a picture-frame Shape (rect
// with a rect hole) extruded 13 cm; the back skin is a corrugated zigzag
// profile extruded up its height; the red band is a rounded lozenge Shape;
// the wall bracket is an L-section extrusion and the conduit a TubeGeometry
// that loops from the junction box up into the side. 0.9 × 0.6 × 0.15 m,
// mounts 'back', front = +Z, base y = 0.
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
  const TIN = mk(0x6a655d, 'metal', { roughness: 0.8, side: DS });
  const GALV = mk(0x8a8a86, 'metal', { roughness: 0.7, metalness: 0.4, side: DS });
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
  const poly = (pts, holes) => {
    const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath();
    if (holes) for (const h of holes) { const p = new THREE.Path(); p.moveTo(h[0][0], h[0][1]);
      for (let i = 1; i < h.length; i++) p.lineTo(h[i][0], h[i][1]); p.closePath(); s.holes.push(p); }
    return s;
  };
  // bevelEnabled false, always; centred on the sweep
  const ex = (shape, depth, seg = 3) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth, bevelEnabled: false, curveSegments: seg, steps: 1 });
    geo.translate(0, 0, -depth / 2); return geo;
  };

  const W = 0.9, H = 0.6, D = 0.13, zb = -0.055, zf = zb + D;
  // the frame ring, one extrusion, 4 cm rails
  const ring = poly([[-W / 2, 0], [W / 2, 0], [W / 2, H], [-W / 2, H]],
                    [[[-W / 2 + 0.04, 0.04], [-W / 2 + 0.04, H - 0.04], [W / 2 - 0.04, H - 0.04], [W / 2 - 0.04, 0.04]]]);
  add(ex(ring, D), RUST, 0, 0, zb + D / 2);
  // grounding band: bottom rail face, 4 cm
  add(B(W + 0.002, 0.04, D + 0.002), BLACK, 0, 0.02, zb + D / 2);
  // corrugated back skin: zigzag in x–z extruded along y, drawn in (x, z) then rotated up
  // (ribs on the OUTSIDE of the back, between the bracket straps, 2 cm proud)
  const zz = [];
  const n = 14, pitch = (W - 0.08) / n;
  for (let i = 0; i <= n; i++) zz.push([-W / 2 + 0.04 + i * pitch, i % 2 ? 0.02 : 0.006]);
  zz.push([W / 2 - 0.04, 0.0]); zz.push([-W / 2 + 0.04, 0.0]);
  add(ex(poly(zz), H - 0.08), TIN, 0, H / 2, zb, -Math.PI / 2, 0, 0);
  // acrylic: cream face and the rounded red lozenge band, 1.5 cm behind the bezel
  const iw = W - 0.08;
  add(B(iw, H - 0.08 - 0.135, 0.012), CREAM, 0, 0.04 + (H - 0.08 - 0.135) / 2, zf - 0.018);
  const lz = new THREE.Shape();
  const lw = iw - 0.02, lh = 0.11, r = 0.03;
  lz.moveTo(-lw / 2 + r, 0); lz.lineTo(lw / 2 - r, 0); lz.quadraticCurveTo(lw / 2, 0, lw / 2, r);
  lz.lineTo(lw / 2, lh - r); lz.quadraticCurveTo(lw / 2, lh, lw / 2 - r, lh); lz.lineTo(-lw / 2 + r, lh);
  lz.quadraticCurveTo(-lw / 2, lh, -lw / 2, lh - r); lz.lineTo(-lw / 2, r); lz.quadraticCurveTo(-lw / 2, 0, -lw / 2 + r, 0);
  add(ex(lz, 0.014), RED, 0, H - 0.04 - 0.125, zf - 0.017);
  add(B(iw, 0.015, 0.008), TIN, 0, H - 0.04 - 0.135, zf - 0.02);
  // proud bezel: a second thinner ring 2 cm proud
  const bez = poly([[-W / 2, 0], [W / 2, 0], [W / 2, H], [-W / 2, H]],
                   [[[-W / 2 + 0.035, 0.035], [-W / 2 + 0.035, H - 0.035], [W / 2 - 0.035, H - 0.035], [W / 2 - 0.035, 0.035]]]);
  add(ex(bez, 0.03), RUST2, 0, 0, zf - 0.005);
  // wear: rust runs, stains on the acrylic, one dented bottom-left corner (a darker block)
  add(B(0.03, 0.26, 0.004), RUST, -W / 2 + 0.017, 0.3, zf + 0.012);
  add(B(0.035, 0.12, 0.004), RUST, W / 2 - 0.017, 0.38, zf + 0.012);
  add(B(0.10, 0.04, 0.002), STAIN, -0.2, 0.06, zf - 0.011);
  add(B(0.05, 0.09, 0.002), STAIN, 0.33, 0.25, zf - 0.011);
  add(B(0.06, 0.05, 0.034), BLACK, -W / 2 + 0.025, 0.025, zf - 0.004);
  // wall bracket: L-section extruded 0.5 wide, 2 cm proud behind the back
  const L = poly([[0, 0], [0.02, 0], [0.02, 0.05], [0.05, 0.05], [0.05, 0.07], [0, 0.07]]);
  add(ex(L, 0.5), GALV, 0, H - 0.12, zb - 0.02, 0, -Math.PI / 2, 0);
  for (const sx of [-1, 1]) add(B(0.05, 0.36, 0.02), GALV, sx * 0.22, 0.26, zb - 0.01);
  // junction box and a conduit that loops from it up into the side rail
  add(B(0.11, 0.08, 0.02), TIN, 0.26, 0.10, zb - 0.01);
  const path = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0.26, 0.14, zb - 0.012), new THREE.Vector3(0.27, 0.30, zb - 0.014),
    new THREE.Vector3(0.36, 0.40, zb - 0.014), new THREE.Vector3(0.43, 0.36, zb + 0.02)]);
  g.add(new THREE.Mesh(new THREE.TubeGeometry(path, 10, 0.011, 5, false), GALV));
  add(new THREE.CylinderGeometry(0.016, 0.016, 0.03, 6), RUST2, 0.26, 0.15, zb - 0.012);

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
