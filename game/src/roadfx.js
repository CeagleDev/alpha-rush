/**
 * roadfx.js — the wet street: sign reflections smeared down the road, and contact shadows.
 *
 *   init(ctx)        builds two pooled meshes and their textures. Adds nothing to the load.
 *   update(dt, ctx)  rewrites both meshes' vertex buffers from the live scene. Runs after
 *                    player / pack / track / camera in main.js's UPDATE_ORDER, so every position
 *                    and the camera are this frame's, and before lighting so the pools land on top.
 *
 * WHY THIS EXISTS. The critic's one property was the street surface: "a wet, reflective, textured
 * plane that returns the signage", and "nothing in the frame is standing on anything". In the
 * reference every lit sign leaves a vertical smear of its own colour on the asphalt and every dog
 * sits in a dark patch. Neither was in the build.
 *
 * TWO MESHES, TWO DRAW CALLS, ~200 TRIANGLES. Everything is one pooled BufferGeometry per system
 * with a fixed capacity and setDrawRange; the vertex buffers are rewritten in place each frame and
 * nothing is allocated in the loop. Triangles are the tight budget on this build (1.33 M of 1.5 M),
 * so this had to cost effectively none.
 *
 * REFLECTIONS ARE PLACED BY THE REAL SPECULAR POINT, not under the sign. A planar reflection is far
 * too expensive on a 900-draw budget, but the geometry of one is free: the mirror image of a light
 * (lx, ly, lz) in the road plane y = gy is (lx, 2gy - ly, lz), and the point the camera actually
 * sees it at is where the segment camera -> mirror image crosses the road,
 *
 *     t  = (cy - gy) / ((cy - gy) + (ly - gy))        px = cx + t (lx - cx),  pz = cz + t (lz - cz)
 *
 * That one line is the whole difference from a glow painted under the fitting. A sign standing on
 * the verge at x = 4 reflects at x = 1.9, ON the road where the camera is looking; a sodium lamp
 * 10 m up reflects a few metres in front of the runner rather than 30 m away under its own pole.
 * lighting.js's ground pools sit under the source on purpose and stay — they are the light the sign
 * throws. These are the sign's image, and they are what carries its HUE down onto the street.
 *
 * The quad is then stretched from that point TOWARD THE CAMERA, which is the direction a rough
 * mirror smears a highlight, and textured with a broken streak rather than a soft disc: a smooth
 * blob adds brightness and no detail, and bottom-third edge energy was one of the four numbers
 * being judged. Length comes from the source's height, so a lantern smears 3 m and a gantry 8 m.
 *
 * CONTACT SHADOWS are alpha-blended BLACK with a radial alphaMap, never MultiplyBlending: alpha
 * blending against black is exactly a multiply by (1 - a) and it behaves the same whether the rig
 * is compositing in linear HDR (desktop, post on) or straight into an 8-bit sRGB buffer (phone tier,
 * no post). Per-shadow strength rides in a 4-component vertex colour attribute, whose alpha three
 * multiplies into the fragment — so the runner's shadow can shrink and fade as he jumps without a
 * material per object.
 *
 * TRAPS OBSERVED (docs/traps.md)
 *  - "Transparent materials are drawn twice": both materials are double-sided so winding can never
 *    lose a quad, and both set forceSinglePass, so each is ONE draw and not two.
 *  - "Bloom turns a two pixel spark into a forty pixel disc": the streaks are capped well under the
 *    emissive faces' radiance. They are a smear on a road, not a light source; if they clip they
 *    bloom into exactly the orange discs the critic already failed us for.
 *  - Ramps: every corner takes its own y from track.groundY(z), so a quad crossing the foot of a
 *    ramp bends with it instead of sinking into it. Expressway chunks sit at y = 6 and are handled
 *    by the same call.
 *  - depthWrite is off and depthTest is on, so these never occlude each other and are correctly
 *    hidden by anything standing on the road.
 *
 * Reads only: track.lights() / groundY(), obstacles.rows(), player.getObject(), pack.getDogs(),
 * ctx.state, ctx.camera. Writes nothing anyone else reads. state.roadfx is informational.
 */

