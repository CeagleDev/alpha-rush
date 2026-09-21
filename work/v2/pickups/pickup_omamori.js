// pickup_omamori — midnight-dash power-up pickup (one-hit SHIELD).
// A Japanese omamori protective charm: a flat padded brocade pouch 0.34 w x 0.50 h x 0.07 thick with
// clipped top corners, deep red with a raised gold border stitch and a gold centre panel carrying an
// abstract blossom-and-bars motif (no text), detailed identically on BOTH faces. A white cord is
// tied in a bow at the top edge (two loops, a knot, tails down both faces) with a hanging loop above.
export default function (THREE) {
  const g = new THREE.Group();
  const W = 0.34, H = 0.50, T = 0.07, clip = 0.075;
  const red = new THREE.MeshStandardMaterial({ color: 0x9e2a2b, roughness: 0.85, metalness: 0.0 }); red.name = 'fabric';
  const redDark = new THREE.MeshStandardMaterial({ color: 0x6f1c1f, roughness: 0.9, metalness: 0.0 }); redDark.name = 'fabric';
  const gold = new THREE.MeshStandardMaterial({ color: 0xc9a227, roughness: 0.35, metalness: 0.55 }); gold.name = 'metal';
  const white = new THREE.MeshStandardMaterial({ color: 0xeee2c8, roughness: 0.8, metalness: 0.0 }); white.name = 'fabric';

  // Pouch outline with clipped top corners, inset by `d` (d = 0 is the full outline).
  const outline = (d, target) => {
    const hw = W / 2 - d, y0 = d, y1 = H - d, c = clip - d * 0.4142; // keep the 45 degree clip parallel
    target.moveTo(-hw, y0); target.lineTo(hw, y0); target.lineTo(hw, y1 - c);
    target.lineTo(hw - c, y1); target.lineTo(-hw + c, y1); target.lineTo(-hw, y1 - c); target.closePath();
    return target;
  };

  // Padded body: the bevel supplies the pillow edge. Total thickness = depth + 2 * bevelThickness = T.
  const bt = 0.024, bs = 0.022;
  const bodyGeo = new THREE.ExtrudeGeometry(outline(bs, new THREE.Shape()), {
    depth: T - 2 * bt, bevelEnabled: true, bevelThickness: bt, bevelSize: bs, bevelSegments: 3, curveSegments: 4,
  });
  bodyGeo.translate(0, 0, -(T - 2 * bt) / 2);
  const body = new THREE.Mesh(bodyGeo, red); body.name = 'pouch';
  g.add(body);

  // Everything on a face is built once and added twice; the back copy is turned half a turn about Y.
  const faceZ = T / 2;
  const face = () => {
    const f = new THREE.Group();
    // Gold border stitch: a 16 mm frame following the outline, 5 mm proud.
    const frame = outline(0.034, new THREE.Shape());
    frame.holes.push(outline(0.05, new THREE.Path()));
    const frameMesh = new THREE.Mesh(new THREE.ExtrudeGeometry(frame, { depth: 0.005, bevelEnabled: false }), gold);
    frameMesh.position.z = faceZ - 0.001; f.add(frameMesh);

    // Gold centre panel with a bevelled edge, 0.13 x 0.29.
    const pw = 0.14, ph = 0.29, py = 0.215;
    const p = new THREE.Shape();
    p.moveTo(-pw / 2, py - ph / 2); p.lineTo(pw / 2, py - ph / 2); p.lineTo(pw / 2, py + ph / 2); p.lineTo(-pw / 2, py + ph / 2); p.closePath();
    const panel = new THREE.Mesh(new THREE.ExtrudeGeometry(p, { depth: 0.005, bevelEnabled: true, bevelThickness: 0.004, bevelSize: 0.004, bevelSegments: 1 }), gold);
    panel.position.z = faceZ - 0.001; f.add(panel);
    // Recessed dark-red field inside the panel so the gold reads as a frame plus motif.
    const iw = pw - 0.036, ih = ph - 0.036;
    const inner = new THREE.Mesh(new THREE.BoxGeometry(iw, ih, 0.004), redDark);
    inner.position.set(0, py, faceZ + 0.0085); f.add(inner);

    // Motif (abstract, no text): a five-petal blossom over three short bars, in gold.
    const mz = faceZ + 0.0095;
    const petal = new THREE.Shape();
    petal.moveTo(0, 0.006); petal.quadraticCurveTo(0.017, 0.02, 0, 0.04); petal.quadraticCurveTo(-0.017, 0.02, 0, 0.006);
    const petalGeo = new THREE.ExtrudeGeometry(petal, { depth: 0.005, bevelEnabled: false, curveSegments: 4 });
    for (let i = 0; i < 5; i++) {
      const pm = new THREE.Mesh(petalGeo, gold);
      pm.position.set(0, py + 0.065, mz); pm.rotation.z = (i / 5) * Math.PI * 2; f.add(pm);
    }
    const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.007, 10), gold);
    hub.rotation.x = Math.PI / 2; hub.position.set(0, py + 0.065, mz + 0.0035); f.add(hub);
    for (let i = 0; i < 3; i++) {
      const bar = new THREE.Mesh(new THREE.BoxGeometry(0.06 - i * 0.012, 0.016, 0.005), gold);
      bar.position.set(0, py - 0.025 - i * 0.034, mz + 0.0025); f.add(bar);
    }

    // Brocade hint: small gold diamonds in the red either side of the panel.
    const dia = new THREE.Shape();
    dia.moveTo(0, -0.017); dia.lineTo(0.012, 0); dia.lineTo(0, 0.017); dia.lineTo(-0.012, 0); dia.closePath();
    const diaGeo = new THREE.ExtrudeGeometry(dia, { depth: 0.004, bevelEnabled: false });
    for (const sx of [-1, 1]) for (let i = 0; i < 4; i++) {
      const dm = new THREE.Mesh(diaGeo, gold);
      dm.position.set(sx * 0.096, 0.105 + i * 0.075, faceZ - 0.001); f.add(dm);
    }

    // Cord tails hanging from the knot down this face, ending in small tassel knots.
    for (const sx of [-1, 1]) {
      const pts = [
        new THREE.Vector3(sx * 0.006, H + 0.004, 0.012), new THREE.Vector3(sx * 0.02, H - 0.015, faceZ + 0.004),
        new THREE.Vector3(sx * 0.04, H - 0.045, faceZ + 0.008), new THREE.Vector3(sx * 0.052, H - 0.078, faceZ + 0.008),
      ];
      const tail = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 6, 0.011, 5, false), white);
      f.add(tail);
      const end = new THREE.Mesh(new THREE.SphereGeometry(0.014, 6, 4), white);
      end.position.copy(pts[3]); end.scale.y = 1.4; f.add(end);
    }
    return f;
  };
  const front = face(); front.name = 'face_front';
  const back = face(); back.name = 'face_back'; back.rotation.y = Math.PI;
  g.add(front, back);

  // The bow, in the XY plane on the top edge so it reads the same from both faces.
  const ky = H + 0.012, cr = 0.012;
  const knot = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 6), white);
  knot.scale.set(1.15, 0.85, 1.0); knot.position.set(0, ky, 0); knot.name = 'knot'; g.add(knot);
  const loopCurve = (pts) => new THREE.CatmullRomCurve3(pts.map((q) => new THREE.Vector3(q[0], q[1], q[2] || 0)), true, 'catmullrom', 0.6);
  for (const sx of [-1, 1]) {
    // Teardrop bow loop, drooping slightly, with a little Z twist so it has depth from the side.
    const c = loopCurve([
      [sx * 0.012, ky, 0], [sx * 0.06, ky + 0.034, 0.012], [sx * 0.118, ky + 0.03, 0.008],
      [sx * 0.138, ky - 0.006, 0], [sx * 0.112, ky - 0.036, -0.008], [sx * 0.056, ky - 0.022, -0.012],
    ]);
    const loop = new THREE.Mesh(new THREE.TubeGeometry(c, 18, cr, 6, true), white); loop.name = 'bow_loop';
    g.add(loop);
  }
  // Hanging loop above the knot.
  const hang = loopCurve([
    [0, ky + 0.01, 0], [0.03, ky + 0.045, 0], [0.036, ky + 0.085, 0], [0, ky + 0.11, 0], [-0.036, ky + 0.085, 0], [-0.03, ky + 0.045, 0],
  ]);
  const hangMesh = new THREE.Mesh(new THREE.TubeGeometry(hang, 18, cr * 0.9, 6, true), white); hangMesh.name = 'hang_loop';
  g.add(hangMesh);

  recentre(THREE, g);
  g.userData.pickup = 'shield';
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
