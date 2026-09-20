/**
 * lighting.js — E4. Night in the yokocho: the rig keeps the sky, the haze and the tone curve; the
 * street lights itself.
 *
 *   init(ctx)            rig already exists at hour 19.4 (main.js). Overrides the sky, builds an
 *                        environment with the amber street in it, sets a low two-temperature fill,
 *                        allocates the practical pool.
 *   update(dt)           every frame: assign the pool to the nearest practicals (hysteresis),
 *                        keep the ground pools in step with the live chunks.
 *   groundCheck()        renders one frame and reads the wet road under the nearest lit sign and
 *                        3 m / 6 m further down the road, as displayed sRGB luma. For the critic.
 *   sources()            the world-space practical list lighting is currently reading.
 *   report()             { pool, active, warm, cool, sky, fill }
 *
 * WHY THIS SHAPE (rig.js header, "AT NIGHT, READ THIS"): below the horizon the rig is sky + haze +
 * a cool fill only; a scene lit by that alone has one colour temperature. So:
 *
 *  SKY. The rig's own atmosphere uniforms are overwritten with stops fitted to the bar's palette
 *  (CLAIMS C4: a blue class 0x1d406f, B-R >= 60, in the top band; STYLE: 0x1d3150 at the horizon,
 *  0x212841 far-street haze, warm 0x231718 below). "Fitted" means the display colour after the
 *  rig's ACES + exposure is the palette hex: three's ACES fit is inverted numerically (ACES_INV)
 *  and the scene-linear result goes into the uniforms, so the same numbers drive the dome, the
 *  aerial perspective and the far band (rust17 item 8, the sky-to-ground handshake). When
 *  textures/sky_dusk.webp loads (2048x864, a 21:9 strip, mapped as 360 deg x [-8, 70] deg with the
 *  poles faded) it is drawn on its own dome, per-channel gained so its 12-23 deg band averages
 *  0x1d406f, and the atmosphere stops are re-fitted to what the panorama actually shows.
 *
 *  FILL. rig.hemi is reused with a cool sky term and a WARM ground term, both low: up-facing
 *  surfaces read dusk-blue, walls and undersides read the brown of STYLE's "warm dark shade"
 *  (CLAIMS C3, R-B >= 8 in the dark cluster). The global level is set so the frame's median luma
 *  sits near 42 (C1); `?fill=` scales it for tuning.
 *
 *  PRACTICALS. A fixed pool of PointLights (phone 6, desktop 14; `?lights=N`) is created once and
 *  never made invisible (toggling a light's visibility recompiles every material in the scene).
 *  Each frame the pool is handed to the nearest practicals ahead of the runner, with 4 m of
 *  hysteresis so lights do not swap on a boundary. Two temperatures every frame is a standing
 *  critic rule, so one slot (two on desktop) is reserved for the nearest COOL practical (vending
 *  machines 0x9accf2, blue signs 0x40559f) whenever one is within 45 m. Beyond the pool a
 *  practical is emissive only, plus its ground pool (next).
 *
 *  GROUND COUPLING (GAME.md "one failure mode", traps.md): every practical must land on the wet
 *  road. The PointLight does it within the pool; for everything else ONE additive mesh of radial
 *  quads on the road under every practical carries the amber pool into the distance (warehouse
 *  example idiom), one draw call, rebuilt only when the live light set changes. `?pools=0` for A/B.
 *  groundCheck() measures the result.
 *
 * Sources of practicals, in order: `ctx.track.lights()` / `ctx.modules.track.lights()` (E1, world
 * space, cached and rebuilt when chunks recycle) when it exists, else every object under the scene
 * carrying `userData.lights` (entries in that object's local space, transformed by its matrixWorld;
 * children of such an object are not descended). Entry shape:
 *   { x, y, z, color, intensity, range (m, clamped 2..16), floor? (ground y under it) }
 *
 * INTENSITY CONVENTION. Assets author `intensity` on a RELATIVE scale of roughly 0.3 to 1.6 — a
 * paper lantern 0.6, a shop's interior spill 1.0, a wall lightbox 1.2, a sodium lamp 1.6 (see
 * game/assets/lantern_string.js, wall_lightbox.js, shophouse_a.js, utility_pole.js). three's
 * PointLight is in CANDELA with decay 2, where a practical that actually lights a street is tens
 * of candela, so a pool light gets `author x CANDELA` (below), clamped to 1.5..90 cd. The clamp is
 * also what makes an asset that authored in candela by mistake merely saturate instead of blowing
 * the frame out. The ground pool quads read the same author value, so the two stay in step.
 *
 * State written (defaults set here): state.lights = { pool, active, warm, cool }.
 * Flags: ?fill=<x> ?lights=<N> ?pools=0 ?sky=0 (no panorama) ?fog=<x>.
 */
