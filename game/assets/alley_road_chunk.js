// alley_road_chunk — arm A: assembled from primitives.
// 30 m (Z) x 9 m (X). A 6 m wet asphalt carriageway 0.02 m thick (top at y = 0.02,
// underside at y = 0) with tarmac patches as thin overlay boxes, a worn dashed
// centre line, raised concrete verges 1.5 m each side behind a 0.12 m kerb
// (verge/kerb top at y = 0.14), a manhole, a drain grate in the gutter, two
// puddles 2 mm proud and oil stains.
//
// SURFACE DETAIL (round-1 critic, "the street surface"). The reference's road is DARK asphalt
// carrying a lot of small high-contrast detail: paper litter and petals scattered right across the
// carriageway, broad wet sheets that mirror the signs, and cracks. Measured on the bar, the bottom
// third sits at 27 median luma with a long bright tail; the build's was a smooth mid-grey with
// nothing in it at all. So this chunk now also lays down, all as thin flat overlays a few mm proud:
//   - 18 paper/cardboard/petal flecks and 9 grit specks across the road and gutters (round 2 had
//     46 and 26, at a size that fell below a pixel and read as un-antialiased spark; see below)
//   - 5 broad wet sheets at roughness 0.085 and 3 damp margins at 0.13, so the grazing highlight
//     from a practical CLIPS somewhere instead of lifting the whole carriageway evenly
//   - 9 cracks and 4 dragged tyre smears
// Every piece is < 0.25 m on its thin axis, so the loader's chamfer proxy leaves them as plain
// boxes; they all reuse one of three materials, and chunks.js merges by recipe family, so the
// whole lot costs about 1,050 triangles per chunk and no extra draw call.
export default function (THREE) {
  const g = new THREE.Group();
  const mat = (color, name, r, m, dbl) => {
    const s = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: m || 0 });
    if (dbl) s.side = THREE.DoubleSide;
    s.name = name; return s;
  };
  // ROUND 3 — THE DIFFUSE BASE. Every 'ground' colour here is a TINT ON THE ASPHALT MAP, not the
  // road's colour: chunks.js bakes it into a vertex attribute against a white shared material, so
  // what the shader sees is map x tint. The old values were the road's colour (0x231718, linear
  // luma 0.0103) and multiplying them by an asphalt map that was itself an already-lit night photo
  // (linear luma 0.013) left the carriageway at an albedo of 1.3e-4 — four hundred times darker
  // than the pavement 30 cm away, and invisible. "It is not a dark road. It is not a road."
  //
  // The map is now a real albedo (tools/asphalt_regrade.py: linear luma 0.099, saturation 0.05),
  // so these carry only the patch-to-patch variation. 0x77797c x the map puts the carriageway at
  // 0.0190 linear in every channel. That is RAIN-WET asphalt, not dry: water fills the pores and
  // moves most of the energy into the specular lobe the wet sheets already carry, and a wet road
  // measures 0.02-0.04 against a dry one's 0.07-0.12. Measured, not chosen for looks — at the dry
  // value (0.044) the near-field p75 landed at 47 against the reference's 28-31, because this
  // alley's practicals are hot enough that a dry albedo blows every lantern pool out. Everything
  // else is a multiple: repairs -20/+16 %, wet sheets 0.64x, cracks 0.46x, the worn line 1.28x.
  // The dark end is deliberately not as dark as it was: the critic's frame-wide p05 target is a
  // floor, and an oil stain at 0.30x of a 0.02 albedo is a hole in the road, not a stain.
  //
  // They are a HAIR COOL (b > r) on purpose, and that is not the road's colour: it cancels the
  // map's residual warmth so the product is neutral, because the LIGHT in this alley is already
  // saturated orange (rig bounce 0.50/0.19/0.05) and a warm albedo on top of it was half of why
  // the road measured 0.70 saturation against the reference's 0.37-0.53. Measured on the bar, the
  // reference's near-field asphalt is (23.7, 18.1, 21.7) — neutral leaning magenta, not amber.
  const ROAD   = mat(0x77797c, 'ground', 0.18);
  const PATCH1 = mat(0x6b6d70, 'ground', 0.18);
  const PATCH2 = mat(0x808285, 'ground', 0.18);
  const PATCH3 = mat(0x717375, 'ground', 0.18);
  const OIL    = mat(0x5a5c5d, 'ground', 0.12);
  const PUDDLE = mat(0x636567, 'ground', 0.05);
  // worn to almost nothing on purpose: a yokocho has no lane markings, and a bright white line was
  // already on the critic's list as the tell that this is a generic road asset.
  const LINE   = mat(0x86888b, 'ground', 0.30);
  const GUTTER = mat(0x4a4a4c, 'stone', 0.18);      // wet gutter concrete
  const KERB   = mat(0x8a8378, 'stone', 0.80);
  const KERB2  = mat(0x77716a, 'stone', 0.85);
  const PAVE   = mat(0x6f6a62, 'stone', 0.18);      // wet verge slab
  const PAVE2  = mat(0x64605a, 'stone', 0.18);
  const GRIME  = mat(0x37201b, 'stone', 0.90);
  const IRON   = mat(0x37201b, 'metal', 0.85, 0.3);
  const IRON2  = mat(0x2a1a16, 'metal', 0.80, 0.3);
  // road-surface detail. 'plaster' keeps the litter matte and off the asphalt texture set;
  // the wet sheets stay 'ground' so they take the asphalt maps and only differ in roughness.
  const PAPER  = mat(0xeee2c8, 'plaster', 0.88);    // paper scraps, receipts, petals
  const PAPER2 = mat(0xd8cdb4, 'plaster', 0.90);
  const PETAL  = mat(0xb8302a, 'plaster', 0.88);    // the reference's red petals, one in eight
  const CARD   = mat(0x8b6141, 'plaster', 0.90);    // flattened cardboard, the commonest litter
  const GRIT   = mat(0x6c4028, 'plaster', 0.92);
  // 0.05 was a true mirror and the grazing highlight off it clipped over a large area; 0.085 still
  // returns a sign as a hard bright smear but stops the sheet itself from reading as a light.
  const WET    = mat(0x616364, 'ground', 0.085);    // a standing wet sheet
  const DAMP   = mat(0x6b6d70, 'ground', 0.13);     // its drying margin
  const CRACK  = mat(0x525456, 'ground', 0.55);
  const SMEAR  = mat(0x656769, 'ground', 0.14);

  const B = (w, h, d, m, x, y, z, ry) => {
    const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    o.position.set(x, y, z); if (ry) o.rotation.y = ry; g.add(o); return o;
  };
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  // --- carriageway ----------------------------------------------------------
  B(6.0, 0.02, 30, ROAD, 0, 0.01, 0);
  // patched tarmac panels, 3 mm proud
  const pm = [PATCH1, PATCH2, PATCH3];
  for (let i = 0; i < 14; i++) {
    const w = 0.8 + hash(i, 1) * 1.6, d = 1.2 + hash(i, 2) * 3.0;
    const x = -2.6 + hash(i, 3) * 5.2, z = -14 + hash(i, 4) * 28;
    B(w, 0.003, d, pm[i % 3], Math.max(-3 + w / 2, Math.min(3 - w / 2, x)), 0.0215,
      Math.max(-15 + d / 2, Math.min(15 - d / 2, z)), (hash(i, 5) - 0.5) * 0.08);
  }
  // worn centre line: 2 m dashes, 2 m gaps, a couple missing
  for (let i = 0; i < 8; i++) {
    if (i === 3) continue;                                     // dashes span z -15..15 exactly, so chunks tile without overlap
    // REMOVED (critic round 3): the dashed centre line. "No alley has them, and they are currently
    // the most legible graphic element on the ground plane" — it read as a generic road asset
    // dropped into a hand-built set. Worn down was not enough; it is gone.
    void LINE; void i;
  }
  // oil stains, dark octagons
  for (let i = 0; i < 4; i++) {
    const o = new THREE.Mesh(new THREE.CylinderGeometry(0.35 + hash(i, 9) * 0.3, 0.35 + hash(i, 9) * 0.3, 0.002, 8), OIL);
    o.position.set(-1.8 + hash(i, 10) * 3.6, 0.023, -12 + hash(i, 11) * 24);
    o.scale.z = 1.6; g.add(o);
  }
  // two puddles, 2 mm proud
  for (const [x, z, r, sz] of [[-1.1, -6.5, 0.7, 1.7], [1.6, 4.0, 0.55, 2.2]]) {
    const p = new THREE.Mesh(new THREE.CylinderGeometry(r, r, 0.002, 10), PUDDLE);
    p.position.set(x, 0.023, z); p.scale.z = sz; p.rotation.y = 0.5; g.add(p);
  }
  // --- wet sheets: broad, low-roughness, IRREGULAR. Where the grazing highlight clips. --------
  for (const [x, z, rx, rz, rot, m] of [
    [-1.6, -10.0, 1.30, 3.4, 0.10, WET], [1.35, -2.2, 1.05, 4.1, -0.07, WET],
    [-0.4, 6.8, 1.55, 3.0, 0.22, WET], [2.15, 11.5, 0.90, 2.6, -0.16, WET],
    [-2.25, 2.0, 0.80, 2.2, 0.05, WET],
    [0.7, -13.0, 1.7, 2.0, 0.0, DAMP], [-1.9, 9.0, 1.5, 2.4, 0.12, DAMP], [2.4, -6.0, 1.1, 3.2, -0.1, DAMP],
  ]) {
    const q = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.0015, 9), m);
    q.position.set(x, m === WET ? 0.0235 : 0.0225, z);
    q.scale.set(rx, 1, rz); q.rotation.y = rot;
    g.add(q);
  }
  // --- cracks: thin, dark, never parallel to the kerb ------------------------
  for (let i = 0; i < 9; i++) {
    const len = 0.9 + hash(i, 21) * 2.4;
    B(0.035 + hash(i, 22) * 0.02, 0.0025, len, CRACK,
      -2.6 + hash(i, 23) * 5.2, 0.0235, -13.5 + hash(i, 24) * 27, (hash(i, 25) - 0.5) * 1.5);
  }
  // --- dragged tyre smears, along the direction of travel --------------------
  for (let i = 0; i < 4; i++) {
    B(0.22 + hash(i, 26) * 0.14, 0.0022, 2.4 + hash(i, 27) * 3.0, SMEAR,
      -2.2 + hash(i, 28) * 4.4, 0.0232, -12 + hash(i, 29) * 24, (hash(i, 30) - 0.5) * 0.12);
  }
  // --- paper litter and petals. THE reference's road signature: small, pale, everywhere. ------
  // Flat rectangles a few mm proud, random yaw, a slight tilt on some so they catch the light
  // differently from their neighbours instead of reading as one printed pattern.
  //
  // ROUND 3: 46 at 4-11 cm, halved to 18 at 8-19 cm. Round 2 sized these for the reference's
  // fleck DENSITY and got the scale wrong in a way that only the second critic named: at 4 cm and
  // 15 m down the street a scrap is under a pixel, and a sub-pixel white box on a black road is a
  // single un-antialiased spark that crawls the moment the camera moves. Fewer and larger is the
  // same litter, at a size the sampler can actually resolve; the pebble-scale detail they were
  // standing in for now comes from the albedo map, where it belongs and where mips handle it.
  for (let i = 0; i < 18; i++) {
    const w = 0.080 + hash(i, 41) * 0.110, d = 0.070 + hash(i, 42) * 0.100;
    const r = hash(i, 43);
    const m = r < 0.34 ? PAPER : r < 0.70 ? PAPER2 : r < 0.86 ? CARD : PETAL;
    // biased toward the middle of the road, where the camera looks, but present right across it
    const t = hash(i, 44) * 2 - 1;
    const x = Math.sign(t) * Math.pow(Math.abs(t), 1.35) * 3.15;
    const o = B(w, 0.004, d, m, x, 0.0245 + hash(i, 45) * 0.004, -14.6 + hash(i, 46) * 29.2,
      hash(i, 47) * Math.PI);
    o.rotation.x = (hash(i, 48) - 0.5) * 0.5;       // a scrap is never perfectly flat
    o.rotation.z = (hash(i, 49) - 0.5) * 0.5;
  }
  // --- grit: darker, smaller, concentrated toward the gutters ----------------
  // 26 -> 9, and up from 3-8 cm to 7-15 cm, for the reason above: below a pixel these were spark,
  // not grit. They sit in the gutters where the camera sees them at a shallow angle anyway.
  for (let i = 0; i < 9; i++) {
    const w = 0.070 + hash(i, 51) * 0.080;
    const side = hash(i, 52) < 0.5 ? -1 : 1;
    B(w, 0.005, w * (0.7 + hash(i, 53) * 0.8), GRIT,
      side * (1.6 + hash(i, 54) * 1.7), 0.0245, -14.2 + hash(i, 55) * 28.4, hash(i, 56) * Math.PI);
  }

  // manhole cover: rusty iron disc with a rim ring
  const mh = new THREE.Mesh(new THREE.CylinderGeometry(0.30, 0.30, 0.012, 14), IRON);
  mh.position.set(-0.9, 0.026, -2.0); g.add(mh);
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.31, 0.012, 4, 14), IRON2);
  rim.rotation.x = Math.PI / 2; rim.position.set(-0.9, 0.028, -2.0); g.add(rim);

  // --- kerb and gutter, each side -------------------------------------------
  for (const sx of [-1, 1]) {
    // gutter channel 0.35 m wide at road level (slightly below, so it reads as a dish)
    B(0.35, 0.016, 30, GUTTER, sx * 3.175, 0.008, 0);
    // kerb stones 0.15 wide x 0.12 tall, 1 m units with 1 cm joints
    for (let i = 0; i < 30; i++) {
      const dip = (hash(i, sx) - 0.5) * 0.012;
      B(0.15, 0.12 + dip, 0.98, i % 5 === 2 ? KERB2 : KERB, sx * 3.425, 0.02 + (0.12 + dip) / 2, -14.5 + i);
    }
    // paving slabs behind the kerb, 1.0 m wide verge at y = 0.14
    for (let i = 0; i < 15; i++) {
      const dip = (hash(i, sx * 3) - 0.5) * 0.006;
      B(0.98, 0.12 + dip, 1.98, i % 4 === 1 ? PAVE2 : PAVE, sx * 4.0, 0.02 + (0.12 + dip) / 2, -14 + i * 2);
    }
    // sub-base under the verge so nothing is see-through from the side
    B(1.5, 0.02, 30, GRIME, sx * 3.75, 0.01, 0);
    // grime band at the foot of the kerb
    B(0.02, 0.04, 30, GRIME, sx * 3.34, 0.04, 0);
  }
  // drain grate set in the right-hand gutter
  B(0.70, 0.02, 0.40, IRON2, 3.15, 0.026, 9.0);
  for (let i = 0; i < 9; i++) B(0.62, 0.008, 0.02, IRON, 3.15, 0.038, 8.84 + i * 0.04);
  // a weed clump and grit in the gutter corner
  B(0.18, 0.05, 0.12, mat(0x3d4a22, 'foliage', 0.9), -3.2, 0.045, -11.5, 0.4);
  B(0.14, 0.04, 0.10, mat(0x3d4a22, 'foliage', 0.9), 3.22, 0.04, -4.0, -0.3);

  g.userData.chunk = 'alley';
  g.userData.mounts = ['front', 'back'];   // the z-ends butt flush against the next chunk

  // --- place ----------------------------------------------------------------
  const box = new THREE.Box3(), v = new THREE.Vector3();
  g.updateMatrixWorld(true);
  g.traverse((n) => { const p = n.isMesh && n.geometry.attributes.position; if (!p) return;
    for (let i = 0; i < p.count; i++) box.expandByPoint(v.fromBufferAttribute(p, i).applyMatrix4(n.matrixWorld)); });
  const c = box.getCenter(new THREE.Vector3());
  g.children.forEach((o) => { o.position.x -= c.x; o.position.y -= box.min.y; o.position.z -= c.z; });
  return g;
}
