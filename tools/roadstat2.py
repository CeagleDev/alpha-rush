#!/usr/bin/env python3
"""Round-3 road-surface statistics: the five numbers CRITIC2.md set, bar vs build.

usage: python3 tools/roadstat2.py <label>=<dir-or-glob> [...] [--width=810]

BANDS (fractions of the frame, applied IDENTICALLY to every set — that is the whole point).
Calibrated 2026-09-20 so the bar reproduces the ranges CRITIC2.md quotes for the reference:

  NEAR-FIELD road  rows 80-100 %, cols 25-75 %   -> nf_p25, nf_p75, nf_iqr
      the metre or two of carriageway right under the camera. The critic's quoted reference
      p25 17.4-18.6 / p75 24.8-31.0 / IQR 10-14; this band puts the 20 bar frames at
      p25 20.1 / p75 32.5 / IQR ~10, i.e. the critic's four frames sit inside our spread.
  ROAD BAND        rows 67-100 %, cols 20-80 %   -> lapvar, sat
      the whole carriageway region including the receding road. The critic's quoted reference
      Laplacian variance 70-311 and mean saturation 0.37-0.53; this band puts the bar at
      lapvar median 113 [24..236] and sat 0.411 [0.279..0.527]. Both land inside.
  FRAME            everything                    -> p05

  nf_p25 / nf_p75  25th / 75th percentile of luma in the near-field band (sRGB 0-255)
  nf_iqr           p75 - p25: how wide the surface's own value band is
  lapvar           variance of the 4-neighbour Laplacian of luma over the road band. This is
                   the single-pixel-noise detector: un-antialiased sparkle sends it to thousands.
  sat              mean HSV saturation over the road band
  p05              5th percentile of luma over the WHOLE frame — how black the blacks go

Reported as median [min..max] over each set.
"""
import sys, glob, os
import numpy as np
from PIL import Image

NEAR = (0.80, 1.00, 0.25, 0.75)    # y0, y1, x0, x1 as fractions
ROAD = (0.67, 1.00, 0.20, 0.80)


def frames(spec):
    fs = sorted(glob.glob(spec)) if any(c in spec for c in '*?[') else \
         sorted(glob.glob(os.path.join(spec, '*.png')) + glob.glob(os.path.join(spec, '*.jpg')))
    return [f for f in fs if not os.path.basename(f).startswith(('filmstrip', 'CONTACT', '_', 'strip'))]


def luma(a):
    return 0.299 * a[..., 0] + 0.587 * a[..., 1] + 0.114 * a[..., 2]


def lapvar(Y):
    """Variance of the 4-neighbour Laplacian. Single-pixel detail dominates it; a smooth
    gradient contributes almost nothing, which is exactly the distinction being judged."""
    p = np.pad(Y, 1, mode='edge')
    o = (p[0:-2, 1:-1] + p[2:, 1:-1] + p[1:-1, 0:-2] + p[1:-1, 2:] - 4.0 * Y)
    return float(o.var())


def sat(a):
    mx = a.max(-1); mn = a.min(-1)
    return float(np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0).mean())


def crop(a, band):
    H, W = a.shape[:2]
    y0, y1, x0, x1 = band
    return a[int(y0 * H):int(y1 * H), int(x0 * W):int(x1 * W)]


def stats(path, width):
    im = Image.open(path).convert('RGB'); w, h = im.size
    if w != width:
        im = im.resize((width, int(h * width / w)), Image.LANCZOS)
    a = np.asarray(im).astype(np.float32)
    nf = luma(crop(a, NEAR))
    rb = crop(a, ROAD)
    p25, p75 = np.percentile(nf, [25, 75])
    return dict(
        nf_p25=float(p25), nf_p75=float(p75), nf_iqr=float(p75 - p25),
        lapvar=lapvar(luma(rb)), sat=sat(rb),
        p05=float(np.percentile(luma(a), 5)),
    )


KEYS = ['nf_p25', 'nf_p75', 'nf_iqr', 'lapvar', 'sat', 'p05']
FMT = {'nf_p25': '%8.1f', 'nf_p75': '%8.1f', 'nf_iqr': '%8.1f',
       'lapvar': '%9.1f', 'sat': '%8.3f', 'p05': '%8.1f'}
TARGET = {'nf_p25': '17-20', 'nf_p75': '28-31', 'nf_iqr': '10-14',
          'lapvar': 'low 100s', 'sat': '.37-.53', 'p05': '13-17'}


def main():
    width = 810; sets = []
    for arg in sys.argv[1:]:
        if arg.startswith('--width='):
            width = int(arg.split('=')[1]); continue
        label, spec = arg.split('=', 1); sets.append((label, frames(spec)))
    print(f'width {width} px   near-field rows 80-100 % cols 25-75 %   road band rows 67-100 % cols 20-80 %\n')
    hdr = f'{"set":<10}{"n":>3}  ' + '  '.join(f'{k:>8}' if k != 'lapvar' else f'{k:>9}' for k in KEYS)
    print(hdr)
    print(f'{"critic target":<13}  ' + '  '.join(('%8s' if k != 'lapvar' else '%9s') % TARGET[k] for k in KEYS))
    print('-' * len(hdr))
    per = {}
    for label, fs in sets:
        rows = [stats(f, width) for f in fs]
        per[label] = (fs, rows)
        for tag, fn in (('MEDIAN', np.median), ('min', np.min), ('max', np.max)):
            v = {k: float(fn([r[k] for r in rows])) for k in KEYS}
            lab = label if tag == 'MEDIAN' else ''
            n = str(len(fs)) if tag == 'MEDIAN' else ''
            print(f'{lab:<10}{n:>3}  ' + '  '.join(FMT[k] % v[k] for k in KEYS) + '   ' + tag)
        print()
    for label, (fs, rows) in per.items():
        print(f'-- {label} per frame')
        for f, r in zip(fs, rows):
            print(f'   {os.path.basename(f):<16}' + '  '.join(FMT[k] % r[k] for k in KEYS))


main()