import * as textures from './textures.js';

const Q = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); } })();
const qn = (k, d) => { const v = Number(Q.get(k)); return Q.has(k) && Number.isFinite(v) ? v : d; };

/** Display targets, sRGB hex, from STYLE.md / CLAIMS.md. */
export const SKY = {
  zenith: 0x162f56, high: 0x1d406f, mid: 0x1d406f, low: 0x1d406f, horizon: 0x1d3150,
  haze: 0x212841, below: 0x231718, band: 0x1d406f,
};
export const PARAMS = {
  fill: qn('fill', 1) * 1.4,        // hemisphere intensity, linear irradiance (three >= r155: no PI on hemi); tuned in work/e4
  candela: qn('lgain', 1) * 26,     // author intensity (0.3..1.6) -> candela; see INTENSITY CONVENTION
  emissive: qn('emissive', 1),      // scale on every emissiveIntensity in the scene (1 = as authored)
  // The fill is two temperatures on its own: dusk-blue from above, and the street's own amber
  // bounce from below, which is what keeps SHADE WARM (CLAIMS C3, R-B >= 8 in the dark cluster).
  // A wall sees the 50/50 mix, so the ground term is the brighter of the two on purpose.
  fillSky: 0x3d5c92, fillGround: 0xc8763a, fillGroundGain: 1.9,
  poolPhone: 6, poolDesktop: 14,
  hysteresis: 4, ahead: 6, maxDist: 60, coolReach: 45,
  // A PointLight's `distance` is a hard cutoff, and assets author `range` as the size of the glow
  // on the fitting, not as how far the lamp throws. Multiply, or a sign 3 m up lights nothing at
  // road level and the ground-coupling check reads the same either side of it.
  reach: qn('reach', 1) * 1.9,
  poolsOn: Q.get('pools') !== '0', poolOpacity: 0.34,
  // Wet asphalt smears a reflection TOWARD the viewer, so the pool is an ellipse stretched along
  // z, not a disc: that is C7's "the road reflects the signs" and it is what carries the amber
  // into the bottom quarter, where a point light 3 m up cannot reach.
  poolStretch: 3.2,
  panorama: Q.get('sky') !== '0',
  fogStart: 12, fogDensity: 0.008 * qn('fog', 1),
  envAmber: 0xe5b055, envAmberGain: 0.45,
};

let ctx = null, THREE = null, rig = null, scene = null;
let pool = [];                 // PointLights
let slots = [];                // per pool index: { key, light } | null
let srcList = [], srcRef = null, srcFrame = -999, frame = 0;
let poolsMesh = null, poolsTex = null, poolsHash = '';
let skyDome = null, skyTex = null, skyGain = [1, 1, 1];
let envScene = null;
let exposure = 1.25;
const report_ = { pool: 0, active: 0, warm: 0, cool: 0, sky: 'gradient', fill: 0 };

/* ------------------------------------------------------------ colour maths */

const srgbToLin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
const linToSrgb = (c) => (c <= 0.0031308 ? c * 12.92 : 1.055 * Math.pow(c, 1 / 2.4) - 0.055);
const hexLin = (h) => [srgbToLin(((h >> 16) & 255) / 255), srgbToLin(((h >> 8) & 255) / 255), srgbToLin((h & 255) / 255)];

