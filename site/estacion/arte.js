/* =====================================================================
   Curionaut · avatar por piezas, marcos y fondos de la Estación
   Todo está dibujado aquí, con código (SVG y CSS): no hay imágenes de
   fuera ni personajes de nadie. Cada pieza tiene un precio (o es de serie).
     precio: {e: n} en ⚡ Energía, {c: n} en 💎 Cristales; sin precio = de serie
   ===================================================================== */
(function (root) {
'use strict';
const T2 = (es, fr) => ({ es, fr });
let SEQ = 0;

/* ---------------- catálogo ---------------- */
const PIEZAS = {
  piel: [{ id: 'p1', c: '#f6d7c3' }, { id: 'p2', c: '#eec1a2' }, { id: 'p3', c: '#d9a37a' }, { id: 'p4', c: '#b97f57' }, { id: 'p5', c: '#8e5a3b' }, { id: 'p6', c: '#5f3b28' }],
  pelo: [
    { id: 'corto', n: T2('Corto', 'Court') }, { id: 'flequillo', n: T2('Flequillo', 'Frange') }, { id: 'rizado', n: T2('Rizado', 'Bouclé') }, { id: 'largo', n: T2('Largo', 'Long') },
    { id: 'coleta', n: T2('Coleta', 'Queue-de-cheval') }, { id: 'rapado', n: T2('Rapado', 'Rasé') },
    { id: 'punta', n: T2('De punta', 'En pics'), p: { e: 60 } }, { id: 'mono', n: T2('Moño', 'Chignon'), p: { e: 60 } }, { id: 'cresta', n: T2('Cresta', 'Crête'), p: { e: 90 } }
  ],
  tinte: [
    { id: 'negro', c: '#22242e' }, { id: 'castano', c: '#5b3a24' }, { id: 'rubio', c: '#d9a94a' }, { id: 'pelirrojo', c: '#b4532a' },
    { id: 'azul', c: '#3f8fe0', p: { e: 80 } }, { id: 'violeta', c: '#9a6bff', p: { e: 80 } }, { id: 'verde', c: '#3fbf7f', p: { e: 80 } }, { id: 'plata', c: '#cfd6e6', p: { c: 1 } }
  ],
  ojos: [{ id: 'normal', n: T2('Atentos', 'Attentifs') }, { id: 'alegres', n: T2('Alegres', 'Joyeux') }, { id: 'guino', n: T2('Guiño', 'Clin d’œil') }, { id: 'decididos', n: T2('Decididos', 'Décidés') }],
  boca: [{ id: 'sonrisa', n: T2('Sonrisa', 'Sourire') }, { id: 'seria', n: T2('Tranquila', 'Tranquille') }, { id: 'risa', n: T2('Risa', 'Rire') }, { id: 'sorpresa', n: T2('Sorpresa', 'Surprise') }],
  traje: [
    { id: 'cobre', c: '#f2a65a', n: T2('Cobre', 'Cuivre') }, { id: 'cian', c: '#5ee0ff', n: T2('Cian', 'Cyan') }, { id: 'verde', c: '#4fd18b', n: T2('Verde', 'Vert'), p: { e: 50 } },
    { id: 'violeta', c: '#b9a7ff', n: T2('Violeta', 'Violet'), p: { e: 50 } }, { id: 'rojo', c: '#ff6b5f', n: T2('Rojo', 'Rouge'), p: { e: 50 } }, { id: 'oro', c: '#ffd27a', n: T2('Dorado', 'Doré'), p: { c: 2 } }
  ],
  casco: [
    { id: 'no', n: T2('Nada', 'Rien') }, { id: 'gorra', n: T2('Gorra', 'Casquette'), p: { e: 40 } }, { id: 'cascos', n: T2('Auriculares', 'Casque audio'), p: { e: 60 } },
    { id: 'antenas', n: T2('Antenas', 'Antennes'), p: { e: 60 } }, { id: 'visor', n: T2('Visor', 'Visière'), p: { e: 90 } }, { id: 'burbuja', n: T2('Casco espacial', 'Casque spatial'), p: { e: 140 } },
    { id: 'laurel', n: T2('Laurel dorado', 'Laurier doré'), p: { c: 3 } }
  ],
  extra: [
    { id: 'no', n: T2('Nada', 'Rien') }, { id: 'gafas', n: T2('Gafas', 'Lunettes'), p: { e: 40 } }, { id: 'sol', n: T2('Gafas de sol', 'Lunettes de soleil'), p: { e: 60 } },
    { id: 'estrella', n: T2('Insignia estrella', 'Insigne étoile'), p: { e: 30 } }, { id: 'bufanda', n: T2('Bufanda', 'Écharpe'), p: { e: 50 } }, { id: 'rayo', n: T2('Insignia rayo', 'Insigne éclair'), p: { c: 1 } }
  ],
  marco: [
    { id: 'cobre', n: T2('Cobre', 'Cuivre'), g: ['#ffbf7a', '#b8733d'] }, { id: 'cian', n: T2('Cian', 'Cyan'), g: ['#9aecff', '#2f9fc4'] },
    { id: 'bosque', n: T2('Bosque', 'Forêt'), g: ['#8ff0b8', '#2a8f5c'], p: { e: 120 } }, { id: 'aurora', n: T2('Aurora', 'Aurore'), g: ['#5ee0ff', '#b9a7ff', '#4fd18b'], p: { c: 2 } },
    { id: 'oro', n: T2('Oro', 'Or'), g: ['#fff0b8', '#d9a02a'], p: { c: 3 } }, { id: 'cristal', n: T2('Cristal', 'Cristal'), g: ['#ffffff', '#7ec8ff', '#b9a7ff'], p: { c: 4 } }
  ]
};
const FONDOS = [
  { id: 'orbita', n: T2('Órbita', 'Orbite') }, { id: 'nebulosa', n: T2('Nebulosa', 'Nébuleuse') },
  { id: 'aurora', n: T2('Aurora', 'Aurore'), p: { e: 150 } }, { id: 'oceano', n: T2('Océano', 'Océan'), p: { e: 150 } }, { id: 'bosque', n: T2('Bosque', 'Forêt'), p: { e: 150 } },
  { id: 'lluvia', n: T2('Lluvia', 'Pluie'), p: { e: 200 } }, { id: 'nieve', n: T2('Nieve', 'Neige'), p: { e: 200 } }, { id: 'amanecer', n: T2('Amanecer', 'Aube'), p: { e: 250 } },
  { id: 'volcan', n: T2('Volcán', 'Volcan'), p: { c: 3 } }, { id: 'circuito', n: T2('Circuito', 'Circuit'), p: { c: 4 } }
];
const GRUPOS = [
  { id: 'piel', n: T2('Piel', 'Peau') }, { id: 'pelo', n: T2('Peinado', 'Coiffure') }, { id: 'tinte', n: T2('Color del pelo', 'Couleur des cheveux') }, { id: 'ojos', n: T2('Ojos', 'Yeux') },
  { id: 'boca', n: T2('Boca', 'Bouche') }, { id: 'traje', n: T2('Traje', 'Combinaison') }, { id: 'casco', n: T2('En la cabeza', 'Sur la tête') }, { id: 'extra', n: T2('Accesorio', 'Accessoire') }, { id: 'marco', n: T2('Marco', 'Cadre') }
];
const DEF = { piel: 'p2', pelo: 'corto', tinte: 'castano', ojos: 'normal', boca: 'sonrisa', traje: 'cobre', casco: 'no', extra: 'no', marco: 'cobre' };
const pieza = (slot, id) => (PIEZAS[slot] || []).find(x => x.id === id) || (PIEZAS[slot] || [])[0];
/* deja la configuración siempre válida (una pieza que no existe vuelve a la de serie) */
function limpia(cfg) { const o = {}; Object.keys(DEF).forEach(s => { const v = cfg && cfg[s]; o[s] = (PIEZAS[s] || []).some(x => x.id === v) ? v : DEF[s]; }); return o; }

/* ---------------- dibujo del avatar ---------------- */
const INK = '#1b2238';
function pelo(id, c, capa) {
  const cap = `<path d="M36 53C33 27 87 27 84 53C80 43 72 39 60 39C48 39 40 43 36 53Z" fill="${c}"/>`;
  if (capa === 'atras') {
    if (id === 'largo') return `<path d="M33 52C30 22 90 22 87 52L90 84C84 89 78 88 75 84L75 52L45 52L45 84C42 88 36 89 30 84Z" fill="${c}"/>`;
    if (id === 'coleta') return `<path d="M82 40C96 40 100 54 96 68C94 74 90 76 88 72C92 62 90 52 80 48Z" fill="${c}"/>`;
    if (id === 'mono') return `<circle cx="60" cy="24" r="10" fill="${c}"/>`;
    return '';
  }
  if (id === 'flequillo') return `<path d="M35 55C31 25 89 25 85 55C83 47 79 43 75 42C66 50 50 49 41 43C37 46 36 51 35 55Z" fill="${c}"/>`;
  if (id === 'rizado') return [[41, 39, 9], [50, 32, 10], [62, 30, 10], [73, 34, 9], [81, 43, 7], [37, 47, 7]].map(p => `<circle cx="${p[0]}" cy="${p[1]}" r="${p[2]}" fill="${c}"/>`).join('');
  if (id === 'punta') return `<path d="M36 52L38 35L46 41L48 26L57 37L62 22L67 37L76 27L76 41L84 36L84 52C76 43 44 43 36 52Z" fill="${c}"/>`;
  if (id === 'cresta') return `<path d="M52 44L50 24L57 30L60 16L63 30L70 24L68 44Z" fill="${c}"/><path d="M38 50C38 40 46 36 52 36L68 36C74 36 82 40 82 50C76 44 44 44 38 50Z" fill="${c}" opacity=".45"/>`;
  if (id === 'rapado') return `<path d="M37 51C36 30 84 30 83 51C78 44 71 41 60 41C49 41 42 44 37 51Z" fill="${c}" opacity=".55"/>`;
  if (id === 'largo') return `<path d="M35 56C31 25 89 25 85 56C82 46 76 41 60 41C44 41 38 46 35 56Z" fill="${c}"/>`;
  return cap;
}
function ojos(id) {
  const o = x => `<ellipse cx="${x}" cy="57" rx="4.6" ry="4.9" fill="#fff"/><circle cx="${x}" cy="57.4" r="3" fill="${INK}"/><circle cx="${x + 1}" cy="56.2" r="1" fill="#fff"/>`;
  const arco = x => `<path d="M${x - 4} 58Q${x} 53 ${x + 4} 58" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (id === 'alegres') return arco(51) + arco(69);
  if (id === 'guino') return o(51) + arco(69);
  if (id === 'decididos') return o(51) + o(69) + `<path d="M46 50L55 52M74 50L65 52" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
  return o(51) + o(69);
}
function boca(id) {
  if (id === 'seria') return `<path d="M54 69L66 69" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
  if (id === 'risa') return `<path d="M53 66Q60 77 67 66Z" fill="${INK}"/><path d="M56 70Q60 73 64 70" fill="none" stroke="#ff8f8f" stroke-width="2" stroke-linecap="round"/>`;
  if (id === 'sorpresa') return `<ellipse cx="60" cy="69" rx="3.2" ry="4" fill="${INK}"/>`;
  return `<path d="M53 66Q60 73 67 66" fill="none" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/>`;
}
function casco(id, traje) {
  if (id === 'gorra') return `<path d="M35 47C35 25 85 25 85 47Z" fill="${traje}"/><path d="M60 43L97 46C98 51 92 53 84 51L60 49Z" fill="${traje}"/><path d="M35 47L85 47" stroke="${INK}" stroke-width="2" opacity=".35"/>`;
  if (id === 'cascos') return `<path d="M33 56C30 20 90 20 87 56" fill="none" stroke="#dfe6f5" stroke-width="5" stroke-linecap="round"/><rect x="27" y="47" width="10" height="20" rx="5" fill="${traje}"/><rect x="83" y="47" width="10" height="20" rx="5" fill="${traje}"/>`;
  if (id === 'antenas') return `<path d="M49 31L43 15M71 31L77 15" stroke="#dfe6f5" stroke-width="2.5" stroke-linecap="round"/><circle cx="43" cy="14" r="4" fill="${traje}"/><circle cx="77" cy="14" r="4" fill="${traje}"/>`;
  if (id === 'visor') return `<rect x="35" y="48" width="50" height="16" rx="8" fill="#5ee0ff" opacity=".5"/><rect x="35" y="48" width="50" height="16" rx="8" fill="none" stroke="#dff8ff" stroke-width="2"/><path d="M41 52L52 52" stroke="#fff" stroke-width="2" stroke-linecap="round" opacity=".8"/>`;
  if (id === 'burbuja') return `<circle cx="60" cy="54" r="37" fill="#5ee0ff" opacity=".12"/><circle cx="60" cy="54" r="37" fill="none" stroke="#e8f6ff" stroke-width="3"/><path d="M34 38C40 26 52 21 62 21" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".7"/><ellipse cx="60" cy="90" rx="27" ry="7" fill="${traje}"/><ellipse cx="60" cy="89" rx="27" ry="6" fill="none" stroke="${INK}" stroke-width="1.5" opacity=".3"/>`;
  if (id === 'laurel') { let s = ''; for (let i = 0; i < 6; i++) { const a = (200 + i * 22) * Math.PI / 180, b = (340 - i * 22) * Math.PI / 180; [a, b].forEach((r, j) => { const x = 60 + Math.cos(r) * 30, y = 52 + Math.sin(r) * 30; s += `<ellipse cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" rx="6" ry="2.8" fill="#ffd27a" stroke="#b8862a" stroke-width=".8" transform="rotate(${((j ? b : a) * 180 / Math.PI + 60 * (j ? -1 : 1)).toFixed(0)} ${x.toFixed(1)} ${y.toFixed(1)})"/>`; }); } return s; }
  return '';
}
function extra(id, traje) {
  if (id === 'gafas') return `<circle cx="51" cy="57" r="8" fill="#fff" opacity=".12"/><circle cx="69" cy="57" r="8" fill="#fff" opacity=".12"/><circle cx="51" cy="57" r="8" fill="none" stroke="${INK}" stroke-width="2.4"/><circle cx="69" cy="57" r="8" fill="none" stroke="${INK}" stroke-width="2.4"/><path d="M59 57L61 57" stroke="${INK}" stroke-width="2.4"/>`;
  if (id === 'sol') return `<rect x="42" y="51" width="16" height="11" rx="5" fill="${INK}"/><rect x="62" y="51" width="16" height="11" rx="5" fill="${INK}"/><path d="M58 55L62 55M42 55L36 53M78 55L84 53" stroke="${INK}" stroke-width="2.4" stroke-linecap="round"/><path d="M45 54L50 54" stroke="#fff" stroke-width="1.5" stroke-linecap="round" opacity=".6"/>`;
  if (id === 'estrella') return `<path d="M42 96l2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z" fill="#ffd27a" stroke="#b8862a" stroke-width=".8"/>`;
  if (id === 'rayo') return `<circle cx="42" cy="103" r="8" fill="${INK}"/><path d="M44 96l-7 8h5l-2 7 7-9h-5z" fill="#5ee0ff"/>`;
  if (id === 'bufanda') return `<path d="M40 84C50 92 70 92 80 84L82 92C70 100 50 100 38 92Z" fill="#ff6b5f"/><path d="M70 94L76 112L66 112Z" fill="#ff6b5f"/><path d="M44 89C52 94 68 94 76 89" fill="none" stroke="#fff" stroke-width="1.5" opacity=".4"/>`;
  return '';
}
/* avatar(cfg) → SVG. alt: texto alternativo (si no se pasa, es decorativo). */
function avatar(cfg, alt) {
  const c = limpia(cfg), id = 'av' + (++SEQ);
  const piel = pieza('piel', c.piel).c, tin = pieza('tinte', c.tinte).c, tr = pieza('traje', c.traje).c, mk = pieza('marco', c.marco).g;
  const stops = mk.map((x, i) => `<stop offset="${(i / (mk.length - 1)).toFixed(2)}" stop-color="${x}"/>`).join('');
  return `<svg class="avatar" viewBox="0 0 120 120" ${alt ? `role="img" aria-label="${alt}"` : 'aria-hidden="true"'}>
<defs><linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="1">${stops}</linearGradient><radialGradient id="${id}b" cx=".5" cy=".35" r=".8"><stop offset="0" stop-color="#26335c"/><stop offset="1" stop-color="#0f1629"/></radialGradient><clipPath id="${id}c"><circle cx="60" cy="60" r="55"/></clipPath></defs>
<circle cx="60" cy="60" r="55" fill="url(#${id}b)"/>
<g clip-path="url(#${id}c)">
${pelo(c.pelo, tin, 'atras')}
<path d="M18 122C20 100 34 90 48 88L72 88C86 90 100 100 102 122Z" fill="${tr}"/>
<path d="M48 88C52 96 68 96 72 88" fill="none" stroke="${INK}" stroke-width="2" opacity=".35"/>
<path d="M60 96L60 122" stroke="${INK}" stroke-width="2" opacity=".25"/>
<rect x="52" y="74" width="16" height="16" rx="5" fill="${piel}"/><rect x="52" y="78" width="16" height="6" fill="${INK}" opacity=".12"/>
<circle cx="36" cy="57" r="5" fill="${piel}"/><circle cx="84" cy="57" r="5" fill="${piel}"/>
<ellipse cx="60" cy="55" rx="24" ry="26" fill="${piel}"/>
<circle cx="45" cy="65" r="4" fill="#ff8f8f" opacity=".28"/><circle cx="75" cy="65" r="4" fill="#ff8f8f" opacity=".28"/>
${ojos(c.ojos)}${boca(c.boca)}
${pelo(c.pelo, tin, 'delante')}
${extra(c.extra, tr)}${casco(c.casco, tr)}
</g>
<circle cx="60" cy="60" r="56" fill="none" stroke="url(#${id}m)" stroke-width="5"/>
</svg>`;
}
/* muestra de una sola pieza (para el editor): el avatar actual con esa pieza puesta */
const muestra = (cfg, slot, id) => avatar(Object.assign({}, limpia(cfg), { [slot]: id }));
const claveCompra = (slot, id) => `buy:${slot}:${id}`;

const API = { PIEZAS, FONDOS, GRUPOS, DEF, pieza, limpia, avatar, muestra, claveCompra };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
root.CURIO_ARTE = API;
})(typeof window !== 'undefined' ? window : globalThis);
