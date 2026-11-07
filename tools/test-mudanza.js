// Mudanza de verdad entre dos direcciones distintas: la Estación antigua (estacion-nil, puerto 8778)
// manda las partidas a la nueva (dist/, puerto 8777). Uso: node tools/test-mudanza.js /ruta/a/estacion-nil
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), http = require('http');
const OLD = process.argv[2] || path.join(__dirname, '..', '..', 'estacion-nil'), NEW = path.join(__dirname, '..', 'dist');
const serve = (root, port) => http.createServer((q, r) => { let f = path.join(root, decodeURIComponent(q.url.split('?')[0])); try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch (e) {}
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': f.endsWith('.js') ? 'text/javascript' : f.endsWith('.css') ? 'text/css' : 'text/html; charset=utf-8' }); r.end(d); }); }).listen(port);
const a = serve(OLD, 8778), b = serve(NEW, 8777);
(async () => {
  const br = await chromium.launch(); const ctx = await br.newContext({ viewport: { width: 390, height: 844 } }); const errs = [];
  await ctx.route('**/umd/supabase.js', r => r.fulfill({ contentType: 'text/javascript', body: '' }));
  await ctx.route('http://localhost:8778/config.js', r => r.fulfill({ contentType: 'text/javascript', body: "window.ESTACION={nuevaUrl:'http://localhost:8777/estacion/'}" }));
  await ctx.route('http://localhost:8777/estacion/config.js', r => r.fulfill({ contentType: 'text/javascript', body: 'window.ESTACION={}' }));
  const p = await ctx.newPage(); p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8778/');
  await p.evaluate(() => { localStorage.setItem('chrono-ohm-v1', JSON.stringify({ xp: 2222, introSeen: true, ch: { c1: { done: 6, stars: {} } }, savedAt: Date.now() }));
    localStorage.setItem('philoquest.v3.store', JSON.stringify({ slots: { a: { done: { k1: 1, k2: 1 }, updated: Date.now() } } })); localStorage.setItem('estacion-nil-auth', 'NO-DEBE-VIAJAR'); });
  await p.reload(); await p.waitForTimeout(500); await p.click('#lgLocal').catch(() => {}); await p.waitForTimeout(300);
  const visible = await p.isVisible('#mudanza'); await p.screenshot({ path: path.join(__dirname, '..', 'shots', 'mudanza-antigua.png') });
  await p.click('#mvGo'); await p.waitForURL('http://localhost:8777/estacion/**'); await p.waitForTimeout(800);
  await p.click('#mvGo'); await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({ chrono: JSON.parse(localStorage.getItem('chrono-ohm-v1')).xp, philo: !!localStorage.getItem('philoquest.v3.store'), auth: localStorage.getItem('estacion-nil-auth'), games: document.querySelector('#games').textContent.replace(/\s+/g, ' ').slice(0, 120) }));
  console.log({ visible, ...r, errs }); const ok = visible && r.chrono === 2222 && r.philo && !r.auth && !errs.length;
  console.log(ok ? '✓ mudanza entre direcciones distintas' : '✗ mudanza'); a.close(); b.close(); await br.close(); process.exit(ok ? 0 : 1);
})();
