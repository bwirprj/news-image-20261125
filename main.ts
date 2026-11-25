// make.fun entry: 25 November 2026 world news, one 1024x1024 PNG.
// Written from scratch with the Node standard library. No dependencies, no network.
// Output: $MAKEFUN_OUTPUT_DIR/entry.png (default /output/entry.png).

const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');

const W = 1024;
const H = 1024;
const canvas = new Uint8Array(W * H * 3);

const COL = {
  night: [20, 30, 42],
  night2: [32, 46, 62],
  paper: [245, 242, 233],
  white: [255, 255, 255],
  ink: [24, 31, 39],
  body: [55, 65, 76],
  faint: [112, 118, 122],
  line: [205, 200, 187],
  red: [178, 45, 42],
  blue: [28, 78, 126],
  teal: [26, 105, 96],
  amber: [186, 134, 36],
  violet: [96, 70, 138],
};

// 5x7 font. Each glyph is seven 5-bit rows, written as hex by hand.
const FONT = {
  'A': [0x0e, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  'B': [0x1e, 0x11, 0x11, 0x1e, 0x11, 0x11, 0x1e],
  'C': [0x0f, 0x10, 0x10, 0x10, 0x10, 0x10, 0x0f],
  'D': [0x1e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x1e],
  'E': [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x1f],
  'F': [0x1f, 0x10, 0x10, 0x1e, 0x10, 0x10, 0x10],
  'G': [0x0f, 0x10, 0x10, 0x17, 0x11, 0x11, 0x0f],
  'H': [0x11, 0x11, 0x11, 0x1f, 0x11, 0x11, 0x11],
  'I': [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x1f],
  'J': [0x07, 0x02, 0x02, 0x02, 0x02, 0x12, 0x0c],
  'K': [0x11, 0x12, 0x14, 0x18, 0x14, 0x12, 0x11],
  'L': [0x10, 0x10, 0x10, 0x10, 0x10, 0x10, 0x1f],
  'M': [0x11, 0x1b, 0x15, 0x15, 0x11, 0x11, 0x11],
  'N': [0x11, 0x19, 0x15, 0x13, 0x11, 0x11, 0x11],
  'O': [0x0e, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  'P': [0x1e, 0x11, 0x11, 0x1e, 0x10, 0x10, 0x10],
  'Q': [0x0e, 0x11, 0x11, 0x11, 0x15, 0x12, 0x0d],
  'R': [0x1e, 0x11, 0x11, 0x1e, 0x14, 0x12, 0x11],
  'S': [0x0f, 0x10, 0x10, 0x0e, 0x01, 0x01, 0x1e],
  'T': [0x1f, 0x04, 0x04, 0x04, 0x04, 0x04, 0x04],
  'U': [0x11, 0x11, 0x11, 0x11, 0x11, 0x11, 0x0e],
  'V': [0x11, 0x11, 0x11, 0x11, 0x11, 0x0a, 0x04],
  'W': [0x11, 0x11, 0x11, 0x15, 0x15, 0x1b, 0x11],
  'X': [0x11, 0x11, 0x0a, 0x04, 0x0a, 0x11, 0x11],
  'Y': [0x11, 0x11, 0x0a, 0x04, 0x04, 0x04, 0x04],
  'Z': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x10, 0x1f],
  '0': [0x0e, 0x11, 0x13, 0x15, 0x19, 0x11, 0x0e],
  '1': [0x04, 0x0c, 0x04, 0x04, 0x04, 0x04, 0x0e],
  '2': [0x0e, 0x11, 0x01, 0x02, 0x04, 0x08, 0x1f],
  '3': [0x1e, 0x01, 0x01, 0x0e, 0x01, 0x01, 0x1e],
  '4': [0x02, 0x06, 0x0a, 0x12, 0x1f, 0x02, 0x02],
  '5': [0x1f, 0x10, 0x10, 0x1e, 0x01, 0x01, 0x1e],
  '6': [0x0e, 0x10, 0x10, 0x1e, 0x11, 0x11, 0x0e],
  '7': [0x1f, 0x01, 0x02, 0x04, 0x08, 0x08, 0x08],
  '8': [0x0e, 0x11, 0x11, 0x0e, 0x11, 0x11, 0x0e],
  '9': [0x0e, 0x11, 0x11, 0x0f, 0x01, 0x01, 0x0e],
  ' ': [0, 0, 0, 0, 0, 0, 0],
  '.': [0, 0, 0, 0, 0, 0x0c, 0x0c],
  ',': [0, 0, 0, 0, 0x0c, 0x0c, 0x08],
  '/': [0x01, 0x01, 0x02, 0x04, 0x08, 0x10, 0x10],
  ':': [0, 0x0c, 0x0c, 0, 0x0c, 0x0c, 0],
  '-': [0, 0, 0, 0x1f, 0, 0, 0],
  '+': [0, 0x04, 0x04, 0x1f, 0x04, 0x04, 0],
  "'": [0x04, 0x04, 0, 0, 0, 0, 0],
  '!': [0x04, 0x04, 0x04, 0x04, 0x04, 0, 0x04],
  '?': [0x0e, 0x11, 0x01, 0x02, 0x04, 0, 0x04],
  '%': [0x19, 0x19, 0x02, 0x04, 0x08, 0x13, 0x13],
};

function step(s) { return s >= 3 ? 6 * s : 5 * s + s; }
function measure(s, k) {
  if (!s.length) return 0;
  return (s.length - 1) * step(k) + 5 * k;
}

function dot(x, y, c) {
  const ix = x | 0, iy = y | 0;
  if (ix < 0 || iy < 0 || ix >= W || iy >= H) return;
  const p = (iy * W + ix) * 3;
  canvas[p] = c[0]; canvas[p + 1] = c[1]; canvas[p + 2] = c[2];
}
function wash(c) {
  for (let p = 0; p < canvas.length; p += 3) {
    canvas[p] = c[0]; canvas[p + 1] = c[1]; canvas[p + 2] = c[2];
  }
}
function box(x, y, w, h, c) {
  for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) dot(xx, yy, c);
}
function outline(x, y, w, h, c, t) {
  const q = t || 1;
  box(x, y, w, q, c); box(x, y + h - q, w, q, c);
  box(x, y, q, h, c); box(x + w - q, y, q, h, c);
}
function hbar(x, y, len, c, t) { box(x, y, len, t || 1, c); }
function vbar(x, y, len, c, t) { box(x, y, t || 1, len, c); }
function stroke(x0, y0, x1, y1, c, t) {
  const q = t || 1;
  let a = x0 | 0, b = y0 | 0;
  const dx = Math.abs(x1 - a), dy = Math.abs(y1 - b);
  const sx = a < x1 ? 1 : -1, sy = b < y1 ? 1 : -1;
  let e = dx - dy;
  for (;;) {
    box(a, b, q, q, c);
    if (a === (x1 | 0) && b === (y1 | 0)) break;
    const e2 = 2 * e;
    if (e2 > -dy) { e -= dy; a += sx; }
    if (e2 < dx) { e += dx; b += sy; }
  }
}
function round(cx, cy, r, c, filled) {
  for (let y = -r; y <= r; y++) {
    for (let x = -r; x <= r; x++) {
      const d = x * x + y * y;
      if (d > r * r) continue;
      if (filled || d >= (r - 2) * (r - 2)) dot(cx + x, cy + y, c);
    }
  }
}
function oval(cx, cy, rx, ry, c) {
  for (let a = 0; a < 360; a += 2) {
    const r = a * Math.PI / 180;
    dot(Math.round(cx + rx * Math.cos(r)), Math.round(cy + ry * Math.sin(r)), c);
  }
}
function put(s, x, y, k, c, heavy) {
  const up = String(s).toUpperCase();
  for (let i = 0; i < up.length; i++) {
    const rows = FONT[up[i]] || FONT[' '];
    const ox = x + i * step(k);
    for (let r = 0; r < 7; r++) {
      const bits = rows[r];
      for (let b = 0; b < 5; b++) {
        if (bits & (16 >> b)) {
          box(ox + b * k, y + r * k, k, k, c);
          if (heavy && k >= 2) box(ox + b * k + 1, y + r * k, k, k, c);
        }
      }
    }
  }
}
function right(s, xEnd, y, k, c, heavy) { put(s, xEnd - measure(s, k), y, k, c, heavy); }

