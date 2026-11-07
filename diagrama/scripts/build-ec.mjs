// Gera o JSONL de comandos do EffectCraft: composição 1600x900, 15 fps, 4 s.
// Base estática importada de bbg-static.png + dots e highlights animados.
// Camadas são referenciadas por nome (layer: "nome"), não por id.
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const PNG = fileURLToPath(new URL('../out/bbg-static.png', import.meta.url));
const steps = [];
const add = (command, params) => { steps.push({ command, params }); };

add('comp.new', {
  name: 'Main',
  width: 1600,
  height: 900,
  frameRate: 15,
  duration: 4,
  background: [248, 250, 252],
  open: true
});

add('file.import', { paths: [PNG] });
add('layer.addItem', { item: 2, position: [800, 450] });

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

const C = {
  blue: '#2563eb',
  emerald: '#10b981',
  gold: '#f59e0b',
  orange: '#f97316',
  violet: '#8b5cf6',
  sky: '#0ea5e9',
  rose: '#f43f5e'
};

// fluxo principal
dot('dot-conv-a', C.blue, [
  { t: 0.30, x: 360, y: 430 },
  { t: 1.00, x: 430, y: 430 }
]);
dot('dot-nginx-a', C.emerald, [
  { t: 0.90, x: 750, y: 430 },
  { t: 1.60, x: 810, y: 430 }
]);
dot('dot-conv-b', C.blue, [
  { t: 1.90, x: 360, y: 430 },
  { t: 2.60, x: 430, y: 430 }
]);
dot('dot-nginx-b', C.emerald, [
  { t: 2.50, x: 750, y: 430 },
  { t: 3.20, x: 810, y: 430 }
]);

// Site -> serviÃ§os
dot('dot-pb', C.gold, [
  { t: 1.40, x: 1170, y: 380 },
  { t: 1.65, x: 1205, y: 380 },
  { t: 2.00, x: 1205, y: 255 },
  { t: 2.20, x: 1240, y: 255 }
]);
dot('dot-umami', C.violet, [
  { t: 1.50, x: 1170, y: 430 },
  { t: 1.75, x: 1215, y: 430 },
  { t: 2.10, x: 1215, y: 390 },
  { t: 2.30, x: 1240, y: 390 }
]);
dot('dot-cdn', C.sky, [
  { t: 1.80, x: 1240, y: 520 },
  { t: 2.00, x: 1205, y: 520 },
  { t: 2.30, x: 1205, y: 500 },
  { t: 2.50, x: 1170, y: 500 }
]);
dot('dot-gotify', C.rose, [
  { t: 2.40, x: 1540, y: 255 },
  { t: 2.55, x: 1565, y: 255 },
  { t: 3.10, x: 1565, y: 650 },
  { t: 3.30, x: 1540, y: 650 }
]);

// destaques dos nÃ³s
highlight('hl-conv', 74, 354, 292, 152, C.blue, 0.15, 0.85);
highlight('hl-nginx', 424, 334, 332, 192, C.emerald, 0.80, 1.55);
highlight('hl-site', 804, 274, 372, 312, C.gold, 1.35, 2.20);
highlight('hl-pb', 1234, 194, 312, 122, C.orange, 2.00, 2.70);
highlight('hl-umami', 1234, 329, 312, 122, C.violet, 2.10, 2.80);
highlight('hl-cdn', 1234, 459, 312, 122, C.sky, 2.20, 2.90);
highlight('hl-gotify', 1234, 589, 312, 122, C.rose, 2.90, 3.55);

const payload = steps.map((s) => JSON.stringify(s)).join('\n') + '\n';
const target = process.argv[2];
if (target) writeFileSync(target, payload, 'utf8');
else process.stdout.write(payload);

