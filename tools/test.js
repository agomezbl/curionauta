// Prueba de curionaut.org montado en dist/ (bash tools/montar.sh antes).
//   node tools/test.js            → resultados en consola y capturas en shots/
// Recorre: la web pública ES/FR, la Estación sin cuenta (mentor, cuaderno, zona de padres,
// idioma, mudanza) y con una cuenta simulada (Supabase falso con las mismas reglas).
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), http = require('http');
const ROOT = path.join(__dirname, '..', 'dist'); const SH = path.join(__dirname, '..', 'shots'); fs.mkdirSync(SH, { recursive: true });
const TYPES = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.webmanifest': 'application/manifest+json', '.woff2': 'font/woff2', '.json': 'application/json', '.mp3': 'audio/mpeg', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.svg': 'image/svg+xml' };
const srv = http.createServer((q, r) => {
  let f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0].split('#')[0]));
  try { if (fs.statSync(f).isDirectory()) { if (!q.url.split('?')[0].endsWith('/')) { r.writeHead(301, { Location: q.url + '/' }); r.end(); return; } f = path.join(f, 'index.html'); } } catch (e) {}
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end('404'); return; } r.writeHead(200, { 'Content-Type': TYPES[path.extname(f)] || 'text/html; charset=utf-8' }); r.end(d); });
}).listen(8777);
const BASE = 'http://localhost:8777';
const CFG = "window.ESTACION={supabaseUrl:'https://demo.supabase.co',supabaseKey:'k',rutinatorUrl:'https://rutinator.example'};";
/* Supabase falso: lo justo para la Estación, con las reglas del cuaderno (0032) imitadas */
const FAKE = `(function(){const today=new Date();const ymd=d=>{const z=new Date(d.getTime()-d.getTimezoneOffset()*6e4);return z.toISOString().slice(0,10)};const di=(today.getDay()+6)%7;
 const m=today.getHours()*60+today.getMinutes();
 const DB=JSON.parse(localStorage.getItem('fake-db')||'null')||{family_members:[{id:'m1',display_name:'Nil',role:'hijo',auth_user_id:'u1',family_id:'f1'},{id:'m0',display_name:'Papá',role:'padre',auth_user_id:'u0',family_id:'f1'}],
  tasks:[{id:'t1',title:'Hacer la cama',category:'mant',day_of_week:di,active:true,adhoc_date:null},{id:'t2',title:'Deberes',category:'oblig',day_of_week:di,active:true,adhoc_date:null}],
  task_status:[{task_id:'t1',status:'aprobado',date:ymd(today),member_id:'m1'}],
  ledger_entries:[{amount:30,currency:'credito',member_id:'m1'},{amount:4,currency:'estrella',member_id:'m1'}],
  calendar_events:[{id:'e1',date:ymd(today),time:'17:30',type:'cita',title:'Dentista'}],
  schedule_blocks:[{day_of_week:di,start_min:Math.max(0,m-20),end_min:m+35,subject:'Mathématiques',room:'B12',type:'clase',parity:'todas'}],
  settings:[{week_parity:'todas'}],estacion_items:[],estacion_progress:[],estacion_reflexiones:[]};
 const persist=()=>localStorage.setItem('fake-db',JSON.stringify(DB));window.__FAKEDB=DB;
 const who=()=>DB.family_members.find(x=>x.auth_user_id===(localStorage.getItem('fake-sess')||''));
 function Q(t){let rows=(DB[t]||[]).slice(),single=false,op='select',err=null;const q={
  select(){return q},eq(k,v){if(op==='delete'){DB[t]=DB[t].filter(r=>r[k]!==v);persist();return q}rows=rows.filter(r=>r[k]===v);return q},gte(k,v){rows=rows.filter(r=>r[k]>=v);return q},lte(k,v){rows=rows.filter(r=>r[k]<=v);return q},order(){return q},limit(){return q},maybeSingle(){single=true;return q},
  upsert(p){(Array.isArray(p)?p:[p]).forEach(x=>{const r=Object.assign({member_id:who().id,created_at:new Date().toISOString()},x);const i=DB[t].findIndex(y=>y.id&&y.id===r.id||(!y.id&&y.game===r.game&&y.device===r.device));if(i>=0)DB[t][i]=Object.assign(DB[t][i],r);else DB[t].push(r)});persist();op='up';return q},
  insert(p){const me=who();(Array.isArray(p)?p:[p]).forEach(x=>{if(t==='estacion_reflexiones'&&(x.estado&&x.estado!=='pendiente'||x.puntos)){err={message:'new row violates row-level security policy'};return}DB[t].push(Object.assign({member_id:me.id,created_at:new Date().toISOString(),estado:'pendiente',puntos:0,nota:null},x))});persist();op='ins';return q},
  delete(){op='delete';return q},
  then(res){if(t==='estacion_reflexiones'&&op==='select'){const me=who();rows=rows.filter(r=>me.role==='padre'||r.member_id===me.id)}res(err?{data:null,error:err}:op==='select'?{data:single?(rows[0]||null):rows,error:null}:{data:null,error:null})}};return q}
 function rpc(n,a){const me=who();
  if(n==='verify_parent_pin')return Promise.resolve({data:me.role==='padre'||a.p_pin==='1234',error:null});
  if(n==='estacion_revisar'){if(!(me.role==='padre'||a.p_pin==='1234'))return Promise.resolve({data:{ok:false,error:'clave'},error:null});
    const r=DB.estacion_reflexiones.find(x=>x.id===a.p_id);if(!r)return Promise.resolve({data:{ok:false,error:'no existe'},error:null});if(r.estado!=='pendiente')return Promise.resolve({data:{ok:false,error:'ya revisada'},error:null});
    if(a.p_estado==='validada'&&![10,25,50].includes(a.p_puntos))return Promise.resolve({data:{ok:false,error:'puntos'},error:null});
    if(a.p_estado==='devuelta'&&!a.p_nota)return Promise.resolve({data:{ok:false,error:'falta la nota'},error:null});
    Object.assign(r,{estado:a.p_estado,puntos:a.p_estado==='validada'?a.p_puntos:0,nota:a.p_nota,revisada_at:new Date().toISOString()});persist();return Promise.resolve({data:{ok:true},error:null})}
  return Promise.resolve({data:null,error:null})}
 window.supabase={createClient(){return {from:Q,rpc,
  auth:{getSession:async()=>({data:{session:localStorage.getItem('fake-sess')?{user:{id:localStorage.getItem('fake-sess')}}:null}}),getUser:async()=>({data:{user:localStorage.getItem('fake-sess')?{id:localStorage.getItem('fake-sess')}:null}}),
   signInWithPassword:async({email,password})=>{if(password!=='nil12345')return {error:{message:'Invalid login'}};localStorage.setItem('fake-sess',email.startsWith('papa')?'u0':'u1');return {error:null}},
   signOut:async()=>{localStorage.removeItem('fake-sess')}}}}};})();`;