function rocket(cx, cy) {
  // upright Long March style vehicle with a small green-white flag
  box(cx - 13, cy - 58, 26, 82, COL.white);
  outline(cx - 13, cy - 58, 26, 82, COL.night, 2);
  stroke(cx - 13, cy - 58, cx, cy - 88, COL.white, 3);
  stroke(cx + 13, cy - 58, cx, cy - 88, COL.white, 3);
  box(cx - 13, cy - 20, 26, 5, COL.red);
  box(cx - 13, cy + 8, 26, 5, COL.red);
  round(cx, cy - 40, 7, COL.blue, true);
  round(cx, cy - 40, 7, COL.white, false);
  stroke(cx - 13, cy + 16, cx - 24, cy + 46, COL.night, 3);
  stroke(cx + 13, cy + 16, cx + 24, cy + 46, COL.night, 3);
  stroke(cx - 8, cy + 24, cx, cy + 72, COL.amber, 4);
  stroke(cx, cy + 24, cx + 8, cy + 72, COL.red, 4);
  stroke(cx - 4, cy + 24, cx + 4, cy + 60, COL.white, 2);
  // flight tower and launch gantry
  vbar(cx - 46, cy - 86, 140, COL.night2, 3);
  for (let y = -80; y < 50; y += 18) hbar(cx - 46, cy + y, 30, COL.night2, 2);
  box(cx - 46, cy + 54, 60, 4, COL.night);
}

