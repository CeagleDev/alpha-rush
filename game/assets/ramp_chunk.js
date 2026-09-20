// ramp_chunk — arm B: built from profiles.
// The deck is its side profile - a wedge whose top runs from (z -15, y 0) to
// (z +15, y 6) and whose 0.8 m soffit meets the ground at z = -11 - drawn in the
// ZY plane and extruded 6 m along X. The wearing course is the same top line
// extruded as a 2 cm strip; the parapets are parallelograms extruded 0.25 m;
// the piers are extruded hammerheads. Nothing is rotated, so nothing dips.
// Base y = 0 at the low end. Surface y = 0.2 * (z + 15). Rise 6 m over 30 m.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => {
    const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 });
    if (dbl) s.side = THREE.DoubleSide;
    s.name = name; return s;
  };
  // ROUND 3 — see alley_road_chunk.js. These 'ground' colours are a TINT ON THE ASPHALT MAP
  // (chunks.js bakes them into a vertex attribute against a white shared material), and the map is
  // now a real albedo rather than an already-lit night photo, so the near-black road colour that
  // used to live here multiplied the deck down to an albedo of 1.3e-4. Light tints, carrying only
  // the patch variation; 0x6e7072 x the map puts the ramp at 0.016 linear, neutral in every
  // channel (see alley_road_chunk.js for why the tint itself is a hair cool).
  // The expressway deck and the ramps are the OUTDOOR, exposed road: no awnings, no signs
  // overhead, one sodium lamp every 15 m. At the alley's roughness (0.18) that lamp returned a
  // single hard mirror streak down the deck, thin enough to alias — measured on the round-3
  // frames it was 92 % of the road band's entire Laplacian energy in the two expressway frames
  // (1213 and 1216 against the reference's 70-311, while the alley frames sat at 130-450). At
  // 0.45 the same lamp gives a broad wet sheen instead of a mirror. All three ground materials
  // move together so they stay in ONE roughness bucket and chunks.js still merges them to one
  // draw; the alley keeps its 0.18, because its wet sheen is the one thing round 2 got credit for.
  // The deck's and the ramps' albedo is a little lower than the alley's (0.016 against 0.019):
  // this is the exposed, outdoor road, lit from 8 m by a 220-candela sodium lamp with nothing
  // between, and at the alley value a lamp put the deck's near-field p75 at 102 against the
  // reference's 28-31 and it read as pale beige concrete rather than asphalt. The deck and the
  // two ramps share one value on purpose — they are a continuous surface and a step between them
  // would show at the join as a tonal edge with no cause.
  const ROAD  = mat(0x6e7072, 'ground', 0.45);
  const PATCH = mat(0x67696b, 'ground', 0.45);
  const LANE  = mat(0x7d7f82, 'ground', 0.45);
  const CONC  = mat(0x8a8378, 'stone', 0.85);
  const CONC2 = mat(0x4a4a4c, 'stone', 0.90);
  const CONC3 = mat(0x6f6a62, 'stone', 0.88);
  const STAIN = mat(0x37201b, 'stone', 0.92);
  const BLACK = mat(0x110f12, 'stone', 0.95);
  const TIN   = mat(0x8b6141, 'metal', 0.85, 0.3);
  const RUST  = mat(0x4f2d21, 'metal', 0.90, 0.2);
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const TH = Math.atan(0.2);
  const yAt = (z) => 0.2 * (z + 15);
  const poly = (pts) => { const s = new THREE.Shape(); pts.forEach((p, i) => (i ? s.lineTo(p[0], p[1]) : s.moveTo(p[0], p[1]))); s.closePath(); return s; };
  // a profile drawn in (z, y), extruded along +X by w, centred on x
  const sweepX = (shape, w, material, x) => {
    const geo = new THREE.ExtrudeGeometry(shape, { depth: w, bevelEnabled: false, steps: 1 });
    geo.rotateY(-Math.PI / 2);          // shape x -> world +z, shape y -> world y, depth -> world -x
    geo.translate(x + w / 2, 0, 0);     // so the sweep is centred on x
    const m = new THREE.Mesh(geo, material); m.material.side = THREE.DoubleSide; g.add(m); return m;
  };
  const B = (w, h, d, m, x, y, z, rx) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); if (rx) o.rotation.x = rx; g.add(o); return o; };

  // --- the wedge deck ---------------------------------------------------------------
  const DECK = poly([[-15, 0], [15, 6.0], [15, 5.2], [-11, 0]]);
  sweepX(DECK, 6.0, CONC3, 0);
  // wearing course: a 2 cm strip along the top line, tin-thin at the toe
  const WEAR = poly([[-15, 0], [15, 6.0], [15, 6.02], [-14.9, 0.02]]);
  sweepX(WEAR, 6.0, ROAD, 0).position.y = 0.0005;
  // grounding band and the shade line under the soffit
  B(6.0, 0.05, 4.0, BLACK, 0, 0.025, -13);
  const SOFF = poly([[-11, 0], [15, 5.2], [15, 5.26], [-10.7, 0]]);
  sweepX(SOFF, 6.02, BLACK, 0);
  // patches and dashes on the slope
  for (let i = 0; i < 5; i++) { const z = -11 + i * 5 + hash(i, 1) * 2; B(1.0 + hash(i, 2) * 1.4, 0.003, 2.0, PATCH, -1.8 + hash(i, 3) * 3.6, yAt(z) + 0.0225, z, -TH); }
  for (let i = 0; i < 6; i++) { const z = -12.5 + i * 5; B(0.12, 0.003, 2.4, LANE, 0, yAt(z) + 0.023, z, -TH); }

  // --- parapets: parallelogram profiles 0.25 m thick, 0.5 m tall ------------------
  const PARA = poly([[-15, 0], [15, 6.0], [15, 6.5], [-15, 0.5]]);
  const COPE = poly([[-15, 0.5], [15, 6.5], [15, 6.56], [-15, 0.56]]);
  for (const sx of [-1, 1]) {
    sweepX(PARA, 0.25, CONC, sx * 3.125);
    sweepX(COPE, 0.29, CONC3, sx * 3.125);
    for (let i = 0; i < 4; i++) { const z = -12 + i * 8 + hash(i, sx) * 3; B(0.012, 0.3, 0.12, STAIN, sx * 2.995, yAt(z) + 0.25, z, -TH); }
    // tin cladding panels on the deck's side face where it is deep enough
    for (let i = 0; i < 8; i++) {
      const z = -8.5 + i * 2.8, h = yAt(z) - 0.85; if (h < 0.3) continue;
      B(0.04, Math.min(h, 0.7), 2.4, i % 3 === 1 ? RUST : TIN, sx * 3.02, yAt(z) - 0.42, z);
      for (let s = 0; s < 3; s++) B(0.06, Math.min(h, 0.7), 0.04, RUST, sx * 3.03, yAt(z) - 0.42, z - 0.9 + s * 0.9);
    }
  }

  // --- hammerhead piers at 10 m spacing ------------------------------------------
  for (const z of [-5, 5, 13]) {
    const top = yAt(z) - 0.8;            // soffit height here
    const PIER = poly([[-0.6, 0], [0.6, 0], [0.6, top - 0.6], [2.9, top - 0.3], [2.9, top + 0.02], [-2.9, top + 0.02], [-2.9, top - 0.3], [-0.6, top - 0.6]]);
    const geo = new THREE.ExtrudeGeometry(PIER, { depth: 1.2, bevelEnabled: false, steps: 1 }); geo.translate(0, 0, -0.6);
    const m = new THREE.Mesh(geo, CONC2); m.position.set(0, 0, z); g.add(m);
    B(1.24, 0.08, 1.24, BLACK, 0, 0.04, z);
    B(1.21, Math.max(0.2, top - 1.2), 0.25, STAIN, 0, (top - 0.6) * 0.6, z + 0.5);
  }
  g.userData.chunk = 'ramp';
  g.userData.rise = 6;
  g.userData.mounts = ['front', 'back'];

  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