// three's ACESFilmicToneMapping: x *= exposure/0.6; In*x; RRTAndODTFit; Out*; saturate.
const ACES_IN = [[0.59719, 0.35458, 0.04823], [0.07600, 0.90834, 0.01566], [0.02840, 0.13383, 0.83777]];
const ACES_OUT = [[1.60475, -0.53108, -0.07367], [-0.10208, 1.10813, -0.00605], [-0.00327, -0.07276, 1.07602]];
function inv3(m) {
  const [a, b, c] = m[0], [d, e, f] = m[1], [g, h, i] = m[2];
  const A = e * i - f * h, B = -(d * i - f * g), C = d * h - e * g;
  const det = a * A + b * B + c * C;
  return [[A / det, -(b * i - c * h) / det, (b * f - c * e) / det],
    [B / det, (a * i - c * g) / det, -(a * f - c * d) / det],
    [C / det, -(a * h - b * g) / det, (a * e - b * d) / det]];
}
const ACES_IN_INV = inv3(ACES_IN), ACES_OUT_INV = inv3(ACES_OUT);
const mul3 = (m, v) => [m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2], m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2], m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2]];
function fitInv(y) {
  const a = 1 - 0.983729 * y, b = 0.0245786 - 0.432951 * y, c = -0.000090537 - 0.238081 * y;
  return (-b + Math.sqrt(Math.max(b * b - 4 * a * c, 0))) / (2 * a);
}
/** Scene-linear rgb that the rig's ACES at `exp` displays as display-linear `d`. */
export function ACES_INV(d, exp = exposure) {
  const y = mul3(ACES_OUT_INV, d).map((v) => Math.min(0.999, Math.max(0, v)));
  const v = y.map(fitInv);
  return mul3(ACES_IN_INV, v).map((x) => Math.max(0, x) * 0.6 / exp);
}
/** Forward, for checking the inverse. */
export function ACES(x, exp = exposure) {
  const v = mul3(ACES_IN, x.map((c) => c * exp / 0.6));
  const f = v.map((c) => (c * (c + 0.0245786) - 0.000090537) / (c * (0.983729 * c + 0.4329510) + 0.238081));
  return mul3(ACES_OUT, f).map((c) => Math.min(1, Math.max(0, c)));
}
const isCool = (hex) => ((hex & 255) > ((hex >> 16) & 255));

/* ------------------------------------------------------------ init */

export async function init(c) {
  ctx = c; THREE = c.THREE; rig = c.rig; scene = c.scene;
  exposure = c.renderer.toneMappingExposure || 1.25;
  // Hour 19.4: the key is below the horizon and nothing else casts, so a shadow pass would be a
  // second draw of every chunk for nothing (E1 measured ~700k live tris). Off, on every tier.
  c.renderer.shadowMap.enabled = false;
  c.renderer.shadowMap.autoUpdate = false;
  c.state = c.state || {};
  c.state.lights = { pool: 0, active: 0, warm: 0, cool: 0 };

  applySkyStops(Object.fromEntries(Object.entries(SKY).map(([k, h]) => [k, ACES_INV(hexLin(h))])));
  if (rig.atmos.uAtmSunGlow) rig.atmos.uAtmSunGlow.value.setRGB(0, 0, 0);
  rig.atmos.uAerStart.value = PARAMS.fogStart;
  rig.atmos.uAerDensity.value = PARAMS.fogDensity;
  rig.fog.near = PARAMS.fogStart;
  rig.fog.far = PARAMS.fogStart + 3 / Math.max(1e-6, PARAMS.fogDensity) * 0.35;
  const hz = ACES(ACES_INV(hexLin(SKY.haze)));
  rig.fog.color.setRGB(hz[0], hz[1], hz[2]);
  if (scene.background && scene.background.isColor) scene.background.copy(rig.fog.color);

  // the fill: cool from above, warm from the street, low
  rig.hemi.color.setHex(PARAMS.fillSky);
  rig.hemi.groundColor.setHex(PARAMS.fillGround).multiplyScalar(PARAMS.fillGroundGain);
  rig.hemi.intensity = PARAMS.fill;
  report_.fill = PARAMS.fill;

  // the practical pool
  const tier = (rig.tier && rig.tier.name) || (c.state.tier) || 'high';
  const N = qn('lights', tier === 'phone' ? PARAMS.poolPhone : PARAMS.poolDesktop);
  for (let i = 0; i < N; i++) {
    const L = new THREE.PointLight(0xe5b055, 0, 5, 2);
    L.name = 'practical.' + i;
    L.castShadow = false;
    scene.add(L);
    pool.push(L); slots.push(null);
  }
  report_.pool = N; c.state.lights.pool = N;

  buildEnvironment();
  if (PARAMS.panorama) loadPanorama();      // not awaited: never delays READY
  poolsTex = radialTexture();
  console.info(`[lighting] dusk: ${N} practicals, fill ${PARAMS.fill.toFixed(2)}, pools ${PARAMS.poolsOn ? 'on' : 'off'}`);
}