const Q = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); } })();
const qn = (k, d) => { const v = Number(Q.get(k)); return Q.has(k) && Number.isFinite(v) ? v : d; };

export const PARAMS = {
  on: Q.get('roadfx') !== '0',
  // --- reflections -------------------------------------------------------
  reflOn: Q.get('refl') !== '0',
  reflMax: 40, reflMaxPhone: 22,
  // Brightness of a streak before falloff.
  //
  // ROUND 3, PULLED BACK. The comment that used to sit here said the road was "a near-black mirror
  // (albedo 0x231718 times the asphalt map is ~0.0004 linear), so everything visible on it is
  // specular or additive" — and that was the bug, not the design. These streaks were carrying the
  // entire appearance of the street because there was no material under them; the critic saw
  // exactly that ("strip the sparkles and the highlight blob and there is no diffuse signal
  // left") and noted they had "been pushed that hard only because they are doing all the work of
  // selling wet on their own. Give them a material to sit on and they can come back by more than
  // half." The material exists now (albedo 0.021 linear, 160x what it was), so: 0.50 -> 0.16.
  // They are also the frame's most saturated road pixels, and road-band saturation was 0.70
  // against a reference 0.37-0.53, so this is most of that gap too.
  reflGain: qn('refl', 1) * 0.16,
  reflNear: 2.0, reflFar: 46,          // metres from the camera: fade in, and gone
  reflMinY: 1.0, reflMaxY: 11,         // source height above its own road, m
  reflWidth: 0.26, reflWidthRange: 0.07, reflWidthMax: 0.72,
  reflLen: 0.95, reflLenBase: 1.2, reflLenMax: 8.0,
  reflAhead: 0.18,                     // of the streak's length that sits BEYOND the specular point
  reflSpread: 3.6,                     // source height (m) at which the smear is at full strength
  reflX: 3.55,                         // no streak whose centre is further out than this (road + gutter)
  reflY: 0.052,                        // above the road: clears the 26 mm manhole and the 24 mm puddles
  // --- contact shadows ---------------------------------------------------
  shadowOn: Q.get('shadow') !== '0',
  shadowMax: 30, shadowMaxPhone: 18,
  // Peak alpha under a grounded object. 0.70 was set when the carriageway was near-black and a
  // multiply against it removed nothing, so it had to be cranked to read at all on the lit patches.
  // The road now has a diffuse base everywhere, so the same alpha punches a black hole in it —
  // which is the opposite of round 3's property ("cover every specular highlight and the ground
  // must still read as a surface"). It also sets the frame's p05: measured on the round-3
  // frames the darkest 5 % of pixels were road under these quads, where the reference's darkest
  // 5 % is sky at the roofline. 0.70 -> 0.40: still a firm contact patch, no longer a void.
  shadowDark: qn('shadow', 1) * 0.40,
  shadowY: 0.034,                      // under the reflections, above the road's own 3 mm detail
  shadowFar: 42,
  shadowProps: true,
};

let ctx = null, THREE = null, phone = false;
let refl = null, shad = null;          // { mesh, pos, col, geo, cap }
let reflTex = null, shadTex = null;
const report_ = { refl: 0, shadows: 0, sources: 0 };

const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);

/* ------------------------------------------------------------------ textures */

/** Deterministic hash noise, so the streak looks the same on every machine. */
const h2 = (x, y) => { const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453; return s - Math.floor(s); };
function vnoise(x, y) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = h2(xi, yi), b = h2(xi + 1, yi), c = h2(xi, yi + 1), d = h2(xi + 1, yi + 1);
  return (a + (b - a) * u) + ((c + (d - c) * u) - (a + (b - a) * u)) * v;
}

