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
