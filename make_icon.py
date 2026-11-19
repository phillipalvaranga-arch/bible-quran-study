#!/usr/bin/env python3
"""Gold open book on a navy gradient, rendered at 1024 and downscaled."""
from pathlib import Path
from PIL import Image, ImageDraw
ROOT = Path(__file__).resolve().parent; IC = ROOT / "icons"; IC.mkdir(exist_ok=True)
def render(S=1024, inset=0.0, rounded=True):
    img = Image.new("RGBA", (S, S), (0, 0, 0, 0))
    bg = Image.new("RGBA", (S, S))
    px = bg.load()
    for y in range(S):
        t = y / (S - 1)
        c = (int(16 + (6 - 16) * t), int(38 + (16 - 38) * t), int(72 + (34 - 72) * t), 255)
        for x in range(S): px[x, y] = c
    mask = Image.new("L", (S, S), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, S - 1, S - 1), radius=int(S * 0.2) if rounded else 0, fill=255)
    img.paste(bg, (0, 0), mask)
    d = ImageDraw.Draw(img)
    k = 1 - 2 * inset
    def P(x, y): return (S * (inset + x * k), S * (inset + y * k))
    gold, lt, dk = (222, 182, 70), (250, 230, 160), (150, 108, 26)
    # pages: left and right
    d.polygon([P(.5, .34), P(.16, .27), P(.16, .72), P(.5, .79)], fill=lt, outline=dk)
    d.polygon([P(.5, .34), P(.84, .27), P(.84, .72), P(.5, .79)], fill=(255, 244, 205), outline=dk)
    # cover edge
    d.polygon([P(.13, .30), P(.16, .27), P(.16, .72), P(.5, .79), P(.84, .72), P(.84, .27), P(.87, .30), P(.87, .76), P(.5, .84), P(.13, .76)], fill=gold)
    # text lines
    for i in range(6):
        y = .38 + i * .055
        d.line([P(.21, y - .02), P(.45, y + .03)], fill=dk, width=max(2, S // 110))
        d.line([P(.55, y + .03), P(.79, y - .02)], fill=dk, width=max(2, S // 110))
    d.line([P(.5, .34), P(.5, .80)], fill=dk, width=max(3, S // 90))
    # small gold cross above the book
    w = .022
    d.rectangle([P(.5 - w, .08), P(.5 + w, .25)], fill=gold)
    d.rectangle([P(.43, .12), P(.57, .12 + 2 * w)], fill=gold)
    return img
base = render()
for n, s in [("icon-192.png", 192), ("icon-512.png", 512), ("apple-touch-icon.png", 180), ("favicon.png", 64)]:
    base.resize((s, s), Image.LANCZOS).save(IC / n)
render(inset=0.12, rounded=False).resize((512, 512), Image.LANCZOS).save(IC / "maskable-512.png")
base.resize((256, 256), Image.LANCZOS).save(ROOT / "icon.ico", sizes=[(16, 16), (24, 24), (32, 32), (48, 48), (64, 64), (128, 128), (256, 256)])
print("ok")
