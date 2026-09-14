# Vendored fonts

## press-start-2p-latin.woff2

- Font: **Press Start 2P** (v16, latin subset)
- Author: CodeMan38
- Source: Google Fonts (`https://fonts.googleapis.com/css2?family=Press+Start+2P`)
- License: SIL Open Font License 1.1
- License text: https://openfontlicense.org/open-font-license-official-text/

Vendored locally so builds are reproducible and the app makes no runtime
requests to a font CDN. The latin subset is intentional: the Pixel Forge
dual-font strategy uses the pixel display font for brand / titles / buttons /
English labels, while CJK text falls back to the system body font.
