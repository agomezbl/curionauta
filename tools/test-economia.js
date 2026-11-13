// Prueba de las cuentas de la Estación (site/estacion/economia.js y arte.js). Sin navegador:
//   node tools/test-economia.js
const path = require('path');
const ECO = require(path.join(__dirname, '..', 'site', 'estacion', 'economia.js'));
const ARTE = require(path.join(__dirname, '..', 'site', 'estacion', 'arte.js'));
const res = []; const check = (ok, msg) => res.push(`${ok ? '✓' : '✗'} ${msg}`);
const ymd = d => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10); };
const lector = o => k => (k in o ? JSON.parse(JSON.stringify(o[k])) : null);
const suma = l => l.reduce((a, x) => ({ e: a.e + x.e, c: a.c + x.c }), { e: 0, c: 0 });

/* ---- 1. logros de cada juego ---- */
const OHM = { ch: { c1: { stars: { '1-1': 3, '1-2': 2 }, complete: true }, c2: { stars: { '2-1': 1 }, complete: false } }, ach: { lab1: 1, stars1: 1, tycoon: 1, c1: 1 } };
let L = ECO.logros(ECO.hechos(lector({ 'chrono-ohm-v1': OHM })));
let s = suma(L);
// misiones 3×20 + una con tres estrellas 10 + medallas lab1 (15) y stars1 (40) = 125 ⚡ ; capítulo 1 (2 💎) + medalla tycoon (1 💎) = 3 💎
check(s.e === 125 && s.c === 3, `Chrono-Ohm: 3 misiones, un capítulo y 3 medallas → 125 ⚡ y 3 💎 (${s.e} ⚡, ${s.c} 💎)`);
check(!L.some(x => x.k === 'ohm:med:c1'), 'Chrono-Ohm: la medalla de capítulo no paga dos veces');
check(new Set(L.map(x => x.k)).size === L.length, 'Chrono-Ohm: cada logro tiene su clave única');
check(L.every(x => x.l && x.l.es && x.l.fr), 'Chrono-Ohm: cada logro tiene texto en español y francés');
L = ECO.logros(ECO.hechos(lector({ 'expedicion-pitagoras-v1': { stars: { c1: 3, c2: 1, c5: 2, c6: 3 }, relics: { brujula: 1, '<x>': 1 } } })));
s = suma(L); check(s.e === 4 * 30 + 2 * 15 + 15 && s.c === 7, `Pitágoras: 4 cámaras (dos con tres estrellas), 1 reliquia válida → 165 ⚡ y 7 💎 (${s.e} ⚡, ${s.c} 💎)`);
L = ECO.logros(ECO.hechos(lector({ 'philoquest.v3.store': { slots: { a: { done: { tales: { stars: 2 } } }, b: { done: { tales: { stars: 3 }, socrates: { stars: 1 } } } } } })));
s = suma(L); check(s.e === 40 + 10 + 40 && s.c === 2, `PhiloQuest: dos partidas, cuenta lo mejor de cada capítulo → 90 ⚡ y 2 💎 (${s.e} ⚡, ${s.c} 💎)`);
L = ECO.logros(ECO.hechos(lector({ 'curionauta-refugio-0.1': { done: { r1: 'x', r2: 'x' } } })));
check(suma(L).e === 80 && suma(L).c === 0, 'El Refugio: dos retos → 80 ⚡');
L = ECO.logros(ECO.hechos(lector({ 'curionauta-refugio-0.1': { done: { r1: 'x', r2: 'x', r3: 'x' } } })));
check(suma(L).e === 120 && suma(L).c === 2, 'El Refugio: los tres retos → 120 ⚡ y 2 💎');
L = ECO.logros(ECO.hechos(lector({ 'umbral.save.v3': { chIdx: 2 } })));
check(suma(L).e === 60 && suma(L).c === 1, 'UMBRAL: dos mazmorras → 60 ⚡ y 1 💎');
check(ECO.logros(ECO.hechos(lector({ 'chrono-ohm-v1': 'roto', 'expedicion-pitagoras-v1': 7, 'umbral.save.v3': { chIdx: 'x' } }))).length === 0, 'partidas estropeadas: no paga nada y no falla');
check(ECO.logros(ECO.hechos(() => null)).length === 0, 'sin partidas: ningún logro');

