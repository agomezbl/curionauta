// Lista todo lo que dicen los mentores con voz grabada, por idioma y mentor, con su identificador
// (el nombre del mp3) y el recuento de caracteres para calcular el plan de ElevenLabs.
//   node tools/voces-inventario.js   → voces/inventario-es.csv, voces/inventario-fr.csv y el resumen
const fs = require('fs'), path = require('path');
globalThis.window = {}; eval(fs.readFileSync(path.join(__dirname, '../site/estacion/mentores.js'), 'utf8'));
const { M, T, TOPICS, ORDEN } = window.CURIO_MENTORES;
const OUT = path.join(__dirname, '../voces'); fs.mkdirSync(OUT, { recursive: true });
let total = 0; const resumen = [];
for (const lang of ['es', 'fr']) {
  const filas = [['archivo', 'mentor', 'id', 'caracteres', 'texto']]; let n = 0, c = 0;
  for (const m of ORDEN) {
    const lineas = [['m.presenta', M[m].presenta[lang]], ['m.pregunta', T[m].pregunta[0][lang]]];
    for (const k of Object.keys(TOPICS)) {
      lineas.push(['d:' + k, TOPICS[k].dato[lang]]);
      TOPICS[k].preguntas.forEach((q, i) => lineas.push(['q:' + k + ':' + i, q[lang]]));
    }
    for (const [id, txt] of lineas) { filas.push([`audio/${lang}/${m}/${id.replace(/:/g, '_')}.mp3`, m, id, txt.length, txt]); n++; c += txt.length; }
  }
  fs.writeFileSync(path.join(OUT, `inventario-${lang}.csv`), '﻿' + filas.map(f => f.map(x => `"${String(x).replace(/"/g, '""')}"`).join(';')).join('\r\n'));
  resumen.push(`${lang}: ${n} audios, ${c.toLocaleString('es-ES')} caracteres`); total += c;
}
console.log(resumen.join('\n') + `\nTOTAL: ${total.toLocaleString('es-ES')} caracteres (4 mentores × 2 idiomas)`);