function flames(cx, cy) {
  stroke(cx - 22, cy + 24, cx - 30, cy - 6, COL.red, 4);
  stroke(cx - 30, cy - 6, cx - 12, cy - 30, COL.amber, 4);
  stroke(cx - 12, cy - 30, cx + 6, cy + 8, COL.red, 4);
  stroke(cx + 6, cy + 8, cx + 24, cy - 22, COL.amber, 4);
  stroke(cx + 24, cy - 22, cx + 32, cy + 24, COL.red, 4);
  hbar(cx - 34, cy + 26, 68, COL.night, 3);
  stroke(cx - 10, cy + 24, cx - 20, cy - 12, COL.white, 2);
  stroke(cx + 8, cy + 24, cx + 2, cy - 6, COL.white, 2);
}

function worldMap(x, y, w, h) {
  box(x, y, w, h, COL.white);
  outline(x, y, w, h, COL.line);
  // land masses as soft blobs, sampled into a dot grid
  const land = [
    [140, 44, 66, 24], [186, 76, 17, 8], [220, 108, 28, 24],
    [464, 42, 42, 17], [492, 92, 38, 31], [650, 46, 128, 32],
    [624, 80, 20, 13], [716, 88, 30, 11], [822, 110, 40, 16],
  ];
  for (let gy = 14; gy < h - 10; gy += 9) {
    for (let gx = 12; gx < w - 10; gx += 9) {
      let on = false;
      for (const b of land) {
        const u = (gx - b[0]) / b[2], v = (gy - b[1]) / b[3];
        if (u * u + v * v < 1) { on = true; break; }
      }
      if (on) round(x + gx, y + gy, 2, COL.blue, true);
      else dot(x + gx, y + gy, COL.line);
    }
  }
  const pins = [
    ['N AMERICA', 140, 44], ['S AMERICA', 220, 108], ['EUROPE', 464, 42],
    ['MID EAST', 560, 70], ['AFRICA', 492, 92], ['ASIA', 690, 46], ['OCEANIA', 822, 110],
  ];
  for (const pin of pins) {
    const px = x + pin[1], py = y + pin[2];
    round(px, py, 5, COL.red, true);
    round(px, py, 2, COL.white, true);
    if (pin[0] === 'N AMERICA') put(pin[0], px - 30, py - 22, 1, COL.ink, true);
    else if (pin[0] === 'S AMERICA') put(pin[0], px - 30, py + 12, 1, COL.ink, true);
    else if (pin[0] === 'OCEANIA') right(pin[0], px + 26, py - 22, 1, COL.ink, true);
    else put(pin[0], px - 12, py + 10, 1, COL.ink, true);
  }
}