/**
 * The streak. u runs ACROSS the smear, v ALONG it: v = 0 is the specular point (the hot end,
 * nearest the sign) and v = 1 is the far end nearest the camera. White RGB, all the shape in alpha,
 * so one texture serves every colour through the vertex colours.
 *
 * The alpha is deliberately BROKEN along v — three noise octaves and a low-frequency ripple — not a
 * smooth ramp. A smooth ramp is a glow; a wet road returns a sign as a run of bright and dark bands
 * where the surface tilts in and out of the mirror angle, and those bands are edges, which is the
 * statistic that was failing.
 */
function streakTexture(w = 64, h = 256) {
  const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
  const g2 = cv.getContext('2d');
  const img = g2.createImageData(w, h);
  for (let y = 0; y < h; y++) {
    const v = (y + 0.5) / h;
    // along: hot at the source end, a long tail toward the camera
    let along = Math.pow(1 - v, 1.15) * (0.30 + 0.70 * Math.exp(-v * 5.2)) + 0.22 * Math.pow(1 - v, 2.6);
    along *= Math.min(1, v / 0.05);                 // zero at v = 0 too: no hard end on the quad
    // broken into bands by the surface ripple, plus fine grain
    const ripple = 0.60 + 0.40 * Math.sin(v * 17.0 + 1.3) * Math.sin(v * 6.1);
    const grain = 0.55 + 0.45 * vnoise(v * 26.0, 3.7);
    along *= ripple * grain;
    for (let x = 0; x < w; x++) {
      const u = (x + 0.5) / w * 2 - 1, au = Math.abs(u);
      // across: a tight core that widens down the tail, the way a rough reflection fans out.
      // The core MUST reach zero by |u| = 1. At 0.42 it did not — it was still at 0.32 alpha on the
      // quad's own edge, so every streak drew a hard-edged pale slab across the road and the bottom
      // third went from 37 to 67 median luma against the bar's 27. Narrower core, and an explicit
      // window that is zero at the boundary whatever the core does.
      const wid = 1.0 + v * 1.25;
      let across = Math.exp(-Math.pow(au / (0.26 * wid), 2.0)) * Math.pow(1 - au, 1.4);
      across *= 0.72 + 0.28 * vnoise(u * 5.0 + 11.0, v * 22.0);
      const a = clamp(along * across, 0, 1);
      const i = (y * w + x) * 4;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = 255;
      img.data[i + 3] = Math.round(a * 255);
    }
  }
  g2.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  return t;
}

/**
 * Contact shadow mask: an elliptical core, zero at the quad's edge so the square never shows.
 *
 * The mask goes in RGB, NOT in the alpha channel. three's `alphaMap` samples the GREEN channel
 * (`diffuseColor.a *= texture2D(alphaMap, vAlphaMapUv).g`), so a mask written into alpha with RGB
 * left at 255 reads as a constant 1.0 and every shadow comes out a hard-edged black rectangle.
 * Nothing warns; it just looks like a bug in the geometry.
 */
function shadowTexture(s = 128) {
  const cv = document.createElement('canvas'); cv.width = cv.height = s;
  const g2 = cv.getContext('2d');
  const img = g2.createImageData(s, s);
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const dx = (x + 0.5) / s * 2 - 1, dy = (y + 0.5) / s * 2 - 1;
    const d = Math.hypot(dx, dy);
    // dense core, soft shoulder, hard zero by the edge: an object in contact is dark right under it
    // A PLATEAU, not a peak. The first version fell as (1-d)^1.9 and was already down to 0.17 at
    // half radius, so once the quad was scaled wide enough for the ring outside the object to show,
    // that ring had nothing left in it. Flat and dark out to 0.34, then a smooth shoulder to zero.
    const t = clamp((d - 0.34) / 0.66, 0, 1);
    const a = d >= 1 ? 0 : 1 - t * t * (3 - 2 * t);
    const v = Math.round(clamp(a, 0, 1) * 255);
    const i = (y * s + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v;   // GREEN is what alphaMap reads
    img.data[i + 3] = 255;
  }
  g2.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.NoColorSpace;      // a mask, never a colour: no sRGB decode
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.minFilter = THREE.LinearMipmapLinearFilter;
  t.generateMipmaps = true;
  return t;
}

