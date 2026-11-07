/* Curionauta · pestaña «Estación» en todos los juegos.
   Se añade al montar la web (tools/montar.sh), sin tocar el código de cada juego.
   Es una pestaña pequeña pegada al borde izquierdo: no tapa el juego y lleva a la Estación,
   donde el mentor comenta lo que se acaba de hacer. Va dentro de un Shadow DOM para que
   ni los estilos del juego la cambien ni ella cambie los del juego. */
(function () {
  if (window.__curioVolver) return; window.__curioVolver = 1;
  var lang = 'es';
  try { var e = JSON.parse(localStorage.getItem('estacion-nil-v1') || '{}'); if (e.lang === 'fr') lang = 'fr'; } catch (x) {}
  var txt = lang === 'fr' ? 'Retour à la Station' : 'Volver a la Estación';
  var host = document.createElement('div'); host.setAttribute('data-curionauta', 'volver');
  var root = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
  root.innerHTML = '<style>' +
    ':host{all:initial}' +
    'a{position:fixed;left:0;top:38%;z-index:2147483000;display:flex;align-items:center;gap:8px;height:52px;padding:0 10px 0 6px;' +
    'border-radius:0 16px 16px 0;background:rgba(19,36,58,.82);border:1px solid rgba(217,164,65,.7);border-left:0;color:#eef3fb;' +
    'font:700 14px "Atkinson Hyperlegible",system-ui,sans-serif;text-decoration:none;box-shadow:0 6px 18px rgba(0,0,0,.35);' +
    'transform:translateX(calc(-100% + 28px));opacity:.88;transition:transform .25s ease;-webkit-tap-highlight-color:transparent}' +
    'a:hover,a:focus-visible{transform:none;opacity:1;outline:none}a:focus-visible{box-shadow:0 0 0 3px #7fd1c7}' +
    'svg{width:22px;height:22px;flex:none;order:2}span{order:1;white-space:nowrap}' +
    '@media (prefers-reduced-motion:reduce){a{transition:none}}' +
    '@media print{a{display:none}}' +
    '</style><a href="/estacion/" aria-label="' + txt + '" title="' + txt + '"><span>' + txt + '</span>' +
    '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="none" stroke="#d9a441" stroke-width="2"/>' +
    '<ellipse cx="12" cy="12" rx="10" ry="3.5" fill="none" stroke="#7fd1c7" stroke-width="1.6" transform="rotate(-24 12 12)"/>' +
    '<circle cx="12" cy="12" r="3.5" fill="#d9a441"/></svg></a>';
  var add = function () { document.body && document.body.appendChild(host); };
  if (document.body) add(); else document.addEventListener('DOMContentLoaded', add);
})();