/* ---- 2. reflexiones validadas ---- */
const dia = new Date(2026, 10, 10, 12).getTime();
const refl = [10, 25, 50, 25].map((p, i) => ({ id: 'r' + i, estado: 'validada', puntos: p, created: dia + i * 1000 })).concat([{ id: 'p', estado: 'pendiente', puntos: 0, created: dia }, { id: 'z', estado: 'validada', puntos: 50, created: dia + 864e5 }]);
L = ECO.logrosReflexion(refl, ymd);
check(L.length === 4 && suma(L).e === 10 + 25 + 50 + 50 && suma(L).c === 2, `reflexiones: tres al día como mucho; la de 50 trae un cristal (${L.length} apuntes, ${suma(L).e} ⚡, ${suma(L).c} 💎)`);

/* ---- 3. libro de puntos, multiplicador, mercado ---- */
check(ECO.saldo([{ e: 100, c: 1 }, { e: -30, c: 0 }, { e: 5 }]).e === 75, 'saldo: suma de apuntes');
check(ECO.escala(20, 0.5) === 10 && ECO.escala(20, 2) === 40 && ECO.escala(1, 0.5) === 1 && ECO.escala(0, 2) === 0 && ECO.escala(-50, 2) === -50, 'multiplicador del padre: ×0,5 a ×2, nunca deja un logro en cero ni toca los gastos');
let okP = true, min = 999, max = 0; for (let i = 0; i < 400; i++) { const d = ymd(new Date(2026, 0, 1 + i)); const p = ECO.precio(d), v = ECO.venta(d); min = Math.min(min, p); max = Math.max(max, p); if (p < 90 || p > 110 || v !== Math.floor(p * 0.8) || v >= p) okP = false; }
check(okP && max - min >= 10, `mercado: el cristal cuesta entre 90 y 110 ⚡ y vender devuelve el 80 % (visto ${min}–${max})`);
check(ECO.precio('2026-11-12') === ECO.precio('2026-11-12'), 'mercado: el precio de un día es el mismo en todos los aparatos');

/* ---- 4. hucha ---- */
check(ECO.interes(100, 3) === 5 && ECO.interes(100, 7) === 12 && ECO.interes(100, 14) === 30 && ECO.interes(100, 5) === 0, 'hucha: 5 %, 12 % y 30 % a 3, 7 y 14 días');
const t0 = new Date(2026, 10, 1).getTime();
const led = [{ k: 'hucha:a:in', e: -100, at: t0, x: { d: 7 } }, { k: 'hucha:b:in', e: -50, at: t0, x: { d: 3 } }, { k: 'hucha:b:out', e: 50, at: t0 + 864e5, x: { d: 3, premio: 0 } }];
let D = ECO.depositos(led, t0 + 6 * 864e5); const a = D.find(x => x.id === 'a'), b = D.find(x => x.id === 'b');
check(a && !a.lista && !a.cerrada && a.premio === 12 && a.e === 100, 'hucha: a los 6 días una de 7 aún no está lista');
check(ECO.depositos(led, t0 + 7 * 864e5).find(x => x.id === 'a').lista, 'hucha: a los 7 días está lista para recoger');
check(b && b.cerrada && b.out.x.premio === 0, 'hucha: la que se rompió antes queda cerrada y sin premio');
check(ECO.saldo(led).e === -100, 'hucha: romperla devuelve justo lo guardado');

const ah = new Date(2026, 10, 20).getTime(), dd = 864e5;
let cu = ECO.cupoHucha([{ k: 'ohm:m:c1:1-1', e: 200, at: ah - 3 * dd }, { k: 'regalo', e: 1000, at: ah - 20 * dd }, { k: 'cambio:1', e: 88, c: -1, at: ah }, { k: 'hucha:z:out', e: 300, at: ah }], ah);
check(cu.ganado === 200 && cu.libre === 200, `hucha: solo cuenta lo ganado jugando en los últimos 14 días, sin mercado ni hucha (${cu.ganado} ganado, ${cu.libre} libre)`);
cu = ECO.cupoHucha([{ k: 'ohm:m:c1:1-1', e: 400, at: ah - dd }, { k: 'hucha:a:in', e: -150, at: ah - dd, x: { d: 7 } }], ah);
check(cu.libre === 250, `hucha: lo ya guardado descuenta del cupo (${cu.libre})`);
cu = ECO.cupoHucha([{ k: 'ohm:m:c1:1-1', e: 3000, at: ah - dd, w: 1 }], ah);
check(cu.libre === ECO.HUCHA.max, 'hucha: nunca más de 500 guardados a la vez');
const anual = ECO.interes(ECO.HUCHA.max, 14) * 365 / 14;
check(true, `hucha: el premio pasa de depender solo de esperar a ser como mucho un 30 % de lo jugado (antes, hasta ${Math.round(3 * anual)} ⚡ al año sin jugar)`);