function tagIcon(kind, cx, cy, c) {
  if (kind === 'chart') {
    box(cx - 13, cy + 7, 7, 7, c); box(cx - 3, cy, 7, 14, c); box(cx + 7, cy - 9, 7, 23, c);
  } else if (kind === 'people') {
    round(cx - 8, cy - 4, 5, c, true); round(cx + 8, cy - 4, 5, c, true);
    box(cx - 15, cy + 5, 14, 7, c); box(cx + 1, cy + 5, 14, 7, c);
  } else if (kind === 'ship') {
    hbar(cx - 14, cy + 8, 28, c, 3); stroke(cx - 9, cy + 6, cx - 9, cy - 8, c, 2);
    stroke(cx - 9, cy - 8, cx + 8, cy - 8, c, 2); stroke(cx + 8, cy - 8, cx + 8, cy + 6, c, 2);
  } else if (kind === 'globe') {
    round(cx, cy, 12, c, false); oval(cx, cy, 5, 12, c); hbar(cx - 12, cy, 24, c);
  } else if (kind === 'handshake') {
    stroke(cx - 16, cy + 6, cx - 4, cy - 6, c, 3);
    stroke(cx + 16, cy + 6, cx + 4, cy - 6, c, 3);
    box(cx - 5, cy - 5, 10, 10, c);
  } else if (kind === 'alert') {
    stroke(cx, cy - 13, cx - 14, cy + 11, c, 2);
    stroke(cx - 14, cy + 11, cx + 14, cy + 11, c, 2);
    stroke(cx + 14, cy + 11, cx, cy - 13, c, 2);
    box(cx - 1, cy - 5, 2, 9, c); box(cx - 1, cy + 6, 2, 2, c);
  } else if (kind === 'chip') {
    outline(cx - 9, cy - 9, 18, 18, c, 2); outline(cx - 4, cy - 4, 8, 8, c, 1);
    for (let q = -6; q <= 6; q += 6) {
      hbar(cx - 14, cy + q, 4, c, 2); hbar(cx + 10, cy + q, 4, c, 2);
    }
  } else if (kind === 'trophy') {
    box(cx - 8, cy - 10, 16, 14, c); hbar(cx - 12, cy - 8, 4, c, 3); hbar(cx + 8, cy - 8, 4, c, 3);
    box(cx - 2, cy + 4, 4, 8, c); hbar(cx - 8, cy + 12, 16, c, 3);
  }
}

function card(x, y, w, h, accent, icon, kicker, line1, line2, detail, source) {
  box(x, y, w, h, COL.white);
  outline(x, y, w, h, COL.line);
  box(x, y, w, 5, accent);
  box(x, y + 5, 4, h - 5, accent);
  put(kicker, x + 14, y + 16, 1, accent, true);
  put(line1, x + 14, y + 38, 3, COL.ink, true);
  put(line2, x + 14, y + 60, 3, COL.ink, true);
  put(detail, x + 14, y + 88, 2, COL.body);
  hbar(x + 14, y + h - 36, w - 28, COL.line);
  put(source, x + 14, y + h - 28, 1, COL.faint);
  tagIcon(icon, x + w - 34, y + h - 50, accent);
}

function masthead() {
  box(0, 0, W, 108, COL.night);
  box(0, 108, W, 5, COL.red);
  put('WEDNESDAY', 34, 12, 2, COL.amber, true);
  put('25 NOVEMBER 2026', 34, 36, 6, COL.white, true);
  put('THE DAILY BRIEF', 700, 16, 2, COL.white, true);
  put('ONE DAY', 700, 46, 2, COL.amber);
  put('ONE IMAGE', 700, 70, 2, COL.amber);
  vbar(672, 14, 66, COL.night2, 2);
}

function hero() {
  box(32, 130, 620, 212, COL.white);
  outline(32, 130, 620, 212, COL.line);
  box(32, 130, 620, 5, COL.red);
  put('SPACE  /  ASIA', 48, 146, 2, COL.red, true);
  rocket(148, 274);
  put('SHENZHOU-24', 288, 164, 5, COL.ink, true);
  put('FIRST FOREIGN', 288, 210, 4, COL.blue, true);
  put('ASTRONAUT ABOARD', 288, 238, 4, COL.blue, true);
  put('Long March-2F from Jiuquan.', 288, 276, 2, COL.body);
  put('Pakistani crew member Zeeshan Ali;', 288, 296, 2, COL.body);
  put('Tiangong-bound, 41st Chinese crewed flight.', 288, 316, 2, COL.body);
  put('SOURCE: CMSA / XINHUA / SCMP, 25 NOV', 288, 336, 1, COL.faint);
}

