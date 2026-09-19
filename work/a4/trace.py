#!/usr/bin/env python3
"""Trace refs/logo/tao_symbol.png into THREE.Shape commands.

Method: threshold alpha > 127 -> binary mask; Moore-neighbour boundary walk of the
single connected glyph (pixel centres, 8-connected, Jacob's stopping criterion);
Ramer-Douglas-Peucker (eps 0.9 px) for corner candidates; then greedy merging of
consecutive RDP spans into least-squares quadratic Beziers (max deviation 0.55 px
against the raw boundary), demoted to lineTo when the control point lies within
0.35 px of the chord. Output: JS moveTo/lineTo/quadraticCurveTo calls in metres,
centred, glyph height = 55 % of the 0.6 m coin face; and trace_check.png.
"""
import sys, math
import numpy as np
from PIL import Image, ImageDraw

SRC = '/Users/dev/Documents/Cursor.Code/midnight-dash/refs/logo/tao_symbol.png'
OUT_JS = '/Users/dev/Documents/Cursor.Code/midnight-dash/work/a4/glyph_commands.js'
OUT_PNG = '/Users/dev/Documents/Cursor.Code/midnight-dash/work/a4/trace_check.png'
FACE = 0.6
GLYPH_FRAC = 0.55
RDP_EPS = float(sys.argv[1]) if len(sys.argv) > 1 else 0.9
FIT_TOL = float(sys.argv[2]) if len(sys.argv) > 2 else 0.55
LINE_TOL = 0.5

im = Image.open(SRC).convert('RGBA')
a = np.array(im)
mask = a[..., 3] > 127
# also treat dark opaque-on-white as glyph, in case alpha is flat
if mask.all() or not mask.any():
    mask = a[..., :3].mean(axis=2) < 128
H, W = mask.shape
pad = np.zeros((H + 2, W + 2), bool); pad[1:-1, 1:-1] = mask
M = pad

# --- holes check: flood the background from the corner, any unreached background is a hole
from collections import deque
seen = np.zeros_like(M); q = deque([(0, 0)]); seen[0, 0] = True
while q:
    y, x = q.popleft()
    for dy, dx in ((1,0),(-1,0),(0,1),(0,-1)):
        ny, nx = y+dy, x+dx
        if 0 <= ny < M.shape[0] and 0 <= nx < M.shape[1] and not seen[ny, nx] and not M[ny, nx]:
            seen[ny, nx] = True; q.append((ny, nx))
holes = int(((~M) & (~seen)).sum())
print('hole pixels:', holes)

# --- Moore neighbour tracing
ys, xs = np.nonzero(M)
start = (ys[0], xs[0])          # first foreground pixel in raster order
# 8 neighbours clockwise starting from West
NB = [(0,-1),(-1,-1),(-1,0),(-1,1),(0,1),(1,1),(1,0),(1,-1)]
def trace(M, start):
    contour = [start]
    b = (start[0], start[1] - 1)   # backtrack: the pixel west of start (background)
    p = start
    first_next = None
    while True:
        # index of b relative to p
        d = (b[0]-p[0], b[1]-p[1]); k = NB.index(d)
        found = None
        for i in range(1, 9):
            c = NB[(k + i) % 8]
            n = (p[0]+c[0], p[1]+c[1])
            if M[n]:
                found = n; b = (p[0]+NB[(k+i-1) % 8][0], p[1]+NB[(k+i-1) % 8][1]); break
        if found is None: break
        if found == start and first_next is not None and p == contour[-1] and len(contour) > 2:
            # Jacob's criterion: back at start entering from the same direction
            if (contour[1] == first_next) and found == start:
                # check we would leave start the same way next
                break
        if p == start and first_next is None: first_next = found
        contour.append(found); p = found
        if len(contour) > 20000: break
    # trim duplicate closing start if present
    if contour[-1] == start: contour.pop()
    return contour