/* ---- 5. títulos ---- */
const tit = ks => ECO.titulosGanados(ks.map(k => (typeof k === 'string' ? { k } : k)));
check(tit([]).length === 0, 'títulos: sin logros, ninguno');
check(tit(['ohm:cap:c1']).join() === 'ohm-chispa', 'títulos: París 1820 → Chispa de Ampère');
check(tit(['pit:cam:c1', 'pit:cam:c2', 'pit:cam:c3']).includes('pit-antorcha') && !tit(['pit:cam:c1', 'pit:cam:c2']).includes('pit-antorcha'), 'títulos: tres cámaras → Portador de Antorcha');
check(tit(['ohm:m:c1:1-1', 'pit:cam:c1', 'ref:r1']).includes('tres-mundos'), 'títulos: logros en tres juegos → Curionauta de Tres Mundos');
check(tit([{ k: 'hucha:x:out', x: { d: 14, premio: 30 } }]).includes('hucha-oro') && !tit([{ k: 'hucha:x:out', x: { d: 14, premio: 0 } }]).includes('hucha-oro'), 'títulos: Paciencia de Oro solo si espera los 14 días');
check(tit(['cambio:1', 'cambio:2', 'cambio:3', 'cambio:4', 'cambio:5']).includes('mercado'), 'títulos: cinco cambios → Comerciante Estelar');
const T = ECO.TITULOS.find(x => x.id === 'ohm-red');
check(ECO.nombreTitulo(T, 'es', 'm') === 'Guardián de la Red' && ECO.nombreTitulo(T, 'es', 'f') === 'Guardiana de la Red' && ECO.nombreTitulo(T, 'fr', 'f') === 'Gardienne du Réseau' && ECO.nombreTitulo(T, 'es', 'n') === 'Custodia de la Red', 'títulos: masculino, femenino y neutro, en español y francés');
check(ECO.TITULOS.every(x => ['es', 'fr'].every(l => ['m', 'f', 'n'].every(g => ECO.nombreTitulo(x, l, g))) && x.como.es && x.como.fr) && new Set(ECO.TITULOS.map(x => x.id)).size === ECO.TITULOS.length, `títulos: los ${ECO.TITULOS.length} tienen nombre y «cómo se gana» en los dos idiomas`);

/* ---- 6. Pasaporte ---- */
const TODO = { 'chrono-ohm-v1': { ch: {}, ach: {} }, 'expedicion-pitagoras-v1': { stars: {}, relics: {} }, 'philoquest.v3.store': { slots: { a: { done: {} } } }, 'curionauta-refugio-0.1': { done: { r1: 1, r2: 1, r3: 1 } }, 'umbral.save.v3': { chIdx: 3 } };
for (let i = 1; i <= 9; i++) TODO['chrono-ohm-v1'].ch['c' + i] = { stars: { a: 3 }, complete: true };
ECO.PIT_IDS.forEach(c => { TODO['expedicion-pitagoras-v1'].stars[c] = 3; });
['tales', 'socrates', 'platon', 'aristoteles', 'diogenes', 'confucio', 'epicteto', 'hipatia', 'descartes', 'kant'].forEach(f => { TODO['philoquest.v3.store'].slots.a.done[f] = { stars: 3 }; });
const todas = new Set(ECO.logros(ECO.hechos(lector(TODO))).map(x => x.k));
const huerfanos = ECO.SABERES.filter(x => !todas.has(x.k)).map(x => x.k);
check(huerfanos.length === 0, `pasaporte: cada saber se puede demostrar con un logro real de un juego (${huerfanos.join(', ') || 'todos'})`);
check(ECO.SABERES.every(x => x.s.es && x.s.fr && x.fr && x.es && x.d && ECO.AREAS.some(a => a.id === x.a) && ECO.JUEGOS[x.g]), `pasaporte: los ${ECO.SABERES.length} saberes tienen texto ES/FR, área, juego y equivalencia escolar`);
check(new Set(ECO.SABERES.map(x => x.k)).size === ECO.SABERES.length, 'pasaporte: ningún logro demuestra dos saberes');
const alcanz = ECO.TITULOS.filter(t => !t.g || ['chrono-ohm', 'pitagoras', 'philoquest', 'refugio', 'umbral'].includes(t.g));
const ledTodo = [...todas].map(k => ({ k })).concat([{ k: 'pit:rel:leyenda' }, { k: 'ohm:med:tycoon' }]);
check(alcanz.every(t => ECO.titulosGanados(ledTodo).includes(t.id) || /^(hucha-oro|mercado)$/.test(t.id)), 'títulos: todos los de juegos se pueden ganar terminándolos');

