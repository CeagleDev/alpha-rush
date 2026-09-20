#!/usr/bin/env python3
"""Measure the four road-surface targets CRITIC1.md set, on folders of frames.

usage: python3 tools/roadstat.py <label>=<dir-or-glob> [...] [--width=810]

  edge_b3     mean Sobel gradient magnitude over the bottom third (grain / seams / debris)
  pct_235     % of pixels in the WHOLE frame above luma 235 (what actually clips)
  nonwarm235  count of pixels above luma 235 whose hue is OUTSIDE the red/orange bins
              (hue 0-45 or 330-360 at saturation >= 0.25); near-neutral brights count as
              outside, which is where the reference's white litter and cool signs land
  std_b3      standard deviation of luma over the bottom third
  tail_b3     % of bottom-third pixels above luma 150 (the "bright tail")
Numbers are sRGB 0-255, per frame, reported as median [min..max] over the set.
"""
import sys, glob, os
import numpy as np
from PIL import Image

def frames(spec):
    fs = sorted(glob.glob(spec)) if any(c in spec for c in '*?[') else \
         sorted(glob.glob(os.path.join(spec, '*.png')) + glob.glob(os.path.join(spec, '*.jpg')))
    return [f for f in fs if not os.path.basename(f).startswith(('filmstrip', 'CONTACT', '_', 'strip'))]

def sobel(g):
    kx = np.array([[-1,0,1],[-2,0,2],[-1,0,1]], np.float32)
    ky = kx.T
    def conv(a, k):
        p = np.pad(a, 1, mode='edge'); o = np.zeros_like(a)
        for dy in range(3):
            for dx in range(3):
                o += k[dy,dx] * p[dy:dy+a.shape[0], dx:dx+a.shape[1]]
        return o
    return np.hypot(conv(g,kx), conv(g,ky))

def hue_sat(a):
    r,g,b = a[...,0], a[...,1], a[...,2]
    mx = a.max(-1); mn = a.min(-1); d = mx - mn
    s = np.where(mx > 0, d/np.maximum(mx,1e-6), 0)
    h = np.zeros_like(mx)
    m = d > 1e-6
    ri = m & (mx == r); gi = m & (mx == g) & ~ri; bi = m & (mx == b) & ~ri & ~gi
    h[ri] = (60*((g-b)[ri]/d[ri]) + 360) % 360
    h[gi] = 60*((b-r)[gi]/d[gi]) + 120
    h[bi] = 60*((r-g)[bi]/d[bi]) + 240
    return h, s

def stats(path, width):
    im = Image.open(path).convert('RGB'); w,h = im.size
    if w != width: im = im.resize((width, int(h*width/w)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    Y = 0.299*a[...,0] + 0.587*a[...,1] + 0.114*a[...,2]
    H = Y.shape[0]; b3 = Y[2*H//3:]
    bright = Y > 235
    hue, sat = hue_sat(a)
    warm = ((hue <= 45) | (hue >= 330)) & (sat >= 0.25)
    return dict(
        edge_b3    = float(sobel(b3).mean()),
        pct_235    = float(bright.mean()*100),
        nonwarm235 = int((bright & ~warm).sum()),
        std_b3     = float(b3.std()),
        tail_b3    = float((b3 > 150).mean()*100),
    )

KEYS = ['edge_b3','pct_235','nonwarm235','std_b3','tail_b3']
FMT  = {'edge_b3':'%8.2f','pct_235':'%8.3f','nonwarm235':'%8.0f','std_b3':'%8.2f','tail_b3':'%8.2f'}

def main():
    width = 810; sets = []
    for arg in sys.argv[1:]:
        if arg.startswith('--width='): width = int(arg.split('=')[1]); continue
        label, spec = arg.split('=',1); sets.append((label, frames(spec)))
    print(f'width {width} px, bottom third = lowest 1/3 of rows\n')
    print(f'{"set":<10}{"n":>3}  ' + '  '.join(f'{k:>8}' for k in KEYS))
    per = {}
    for label, fs in sets:
        rows = [stats(f, width) for f in fs]
        per[label] = (fs, rows)
        med = {k: float(np.median([r[k] for r in rows])) for k in KEYS}
        print(f'{label:<10}{len(fs):>3}  ' + '  '.join(FMT[k] % med[k] for k in KEYS) + '   MEDIAN')
        lo  = {k: min(r[k] for r in rows) for k in KEYS}
        hi  = {k: max(r[k] for r in rows) for k in KEYS}
        print(f'{"":<10}{"":>3}  ' + '  '.join(FMT[k] % lo[k] for k in KEYS) + '   min')
        print(f'{"":<10}{"":>3}  ' + '  '.join(FMT[k] % hi[k] for k in KEYS) + '   max')
    print()
    for label,(fs,rows) in per.items():
        print(f'-- {label} per frame')
        for f,r in zip(fs,rows):
            print(f'   {os.path.basename(f):<16}' + '  '.join(FMT[k] % r[k] for k in KEYS))

main()