function applySkyStops(lin) {
  const U = rig.atmos;
  const set = (name, v) => { const u = U['uAtm' + name[0].toUpperCase() + name.slice(1)]; if (u && v) u.value.setRGB(v[0], v[1], v[2]); };
  for (const k of ['horizon', 'low', 'mid', 'high', 'zenith', 'haze', 'below']) set(k, lin[k]);
}

/* ------------------------------------------------------------ panorama */

const PANO_VS = 'varying vec3 vDir; void main() { vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); p.z = p.w * 0.999999; gl_Position = p; }';
const PANO_FS = /* glsl */`
uniform sampler2D tSky; uniform vec3 uGain, uCap, uBelow; uniform float uExposure, uElTop, uElBot;
uniform mat3 uInInv, uOutInv;
varying vec3 vDir;
vec3 fitInv(vec3 y) { vec3 a = 1.0 - 0.983729 * y; vec3 b = 0.0245786 - 0.432951 * y; vec3 c = -0.000090537 - 0.238081 * y;
  return (-b + sqrt(max(b * b - 4.0 * a * c, vec3(0.0)))) / (2.0 * a); }
vec3 invACES(vec3 d) { vec3 y = clamp(uOutInv * d, 0.0, 0.999); return max(uInInv * fitInv(y), 0.0) * (0.6 / uExposure); }
void main() {
  vec3 d = normalize(vDir);
  float el = asin(clamp(d.y, -1.0, 1.0));
  float u = atan(d.z, d.x) / 6.2831853 + 0.5;
  float v = clamp((el - uElBot) / (uElTop - uElBot), 0.0, 1.0);
  vec3 col = texture2D(tSky, vec2(u, v)).rgb * uGain;
  col = mix(col, uCap, smoothstep(uElTop, uElTop + 0.3, el));
  col = mix(col, uBelow, 1.0 - smoothstep(uElBot - 0.15, uElBot, el));   // edges ascending: reversed edges are undefined in GLSL
  gl_FragColor = vec4(invACES(col), 1.0);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
const EL_TOP = 70 * Math.PI / 180, EL_BOT = -8 * Math.PI / 180;

async function loadPanorama() {
  const t = await textures.load('sky_dusk.webp');
  if (!t || !scene) return;
  t.wrapS = THREE.RepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping;
  skyTex = t;
  // fit: the 12..23 degree band (the top fifth of a portrait phone frame) averages SKY.band
  const bands = samplePanorama(t.image);
  const bandMean = bands.between(12, 23);
  const target = hexLin(SKY.band);
  skyGain = bandMean.map((m, i) => Math.min(1.5, target[i] / Math.max(1e-4, m)));
  const cap = bands.between(66, 90).map((m, i) => m * skyGain[i]);
  const m3 = (m) => new THREE.Matrix3().set(m[0][0], m[0][1], m[0][2], m[1][0], m[1][1], m[1][2], m[2][0], m[2][1], m[2][2]);
  const mat = new THREE.ShaderMaterial({
    uniforms: {
      tSky: { value: t }, uGain: { value: new THREE.Vector3(...skyGain) },
      uCap: { value: new THREE.Vector3(...cap) }, uBelow: { value: new THREE.Vector3(...hexLin(SKY.below)) },
      uExposure: { value: exposure }, uElTop: { value: EL_TOP }, uElBot: { value: EL_BOT },
      uInInv: { value: m3(ACES_IN_INV) }, uOutInv: { value: m3(ACES_OUT_INV) },
    },
    vertexShader: PANO_VS, fragmentShader: PANO_FS, side: THREE.BackSide, depthWrite: false, fog: false,
  });
  skyDome = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), mat);
  skyDome.frustumCulled = false; skyDome.renderOrder = -999; skyDome.name = 'lighting.sky';
  scene.add(skyDome);
  const rigSky = scene.getObjectByName('rig.sky'); if (rigSky) rigSky.visible = false;
  // the handshake: the haze and the far band fade toward what the panorama actually shows
  const g = (a, b) => ACES_INV(bands.between(a, b).map((m, i) => m * skyGain[i]));
  applySkyStops({ horizon: g(0, 5), low: g(8, 16), mid: g(30, 40), high: g(50, 60), zenith: cap.length ? ACES_INV(cap) : null, haze: g(-4, 3) });
  const hz = ACES(g(-4, 3)); rig.fog.color.setRGB(hz[0], hz[1], hz[2]);
  if (scene.background && scene.background.isColor) scene.background.copy(rig.fog.color);
  report_.sky = 'panorama';
  buildEnvironment();
  console.info(`[lighting] sky panorama on, gain ${skyGain.map((v) => v.toFixed(2)).join('/')}`);
}

/** Mean display-linear colour of the panorama between two elevations (degrees). */
function samplePanorama(img) {
  const W = 128, H = 54;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const g = cv.getContext('2d'); g.drawImage(img, 0, 0, W, H);
  const px = g.getImageData(0, 0, W, H).data;
  const rowOf = (elDeg) => { const v = (elDeg * Math.PI / 180 - EL_BOT) / (EL_TOP - EL_BOT); return Math.round((1 - Math.min(1, Math.max(0, v))) * (H - 1)); };
  return {
    between(a, b) {
      let r0 = rowOf(b), r1 = rowOf(a); if (r1 < r0) [r0, r1] = [r1, r0];
      const sum = [0, 0, 0]; let n = 0;
      for (let y = r0; y <= r1; y++) for (let x = 0; x < W; x++) { const i = (y * W + x) * 4; sum[0] += srgbToLin(px[i] / 255); sum[1] += srgbToLin(px[i + 1] / 255); sum[2] += srgbToLin(px[i + 2] / 255); n++; }
      return sum.map((s) => s / Math.max(1, n));
    },
  };
}

/* ------------------------------------------------------------ environment */

/**
 * scene.environment: the sky as it is now, plus an amber band at street level standing in for
 * the signs, so the wet road, the tin and the gold coin reflect two temperatures. The rig's
 * envDiffuse patch keeps its diffuse share at 10 percent; it is a reflection, not a fill.
 */
function buildEnvironment() {
  const renderer = ctx.renderer;
  envScene = new THREE.Scene();
  // the sky as a reflection: the panorama dome when it exists, else the rig's dome (its material
  // reads the same atmosphere uniforms this module just fitted)
  const dome = skyDome || scene.getObjectByName('rig.sky');
  if (dome) { const d = dome.clone(); d.visible = true; d.scale.setScalar(60); envScene.add(d); }
  const amber = hexLin(PARAMS.envAmber).map((v) => v * PARAMS.envAmberGain);
  const band = new THREE.Mesh(new THREE.CylinderGeometry(40, 40, 5, 48, 1, true),
    new THREE.MeshBasicMaterial({ color: new THREE.Color(amber[0], amber[1], amber[2]), side: THREE.BackSide, fog: false, toneMapped: false }));
  band.position.y = 2.2;
  envScene.add(band);
  const gnd = hexLin(SKY.below);
  const floor = new THREE.Mesh(new THREE.CircleGeometry(45, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(gnd[0], gnd[1], gnd[2]), fog: false, toneMapped: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.5;
  envScene.add(floor);
  try {
    const pm = new THREE.PMREMGenerator(renderer);
    const tex = pm.fromScene(envScene, 0.04, 0.5, 100).texture;
    pm.dispose();
    const old = scene.environment;
    scene.environment = tex;
    scene.environmentIntensity = 1.0;
    if (old && old !== tex) old.dispose();
  } catch (e) { console.warn('[lighting] environment build failed', e && e.message); }
}

/* ------------------------------------------------------------ sources */

function gather() {
  const track = (ctx.track && typeof ctx.track.lights === 'function') ? ctx.track
    : (ctx.modules && ctx.modules.track);
  if (track && typeof track.lights === 'function') {
    const L = track.lights();
    if (Array.isArray(L)) {
      if (L !== srcRef) { srcRef = L; srcList = L.map(normalise); }
      return srcList;
    }
  }
  if (frame - srcFrame < 15 && srcList.length) return srcList;
  srcFrame = frame;
  const out = [];
  const v = new THREE.Vector3(), s = new THREE.Vector3();
  const visit = (o) => {
    if (o === skyDome || o.isLight) return;
    const L = o.userData && o.userData.lights;
    if (Array.isArray(L) && L.length) {
      o.matrixWorld.decompose(new THREE.Vector3(), new THREE.Quaternion(), s);
      const k = Math.max(s.x, s.y, s.z) || 1;
      for (const l of L) {
        v.set(l.x || 0, l.y || 0, l.z || 0).applyMatrix4(o.matrixWorld);
        out.push(normalise({ ...l, x: v.x, y: v.y, z: v.z, range: (l.range || 5) * k }));
      }
      return;
    }
    for (const ch of o.children) visit(ch);
  };
  visit(scene);
  srcList = out;
  return srcList;
}
function normalise(l) {
  const color = typeof l.color === 'number' ? l.color : 0xe5b055;
  const track = (ctx.track && ctx.track.groundY) ? ctx.track : (ctx.modules && ctx.modules.track);
  let floor = l.floor;
  if (!Number.isFinite(floor)) { try { floor = track && track.groundY ? track.groundY(l.z) : 0; } catch (e) { floor = 0; } }
  if (!Number.isFinite(floor)) floor = 0;
  const author = Number(l.intensity);
  return {
    x: l.x, y: l.y, z: l.z, color, cool: isCool(color),
    author: Number.isFinite(author) ? author : 0.8,
    intensity: Math.min(90, Math.max(1.5, (Number.isFinite(author) ? author : 0.8) * PARAMS.candela)),
    range: Math.min(16, Math.max(2, Number(l.range) || 5)),
    floor, key: `${l.x.toFixed(2)},${l.y.toFixed(2)},${l.z.toFixed(2)}`,
  };
}
export function sources() { return gather(); }

/* ------------------------------------------------------------ pool assignment */

function assign() {
  const cam = ctx.camera;
  const st = ctx.state || {};
  const cx = cam.position.x, cz = cam.position.z;
  const zRef = (Number.isFinite(st.z) ? st.z : cz) + PARAMS.ahead;
  const list = gather();
  const cand = [];
  for (const l of list) {
    if (l.z < cz - 4) continue;                                  // behind the camera
    const d = Math.hypot(l.x - cx * 0.3, l.z - zRef);
    if (d > PARAMS.maxDist) continue;
    cand.push({ l, d });
  }
  cand.sort((a, b) => a.d - b.d);
  const N = pool.length;
  const coolSlots = N >= 10 ? 2 : (N > 0 ? 1 : 0);
  const wanted = [];
  const cools = cand.filter((c) => c.l.cool && c.d <= PARAMS.coolReach).slice(0, coolSlots);
  for (const c of cools) wanted.push(c);
  for (const c of cand) { if (wanted.length >= N) break; if (!wanted.includes(c)) wanted.push(c); }
  const wantKeys = new Map(wanted.map((c) => [c.l.key, c]));
  const worst = wanted.length ? wanted[wanted.length - 1].d : 0;
  const byKey = new Map(cand.map((c) => [c.l.key, c]));
  // keep what we have if it is still close enough (hysteresis)
  const held = new Set();
  for (let i = 0; i < N; i++) {
    const s = slots[i]; if (!s) continue;
    const c = byKey.get(s.key);
    if (c && (wantKeys.has(s.key) || c.d <= worst + PARAMS.hysteresis)) { slots[i] = { key: s.key, l: c.l }; held.add(s.key); }
    else slots[i] = null;
  }
  // fill free slots with wanted lights not yet held
  let wi = 0;
  for (let i = 0; i < N; i++) {
    if (slots[i]) continue;
    while (wi < wanted.length && held.has(wanted[wi].l.key)) wi++;
    if (wi >= wanted.length) break;
    slots[i] = { key: wanted[wi].l.key, l: wanted[wi].l }; held.add(wanted[wi].l.key); wi++;
  }
  let active = 0, warm = 0, cool = 0;
  for (let i = 0; i < N; i++) {
    const L = pool[i], s = slots[i];
    if (!s) { L.intensity = 0; continue; }
    const l = s.l;
    L.position.set(l.x, l.y, l.z);
    L.color.setHex(l.color);
    L.distance = l.range * PARAMS.reach;
    L.intensity = l.intensity;
    active++; if (l.cool) cool++; else warm++;
  }
  report_.active = active; report_.warm = warm; report_.cool = cool;
  if (st.lights) { st.lights.active = active; st.lights.warm = warm; st.lights.cool = cool; }
}

/* ------------------------------------------------------------ ground pools */

function radialTexture() {
  const s = 128;
  const cv = document.createElement('canvas'); cv.width = cv.height = s;
  const g = cv.getContext('2d');
  const img = g.createImageData(s, s);
  for (let y = 0; y < s; y++) for (let x = 0; x < s; x++) {
    const dx = (x + 0.5) / s * 2 - 1, dy = (y + 0.5) / s * 2 - 1;
    const d = Math.min(1, Math.hypot(dx, dy));
    const a = Math.pow(1 - d, 2.4);
    const i = (y * s + x) * 4;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = 255; img.data[i + 3] = Math.round(a * 255);
  }
  g.putImageData(img, 0, 0);
  const t = new THREE.CanvasTexture(cv);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function rebuildPools(list) {
  const cam = ctx.camera;
  const near = list.filter((l) => Math.abs(l.z - cam.position.z) < 160 && l.y - l.floor < 12);
  const hash = near.length + ':' + near.map((l) => l.key).join('|');
  if (hash === poolsHash) return;
  poolsHash = hash;
  if (poolsMesh) { scene.remove(poolsMesh); poolsMesh.geometry.dispose(); poolsMesh = null; }
  if (!near.length || !PARAMS.poolsOn) return;
  const n = near.length;
  const pos = new Float32Array(n * 12), uv = new Float32Array(n * 8), col = new Float32Array(n * 12), idx = new Uint32Array(n * 6);
  const c = new THREE.Color();
  for (let i = 0; i < n; i++) {
    const l = near[i];
    const r = Math.min(7, l.range * 0.8);
    const rz = r * PARAMS.poolStretch;
    const y = l.floor + 0.012;
    const h = Math.max(0.5, l.y - l.floor);
    const fade = Math.min(1, 3.5 / h);                 // a lamp 10 m up pools fainter than a sign at 2.5
    const a = PARAMS.poolOpacity * fade * Math.min(1, l.author / 0.9);
    c.setHex(l.color).multiplyScalar(a);
    // stretched toward the camera (-z, the way the runner came from) so the smear reads as a
    // reflection of the sign rather than as a disc painted on the road
    const P = [[-r, 0, -rz], [r, 0, -rz], [r, 0, r], [-r, 0, r]], U = [[0, 0], [1, 0], [1, 1], [0, 1]];
    for (let k = 0; k < 4; k++) {
      pos.set([l.x + P[k][0], y, l.z + P[k][2]], i * 12 + k * 3);
      uv.set(U[k], i * 8 + k * 2);
      col.set([c.r, c.g, c.b], i * 12 + k * 3);
    }
    idx.set([i * 4, i * 4 + 2, i * 4 + 1, i * 4, i * 4 + 3, i * 4 + 2], i * 6);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  if (!rebuildPools.mat) {
    rebuildPools.mat = new THREE.MeshBasicMaterial({ map: poolsTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false, toneMapped: true, side: THREE.DoubleSide });
  }
  poolsMesh = new THREE.Mesh(geo, rebuildPools.mat);
  poolsMesh.name = 'lighting.pools'; poolsMesh.renderOrder = 2; poolsMesh.frustumCulled = false;
  poolsMesh.matrixAutoUpdate = false;
  scene.add(poolsMesh);
}

/* ------------------------------------------------------------ per frame */

export function update(dt) {
  if (!ctx) return;
  frame++;
  if (frame % 2 === 1) assign();
  if (frame % 10 === 0 || frame < 3) rebuildPools(gather());
  if (skyDome) skyDome.position.copy(ctx.camera.position).setY(ctx.camera.position.y);
  if (skyDome) skyDome.scale.setScalar(Math.max(10, (ctx.camera.far || 400) * 0.5));
}

export function report() { return { ...report_ }; }

/**
 * Live tuning, for work/e4 only: change a PARAM and have it take effect this frame without a
 * reload. The shipped values are the defaults above; this exists so one browser launch can sweep
 * the fill / candela / pool opacity instead of one launch per combination.
 */
export function tune(o = {}) {
  Object.assign(PARAMS, o);
  if (o.fogDensity !== undefined || o.fogStart !== undefined) {
    rig.atmos.uAerDensity.value = PARAMS.fogDensity;
    rig.atmos.uAerStart.value = PARAMS.fogStart;
    rig.fog.near = PARAMS.fogStart;
    rig.fog.far = PARAMS.fogStart + 3 / Math.max(1e-6, PARAMS.fogDensity) * 0.35;
  }
  if (o.fill !== undefined) { rig.hemi.intensity = PARAMS.fill; report_.fill = PARAMS.fill; }
  if (o.fillSky !== undefined) rig.hemi.color.setHex(PARAMS.fillSky);
  if (o.fillGround !== undefined || o.fillGroundGain !== undefined) rig.hemi.groundColor.setHex(PARAMS.fillGround).multiplyScalar(PARAMS.fillGroundGain);
  if (o.candela !== undefined || o.poolOpacity !== undefined || o.poolStretch !== undefined || o.reach !== undefined) { srcRef = null; srcList = []; srcFrame = -999; poolsHash = ''; }
  if (o.emissive !== undefined) scaleEmissive(o.emissive);
  assign();
  rebuildPools(gather());
  return { ...PARAMS };
}

/** emissiveIntensity x k on every lit material in the scene, relative to what the asset authored. */
const emissive0 = new WeakMap();
function scaleEmissive(k) {
  scene.traverse((o) => {
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of ms) {
      if (!m || !m.emissive || m.emissiveIntensity === undefined) continue;
      if (m.emissive.r + m.emissive.g + m.emissive.b < 0.01) continue;
      if (!emissive0.has(m)) emissive0.set(m, m.emissiveIntensity);
      m.emissiveIntensity = emissive0.get(m) * k;
    }
  });
}

/* ------------------------------------------------------------ ground check */

/**
 * Draw one frame with the game camera and read the displayed road under the nearest active warm
 * practical ahead, and 3 m and 6 m further along the road at the same x. Luma is Rec.601 on the
 * displayed sRGB bytes, the median of a 7x7 patch. Points off screen report null.
 */
export function groundCheck() {
  const cam = ctx.camera, renderer = ctx.renderer;
  const cz = cam.position.z;
  let best = null;
  for (let i = 0; i < pool.length; i++) {
    const s = slots[i]; if (!s || s.l.cool) continue;
    const d = s.l.z - cz; if (d < 0) continue;
    if (!best || d < best.z - cz) best = s.l;
  }
  if (!best) { const L = gather().filter((l) => !l.cool && l.z > cz).sort((a, b) => a.z - b.z); best = L[0] || null; }
  if (!best) return { ok: false, reason: 'no practical ahead' };
  const x = Math.min(2.9, Math.max(-2.9, best.x));
  const pts = { under: [x, best.floor, best.z], away3: [x, best.floor, best.z + 3], away6: [x, best.floor, best.z + 6], centre: [0, best.floor, best.z] };
  rig.render(cam, 0.016);
  const gl = renderer.getContext();
  const size = renderer.getDrawingBufferSize(new THREE.Vector2());
  const buf = new Uint8Array(7 * 7 * 4);
  const v = new THREE.Vector3();
  const out = { ok: true, light: { x: best.x, y: best.y, z: best.z, color: '0x' + best.color.toString(16), intensity: best.intensity, range: best.range, floor: best.floor } };
  for (const [k, p] of Object.entries(pts)) {
    v.set(p[0], p[1], p[2]).project(cam);
    if (v.z > 1 || Math.abs(v.x) > 1 || Math.abs(v.y) > 1) { out[k] = null; continue; }
    const px = Math.round((v.x + 1) / 2 * size.x) - 3, py = Math.round((v.y + 1) / 2 * size.y) - 3;
    if (px < 0 || py < 0 || px + 7 > size.x || py + 7 > size.y) { out[k] = null; continue; }
    gl.readPixels(px, py, 7, 7, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    const lum = [], rgb = [0, 0, 0];
    for (let i = 0; i < 49; i++) { const r = buf[i * 4], g = buf[i * 4 + 1], b = buf[i * 4 + 2]; lum.push(0.299 * r + 0.587 * g + 0.114 * b); rgb[0] += r; rgb[1] += g; rgb[2] += b; }
    lum.sort((a, b) => a - b);
    out[k] = { luma: Math.round(lum[24]), rgb: rgb.map((c) => Math.round(c / 49)), px: [px + 3, size.y - (py + 3)] };
  }
  if (out.under && out.away6) out.ratio = +(out.under.luma / Math.max(1, out.away6.luma)).toFixed(2);
  return out;
}

globalThis.__lighting = { groundCheck, report, sources, tune, PARAMS };
