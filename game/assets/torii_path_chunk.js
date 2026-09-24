// torii_path_chunk — the shrine path slab, 30 m (Z) x 9 m (X). Built from the env_torii board: big wet
// flagstones laid across the path in irregular rows (2 or 3 to a row), moss in the joints and creeping
// in from the edges, leaves and needle drifts lying on the stones, a low stone kerb each side, and
// earth verges of moss clumps, half-buried stones and surface roots.
//   base y = 0, flagstone tops (the running surface) at y = 0.02, joint bed 4 mm lower,
//   kerb 3.0..3.3 with its top at 0.14 and a dark grounding band at the foot, earth verge 3.3..4.5
//   with its top at 0.10. Placed at (0, -0.02, 15) like alley_road_chunk so the stones land on y = 0.
export default function (THREE) {
  const g = new THREE.Group();
  const mk = (color, name, r, o = {}) => { const m = new THREE.MeshStandardMaterial({ color, roughness: r, metalness: 0, ...o }); m.name = name; return m; };
  const B = (w, h, d, m, x, y, z, ry = 0, rx = 0, rz = 0) => { const o = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m); o.position.set(x, y, z); o.rotation.set(rx, ry, rz); g.add(o); return o; };
  const hash = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  const SUB    = mk(0x231718, 'ground', 0.90);   // earth sub-base, the warm dark shade
  const JOINT  = mk(0x2f3322, 'ground', 0.60);   // mossy joint bed between the stones
  const ST = [mk(0x605c55, 'stone', 0.18), mk(0x57534d, 'stone', 0.20), mk(0x69645c, 'stone', 0.22), mk(0x50553f, 'stone', 0.30)]; // wet flagstones, the last one mossy
  const KERB   = mk(0x7d766b, 'stone', 0.55);
  const KERB2  = mk(0x6b655e, 'stone', 0.60);
  const EARTH  = mk(0x3a2a22, 'ground', 0.85);
  const EARTH2 = mk(0x4f2d21, 'ground', 0.85);
  const GRIME  = mk(0x110f12, 'stone', 0.90);    // grounding band
  const MOSS   = mk(0x3d4a22, 'foliage', 0.95);
  const MOSS2  = mk(0x4a5a2a, 'foliage', 0.95);
  const LEAF   = mk(0x8b6141, 'plaster', 0.90);
  const LEAF2  = mk(0xbf7c42, 'plaster', 0.90);
  const NEEDLE = mk(0x6c4028, 'plaster', 0.92);
  const WET    = mk(0x54514b, 'stone', 0.085);  // a standing wet sheet, where the grazing highlight clips
  const PEBBLE = mk(0x8a8378, 'stone', 0.70);
  const ROOT   = mk(0x37201b, 'timber', 0.90);

  // --- sub-base under the whole 9 x 30 footprint, so nothing is see-through from the side
  B(9.0, 0.02, 30, SUB, 0, 0.01, 0);
  // --- carriageway: the joint bed, then flagstones in rows across the path
  B(6.0, 0.016, 30, JOINT, 0, 0.008, 0);
  let z = -15, row = 0;
  while (z < 15 - 0.05) {
    const d = Math.min(0.75 + hash(row, 1) * 0.6, 15 - z);
    const n = hash(row, 2) < 0.35 ? 2 : 3;
    const cuts = n === 2 ? [2.4 + hash(row, 3) * 1.2] : [1.6 + hash(row, 3) * 0.8, 3.6 + hash(row, 4) * 0.8];
    const edges = [0, ...cuts, 6];
    for (let k = 0; k < n; k++) {
      const x0 = edges[k] + 0.015, x1 = edges[k + 1] - 0.015;
      const t = hash(row, 10 + k);
      const m = t < 0.12 ? ST[3] : t < 0.42 ? ST[0] : t < 0.75 ? ST[1] : ST[2];
      const proud = (hash(row, 20 + k) - 0.5) * 0.004;
      B(x1 - x0, 0.02, d - 0.03, m, -3 + (x0 + x1) / 2, 0.01 + proud, z + d / 2, (hash(row, 30 + k) - 0.5) * 0.012);
    }
    z += d; row++;
  }
  // wet sheets, a hair proud, roughness 0.085
  for (const [x, zz, rx, rz, rot] of [[-1.2, -9, 0.9, 1.8, 0.2], [1.5, -1, 0.8, 2.2, -0.1], [-0.3, 7, 1.0, 1.6, 0.3], [1.9, 12, 0.6, 1.4, 0.1]]) {
    const q = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.0015, 9), WET); q.position.set(x, 0.0235, zz); q.scale.set(rx, 1, rz); q.rotation.y = rot; g.add(q);
  }
  // moss: in the joints and creeping in from the kerbs
  for (let i = 0; i < 30; i++) {
    const edge = hash(i, 40) < 0.5;
    const x = edge ? (hash(i, 41) < 0.5 ? -1 : 1) * (2.2 + hash(i, 42) * 0.75) : -2.6 + hash(i, 43) * 5.2;
    const r = 0.10 + hash(i, 44) * 0.22;
    const q = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.8, 0.008, 6), hash(i, 45) < 0.6 ? MOSS : MOSS2);
    q.position.set(x, 0.024, -14.3 + hash(i, 46) * 28.6); q.scale.z = 1 + hash(i, 47) * 1.2; q.rotation.y = hash(i, 48) * 3; g.add(q);
  }
  // fallen leaves and needle drifts on the stones
  for (let i = 0; i < 22; i++) {
    const t = hash(i, 50), m = t < 0.4 ? LEAF : t < 0.7 ? LEAF2 : NEEDLE;
    const w = m === NEEDLE ? 0.35 + hash(i, 51) * 0.4 : 0.08 + hash(i, 51) * 0.09;
    const dd = m === NEEDLE ? 0.10 + hash(i, 52) * 0.12 : 0.07 + hash(i, 52) * 0.08;
    const o = B(w, 0.004, dd, m, -2.8 + hash(i, 53) * 5.6, 0.025, -14.5 + hash(i, 54) * 29, hash(i, 55) * Math.PI);
    o.rotation.x = (hash(i, 56) - 0.5) * 0.3;
  }
  // --- kerbs and verges, each side
  for (const sx of [-1, 1]) {
    for (let i = 0; i < 30; i++) {
      const dip = (hash(i, sx * 7) - 0.5) * 0.016;
      B(0.30, 0.14 + dip, 0.97, i % 6 === 3 ? KERB2 : KERB, sx * 3.15, (0.14 + dip) / 2, -14.5 + i, (hash(i, sx * 9) - 0.5) * 0.02);
    }
    B(0.02, 0.05, 30, GRIME, sx * 3.0, 0.025, 0);            // grounding band at the kerb foot
    B(1.2, 0.10, 30, EARTH, sx * 3.9, 0.05, 0);              // earth verge 3.3..4.5, top at 0.10
    B(0.35, 0.102, 30, EARTH2, sx * 3.5, 0.051, 0);          // a damper strip along the kerb
    for (let i = 0; i < 12; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.10 + hash(i, sx * 11) * 0.14, 7, 4), i % 3 ? MOSS : MOSS2);
      s.position.set(sx * (3.45 + hash(i, sx * 12) * 0.95), 0.10, -14 + hash(i, sx * 13) * 28); s.scale.set(1, 0.3 + hash(i, sx * 14) * 0.2, 1 + hash(i, sx * 15)); g.add(s);
    }
    for (let i = 0; i < 8; i++) {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.07 + hash(i, sx * 16) * 0.10, 6, 4), PEBBLE);
      s.position.set(sx * (3.4 + hash(i, sx * 17) * 1.0), 0.09, -13.5 + hash(i, sx * 18) * 27); s.scale.y = 0.5; s.rotation.y = hash(i, sx * 19) * 3; g.add(s);
    }
    for (let i = 0; i < 6; i++) B(0.5 + hash(i, sx * 21) * 0.5, 0.01, 0.2 + hash(i, sx * 22) * 0.2, NEEDLE, sx * (3.5 + hash(i, sx * 23) * 0.8), 0.105, -14 + hash(i, sx * 24) * 28, hash(i, sx * 25) * 3);
    // two surface roots breaking across the verge
    for (const zz of [-6.5 + sx * 4, 9.5 - sx * 3]) {
      const r = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 1.1, 6), ROOT);
      r.position.set(sx * 3.95, 0.10, zz); r.rotation.set(0.15, 0, Math.PI / 2); g.add(r);
    }
  }

  g.userData.chunk = 'torii';
  g.userData.mounts = ['front', 'back'];   // the z-ends butt flush against the next chunk
  finish(THREE, g);
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
  if (lights) g.userData.lights = lights.map((l) => ({ ...l, x: l.x - c.x, y: l.y - box.min.y, z: l.z - c.z }));
}
