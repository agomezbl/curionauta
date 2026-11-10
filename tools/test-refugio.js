// Prueba de El Refugio 0.1 (dist/refugio/) en un Chromium real con WebGL por software: los tres retos tocando la escena.
// Uso: bash tools/montar.sh && node tools/test-refugio.js
const {chromium}=require('playwright');const fs=require('fs'),path=require('path'),http=require('http');
const ROOT=path.join(__dirname,'..','dist'),SH=path.join(__dirname,'..','shots','refugio');fs.mkdirSync(SH,{recursive:true});
const TIPOS={'.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.woff2':'font/woff2','.webmanifest':'application/manifest+json'};
const srv=http.createServer((q,r)=>{let f=path.join(ROOT,decodeURIComponent(q.url.split('?')[0]));try{if(fs.statSync(f).isDirectory())f=path.join(f,'index.html')}catch(e){}
  fs.readFile(f,(e,d)=>{if(e){r.writeHead(404);r.end();return}r.writeHead(200,{'Content-Type':TIPOS[path.extname(f)]||'text/html; charset=utf-8'});r.end(d)})}).listen(8781);
let fails=0,oks=0;const check=(c,m)=>{if(c){oks++;console.log('  ✓',m)}else{fails++;console.log('  ✗',m)}};
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{
 const b=await chromium.launch({args:['--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});
 async function nueva(vp,mobile){const ctx=await b.newContext({viewport:vp,hasTouch:!!mobile,isMobile:!!mobile,deviceScaleFactor:1});
  const p=await ctx.newPage();const errs=[];p.on('request',q=>{if(!q.url().startsWith('http://localhost:8781/')&&!q.url().startsWith('data:'))errs.push('llamada externa: '+q.url())});p.on('pageerror',e=>errs.push(e.message));p.on('console',m=>{if(m.type()==='error')errs.push(m.text())});
  await p.goto('http://localhost:8781/refugio/');await p.waitForFunction(()=>window.__REFUGIO&&!document.getElementById('loading'),null,{timeout:20000});await sleep(600);return {ctx,p,errs}}
 const scr=async(p,wp)=>p.evaluate(w=>{const R=window.__REFUGIO,cam=R.camera(),cv=document.getElementById('cv'),rc=cv.getBoundingClientRect();const v=w.clone?w.clone():new (Object.getPrototypeOf(R.compPos('banco')).constructor)(w.x,w.y,w.z);v.project(cam);return {x:rc.left+(v.x+1)/2*rc.width,y:rc.top+(1-v.y)/2*rc.height}},wp);
 const termXY=(p,id)=>p.evaluate(id=>{const R=window.__REFUGIO,cam=R.camera(),cv=document.getElementById('cv'),rc=cv.getBoundingClientRect();const v=R.termWorld(id).p.clone();v.project(cam);return {x:rc.left+(v.x+1)/2*rc.width,y:rc.top+(1-v.y)/2*rc.height}},id);
 const markXY=(p,id)=>p.evaluate(id=>{const R=window.__REFUGIO,cam=R.camera(),cv=document.getElementById('cv'),rc=cv.getBoundingClientRect();const v=R.markerPos(id);v.project(cam);return {x:rc.left+(v.x+1)/2*rc.width,y:rc.top+(1-v.y)/2*rc.height}},id);
 const compXY=(p,id)=>p.evaluate(id=>{const R=window.__REFUGIO,cam=R.camera(),cv=document.getElementById('cv'),rc=cv.getBoundingClientRect();const v=R.compPos(id);v.project(cam);return {x:rc.left+(v.x+1)/2*rc.width,y:rc.top+(1-v.y)/2*rc.height}},id);
 const cabXY=(p,id)=>p.evaluate(id=>{const R=window.__REFUGIO,cam=R.camera(),cv=document.getElementById('cv'),rc=cv.getBoundingClientRect();const v=R.cableMid(id).clone();v.project(cam);return {x:rc.left+(v.x+1)/2*rc.width,y:rc.top+(1-v.y)/2*rc.height}},id);
 const tap=async(p,xy)=>{await p.mouse.click(xy.x,xy.y);await sleep(120)};
 const tool=async(p,t)=>{await p.click(`.tool[data-tool="${t}"]`);await sleep(80)};
 const wire=async(p,a,b)=>{await tool(p,'cable');await tap(p,await termXY(p,a));await tap(p,await termXY(p,b))};
 const st=p=>p.evaluate(()=>{const R=window.__REFUGIO;R.solve();return {reto:R.S.reto,step:R.S.step,e:R.S.e,ledI:R.SOL.el.puerta?R.SOL.el.puerta.i:null,dead:R.S.placed.puerta&&R.S.placed.puerta.dead,cables:R.S.cables.length,inv:R.S.inv,time:R.S.time,wh:R.S.placed.banco&&R.S.placed.banco.wh}});
 const mentor=p=>p.textContent('#mentorTxt');

 console.log('Escritorio: los tres retos');
 {const {ctx,p,errs}=await nueva({width:1440,height:900});
  await p.screenshot({path:path.join(SH,'0-inicio.png')});
  // reto 1, paso 1: cálculo
  await p.fill('#ans','600');await p.click('#ansF button[type=submit]');await sleep(150);
  check(/12 V enteros/.test(await p.textContent('#fb')),'respuesta 600 → pista de los 12 V enteros');
  await p.fill('#ans','500');await p.click('#ansF button[type=submit]');await sleep(2100);
  let s=await st(p);check(s.reto===0&&s.step===1,'500 Ω correcto → paso de montar');
  // monta con 470 Ω: el LED sufre y se quema a los 3 s
  await tool(p,'montar');await p.click('#inv [data-k="r470"]');await sleep(100);await tap(p,await markXY(p,'c2'));
  s=await st(p);check(!s.inv.r470,'resistencia de 470 Ω colocada en el cuadro');
  await wire(p,'banco.a','c1.a');await wire(p,'c1.b','c2.a');await wire(p,'c2.b','puerta.a');await wire(p,'puerta.b','banco.b');
  s=await st(p);check(s.cables===4,'cuatro cables puestos tocando bornes');
  await tool(p,'montar');await tap(p,await compXY(p,'c1'));await sleep(300);
  s=await st(p);check(s.ledI>0.0205&&s.ledI<0.0215,`con 470 Ω pasan ${(s.ledI*1000).toFixed(1)} mA`);
  await p.screenshot({path:path.join(SH,'1-led-470.png')});
  await p.waitForFunction(()=>window.__REFUGIO.S.placed.puerta.dead,null,{timeout:12000}).catch(()=>{});s=await st(p);check(s.dead===true,'el LED se quema a los pocos segundos');check(/21 mA/.test(await mentor(p)),'Bitácora explica los mA ('+(await mentor(p)).slice(0,60)+'…)');
  await p.screenshot({path:path.join(SH,'2-led-quemado.png')});
  // cambia el LED tocándolo y pone 560 Ω
  await tool(p,'quitar');await tap(p,await compXY(p,'c2'));s=await st(p);check(s.cables===2&&s.inv.r470===1,'quitar la resistencia se lleva sus cables');
  await tool(p,'montar');await tap(p,await compXY(p,'puerta'));s=await st(p);check(!s.dead,'LED quemado cambiado tocándolo en Montar');await p.click('#inv [data-k="r560"]');await tap(p,await markXY(p,'c2'));
  await wire(p,'c1.b','c2.a');await wire(p,'c2.b','puerta.a');await p.waitForFunction(()=>window.__REFUGIO.S.reto===1,null,{timeout:12000}).catch(()=>{});
  s=await st(p);check(s.reto===1,'560 Ω → LED a '+(s.ledI*1000).toFixed(1)+' mA y reto 1 superado');
  check(await p.isVisible('#modal'),'ventana de reto superado');await p.screenshot({path:path.join(SH,'3-reto1.png')});
  await p.click('#mOk');await sleep(200);
  // reto 2
  await tool(p,'montar');await p.click('#inv [data-k="bulb"]');await tap(p,await markXY(p,'techo'));
  await wire(p,'techo.a','banco.a');await wire(p,'techo.b','banco.b');await p.waitForFunction(()=>window.__REFUGIO.S.step===1,null,{timeout:8000}).catch(()=>{});
  s=await st(p);check(s.step===1,'bombilla encendida → paso de cálculo');
  await p.fill('#ans','50');await p.click('#ansF button[type=submit]');await sleep(2000);
  await p.click('#reto [data-ch="0"]');await sleep(150);check(/50 Wh/.test(await p.textContent('#fb')),'«sí aguanta» → explica 50 Wh frente a 40 Wh');
  await p.click('#reto [data-ch="1"]');await sleep(1800);
  await p.click('#shop [data-buy="bat_l"]');await sleep(100);await tap(p,await markXY(p,'banco'));await p.waitForFunction(()=>window.__REFUGIO.S.step===4,null,{timeout:8000}).catch(()=>{});
  s=await st(p);check(s.step===4&&s.e===10,'batería grande comprada (30 ⚡) y colocada; quedan '+s.e+' ⚡');
  await p.click('#btnTime');await sleep(4500);await p.screenshot({path:path.join(SH,'4-noche.png')});
  await p.waitForFunction(()=>window.__REFUGIO.S.step===5,null,{timeout:40000}).catch(()=>{});
  s=await st(p);check(s.step===5,`la bombilla aguanta la noche (quedan ${Math.round(s.wh)} Wh)`);
  await tool(p,'montar');await p.click('#inv [data-k="panel"]');await tap(p,await markXY(p,'exterior'));
  await wire(p,'exterior.a','banco.a');await wire(p,'exterior.b','banco.b');
  await p.click('#btnTime');await sleep(5200);await p.screenshot({path:path.join(SH,'5-dia.png')});
  await p.waitForSelector('#modal:not([hidden])',{timeout:40000}).catch(()=>{});
  s=await st(p);check(s.reto===2,`la placa recarga la batería (${Math.round(s.wh)} Wh) → reto 2 superado`);
  await p.click('#mOk');await sleep(200);
  // reto 3
  await p.waitForFunction(()=>window.__REFUGIO.S.step===1,null,{timeout:8000}).catch(()=>{});s=await st(p);check(s.step===1,'la luz de emergencia sigue montada → tormenta');
  await p.click('#stormB');await sleep(1800);s=await st(p);
  const broken=await p.evaluate(()=>window.__REFUGIO.S.cables.find(c=>c.broken));check(!!broken&&s.step===2&&!(s.ledI>0.001),'un rayo corta un cable y el LED se apaga');
  await p.screenshot({path:path.join(SH,'6-tormenta.png')});
  await p.click('#meter [data-m="C"]');const ids=await p.evaluate(()=>window.__REFUGIO.S.cables.map(c=>c.id));
  for(const id of ids){await tap(p,await cabXY(p,id));if(await p.evaluate(()=>window.__REFUGIO.S.found))break}
  check(await p.evaluate(()=>window.__REFUGIO.S.found),'con continuidad encuentra el cable cortado (pantalla: '+(await p.textContent('#lcdVal'))+')');
  await p.screenshot({path:path.join(SH,'7-multimetro.png')});
  await sleep(300);await tool(p,'quitar');await tap(p,await cabXY(p,broken.id));
  await wire(p,broken.a,broken.b);await p.waitForSelector('#modal:not([hidden])',{timeout:10000}).catch(()=>{});
  s=await st(p);check(s.reto===3,'cable cambiado → reto 3 superado, '+s.e+' ⚡');
  await p.click('#mOk');await sleep(200);
  // modo libre: ventilador y cortocircuito
  await p.click('#shop [data-buy="fan"]');await tap(p,await markXY(p,'pared'));await wire(p,'pared.a','banco.a');await wire(p,'pared.b','banco.b');await sleep(300);
  const fan=await p.evaluate(()=>{const R=window.__REFUGIO;R.solve();return R.SOL.el.pared});check(fan&&Math.abs(fan.v)>11,'el ventilador recibe '+(fan?Math.abs(fan.v).toFixed(1):0)+' V');
  await wire(p,'banco.a','banco.b');await sleep(400);s=await st(p);check(/Cortocircuito|cortocircuito/.test(await p.textContent('#toast'))||/\+ y el −/.test(await mentor(p)),'un cortocircuito sin fusible quema el cable');
  await p.screenshot({path:path.join(SH,'8-libre.png')});
  // medir voltios en la batería
  await tool(p,'medir');await p.click('#meter [data-m="V"]');await tap(p,await termXY(p,'banco.a'));await tap(p,await termXY(p,'banco.b'));
  check(/^1[12]\.\d\d V$/.test(await p.textContent('#lcdVal')),'el multímetro marca '+(await p.textContent('#lcdVal'))+' en la batería');
  const ov=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));check(ov.sw<=ov.cw,'sin desbordar en horizontal');
  check(errs.length===0,'sin errores ('+errs.slice(0,3).join(' | ')+')');
  // persistencia
  await p.reload();await p.waitForFunction(()=>window.__REFUGIO&&!document.getElementById('loading'));await sleep(500);s=await st(p);check(s.reto===3&&s.cables>=8,'al recargar sigue todo como estaba');
  await ctx.close()}
 for(const [vp,mob,n] of [[{width:390,height:844},true,'movil'],[{width:820,height:1180},true,'tableta'],[{width:1180,height:820},true,'tableta-h']]){
  const {ctx,p,errs}=await nueva(vp,mob);await p.screenshot({path:path.join(SH,`9-${n}.png`)});
  const ov=await p.evaluate(()=>({sw:document.documentElement.scrollWidth,cw:document.documentElement.clientWidth}));
  await p.fill('#ans','500');await p.click('#ansF button[type=submit]');await sleep(2100);
  await p.click('.tool[data-tool="medir"]');await sleep(200);await p.screenshot({path:path.join(SH,`9-${n}-medir.png`)});
  check(ov.sw<=ov.cw&&errs.length===0,`${n}: sin desbordar ni errores ${errs.slice(0,2).join('|')}`);await ctx.close()}
 console.log(`\n${oks} bien, ${fails} mal`);srv.close();await b.close();process.exit(fails?1:0)})();
