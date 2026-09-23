// laundry_rail — ROLL obstacle from the rooftops board: a galvanised steel rail at 1.3 m between two
// posts that stand OUTSIDE the lane (x = ±0.95, 1.96 m overall), with washing thrown over it — two
// towels and a sheet folded over the rail, a shirt and a pair of trousers on wire hangers hooked
// on it, pegs, a mop hung by its head. Hems stop at 0.78 m so a rolling runner passes under the
// cloth. Base y = 0 at the posts' foot plates (authored base-at-ground like awning_strut_low: the
// game boxes it from 1.3 m up). userData.obstacle = { kind: 'roll', lanes: 1 }. Faces +Z.
export default function (THREE) {
  const g = new THREE.Group();
  const DS = THREE.DoubleSide;
  const M = (color, name, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: 0.88, metalness: 0, ...o }); if (name) m.name = name; return m; };
  const add = (geo, mat, x, y, z, rx, ry, rz) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); if (rx || ry || rz) m.rotation.set(rx || 0, ry || 0, rz || 0); g.add(m); return m; };
  const B = (w, h, d) => new THREE.BoxGeometry(w, h, d);
  const C = (rt, rb, h, s, open) => new THREE.CylinderGeometry(rt, rb, h, s, 1, !!open);
  const GALV = M(0x8a8f8f, 'metal', { roughness: 0.7, metalness: 0.4 });
  const RUST = M(0x6e4128, 'metal', { roughness: 0.92, metalness: 0.2 });
  const RUSTD = M(0x37201b, 'metal', { roughness: 0.95, metalness: 0.2 });
  const BLACK = M(0x110f12, 'metal', { roughness: 0.95 });
  const WIRE = M(0x9aa0a3, 'metal', { roughness: 0.5, metalness: 0.4 });
  const PEG = M(0xb99a5e, 'timber', { roughness: 0.8 });
  const SHEET = M(0xd9c9a8, 'fabric', { roughness: 0.95, side: DS });
  const SHEET2 = M(0xbfae8e, 'fabric', { roughness: 0.95, side: DS });
  const TOWEL = M(0x5c6b47, 'fabric', { roughness: 0.95, side: DS });
  const TOWEL2 = M(0x8d6b7a, 'fabric', { roughness: 0.95, side: DS });   // a faded pink one (the board's pinks)
  const DENIM = M(0x6e86a3, 'fabric', { roughness: 0.9, side: DS });
  const SHIRT = M(0xeee2c8, 'fabric', { roughness: 0.9, side: DS });
  const MOP = M(0x8b6141, 'fabric', { roughness: 0.95 });

  const PX = 0.95, RY = 1.30, PH = 1.50, RR = 0.025;
  // posts: lathe tube with a flared foot, on a plate with a grounding band, a cap and a rust collar
  const prof = [[0.05, 0], [0.05, 0.04], [0.032, 0.09], [0.03, PH - 0.03], [0.036, PH - 0.02], [0.036, PH], [0, PH]].map(([r, y]) => new THREE.Vector2(r, y));
  for (const sx of [-1, 1]) {
    add(B(0.24, 0.03, 0.24), BLACK, sx * PX, 0.015, 0);
    add(B(0.20, 0.012, 0.20), RUST, sx * PX, 0.036, 0);
    add(new THREE.LatheGeometry(prof, 10), sx < 0 ? GALV : RUST, sx * PX, 0.03, 0);
    add(C(0.04, 0.04, 0.05, 10), RUSTD, sx * PX, 0.30 + (sx > 0 ? 0.4 : 0), 0);
    add(C(0.045, 0.045, 0.06, 10, true), RUSTD, sx * PX, RY, 0).material.side = DS;          // rail clamp
    add(B(0.06, 0.05, 0.08), GALV, sx * PX, RY, 0.03);
    add(C(0.012, 0.012, 0.014, 6), BLACK, sx * PX, RY, 0.075, Math.PI / 2, 0, 0);
    add(B(0.02, 0.35, 0.02), RUST, sx * (PX - 0.14), RY - 0.19, 0, 0, 0, sx * 0.55);       // knee brace
  }
  // the rail, a sag in the middle (a 3-point tube), and a rust patch
  const rail = new THREE.CatmullRomCurve3([new THREE.Vector3(-PX, RY, 0), new THREE.Vector3(0, RY - 0.02, 0), new THREE.Vector3(PX, RY, 0)]);
  add(new THREE.TubeGeometry(rail, 12, RR, 8, false), GALV, 0, 0, 0);
  add(C(RR + 0.003, RR + 0.003, 0.22, 8, true), RUST, 0.55, RY - 0.005, 0, 0, 0, Math.PI / 2).material.side = DS;
  // cloth folded over the rail: an extruded profile (front drop, over the top, back drop), hem wavy
  const fold = (w, front, back, thick, mat, x, ry, dz) => {
    const s = new THREE.Shape();                  // drawn in (z, y): the drop, over the rail, and down the back
    const t = RR + 0.004;
    s.moveTo(t, RY - front); s.lineTo(t, RY); s.absarc(0, RY, t, 0, Math.PI, false); s.lineTo(-t, RY - back);
    s.lineTo(-t - thick, RY - back); s.lineTo(-t - thick, RY); s.absarc(0, RY, t + thick, Math.PI, 0, true); s.lineTo(t + thick, RY - front); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: w, bevelEnabled: false, curveSegments: 6 });
    geo.rotateY(Math.PI / 2);                       // extrude ran along z; stand it along x
    return add(geo, mat, x - w / 2, 0, dz || 0, 0, ry || 0, 0);
  };
  fold(0.55, 0.52, 0.40, 0.012, SHEET, -0.40, 0.04);
  fold(0.30, 0.45, 0.33, 0.014, TOWEL, 0.02, -0.03);
  fold(0.34, 0.50, 0.28, 0.014, TOWEL2, 0.66, 0.05);
  // wavy hem lines on the drops: thin bands a shade darker
  for (const [x, w, d, m] of [[-0.40, 0.55, RY - 0.51, SHEET2], [0.66, 0.34, RY - 0.49, TOWEL]]) add(B(w, 0.03, 0.04), m, x, d, RR + 0.02);
  // pegs on the rail
  for (const x of [-0.62, -0.18, 0.2, 0.5, 0.82]) { add(B(0.012, 0.07, 0.02), PEG, x, RY + 0.02, 0.0); add(B(0.008, 0.05, 0.024), WIRE, x + 0.012, RY + 0.015, 0); }
  // hangers hooked on the rail: a shirt and a pair of trousers, hung on the -x side and the middle
  const hanger = (x, ry) => { const h = new THREE.Group(); h.position.set(x, RY + 0.03, 0.04); h.rotation.y = ry; g.add(h);
    const hook = new THREE.Mesh(new THREE.TorusGeometry(0.035, 0.004, 3, 7, Math.PI), WIRE); hook.position.set(0, 0, 0); h.add(hook);
    const stem = new THREE.Mesh(C(0.004, 0.004, 0.08, 3), WIRE); stem.position.set(0.035, -0.06, 0); h.add(stem);
    const bar = new THREE.Mesh(B(0.40, 0.006, 0.006), WIRE); bar.position.set(0.035, -0.14, 0); h.add(bar);
    for (const s of [-1, 1]) { const a = new THREE.Mesh(B(0.22, 0.006, 0.006), WIRE); a.position.set(0.035 + s * 0.1, -0.10, 0); a.rotation.z = -s * Math.PI / 4; h.add(a); }
    return h; };
  const shape = (pts) => { const s = new THREE.Shape(); s.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) s.lineTo(pts[i][0], pts[i][1]); s.closePath(); return s; };
  const cloth = (sh, d, mat, x, y, z, ry) => { const geo = new THREE.ExtrudeGeometry(sh, { depth: d, bevelEnabled: false }); geo.translate(0, 0, -d / 2); return add(geo, mat, x, y, z, 0, ry || 0, 0); };
  hanger(-0.72, 0.15);
  const tee = shape([[-0.08, -0.15], [0.08, -0.15], [0.18, -0.19], [0.27, -0.33], [0.20, -0.38], [0.16, -0.32], [0.17, -0.55], [-0.17, -0.55], [-0.16, -0.32], [-0.20, -0.38], [-0.27, -0.33], [-0.18, -0.19]]);
  cloth(tee, 0.04, SHIRT, -0.685, RY + 0.03, 0.04, 0.15);
  add(B(0.10, 0.10, 0.045), SHEET2, -0.65, RY - 0.40, 0.04, 0, 0.15, 0.2);                  // a pocket
  hanger(0.36, -0.12);
  const trs = shape([[-0.14, -0.15], [0.14, -0.15], [0.15, -0.30], [0.13, -0.52], [0.02, -0.52], [0.0, -0.40], [-0.02, -0.51], [-0.13, -0.51], [-0.15, -0.30]]);
  cloth(trs, 0.05, DENIM, 0.395, RY + 0.03, 0.04, -0.12);
  // a mop hung by its head over the rail at the far end
  add(C(0.012, 0.012, 0.42, 6), PEG, 0.86, RY - 0.20, -0.05, 0.12, 0, -0.12);
  add(C(0.05, 0.03, 0.10, 8), MOP, 0.865, RY + 0.03, -0.03);
  for (let k = 0; k < 6; k++) add(C(0.008, 0.005, 0.16, 4), MOP, 0.865 + Math.cos(k) * 0.03, RY + 0.10, -0.03 + Math.sin(k) * 0.03, 0.2 * Math.cos(k * 2), 0, 0.2 * Math.sin(k * 2));

  g.userData.obstacle = { kind: 'roll', lanes: 1 };
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