/* ------------------------------------------------------------------ pools */

/** One quad pool: fixed capacity, indices written once, positions and colours rewritten per frame. */
function makePool(cap, mat, colorItems, name, order) {
  const geo = new THREE.BufferGeometry();
  const pos = new Float32Array(cap * 4 * 3);
  const uv = new Float32Array(cap * 4 * 2);
  const col = new Float32Array(cap * 4 * colorItems);
  const idx = new Uint16Array(cap * 6);
  for (let i = 0; i < cap; i++) {
    uv.set([0, 0, 1, 0, 1, 1, 0, 1], i * 8);
    idx.set([i * 4, i * 4 + 1, i * 4 + 2, i * 4, i * 4 + 2, i * 4 + 3], i * 6);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.BufferAttribute(col, colorItems).setUsage(THREE.DynamicDrawUsage));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.setDrawRange(0, 0);
  const mesh = new THREE.Mesh(geo, mat);
  mesh.name = name;
  mesh.renderOrder = order;
  mesh.frustumCulled = false;            // positions move every frame; the bounding sphere would lie
  mesh.matrixAutoUpdate = false;
  return { geo, mesh, pos, col, cap, n: 0 };
}

function flush(p) {
  p.geo.setDrawRange(0, p.n * 6);
  p.geo.attributes.position.needsUpdate = true;
  p.geo.attributes.color.needsUpdate = true;
  p.mesh.visible = p.n > 0;
}

/* ------------------------------------------------------------------ lifecycle */

export async function init(c) {
  ctx = c; THREE = c.THREE;
  if (!PARAMS.on) return;
  phone = !!(c.config && c.config.phone);
  try { reflTex = streakTexture(); shadTex = shadowTexture(); }
  catch (e) { console.warn('[roadfx] no canvas, disabled:', e && e.message); PARAMS.on = false; return; }

  const reflMat = new THREE.MeshBasicMaterial({
    map: reflTex, vertexColors: true, transparent: true, depthWrite: false, depthTest: true,
    blending: THREE.AdditiveBlending, side: THREE.DoubleSide, forceSinglePass: true,
    fog: false, toneMapped: true,
  });
  const shadMat = new THREE.MeshBasicMaterial({
    // BLACK with an alpha mask: dst*(1 - a). Not MultiplyBlending — that result depends on whether
    // the rig is compositing in linear HDR or in sRGB, and this build is both, by tier.
    color: 0xffffff, alphaMap: shadTex, vertexColors: true, transparent: true,
    depthWrite: false, depthTest: true, blending: THREE.NormalBlending,
    side: THREE.DoubleSide, forceSinglePass: true, fog: false, toneMapped: false,
  });

  refl = makePool(phone ? PARAMS.reflMaxPhone : PARAMS.reflMax, reflMat, 3, 'roadfx.reflections', 3);
  shad = makePool(phone ? PARAMS.shadowMaxPhone : PARAMS.shadowMax, shadMat, 4, 'roadfx.shadows', 1);
  ctx.scene.add(shad.mesh);
  ctx.scene.add(refl.mesh);
  ctx.state.roadfx = report_;
}

/* ------------------------------------------------------------------ per frame */

const _c = { r: 1, g: 1, b: 1 };
function hexLin(hex) {
  // sRGB hex -> linear, because the vertex colour is multiplied in linear working space.
  const f = (v) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  _c.r = f(((hex >> 16) & 255) / 255); _c.g = f(((hex >> 8) & 255) / 255); _c.b = f((hex & 255) / 255);
  return _c;
}

function trackMod() {
  const m = ctx.modules || {};
  const t = m.track;
  return t && typeof t.groundY === 'function' ? t : null;
}

