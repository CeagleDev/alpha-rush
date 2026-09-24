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
 *  BOUNCE. The rig's ground-bounce term is driven by the SUN, so below the horizon it is zero and
 *  every surface no practical reaches falls to black: measured, the dominant dark cluster was
 *  (2, 1, 3), against the bar's warm 0x231718. A lit street bounces, so this module drives the
 *  rig's own `uBounce` uniform from the STREET instead of from the sun — amber, normal-weighted
 *  exactly as the rig weights it (an awning soffit gets 8x what a wall gets, an up-facing surface
 *  3.5x), which is what makes shade warm without a tint pass anywhere. `?bounce=` scales it.
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
 *  groundCheck() measures the result. The quads are SMALL and elongated on purpose (poolRadius
 *  0.55 of the authored range, stretched 1.6 toward the camera): wide soft ones merge into a sheet
 *  of orange road, which measures as a pass on CLAIMS C7 and is the exact failure C7's own note
 *  calls out ("painting the road orange"). Measured at 390x844: radius 0.8 / stretch 3.2 gave
 *  46 % amber in the bottom quarter and a median of 58; these values give 5.3 % and 41.
 *
 * Sources of practicals, in order: `ctx.track.lights()` / `ctx.modules.track.lights()` (E1, world
 * space, cached and rebuilt when chunks recycle) when it exists, else every object under the scene
 * carrying `userData.lights` (entries in that object's local space, transformed by its matrixWorld;
 * children of such an object are not descended). Entry shape:
 *   { x, y, z, color, intensity, range (m, clamped 2..16), floor? (ground y under it) }
 *
 * MOUNTING HEIGHT. A practical's candela is also scaled by (height above the ground / 2.5 m)^2,
 * capped at 12x. Illuminance falls with the square of the distance, so a sodium lamp 10 m up on the
 * expressway and a lightbox 2 m up in the alley cannot carry the same candela and both light their
 * road: measured with one scale for both, the expressway frame came back at median luma 10.7 with
 * a 98th percentile of 99.7 — a whole zone of the game effectively unlit.
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
import * as textures from './textures.js?v=202609240703';
import { ATMOS_KEYS } from '../rig.js?v=202609240703';

const Q = (() => { try { return new URLSearchParams(location.search); } catch (e) { return new URLSearchParams(); } })();
const qn = (k, d) => { const v = Number(Q.get(k)); return Q.has(k) && Number.isFinite(v) ? v : d; };

