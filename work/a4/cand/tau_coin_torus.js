// tau_coin (candidate B: cylinder + torus rim) — midnight-dash pickup.
// A 0.6 m gold coin, 0.07 m thick, standing on its edge (faces toward +/-Z, base at y = 0).
// Body: a fully rounded torus rim (tube radius = half thickness) around a gold land ring and
// a darker recessed tarnish field disc 2.5 mm below the land on both faces.
// Glyph: the exact Bittensor tau from refs/logo/tao_symbol.png (see tauShape below),
// extruded 6 mm proud of the field on BOTH faces, mirrored so it reads correctly from behind.
export default function (THREE) {
  const g = new THREE.Group();
  const R = 0.3, h = 0.035, recess = 0.0025;
  const rr = R - h;                 // torus centre-line radius; outer edge lands at R
  const rf = rr - 0.02;             // recess radius: a 20 mm land between rim and field
  const gold = new THREE.MeshStandardMaterial({ color: 0xd8ae70, metalness: 0.85, roughness: 0.35 }); gold.name = 'metal';
  const tarnish = new THREE.MeshStandardMaterial({ color: 0xa67c46, metalness: 0.8, roughness: 0.5 }); tarnish.name = 'metal';

  const rim = new THREE.Mesh(new THREE.TorusGeometry(rr, h, 12, 48), gold); rim.name = 'rim';
  g.add(rim);
  // Land ring: an open cylinder wall (hidden inside the torus) plus two annuli at the faces.
  const wall = new THREE.Mesh(new THREE.CylinderGeometry(rr, rr, 2 * h, 48, 1, true), gold);
  wall.rotation.x = Math.PI / 2; wall.name = 'land_wall'; g.add(wall);
  const ring = new THREE.RingGeometry(rf - 0.001, rr + 0.002, 48, 1);
  const landF = new THREE.Mesh(ring, gold); landF.position.z = h; landF.name = 'land_front';
  const landB = new THREE.Mesh(ring, gold); landB.position.z = -h; landB.rotation.y = Math.PI; landB.name = 'land_back';
  g.add(landF, landB);
  // Recess step: a short open wall from the field floor up to the land, then the field disc.
  const fieldZ = h - recess;
  const step = new THREE.Mesh(new THREE.CylinderGeometry(rf, rf, 2 * h, 48, 1, true), tarnish);
  step.rotation.x = Math.PI / 2; step.name = 'recess_wall'; step.material.side = THREE.DoubleSide; g.add(step);
  const field = new THREE.Mesh(new THREE.CylinderGeometry(rf, rf, 2 * fieldZ, 48, 1), tarnish);
  field.rotation.x = Math.PI / 2; field.name = 'field'; g.add(field);

  addGlyphs(THREE, g, gold, fieldZ);
  recentre(THREE, g);
  g.userData.pickup = 'coin';
  return g;
}

// The Bittensor tau, traced from refs/logo/tao_symbol.png (298x309 RGBA) by work/a4/trace.py:
// alpha > 127 -> mask, Moore-neighbour boundary walk, 0.35 px outward edge correction,
// Ramer-Douglas-Peucker (0.9 px) corners, least-squares quadratic Beziers merged greedily
// at <= 0.55 px deviation (lines where the control point is within 0.5 px of the chord).
// 22 commands, metres, centred on the coin face, 0.330 m tall (55 % of the 0.6 m face).
// Read from +Z: the bar's rounded shoulder is top-left, the stem's foot hooks to the right.
function tauShape(THREE) {
  const shape = new THREE.Shape();
  shape.moveTo(0.0523, -0.1617);
  shape.lineTo(0.0219, -0.1639);
  shape.quadraticCurveTo(0.0118, -0.1596, 0.0007, -0.1575);
  shape.lineTo(-0.0166, -0.1445);
  shape.lineTo(-0.0272, -0.1254);
  shape.quadraticCurveTo(-0.0266, -0.1181, -0.0294, -0.1123);
  shape.lineTo(-0.0293, 0.1056);
  shape.quadraticCurveTo(-0.0898, 0.1085, -0.1521, 0.1076);
  shape.quadraticCurveTo(-0.1510, 0.1396, -0.1222, 0.1575);
  shape.quadraticCurveTo(-0.1087, 0.1618, -0.0943, 0.1639);
  shape.lineTo(0.1473, 0.1639);
  shape.quadraticCurveTo(0.1506, 0.1647, 0.1522, 0.1614);
  shape.quadraticCurveTo(0.1508, 0.1343, 0.1286, 0.1159);
  shape.lineTo(0.1095, 0.1074);
  shape.quadraticCurveTo(0.0465, 0.1083, -0.0152, 0.1060);
  shape.quadraticCurveTo(0.0095, 0.0988, 0.0250, 0.0766);
  shape.lineTo(0.0314, 0.0597);
  shape.quadraticCurveTo(0.0302, -0.0314, 0.0335, -0.1205);
  shape.lineTo(0.0399, -0.1353);
  shape.lineTo(0.0501, -0.1456);
  shape.lineTo(0.0696, -0.1526);
  shape.lineTo(0.0523, -0.1617);
  shape.closePath();
  return shape;
}

// Both glyphs: extruded 7 mm, sunk 1 mm into the field so the top stands 6 mm proud.
// The back copy is rotated half a turn about Y, so its extrusion runs toward -Z and its
// X is mirrored: viewed from behind (looking along +Z) the tau reads the right way round.
function addGlyphs(THREE, g, mat, fieldZ) {
  const geo = new THREE.ExtrudeGeometry(tauShape(THREE), { depth: 0.007, bevelEnabled: false, curveSegments: 7 });
  const front = new THREE.Mesh(geo, mat); front.position.z = fieldZ - 0.001; front.name = 'glyph_front';
  const back = new THREE.Mesh(geo, mat); back.rotation.y = Math.PI; back.position.z = -(fieldZ - 0.001); back.name = 'glyph_back';
  g.add(front, back);
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