/** Write one quad from four (x, z) corners; each corner takes its own road height. */
function quad(p, x0, z0, x1, z1, x2, z2, x3, z3, yOff, ground, cr, cg, cb, ca) {
  const o = p.n * 12;
  const stride = p.col.length / (p.cap * 4);     // 3 for the streaks, 4 where alpha rides along
  const co = p.n * 4 * stride;
  const X = [x0, x1, x2, x3], Z = [z0, z1, z2, z3];
  for (let k = 0; k < 4; k++) {
    p.pos[o + k * 3] = X[k];
    p.pos[o + k * 3 + 1] = ground(Z[k]) + yOff;
    p.pos[o + k * 3 + 2] = Z[k];
    p.col[co + k * stride] = cr;
    p.col[co + k * stride + 1] = cg;
    p.col[co + k * stride + 2] = cb;
    if (stride === 4) p.col[co + k * stride + 3] = ca;
  }
  p.n++;
}

function buildReflections(track) {
  refl.n = 0;
  if (!PARAMS.reflOn || !track || typeof track.lights !== 'function') return;
  const cam = ctx.camera;
  const cx = cam.position.x, cy = cam.position.y, cz = cam.position.z;
  const src = track.lights();
  report_.sources = src.length;
  const cand = [];
  for (let i = 0; i < src.length; i++) {
    const l = src[i];
    if (l.z <= cz + 0.8) continue;                              // behind, or level with, the camera
    const gy = track.groundY(l.z);
    const hy = l.y - gy;
    if (hy < PARAMS.reflMinY || hy > PARAMS.reflMaxY) continue;
    const eye = cy - gy;
    if (eye <= 0.15) continue;                                  // camera at or under the road
    const t = eye / (eye + hy);                                 // the specular point (see the header)
    const px = cx + (l.x - cx) * t, pz = cz + (l.z - cz) * t;
    if (Math.abs(px) > PARAMS.reflX) continue;                  // its image falls off the carriageway
    const dx = px - cx, dz = pz - cz;
    const dist = Math.hypot(dx, dz);
    if (dist < 0.35 || dist > PARAMS.reflFar) continue;
    // fade in off the camera and out at the far end, so nothing pops as a chunk recycles
    const near = clamp((dist - PARAMS.reflNear * 0.35) / PARAMS.reflNear, 0, 1);
    const far = clamp((PARAMS.reflFar - dist) / (PARAMS.reflFar * 0.42), 0, 1);
    // a low sign returns a tight bright smear; a lamp 10 m up spreads the same flux over far more road
    const height = clamp(PARAMS.reflSpread / Math.max(hy, 0.6), 0.22, 1);
    const amp = PARAMS.reflGain * clamp(l.intensity || 1, 0.15, 2.2) * near * far * height;
    if (amp < 0.012) continue;
    cand.push({ l, px, pz, dx: dx / dist, dz: dz / dist, dist, hy, amp });
  }
  cand.sort((a, b) => b.amp - a.amp);
  const n = Math.min(cand.length, refl.cap);
  const ground = (z) => track.groundY(z);
  for (let i = 0; i < n; i++) {
    const s = cand[i];
    const L = clamp(PARAMS.reflLenBase + s.hy * PARAMS.reflLen, 1.6, PARAMS.reflLenMax);
    const W = clamp(PARAMS.reflWidth + (s.l.range || 3) * PARAMS.reflWidthRange, 0.34, PARAMS.reflWidthMax);
    const ax = s.dx, az = s.dz;                 // unit, camera -> specular point
    const bx = -az, bz = ax;                    // across the smear
    const hw = W * 0.5;
    const fx = s.px + ax * L * PARAMS.reflAhead, fz = s.pz + az * L * PARAMS.reflAhead;         // v = 0, hot end
    const nx = s.px - ax * L * (1 - PARAMS.reflAhead), nz = s.pz - az * L * (1 - PARAMS.reflAhead); // v = 1
    const c = hexLin(s.l.color >>> 0);
    quad(refl,
      fx - bx * hw, fz - bz * hw,
      fx + bx * hw, fz + bz * hw,
      nx + bx * hw * 1.55, nz + bz * hw * 1.55,   // fans out toward the camera, like a real smear
      nx - bx * hw * 1.55, nz - bz * hw * 1.55,
      PARAMS.reflY, ground, c.r * s.amp, c.g * s.amp, c.b * s.amp, 1);
  }
  report_.refl = refl.n;
}

