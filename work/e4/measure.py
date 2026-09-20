#!/usr/bin/env python3
"""Measure one fixture frame against CLAIMS.md (C1 median luma, C2 p98 and >200 share, C3 warm dark
cluster, C4 blue class in the top fifth, C7 amber class in the bottom quarter). No HUD in the fixture,
so nothing is excluded. Usage: python3 work/e4/measure.py work/e4/shot.png"""
import sys
import numpy as np
from PIL import Image

path = sys.argv[1] if len(sys.argv) > 1 else 'work/e4/shot.png'
im = Image.open(path).convert('RGB')
a = np.asarray(im).astype(np.float64)
H, W, _ = a.shape
R, G, B = a[..., 0], a[..., 1], a[..., 2]
L = 0.299 * R + 0.587 * G + 0.114 * B

median = float(np.median(L))
p98 = float(np.percentile(L, 98))
over200 = float((L > 200).mean() * 100)
# C3 is about the dominant dark CLUSTER, so cluster the way CLAIMS.md says the critic will:
# resample to 90x160 and run a 14-cluster k-means, then take the largest cluster under luma 60.
# A plain "L < 60" threshold instead pools the whole dusk sky in with the shade and reports the
# sky's blue as the shade's colour, which is the opposite of what the claim asks.
small = np.asarray(im.resize((90, 160), Image.BILINEAR)).astype(np.float64).reshape(-1, 3)
rng = np.random.default_rng(7)
C = small[rng.choice(len(small), 14, replace=False)].copy()
for _ in range(25):
    lab = np.argmin(((small[:, None, :] - C[None, :, :]) ** 2).sum(2), axis=1)
    for k in range(14):
        m = lab == k
        if m.any():
            C[k] = small[m].mean(0)
counts = np.bincount(lab, minlength=14)
clum = 0.299 * C[:, 0] + 0.587 * C[:, 1] + 0.114 * C[:, 2]
# C3 is about SHADE, and C4 already accounts for the sky, so a cluster that IS the sky (the same
# blue class C4 counts, B-R >= 60) is not a candidate. Without this the claim silently inverts on
# any frame where the sky is the largest dark area, and reports the sky's blue as the shade colour.
sky = (C[:, 2] - C[:, 0]) >= 60
darkk = np.where((clum < 60) & ~sky)[0]
if len(darkk):
    k = darkk[np.argmax(counts[darkk])]
    rb_dark = float(C[k, 0] - C[k, 2])
    dark_share = counts[k] / counts.sum() * 100
    dark_hex = '#%02x%02x%02x' % tuple(C[k].round().astype(int))
else:
    rb_dark, dark_share, dark_hex = float('nan'), 0.0, '-' 
top = slice(0, H // 5)
blue_top = float(((B - R)[top] >= 60).mean() * 100)
bot = slice(H - H // 4, H)
amber_bot = float(((L[bot] > 100) & (R[bot] > B[bot] + 40)).mean() * 100)

rows = [
    ('C1 median luma', f'{median:.1f}', '~42', 30 <= median <= 56),
    ('C2 p98 luma', f'{p98:.1f}', '~194', 160 <= p98 <= 230),
    ('C2 % pixels > 200', f'{over200:.2f}', '1.5-2 %', 0.8 <= over200 <= 3.5),
    (f'C3 dark cluster R-B ({dark_hex}, {dark_share:.0f}%)', f'{rb_dark:.1f}', '>= 8', rb_dark >= 8),
    ('C4 top-fifth blue (B-R>=60) %', f'{blue_top:.1f}', '>= 20 %', blue_top >= 20),
    ('C7 bottom-quarter amber %', f'{amber_bot:.2f}', '4-8 %', 2.5 <= amber_bot <= 12),
]
print(f'{path}  {W}x{H}')
for name, val, target, ok in rows:
    print(f'  {"PASS" if ok else "MISS"}  {name:34s} {val:>8s}   target {target}')
