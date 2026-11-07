// Graba con ElevenLabs las voces de los mentores (solo lo que falte) y actualiza audio/manifest.json.
//   ELEVENLABS_API_KEY=... node tools/voces-grabar.js [es|fr] [mentor]
// Las voces elegidas para cada mentor e idioma van en voces/voces.json:
//   { "es": { "bitacora": "<voice_id>", ... }, "fr": { ... }, "modelo": "eleven_multilingual_v2" }
// La clave nunca se guarda en el repositorio: se pasa solo al ejecutar.
const fs = require('fs'), path = require('path');
const KEY = process.env.ELEVENLABS_API_KEY; if (!KEY) { console.error('Falta ELEVENLABS_API_KEY'); process.exit(1); }
const VOCES = JSON.parse(fs.readFileSync(path.join(__dirname, '../voces/voces.json'), 'utf8'));
const AUD = path.join(__dirname, '../site/estacion/audio'); const MAN = path.join(AUD, 'manifest.json');
const [soloLang, soloMentor] = process.argv.slice(2);
const filas = l => fs.readFileSync(path.join(__dirname, `../voces/inventario-${l}.csv`), 'utf8').replace(/^﻿/, '').split('\r\n').slice(1)
  .map(x => x.split(';').map(c => c.replace(/^"|"$/g, '').replace(/""/g, '"')));
(async () => {
  const man = JSON.parse(fs.existsSync(MAN) ? fs.readFileSync(MAN, 'utf8') : '{"files":[]}'); const hechos = new Set(man.files);
  let n = 0, chars = 0;
  for (const lang of ['es', 'fr']) {
    if (soloLang && soloLang !== lang) continue;
    for (const [archivo, mentor, , , texto] of filas(lang)) {
      if (soloMentor && soloMentor !== mentor) continue;
      const id = archivo.replace(/^audio\//, '').replace(/\.mp3$/, ''); if (hechos.has(id)) continue;
      const voice = (VOCES[lang] || {})[mentor]; if (!voice) { console.warn('sin voz para', lang, mentor); continue; }
      const r = await fetch(`https://api.elevenlabs.io/v1/text-to-speech/${voice}?output_format=mp3_44100_64`, {
        method: 'POST', headers: { 'xi-api-key': KEY, 'Content-Type': 'application/json', Accept: 'audio/mpeg' },
        body: JSON.stringify({ text: texto, model_id: VOCES.modelo || 'eleven_multilingual_v2', language_code: lang, voice_settings: { stability: 0.55, similarity_boost: 0.8, style: 0.15 } }) });
      if (!r.ok) { console.error('error', r.status, await r.text()); process.exit(1); }
      const dest = path.join(AUD, id + '.mp3'); fs.mkdirSync(path.dirname(dest), { recursive: true });
      fs.writeFileSync(dest, Buffer.from(await r.arrayBuffer())); hechos.add(id); n++; chars += texto.length;
      man.files = [...hechos].sort(); fs.writeFileSync(MAN, JSON.stringify(man));
      process.stdout.write(`\r${n} audios · ${chars} caracteres`);
    }
  }
  console.log(`\nListo: ${n} audios nuevos, ${chars} caracteres.`);
})();
