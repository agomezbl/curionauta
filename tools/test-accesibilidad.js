// Auditoría de accesibilidad (WCAG 2.1 AA) con axe-core sobre dist/: web pública ES/FR,
// privacidad y la Estación (inicio, mentor con pregunta, zona de padres, cuaderno).
//   AXE=/ruta/a/axe.min.js node tools/test-accesibilidad.js
const { chromium } = require('playwright'); const path = require('path'), fs = require('fs'), http = require('http');
const AXE = fs.readFileSync(process.env.AXE || require.resolve('axe-core/axe.min.js'), 'utf8');
const ROOT = path.join(__dirname, '..', 'dist');
const T = { '.js': 'text/javascript', '.css': 'text/css', '.png': 'image/png', '.woff2': 'font/woff2', '.json': 'application/json', '.webmanifest': 'application/manifest+json' };
const srv = http.createServer((q, r) => { let f = path.join(ROOT, decodeURIComponent(q.url.split('?')[0])); try { if (fs.statSync(f).isDirectory()) f = path.join(f, 'index.html'); } catch (e) {}
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'Content-Type': T[path.extname(f)] || 'text/html; charset=utf-8' }); r.end(d); }); }).listen(8779);
const B = 'http://localhost:8779';
async function audit(p, nombre) {
  await p.addScriptTag({ content: AXE });
  const r = await p.evaluate(() => axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'best-practice'] } }));
  const v = r.violations.filter(x => ['serious', 'critical', 'moderate'].includes(x.impact));
  console.log(`${v.length ? '✗' : '✓'} ${nombre}: ${v.length} problemas`);
  v.forEach(x => console.log(`   [${x.impact}] ${x.id}: ${x.help} → ${x.nodes.slice(0, 3).map(n => n.target.join(' ')).join(' | ')}`));
  return v.length;
}
(async () => {
  const b = await chromium.launch(); let total = 0;
  for (const vp of [{ w: 390, h: 844, n: 'móvil' }, { w: 1440, h: 900, n: 'pc' }]) {
    const ctx = await b.newContext({ viewport: { width: vp.w, height: vp.h } });
    await ctx.route('**/umd/supabase.js', r => r.fulfill({ contentType: 'text/javascript', body: '' }));
    await ctx.route('**/estacion/config.js', r => r.fulfill({ contentType: 'text/javascript', body: 'window.ESTACION={}' }));
    const p = await ctx.newPage();
    for (const u of ['/', '/fr/', '/legal/privacidad.html', '/fr/confidentialite.html']) { await p.goto(B + u); await p.waitForTimeout(400); total += await audit(p, `${vp.n} ${u}`); }
    await p.goto(B + '/estacion/'); await p.waitForTimeout(500); total += await audit(p, `${vp.n} estación: primera vez`);
    await p.click('#mChoose'); await p.waitForTimeout(200); total += await audit(p, `${vp.n} estación: elegir mentor`);
    await p.click('[data-m="brujula"]');
    await p.evaluate(() => { localStorage.setItem('chrono-ohm-v1', JSON.stringify({ xp: 100, introSeen: true, ch: { c1: { done: 1, stars: { a: 3 } } } })); __EST.S.seen['chrono-ohm'] = { xp: 0, ch: {}, ty: 0 }; document.dispatchEvent(new Event('visibilitychange')); });
    await p.waitForTimeout(300); total += await audit(p, `${vp.n} estación: pregunta del mentor`);
    await p.click('#mAnswer'); await p.waitForTimeout(150); total += await audit(p, `${vp.n} estación: escribiendo`);
    await p.fill('#mAns', 'Porque el amperímetro tiene que medir la corriente que pasa por el mismo camino.'); await p.click('#mSend'); await p.waitForTimeout(200);
    await p.click('#btnSet'); await p.waitForTimeout(150); total += await audit(p, `${vp.n} estación: ajustes`);
    await p.click('#stPar'); await p.fill('#pgIn', 'abcd'); await p.click('#pgOk'); await p.waitForTimeout(200); total += await audit(p, `${vp.n} estación: zona de padres`);
    await p.click('[data-tab="inf"]'); await p.waitForTimeout(150); total += await audit(p, `${vp.n} estación: informe`);
    await ctx.close();
  }
  console.log(`\n${total ? '✗' : '✓'} total: ${total} problemas`); srv.close(); await b.close(); process.exit(total ? 1 : 0);
})();
