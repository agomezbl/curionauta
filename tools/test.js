// Prueba de curionauta.com montado en dist/ (bash tools/montar.sh antes).
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
  p.on('pageerror', e => errs.push(`${tag}: ${e.message}`)); p.on('console', m => { if (m.type() === 'error' && !/favicon|404/.test(m.text())) errs.push(`${tag} consola: ${m.text()}`); });
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
    await p.click('#pClose'); await p.waitForTimeout(200);
    check((await p.textContent('#bptsN')) === '25', `estación ${vp.n}: puntos de bitácora en la cabecera`);
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
