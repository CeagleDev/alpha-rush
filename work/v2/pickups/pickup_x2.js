// pickup_x2 — midnight-dash power-up pickup (score multiplier).
// A thick gold token standing on its edge (faces toward +/-Z, base at y = 0): 0.5 m diameter, 0.07 m
// thick, one LatheGeometry body with a bevelled rim, a flat land and a recessed field, a reeded edge,
// a blue enamel inlay ring, and a raised bold "x2" built from extruded Shapes in deep blue enamel on
// BOTH faces; the back copy is turned half a turn about Y so it reads x2 from behind as well.
// The body material is named 'gold' exactly as tau_coin.js does, so the game applies its gold set.
export default function (THREE) {
  const g = new THREE.Group();
  const R = 0.25, h = 0.035, bevel = 0.01, land = 0.014, recess = 0.004;
  const rf = R - bevel - land;            // recess radius
  const gold = new THREE.MeshStandardMaterial({ color: 0xd8ae70, metalness: 0.85, roughness: 0.35 }); gold.name = 'gold';
  const field = new THREE.MeshStandardMaterial({ color: 0xc39a5c, metalness: 0.8, roughness: 0.45 }); field.name = 'gold';
  const blue = new THREE.MeshStandardMaterial({ color: 0x1d406f, metalness: 0.1, roughness: 0.3 }); blue.name = 'tile';

  const V = (x, y) => new THREE.Vector2(x, y);
  const prof = [
    V(0, -(h - recess)), V(rf, -(h - recess)), V(rf + 0.003, -h), V(R - bevel, -h),
    V(R - bevel * 0.3, -(h - bevel * 0.3)), V(R, -(h - bevel)), V(R, h - bevel),
    V(R - bevel * 0.3, h - bevel * 0.3), V(R - bevel, h), V(rf + 0.003, h), V(rf, h - recess), V(0, h - recess),
  ];
  const body = new THREE.Mesh(new THREE.LatheGeometry(prof, 36), gold);
  body.rotation.x = Math.PI / 2; body.name = 'body';
  g.add(body);

  // Darker field disc, a hair proud of the recess floor so it is what shows in the recess.
  const fieldZ = h - recess + 0.0004;
  const discGeo = new THREE.CircleGeometry(rf - 0.0005, 36);

  // Reeded edge: 24 ribs standing 2 mm off the rim.
  const rib = new THREE.BoxGeometry(0.01, 0.006, 0.046);
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const mesh = new THREE.Mesh(rib, gold);
    mesh.position.set(Math.sin(a) * (R - 0.001), Math.cos(a) * (R - 0.001), 0);
    mesh.rotation.z = -a; mesh.name = 'rib';
    g.add(mesh);
  }

  // ---- glyphs -------------------------------------------------------------------------------
  // "x": two crossed bars as one 12-point polygon. wx x hx, horizontal stroke cut s.
  const wx = 0.15, hx = 0.175, s = 0.058;
  const mX = hx / (wx - s), ny = hx - mX * (wx / 2 - s), nx = (wx + s) / 2;
  const xs = new THREE.Shape();
  xs.moveTo(0, 0); xs.lineTo(s, 0); xs.lineTo(wx / 2, hx - ny); xs.lineTo(wx - s, 0); xs.lineTo(wx, 0);
  xs.lineTo(nx, hx / 2); xs.lineTo(wx, hx); xs.lineTo(wx - s, hx); xs.lineTo(wx / 2, ny); xs.lineTo(s, hx);
  xs.lineTo(0, hx); xs.lineTo(wx - nx, hx / 2); xs.closePath();

  // "2": bowl arc + diagonal + base bar as one outline. W2 x H2, stroke t.
  const W2 = 0.165, H2 = 0.245, t = 0.052;
  const Ro = W2 / 2, Ri = Ro - t, cx = W2 / 2, cy = H2 - Ro;
  const a0 = -35 * Math.PI / 180, a1 = 168 * Math.PI / 180;
  const tx = Math.sin(a0), ty = -Math.cos(a0);              // tangent heading down-left at a0
  const Po = [cx + Ro * Math.cos(a0), cy + Ro * Math.sin(a0)];
  const Pi = [cx + Ri * Math.cos(a0), cy + Ri * Math.sin(a0)];
  const dx = Pi[0], dy = Pi[1] - t, dl = Math.hypot(dx, dy); // diagonal direction (from (0,t) up to Pi)
  const x1 = t * dl / dy;                                     // where the diagonal's lower edge meets the base bar
  const two = new THREE.Shape();
  two.moveTo(0, 0); two.lineTo(W2, 0); two.lineTo(W2, t); two.lineTo(x1, t);
  two.quadraticCurveTo(Po[0] + tx * 0.045, Po[1] + ty * 0.045, Po[0], Po[1]);
  two.absarc(cx, cy, Ro, a0, a1, false);
  two.lineTo(cx + Ri * Math.cos(a1), cy + Ri * Math.sin(a1));
  two.absarc(cx, cy, Ri, a1, a0, true);
  two.quadraticCurveTo(Pi[0] + tx * 0.03, Pi[1] + ty * 0.03, 0, t);
  two.closePath();

  const gap = 0.034, total = wx + gap + W2;
  const ext = { depth: 0.006, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1, curveSegments: 6 };
  const xGeo = new THREE.ExtrudeGeometry(xs, ext); xGeo.translate(-total / 2, -H2 / 2 + 0.004, 0); xGeo.scale(0.87, 0.87, 1);
  const twoGeo = new THREE.ExtrudeGeometry(two, ext); twoGeo.translate(-total / 2 + wx + gap, -H2 / 2 + 0.004, 0); twoGeo.scale(0.87, 0.87, 1);
  // Enamel inlay ring just inside the land.
  const ringGeo = new THREE.RingGeometry(rf - 0.02, rf - 0.006, 36, 1);

  for (const side of [1, -1]) {
    const f = new THREE.Group(); f.name = side > 0 ? 'face_front' : 'face_back';
    const xm = new THREE.Mesh(xGeo, blue); xm.position.z = fieldZ; xm.name = 'glyph_x';
    const tm = new THREE.Mesh(twoGeo, blue); tm.position.z = fieldZ; tm.name = 'glyph_2';
    const ring = new THREE.Mesh(ringGeo, blue); ring.position.z = fieldZ + 0.0012; ring.name = 'ring';
    const disc = new THREE.Mesh(discGeo, field); disc.position.z = fieldZ; disc.name = 'field';
    f.add(xm, tm, ring, disc);
    if (side < 0) f.rotation.y = Math.PI;
    g.add(f);
  }

  recentre(THREE, g);
  g.userData.pickup = 'x2';
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
