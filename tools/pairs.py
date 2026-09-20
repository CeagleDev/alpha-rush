#!/usr/bin/env python3
"""Blind pairs at FULL resolution, equal panels, verified shuffle.

usage: python3 tools/pairs.py --mine <files...> --ref <files...> --out <dir> [--seed N]

harness/pairs.mjs letterboxes both frames into a shared box, which shrank our 810x1440 captures to
~304 px wide panels with a wide black gutter between them. The round-1 critic objected on both
counts ("judging a thumbnail", "the images are nowhere near each other") and it was right. Since the
gate can now capture at the reference's own shape, both sides are already the same size and no
letterboxing is needed: this just butts them together at native resolution with a hairline divider.

It also VERIFIES the shuffle and refuses to write a set that puts our frame on the same side every
time — the round-1 set did exactly that and the critic identified us from the layout alone.
"""
import sys, os, json, random
from PIL import Image

def arg(name, multi=False):
    a = sys.argv
    if name not in a: return [] if multi else None
    i = a.index(name) + 1
    if not multi: return a[i]
    out = []
    while i < len(a) and not a[i].startswith('--'): out.append(a[i]); i += 1
    return out

mine, ref, out = arg('--mine', True), arg('--ref', True), arg('--out')
seed = int(arg('--seed') or 7)
if not mine or not ref or not out: print(__doc__); sys.exit(2)
os.makedirs(out, exist_ok=True)
rng = random.Random(seed)
n = min(len(mine), len(ref))
key, sides = {}, []
for i in range(n):
    A, B = Image.open(mine[i]).convert('RGB'), Image.open(ref[i]).convert('RGB')
    h = min(A.height, B.height)
    A = A.resize((round(A.width * h / A.height), h), Image.LANCZOS)
    B = B.resize((round(B.width * h / B.height), h), Image.LANCZOS)
    left_is_mine = rng.random() < 0.5
    # force a mix: if this is the last pair and everything so far matched, flip it
    if i == n - 1 and len(set(sides)) == 1 and sides: left_is_mine = not (sides[0] == 'left')
    L, R = (A, B) if left_is_mine else (B, A)
    gap = 6
    canvas = Image.new('RGB', (L.width + gap + R.width, h), (24, 24, 26))
    canvas.paste(L, (0, 0)); canvas.paste(R, (L.width + gap, 0))
    name = f'pair_{i+1:02d}.png'
    canvas.save(os.path.join(out, name))
    side = 'left' if left_is_mine else 'right'
    sides.append(side)
    key[name] = {'build': side, 'build_file': os.path.basename(mine[i]), 'ref_file': os.path.basename(ref[i])}
    print(f'  {name}  {canvas.size[0]}x{canvas.size[1]}  panels {L.width} | {R.width}  build={side}')
if len(set(sides)) == 1:
    print('REFUSING: every pair put the build on the same side; raise --seed'); sys.exit(1)
json.dump(key, open(os.path.join(out, 'KEY.json'), 'w'), indent=1)
print(f'{n} pairs -> {out}   shuffle {sides}   key withheld in KEY.json')
