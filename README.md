# POS Barcode Generator

Generates a random alphanumeric code and renders a **real, scannable Code 128-B barcode**
underneath it. Single self-contained HTML file — no dependencies, no build step, works offline.

**Live site:** https://fskt865.github.io/pos-barcode/

## Use

Just open the live site above, or double-click **`index.html`** locally (runs straight from
`file://`). To scan it from a phone on your LAN, serve it:

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1 8777
# then open http://localhost:8777  (or http://<this-pc-ip>:8777 from your phone)
```

## What it does

One button. Press **Generate** (or the **Space** bar) and it produces:

- An **8-character code** from an uppercase-letter + digit alphabet, using
  `crypto.getRandomValues`.
- **No look-alike characters:** the letters `I`, `L`, `O` are excluded, so a `0` is always
  zero and a `1` is always one — nothing left to confuse them with.
- A **real, scannable Code 128-B barcode** of that code.

The barcode-only view is print-friendly (browser Print → just the label prints), so it works
with a label printer too.

## How the barcode works

`index.html` contains a hand-rolled Code 128-B encoder (no libraries):

- Full 107-entry pattern table, each symbol the correct module width (11; Stop = 13).
- Start B → data → mod-103 checksum → Stop, rendered to crisp SVG with a 10-module quiet
  zone each side so scanners lock on.

Verified structurally: pattern count, per-symbol widths, and checksum all match the Code 128 spec.
