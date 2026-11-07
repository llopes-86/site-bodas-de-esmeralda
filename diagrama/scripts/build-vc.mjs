// Gera o JSONL de comandos do VectorCraft para o diagrama estático "ByteByteGo style".
// Uso: node build-vc.mjs > bbg-static.jsonl
const out = [];
const cmd = (id, params) => out.push({ command: id, params });

const C = {
  bg: '#f8fafc',
  card: '#ffffff',
  border: '#dbe3ec',
  navy: '#0f172a',
  ink: '#0f172a',
  muted: '#64748b',
  soft: '#cbd5e1',
  line: '#94a3b8',
  chip: '#1e293b',
  white: '#ffffff',
  blue: '#2563eb',
  emerald: '#059669',
  gold: '#b45309',
  orange: '#ea580c',
  violet: '#7c3aed',
  sky: '#0284c7',
  rose: '#e11d48'
};

function rect(x, y, w, h, r, fill, stroke = '#000000', sw = 0) {
  cmd('shape.rectangle', { x, y, width: w, height: h, radius: r });
  cmd('paint.setFill', { color: fill });
  if (sw > 0) {
    cmd('paint.setStroke', { color: stroke });
    cmd('stroke.set', { weight: sw, join: 'round' });
  } else {
    cmd('paint.setStroke', { none: true });
  }
}

function text(x, y, value, size, color, style = 'Regular', justify = 'left') {
  cmd('text.create', {
    x, y, text: value, size, font: 'Segoe UI', style, color, justify
  });
}

function centered(x, y, value, size, color, style = 'Regular') {
  text(x, y, value, size, color, style, 'center');
}

function line(d, color = C.line, weight = 3) {
  cmd('path.create', { d });
  cmd('paint.setFill', { none: true });
  cmd('paint.setStroke', { color });
  cmd('stroke.set', { weight, cap: 'round', join: 'round' });
}

function arrowHead(tipX, tipY, dir, size = 13, color = C.line) {
  const half = size * 0.55;
  const back = size;
  let d;
  if (dir === 'right') d = `M ${tipX},${tipY} L ${tipX - back},${tipY - half} L ${tipX - back},${tipY + half} Z`;
  else if (dir === 'left') d = `M ${tipX},${tipY} L ${tipX + back},${tipY - half} L ${tipX + back},${tipY + half} Z`;
  else if (dir === 'down') d = `M ${tipX},${tipY} L ${tipX - half},${tipY - back} L ${tipX + half},${tipY - back} Z`;
  else d = `M ${tipX},${tipY} L ${tipX - half},${tipY + back} L ${tipX + half},${tipY + back} Z`;
  cmd('path.create', { d, closed: true });
  cmd('paint.setFill', { color });
  cmd('paint.setStroke', { none: true });
}

function pill(x, y, w, h, fill, label, color, size = 12) {
  rect(x, y, w, h, h / 2, fill);
  centered(x + w / 2, y + h / 2 + size * 0.36, label, size, color, 'Semibold');
}

function card(x, y, w, h, accent, monogram, title, sub, dark = false) {
  rect(x, y, w, h, 18, dark ? C.navy : C.card, dark ? C.navy : C.border, 2);
  // icon tile
  rect(x + 18, y + 18, 52, 52, 14, accent);
  centered(x + 44, y + 18 + 34, monogram, monogram.length > 2 ? 15 : 20, C.white, 'Bold');
  text(x + 86, y + 48, title, 24, dark ? C.white : C.ink, 'Semibold');
  text(x + 86, y + 78, sub, 15, dark ? C.soft : C.muted, 'Regular');
}

function chip(x, y, w, h, label) {
  rect(x, y, w, h, 8, C.chip);
  text(x + 16, y + 23, label, 15, '#e2e8f0', 'Regular');
}

// --- canvas
cmd('file.new', { name: 'Arquitetura Bodas', width: 1600, height: 900, units: 'Pixels', backgroundContents: 'white' });
cmd('layer.new', { name: 'Diagrama' });
rect(0, 0, 1600, 900, 0, C.bg);
pill(1370, 64, 150, 36, '#ecfdf5', 'v1.15.11', '#047857', 15);

text(80, 96, 'Arquitetura do site', 44, C.ink, 'Semibold');
text(80, 136, 'Bodas de Esmeralda · M & L — HTML/CSS/JS · PocketBase · Umami · Gotify', 20, C.muted);
line('M 80,164 L 1520,164', '#e2e8f0', 2);

// --- layer labels
text(80, 292, 'CLIENTE', 13, C.line, 'Semibold', 'left', 2);
text(430, 272, 'BORDA', 13, C.line, 'Semibold', 'left', 2);
text(810, 242, 'APLICAÇÃO', 13, C.line, 'Semibold', 'left', 2);
text(1240, 152, 'DADOS & SERVIÇOS', 13, C.line, 'Semibold', 'left', 2);

// --- cards
card(80, 360, 280, 140, C.blue, 'C', 'Convidado', 'navegador / celular');
card(430, 340, 320, 180, C.emerald, 'N', 'nginx', 'estático · CSP · rate-limit');
text(516, 450, 'proxy /api/pb', 15, C.muted);

card(810, 280, 360, 300, C.gold, 'S', 'Site', 'HTML + CSS + JS vanilla', true);
chip(850, 395, 280, 34, 'index.html');
chip(850, 437, 280, 34, 'galeria.html');
chip(850, 479, 280, 34, 'mural.html');
chip(850, 521, 280, 34, 'pix / QR');

card(1240, 200, 300, 110, C.orange, 'PB', 'PocketBase', 'rsvp · messages');
card(1240, 335, 300, 110, C.violet, 'UM', 'Umami', 'eventos e funil');
card(1240, 465, 300, 110, C.sky, 'CDN', 'CDNs', 'fontes · ícones · mapas');
card(1240, 595, 300, 110, C.rose, 'GT', 'Gotify', 'push a cada RSVP');

// --- connections
line('M 360,430 L 430,430');
arrowHead(430, 430, 'right');
pill(362, 386, 66, 26, C.card, 'HTTP', C.muted, 12);

line('M 750,430 L 810,430');
arrowHead(810, 430, 'right');

line('M 1170,380 L 1205,380 L 1205,255 L 1240,255');
arrowHead(1240, 255, 'right');

line('M 1170,430 L 1215,430 L 1215,390 L 1240,390');
arrowHead(1240, 390, 'right');

line('M 1240,520 L 1205,520 L 1205,500 L 1170,500');
arrowHead(1170, 500, 'left');
text(1176, 548, 'assets', 12, C.muted);

line('M 1540,255 L 1565,255 L 1565,650 L 1540,650');
arrowHead(1540, 650, 'left');
text(1436, 728, 'hook → Gotify', 13, C.muted);

// --- footer
text(80, 860, '3 páginas estáticas · RSVP e mural via /api/pb · análise via /a/t', 14, '#94a3b8');

import { writeFileSync } from 'node:fs';

const payload = out.map((o) => JSON.stringify(o)).join('\n') + '\n';
const target = process.argv[2];
if (target) writeFileSync(target, payload, 'utf8');
else process.stdout.write(payload);
