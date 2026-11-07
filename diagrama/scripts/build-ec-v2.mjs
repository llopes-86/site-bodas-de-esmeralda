// v2: composição 1600x900, 15 fps, 5 s.
// Fundo estático sem ícones + ícones reais (Simple Icons / Bootstrap bell) animados
// com pop-in, anéis de pulso, destaques e duas ondas de dots.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';

const BASE = fileURLToPath(new URL('..', import.meta.url));
const BG = join(BASE, 'out', 'bbg-v2-static.png');
const ICONS = join(BASE, 'assets', 'icons', 'png');

const steps = [];
const add = (command, params) => { steps.push({ command, params }); };

add('comp.new', {
  name: 'Main',
  width: 1600,
  height: 900,
  frameRate: 15,
  duration: 5,
  background: [248, 250, 252],
  open: true
});

add('file.import', {
  paths: [
    BG,
    `${ICONS}\\googlechrome.png`,
    `${ICONS}\\nginx.png`,
    `${ICONS}\\html5.png`,
    `${ICONS}\\css.png`,
    `${ICONS}\\javascript-dark.png`,
    `${ICONS}\\pocketbase.png`,
    `${ICONS}\\umami.png`,
    `${ICONS}\\googlefonts.png`,
    `${ICONS}\\fontawesome.png`,
    `${ICONS}\\jsdelivr.png`,
    `${ICONS}\\googlemaps.png`,
    `${ICONS}\\bell.png`
  ]
});

add('layer.addItem', { item: 'bbg-v2-static.png', position: [800, 450] });

// --- anéis de pulso (criados antes dos ícones, ficam atrás deles)
function ring(name, cx, cy, w, h, color, t0) {
  add('layer.newShape', {
    kind: 'ellipse', name, size: [w, h], fill: color, fillOpacity: 0,
    stroke: color, strokeWidth: 3, position: [cx, cy]
  });
  add('prop.addKey', { layer: name, path: 'transform/opacity', time: t0, value: 0 });
  add('prop.addKey', { layer: name, path: 'transform/opacity', time: t0 + 0.10, value: 70 });
  add('prop.addKey', { layer: name, path: 'transform/opacity', time: t0 + 0.55, value: 0 });
  add('prop.addKey', { layer: name, path: 'transform/scale', time: t0, value: [80, 80, 100] });
  add('prop.addKey', { layer: name, path: 'transform/scale', time: t0 + 0.55, value: [140, 140, 100] });
}

const C = {
  blue: '#2563eb',
  emerald: '#10b981',
  html5: '#e34f26',
  css: '#1572b6',
  js: '#f7df1e',
  orange: '#f97316',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
  rose: '#f43f5e',
  gold: '#f59e0b'
};

// pop-in rings
ring('ring-conv', 124, 404, 60, 60, C.blue, 0.12);
ring('ring-nginx', 474, 384, 60, 60, C.emerald, 0.42);
ring('ring-html5', 848, 320, 48, 48, C.html5, 0.72);
ring('ring-css', 896, 320, 48, 48, C.css, 0.82);
ring('ring-js', 944, 320, 48, 48, C.js, 0.92);
ring('ring-pb', 1284, 244, 60, 60, C.orange, 1.22);
ring('ring-umami', 1284, 379, 60, 60, C.violet, 1.37);
ring('ring-cdn', 1284, 509, 60, 60, C.sky, 1.52);
ring('ring-gotify', 1284, 639, 60, 60, C.rose, 1.87);

// flow rings
ring('ring-flow-conv', 124, 404, 68, 68, C.blue, 0.85);
ring('ring-flow-nginx', 474, 384, 68, 68, C.emerald, 1.05);
ring('ring-flow-site', 884, 320, 150, 62, C.gold, 1.55);
ring('ring-flow-pb', 1284, 244, 68, 68, C.orange, 2.10);
ring('ring-flow-umami', 1284, 379, 68, 68, C.violet, 2.20);
ring('ring-flow-cdn', 1284, 509, 68, 68, C.sky, 2.35);
ring('ring-flow-gotify', 1284, 639, 68, 68, C.rose, 3.20);