const CHRONO0 = { name: 'Nil', xp: 1250, introSeen: true, ch: { c1: { done: 6, stars: { '1-1': 3, '1-2': 3 }, complete: true }, c2: { done: 2, stars: { '2-1': 3, '2-2': 2 }, complete: false } }, ach: { lab1: 1 }, savedAt: Date.now() - 864e5 };
const CHRONO1 = JSON.parse(JSON.stringify(CHRONO0)); CHRONO1.xp = 1420; CHRONO1.ch.c2 = { done: 4, stars: { '2-1': 3, '2-2': 2, '2-3': 3, '2-4': 3 }, complete: false }; CHRONO1.savedAt = Date.now();
const res = [], errs = []; const check = (ok, msg) => res.push(`${ok ? '✓' : '✗'} ${msg}`);
async function nuevaPagina(b, vp, opts = {}) {
  const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h }, hasTouch: !!vp.t, isMobile: !!vp.m, locale: opts.locale || 'es-ES' });
  await ctx.route('**/umd/supabase.js', r => r.fulfill({ contentType: 'text/javascript', body: opts.cloud ? FAKE : '' }));
  if (opts.cloud) await ctx.route('**/estacion/config.js', r => r.fulfill({ contentType: 'text/javascript', body: CFG }));
  else await ctx.route('**/estacion/config.js', r => r.fulfill({ contentType: 'text/javascript', body: 'window.ESTACION={}' }));
  const p = await ctx.newPage(); const tag = opts.tag || vp.n;
  p.on('pageerror', e => errs.push(`${tag}: ${e.message}`)); p.on('console', m => { if (m.type() === 'error' && !/favicon|404|ERR_TUNNEL|ERR_NAME|ERR_INTERNET/.test(m.text())) errs.push(`${tag} consola: ${m.text()}`); });
  return { ctx, p };
}
const desborde = p => p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
(async () => {
  const b = await chromium.launch();
  const VPS = [{ w: 390, h: 844, n: 'movil', t: 1, m: 1 }, { w: 820, h: 1180, n: 'tableta', t: 1 }, { w: 1440, h: 900, n: 'pc' }];
  /* ---------- 1. web pública ---------- */
  for (const lang of ['es', 'fr']) for (const vp of VPS) {
    const { ctx, p } = await nuevaPagina(b, vp, { tag: `web-${lang}-${vp.n}` });
    await p.goto(BASE + (lang === 'fr' ? '/fr/' : '/')); await p.waitForTimeout(2600);
    const d = await desborde(p); check(d <= 1, `web ${lang} ${vp.n}: sin desborde (${d})`);
    const fonts = await p.evaluate(() => document.fonts.check('800 20px Unbounded'));
    check(fonts, `web ${lang} ${vp.n}: tipo de letra propio cargado`);
    await p.screenshot({ path: path.join(SH, `web-${lang}-${vp.n}.png`), fullPage: true });
    if (vp.n === 'pc') { const links = await p.$$eval('a[href^="/juegos/"]', as => as.map(a => a.getAttribute('href'))); check(links.length >= 8, `web ${lang}: enlaces a los juegos (${links.length})`);
      for (const u of [...new Set(links)]) { const r = await p.request.get(BASE + u); check(r.ok(), `web ${lang}: ${u} responde ${r.status()}`); } }
    await ctx.close();
  }
  for (const u of ['/legal/privacidad.html', '/fr/confidentialite.html']) { const { ctx, p } = await nuevaPagina(b, VPS[0], { tag: u }); await p.goto(BASE + u); check(/Supabase/.test(await p.textContent('body')), `${u} se ve`); await p.screenshot({ path: path.join(SH, `legal-${u.includes('fr') ? 'fr' : 'es'}.png`), fullPage: true }); await ctx.close(); }

  /* ---------- 2. Estación sin cuenta: mentor, cuaderno y zona de padres ---------- */
  for (const vp of VPS) {
    const { ctx, p } = await nuevaPagina(b, vp, { tag: `est-local-${vp.n}` });
    await ctx.addInitScript(c => { if (!localStorage.getItem('chrono-ohm-v1')) localStorage.setItem('chrono-ohm-v1', JSON.stringify(c)); }, CHRONO0);
    await p.goto(BASE + '/estacion/'); await p.waitForTimeout(600);
    check(await p.isVisible('#mChoose'), `estación ${vp.n}: primera vez pide elegir mentor`);
    await p.screenshot({ path: path.join(SH, `est-${vp.n}-0-inicio.png`) });
    await p.click('#mChoose'); await p.waitForTimeout(200); await p.screenshot({ path: path.join(SH, `est-${vp.n}-1-elegir.png`) });
    await p.click('[data-m="astrolabio"]'); await p.waitForTimeout(200);
    check(/Astrolabio/.test(await p.textContent('#mentorBox')), `estación ${vp.n}: mentor elegido (Astrolabio)`);
    // juega: vuelve con dos misiones nuevas en el capítulo 2
    await p.evaluate(c => { localStorage.setItem('chrono-ohm-v1', JSON.stringify(c)); document.dispatchEvent(new Event('visibilitychange')); }, CHRONO1);
    await p.waitForTimeout(400);
    const txt = await p.textContent('#mentorBox');
    check(/Chrono-Ohm/.test(txt) && (/2 misiones nuevas/.test(txt) || /170 XP/.test(txt)), `estación ${vp.n}: el mentor comenta lo jugado (${txt.slice(0, 90).replace(/\s+/g, ' ')}…)`);
    check(/Ohm publicó su ley en 1827/.test(txt), `estación ${vp.n}: dato histórico del tema`);
    await p.screenshot({ path: path.join(SH, `est-${vp.n}-2-pregunta.png`) });
    await p.click('#mAnswer'); await p.fill('#mAns', 'Baja'); await p.click('#mSend'); await p.waitForTimeout(150);
    const hint = await p.textContent('#mHint'); check(hint.length > 10, `estación ${vp.n}: respuesta corta → el mentor pide el porqué («${hint}»)`);
    await p.fill('#mAns', 'La corriente baja a la mitad, porque con la misma tensión la resistencia frena el doble a los electrones.');
    await p.click('#mSend'); await p.waitForTimeout(300);
    const st = await p.evaluate(() => __EST.S.refl.map(r => r.estado + ':' + r.topic));
    check(st.join() === 'pendiente:c2', `estación ${vp.n}: reflexión guardada pendiente (${st})`);
    await p.screenshot({ path: path.join(SH, `est-${vp.n}-3-enviada.png`) });
    // zona de padres: clave local y validar con 25
    await p.click('#btnSet'); await p.click('#stPar'); await p.fill('#pgIn', 'abcd'); await p.click('#pgOk'); await p.waitForTimeout(250);
    await p.screenshot({ path: path.join(SH, `est-${vp.n}-4-padres.png`) });
    await p.fill('.rev textarea', 'Muy bien explicado'); await p.click('.rev [data-p="25"]'); await p.waitForTimeout(250);
    check(await p.evaluate(() => __EST.S.refl[0].estado === 'validada' && __EST.S.refl[0].puntos === 25), `estación ${vp.n}: el padre valida con 25`);
    await p.click('[data-tab="inf"]'); await p.waitForTimeout(250);
    const inf = (await p.textContent('#sheet')).replace(/\s+/g, ' ');
    check(/Chrono-Ohm \+170 XP/.test(inf) && /2 misiones nuevas/.test(inf) && /Para hablar en la cena/.test(inf), `estación ${vp.n}: informe semanal («${inf.slice(0, 120)}…»)`);
    if (vp.n === 'movil') await p.screenshot({ path: path.join(SH, 'est-informe.png'), fullPage: true });
    await p.click('#pClose'); await p.waitForTimeout(200);
    const mon = await p.evaluate(() => ({ refl: __EST.S.led.filter(x => /^refl:/.test(x.k)).map(x => x.e).join(), e: __EST.ECO.saldo(__EST.S.led).e, cab: document.querySelector('#wE').textContent.replace(/\D/g, '') }));
    check(mon.refl === '25' && String(mon.e) === mon.cab, `estación ${vp.n}: la reflexión validada da 25 de Energía y se ve en el monedero de la cabecera (${mon.cab})`);
    const otro = await p.evaluate(() => { const e0 = __EST.ECO.saldo(__EST.S.led).e; __EST.S.refl.push({ id: 'otro-aparato', estado: 'validada', puntos: 50, created: Date.now(), game: 'chrono-ohm', topic: 'c1' }); __EST.save(); document.dispatchEvent(new Event('visibilitychange')); return new Promise(r => setTimeout(() => r({ antes: e0, despues: __EST.ECO.saldo(__EST.S.led).e, pagada: __EST.S.led.some(x => x.k === 'refl:otro-aparato') }), 300)); });
    check(!otro.pagada && otro.despues === otro.antes, `estación ${vp.n}: una reflexión escrita en otro aparato no se paga aquí (se paga solo donde se escribió)`);
    check(/\+25 puntos/.test(await p.textContent('#mentorBox')), `estación ${vp.n}: el mentor le cuenta la validación`);
    await p.screenshot({ path: path.join(SH, `est-${vp.n}-5-validada.png`) });
    await p.click('#openBook'); await p.waitForTimeout(200);
    const on = await p.$$eval('.badge.on', x => x.length); check(on >= 1, `estación ${vp.n}: insignia «primera reflexión» (${on})`);
    await p.screenshot({ path: path.join(SH, `est-${vp.n}-6-cuaderno.png`) });
    await p.click('#bkClose');
    // idioma
    await p.click('#btnSet'); await p.click('[data-lang="fr"]'); await p.waitForTimeout(250);
    await p.keyboard.press('Escape'); await p.waitForTimeout(150);
    const fr = await p.textContent('body'); check(/Carnet de bord/.test(fr) && /Mes jeux/.test(fr) && /Astrolabe/.test(fr), `estación ${vp.n}: en francés`);
    const d = await desborde(p); check(d <= 1, `estación ${vp.n}: sin desborde (${d})`);
    await p.screenshot({ path: path.join(SH, `est-${vp.n}-7-fr.png`), fullPage: true });
    await ctx.close();
  }
  /* ---------- 2c. voz: usa el audio grabado del mentor si existe ---------- */
  {
    const { ctx, p } = await nuevaPagina(b, VPS[0], { tag: 'voz' }); const pedidos = [];
    await ctx.route('**/estacion/audio/manifest.json', r => r.fulfill({ contentType: 'application/json', body: JSON.stringify({ files: ['es/faro/q_chrono-ohm_c2_0', 'es/faro/m.pregunta'] }) }));
    await ctx.route('**/estacion/audio/es/**', r => { pedidos.push(new URL(r.request().url()).pathname); r.fulfill({ status: 404 }); });
    await ctx.addInitScript(c => { if (!localStorage.getItem('chrono-ohm-v1')) localStorage.setItem('chrono-ohm-v1', JSON.stringify(c)); }, CHRONO0);
    await p.goto(BASE + '/estacion/'); await p.waitForTimeout(500); await p.click('#mChoose'); await p.click('[data-m="faro"]');
    await p.evaluate(c => { localStorage.setItem('chrono-ohm-v1', JSON.stringify(c)); document.dispatchEvent(new Event('visibilitychange')); }, CHRONO1); await p.waitForTimeout(400);
    await p.click('.mq [data-voz="q"]'); await p.waitForTimeout(600);
    check(pedidos.includes('/estacion/audio/es/faro/m.pregunta.mp3'), `voz: pide el audio grabado del mentor (${pedidos.join(', ') || 'nada'})`);
    await p.click('.mdato [data-voz="dato"]'); await p.waitForTimeout(200);
    await ctx.close();
  }
  /* ---------- 2d. pestaña «Volver a la Estación» en cada juego ---------- */
  for (const u of ['/juegos/chrono-ohm/', '/juegos/pitagoras/', '/juegos/philoquest/', '/juegos/umbral/', '/rutinator/', '/refugio/']) {
    const { ctx, p } = await nuevaPagina(b, VPS[0], { tag: 'volver' + u });
    await p.goto(BASE + u); await p.waitForTimeout(1500);
    const ok = await p.evaluate(() => { const h = document.querySelector('[data-curionauta="volver"]'); const a = h && h.shadowRoot && h.shadowRoot.querySelector('a'); if (!a) return null; const r = a.getBoundingClientRect(); return { href: a.getAttribute('href'), visible: r.right > 20 && r.right < 60 }; });
    check(ok && ok.href === '/estacion/' && ok.visible, `pestaña «Volver» en ${u} (${JSON.stringify(ok)})`);
    await p.screenshot({ path: path.join(SH, 'volver-' + u.split('/').filter(Boolean).pop() + '.png') });
    await ctx.close();
  }
  /* ---------- 2e. El Refugio en la Estación: tarjeta, progreso y comentario del mentor ---------- */
  {
    const { ctx, p } = await nuevaPagina(b, VPS[0], { tag: 'refugio' });
    const REF = { v: 1, e: 0, inv: {}, placed: { banco: { t: 'bat_s', wh: 40 }, puerta: { t: 'led' }, c1: { t: 'sw', on: false } }, cables: [], time: 20.5, reto: 0, step: 1, done: {}, stats: { ledsQuemados: 0 }, nextId: 1 };
    await p.goto(BASE + '/estacion/'); await p.waitForTimeout(500);
    const card = () => p.evaluate(() => { const a = [...document.querySelectorAll('#games .game')].find(x => /El Refugio/.test(x.textContent)); return a ? { txt: a.textContent.replace(/\s+/g, ' ').trim(), href: a.querySelector('a').getAttribute('href') } : null; });
    let c = await card(); check(c && /Aún sin empezar/.test(c.txt) && c.href === '../refugio/', `refugio: tarjeta en la Estación sin empezar (${c && c.txt.slice(0, 70)})`);
    check((await p.request.get(BASE + '/refugio/')).ok(), 'refugio: /refugio/ responde');
    await p.click('#mChoose'); await p.click('[data-m="brujula"]');
    await p.evaluate(r => { localStorage.setItem('curionauta-refugio-0.1', JSON.stringify(r)); document.dispatchEvent(new Event('visibilitychange')); }, REF); await p.waitForTimeout(400);
    c = await card(); check(c && /Luz de emergencia/.test(c.txt) && /0\/3 retos/.test(c.txt) && /Seguir jugando/.test(c.txt), `refugio: empezado, muestra el reto en curso (${c && c.txt.slice(0, 90)})`);
    const R1 = Object.assign({}, REF, { reto: 1, step: 0, e: 40, done: { r1: '2026-11-11' }, cables: [{ id: 1, a: 'banco.a', b: 'c1.a' }], at: Date.now() });
    await p.evaluate(r => { localStorage.setItem('curionauta-refugio-0.1', JSON.stringify(r)); document.dispatchEvent(new Event('visibilitychange')); }, R1); await p.waitForTimeout(400);
    c = await card(); check(c && /1\/3 retos/.test(c.txt) && /40 XP/.test(c.txt) && /¿Aguanta la noche\?/.test(c.txt), `refugio: un reto superado → 1/3 y 40 XP (${c && c.txt.slice(0, 90)})`);
    const mt = (await p.textContent('#mentorBox')).replace(/\s+/g, ' ');
    check(/El Refugio/.test(mt) && (/1 reto superado/.test(mt) || /\+40 XP/.test(mt)) && /Holonyak/.test(mt) && /560 Ω/.test(mt), `refugio: el mentor comenta el reto y pregunta («${mt.slice(0, 110)}…»)`);
    await p.screenshot({ path: path.join(SH, 'est-refugio.png'), fullPage: true });
    const FIN = Object.assign({}, R1, { reto: 3, done: { r1: '2026-11-11', r2: '2026-11-11', r3: '2026-11-11' }, e: 90 });
    await p.evaluate(r => { localStorage.setItem('curionauta-refugio-0.1', JSON.stringify(r)); __EST.setLang('fr'); document.dispatchEvent(new Event('visibilitychange')); }, FIN); await p.waitForTimeout(400);
    c = await card(); check(c && /Mode libre/.test(c.txt) && /3\/3 défis/.test(c.txt) && /120 XP/.test(c.txt) && /Monte, câble et mesure/.test(c.txt), `refugio: en francés y terminado (${c && c.txt.slice(0, 100)})`);
    const mf = (await p.textContent('#mentorBox')).replace(/\s+/g, ' ');
    check(/El Refugio/.test(mf) && /Le câble coupé et le multimètre|Macadie/.test(mf), `refugio: el mentor lo comenta en francés («${mf.slice(0, 110)}…»)`);
    await p.screenshot({ path: path.join(SH, 'est-refugio-fr.png'), fullPage: true });
    check(await desborde(p) <= 1, 'refugio: la Estación no desborda en móvil con la tarjeta nueva');
    await ctx.close();
  }
  /* ---------- 2f. Estación v3: monedero, mercado, hucha, Pasaporte, avatar y fondos ---------- */
  for (const vp of VPS) {
    const { ctx, p } = await nuevaPagina(b, vp, { tag: `v3-${vp.n}` }); const T = `v3 ${vp.n}`;
    await ctx.addInitScript(c => { if (!localStorage.getItem('chrono-ohm-v1')) localStorage.setItem('chrono-ohm-v1', JSON.stringify(c)); }, CHRONO0);
    await p.goto(BASE + '/estacion/'); await p.waitForTimeout(600);
    const est = () => p.evaluate(() => { const s = __EST.ECO.saldo(__EST.S.led); return { e: s.e, c: s.c, n: __EST.S.led.length, wE: document.querySelector('#wE').textContent.replace(/\D/g, ''), wC: document.querySelector('#wC').textContent, tit: __EST.S.tit.join(), hero: document.querySelector('#heroTit').textContent }; });
    const ir = async v => { await p.click(`[data-go="${v}"] >> visible=true`); await p.waitForTimeout(250); };
    const jugar = async c => { await p.evaluate(c => { localStorage.setItem('chrono-ohm-v1', JSON.stringify(c)); document.dispatchEvent(new Event('visibilitychange')); }, c); await p.waitForTimeout(350); };
    // primera vez: paga de golpe lo conseguido hasta hoy (2 misiones con 3★ + 2 misiones (una con 3★) + 1 medalla = 125 ⚡; capítulo 1 = 2 💎)
    let s = await est();
    check(s.e === 125 && s.c === 2 && s.wE === '125' && s.wC === '2', `${T}: bienvenida, paga lo conseguido hasta hoy (${s.e} ⚡, ${s.c} 💎; cabecera ${s.wE}/${s.wC})`);
    check(/Tu monedero ya funciona/.test(await p.textContent('#nuevoBox')), `${T}: Novedades explica de dónde sale el saldo`);
    check(s.tit === 'ohm-chispa' && /Chispa de Ampère/.test(s.hero), `${T}: título ganado y luciendo junto al nombre (${s.hero})`);
    check(await p.isVisible('#heroAv svg.avatar'), `${T}: avatar en la cabecera`);
    await p.screenshot({ path: path.join(SH, `v3-${vp.n}-1-inicio.png`), fullPage: true });
    await p.reload(); await p.waitForTimeout(500); let s2 = await est();
    check(s2.e === s.e && s2.n === s.n, `${T}: abrir la Estación otra vez no vuelve a pagar`);
    // juega dos misiones nuevas con tres estrellas: 2 × (20 + 10) + 10 de práctica del día (+ 20 si era la oferta)
    const oferta = await p.evaluate(() => __EST.S.oferta && __EST.S.oferta.g);
    await jugar(CHRONO1); s2 = await est(); const esperado = 125 + 60 + 10 + (oferta === 'chrono-ohm' ? 20 : 0);
    check(s2.e === esperado, `${T}: dos misiones nuevas → +60, +10 de práctica${oferta === 'chrono-ohm' ? ' y +20 de oferta' : ''} (${s2.e}, esperado ${esperado}; oferta del día: ${oferta})`);
    check(await p.isVisible('#toast') && /\+\d+ ⚡/.test(await p.textContent('#toast')), `${T}: aviso de lo ganado («${(await p.textContent('#toast')).slice(0, 60)}»)`);
    await jugar(CHRONO1); check((await est()).e === esperado, `${T}: volver sin jugar nada nuevo no da puntos`);
    const REPE = JSON.parse(JSON.stringify(CHRONO1)); REPE.xp += 50; await jugar(REPE);
    check((await est()).e === esperado, `${T}: repetir un nivel ya superado no da puntos`);
    // juegos: oferta del día y lo ganado en cada juego
    await ir('juegos');
    check(await p.isVisible('#oferta') && /Energía extra|Oferta conseguida/.test(await p.textContent('#oferta')), `${T}: oferta del día en Juegos`);
    check(/ganados aquí/.test(await p.textContent('#games .game')), `${T}: cada juego enseña la Energía ganada en él`);
    check(await p.isVisible('#games') && !(await p.isVisible('#mentor')), `${T}: cada pantalla enseña solo lo suyo`);
    await p.screenshot({ path: path.join(SH, `v3-${vp.n}-2-juegos.png`), fullPage: true });
    // mercado
    await ir('monedero'); const precio = await p.evaluate(() => __EST.ECO.precio(__EST.ymd(new Date())));
    await p.click('#mkBuy'); await p.click('#cfOk'); await p.waitForTimeout(200); s = await est();
    check(s.e === esperado - precio && s.c === 3, `${T}: mercado, comprar un Cristal cuesta ${precio} (${s.e} ⚡, ${s.c} 💎)`);
    await p.click('#mkSell'); await p.click('#cfOk'); await p.waitForTimeout(200); s = await est(); const venta = Math.floor(precio * 0.8);
    check(s.e === esperado - precio + venta && s.c === 2, `${T}: mercado, venderlo devuelve el 80 % (${venta})`);
    // hucha: guardar, romper (devuelve lo suyo) y recoger una ya cumplida (con premio)
    const antes = s.e;
    await p.fill('#huIn', '5'); await p.click('#huGo'); check(/entre 20 y/.test(await p.textContent('#huMsg')) && (await est()).e === antes, `${T}: hucha, no deja guardar menos del mínimo`);
    await p.fill('#huIn', '100'); await p.click('[data-hd="14"]');
    check(/tus 100 y 30 de premio/.test(await p.textContent('#huPrev')), `${T}: hucha, enseña el premio antes de guardar («${(await p.textContent('#huPrev')).slice(0, 70)}»)`);
    await p.click('#huGo'); await p.waitForTimeout(200); s = await est();
    check(s.e === antes - 100 && (await p.textContent('#balH')) === '100', `${T}: hucha, 100 guardados 14 días`);
    await p.screenshot({ path: path.join(SH, `v3-${vp.n}-3-monedero.png`), fullPage: true });
    await p.click('[data-brk]'); await p.waitForTimeout(150); check(/pierdes el premio de 30/.test(await p.textContent('#sheet')), `${T}: hucha, avisa de lo que se pierde al romperla`);
    await p.click('#cfOk'); await p.waitForTimeout(200);
    check((await est()).e === antes && !(await p.$('[data-brk]')), `${T}: hucha rota, recupera lo suyo sin premio`);
    await p.evaluate(() => { __EST.S.led.push({ k: 'hucha:vieja:in', e: -100, c: 0, g: '', at: Date.now() - 15 * 864e5, x: { d: 14 } }); __EST.save(); __EST.go('monedero'); }); await p.waitForTimeout(150);
    await p.click('[data-col="vieja"]'); await p.waitForTimeout(200); s = await est();
    check(s.e === antes + 30, `${T}: hucha cumplida, recoge lo suyo y el 30 % (${s.e - antes} de premio)`);
    check((await p.evaluate(() => __EST.S.tit.join())).includes('hucha-oro'), `${T}: título «Paciencia de Oro» por esperar los 14 días`);
    check((await p.$$('#v-monedero .c-mov .nlist li')).length >= 8, `${T}: lista de movimientos`);
    // pasaporte
    await ir('pasaporte'); const pas = (await p.textContent('#pasBox')).replace(/\s+/g, ' ');
    check(/Sé qué es la corriente eléctrica/.test(pas) && /Demostrado en Chrono-Ohm · París 1820/.test(pas) && /1 de 27/.test(pas) && /Cycle 4 · Physique-chimie/.test(pas) && /2\.º ESO/.test(pas), `${T}: Pasaporte con el saber demostrado, dónde y su equivalencia escolar`);
    check((await p.$$('#pasBox .tit.got')).length === 2 && (await p.$$('#pasBox .tit.lock')).length === 16, `${T}: títulos ganados y por ganar`);
    check(!(await p.isVisible('#pasBox details.pend .sab')), `${T}: lo que falta por demostrar va plegado`);
    await p.click('#pasBox details.pend summary'); await p.waitForTimeout(100); check(await p.isVisible('#pasBox details.pend .sab'), `${T}: y se despliega al tocarlo`);
    await p.click('#pasBox [data-tit="ohm-chispa"]'); await p.waitForTimeout(150);
    check(!/Chispa/.test(await p.textContent('#heroTit')), `${T}: puede dejar de lucir un título`);
    await p.click('#pasBox [data-tit="ohm-chispa"]'); await p.waitForTimeout(150); check(/Chispa/.test(await p.textContent('#heroTit')), `${T}: y volver a lucirlo`);
    await p.screenshot({ path: path.join(SH, `v3-${vp.n}-4-pasaporte.png`), fullPage: true });
    if (vp.n === 'pc') {
      await p.emulateMedia({ media: 'print' }); await p.waitForTimeout(150);
      check(await p.isVisible('#pasBox .pname') && !(await p.isVisible('header.top')) && !(await p.isVisible('#pasPrint')) && !(await p.isVisible('#pasBox .tit.lock')), 'v3: al imprimir sale solo el Pasaporte (sin menús ni botones)');
      await p.screenshot({ path: path.join(SH, 'v3-pasaporte-impreso.png'), fullPage: true }); await p.emulateMedia({ media: 'screen' });
    }
    // yo: avatar por piezas, compra y fondos
    await ir('yo');
    await p.click('[data-grp="pelo"]'); await p.click('[data-slot="pelo"][data-id="rizado"]'); await p.waitForTimeout(150);
    check(await p.evaluate(() => __EST.S.av.pelo === 'rizado' && __EST.S.led.every(x => !/^buy:pelo/.test(x.k))), `${T}: avatar, una pieza de serie se pone sin pagar`);
    s = await est(); await p.click('[data-grp="casco"]'); await p.click('[data-slot="casco"][data-id="gorra"]'); await p.waitForTimeout(150);
    check(/¿Comprar/.test(await p.textContent('#sheet')) && /Te quedarán/.test(await p.textContent('#sheet')), `${T}: tienda, pide confirmar y enseña lo que quedará`);
    await p.screenshot({ path: path.join(SH, `v3-${vp.n}-5-compra.png`) });
    await p.click('#cfOk'); await p.waitForTimeout(200); s2 = await est();
    check(s2.e === s.e - 40 && await p.evaluate(() => __EST.S.av.casco === 'gorra' && __EST.S.led.some(x => x.k === 'buy:casco:gorra')), `${T}: tienda, la gorra cuesta 40 y queda puesta`);
    await p.click('[data-slot="casco"][data-id="no"]'); await p.click('[data-slot="casco"][data-id="gorra"]'); await p.waitForTimeout(150);
    check((await est()).e === s2.e && !(await p.isVisible('#modal')), `${T}: tienda, lo comprado es suyo para siempre (no se paga dos veces)`);
    await p.click('[data-slot="casco"][data-id="laurel"]'); await p.waitForTimeout(150);
    check(/Te faltan 1 Cristales/.test(await p.textContent('#sheet')) && !(await p.$('#cfNo')), `${T}: tienda, si no llega se lo dice y no deja comprar`);
    await p.click('#cfOk'); await p.waitForTimeout(100);
    await p.click('[data-slot="fondo"][data-id="nebulosa"]'); await p.waitForTimeout(200);
    check((await p.getAttribute('#fondo', 'class')) === 'fx f-nebulosa' && (await est()).e === s2.e, `${T}: fondo de serie cambiado (Nebulosa)`);
    const anim = await p.evaluate(() => getComputedStyle(document.querySelector('#fondo i')).animationName);
    check(anim && anim !== 'none', `${T}: el fondo está animado (${anim})`);
    check((await p.$$('#yoBox .fopts .opt')).length === 10, `${T}: diez fondos para elegir`);
    await p.screenshot({ path: path.join(SH, `v3-${vp.n}-6-yo.png`), fullPage: true });
    await p.reload(); await p.waitForTimeout(500);
    check((await p.getAttribute('#fondo', 'class')) === 'fx f-nebulosa' && await p.evaluate(() => __EST.S.av.casco === 'gorra' && __EST.VIEW === 'yo') && (await est()).e === s2.e, `${T}: al volver a abrir conserva saldo, avatar, fondo y pantalla`);
    // zona de padres: multiplicador ×2 para los logros nuevos
    await p.click('#btnSet'); await p.click('#stPar'); await p.fill('#pgIn', 'abcd'); await p.click('#pgOk'); await p.waitForTimeout(250);
    await p.click('[data-tab="set"]'); await p.click('[data-mult="2"]'); await p.waitForTimeout(100); await p.click('#pClose'); await p.waitForTimeout(150);
    const C2 = JSON.parse(JSON.stringify(CHRONO1)); C2.xp += 90; C2.ch.c2.done = 5; C2.ch.c2.stars['2-5'] = 2; s = await est(); await jugar(C2); s2 = await est();
    check(s2.e === s.e + 40, `${T}: con ×2 del padre, una misión nueva da 40 en vez de 20 (+${s2.e - s.e}; la práctica del día ya estaba cobrada)`);
    // francés y desbordes
    await p.evaluate(() => __EST.setLang('fr')); await p.waitForTimeout(200);
    for (const v of ['inicio', 'juegos', 'monedero', 'pasaporte', 'yo']) { await ir(v); const d = await desborde(p); check(d <= 1, `${T}: «${v}» sin desborde en francés (${d})`); }
    await ir('monedero'); const fr = (await p.textContent('#monBox')).replace(/\s+/g, ' ');
    check(/Ma bourse/.test(fr) && /Marché/.test(fr) && /Tirelire/.test(fr) && /Cristaux/.test(fr) && !/Energía|Hucha|Mercado/.test(fr), `${T}: monedero en francés`);
    await ir('pasaporte'); const frp = (await p.textContent('#pasBox')).replace(/\s+/g, ' ');
    check(/Passeport des savoirs/.test(frp) && /Étincelle d’Ampère/.test(frp) && /Je sais ce qu’est le courant électrique/.test(frp), `${T}: Pasaporte en francés`);
    await p.screenshot({ path: path.join(SH, `v3-${vp.n}-7-pasaporte-fr.png`), fullPage: true });
    await ctx.close();
  }
  /* ---------- 2b. Rutinator v3 en /rutinator/: la Estación lo lee del aparato ---------- */
  {
    const { ctx, p } = await nuevaPagina(b, VPS[0], { tag: 'rutinator' });
    await p.goto(BASE + '/rutinator/'); await p.waitForTimeout(900);
    const esperado = await p.evaluate(() => { const a = window.__rutineitor; a.store.fijarAjuste('configurado', true);
      const hoy = new Date(); const k = new Date(hoy.getTime() - hoy.getTimezoneOffset() * 6e4).toISOString().slice(0, 10);
      a.store.set('ledger', 'mx1', { id: 'mx1', ts: Date.now(), fecha: k, cuenta: 'semana', tipo: 'ajuste', cantidad: 37, concepto: 'prueba', categoria: 'ajuste', provisional: false, anula: null, anuladoPor: null });
      a.store.set('ledger', 'mx2', { id: 'mx2', ts: Date.now(), fecha: k, cuenta: 'hucha', tipo: 'ajuste', cantidad: 120, concepto: 'prueba', categoria: 'ajuste', provisional: false, anula: null, anuladoPor: null });
      a.render(); return true; });
    await p.waitForTimeout(1200);   // guardado diferido de Rutinator
    await p.goto(BASE + '/estacion/'); await p.waitForTimeout(700);
    const rut = (await p.textContent('#rutBox')).replace(/\s+/g, ' ');
    check(/37/.test(rut) && /120 en la hucha/.test(rut) && /tareas hoy/.test(rut), `estación lee Rutinator v3 del aparato («${rut.trim().slice(0, 90)}»)`);
    check(await p.$eval('#rutBox a', a => a.getAttribute('href')) === '../rutinator/', 'el botón abre /rutinator/');
    await p.screenshot({ path: path.join(SH, 'est-rutinator-v3.png'), fullPage: true });
    await ctx.close();
  }
  /* ---------- 3. mudanza desde la Estación antigua ---------- */
  {
    const { ctx, p } = await nuevaPagina(b, VPS[0], { tag: 'mudanza' });
    await p.goto(BASE + '/estacion/vacio-para-origen.html').catch(() => {});
    const hash = await p.evaluate(async c => {
      const keys = { 'chrono-ohm-v1': JSON.stringify(c), 'expedicion-pitagoras-v1': JSON.stringify({ xp: 300, prologue: true, stars: { c1: 3, c2: 2 } }), 'estacion-nil-v1': JSON.stringify({ notes: [{ id: 'n1', title: 'Examen de Pythagore', due: null, done: false, created: 1 }], links: [{ id: 'l1', title: 'Pronote', url: 'https://0000000a.index-education.net/pronote/eleve.html', color: '#2fb26a', sort: 0 }] }), 'estacion-nil-auth': 'secreto' };
      const bytes = new TextEncoder().encode(JSON.stringify({ v: 1, from: 'https://agomezbl.github.io', keys }));
      const gz = new Uint8Array(await new Response(new Blob([bytes]).stream().pipeThrough(new CompressionStream('gzip'))).arrayBuffer());
      let s = ''; gz.forEach(x => (s += String.fromCharCode(x))); return '#mudanza=g.' + btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    }, CHRONO1);
    await p.goto(BASE + '/estacion/' + hash); await p.waitForTimeout(700);
    await p.screenshot({ path: path.join(SH, 'mudanza-1.png') });
    check(await p.isVisible('#mvGo'), 'mudanza: aparece el aviso para traer las partidas');
    await p.click('#mvGo'); await p.waitForTimeout(400);
    const r = await p.evaluate(() => ({ chrono: JSON.parse(localStorage.getItem('chrono-ohm-v1') || '{}').xp, pit: JSON.parse(localStorage.getItem('expedicion-pitagoras-v1') || '{}').xp, notes: __EST.S.notes.length, pronote: __EST.S.links.find(l => l.title === 'Pronote').url, auth: localStorage.getItem('estacion-nil-auth'), hash: location.hash }));
    check(r.chrono === 1420 && r.pit === 300, `mudanza: partidas traídas (${r.chrono}, ${r.pit})`);
    check(r.notes === 1 && /pronote/.test(r.pronote), 'mudanza: notas y Pronote traídos');
    check(r.auth === null && r.hash === '', 'mudanza: no se copia la sesión y se limpia el enlace');
    await p.screenshot({ path: path.join(SH, 'mudanza-2.png'), fullPage: true });
    await ctx.close();
  }
  /* ---------- 4. con cuenta: Nil escribe, el padre revisa en su aparato ---------- */
  {
    const { ctx, p } = await nuevaPagina(b, VPS[0], { cloud: true, tag: 'nube-nil' });
    await ctx.addInitScript(c => { if (!localStorage.getItem('chrono-ohm-v1')) localStorage.setItem('chrono-ohm-v1', JSON.stringify(c)); }, CHRONO0);
    await p.goto(BASE + '/estacion/'); await p.waitForTimeout(500);
    await p.fill('#lgMail', 'nil@x'); await p.fill('#lgPass', 'nil12345'); await p.click('#lgGo'); await p.waitForTimeout(800);
    await p.click('#mChoose'); await p.click('[data-m="faro"]');
    await p.evaluate(c => { localStorage.setItem('chrono-ohm-v1', JSON.stringify(c)); document.dispatchEvent(new Event('visibilitychange')); }, CHRONO1); await p.waitForTimeout(600);
    await p.click('#mAnswer'); await p.fill('#mAns', 'Si duplico la resistencia la corriente se reduce a la mitad, porque I = U / R y U no cambia.'); await p.click('#mSend'); await p.waitForTimeout(600);
    const db = await p.evaluate(() => window.__FAKEDB.estacion_reflexiones.map(r => r.estado + ':' + r.mentor + ':' + r.member_id));
    check(db.join() === 'pendiente:faro:m1', `nube: la reflexión llega a la base de datos (${db})`);
    check(/Faro/.test(await p.textContent('#mentorBox')), 'nube: mentor Faro');
    await p.screenshot({ path: path.join(SH, 'nube-nil.png'), fullPage: true });
    // el padre entra en su aparato (otra sesión) y la valida sin clave
    await p.evaluate(() => { localStorage.setItem('fake-sess', 'u0'); });
    await p.reload(); await p.waitForTimeout(900);
    const ptxt = await p.textContent('#mentorBox'); check(/1 reflexi/.test(ptxt), `nube: el padre ve que hay 1 reflexión esperando («${ptxt.trim().slice(0, 60)}»)`);
    await p.click('#mPar'); await p.waitForTimeout(250); await p.screenshot({ path: path.join(SH, 'nube-padre.png') });
    await p.click('.rev [data-p="50"]'); await p.waitForTimeout(400);
    const after = await p.evaluate(() => window.__FAKEDB.estacion_reflexiones.map(r => r.estado + ':' + r.puntos));
    check(after.join() === 'validada:50', `nube: el padre valida con 50 (${after})`);
    await ctx.close();
  }
  res.forEach(x => console.log(x));
  const bad = res.filter(x => x.startsWith('✗')).length;
  console.log(`\n${res.length - bad} bien, ${bad} mal · errores de página: ${errs.length}`); errs.slice(0, 12).forEach(e => console.log('  ' + e));
  srv.close(); await b.close(); process.exit(bad || errs.length ? 1 : 0);
})();