function addShadow(track, x, z, rx, rz, alpha) {
  if (shad.n >= shad.cap || alpha <= 0.02) return;
  const ground = (zz) => track.groundY(zz);
  quad(shad, x - rx, z - rz, x + rx, z - rz, x + rx, z + rz, x - rx, z + rz,
    PARAMS.shadowY, ground, 0, 0, 0, alpha);
}

function buildShadows(track) {
  shad.n = 0;
  if (!PARAMS.shadowOn || !track) return;
  const m = ctx.modules || {}, s = ctx.state, cz = ctx.camera.position.z;
  // --- the runner: shrinks and lifts as he jumps, which is what sells the jump
  const player = m.player;
  const pobj = player && typeof player.getObject === 'function' ? player.getObject() : null;
  if (pobj) {
    const pz = pobj.position.z, gy = track.groundY(pz);
    const h = clamp(pobj.position.y - gy, 0, 2.2);
    const lift = clamp(1 - h / 1.5, 0.22, 1);
    const grow = 1 + h * 0.30;
    const squash = s.rolling ? 1.35 : 1;
    addShadow(track, pobj.position.x, pz, 0.46 * grow * squash, 0.60 * grow * squash,
      PARAMS.shadowDark * lift);
  }
  // --- the pack
  const pack = m.pack;
  const dogs = pack && typeof pack.getDogs === 'function' ? pack.getDogs() : null;
  if (dogs) for (let i = 0; i < dogs.length; i++) {
    const o = dogs[i] && dogs[i].obj;
    if (!o) continue;
    const gy = track.groundY(o.position.z);
    const h = clamp(o.position.y - gy, 0, 1.2);
    addShadow(track, o.position.x, o.position.z, 0.42, 0.56, PARAMS.shadowDark * clamp(1 - h / 1.0, 0.25, 1));
  }
  // --- everything the level stood on the road. 'roll' rows hang in the air; they get none.
  const obs = m.obstacles;
  if (PARAMS.shadowProps && obs && typeof obs.rows === 'function') {
    const rows = obs.rows();
    for (let r = 0; r < rows.length && shad.n < shad.cap; r++) {
      const row = rows[r];
      if (row.z < cz - 6 || row.z > cz + PARAMS.shadowFar) continue;
      for (const it of row.items) {
        if (it.kind === 'roll' || !it.box) continue;
        const b = it.box;
        // 0.95 of the FULL width, i.e. a patch about 1.9x the footprint. At 0.60 the quad was barely
        // wider than the box and every dark pixel sat underneath it where the camera never sees it.
        const rx = clamp((b.max.x - b.min.x) * 0.95, 0.30, 1.9);
        const rz = clamp((b.max.z - b.min.z) * 0.95, 0.30, 3.0);
        const zc = (b.min.z + b.max.z) * 0.5;
        addShadow(track, (b.min.x + b.max.x) * 0.5, zc, rx, rz, PARAMS.shadowDark * 0.80);
        if (shad.n >= shad.cap) break;
      }
    }
  }
  report_.shadows = shad.n;
}

export function update(dt, c) {
  if (c && c.THREE) ctx = c;
  if (!PARAMS.on || !ctx || !refl || !shad) return;
  const track = trackMod();
  if (!track) { refl.n = 0; shad.n = 0; flush(refl); flush(shad); return; }
  buildReflections(track);
  buildShadows(track);
  flush(refl);
  flush(shad);
}

export function report() { return { ...report_ }; }

/** Live tuning from the console, the way lighting.js does it. Not part of any contract. */
export function tune(o = {}) { Object.assign(PARAMS, o); return { ...PARAMS }; }
globalThis.__roadfx = { PARAMS, report, tune };