raw = trace(M, start)
# to (x, y) in unpadded pixel coords
pts = np.array([(x - 1, y - 1) for (y, x) in raw], float)
print('boundary pixels:', len(pts))
# pixel-centre tracing sits half a pixel inside the true (alpha = 0.5) edge: push each
# point 0.35 px along its outward normal (the side whose pixel is background).
N = len(pts); off = np.zeros_like(pts)
for i in range(N):
    t = pts[(i+1) % N] - pts[(i-1) % N]; L = np.hypot(*t)
    if L == 0: continue
    n = np.array([t[1], -t[0]]) / L
    for sgn in (1, -1):
        q = pts[i] + sgn * n * 1.0; qy, qx = int(round(q[1])) + 1, int(round(q[0])) + 1
        inside = 0 <= qy < M.shape[0] and 0 <= qx < M.shape[1] and M[qy, qx]
        if not inside: off[i] = sgn * n * 0.35; break
pts = pts + off

# --- RDP (closed polyline: split at the two farthest points)
def rdp(P, eps):
    if len(P) < 3: return list(range(len(P)))
    a, b = P[0], P[-1]
    ab = b - a; L = np.hypot(*ab)
    if L == 0: d = np.hypot(*(P - a).T)
    else: d = np.abs(ab[0]*(P[:,1]-a[1]) - ab[1]*(P[:,0]-a[0])) / L
    i = int(d.argmax())
    if d[i] > eps:
        l = rdp(P[:i+1], eps); r = rdp(P[i:], eps)
        return l[:-1] + [j + i for j in r]
    return [0, len(P)-1]
# rotate so that index 0 is the point farthest from the centroid (a real corner)
c0 = pts.mean(axis=0)
i0 = int(np.hypot(*(pts - c0).T).argmax())
pts = np.roll(pts, -i0, axis=0)
closed = np.vstack([pts, pts[:1]])
corners = rdp(closed, RDP_EPS)
corners = sorted(set(corners));
if corners[-1] == len(pts): corners[-1] = 0
corners = sorted(set(corners))
print('RDP vertices:', len(corners))

# --- quadratic fitting over raw boundary spans
def span(i, j):
    """raw points from corner index i to corner index j (inclusive), wrapping."""
    if j > i: return pts[i:j+1]
    return np.vstack([pts[i:], pts[:j+1]])
def fit_quad(P):
    P0, P2 = P[0], P[-1]
    seg = np.hypot(*np.diff(P, axis=0).T); t = np.concatenate([[0], np.cumsum(seg)])
    if t[-1] == 0: return P0, 0.0
    t = t / t[-1]
    w = 2*t*(1-t)
    rhs = P - np.outer((1-t)**2, P0) - np.outer(t**2, P2)
    den = (w*w).sum()
    C = (w[:,None]*rhs).sum(axis=0) / den if den > 1e-9 else (P0+P2)/2
    # error: sample curve densely, min distance per point
    s = np.linspace(0, 1, max(24, 4*len(P)))
    B = np.outer((1-s)**2, P0) + np.outer(2*s*(1-s), C) + np.outer(s**2, P2)
    d = np.sqrt(((P[:,None,:] - B[None,:,:])**2).sum(-1)).min(axis=1)
    return C, float(d.max())
def chord_dist(P0, P2, C):
    ab = P2 - P0; L = np.hypot(*ab)
    if L == 0: return 0.0
    return abs(ab[0]*(C[1]-P0[1]) - ab[1]*(C[0]-P0[0])) / L

n = len(corners)
cmds = []  # ('L', p) or ('Q', c, p)
k = 0
while k < n:
    i = corners[k]
    best = None
    m = k + 1
    while m <= n:
        j = corners[m % n]
        P = span(i, j)
        C, err = fit_quad(P)
        if err <= FIT_TOL: best = (m, C, P[-1]); m += 1
        else: break
        if m - k > n: break
    if best is None:
        j = corners[(k+1) % n]; P = span(i, j); C, err = fit_quad(P); best = ((k+1), C, P[-1])
    m, C, Pend = best
    P0 = pts[i]
    if chord_dist(P0, Pend, C) <= LINE_TOL: cmds.append(('L', Pend))
    else: cmds.append(('Q', C, Pend))
    k = m
