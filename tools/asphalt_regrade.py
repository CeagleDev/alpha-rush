#!/usr/bin/env python3
"""Re-grade textures/asphalt_albedo.webp into an actual ALBEDO map. Round 3.

WHY. Measured 2026-09-20, the Atlas asphalt set is the only one in the project that is not a base
colour. Compare the four albedo maps the same way (sRGB luma mean / mean HSV saturation):

    deck (concrete)  170.6 / 0.079      plank  106.6 / 0.144      tin  129.0 / 0.257
    asphalt           30.2 / 0.793   <-- an already-lit, heavily warm-graded night photo

An albedo of sRGB 30 is linear 0.013, and chunks.js then multiplies it by the carriageway's own
near-black vertex tint (0x231718, linear luma 0.0103), so the road's diffuse albedo reaches the
shader at 1.3e-4 — four hundred times darker than the pavement beside it (0.059). That is the
critic's "strip the sparkles and there is no diffuse signal left": there is literally none.

WHAT THIS DOES. It keeps the map's pebble grain, which is good, and throws away everything else:

  1  VALUE. Rebuilt around a target mean so the map lands at a real dry-asphalt albedo.
  2  SATURATION. The golden-brown cast is cut to ~5 % of its original chroma, then a gentle
     low-amplitude warm/cool mottle is added back at a scale that is not the tile, which is the
     reference's "independent colour variation".
  3  TILING. The original carries one strong near-vertical crack and a broad tonal blob, and at
     2.5 m per tile those repeat every 2.5 m down the street — the critic's "parallel scratch
     streaks that visibly tile". Three fixes: the detail is soft-clipped so no crack can be the
     darkest thing in the frame; it is blended 50/50 with a copy of itself turned a quarter turn
     and rolled half a tile (still seamless, and now no straight line in either copy lands on the
     other's tile edge); and it is DESTRIPED — the per-row and per-column means are subtracted,
     which removes every axis-aligned straight feature and leaves isotropic grain untouched.
  4  CONTRAST. The low-frequency term is pulled 92 % of the way to flat. It has to go nearly
     all the way: anything left at the scale of the tile IS the tile, and at 2.5 m per repeat a
     10 % tonal blob reads as a square grid painted on the street from three metres up. What
     survives is pebble-scale variation, which repeats without anyone seeing it repeat.

Everything is done with wrap-around padding and tile-periodic functions, so the result tiles
exactly as seamlessly as the input.

usage: python3 tools/asphalt_regrade.py [--target=88] [--sat=0.18] [--out=game/textures/asphalt_albedo.webp]
"""
import sys
import numpy as np
from PIL import Image

SRC = 'game/textures/asphalt_albedo.webp'
OUT = 'game/textures/asphalt_albedo.webp'
TARGET_SRGB_Y = 88.0     # mean sRGB luma of the finished map
KEEP_CHROMA = 0.05       # how much of the original golden cast survives
LOW_FLATTEN = 0.08       # how much of the low-frequency term survives (1 = untouched)
DETAIL_GAIN = 1.18       # re-boost after the 50/50 rotation blend, which costs ~0.7 of the amplitude
ROT_MIX = 0.50


def srgb_to_lin(x):
    return np.where(x <= 0.04045, x / 12.92, ((x + 0.055) / 1.055) ** 2.4)


def lin_to_srgb(x):
    x = np.clip(x, 0.0, 1.0)
    return np.where(x <= 0.0031308, x * 12.92, 1.055 * x ** (1 / 2.4) - 0.055)


def gauss_wrap(a, sigma):
    """Separable Gaussian with WRAP padding, so a seamless tile stays seamless."""
    r = int(sigma * 3)
    k = np.exp(-0.5 * (np.arange(-r, r + 1) / sigma) ** 2)
    k /= k.sum()
    o = np.apply_along_axis(lambda m: np.convolve(np.concatenate([m[-r:], m, m[:r]]), k, 'valid'), 0, a)
    o = np.apply_along_axis(lambda m: np.convolve(np.concatenate([m[-r:], m, m[:r]]), k, 'valid'), 1, o)
    return o