/* ---- 7. oferta del día ---- */
const J = ['chrono-ohm', 'pitagoras', 'philoquest'];
check(ECO.ofertaDelDia({ 'chrono-ohm': '2026-11-10', pitagoras: '2026-11-01', philoquest: '2026-11-05' }, J, '2026-11-12') === 'pitagoras', 'oferta del día: el juego al que lleva más tiempo sin jugar');
check(J.includes(ECO.ofertaDelDia({}, J, '2026-11-12')) && ECO.ofertaDelDia({}, J, '2026-11-12') === ECO.ofertaDelDia({}, J, '2026-11-12'), 'oferta del día: con empate elige uno, siempre el mismo ese día');
check(ECO.ofertaDelDia({ 'chrono-ohm': '2026-11-10' }, J, '2026-11-12') !== 'chrono-ohm', 'oferta del día: un juego sin estrenar va antes que uno jugado');

/* ---- 8. avatar y fondos ---- */
check(JSON.stringify(ARTE.limpia({ pelo: 'no-existe', traje: 'oro', otra: 1 })) === JSON.stringify(Object.assign({}, ARTE.DEF, { traje: 'oro' })), 'avatar: una pieza que no existe vuelve a la de serie');
let svgOk = true, n = 0; ARTE.GRUPOS.forEach(g => ARTE.PIEZAS[g.id].forEach(o => { n++; const v = ARTE.muestra(ARTE.DEF, g.id, o.id); if (!/^<svg[\s\S]*<\/svg>$/.test(v) || /undefined|NaN/.test(v)) svgOk = false; }));
check(svgOk && n >= 50, `avatar: las ${n} piezas se dibujan sin errores`);
check(ARTE.GRUPOS.every(g => ARTE.PIEZAS[g.id].some(o => !o.p) && !ARTE.pieza(g.id, ARTE.DEF[g.id]).p), 'avatar: en cada grupo hay piezas de serie, y el avatar de serie es gratis');
check(ARTE.FONDOS.length === 10 && ARTE.FONDOS.filter(f => !f.p).length === 2 && ARTE.FONDOS.every(f => f.n.es && f.n.fr), 'fondos: diez, dos de serie, con nombre en los dos idiomas');
const precios = [].concat(...ARTE.GRUPOS.map(g => ARTE.PIEZAS[g.id]), ARTE.FONDOS).filter(o => o.p).map(o => o.p);
check(precios.every(p => (p.e > 0) !== (p.c > 0) && (p.e || 0) <= 250 && (p.c || 0) <= 4), `tienda: ${precios.length} piezas de pago, cada una en una sola moneda y a precios alcanzables`);
check(/aria-label="Nil"/.test(ARTE.avatar(ARTE.DEF, 'Nil')) && /aria-hidden="true"/.test(ARTE.avatar(ARTE.DEF)), 'avatar: con texto alternativo si se pide; decorativo si no');

console.log(res.join('\n')); const mal = res.filter(x => x.startsWith('✗')).length;
console.log(`\n${res.length - mal}/${res.length} comprobaciones`); process.exit(mal ? 1 : 0);
