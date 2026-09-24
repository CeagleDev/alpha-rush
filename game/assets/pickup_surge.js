// pickup_surge — midnight-dash power-up pickup (Alpha Surge).
// A floating badge 0.6 m tall standing on its edge (faces toward +/-Z, base at y = 0): a thin dark
// metal ring (torus) around a thin dark plate, carrying a bold lower-case Greek alpha built from ONE
// extruded Shape with a bevelled edge, in polished gold, pierced diagonally by a bevelled lightning
// bolt in glowing cyan enamel. The alpha is extruded once per face and the back copy is turned half a
// turn about Y so the glyph reads the right way round from behind; the plate between them is what
// stops each face's glyph showing through as a ghost on the other. The bolt is symmetric under that
// turn, so one thick extrusion through the middle serves both faces.
// The body material is named 'gold' exactly as tau_coin.js does, so the game applies its gold set.
export default function (THREE) {
  const g = new THREE.Group();

  const gold = new THREE.MeshStandardMaterial({ color: 0xe2b95e, metalness: 0.85, roughness: 0.3 }); gold.name = 'gold';
  const dark = new THREE.MeshStandardMaterial({ color: 0x1a1e2a, metalness: 0.75, roughness: 0.4 }); dark.name = 'metal';
  const cyan = new THREE.MeshStandardMaterial({
    color: 0x22e8ff, emissive: 0x22e8ff, emissiveIntensity: 0.6, metalness: 0.1, roughness: 0.25,
  }); cyan.name = 'tile';

  // ---- ring: thin dark torus in the XY plane, 0.6 m across ---------------------------------------
  const RING = 0.27, TUBE = 0.03;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(RING, TUBE, 8, 40), dark);
  ring.name = 'ring';
  g.add(ring);
  // Plate: a thin dark disc tucked into the ring's inner edge, so each face reads as a badge.
  const PT = 0.012;
  const plate = new THREE.Mesh(new THREE.CylinderGeometry(RING - TUBE + 0.006, RING - TUBE + 0.006, PT, 44), dark);
  plate.rotation.x = Math.PI / 2; plate.name = 'plate';
  g.add(plate);

  // ---- alpha: one outline (loop + two-pronged tail) with one hole (the counter) -----------------
  // Loop is an ellipse centred at the origin; the tail is two straight strokes of width t leaving the
  // middle of the loop's right-hand stroke, one up-right and one down-right, meeting in a notch.
  const ao = 0.165, bo = 0.185;         // loop outer radii
  const ai = 0.075, bi = 0.095;         // counter radii (stroke = 0.09)
  const t = 0.09, h = t / 2;            // tail stroke width
  const P = [ao - h, 0];                // where the tail strokes cross, mid-stroke on the loop's right
  const T = [0.235, 0.16];               // upper tail tip (centre-line); lower tip is its mirror in y
  const dl = Math.hypot(T[0] - P[0], T[1] - P[1]);
  const ux = (T[0] - P[0]) / dl, uy = (T[1] - P[1]) / dl;   // along the upper stroke
  const nx = -uy, ny = ux;                                   // its normal, up-left
  // Outer edge of the upper stroke meets the loop's outer ellipse at J.
  const Q = [P[0] + nx * h, P[1] + ny * h];
  const A = (ux / ao) ** 2 + (uy / bo) ** 2;
  const B = 2 * (Q[0] * ux / (ao * ao) + Q[1] * uy / (bo * bo));
  const C = (Q[0] / ao) ** 2 + (Q[1] / bo) ** 2 - 1;
  const s = (-B + Math.sqrt(B * B - 4 * A * C)) / (2 * A);
  const J = [Q[0] + s * ux, Q[1] + s * uy];
  const thJ = Math.atan2(J[1] / bo, J[0] / ao);             // parametric angle of J on the ellipse
  // Inner edges of the two strokes meet on the axis at the notch N.
  const N = [P[0] - nx * h + (ny * h / uy) * ux, 0];
  const TuOut = [T[0] + nx * h, T[1] + ny * h], TuIn = [T[0] - nx * h, T[1] - ny * h];

  const alpha = new THREE.Shape();
  alpha.moveTo(J[0], J[1]);
  alpha.lineTo(TuOut[0], TuOut[1]);
  alpha.lineTo(TuIn[0], TuIn[1]);
  alpha.lineTo(N[0], N[1]);
  alpha.lineTo(TuIn[0], -TuIn[1]);
  alpha.lineTo(TuOut[0], -TuOut[1]);
  alpha.lineTo(J[0], -J[1]);
  alpha.absellipse(0, 0, ao, bo, -thJ, thJ, true);      // bottom -> left -> top, back to J
  alpha.closePath();
  const counter = new THREE.Path();
  counter.absellipse(0, 0, ai, bi, 0, Math.PI * 2, false);
  alpha.holes.push(counter);

  const AD = 0.042, AB = 0.012;                           // half-depth per copy, bevel
  const alphaGeo = new THREE.ExtrudeGeometry(alpha, {
    depth: AD, bevelEnabled: true, bevelThickness: AB, bevelSize: 0.01, bevelSegments: 2, curveSegments: 18,
  });
  alphaGeo.translate(-0.05, 0, 0);                         // centre the glyph's spread inside the ring
  for (const side of [1, -1]) {
    const m = new THREE.Mesh(alphaGeo, gold);
    m.name = side > 0 ? 'alpha_front' : 'alpha_back';
    m.position.z = side * (PT / 2 - AB);                  // base bevel buried in the plate
    if (side < 0) m.rotation.y = Math.PI;                 // mirrored copy on the back face
    g.add(m);
  }

  // ---- bolt: classic six-point zigzag, extruded through the badge, leaning top-right --------------
  const L = 0.33, W = 0.046;
  const bolt = new THREE.Shape();
  bolt.moveTo(0.028, L);
  bolt.lineTo(-W, 0.035);
  bolt.lineTo(-0.006, 0.035);
  bolt.lineTo(-0.028, -L);
  bolt.lineTo(W, -0.035);
  bolt.lineTo(0.006, -0.035);
  bolt.closePath();
  const BD = 0.11, BB = 0.012;
  const boltGeo = new THREE.ExtrudeGeometry(bolt, {
    depth: BD, bevelEnabled: true, bevelThickness: BB, bevelSize: 0.01, bevelSegments: 2, curveSegments: 4,
  });
  boltGeo.translate(0, 0, -BD / 2);
  const boltMesh = new THREE.Mesh(boltGeo, cyan);
  boltMesh.rotation.z = -0.55; boltMesh.position.x = 0.075; boltMesh.name = 'bolt';   // crosses at the loop/tail junction, clear of the counter
  g.add(boltMesh);

  recentre(THREE, g);
  g.userData.pickup = 'surge';
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
