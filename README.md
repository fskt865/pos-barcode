# POS Barcode Generator

Generates a random alphanumeric code and renders a **real, scannable Code 128-B barcode**
underneath it. Single self-contained HTML file — no dependencies, no build step, works offline.

## Use

Double-click **`index.html`** (runs straight from `file://`). Or, to scan it from a phone on
your LAN, serve it:

```powershell
powershell -ExecutionPolicy Bypass -File serve.ps1 8777
# then open http://localhost:8777  (or http://<this-pc-ip>:8777 from your phone)
```

## Features

- Auto-generates on load; **Generate** (or press **Space**) for a new code.
- **Copy** the string, **Print** just the label (styled for label printers).
- Options: length (4–24) and character set (A–Z 0–9 / digits / letters).
- Uses `crypto.getRandomValues` for the random string.

## How the barcode works

`index.html` contains a hand-rolled Code 128-B encoder (no libraries):

- Full 107-entry pattern table, each symbol the correct module width (11; Stop = 13).
- Start B → data → mod-103 checksum → Stop, rendered to crisp SVG with a 10-module quiet
  zone each side so scanners lock on.

Verified structurally: pattern count, per-symbol widths, and checksum all match the Code 128 spec.
