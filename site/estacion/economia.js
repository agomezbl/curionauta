/* =====================================================================
   Curionaut · la economía de la Estación
   Aquí se decide cuánto vale cada logro. Los juegos no saben nada de puntos:
   la Estación lee su partida y apunta cada logro UNA sola vez en el libro
   de puntos (cada apunte tiene una clave única, así que repetir no da nada
   y dos aparatos nunca pagan dos veces lo mismo).
     ⚡ Energía   · abundante, para el día a día
     💎 Cristales · escasos, solo por hitos grandes
   Este archivo no toca la pantalla: solo datos y cuentas (se prueba con
   node tools/test-economia.js).
   ===================================================================== */
(function (root) {
'use strict';
const T2 = (es, fr) => ({ es, fr });

/* ---------------- valores (el padre los escala de ×0,5 a ×2) ---------------- */
const V = {
  mision: 20, mision3: 10,                 // Chrono-Ohm: misión superada y extra por las tres estrellas
  medalla: [0, 15, 40, 0], medallaC: [0, 0, 0, 1],   // medallas de Chrono-Ohm por nivel (la de nivel 3 da 1 💎)
  camara: 30, camara3: 15, reliquia: 15,   // Pitágoras
  llave: 40, llave3: 10,                   // PhiloQuest
  reto: 40,                                // El Refugio
  mazmorra: 30,                            // UMBRAL
  dia: 10, oferta: 20,                     // práctica del día y oferta del día
  reflMaxDia: 3                            // reflexiones que puntúan cada día
};
const CAP_OHM = { c1: 2, c2: 2, c3: 2, c4: 2, c5: 3, c6: 3, c7: 3, c8: 3, c9: 5 };       // 💎 por capítulo terminado
const MEDALLAS_OHM = { lab1: 1, burn: 1, short: 1, stars1: 2, notes10: 1, colors: 2, q50: 1, labs10: 2, sand: 1, days3: 1, shop1: 1, gen3: 2, gen6: 3, tycoon: 3, pz1: 1, pz3s: 2, pzall: 3, anom5: 2, safe: 2, blackout: 3, auto: 2, master: 3 };
const PIT_IDS = ['c1', 'c2', 'c3', 'c7', 'c4', 'c8', 'c9', 'c10', 'c5', 'c6'];
const PIT_C = { c5: 2, c6: 5 };            // 💎: la Cámara Sellada y el Guardián (fin del juego)
const REF_IDS = ['r1', 'r2', 'r3'];
const JUEGOS = {
  'chrono-ohm': T2('Chrono-Ohm', 'Chrono-Ohm'), pitagoras: T2('La Expedición Pitágoras', 'L’Expédition Pythagore'),
  philoquest: T2('PhiloQuest', 'PhiloQuest'), umbral: T2('UMBRAL', 'UMBRAL'), refugio: T2('El Refugio', 'Le Refuge'), cuaderno: T2('Cuaderno de vuelo', 'Carnet de bord')
};
const NOM_OHM = { c1: T2('París 1820', 'Paris 1820'), c2: T2('Colonia 1827', 'Cologne 1827'), c3: T2('Mánchester 1843', 'Manchester 1843'), c4: T2('Nueva York 1884', 'New York 1884'), c5: T2('El Vórtice', 'Le Vortex'), c6: T2('Königsberg 1845', 'Königsberg 1845'), c7: T2('Londres 1843', 'Londres 1843'), c8: T2('Múnich 1882', 'Munich 1882'), c9: T2('Niágara 1896', 'Niagara 1896') };
const NOM_PIT = { c1: T2('La Cámara de los Cuadrados', 'La Salle des Carrés'), c2: T2('Los Puentes de Cuerda', 'Les Ponts de Corde'), c3: T2('El Pozo del Cateto', 'Le Puits des Échelles'), c7: T2('La Fuente de las Raíces', 'La Fontaine des Racines'), c4: T2('Los Pergaminos del Escriba', 'Les Parchemins du Scribe'), c8: T2('El Tribunal de los Triángulos', 'Le Tribunal des Triangles'), c9: T2('El Observatorio del Coseno', 'L’Observatoire du Cosinus'), c10: T2('La Cripta de las Distancias', 'La Crypte des Distances'), c5: T2('La Cámara Sellada', 'La Salle scellée'), c6: T2('El Guardián del Teorema', 'Le Gardien du Théorème') };
const NOM_PHI = { tales: T2('Tales de Mileto', 'Thalès de Milet'), socrates: T2('Sócrates', 'Socrate'), platon: T2('Platón', 'Platon'), aristoteles: T2('Aristóteles', 'Aristote'), diogenes: T2('Diógenes', 'Diogène'), confucio: T2('Confucio', 'Confucius'), epicteto: T2('Epicteto', 'Épictète'), hipatia: T2('Hipatia', 'Hypatie'), descartes: T2('Descartes', 'Descartes'), kant: T2('Kant', 'Kant') };
const NOM_REF = { r1: T2('Luz de emergencia', 'Éclairage de secours'), r2: T2('¿Aguanta la noche?', 'Ça tient toute la nuit ?'), r3: T2('El cable cortado', 'Le câble coupé') };

/* ---------------- lo que hay hecho en cada juego (se lee del aparato) ---------------- */
function hechos(read) {
  const obj = x => (x && typeof x === 'object' ? x : {});
  const F = { ohm: null, pit: null, phi: null, ref: null, um: null };
  const o = read('chrono-ohm-v1');
  if (o && typeof o === 'object') {
    F.ohm = { ch: {}, ach: Object.keys(obj(o.ach)) };
    Object.keys(obj(o.ch)).forEach(c => { const x = obj(o.ch[c]); F.ohm.ch[c] = { stars: obj(x.stars), complete: !!x.complete }; });
  }
  const p = read('expedicion-pitagoras-v1');
  if (p && typeof p === 'object') F.pit = { stars: obj(p.stars), relics: Object.keys(obj(p.relics)) };
  const q = read('philoquest.v3.store');
  if (q && typeof q === 'object' && q.slots) {       // varias partidas: cuenta lo mejor de cada capítulo
    F.phi = {};
    Object.values(obj(q.slots)).forEach(sl => Object.keys(obj(sl && sl.done)).forEach(id => { F.phi[id] = Math.max(F.phi[id] || 0, Number(obj(sl.done[id]).stars) || 1); }));
  }
  const r = read('curionauta-refugio-0.1');
  if (r && typeof r === 'object') F.ref = obj(r.done);
  const u = read('umbral.save.v3');
  if (u && typeof u === 'object' && typeof u.chIdx === 'number' && u.chIdx < 1000) F.um = { hechos: Math.max(0, Math.min(3, u.chIdx)) };
  return F;
}

/* ---------------- los logros que esos hechos merecen ---------------- */
/* Devuelve apuntes {k, e, c, g, l}: clave única, ⚡, 💎, juego y texto en los dos idiomas. */
function logros(F) {
  const out = []; const add = (k, e, c, g, l) => out.push({ k, e: e || 0, c: c || 0, g, l });
  if (F.ohm) {
    Object.keys(F.ohm.ch).forEach(c => {
      if (!/^c\d+$/.test(c)) return; const ch = F.ohm.ch[c]; const n = NOM_OHM[c] || T2(c, c);
      Object.keys(ch.stars).forEach(m => {
        const s = Number(ch.stars[m]) || 0; if (s < 1) return;
        add(`ohm:m:${c}:${m}`, V.mision, 0, 'chrono-ohm', T2(`Misión superada · ${n.es}`, `Mission réussie · ${n.fr}`));
        if (s >= 3) add(`ohm:s3:${c}:${m}`, V.mision3, 0, 'chrono-ohm', T2(`Tres estrellas · ${n.es}`, `Trois étoiles · ${n.fr}`));
      });
      if (ch.complete) add(`ohm:cap:${c}`, 0, CAP_OHM[c] || 2, 'chrono-ohm', T2(`Capítulo terminado · ${n.es}`, `Chapitre terminé · ${n.fr}`));
    });
    F.ohm.ach.forEach(a => {
      if (/^c\d+$/.test(a)) return;                                    // ya cuenta como capítulo terminado
      const t = MEDALLAS_OHM[a] || 1; add(`ohm:med:${a}`, V.medalla[t], V.medallaC[t], 'chrono-ohm', T2('Medalla de Chrono-Ohm', 'Médaille de Chrono-Ohm'));
    });
  }
  if (F.pit) {
    PIT_IDS.forEach(c => {
      const s = Number(F.pit.stars[c]) || 0; if (s < 1) return; const n = NOM_PIT[c];
      add(`pit:cam:${c}`, V.camara, PIT_C[c] || 0, 'pitagoras', T2(`Cámara superada · ${n.es}`, `Salle réussie · ${n.fr}`));
      if (s >= 3) add(`pit:s3:${c}`, V.camara3, 0, 'pitagoras', T2(`Tres estrellas · ${n.es}`, `Trois étoiles · ${n.fr}`));
    });
    F.pit.relics.forEach(r => { if (/^[a-z0-9_]{1,24}$/.test(r)) add(`pit:rel:${r}`, V.reliquia, 0, 'pitagoras', T2('Reliquia del Templo', 'Relique du Temple')); });
  }
  if (F.phi) Object.keys(F.phi).forEach(id => {
    if (!/^[a-z0-9_]{1,24}$/.test(id)) return; const n = NOM_PHI[id] || T2(id, id);
    add(`phi:cap:${id}`, V.llave, 1, 'philoquest', T2(`Llave conseguida · ${n.es}`, `Clé obtenue · ${n.fr}`));
    if (F.phi[id] >= 3) add(`phi:s3:${id}`, V.llave3, 0, 'philoquest', T2(`Tres estrellas · ${n.es}`, `Trois étoiles · ${n.fr}`));
  });
  if (F.ref) {
    REF_IDS.forEach(r => { if (F.ref[r]) add(`ref:${r}`, V.reto, 0, 'refugio', T2(`Reto resuelto · ${NOM_REF[r].es}`, `Défi réussi · ${NOM_REF[r].fr}`)); });
    if (REF_IDS.every(r => F.ref[r])) add('ref:todo', 0, 2, 'refugio', T2('Los tres retos del Refugio', 'Les trois défis du Refuge'));
  }
  if (F.um) {
    for (let i = 0; i < F.um.hechos; i++) add(`um:cap:${i + 1}`, V.mazmorra, i === 1 ? 1 : 0, 'umbral', T2(`Mazmorra superada · capítulo ${i + 1}`, `Donjon réussi · chapitre ${i + 1}`));
  }
  return out;
}
/* las reflexiones validadas por el padre: 10, 25 o 50 ⚡ (la de 50 trae además 1 💎); tres al día como mucho */
function logrosReflexion(refl, ymd) {
  const out = [], porDia = {};
  (refl || []).filter(r => r && r.estado === 'validada' && r.id).sort((a, b) => (a.created || 0) - (b.created || 0)).forEach(r => {
    const d = ymd(new Date(r.created || 0)); porDia[d] = (porDia[d] || 0) + 1; if (porDia[d] > V.reflMaxDia) return;
    const p = [10, 25, 50].includes(r.puntos) ? r.puntos : 10;
    out.push({ k: 'refl:' + r.id, e: p, c: p >= 50 ? 1 : 0, g: 'cuaderno', l: T2(p >= 50 ? 'Reflexión brillante' : 'Reflexión validada', p >= 50 ? 'Réflexion brillante' : 'Réflexion validée'), t: 'reflexion' });
  });
  return out;
}

/* ---------------- libro de puntos ---------------- */
const saldo = led => (led || []).reduce((a, x) => ({ e: a.e + (x.e || 0), c: a.c + (x.c || 0) }), { e: 0, c: 0 });
const escala = (e, mult) => (e > 0 ? Math.max(1, Math.round(e * (mult || 1))) : e);

/* ---------------- mercado: ⚡ ↔ 💎 ---------------- */
const hash = s => { let h = 0; s = String(s || ''); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); };
const precio = dia => 90 + (hash('mercado|' + dia) % 21);            // entre 90 y 110 ⚡ por cristal, cambia cada día
const venta = dia => Math.floor(precio(dia) * 0.8);                  // vender un cristal devuelve el 80 %

/* ---------------- hucha: bloquear ⚡ unos días a cambio de interés ---------------- */
const PLAZOS = [{ d: 3, pct: 5 }, { d: 7, pct: 12 }, { d: 14, pct: 30 }];
const HUCHA = { min: 20, max: 500, abiertas: 3, ventana: 14 };
/* La hucha crece con lo que juegas: lo guardado a la vez no puede pasar de lo ganado jugando en los últimos
   14 días (ni de 500). Sin esto, guardar daba más que jugar: al máximo, unos 11.700 ⚡ al año sin tocar un
   juego, cuando terminarlos todos da unos 3.700. Ahora el premio de la hucha es, como mucho, un 30 % extra
   sobre lo que has jugado. */
const NO_JUGADO = /^(hucha|cambio|buy):/;
function cupoHucha(led, ahora) {
  const desde = ahora - HUCHA.ventana * 864e5;
  const ganado = (led || []).filter(x => x && x.e > 0 && (x.at || 0) >= desde && !NO_JUGADO.test(x.k || '')).reduce((a, x) => a + x.e, 0);
  const guardado = depositos(led, ahora).filter(d => !d.cerrada).reduce((a, d) => a + d.e, 0);
  return { ganado, guardado, libre: Math.max(0, Math.min(HUCHA.max, ganado) - guardado) };
}
const interes = (e, d) => { const p = PLAZOS.find(x => x.d === d); return p ? Math.round(e * p.pct / 100) : 0; };
/* depósitos abiertos y cerrados a partir del libro: «hucha:<id>:in» abre y «hucha:<id>:out» cierra */
function depositos(led, ahora) {
  const ins = {}, outs = {};
  (led || []).forEach(x => { const m = /^hucha:([^:]+):(in|out)$/.exec(x.k || ''); if (!m) return; (m[2] === 'in' ? ins : outs)[m[1]] = x; });
  return Object.keys(ins).map(id => {
    const a = ins[id], d = (a.x && a.x.d) || 3, e = -a.e, fin = (a.at || 0) + d * 864e5;
    return { id, e, d, pct: (PLAZOS.find(p => p.d === d) || { pct: 0 }).pct, at: a.at || 0, fin, lista: ahora >= fin, cerrada: !!outs[id], premio: interes(e, d), out: outs[id] || null };
  }).sort((a, b) => a.fin - b.fin);
}

/* ---------------- títulos: se ganan, no se compran ---------------- */
/* n: texto único si vale para todos, o [masculino, femenino, neutro] */
const TITULOS = [
  { id: 'ohm-chispa', g: 'chrono-ohm', n: T2('Chispa de Ampère', 'Étincelle d’Ampère'), como: T2('Termina París 1820 en Chrono-Ohm', 'Termine Paris 1820 dans Chrono-Ohm'), ok: h => h.has('ohm:cap:c1') },
  { id: 'ohm-ley', g: 'chrono-ohm', n: T2('Aprendiz de Ohm', ['Apprenti d’Ohm', 'Apprentie d’Ohm', 'Disciple d’Ohm']), como: T2('Termina Colonia 1827 en Chrono-Ohm', 'Termine Cologne 1827 dans Chrono-Ohm'), ok: h => h.has('ohm:cap:c2') },
  { id: 'ohm-leyenda', g: 'chrono-ohm', n: T2('Leyenda del Ohm', 'Légende de l’Ohm'), como: T2('Vence al Barón en El Vórtice (capítulo 5)', 'Bats le Baron dans Le Vortex (chapitre 5)'), ok: h => h.has('ohm:cap:c5') },
  { id: 'ohm-red', g: 'chrono-ohm', n: T2(['Guardián de la Red', 'Guardiana de la Red', 'Custodia de la Red'], ['Gardien du Réseau', 'Gardienne du Réseau', 'Sentinelle du Réseau']), como: T2('Termina Niágara 1896 (capítulo 9)', 'Termine Niagara 1896 (chapitre 9)'), ok: h => h.has('ohm:cap:c9') },
  { id: 'ohm-kw', g: 'chrono-ohm', n: T2(['Rey del Kilovatio', 'Reina del Kilovatio', 'As del Kilovatio'], ['Roi du Kilowatt', 'Reine du Kilowatt', 'As du Kilowatt']), como: T2('Haz crecer tu compañía eléctrica', 'Fais grandir ta compagnie d’électricité'), ok: h => h.has('ohm:med:tycoon') },
  { id: 'pit-antorcha', g: 'pitagoras', n: T2(['Portador de Antorcha', 'Portadora de Antorcha', 'Antorcha del Templo'], ['Porteur de torche', 'Porteuse de torche', 'Torche du Temple']), como: T2('Supera tres cámaras del Templo', 'Réussis trois salles du Temple'), ok: h => h.n('pit:cam:') >= 3 },
  { id: 'pit-genio', g: 'pitagoras', n: T2('Genio de Pitágoras', 'Génie de Pythagore'), como: T2('Vence al Guardián del Teorema', 'Bats le Gardien du Théorème'), ok: h => h.has('pit:cam:c6') },
  { id: 'pit-leyenda', g: 'pitagoras', n: T2('Leyenda del Templo', 'Légende du Temple'), como: T2('Vence al Guardián en dificultad Leyenda', 'Bats le Gardien en difficulté Légende'), ok: h => h.has('pit:rel:leyenda') },
  { id: 'phi-curiosa', g: 'philoquest', n: T2('Mente Curiosa', 'Esprit Curieux'), como: T2('Consigue tu primera llave en PhiloQuest', 'Obtiens ta première clé dans PhiloQuest'), ok: h => h.n('phi:cap:') >= 1 },
  { id: 'phi-amigo', g: 'philoquest', n: T2(['Amigo de la Sabiduría', 'Amiga de la Sabiduría', 'Amante de la Sabiduría'], ['Ami de la Sagesse', 'Amie de la Sagesse', 'Esprit de Sagesse']), como: T2('Consigue tres llaves en PhiloQuest', 'Obtiens trois clés dans PhiloQuest'), ok: h => h.n('phi:cap:') >= 3 },
  { id: 'phi-agora', g: 'philoquest', n: T2(['Filósofo del Ágora', 'Filósofa del Ágora', 'Voz del Ágora'], 'Philosophe de l’Agora'), como: T2('Consigue seis llaves en PhiloQuest', 'Obtiens six clés dans PhiloQuest'), ok: h => h.n('phi:cap:') >= 6 },
  { id: 'ref-ingenio', g: 'refugio', n: T2(['Ingeniero del Refugio', 'Ingeniera del Refugio', 'Ingenio del Refugio'], ['Ingénieur du Refuge', 'Ingénieure du Refuge', 'Génie du Refuge']), como: T2('Resuelve los tres retos de El Refugio', 'Réussis les trois défis du Refuge'), ok: h => h.has('ref:todo') },
  { id: 'um-explora', g: 'umbral', n: T2(['Explorador de Mazmorras', 'Exploradora de Mazmorras', 'Sombra de las Mazmorras'], ['Explorateur de Donjons', 'Exploratrice de Donjons', 'Ombre des Donjons']), como: T2('Supera la primera mazmorra de UMBRAL', 'Réussis le premier donjon d’UMBRAL'), ok: h => h.has('um:cap:1') },
  { id: 'cua-pluma', g: 'cuaderno', n: T2(['Pensador de Bitácora', 'Pensadora de Bitácora', 'Pluma de Bitácora'], ['Penseur du Carnet', 'Penseuse du Carnet', 'Plume du Carnet']), como: T2('Cinco reflexiones validadas en tu cuaderno', 'Cinq réflexions validées dans ton carnet'), ok: h => h.n('refl:') >= 5 },
  { id: 'cua-idea', g: 'cuaderno', n: T2('Idea Brillante', 'Idée Brillante'), como: T2('Una reflexión de 50 puntos', 'Une réflexion à 50 points'), ok: h => h.led.some(x => /^refl:/.test(x.k) && x.c > 0) },
  { id: 'hucha-oro', g: '', n: T2('Paciencia de Oro', 'Patience d’Or'), como: T2('Espera hasta el final una hucha de 14 días', 'Attends jusqu’au bout une tirelire de 14 jours'), ok: h => h.led.some(x => /^hucha:.*:out$/.test(x.k) && x.x && x.x.d === 14 && x.x.premio > 0) },
  { id: 'mercado', g: '', n: T2('Comerciante Estelar', ['Commerçant stellaire', 'Commerçante stellaire', 'As du Marché']), como: T2('Haz cinco cambios en el mercado', 'Fais cinq échanges au marché'), ok: h => h.n('cambio:') >= 5 },
  { id: 'tres-mundos', g: '', n: T2('Curionauta de Tres Mundos', 'Curionaute des Trois Mondes'), como: T2('Consigue logros en tres juegos distintos', 'Obtiens des succès dans trois jeux différents'), ok: h => ['ohm:', 'pit:', 'phi:', 'ref:', 'um:'].filter(p => h.n(p) > 0).length >= 3 }
];
const GEN = { m: 0, f: 1, n: 2 };
function nombreTitulo(t, lang, gen) { const x = t.n[lang] || t.n.es; return Array.isArray(x) ? x[GEN[gen] === undefined ? 2 : GEN[gen]] : x; }
function indice(led) { const set = new Set((led || []).map(x => x.k)); return { led: led || [], has: k => set.has(k), n: p => (led || []).filter(x => (x.k || '').startsWith(p)).length }; }
const titulosGanados = led => { const h = indice(led); return TITULOS.filter(t => { try { return t.ok(h); } catch (e) { return false; } }).map(t => t.id); };

/* ---------------- Pasaporte de saberes ---------------- */
/* Cada saber se demuestra con un logro del libro (k). fr/es: equivalencia orientativa en el currículo. */
const AREAS = [
  { id: 'elec', n: T2('Electricidad', 'Électricité'), c: '#f2a65a' }, { id: 'mat', n: T2('Matemáticas', 'Mathématiques'), c: '#ffd27a' },
  { id: 'taller', n: T2('Taller', 'Atelier'), c: '#6fd99a' }, { id: 'pensar', n: T2('Pensar', 'Penser'), c: '#7ec8ff' }
];
const C4PC = 'Cycle 4 · Physique-chimie', LYC = 'Lycée · Physique-chimie', C4M = 'Cycle 4 · Mathématiques (4e)', EMC = 'Cycle 3-4 · Enseignement moral et civique', VCE = 'Valores cívicos y éticos · Primaria y ESO';
const SABERES = [
  { a: 'elec', k: 'ohm:cap:c1', g: 'chrono-ohm', d: NOM_OHM.c1, s: T2('Sé qué es la corriente eléctrica y cómo se mide su intensidad en amperios.', 'Je sais ce qu’est le courant électrique et comment mesurer son intensité en ampères.'), fr: C4PC + ' (5e-4e)', es: 'Física y Química · 2.º ESO' },
  { a: 'elec', k: 'ohm:cap:c2', g: 'chrono-ohm', d: NOM_OHM.c2, s: T2('Sé calcular la tensión, la intensidad o la resistencia con la ley de Ohm (U = R × I).', 'Je sais calculer la tension, l’intensité ou la résistance avec la loi d’Ohm (U = R × I).'), fr: C4PC + ' (4e-3e)', es: 'Física y Química · 2.º-3.º ESO' },
  { a: 'elec', k: 'ohm:cap:c3', g: 'chrono-ohm', d: NOM_OHM.c3, s: T2('Sé calcular la potencia de un aparato y la energía que gasta (P = U × I, E = P × t).', 'Je sais calculer la puissance d’un appareil et l’énergie qu’il consomme (P = U × I, E = P × t).'), fr: C4PC + ' (3e)', es: 'Física y Química · 3.º ESO' },
  { a: 'elec', k: 'ohm:cap:c4', g: 'chrono-ohm', d: NOM_OHM.c4, s: T2('Sé por qué salta un fusible y cómo evitar un cortocircuito o una sobrecarga.', 'Je sais pourquoi un fusible saute et comment éviter un court-circuit ou une surcharge.'), fr: C4PC + ' et Technologie', es: 'Tecnología y Digitalización · 2.º-3.º ESO' },
  { a: 'elec', k: 'ohm:cap:c5', g: 'chrono-ohm', d: NOM_OHM.c5, s: T2('Sé cómo un relé manda un circuito y cómo funciona un marcha-paro.', 'Je sais comment un relais commande un circuit et comment fonctionne un marche-arrêt.'), fr: 'Cycle 4 · Technologie', es: 'Tecnología y Digitalización · 3.º ESO' },
  { a: 'elec', k: 'ohm:cap:c6', g: 'chrono-ohm', d: NOM_OHM.c6, s: T2('Sé calcular resistencias equivalentes y aplicar las leyes de los nudos y de las mallas.', 'Je sais calculer des résistances équivalentes et appliquer la loi des nœuds et la loi des mailles.'), fr: LYC + ' (2de)', es: '4.º ESO y Bachillerato' },
  { a: 'elec', k: 'ohm:cap:c7', g: 'chrono-ohm', d: NOM_OHM.c7, s: T2('Sé usar un divisor de tensión y entiendo cómo mide un puente de Wheatstone.', 'Je sais utiliser un diviseur de tension et je comprends comment mesure un pont de Wheatstone.'), fr: LYC + ' / Sciences de l’ingénieur', es: 'Bachillerato · Tecnología e Ingeniería' },
  { a: 'elec', k: 'ohm:cap:c8', g: 'chrono-ohm', d: NOM_OHM.c8, s: T2('Sé por qué la electricidad viaja a alta tensión y cuánto se pierde en los cables.', 'Je sais pourquoi l’électricité voyage en haute tension et ce qui se perd dans les câbles.'), fr: 'Lycée · Enseignement scientifique', es: '4.º ESO y Bachillerato' },
  { a: 'elec', k: 'ohm:cap:c9', g: 'chrono-ohm', d: NOM_OHM.c9, s: T2('Sé distinguir la corriente continua de la alterna y para qué sirve cada una.', 'Je sais distinguer le courant continu du courant alternatif et à quoi sert chacun.'), fr: 'Cycle 4 et Lycée · Physique-chimie', es: 'Física y Química · 3.º-4.º ESO' },
  { a: 'mat', k: 'pit:cam:c1', g: 'pitagoras', d: NOM_PIT.c1, s: T2('Sé enunciar el teorema de Pitágoras y reconocer la hipotenusa y los catetos.', 'Je sais énoncer le théorème de Pythagore et repérer l’hypoténuse et les côtés de l’angle droit.'), fr: C4M, es: 'Matemáticas · 2.º ESO' },
  { a: 'mat', k: 'pit:cam:c2', g: 'pitagoras', d: NOM_PIT.c2, s: T2('Sé calcular la hipotenusa de un triángulo rectángulo.', 'Je sais calculer l’hypoténuse d’un triangle rectangle.'), fr: C4M, es: 'Matemáticas · 2.º ESO' },
  { a: 'mat', k: 'pit:cam:c3', g: 'pitagoras', d: NOM_PIT.c3, s: T2('Sé calcular un cateto cuando conozco la hipotenusa y el otro cateto.', 'Je sais calculer un côté de l’angle droit quand je connais l’hypoténuse et l’autre côté.'), fr: C4M, es: 'Matemáticas · 2.º ESO' },
  { a: 'mat', k: 'pit:cam:c7', g: 'pitagoras', d: NOM_PIT.c7, s: T2('Sé calcular y aproximar raíces cuadradas.', 'Je sais calculer et encadrer des racines carrées.'), fr: C4M, es: 'Matemáticas · 2.º ESO' },
  { a: 'mat', k: 'pit:cam:c4', g: 'pitagoras', d: NOM_PIT.c4, s: T2('Sé leer un problema con atención y separar los datos que sirven de los que despistan.', 'Je sais lire un problème avec attention et trier les données utiles de celles qui piègent.'), fr: 'Cycle 4 · Mathématiques (résolution de problèmes)', es: 'Matemáticas · 2.º-3.º ESO' },
  { a: 'mat', k: 'pit:cam:c8', g: 'pitagoras', d: NOM_PIT.c8, s: T2('Sé comprobar si un triángulo es rectángulo con el recíproco de Pitágoras.', 'Je sais vérifier si un triangle est rectangle avec la réciproque de Pythagore.'), fr: C4M, es: 'Matemáticas · 2.º-3.º ESO' },
  { a: 'mat', k: 'pit:cam:c9', g: 'pitagoras', d: NOM_PIT.c9, s: T2('Sé usar el coseno para hallar un lado o un ángulo de un triángulo rectángulo.', 'Je sais utiliser le cosinus pour trouver un côté ou un angle d’un triangle rectangle.'), fr: C4M, es: 'Matemáticas · 3.º-4.º ESO' },
  { a: 'mat', k: 'pit:cam:c10', g: 'pitagoras', d: NOM_PIT.c10, s: T2('Sé calcular distancias en unos ejes y la diagonal de un ortoedro.', 'Je sais calculer des distances dans un repère et la diagonale d’un pavé droit.'), fr: 'Cycle 4 · Mathématiques (4e-3e)', es: 'Matemáticas · 3.º ESO' },
  { a: 'mat', k: 'pit:cam:c6', g: 'pitagoras', d: NOM_PIT.c6, s: T2('Sé resolver problemas de varios pasos con el teorema de Pitágoras.', 'Je sais résoudre des problèmes à plusieurs étapes avec le théorème de Pythagore.'), fr: 'Cycle 4 · Mathématiques (4e-3e)', es: 'Matemáticas · 2.º-3.º ESO' },
  { a: 'taller', k: 'ref:r1', g: 'refugio', d: NOM_REF.r1, s: T2('Sé calcular la resistencia que protege un LED y elegir la comercial adecuada.', 'Je sais calculer la résistance qui protège une LED et choisir la valeur du commerce qui convient.'), fr: C4PC + ' et Technologie', es: 'Tecnología y Digitalización · 3.º ESO' },
  { a: 'taller', k: 'ref:r2', g: 'refugio', d: NOM_REF.r2, s: T2('Sé calcular si una batería aguanta toda la noche (energía en vatios hora).', 'Je sais calculer si une batterie tient toute la nuit (énergie en wattheures).'), fr: C4PC + ' (3e)', es: 'Física y Química · 3.º ESO' },
  { a: 'taller', k: 'ref:r3', g: 'refugio', d: NOM_REF.r3, s: T2('Sé encontrar con un multímetro dónde se ha cortado un circuito.', 'Je sais trouver avec un multimètre où un circuit est coupé.'), fr: C4PC + ' et Technologie', es: 'Tecnología y Digitalización · 2.º-3.º ESO' },
  { a: 'pensar', k: 'phi:cap:tales', g: 'philoquest', d: NOM_PHI.tales, s: T2('Sé mirar lo de siempre con asombro y preguntar por qué, sin conformarme con un «porque sí».', 'Je sais regarder l’ordinaire avec étonnement et demander pourquoi, sans me contenter d’un « parce que ».'), fr: EMC, es: VCE },
  { a: 'pensar', k: 'phi:cap:socrates', g: 'philoquest', d: NOM_PHI.socrates, s: T2('Sé hacer preguntas para pensar mejor con los demás, no para ganar.', 'Je sais poser des questions pour mieux penser avec les autres, pas pour gagner.'), fr: EMC, es: VCE },
  { a: 'pensar', k: 'phi:cap:platon', g: 'philoquest', d: NOM_PHI.platon, s: T2('Sé desconfiar de las apariencias y buscar de dónde viene lo que veo.', 'Je sais me méfier des apparences et chercher d’où vient ce que je vois.'), fr: EMC, es: VCE },
  { a: 'pensar', k: 'phi:cap:aristoteles', g: 'philoquest', d: NOM_PHI.aristoteles, s: T2('Sé buscar el punto justo entre quedarme corto y pasarme.', 'Je sais chercher le juste milieu entre trop peu et trop.'), fr: EMC, es: VCE },
  { a: 'pensar', k: 'phi:cap:diogenes', g: 'philoquest', d: NOM_PHI.diogenes, s: T2('Sé preguntarme qué necesito de verdad para estar bien.', 'Je sais me demander de quoi j’ai vraiment besoin pour être bien.'), fr: EMC, es: VCE },
  { a: 'pensar', k: 'phi:cap:confucio', g: 'philoquest', d: NOM_PHI.confucio, s: T2('Sé ponerme en el lugar del otro antes de actuar.', 'Je sais me mettre à la place de l’autre avant d’agir.'), fr: EMC, es: VCE }
];

/* ---------------- oferta del día: el juego al que lleva más tiempo sin jugar ---------------- */
/* ultima: {juego: 'aaaa-mm-dd' del último avance}; orden: lista de juegos. Devuelve el id del juego. */
function ofertaDelDia(ultima, orden, dia) {
  const cand = orden.slice().sort((a, b) => ((ultima[a] || '') < (ultima[b] || '') ? -1 : (ultima[a] || '') > (ultima[b] || '') ? 1 : 0));
  const viejo = ultima[cand[0]] || ''; const empate = cand.filter(g => (ultima[g] || '') === viejo);
  return empate[hash('oferta|' + dia) % empate.length];
}

const API = { V, JUEGOS, hechos, logros, logrosReflexion, saldo, escala, precio, venta, PLAZOS, HUCHA, interes, depositos, cupoHucha, TITULOS, nombreTitulo, titulosGanados, indice, AREAS, SABERES, ofertaDelDia, hash, PIT_IDS, REF_IDS };
if (typeof module !== 'undefined' && module.exports) module.exports = API;
root.CURIO_ECO = API;
})(typeof window !== 'undefined' ? window : globalThis);