// --- ícones (footage importado; o nome da camada é o nome do arquivo)
function icon(file, x, y, sizePx, t0) {
  add('layer.addItem', { item: file, position: [x, y] });
  const target = (sizePx / 192) * 100;
  add('prop.addKey', { layer: file, path: 'transform/scale', time: 0, value: [target, target, 100] });
  add('prop.addKey', { layer: file, path: 'transform/scale', time: t0 - 0.01, value: [target, target, 100] });
  add('prop.addKey', { layer: file, path: 'transform/scale', time: t0 + 0.10, value: [target * 1.18, target * 1.18, 100] });
  add('prop.addKey', { layer: file, path: 'transform/scale', time: t0 + 0.22, value: [target, target, 100] });
}

icon('googlechrome.png', 124, 404, 36, 0.12);
icon('nginx.png', 474, 384, 36, 0.42);
icon('html5.png', 848, 320, 26, 0.72);
icon('css.png', 896, 320, 26, 0.82);
icon('javascript-dark.png', 944, 320, 26, 0.92);
icon('pocketbase.png', 1284, 244, 36, 1.22);
icon('umami.png', 1284, 379, 36, 1.37);
icon('googlefonts.png', 1272, 499, 20, 1.52);
icon('fontawesome.png', 1298, 499, 20, 1.57);
icon('jsdelivr.png', 1272, 523, 20, 1.62);
icon('googlemaps.png', 1298, 523, 20, 1.67);
icon('bell.png', 1284, 639, 36, 1.87);

// --- dots (duas ondas por conexão)
function dot(name, color, keys, maxOpacity = 100) {
  add('layer.newShape', {
    kind: 'ellipse', name: `${name}-halo`, size: [34, 34], fill: color, fillOpacity: 22,
    position: [keys[0].x, keys[0].y]
  });
  add('layer.newShape', {
    kind: 'ellipse', name, size: [16, 16], fill: color, position: [keys[0].x, keys[0].y]
  });
  for (const k of keys) {
    add('prop.addKey', { layer: name, path: 'transform/position', time: k.t, value: [k.x, k.y, 0] });
    add('prop.addKey', { layer: `${name}-halo`, path: 'transform/position', time: k.t, value: [k.x, k.y, 0] });
  }
  const t0 = keys[0].t;
  const t1 = keys[keys.length - 1].t;
  add('prop.addKey', { layer: name, path: 'transform/opacity', time: t0, value: 0 });
  add('prop.addKey', { layer: name, path: 'transform/opacity', time: t0 + 0.12, value: maxOpacity });
  add('prop.addKey', { layer: name, path: 'transform/opacity', time: t1 - 0.12, value: maxOpacity });
  add('prop.addKey', { layer: name, path: 'transform/opacity', time: t1, value: 0 });
  add('prop.addKey', { layer: `${name}-halo`, path: 'transform/opacity', time: t0, value: 0 });
  add('prop.addKey', { layer: `${name}-halo`, path: 'transform/opacity', time: t0 + 0.12, value: 22 });
  add('prop.addKey', { layer: `${name}-halo`, path: 'transform/opacity', time: t1 - 0.12, value: 22 });
  add('prop.addKey', { layer: `${name}-halo`, path: 'transform/opacity', time: t1, value: 0 });
}

