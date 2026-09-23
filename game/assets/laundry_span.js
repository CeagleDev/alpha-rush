// laundry_span — the board's washing lines strung ACROSS the roof between the parapets: two
// galvanised posts 2.7 m tall (at x = ±3.2, standing on the ledges) with a sagging line between
// them and nine pieces of washing pegged along it — sheets, towels, shirts, a pair of jeans —
// a second slack line with pegs only, a tie-off cleat and a coil of spare cord on one post.
// The posts stand on the 0.9 m ledges (zone.js places this at y = 0.9), the line ties at 2.82 and
// sags 0.22, the longest drop is 0.55, so every hem is >= 2.05 above the post feet = 2.95 over the
// roof, above a jumping runner's head (2.7 m). mounts left/right (the post feet are the ends).
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.9, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); g.add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (rt, rb, h, s) => new THREE.CylinderGeometry(rt, rb, h, s);
  const hash = (i, j) => { const s = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453; return s - Math.floor(s); };
  const GALV = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.4 });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.2 });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2 });
  const BLACK = M(0x110f12, 'metal', { roughness: 0.95 });
  const CORD = M(0xb8b0a0, 'fabric', { roughness: 0.9 });
  const PEG = M(0xb99a5e, 'timber', { roughness: 0.8 });
  const CLOTH = [M(0xd9c9a8, 'fabric', { side: DS }), M(0xeee2c8, 'fabric', { side: DS }), M(0x6e86a3, 'fabric', { side: DS }), M(0x5c6b47, 'fabric', { side: DS }),
    M(0x8d6b7a, 'fabric', { side: DS }), M(0x2a2a2e, 'fabric', { side: DS }), M(0xbfae8e, 'fabric', { side: DS }), M(0x9accf2, 'fabric', { side: DS })];

  const PX = 3.2, PH = 2.9, LY = 2.82;   // line tie height on the posts
  for (const sx of [-1, 1]) {
    add(B(0.26, 0.03, 0.26), BLACK, sx * PX, 0.015, 0);
    add(B(0.22, 0.012, 0.22), RUST, sx * PX, 0.036, 0);
    add(C(0.03, 0.04, PH, 8), sx < 0 ? GALV : RUST, sx * PX, PH / 2, 0);
    add(C(0.035, 0.035, 0.05, 8), RUSTD, sx * PX, 0.3, 0);
    add(C(0.045, 0.045, 0.03, 8), GALV, sx * PX, PH, 0);                                    // cap
    add(B(0.03, 0.9, 0.03), RUST, sx * (PX - 0.2), 0.5, 0, 0, 0, sx * 0.4);                // knee brace
    add(B(0.06, 0.03, 0.08), GALV, sx * (PX - 0.04), LY, 0);                               // cleat
    add(B(0.06, 0.03, 0.08), GALV, sx * (PX - 0.04), LY - 0.35, 0);
  }
  add(new THREE.TorusGeometry(0.06, 0.02, 5, 10), CORD, PX - 0.05, 1.2, 0, 0, Math.PI / 2, 0);    // spare cord coil
  // two lines: a catenary sagging 0.22 m (the loaded one) and a slack empty one behind it
  const cat = (sag, z, y) => new THREE.CatmullRomCurve3([-PX, -PX * 0.5, 0, PX * 0.5, PX].map((x) => new THREE.Vector3(x, y - sag * (1 - (x / PX) ** 2), z)));
  const line = cat(0.22, 0, LY), line2 = cat(0.3, -0.35, LY - 0.35);
  add(new THREE.TubeGeometry(line, 24, 0.008, 4, false), CORD, 0, 0, 0);
  add(new THREE.TubeGeometry(line2, 24, 0.007, 4, false), CORD, 0, 0, 0);
  for (let k = 0; k < 7; k++) { const p = line2.getPoint(0.12 + k * 0.125); add(B(0.012, 0.06, 0.02), PEG, p.x, p.y - 0.02, p.z, 0, 0, (hash(k, 9) - 0.5) * 0.3); }
  // washing: flat pieces hung from the line, each an extruded outline, with two pegs at the top.
  // widths, drops (the hem stays >= 2.05 above the base: 2.82 - 0.22 sag - 0.55 = 2.05)
  const shape = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath(); return s; };
  const pieces = [
    [0.55, 0.52, 'sheet'], [0.34, 0.45, 'towel'], [0.42, 0.55, 'shirt'], [0.30, 0.55, 'jeans'], [0.58, 0.5, 'sheet'], [0.32, 0.4, 'towel'], [0.4, 0.55, 'shirt'], [0.36, 0.48, 'towel'], [0.5, 0.5, 'sheet']];
  let t = 0.09;
  pieces.forEach(([w, drop, kind], k) => {
    const p = line.getPoint(t); t += 0.1;
    const mat = CLOTH[Math.floor(hash(k, 3) * CLOTH.length)];
    let sh;
    if (kind === 'sheet') { sh = new THREE.Shape(); sh.moveTo(-w / 2, 0); sh.lineTo(w / 2, 0); sh.lineTo(w / 2 - 0.02, -drop + 0.06); sh.quadraticCurveTo(0, -drop - 0.03, -w / 2 + 0.02, -drop + 0.05); sh.closePath(); }
    else if (kind === 'towel') { sh = shape([[-w / 2, 0], [w / 2, 0], [w / 2, -drop], [w / 4, -drop + 0.03], [0, -drop], [-w / 4, -drop + 0.02], [-w / 2, -drop]]); }
    else if (kind === 'shirt') { sh = shape([[-w / 2, 0], [w / 2, 0], [w / 2, -0.12], [w * 0.36, -0.14], [w * 0.38, -drop], [-w * 0.38, -drop], [-w * 0.36, -0.14], [-w / 2, -0.12]]); }
    else { sh = shape([[-w / 2, 0], [w / 2, 0], [w / 2, -drop * 0.35], [w * 0.42, -drop], [w * 0.1, -drop], [0, -drop * 0.45], [-w * 0.1, -drop], [-w * 0.42, -drop], [-w / 2, -drop * 0.35]]); }
    const geo = new THREE.ExtrudeGeometry(sh, { depth: 0.02 + hash(k, 5) * 0.02, bevelEnabled: false, curveSegments: 5 });
    const o = add(geo, mat, p.x, p.y + 0.01, p.z - 0.01, (hash(k, 6) - 0.5) * 0.25, (hash(k, 7) - 0.5) * 0.3, (hash(k, 8) - 0.5) * 0.08);
    for (const s of [-1, 1]) add(B(0.012, 0.06, 0.022), PEG, p.x + s * (w / 2 - 0.05), p.y + 0.02, p.z, 0, 0, s * 0.1);
    if (kind === 'sheet') add(B(w * 0.6, 0.03, 0.03), CLOTH[6], p.x, p.y - drop * 0.5, p.z + 0.015, 0, 0, 0.05);   // a fold line
    void o;
  });
  g.userData.mounts = ['left', 'right'];
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
