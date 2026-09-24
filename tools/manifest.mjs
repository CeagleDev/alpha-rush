// manifest.mjs — writes game/assets/index.json, the list of asset modules the loader may fetch.
// Run after adding or removing an asset: node tools/manifest.mjs
// Why: on a real host every "does this asset exist?" HEAD request is a round trip, and ~90 of them in a row
// were most of a 45 s load on GitHub Pages. With the list, the loader knows at once and fetches all in parallel.
import fs from 'fs'; import path from 'path'; import { fileURLToPath } from 'url';
const dir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'game', 'assets');
const names = fs.readdirSync(dir).filter((f) => f.endsWith('.js')).map((f) => f.slice(0, -3)).sort();
fs.writeFileSync(path.join(dir, 'index.json'), JSON.stringify({ assets: names }, null, 0) + '\n');
console.log(`game/assets/index.json: ${names.length} assets`);