dot('dot-conv-a', C.blue, [
  { t: 0.35, x: 360, y: 430 },
  { t: 0.95, x: 430, y: 430 }
]);
dot('dot-conv-b', C.blue, [
  { t: 1.70, x: 360, y: 430 },
  { t: 2.30, x: 430, y: 430 }
]);
dot('dot-nginx-a', C.emerald, [
  { t: 0.75, x: 750, y: 430 },
  { t: 1.35, x: 810, y: 430 }
]);
dot('dot-nginx-b', C.emerald, [
  { t: 2.20, x: 750, y: 430 },
  { t: 2.80, x: 810, y: 430 }
]);
dot('dot-pb-a', C.gold, [
  { t: 1.35, x: 1170, y: 380 },
  { t: 1.60, x: 1205, y: 380 },
  { t: 1.85, x: 1205, y: 255 },
  { t: 2.05, x: 1240, y: 255 }
]);
dot('dot-pb-b', C.gold, [
  { t: 2.60, x: 1170, y: 380 },
  { t: 2.80, x: 1205, y: 380 },
  { t: 3.05, x: 1205, y: 255 },
  { t: 3.25, x: 1240, y: 255 }
]);
dot('dot-umami-a', C.violet, [
  { t: 1.45, x: 1170, y: 430 },
  { t: 1.70, x: 1215, y: 430 },
  { t: 1.95, x: 1215, y: 390 },
  { t: 2.15, x: 1240, y: 390 }
]);
dot('dot-umami-b', C.violet, [
  { t: 2.70, x: 1170, y: 430 },
  { t: 2.90, x: 1215, y: 430 },
  { t: 3.15, x: 1215, y: 390 },
  { t: 3.35, x: 1240, y: 390 }
]);
dot('dot-cdn-a', C.sky, [
  { t: 1.65, x: 1240, y: 520 },
  { t: 1.85, x: 1205, y: 520 },
  { t: 2.10, x: 1205, y: 500 },
  { t: 2.30, x: 1170, y: 500 }
]);
dot('dot-cdn-b', C.sky, [
  { t: 2.90, x: 1240, y: 520 },
  { t: 3.05, x: 1205, y: 520 },
  { t: 3.25, x: 1205, y: 500 },
  { t: 3.45, x: 1170, y: 500 }
]);
dot('dot-gotify-a', C.rose, [
  { t: 2.15, x: 1540, y: 255 },
  { t: 2.30, x: 1565, y: 255 },
  { t: 2.85, x: 1565, y: 650 },
  { t: 3.05, x: 1540, y: 650 }
]);
dot('dot-gotify-b', C.rose, [
  { t: 3.20, x: 1540, y: 255 },
  { t: 3.35, x: 1565, y: 255 },
  { t: 3.90, x: 1565, y: 650 },
  { t: 4.10, x: 1540, y: 650 }
]);

// --- destaques dos cards
function highlight(name, x, y, w, h, color, t0, t1) {
  add('layer.newShape', {
    kind: 'rounded', name, size: [w, h], fill: color, fillOpacity: 0,
    stroke: color, strokeWidth: 4, position: [x + w / 2, y + h / 2]
  });
  add('prop.addKey', { layer: name, path: 'transform/opacity', time: t0, value: 0 });
  add('prop.addKey', { layer: name, path: 'transform/opacity', time: t0 + 0.15, value: 100 });
  add('prop.addKey', { layer: name, path: 'transform/opacity', time: t1 - 0.15, value: 100 });
  add('prop.addKey', { layer: name, path: 'transform/opacity', time: t1, value: 0 });
}

highlight('hl-conv', 74, 354, 292, 152, C.blue, 0.15, 0.75);
highlight('hl-nginx', 424, 334, 332, 192, C.emerald, 0.70, 1.35);
highlight('hl-site', 804, 274, 372, 312, C.gold, 1.25, 2.00);
highlight('hl-pb', 1234, 194, 312, 122, C.orange, 2.00, 2.70);
highlight('hl-umami', 1234, 329, 312, 122, C.violet, 2.05, 2.75);
highlight('hl-cdn', 1234, 459, 312, 122, C.sky, 2.15, 2.85);
highlight('hl-gotify', 1234, 589, 312, 122, C.rose, 2.95, 3.65);

const payload = steps.map((s) => JSON.stringify(s)).join('\n') + '\n';
const target = process.argv[2];
if (target) writeFileSync(target, payload, 'utf8');
else process.stdout.write(payload);