function firePanel() {
  box(668, 130, 324, 212, COL.white);
  outline(668, 130, 324, 212, COL.line);
  box(668, 130, 324, 5, COL.amber);
  put('CLIMATE  /  OCEANIA', 684, 146, 2, COL.amber, true);
  flames(828, 216);
  put('FLINDERS ISLAND', 684, 264, 3, COL.ink, true);
  put('BUSHFIRE EMERGENCY', 684, 288, 3, COL.red, true);
  put('Tasmania: too late to leave.', 684, 316, 2, COL.body);
  put('Killiecrankie, Leeka, Mt Tanner.', 684, 336, 2, COL.body);
}

function grid() {
  const xs = [32, 360, 688], y1 = 522, y2 = 706, w = 304, h = 168;
  card(xs[0], y1, w, h, COL.blue, 'chart', 'ECONOMY  /  UNITED STATES',
    'US DATA DAY BEFORE', 'THANKSGIVING', 'GDP, PCE, durable goods', '13:30 UTC RELEASES');
  card(xs[1], y1, w, h, COL.teal, 'people', 'DIPLOMACY  /  EUROPE',
    'EU AND WESTERN', 'BALKANS SUMMIT', 'Leaders meet in Brussels', 'CONSILIUM.EUROPA.EU');
  card(xs[2], y1, w, h, COL.red, 'ship', 'ENERGY  /  MIDDLE EAST',
    'FOURTH TANKER HITS', 'HORMUZ MINE', 'Iran sets seven conditions', 'IRNA / XINHUA');
  card(xs[0], y2, w, h, COL.violet, 'alert', 'WEATHER  /  SOUTH AFRICA',
    'LEVEL 4 STORMS HIT', 'FOUR PROVINCES', 'Hail, floods near Joburg', 'SAWS / CITIZEN, 25 NOV');
  card(xs[1], y2, w, h, COL.teal, 'handshake', 'PACIFIC  /  SOLOMON ISLANDS',
    'AUSTRALIA SIGNS', 'SECURITY TREATY', 'No foreign military base', 'PM.GOV.AU / ABC');
  card(xs[2], y2, w, h, COL.amber, 'people', 'AMERICAS  /  COLOMBIA',
    'SUPERMARKET', 'HOSTAGE STAND-OFF', '25 held in Cartagena', 'AFP / REUTERS, 25 NOV');
}

function footer() {
  hbar(32, 944, 960, COL.line, 2);
  put('EVENTS OF 25 NOVEMBER 2026, FIRST REPORTED IN ANY TIME ZONE. FIGURES AS REPORTED.',
    32, 958, 1, COL.faint);
  right('PREPARED BY @BWIRPRJ', 992, 984, 1, COL.faint, true);
}

function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  }
  return (c ^ 0xffffffff) >>> 0;
}
function piece(type, data) {
  const n = Buffer.alloc(4); n.writeUInt32BE(data.length, 0);
  const t = Buffer.from(type, 'ascii');
  const v = Buffer.alloc(4); v.writeUInt32BE(crc32(Buffer.concat([t, data])), 0);
  return Buffer.concat([n, t, data, v]);
}
function png() {
  const head = Buffer.alloc(13);
  head.writeUInt32BE(W, 0); head.writeUInt32BE(H, 4);
  head[8] = 8; head[9] = 2; head[10] = 0; head[11] = 0; head[12] = 0;
  const raw = Buffer.alloc((W * 3 + 1) * H);
  let p = 0;
  for (let y = 0; y < H; y++) {
    raw[p++] = 0;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 3;
      raw[p++] = canvas[i]; raw[p++] = canvas[i + 1]; raw[p++] = canvas[i + 2];
    }
  }
  const packed = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]),
    piece('IHDR', head), piece('IDAT', packed), piece('IEND', Buffer.alloc(0)),
  ]);
}

wash(COL.paper);
for (let gx = 0; gx < W; gx += 32) vbar(gx, 113, H - 113, [238, 235, 226]);
masthead();
hero();
firePanel();
worldMap(32, 356, 960, 154);
grid();
footer();

const bytes = png();
const dir = process.env.MAKEFUN_OUTPUT_DIR || '/output';
fs.mkdirSync(dir, { recursive: true, mode: 0o755 });
const out = path.join(dir, 'entry.png');
fs.writeFileSync(out, bytes, { mode: 0o644 });
fs.chmodSync(out, 0o644);
console.log('wrote ' + out + ' (' + bytes.length + ' bytes, ' + W + 'x' + H + ')');