print('commands (incl. moveTo):', len(cmds) + 1)

# --- to metres
x0, x1 = pts[:,0].min(), pts[:,0].max(); y0, y1 = pts[:,1].min(), pts[:,1].max()
# pixel extents are edges: add 1 px to bounds (pixel centres -> pixel edges)
gw, gh = (x1 - x0 + 1), (y1 - y0 + 1)
cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
scale = FACE * GLYPH_FRAC / gh
def tom(p): return ((p[0]-cx)*scale, -(p[1]-cy)*scale)
lines = []
sx, sy = tom(pts[corners[0]])
lines.append(f'  shape.moveTo({sx:.4f}, {sy:.4f});')
for c in cmds:
    if c[0] == 'L':
        x, y = tom(c[1]); lines.append(f'  shape.lineTo({x:.4f}, {y:.4f});')
    else:
        qx, qy = tom(c[1]); x, y = tom(c[2]); lines.append(f'  shape.quadraticCurveTo({qx:.4f}, {qy:.4f}, {x:.4f}, {y:.4f});')
lines.append('  shape.closePath();')
open(OUT_JS, 'w').write('\n'.join(lines) + '\n')
print('\n'.join(lines))
print(f'glyph px {gw:.0f}x{gh:.0f} -> {gw*scale:.4f} x {gh*scale:.4f} m; scale {scale:.6f} m/px')

# --- trace_check.png: original | traced outline over faint original | traced fill
S = 3
def sample_cmds():
    out = [pts[corners[0]]]
    cur = pts[corners[0]]
    for c in cmds:
        if c[0] == 'L': out.append(c[1]); cur = c[1]
        else:
            for s in np.linspace(0, 1, 16)[1:]:
                out.append((1-s)**2*cur + 2*s*(1-s)*c[1] + s**2*c[2])
            cur = c[2]
    return np.array(out)
poly = sample_cmds()
orig = Image.new('RGBA', (W, H), (255,255,255,255)); orig.alpha_composite(im)
orig = orig.convert('RGB').resize((W*S, H*S), Image.LANCZOS)
faint = Image.blend(orig, Image.new('RGB', orig.size, (255,255,255)), 0.75)
d = ImageDraw.Draw(faint)
pl = [((x+0.5)*S, (y+0.5)*S) for x, y in poly]
d.line(pl + [pl[0]], fill=(220, 30, 30), width=2)
for c in cmds:
    p = c[-1]; d.ellipse([(p[0]+0.5)*S-3, (p[1]+0.5)*S-3, (p[0]+0.5)*S+3, (p[1]+0.5)*S+3], fill=(30,90,220))
fill = Image.new('RGB', orig.size, (255,255,255)); ImageDraw.Draw(fill).polygon(pl, fill=(0,0,0))
# difference map: red = original only, blue = trace only
o = np.array(orig.convert('L')) < 128; f = np.array(fill.convert('L')) < 128
diff = np.full((H*S, W*S, 3), 255, np.uint8); diff[o & f] = (40,40,40); diff[o & ~f] = (230,40,40); diff[~o & f] = (40,80,230)
diffim = Image.fromarray(diff)
print('pixel disagreement (at 3x): orig-only', int((o&~f).sum()), 'trace-only', int((~o&f).sum()), 'of', int(o.sum()))
sheet = Image.new('RGB', (W*S*2 + 30, H*S*2 + 80), (255,255,255))
for i, (img, label) in enumerate([(orig, 'logo (tao_symbol.png)'), (faint, f'trace: {len(cmds)+1} Shape commands (blue = command end points)'), (fill, 'trace filled'), (diffim, 'diff (red = logo only, blue = trace only)')]):
    px, py = (i % 2)*(W*S+10)+10, (i // 2)*(H*S+40)+30
    sheet.paste(img, (px, py)); ImageDraw.Draw(sheet).text((px+2, py-20), label, fill=(0,0,0))
sheet.save(OUT_PNG)
print('wrote', OUT_PNG)
