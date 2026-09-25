// manifest.mjs — run after adding/removing a module or asset: node tools/manifest.mjs
//  1. game/assets/index.json: the asset modules the loader may fetch (no HEAD round trip per asset).
//  2. the PRELOAD block in game/index.html: every code module and asset module, so the browser fetches the
//     whole graph at once instead of discovering it one import at a time. On a high-latency link each level
//     of that waterfall cost ~2 s; this is what brought the live READY under the jam's 20 s.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const game = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'game');
const names = fs.readdirSync(path.join(game, 'assets')).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3)).sort();
fs.writeFileSync(path.join(game, 'assets', 'index.json'), JSON.stringify({ assets: names }) + '\n');
// stamped code modules (they carry the ?v= stamp the main script tag carries)
const code = ['rig.js', 'assetlib.js', 'surfaces.js']
  .concat(fs.readdirSync(path.join(game, 'src')).filter((f) => f.endsWith('.js')).map((f) => 'src/' + f))
  .concat(fs.existsSync(path.join(game, 'src', 'zones')) ? fs.readdirSync(path.join(game, 'src', 'zones')).filter((f) => f.endsWith('.js')).map((f) => 'src/zones/' + f) : [])
  .filter((f) => fs.existsSync(path.join(game, f)));
const block = `<!--preload--><script>
(function () {
  var s = document.querySelector('script[type=module][src*="src/main.js"]');
  var q = s ? (s.getAttribute('src').split('?')[1] || '') : ''; q = q ? '?' + q : '';
  var h = document.head, add = function (href, rel, as) { var l = document.createElement('link'); l.rel = rel; l.href = href; if (as) { l.as = as; l.crossOrigin = 'anonymous'; } h.appendChild(l); };
  var T = 'https://cdn.jsdelivr.net/npm/three@0.169.0/';
  add(T + 'build/three.module.js', 'modulepreload'); add(T + 'examples/jsm/utils/BufferGeometryUtils.js', 'modulepreload'); add(T + 'examples/jsm/csm/CSM.js', 'modulepreload');
  ${JSON.stringify(code)}.forEach(function (f) { add(f + q, 'modulepreload'); });
  add('assets/index.json', 'preload', 'fetch');
  ${JSON.stringify(names)}.forEach(function (n) { add('assets/' + n + '.js', 'modulepreload'); });
})();
</script><!--/preload-->`;
const ip = path.join(game, 'index.html'); let html = fs.readFileSync(ip, 'utf8');
if (html.includes('<!--preload-->')) html = html.replace(/<!--preload-->[\s\S]*?<!--\/preload-->/, block);
else html = html.replace(/(<script type="module" src="\.\/src\/main\.js[^"]*"><\/script>)/, '$1\n' + block);
fs.writeFileSync(ip, html);
console.log(`index.json: ${names.length} assets; preload block: ${code.length} code modules + ${names.length} assets`);
