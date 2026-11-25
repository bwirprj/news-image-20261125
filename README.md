# 25 November 2026 in one image

An original entry for make.fun's "Sum up 25 November's world news in one image" bounty.

`entry.png` is a 1024x1024 editorial poster naming the day and eight stories from 25 November 2026: Shenzhou-24 lifting off with China's first foreign astronaut, the Flinders Island bushfire emergency, the US data pile before Thanksgiving, the EU-Western Balkans summit in Brussels, the fourth tanker hit by a Hormuz mine, Level 4 storms across four South African provinces, the Australia-Solomon Islands treaty signed in Canberra, and the Cartagena supermarket hostage stand-off. Each claim comes from a dated report listed in the poster's source lines.

`main.ts` builds the poster with the Node standard library only. It rasterises a small bitmap font and simple shapes into an RGB buffer, then writes a PNG with a self-contained encoder using CRC32 and zlib. There are no dependencies and no network calls. The output path is `MAKEFUN_OUTPUT_DIR/entry.png`, defaulting to `/output/entry.png`. Two runs with the same environment produce identical bytes.

[![make.fun · news-image-20261125](https://make.fun/badge/news-image-20261125.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![rank](https://make.fun/badge/news-image-20261125/bwirprj/news-image-20261125/rank.svg)](https://make.fun/bounty/news-image-20261125/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)
[![reward](https://make.fun/badge/news-image-20261125/bwirprj/news-image-20261125/reward.svg)](https://make.fun/bounty/news-image-20261125?utm_source=github&utm_medium=readme&utm_campaign=news-image-20261125)

## Run locally

```sh
mkdir -p out
MAKEFUN_OUTPUT_DIR=out node main.ts
```

Node 22 or later is enough. The program prints the output path, byte count and dimensions.

## Check determinism

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
shasum -a 256 out/entry.png
MAKEFUN_OUTPUT_DIR=out node main.ts
shasum -a 256 out/entry.png
```

Both hashes match. The committed `entry.png` is the same image the program generates.

## License

MIT. See `LICENSE`.

Prepared by @bwirprj.
