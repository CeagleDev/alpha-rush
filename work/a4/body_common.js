
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
