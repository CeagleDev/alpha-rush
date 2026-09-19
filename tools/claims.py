#!/usr/bin/env python3
"""Measure the CLAIMS.md statistics on folders of frames and test which claims separate two sets.

usage: python3 tools/claims.py <label>=<dir-or-glob> [<label>=<dir-or-glob> ...] [--hud=0.08] [--width=540] [--sep=A,B]

Every frame is resampled to --width px wide (aspect kept) so bands are comparable across sets, and a HUD band
(fraction of height, top and bottom) is excluded. Per set: median and spread (IQR) of each statistic.
--sep=bar,floor prints for each claim the share of frame pairs where the two sets fall on opposite sides of the
bar's median: keep a claim only if >= 70 %. Capture the build at the reference's aspect ratio before trusting
any band statistic (CLAIMS.md). Numbers are sRGB 0-255.
"""
import sys, glob, os
from PIL import Image, ImageFilter
import numpy as np

def frames(spec):
    fs = sorted(glob.glob(spec)) if any(c in spec for c in '*?[') else sorted(glob.glob(os.path.join(spec, '*.png')) + glob.glob(os.path.join(spec, '*.jpg')))
    return [f for f in fs if not os.path.basename(f).startswith(('filmstrip', 'CONTACT', '_'))]

def luma(a): return 0.299*a[...,0] + 0.587*a[...,1] + 0.114*a[...,2]

def edge_density(gray):
    g = Image.fromarray(gray.astype(np.uint8)).filter(ImageFilter.FIND_EDGES)
    e = np.asarray(g).astype(np.float32)
    return float((e > 40).mean())

def kmeans(P, k, it=20, seed=1):
    rng = np.random.default_rng(seed); C = P[rng.choice(len(P), k, replace=False)].copy()
    for _ in range(it):
        a = ((P[:, None, :] - C[None]) ** 2).sum(-1).argmin(1)
        for j in range(k):
            m = P[a == j]
            if len(m): C[j] = m.mean(0)
    return C, a

def stats(path, width, hud):
    im = Image.open(path).convert('RGB'); w, h = im.size; im = im.resize((width, int(h * width / w)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32); H = a.shape[0]; cut = int(H * hud); a = a[cut:H - cut]; H = a.shape[0]; W = a.shape[1]
    Y = luma(a); flat = a.reshape(-1, 3)
    s = {}
    s['C1_median_luma'] = float(np.median(Y))
    s['C2_p98_luma'] = float(np.percentile(Y, 98)); s['C2_pct_over_200'] = float((Y > 200).mean() * 100)
    # C3 warm shade: R-B of the dominant dark cluster (k-means on a subsample)
    sub = flat[np.random.default_rng(0).choice(len(flat), min(6000, len(flat)), replace=False)]
    C, lab = kmeans(sub, 8); share = np.bincount(lab, minlength=8)
    dark = [j for j in range(8) if luma(C[j][None])[0] < 60]
    j = max(dark, key=lambda j: share[j]) if dark else int(np.argmax(share))
    s['C3_dark_R_minus_B'] = float(C[j][0] - C[j][2])
    # C4 cool sky: blue class share in the top fifth (B - R >= 60)
    top = a[: H // 5].reshape(-1, 3); s['C4_top_blue_pct'] = float(((top[:, 2] - top[:, 0]) >= 60).mean() * 100)
    # C5 crammed sides: edge density sides vs centre third
    g = Y; third = W // 3
    sides = (edge_density(g[:, :third]) + edge_density(g[:, 2 * third:])) / 2; centre = edge_density(g[:, third:2 * third])
    s['C5_side_over_centre_edges'] = float(sides / max(centre, 1e-4))
    # C7 amber reflections in the bottom quarter
    bot = a[3 * H // 4:].reshape(-1, 3); amber = (luma(bot) > 100) & ((bot[:, 0] - bot[:, 2]) > 40)
    s['C7_bottom_amber_pct'] = float(amber.mean() * 100)
    return s

def main():
    args = [x for x in sys.argv[1:] if not x.startswith('--')]; opts = dict(x[2:].split('=', 1) for x in sys.argv[1:] if x.startswith('--'))
    width = int(opts.get('width', 540)); hud = float(opts.get('hud', 0.08)); sep = opts.get('sep')
    sets = {}
    for a in args:
        label, spec = a.split('=', 1); fs = frames(spec)
        if not fs: print(f'{label}: no frames at {spec}'); continue
        sets[label] = [stats(f, width, hud) for f in fs]; print(f'{label}: {len(fs)} frames from {spec}')
    keys = ['C1_median_luma', 'C2_p98_luma', 'C2_pct_over_200', 'C3_dark_R_minus_B', 'C4_top_blue_pct', 'C5_side_over_centre_edges', 'C7_bottom_amber_pct']
    print(f"\n{'statistic':28s}" + ''.join(f'{l:>24s}' for l in sets)); print('-' * (28 + 24 * len(sets)))
    for k in keys:
        row = f'{k:28s}'
        for l, rows in sets.items():
            v = np.array([r[k] for r in rows]); q1, q3 = np.percentile(v, [25, 75]); row += f'{np.median(v):11.1f} ±{(q3 - q1) / 2:7.1f}     '
        print(row)
    if sep and ',' in sep:
        A, B = sep.split(','); print(f'\nseparation test ({A} vs {B}): direction = sign of the median difference; share of ({A} frame, {B} frame) pairs')
        print('ordered in that direction, i.e. the two sets are on opposite sides of a threshold between them. Keep a claim only if >= 70 %.')
        for k in keys:
            va = np.array([r[k] for r in sets[A]]); vb = np.array([r[k] for r in sets[B]]); d = np.sign(np.median(va) - np.median(vb)) or 1
            opp = np.mean([((a - b) * d) > 0 for a in va for b in vb]) * 100
            print(f'  {k:28s} {A} {np.median(va):7.1f}  {B} {np.median(vb):7.1f}   pairs ordered {opp:5.1f} %  {"KEEP" if opp >= 70 else "drop"}')
main()