/** Display targets, sRGB hex, from STYLE.md / CLAIMS.md. */
export const SKY = {
  zenith: 0x162f56, high: 0x1d406f, mid: 0x1d406f, low: 0x1d406f, horizon: 0x1d3150,
  haze: 0x212841, below: 0x231718, band: 0x1d406f,
};
export const PARAMS = {
  fill: qn('fill', 1) * 1.0, fillSkyGain: 0.3, fillGroundGain: 3.0,   // was 4.2: the rig gives an awning soffit 8x a wall, so the amber street bounce blew every soffit to white        // hemisphere intensity, linear irradiance (three >= r155: no PI on hemi); tuned in work/e4
  candela: qn('lgain', 1) * 150, heightRef: 2.5, heightExp: 1.2, heightGainMax: 4,     // author intensity (0.3..1.6) -> candela; see INTENSITY CONVENTION
  // The fill is two temperatures on its own: dusk-blue from above, and the street's own amber
  // bounce from below, which is what keeps SHADE WARM (CLAIMS C3, R-B >= 8 in the dark cluster).
  // A wall sees the 50/50 mix, so the ground term is the brighter of the two on purpose.
  fillSky: 0x3d5c92, fillGround: 0xc8763a,
  poolPhone: 6, poolDesktop: 14,
  hysteresis: 4, ahead: 6, maxDist: 60, coolReach: 45,
  // A PointLight's `distance` is a hard cutoff, and assets author `range` as the size of the glow
  // on the fitting, not as how far the lamp throws. Multiply, or a sign 3 m up lights nothing at
  // road level and the ground-coupling check reads the same either side of it.
  reach: qn('reach', 1) * 1.5,
  // Narrow and bright, not wide and dim. A wet road returns a sign as a near-specular STREAK, so
  // the same C7 area spent on a tight bright smear also puts pixels over luma 200 where the
  // reference has them (its p98 is sign faces and their reflections), whereas spreading it thin
  // lights the whole carriageway, raises the median and reads as fog on the road.
  // Measured with the A/B below: at 0.36 these quads were carrying the frame (turning them off
  // dropped the median from 72.7 to 3.3), which is why the carriageway read as flat glare — an
  // additive quad has no falloff detail, no normal map and no texture in it. They are a SUPPLEMENT
  // for practicals with no live point light; the real lights do the lighting.
  poolsOn: Q.get('pools') !== '0', poolOpacity: qn('pool', 1) * 0.11, poolRadius: 0.32,
  // A pool quad stands in for a practical that has NO live point light. Where a light does have
  // one, the road is already lit for real and the quad lands on top of it: that double count is
  // what blew the centre of the carriageway to white. Keep a fraction so the swap is not a step.
  poolLive: 0.15,
  // Wet asphalt smears a reflection TOWARD the viewer, so the pool is an ellipse stretched along
  // z, not a disc: that is C7's "the road reflects the signs" and it is what carries the amber
  // into the bottom quarter, where a point light 3 m up cannot reach.
  poolStretch: 2.4, poolInset: 0.2,
  panorama: Q.get('sky') !== '0',
  fogStart: 12, fogDensity: 0.008 * qn('fog', 1),
  envAmber: 0xe5b055, envAmberGain: 0.45,
  // The environment is a REFLECTION, and on a roughness-0.18 road a strong one is a broad sheen
  // over the whole carriageway: it lifts the median without putting a single pixel where the
  // reference has its brights. Kept low so the road's highlights come from the practicals.
  envIntensity: qn('env', 1) * 0.6,
  // bounceSide is the rig's own dial and it keeps it at 0.15 so DAYLIGHT shade stays cool against
  // a warm key. At night the relationship inverts: the street is the warm source and the sky is
  // the cool one, so a wall should catch the street. Opened up, with the bounce itself driven from
  // the street colour rather than the (absent) sun.
  bounce: qn('bounce', 1) * 2.4, bounceColor: 0xbf7c42, bounceSide: 0.6,
  // The rig gives an UP-FACING surface 3.5x the bounce, because in daylight an up-facing surface
  // in shadow sees sunlit ground and walls all round it. At night the road IS the ground: pouring
  // the street's own bounce back onto it washed the whole carriageway warm and put CLAIMS C7 at
  // 17.5 % against the bar's 6.1 %, with the median 4 luma high. Walls and soffits keep theirs.
  bounceFlat: 0.4,
  // The night exposure. The rig reads 1.25 off its atmosphere table for "well after sunset", which
  // is an exposure for an empty sky; a street lit by its own signs wants more, and the measured
  // build came in 13 luma under the bar's median with its 98th percentile 64 low. Set here rather
  // than passed to createRig because main.js owns that call.
  exposure: qn('exposure', 1) * 1.05,
  // Emissive faces are the only thing in a night frame that can reach the top of the curve (the
  // rig's bloom needs post, and the phone tier has none), and CLAIMS C2 is about exactly those
  // pixels. Assets author 1.8-3.0 per STYLE; this is the night's exposure of that channel, applied
  // to what is in the scene and re-applied as chunks spawn.
  emissive: qn('emissive', 1) * 1.9,
  // ...and a CEILING on what that reaches, because the top of the ACES curve has no colour in it.
  // Uncapped, a cream paper lantern goes to (233, 229, 217) and reads as a featureless white blob
  // with its ribs gone; the reference's brightest pixels are sign faces that still show their
  // strokes. Capped at the max emissive channel, in linear radiance before the curve.
  emissiveCap: qn('emissivecap', 1) * 2.1,
};
const NEAR_SOFT_M = 5.0;      // metres: below this a practical is eased down (see assign())
const NEAR_SOFT_MIN = 0.22;
const HERO_SOFT_M = 3.4, HERO_SOFT_MIN = 0.12, HERO_E_MAX = qn('heroe', 7);   // see applyPool(): the cap on what any practical delivers at the runner   // floor, so a close lantern still reads as lit rather than switching off
// STROBE FIX. Measured on the screencast: the runner's jacket flipped between orange and washed-out
// 19 times in 6.4 s (~3 Hz) and the nearest-light set changed 19 times in 15 m of travel. Cause: a
// lantern string hangs six practicals a metre apart directly over the runner's lane, and with a
// six-light pool the nearest set churned on every lantern passed — each swap a hard cut. Two fixes
// that belong together: (a) practicals within CLUSTER_M of each other become ONE light (a string is
// one source, a sign and its lantern are one source), so the set stops churning; (b) pool lights
// FADE in and out over ~0.3 s (FADE_RATE) instead of switching, so whatever churn remains is a
// dissolve, not a strobe. A leaving light keeps its slot until it has faded.
const CLUSTER_M = 2.2;
const FADE_RATE = 7;          // 1/s: 90 % of the way in ~0.33 s

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
  // Set the exposure FIRST: every sky stop below is fitted through ACES at this value, so fitting
  // at the rig's 1.25 and then rendering at ours would put the whole dome off its palette target.
  exposure = PARAMS.exposure;
  c.renderer.toneMappingExposure = exposure;
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
  // The fill, warm-dominant. A HemisphereLight gives its `color` to UP-facing surfaces and its
  // `groundColor` to down-facing ones, with walls on the mix — so at night the blue belongs mostly
  // to the sky dome and the cool signs, not to this, or every unlit surface in the alley reads
  // blue and CLAIMS C3 inverts (measured on the assembled build: R-B -6.5 against the bar's +7).
  rig.hemi.color.setHex(PARAMS.fillSky).multiplyScalar(PARAMS.fillSkyGain);
  rig.hemi.groundColor.setHex(PARAMS.fillGround).multiplyScalar(PARAMS.fillGroundGain);
  rig.hemi.intensity = PARAMS.fill;
  report_.fill = PARAMS.fill;

  // the street's own bounce, in place of the sun's (which is off below the horizon)
  applyBounce();

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

  scaleEmissive(PARAMS.emissive);
  buildEnvironment();
  // the day's key: always in the scene (adding a light later recompiles every material), dark at night
  daySun = new THREE.DirectionalLight(0xffffff, 0);
  daySun.name = 'lighting.daySun'; daySun.castShadow = false;
  scene.add(daySun); scene.add(daySun.target);
  snapshotNight();
  buildDayEnvironment();
  if (PARAMS.panorama) loadPanorama();      // not awaited: never delays READY
  if (DAY_PANORAMA) loadDayPanorama();
  poolsTex = radialTexture();
  console.info(`[lighting] dusk: ${N} practicals, fill ${PARAMS.fill.toFixed(2)}, pools ${PARAMS.poolsOn ? 'on' : 'off'}`);
}

function applyBounce() {
  const B = rig.bounce;
  if (!B || !B.uBounce) return;
  const c = hexLin(PARAMS.bounceColor);
  B.uBounce.value.setRGB(c[0] * PARAMS.bounce, c[1] * PARAMS.bounce, c[2] * PARAMS.bounce);
  if (B.uBounceSide) B.uBounceSide.value = PARAMS.bounceSide;
  if (B.uBounceFlat) B.uBounceFlat.value = PARAMS.bounceFlat;
}

function applySkyStops(lin) {
  const U = rig.atmos;
  const set = (name, v) => { const u = U['uAtm' + name[0].toUpperCase() + name.slice(1)]; if (u && v) u.value.setRGB(v[0], v[1], v[2]); };
  for (const k of ['horizon', 'low', 'mid', 'high', 'zenith', 'haze', 'below']) set(k, lin[k]);
}

