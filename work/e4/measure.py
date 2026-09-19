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
dark = L < 60
rb_dark = float(np.median((R - B)[dark])) if dark.any() else float('nan')
top = slice(0, H // 5)
blue_top = float(((B - R)[top] >= 60).mean() * 100)
bot = slice(H - H // 4, H)
amber_bot = float(((L[bot] > 100) & (R[bot] > B[bot] + 40)).mean() * 100)

rows = [
    ('C1 median luma', f'{median:.1f}', '~42', 30 <= median <= 56),
    ('C2 p98 luma', f'{p98:.1f}', '~194', 160 <= p98 <= 230),
    ('C2 % pixels > 200', f'{over200:.2f}', '1.5-2 %', 0.8 <= over200 <= 3.5),
    ('C3 dark cluster R-B', f'{rb_dark:.1f}', '>= 8', rb_dark >= 8),
    ('C4 top-fifth blue (B-R>=60) %', f'{blue_top:.1f}', '>= 20 %', blue_top >= 20),
    ('C7 bottom-quarter amber %', f'{amber_bot:.2f}', '4-8 %', 2.5 <= amber_bot <= 12),
]
print(f'{path}  {W}x{H}')
for name, val, target, ok in rows:
    print(f'  {"PASS" if ok else "MISS"}  {name:34s} {val:>8s}   target {target}')