def main():
    src, out = SRC, OUT
    target, keep = TARGET_SRGB_Y, KEEP_CHROMA
    for arg in sys.argv[1:]:
        if arg.startswith('--target='): target = float(arg.split('=')[1])
        elif arg.startswith('--sat='): keep = float(arg.split('=')[1])
        elif arg.startswith('--out='): out = arg.split('=')[1]
        elif arg.startswith('--src='): src = arg.split('=')[1]

    im = Image.open(src).convert('RGB')
    a = srgb_to_lin(np.asarray(im).astype(np.float64) / 255.0)
    H, W = a.shape[:2]
    L = 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]
    L = np.maximum(L, 1e-6)

    # --- 1. split ---------------------------------------------------------
    low = gauss_wrap(L, 26.0)                 # ~6 cm at 2.5 m per 1024 px tile
    detail = L / np.maximum(low, 1e-6)        # ratio: mean ~1, scale free

    # --- 2. soft-clip the detail so one crack cannot dominate --------------
    d = np.log(np.maximum(detail, 1e-4))
    s = 0.34                                   # log-space half-width of the soft knee
    d = s * np.tanh(d / s)
    detail = np.exp(d)

    # --- 3. cross-hatch out the directional structure ----------------------
    # A quarter turn of a seamless square tile is still seamless, and the half-tile roll puts the
    # rotated copy's edge features in the middle of this one, so the two copies' straight lines
    # cannot coincide at the tile boundary and add up into a seam.
    rot = np.roll(np.rot90(detail, 1), (H // 2, W // 2), axis=(0, 1))
    detail = (1 - ROT_MIX) * detail + ROT_MIX * rot
    d = np.log(np.maximum(detail, 1e-4))
    # DESTRIPE. Whatever survives as a straight axis-aligned feature — the source's cracks and
    # scratches, and the tile boundary itself — is a full row or a full column of the array with a
    # mean of its own. Subtract the per-row and per-column means and those features go; isotropic
    # pebble grain, which has no row or column bias, does not. Both are per-row/per-column
    # constants, so the tile stays exactly as seamless as it was.
    d -= d.mean(axis=1, keepdims=True)
    d -= d.mean(axis=0, keepdims=True)
    detail = np.exp(d * DETAIL_GAIN)
    detail /= detail.mean()

    # --- 4. flatten the low-frequency term ---------------------------------
    lown = low / low.mean()
    lown = 1.0 + (lown - 1.0) * LOW_FLATTEN

    newL = lown * detail

    # --- 5. colour: a little of the original chroma, plus a tile-periodic mottle
    chroma = a / L[..., None]                 # original colour ratios, value removed
    chroma = 1.0 + (chroma - 1.0) * keep
    yy, xx = np.mgrid[0:H, 0:W] * (2 * np.pi / W)
    # integer frequencies only -> exactly periodic over the tile -> still seamless
    m = (np.sin(3 * xx + 1.1) * np.sin(2 * yy + 0.4)
         + 0.6 * np.sin(5 * yy - 0.7) * np.sin(4 * xx + 2.2)
         + 0.45 * np.sin(7 * xx + 0.3) * np.sin(9 * yy + 1.7))
    m /= np.abs(m).max()
    warm = np.stack([1 + 0.125 * m, 1 + 0.015 * m, 1 - 0.125 * m], -1)   # warm <-> cool, ~+-12 %
    rgb = newL[..., None] * chroma * warm

    # --- 6. land the value -------------------------------------------------
    cur = (0.299 * lin_to_srgb(rgb[..., 0]) + 0.587 * lin_to_srgb(rgb[..., 1])
           + 0.114 * lin_to_srgb(rgb[..., 2])).mean() * 255.0
    # solve the linear scale that puts the sRGB luma mean on target (sRGB is not linear, so iterate)
    k = 1.0
    for _ in range(40):
        t = rgb * k
        y = (0.299 * lin_to_srgb(t[..., 0]) + 0.587 * lin_to_srgb(t[..., 1])
             + 0.114 * lin_to_srgb(t[..., 2])).mean() * 255.0
        if abs(y - target) < 0.05:
            break
        k *= (target / max(y, 1e-6)) ** 1.6
    rgb = np.clip(rgb * k, 0, 1)

    px = (lin_to_srgb(rgb) * 255.0).round().astype(np.uint8)
    img = Image.fromarray(px)
    img.save(out, 'WEBP', quality=84, method=6)

    b = px.astype(np.float32)
    Y = 0.299 * b[..., 0] + 0.587 * b[..., 1] + 0.114 * b[..., 2]
    mx, mn = b.max(-1), b.min(-1)
    sat = np.where(mx > 0, (mx - mn) / np.maximum(mx, 1e-6), 0)
    lin = srgb_to_lin(b / 255.0)
    linY = 0.2126 * lin[..., 0] + 0.7152 * lin[..., 1] + 0.0722 * lin[..., 2]
    print(f'src sRGB luma mean {cur:.1f} -> out {Y.mean():.1f}  (p25 {np.percentile(Y,25):.1f} '
          f'p75 {np.percentile(Y,75):.1f})')
    print(f'mean sat {sat.mean():.3f}   mean linear luma {linY.mean():.4f}   rel std {linY.std()/linY.mean():.3f}')
    print(f'mean rgb {b.reshape(-1,3).mean(0).round(1)}')
    import os
    print(f'wrote {out}  {os.path.getsize(out)/1024:.0f} KB')


main()