/* ------------------------------------------------------------ panorama */

const PANO_VS = 'varying vec3 vDir; void main() { vDir = position; vec4 p = projectionMatrix * modelViewMatrix * vec4(position, 1.0); p.z = p.w * 0.999999; gl_Position = p; }';
const PANO_FS = /* glsl */`
uniform sampler2D tSky; uniform vec3 uGain, uCap, uBelow; uniform float uExposure, uElTop, uElBot, uAlpha;
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
  gl_FragColor = vec4(invACES(col), uAlpha);
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
      uExposure: { value: exposure }, uElTop: { value: EL_TOP }, uElBot: { value: EL_BOT }, uAlpha: { value: 1 },
      uInInv: { value: m3(ACES_IN_INV) }, uOutInv: { value: m3(ACES_OUT_INV) },
    },
    vertexShader: PANO_VS, fragmentShader: PANO_FS, side: THREE.BackSide, depthWrite: false, fog: false, transparent: true,
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
  scaleEmissive(PARAMS.emissive);
  buildEnvironment();
  snapshotNight();
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
    const old = envNight;
    envNight = tex;
    if (!envIsDay) { scene.environment = tex; scene.environmentIntensity = PARAMS.envIntensity; }
    if (old && old !== tex && old !== envDay) old.dispose();
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
  const author = Number.isFinite(Number(l.intensity)) ? Number(l.intensity) : 0.8;
  const h = Math.max(0.4, (l.y || 0) - floor);
  // Softer than a true inverse square: a sign 4 m up lights the WALL beside it as much as the
  // road, so compensating in full over-lights the alley (measured: median luma 54 against the
  // bar's 39.6). An exponent of 1.2 still carries a 10 m lamp head to the deck below it.
  const heightGain = Math.min(PARAMS.heightGainMax, Math.max(1, (h / PARAMS.heightRef) ** PARAMS.heightExp));
  return {
    x: l.x, y: l.y, z: l.z, color, cool: isCool(color),
    author, heightGain: +heightGain.toFixed(2),
    intensity: Math.min(900, Math.max(1.5, author * PARAMS.candela * heightGain)),
    // A lamp head 10 m up whose asset authored `range: 12` (the size of its own glow) throws a
    // circle of only sqrt(12^2 - 10^2) = 6.6 m on the road below it, so the expressway deck came
    // out unlit between lamps. Tall mounts get a range floor of 1.6x their height.
    range: Math.min(26, Math.max(2, Number(l.range) || 5, h > 7 ? h * 1.6 : 0)),
    floor, key: `${l.x.toFixed(2)},${l.y.toFixed(2)},${l.z.toFixed(2)}`,
  };
}
export function sources() { return gather(); }

/* ------------------------------------------------------------ pool assignment */

function cluster(list) {
  const src = list.slice().sort((a, b) => (a.key < b.key ? -1 : a.key > b.key ? 1 : 0));   // deterministic
  const used = new Array(src.length).fill(false), out = [];
  for (let i = 0; i < src.length; i++) {
    if (used[i]) continue;
    const a = src[i]; const m = [a]; used[i] = true;
    for (let j = i + 1; j < src.length; j++) {
      if (used[j]) continue; const b = src[j];
      if (!!b.cool !== !!a.cool) continue;
      if (Math.hypot(b.x - a.x, b.z - a.z) <= CLUSTER_M && Math.abs(b.y - a.y) <= 2.5) { m.push(b); used[j] = true; }
    }
    if (m.length === 1) { out.push(a); continue; }
    let I = 0, x = 0, y = 0, z = 0, range = 0, strongest = a;
    for (const q of m) { const w = q.intensity || 1; I += w; x += q.x * w; y += q.y * w; z += q.z * w; range = Math.max(range, q.range || 0); if ((q.intensity || 0) > (strongest.intensity || 0)) strongest = q; }
    // NOT the plain sum: a six-lantern string summed to ~540 cd at one point and washed the runner to
    // white every time he passed under it. A distributed source reads, from 2 m below its middle, as
    // two to three of its members — so the cluster carries at most 2.5x its strongest member.
    out.push({ ...strongest, key: a.key, x: x / I, y: y / I, z: z / I, intensity: Math.min(900, I, 2.5 * (strongest.intensity || 1)), range, members: m.length });
  }
  return out;
}

const camPos = { x: 0, y: 0, z: 0 };   // plain object: this module takes THREE from ctx, not an import
function assign() {
  const _cam = (ctx && ctx.camera) || (rig && rig.camera) || null;
  if (_cam) { _cam.updateMatrixWorld(); camPos.x = _cam.matrixWorld.elements[12]; camPos.y = _cam.matrixWorld.elements[13]; camPos.z = _cam.matrixWorld.elements[14]; }
  const cam = ctx.camera;
  const st = ctx.state || {};
  const cx = cam.position.x, cz = cam.position.z;
  const zRef = (Number.isFinite(st.z) ? st.z : cz) + PARAMS.ahead;
  const list = cluster(gather());
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
  // keep what we have if it is still close enough (hysteresis); otherwise mark it LEAVING and let
  // applyPool() fade it out — the slot is only free once the light has actually gone dark
  const held = new Set();
  for (let i = 0; i < N; i++) {
    const s = slots[i]; if (!s) continue;
    const c = byKey.get(s.key);
    if (c && (wantKeys.has(s.key) || c.d <= worst + PARAMS.hysteresis)) { s.l = c.l; s.target = c.l.intensity; s.leaving = false; held.add(s.key); }
    else { s.leaving = true; s.target = 0; if (s.cur < 0.5) slots[i] = null; }
  }
  // fill free slots with wanted lights not yet held; a new light starts dark and fades in
  let wi = 0;
  for (let i = 0; i < N; i++) {
    if (slots[i]) continue;
    while (wi < wanted.length && held.has(wanted[wi].l.key)) wi++;
    if (wi >= wanted.length) break;
    slots[i] = { key: wanted[wi].l.key, l: wanted[wi].l, cur: 0, target: wanted[wi].l.intensity, leaving: false }; held.add(wanted[wi].l.key); wi++;
  }
}

/** Every frame: ease each pool light toward its target and apply proximity softening. */
function applyPool(dt) {
  const N = pool.length; const st = ctx.state || {};
  const k = 1 - Math.exp(-FADE_RATE * Math.max(0, Math.min(0.1, dt || 0.016)));
  let active = 0, warm = 0, cool = 0;
  for (let i = 0; i < N; i++) {
    const L = pool[i], s = slots[i];
    if (!s) { L.intensity = 0; continue; }
    const l = s.l;
    s.cur = (s.cur ?? 0) + (s.target - (s.cur ?? 0)) * k;
    if (s.leaving && s.cur < 0.5) { slots[i] = null; L.intensity = 0; continue; }
    L.position.set(l.x, l.y, l.z);
    L.color.setHex(l.color);
    L.distance = l.range * PARAMS.reach;
    // PROXIMITY SOFTENING. A practical's illuminance goes as 1/d², so a verge lightbox that the
    // camera passes within a couple of metres throws an order of magnitude more light on the
    // shophouse wall behind it than the same fitting does further down the street, and that wall
    // is a large, near, flat surface: it clipped to white and haloed. Measured on the critic's
    // frames, 6-7 % of pixels cleared luma 235 against the reference's 1.5 % maximum, all of it on
    // the nearest facade. Raising the bloom threshold barely touched it, which is what proved the
    // surfaces were genuinely over-lit rather than merely blooming.
    // So lights within NEAR_SOFT_M of the camera are eased down, which only ever affects fittings
    // level with or behind the player — never the road ahead, which is what the reflections and the
    // wet-surface work depend on.
    const dx = L.position.x - camPos.x, dy = L.position.y - camPos.y, dz = L.position.z - camPos.z;
    const dCam = Math.sqrt(dx * dx + dy * dy + dz * dz);
    const soft = dCam >= NEAR_SOFT_M ? 1 : Math.max(NEAR_SOFT_MIN, (dCam / NEAR_SOFT_M) ** 2);
    // THE RUNNER'S "GLOW" (owner, 2026-09-21). The same 1/d^2 problem, at the hero: the pool is tuned so
    // a fitting 3 m up lights the ROAD, and a lantern string hangs 1-1.5 m over the runner's head, so
    // as he passes under it his head and shoulders take 4-9x what the road takes and bleach to cream
    // - he looks self-lit, and it comes and goes with every string. No real lantern does that; the
    // candela is a stand-in, so it is eased by distance to the runner's chest exactly as it is eased
    // by distance to the lens: nothing delivers more to him than it would from HERO_SOFT_M away.
    const hx = Number.isFinite(st.x) ? st.x : 0, hy = (Number.isFinite(st.y) ? st.y : 0) + 1.0, hz = Number.isFinite(st.z) ? st.z : 0;
    const dH = Math.sqrt((l.x - hx) ** 2 + (l.y - hy) ** 2 + (l.z - hz) ** 2);
    const softH = dH >= HERO_SOFT_M ? 1 : Math.max(HERO_SOFT_MIN, (dH / HERO_SOFT_M) ** 2);
    // ...and a ceiling on the irradiance any ONE practical lands on him (candela / d^2 <= HERO_E_MAX):
    // the clustered, height-compensated shop lights run to ~600 cd so that they reach the road from
    // 3-6 m up, and the same lamp 4.5 m from the runner's flank gave him ~28 where the road gets ~3.
    const capH = Math.min(1, HERO_E_MAX * dH * dH / Math.max(1, s.cur));
    L.intensity = s.cur * Math.min(soft, softH, capH) * nightK;
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
    const r = Math.min(5, l.range * PARAMS.poolRadius * Math.min(2.2, Math.max(1, (l.y - l.floor) / 3)));
    const rz = r * PARAMS.poolStretch;
    const y = l.floor + 0.02;
    const h = Math.max(0.5, l.y - l.floor);
    const fade = Math.min(1, 3.5 / h);                 // a lamp 10 m up pools fainter than a sign at 2.5
    const live = slots.some((sl) => sl && sl.key === l.key);
    const a = PARAMS.poolOpacity * fade * Math.min(1, l.author / 0.9) * (live ? PARAMS.poolLive : 1);
    c.setHex(l.color).multiplyScalar(a);
    // stretched toward the camera (-z, the way the runner came from) so the smear reads as a
    // reflection of the sign rather than as a disc painted on the road
    // A sign stands ON THE VERGE, so a pool centred under it spends half its area against the
    // shopfront where the camera never sees it. Pull the centre toward the road, which is also
    // where a real shopfront throws most of its light.
    const px = l.x * PARAMS.poolInset;
    const P = [[-r, 0, -rz], [r, 0, -rz], [r, 0, r], [-r, 0, r]], U = [[0, 0], [1, 0], [1, 1], [0, 1]];
    for (let k = 0; k < 4; k++) {
      pos.set([px + P[k][0], y, l.z + P[k][2]], i * 12 + k * 3);
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

/* ------------------------------------------------------------ day panorama (Atlas) */
// textures/sky_day.webp: an Atlas FLUX.2 Max morning sky with cumulus, 2048x864. OFF until the owner
// approves the image (standing rule: every Atlas image is signed off before it is built on);
// preview with ?daysky=1. It is laid over the rig's analytic day sky, which keeps the sun disc, the
// sunrise colours and the sky-to-haze handshake; mirrored-repeat in u so the 360 degree wrap has no seam.
const DAY_PANORAMA = Q.get('daysky') === '1';
let dayDome = null;
const DAYPANO_FS = /* glsl */`
uniform sampler2D tSky; uniform float uGain, uAlpha, uElTop, uElBot; varying vec3 vDir;
void main() {
  vec3 d = normalize(vDir); float el = asin(clamp(d.y, -1.0, 1.0));
  float u = (atan(d.z, d.x) / 6.2831853 + 0.5) * 2.0;
  float v = clamp((el - uElBot) / (uElTop - uElBot), 0.0, 1.0);
  vec3 col = texture2D(tSky, vec2(u, v)).rgb * uGain;
  float edge = smoothstep(0.0, 0.06, el) * (1.0 - smoothstep(uElTop - 0.25, uElTop, el));
  gl_FragColor = vec4(col, uAlpha * edge);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`;
async function loadDayPanorama() {
  const t = await textures.load('sky_day.webp'); if (!t || !scene) return;
  t.wrapS = THREE.MirroredRepeatWrapping; t.wrapT = THREE.ClampToEdgeWrapping; t.colorSpace = THREE.SRGBColorSpace; t.needsUpdate = true;
  dayDome = new THREE.Mesh(new THREE.SphereGeometry(1, 48, 24), new THREE.ShaderMaterial({
    uniforms: { tSky: { value: t }, // a chase camera only ever sees the bottom ~35 degrees of sky, so the strip is mapped across THAT, with
    // its pale lower third pushed under the rooftops; a gain under 1 keeps the blue through ACES
    uGain: { value: 0.8 }, uAlpha: { value: 0 }, uElTop: { value: 52 * Math.PI / 180 }, uElBot: { value: -14 * Math.PI / 180 } },
    vertexShader: PANO_VS, fragmentShader: DAYPANO_FS, side: THREE.BackSide, depthWrite: false, fog: false, transparent: true }));
  dayDome.frustumCulled = false; dayDome.renderOrder = -998; dayDome.name = 'lighting.daySky'; dayDome.visible = false;
  scene.add(dayDome); dayNow = -1;
}

/* ------------------------------------------------------------ time of day */

/**
 * DAWN AND DUSK (owner, 2026-09-21: "one run scene where it transitions to daytime before entering
 * the night street again"). track.dayAt(z) says how much day there is at the runner's z, 0..1; this
 * blends EVERYTHING that makes the night - fitted sky stops, fill, street bounce, exposure, haze,
 * emissive exposure, the practical pool, the ground pools, the road's ambient light map, the
 * reflection streaks, the environment - toward the rig's own daylight atmosphere (ATMOS_KEYS, read
 * at the sun elevation the blend implies, so the run passes through a real sunrise: orange horizon
 * at 2 deg, gold at 12, blue at 38). rig.setTime() is NOT used: it rebuilds the PMREM on every call.
 * The sun is this module's own DirectionalLight, ahead-left at dawn so the runner comes down the
 * ramp INTO the sunrise, swinging to ahead-right for the sunset that ends the day street.
 * No shadow pass (a second draw of ~1M triangles); grounding by day is roadfx's contact shadows.
 * Because the runner, dogs, coins and obstacles are lit by exactly these lights and nothing else,
 * they change with the location for free - there is no character light anywhere in the game.
 */
export const DAY = {
  elNight: -7, elMax: 40, azDawn: -28, azDusk: -152,   // ahead-left at sunrise, round the LEFT side, behind-left at sunset: the evening street ahead is front-lit gold
  sun: qn('sun', 1) * 1.2,            // x the rig's key: these materials were authored dark, for night
  exposure: qn('dexp', 1.0), emissive: 0.12, practicals: 0.04,
  // The rig's afternoon horizon is near-white through ACES, and a portrait chase camera looks AT the
  // horizon: the sky filled the top of the frame with blank white. Pulled down toward the blue the
  // zenith already has, once the sunrise colours (el < 12) are over.
  // (first try: scale the rig's stops down. That gave a grey, overcast lid. A clear morning is a
  // SATURATED blue overhead paling to a lighter blue at the horizon, so the day has its own stops.)
  sky: { horizon: [0.50, 0.66, 0.98], low: [0.30, 0.50, 0.98], mid: [0.17, 0.37, 0.95], high: [0.11, 0.28, 0.86], zenith: [0.07, 0.20, 0.74],
    haze: [0.62, 0.70, 0.86], below: [0.34, 0.37, 0.42] },
  fogStart: 26, fogDensity: 0.0042,    // a morning haze, thicker than the rig's clear afternoon
  envIntensity: 0.85, bloom: 3.4, groundAmbient: 0.0, fill: qn('dfill', 0.8), roadGain: 2.0, fillChroma: 1.1, bounce: 1.0,
};
let night = null, dayNow = -1, slowDay = -1, nightK = 1, emissiveNow = PARAMS.emissive;
let daySun = null, envNight = null, envDay = null, envIsDay = false;
const lerp = (a, b, t) => a + (b - a) * t;
const ss = (a, b, x) => { const t = Math.min(1, Math.max(0, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
const STOPS_ = ['horizon', 'low', 'mid', 'high', 'zenith', 'haze', 'below'];
const uName = (k) => 'uAtm' + k[0].toUpperCase() + k.slice(1);

function atmAt(el) {
  const K = ATMOS_KEYS; let i = 0;
  while (i < K.length - 2 && el > K[i + 1].el) i++;
  const a = K[i], b = K[i + 1], t = Math.min(1, Math.max(0, (el - a.el) / (b.el - a.el)));
  const out = { intensity: lerp(a.intensity, b.intensity, t), exposure: lerp(a.exposure, b.exposure, t) };
  for (const k of [...STOPS_, 'sunGlow']) out[k] = [0, 1, 2].map((c) => lerp(a[k][c], b[k][c], t));
  const sa = hexLin(a.sun), sb = hexLin(b.sun); out.sun = [0, 1, 2].map((c) => lerp(sa[c], sb[c], t));
  return out;
}
function snapshotNight() {
  if (!rig) return;
  const U = rig.atmos, B = rig.bounce || {};
  night = {
    stops: Object.fromEntries(STOPS_.map((k) => [k, U[uName(k)] ? U[uName(k)].value.clone() : null])),
    hemi: rig.hemi.color.clone().multiplyScalar(rig.hemi.intensity), hemiG: rig.hemi.groundColor.clone().multiplyScalar(rig.hemi.intensity),
    bounce: B.uBounce ? B.uBounce.value.clone() : null, side: B.uBounceSide ? B.uBounceSide.value : 0.6, flat: B.uBounceFlat ? B.uBounceFlat.value : 0.4,
    fog: rig.fog.color.clone(), fogNear: rig.fog.near, fogFar: rig.fog.far, aerStart: U.uAerStart.value, aerDensity: U.uAerDensity.value,
    exposure, emissive: PARAMS.emissive, env: PARAMS.envIntensity, gamb: textures.GROUND_AMBIENT ? textures.GROUND_AMBIENT.intensity : 2.85,
    refl: (globalThis.__roadfx && globalThis.__roadfx.PARAMS.reflGain) || 0.16,
  };
  dayNow = -1; slowDay = -1;
}
/** A PMREM of the rig's own daylight sky, built once: what the wet road and the coin reflect by day. */
function buildDayEnvironment() {
  const rigSky = scene.getObjectByName('rig.sky'); if (!rigSky || !night) return;
  const U = rig.atmos, a = atmAt(DAY.elMax), keep = {};
  for (const k of STOPS_) { const u = U[uName(k)]; if (!u) continue; keep[k] = u.value.clone(); u.value.setRGB(a[k][0], a[k][1], a[k][2]); }
  try {
    const es = new THREE.Scene(); const d = rigSky.clone(); d.visible = true; d.scale.setScalar(60); es.add(d);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(45, 32), new THREE.MeshBasicMaterial({ color: new THREE.Color(0.20, 0.19, 0.18), fog: false, toneMapped: false }));
    floor.rotation.x = -Math.PI / 2; floor.position.y = -0.5; es.add(floor);
    const pm = new THREE.PMREMGenerator(ctx.renderer); envDay = pm.fromScene(es, 0.04, 0.5, 100).texture; pm.dispose();
  } catch (e) { console.warn('[lighting] day environment failed', e && e.message); envDay = null; }
  for (const k of STOPS_) if (keep[k]) U[uName(k)].value.copy(keep[k]);
}

const _sunDir = { x: 0, y: 1, z: 0 };
let mistPrev = -1;
function mistAt(z) {
  const track = (ctx.track && ctx.track.zoneAt) ? ctx.track : (ctx.modules && ctx.modules.track);
  if (!track || !track.zoneAt || !track.chunkLength) return 0;
  const L = track.chunkLength();
  const here = track.zoneAt(z) === 'torii' ? 1 : 0, ahead = track.zoneAt(z + L) === 'torii' ? 1 : 0, behind = track.zoneAt(z - L) === 'torii' ? 1 : 0;
  const u = (z % L) / L;
  if (here) return behind ? 1 : Math.min(1, u * 1.6);      // first chunk: fade in
  if (ahead) return Math.max(0, (u - 0.4) / 0.6) * 0.6;   // the chunk before: mist creeps out of the gates
  return 0;
}
function applyTimeOfDay() {
  if (!night || Q.get('tod') === '0') return;
  const track = (ctx.track && ctx.track.dayAt) ? ctx.track : (ctx.modules && ctx.modules.track);
  const st = ctx.state || {};
  const z = Number.isFinite(st.z) ? st.z : 0;
  const d = qn('day', -1) >= 0 ? qn('day', 0) : (track && track.dayAt ? track.dayAt(z) : 0);
  // the sun rides with the camera every frame, even when d has not moved
  if (daySun && d > 0) {
    const cam = ctx.camera.position;
    daySun.target.position.set(cam.x, cam.y, cam.z); daySun.target.updateMatrixWorld();
    daySun.position.set(cam.x + _sunDir.x * 120, cam.y + _sunDir.y * 120, cam.z + _sunDir.z * 120);
  }
  const mNow = Math.round(mistAt(z) * 40);
  if (Math.abs(d - dayNow) < 0.0015 && mNow === mistPrev) return;
  dayNow = d; mistPrev = mNow;
  const U = rig.atmos, B = rig.bounce || {};
  const el = lerp(DAY.elNight, DAY.elMax, d), a = atmAt(el);
  { const kk = ss(8, 30, el); for (const k of STOPS_) { const t = DAY.sky[k]; if (t) a[k] = a[k].map((v, c) => lerp(v, t[c], kk)); } }
  const w = ss(0.0, 0.24, d);                       // how much of the frame is the rig's atmosphere, not the fitted night
  const azT = track && track.sunAzT ? track.sunAzT(z) : 0;
  const az = lerp(DAY.azDawn, DAY.azDusk, azT) * Math.PI / 180, elr = Math.max(1.5, el) * Math.PI / 180;
  _sunDir.x = Math.sin(az) * Math.cos(elr); _sunDir.y = Math.sin(elr); _sunDir.z = Math.cos(az) * Math.cos(elr);

  for (const k of STOPS_) { const u = U[uName(k)], n = night.stops[k]; if (u && n) u.value.setRGB(lerp(n.r, a[k][0], w), lerp(n.g, a[k][1], w), lerp(n.b, a[k][2], w)); }
  if (U.uAtmSunGlow) U.uAtmSunGlow.value.setRGB(a.sunGlow[0] * w, a.sunGlow[1] * w, a.sunGlow[2] * w);
  if (U.uAtmSunDir) U.uAtmSunDir.value.set(_sunDir.x, _sunDir.y, _sunDir.z);

  const below = Math.min(1, Math.max(0, (el + 0.5) / 2.0));
  // capped: the rig's golden-hour key (16) on top of DAY.sun bleached the runner's jacket to cream at dusk
  const sunI = Math.min(9.5, a.intensity * below * DAY.sun) * w;
  if (daySun) { daySun.color.setRGB(a.sun[0], a.sun[1], a.sun[2]); daySun.intensity = sunI; }
  const rigSky = scene.getObjectByName('rig.sky');
  if (rigSky) {
    rigSky.visible = !skyDome || d > 0.004; rigSky.renderOrder = -1000;
    const sd = rigSky.material && rigSky.material.uniforms && rigSky.material.uniforms.uSunDisc;
    if (sd) sd.value.setRGB(a.sun[0] * a.intensity * below * 0.9 * w, a.sun[1] * a.intensity * below * 0.9 * w, a.sun[2] * a.intensity * below * 0.9 * w);
  }
  if (dayDome) { const al = ss(0.45, 0.9, d); dayDome.material.uniforms.uAlpha.value = al; dayDome.visible = al > 0.002; }
  if (skyDome) { const al = 1 - ss(0.01, 0.30, d); skyDome.material.uniforms.uAlpha.value = al; skyDome.visible = al > 0.002; }

  // the fill, as the rig derives it from the sky it is under
  const lumOf = (v) => 0.2126 * v[0] + 0.7152 * v[1] + 0.0722 * v[2];
  const skyLin = [0, 1, 2].map((c) => lerp(a.mid[c], a.high[c], 0.45)), skyMag = Math.max(1e-4, lumOf(skyLin));
  const gndLin = [0, 1, 2].map((c) => lerp(skyLin[c], a.below[c], 0.18)), gndMag = Math.max(1e-4, lumOf(gndLin));
  const I = skyMag * 5.4 * DAY.fill;
  const hc = skyLin.map((v) => (1 + (v / skyMag - 1) * DAY.fillChroma) * I), gc = gndLin.map((v) => (1 + (v / gndMag - 1) * DAY.fillChroma * 0.7) * 0.62 * I);
  rig.hemi.intensity = 1;
  rig.hemi.color.setRGB(lerp(night.hemi.r, hc[0], w), lerp(night.hemi.g, hc[1], w), lerp(night.hemi.b, hc[2], w));
  rig.hemi.groundColor.setRGB(lerp(night.hemiG.r, gc[0], w), lerp(night.hemiG.g, gc[1], w), lerp(night.hemiG.b, gc[2], w));

  if (B.uBounce && night.bounce) {
    const k = a.intensity * below * DAY.sun * Math.max(0, Math.sin(el * Math.PI / 180)) * 0.034 * DAY.bounce;
    B.uBounce.value.setRGB(lerp(night.bounce.r, a.sun[0] * k, w), lerp(night.bounce.g, a.sun[1] * k, w), lerp(night.bounce.b, a.sun[2] * k, w));
    if (B.uBounceSide) B.uBounceSide.value = lerp(night.side, 0.15, w);
    if (B.uBounceFlat) B.uBounceFlat.value = lerp(night.flat, 3.5, w);
  }

  exposure = lerp(night.exposure, DAY.exposure, w);
  ctx.renderer.toneMappingExposure = exposure;
  if (skyDome) skyDome.material.uniforms.uExposure.value = exposure;
  const tm = (v) => { const x = v * exposure; return Math.min(1, Math.max(0, (x * (2.51 * x + 0.03)) / (x * (2.43 * x + 0.59) + 0.14))); };
  const hzD = new THREE.Color().setRGB(tm(a.haze[0]), tm(a.haze[1]), tm(a.haze[2]), THREE.SRGBColorSpace);
  rig.fog.color.copy(night.fog).lerp(hzD, w);
  if (scene.background && scene.background.isColor) scene.background.copy(rig.fog.color);
  // THE SHRINE PATH IS MISTY (approved board: fog between the cedars, the far gates lost in it). Fog eases
  // in over the zone's first chunk and out over its last, driven by z so a photo at a fixed distance repeats.
  const mist = 1 + 1.9 * mistAt(z);
  const fs = lerp(night.aerStart, DAY.fogStart, w) / (1 + 0.45 * (mist - 1)), fd = lerp(night.aerDensity, DAY.fogDensity, w) * mist;
  U.uAerStart.value = fs; U.uAerDensity.value = fd; rig.fog.near = fs; rig.fog.far = fs + 3 / Math.max(1e-6, fd) * 0.35;

  // the street switches itself off as the day comes up
  nightK = 1 - (1 - DAY.practicals) * ss(0.08, 0.5, d);
  if (rebuildPools.mat) rebuildPools.mat.color.setScalar(nightK);
  if (globalThis.__roadfx) globalThis.__roadfx.PARAMS.reflGain = night.refl * nightK;
  if (rig.post && rig.post.bloom && rig.post.bloom.setThreshold) rig.post.bloom.setThreshold(lerp(1.6, DAY.bloom, w));
  const wantDayEnv = d > 0.5 && !!envDay;
  if (wantDayEnv !== envIsDay) { envIsDay = wantDayEnv; scene.environment = envIsDay ? envDay : (envNight || scene.environment); }
  scene.environmentIntensity = (envIsDay ? DAY.envIntensity : night.env) * (0.25 + 0.75 * Math.abs(2 * d - 1));
  const fb = ctx.modules && ctx.modules.farband; if (fb && fb.setDay) fb.setDay(d);

  // the slow pass walks the scene, so it runs only when the day has moved by 3 %
  if (Math.abs(d - slowDay) >= 0.03 || (d === 0 || d === 1) && slowDay !== d) {
    slowDay = d;
    emissiveNow = lerp(night.emissive, DAY.emissive, ss(0.1, 0.55, d));
    scaleEmissive(emissiveNow);
    if (textures.tune) textures.tune({ intensity: lerp(night.gamb, DAY.groundAmbient, w), albedoGain: lerp(1, DAY.roadGain, ss(0.3, 0.9, d)), dry: ss(0.3, 0.9, d) });
  }
  report_.day = +d.toFixed(3);
}

/* ------------------------------------------------------------ per frame */

export function update(dt) {
  if (!ctx) return;
  frame++;
  // Chunks, obstacles and the pack arrive after this module's init (main.js init order), so the
  // emissive exposure has to keep catching up. The WeakMap of authored values makes it idempotent,
  // so a material scaled once is never scaled twice.
  applyTimeOfDay();
  if (frame < 240 ? frame % 15 === 0 : frame % 120 === 0) scaleEmissive(emissiveNow);
  if (frame % 2 === 1) assign();
  applyPool(dt);
  // the pool mesh depends on which lights are live, so rebuild it after assign(), not before
  if (frame % 10 === 0 || frame < 3) { poolsHash = ''; rebuildPools(gather()); }
  if (skyDome) skyDome.position.copy(ctx.camera.position).setY(ctx.camera.position.y);
  if (skyDome) skyDome.scale.setScalar(Math.max(10, (ctx.camera.far || 400) * 0.5));
  if (dayDome) { dayDome.position.copy(ctx.camera.position); dayDome.scale.setScalar(Math.max(10, (ctx.camera.far || 400) * 0.5)); }
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
  if (o.fillSky !== undefined || o.fillSkyGain !== undefined) rig.hemi.color.setHex(PARAMS.fillSky).multiplyScalar(PARAMS.fillSkyGain);
  if (o.exposure !== undefined) {
    exposure = PARAMS.exposure;
    ctx.renderer.toneMappingExposure = exposure;
    applySkyStops(Object.fromEntries(Object.entries(SKY).map(([k, h]) => [k, ACES_INV(hexLin(h))])));
    if (skyDome) skyDome.material.uniforms.uExposure.value = exposure;
  }
  if (o.fillGround !== undefined || o.fillGroundGain !== undefined) rig.hemi.groundColor.setHex(PARAMS.fillGround).multiplyScalar(PARAMS.fillGroundGain);
  if (o.candela !== undefined || o.poolOpacity !== undefined || o.poolStretch !== undefined || o.poolRadius !== undefined || o.poolInset !== undefined || o.reach !== undefined) { srcRef = null; srcList = []; srcFrame = -999; poolsHash = ''; }
  if (o.emissive !== undefined || o.emissiveCap !== undefined) { emissiveNow = PARAMS.emissive; scaleEmissive(PARAMS.emissive); }
  snapshotNight();
  if (o.bounce !== undefined || o.bounceColor !== undefined || o.bounceSide !== undefined || o.bounceFlat !== undefined) applyBounce();
  assign();
  rebuildPools(gather());
  return { ...PARAMS };
}

/**
 * The night's exposure of the emissive channel: every authored emissiveIntensity x k, then capped
 * so no face exceeds PARAMS.emissiveCap of linear radiance in its brightest channel. The cap is
 * what keeps a lantern a lantern; see the note on emissiveCap above.
 */
const emissive0 = new WeakMap();
function scaleEmissive(k) {
  scene.traverse((o) => {
    const ms = o.material ? (Array.isArray(o.material) ? o.material : [o.material]) : [];
    for (const m of ms) {
      if (!m || !m.emissive || m.emissiveIntensity === undefined) continue;
      const peak = Math.max(m.emissive.r, m.emissive.g, m.emissive.b);
      if (peak < 0.004) continue;
      if (!emissive0.has(m)) emissive0.set(m, m.emissiveIntensity);
      const want = emissive0.get(m) * k;
      m.emissiveIntensity = Math.min(want, PARAMS.emissiveCap / peak);
    }
  });
}

/* ------------------------------------------------------------ ground check */

/**
 * Draw one frame with the game camera and read the displayed road at five points. Luma is Rec.601
 * on the displayed sRGB bytes, the median of a 7x7 patch; points off screen report null.
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
  // the darkest road the camera can see: the in-view point furthest from every practical, which is
  // the honest control once signage is continuous
  const all = gather();
  let dark = null, darkScore = -1;
  for (let z = cz + 3; z < cz + 34; z += 1.5) {
    for (let px = -2.6; px <= 2.6; px += 1.3) {
      let near = 1e9;
      for (const l of all) { const d = (l.x - px) ** 2 + (l.z - z) ** 2; if (d < near) near = d; }
      if (near > darkScore) { darkScore = near; dark = [px, best.floor, z]; }
    }
  }
  const pts = { under: [x, best.floor, best.z], away3: [x, best.floor, best.z + 3], away6: [x, best.floor, best.z + 6], lane: [0, best.floor, best.z], dark };
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
  // THE measurement, and the only one a continuously lit street cannot confound: the same road
  // point with the practicals on and with them off. A neighbouring sign can brighten the "3 m
  // away" control, and on this street one always does; nothing can brighten the off frame.
  const keep = pool.map((L) => L.intensity);
  const poolsWere = poolsMesh ? poolsMesh.visible : false;
  for (const L of pool) L.intensity = 0;
  if (poolsMesh) poolsMesh.visible = false;
  rig.render(cam, 0.016);
  const off = {};
  for (const [k, p2] of Object.entries(pts)) {
    if (!out[k] || !p2) { off[k] = null; continue; }
    const px = out[k].px[0] - 3, py = size.y - out[k].px[1] - 3;
    gl.readPixels(px, py, 7, 7, gl.RGBA, gl.UNSIGNED_BYTE, buf);
    const l2 = [];
    for (let i = 0; i < 49; i++) l2.push(0.299 * buf[i * 4] + 0.587 * buf[i * 4 + 1] + 0.114 * buf[i * 4 + 2]);
    l2.sort((a, b) => a - b);
    off[k] = Math.round(l2[24]);
  }
  for (let i = 0; i < pool.length; i++) pool[i].intensity = keep[i];
  if (poolsMesh) poolsMesh.visible = poolsWere;
  rig.render(cam, 0.016);
  out.practicalsOff = off;
  if (out.under && off.under !== null) out.coupling = +(out.under.luma / Math.max(1, off.under)).toFixed(2);
  if (out.under && out.dark) out.contrast = +(out.under.luma / Math.max(1, out.dark.luma)).toFixed(2);
  if (out.under && out.away6) out.ratio = +(out.under.luma / Math.max(1, out.away6.luma)).toFixed(2);
  out.darkAt = dark ? [+dark[0].toFixed(1), +dark[2].toFixed(1)] : null;
  return out;
}

globalThis.__lighting = { groundCheck, report, sources, tune, PARAMS };
