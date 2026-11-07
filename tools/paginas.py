#!/usr/bin/env python3
"""Genera la web pública de Curionauta en español y en francés a partir de una sola plantilla.

    python3 tools/paginas.py

Escribe: site/index.html (ES), site/fr/index.html (FR),
         site/legal/privacidad.html (ES), site/fr/confidentialite.html (FR).
Los textos viven aquí; la Estación tiene los suyos en site/estacion/.
"""
import html, os

RAIZ = os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'site')
CORREO = 'contacto@curionauta.com'

E = lambda s: html.escape(s, quote=True)

TXT = {
 'es': {
  'lang': 'es', 'otro': 'fr', 'otroNombre': 'Français', 'otroUrl': '/fr/',
  'title': 'Curionauta · juegos de ciencia con un mentor que pregunta por qué',
  'desc': 'Juegos de electricidad, geometría y filosofía para chicos y chicas de 8 a 16 años, con un mentor que hace una sola pregunta al terminar y una familia que lee la respuesta. Sin anuncios.',
  'nav': [('#como', 'Cómo funciona'), ('#mundos', 'Los juegos'), ('#mentores', 'Los mentores'), ('#familias', 'Para familias')],
  'entrar': 'Entrar en la Estación',
  'h1': 'Aprender ciencia jugando, y pararse a pensar en lo aprendido.',
  'lead': 'Curionauta reúne juegos de electricidad, geometría y filosofía en una sola estación. Al volver de cada misión, un mentor hace una única pregunta. La familia lee la respuesta y la valora.',
  'cta2': 'Ver los juegos',
  'mapa': 'Mapa de Curionauta: la Estación en el centro y cuatro mundos alrededor',
  'como_h': 'Una misión, una pregunta, una conversación',
  'como_p': 'Los juegos enseñan. Lo que se queda es lo que uno es capaz de explicar con sus palabras.',
  'pasos': [
    ('Juega una misión', 'Circuitos que se encienden de verdad, triángulos que hay que demostrar, dilemas que no tienen respuesta fácil. Cada juego guarda su progreso en el aparato.'),
    ('El mentor pregunta por qué', 'Al volver a la Estación, el mentor ve qué has hecho y te hace una sola pregunta abierta. Contestarla es opcional; pensarla da puntos de bitácora.'),
    ('La familia lee y valora', 'Desde la zona de padres se lee la respuesta y se valora: 10, 25 o 50 puntos, o se devuelve con una nota para mejorarla. Nadie más la lee.'),
  ],
  'mundos_h': 'Los juegos',
  'mundos_p': 'Cada juego es un mundo con su historia, sus personajes y su temario. Se juegan en el móvil, la tableta o el ordenador, también sin conexión.',
  'cols': ('Juego', 'Qué se aprende', 'Edad', 'Idiomas'),
  'juegos': [
    ('Chrono-Ohm', '/juegos/chrono-ohm/', '#f2a65a', 'Electricidad viajando en el tiempo con Ampère, Ohm, Joule y Tesla: corriente, ley de Ohm, potencia, seguridad, redes y transporte de la energía. 68 misiones y una compañía eléctrica que gestionar.', '12–16', 'ES · FR'),
    ('La Expedición Pitágoras', '/juegos/pitagoras/', '#e8c26a', 'El teorema de Pitágoras, su recíproco, las raíces, el coseno y las distancias, en diez cámaras de un templo antiguo.', '12–15', 'ES · FR'),
    ('PhiloQuest', '/juegos/philoquest/', '#7ec8ff', 'Filosofía con Noctua, un mochuelo griego: Tales, Sócrates, Platón, Aristóteles y Diógenes, con un dilema en cada capítulo.', '8–13', 'ES · FR'),
    ('UMBRAL', '/juegos/umbral/', '#c79bff', 'Estrategia por turnos en una mazmorra en 3D: planificar, arriesgar o esperar, y aprender de cada derrota.', '12+', 'ES'),
  ],
  'jugar': 'Jugar',
  'ment_h': 'Cuatro mentores, una misma manera de acompañar',
  'ment_p': 'Cada niño elige el suyo y lo cambia cuando quiere. Todos siguen el mismo método: valorar el proceso antes que la velocidad, hacer una sola pregunta y no perseguir a nadie.',
  'fam_h': 'Lo que una familia necesita saber',
  'fam': [
    ('Sin anuncios ni compras dentro', 'No hay publicidad, ni monedas que comprar, ni nada que empuje a gastar.'),
    ('No persigue', 'Ni notificaciones ni rachas que castiguen. Si un día no se juega, no pasa nada.'),
    ('Datos mínimos, en Europa', 'Sin cuenta, todo se queda en el aparato. Con cuenta, las notas, el progreso y las reflexiones se guardan en un servidor de la Unión Europea, solo visibles para la familia.'),
    ('El adulto decide', 'Los enlaces del colegio, la validación de reflexiones y los ajustes del mentor están detrás de una clave de padre.'),
    ('Pensado para leer bien', 'Tipografía de alta legibilidad, textos cortos y una pregunta cada vez, para quien tiende a ir deprisa.'),
    ('Español y francés', 'Todos los textos de la Estación y de los mentores existen en los dos idiomas. El inglés llegará después.'),
  ],
  'cta_h': 'La Estación ya está abierta',
  'cta_p': 'Se usa desde el navegador y se instala como una app. Funciona sin cuenta en un solo aparato, o con la cuenta familiar en todos.',
  'privacidad': 'Privacidad', 'privUrl': '/legal/privacidad.html', 'contacto': 'Contacto',
  'pie': 'Curionauta es un proyecto familiar e independiente.',
 },
 'fr': {
  'lang': 'fr', 'otro': 'es', 'otroNombre': 'Español', 'otroUrl': '/',
  'title': 'Curionauta · des jeux de sciences avec un mentor qui demande pourquoi',
  'desc': 'Des jeux d’électricité, de géométrie et de philosophie pour les 8–16 ans, avec un mentor qui pose une seule question à la fin et une famille qui lit la réponse. Sans publicité.',
  'nav': [('#como', 'Comment ça marche'), ('#mundos', 'Les jeux'), ('#mentores', 'Les mentors'), ('#familias', 'Pour les familles')],
  'entrar': 'Entrer dans la Station',
  'h1': 'Apprendre les sciences en jouant, et prendre le temps de réfléchir à ce qu’on a appris.',
  'lead': 'Curionauta réunit des jeux d’électricité, de géométrie et de philosophie dans une seule station. Au retour de chaque mission, un mentor pose une seule question. La famille lit la réponse et la valide.',
  'cta2': 'Voir les jeux',
  'mapa': 'Carte de Curionauta : la Station au centre et quatre mondes autour',
  'como_h': 'Une mission, une question, une conversation',
  'como_p': 'Les jeux enseignent. Ce qui reste, c’est ce qu’on est capable d’expliquer avec ses propres mots.',
  'pasos': [
    ('Jouer une mission', 'Des circuits qui s’allument pour de vrai, des triangles à démontrer, des dilemmes sans réponse facile. Chaque jeu garde sa progression sur l’appareil.'),
    ('Le mentor demande pourquoi', 'De retour dans la Station, le mentor voit ce que tu as fait et te pose une seule question ouverte. Y répondre est facultatif ; y réfléchir rapporte des points de bord.'),
    ('La famille lit et valide', 'Depuis l’espace parents, on lit la réponse et on la valide : 10, 25 ou 50 points, ou on la renvoie avec une note pour l’améliorer. Personne d’autre ne la lit.'),
  ],
  'mundos_h': 'Les jeux',
  'mundos_p': 'Chaque jeu est un monde, avec son histoire, ses personnages et son programme. On y joue sur téléphone, tablette ou ordinateur, même hors connexion.',
  'cols': ('Jeu', 'Ce qu’on apprend', 'Âge', 'Langues'),
  'juegos': [
    ('Chrono-Ohm', '/juegos/chrono-ohm/', '#f2a65a', 'L’électricité en voyageant dans le temps avec Ampère, Ohm, Joule et Tesla : courant, loi d’Ohm, puissance, sécurité, réseaux et transport de l’énergie. 68 missions et une compagnie d’électricité à gérer.', '12–16', 'FR · ES'),
    ('La Expedición Pitágoras', '/juegos/pitagoras/', '#e8c26a', 'Le théorème de Pythagore, sa réciproque, les racines, le cosinus et les distances, dans les dix salles d’un temple antique.', '12–15', 'FR · ES'),
    ('PhiloQuest', '/juegos/philoquest/', '#7ec8ff', 'La philosophie avec Noctua, une chevêche grecque : Thalès, Socrate, Platon, Aristote et Diogène, avec un dilemme dans chaque chapitre.', '8–13', 'FR · ES'),
    ('UMBRAL', '/juegos/umbral/', '#c79bff', 'De la stratégie au tour par tour dans un donjon en 3D : planifier, prendre un risque ou attendre, et apprendre de chaque défaite.', '12+', 'ES'),
  ],
  'jugar': 'Jouer',
  'ment_h': 'Quatre mentors, une même façon d’accompagner',
  'ment_p': 'Chaque enfant choisit le sien et peut en changer quand il veut. Tous suivent la même méthode : valoriser la démarche plutôt que la vitesse, poser une seule question et ne jamais relancer.',
  'fam_h': 'Ce qu’une famille doit savoir',
  'fam': [
    ('Ni publicité ni achats intégrés', 'Pas de pub, pas de monnaie à acheter, rien qui pousse à dépenser.'),
    ('Aucune relance', 'Ni notifications, ni séries qui punissent. Si on ne joue pas un jour, ce n’est pas grave.'),
    ('Données minimales, en Europe', 'Sans compte, tout reste sur l’appareil. Avec un compte, les notes, la progression et les réflexions sont enregistrées sur un serveur dans l’Union européenne, visibles uniquement par la famille.'),
    ('L’adulte décide', 'Les liens du collège, la validation des réflexions et les réglages du mentor sont protégés par un code parent.'),
    ('Pensé pour bien lire', 'Une typographie très lisible, des textes courts et une question à la fois, pour ceux qui ont tendance à aller vite.'),
    ('Français et espagnol', 'Tous les textes de la Station et des mentors existent dans les deux langues. L’anglais arrivera plus tard.'),
  ],
  'cta_h': 'La Station est déjà ouverte',
  'cta_p': 'Elle s’utilise depuis le navigateur et s’installe comme une appli. Elle fonctionne sans compte sur un seul appareil, ou avec le compte familial sur tous.',
  'privacidad': 'Confidentialité', 'privUrl': '/fr/confidentialite.html', 'contacto': 'Contact',
  'pie': 'Curionauta est un projet familial et indépendant.',
 }
}

def mentores(lang):
    import json, re, subprocess
    src = open(os.path.join(RAIZ, 'estacion', 'mentores.js'), encoding='utf-8').read()
    js = src + ';process.stdout.write(JSON.stringify(window.CURIO_MENTORES))'
    out = subprocess.run(['node', '-e', 'globalThis.window={};' + js], capture_output=True, text=True, check=True).stdout
    return json.loads(out)

ICONOS = {  # los mismos instrumentos que en la Estación
 'bitacora': '<path d="M10 7h27v34H10z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M16 7v34" stroke="currentColor" stroke-width="3"/><path d="M21 16h11M21 22h11M21 28h7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
 'brujula': '<circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 11l5 13-5 13-5-13z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 11l5 13h-10z" fill="currentColor"/>',
 'astrolabio': '<circle cx="24" cy="26" r="16" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="26" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 4v6M20 6h8M10 26h28M14 16l20 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
 'faro': '<path d="M19 42l3-24h4l3 24z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><rect x="20" y="11" width="8" height="7" rx="2" fill="currentColor"/><path d="M17 13l-9-4M31 13l9-4M12 42h24" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>',
}

def mapa(t):
    """La carta de navegación del principio: la Estación y los cuatro mundos unidos por una ruta."""
    import random
    rnd = random.Random(7)
    estrellas = ''.join(f'<circle cx="{rnd.randint(8,552)}" cy="{rnd.randint(8,472)}" r="{rnd.choice([0.8,0.8,1.1,1.6])}" />' for _ in range(70))
    w = [(t['juegos'][0], 118, 120), (t['juegos'][1], 446, 104), (t['juegos'][2], 452, 372), (t['juegos'][3], 120, 380)]
    ruta = 'M118 120 C 210 40, 360 30, 446 104 S 560 300, 452 372 S 220 470, 120 380 S 20 190, 118 120'
    mundos = ''
    for (nombre, url, color, *_), x, y in w:
        lx = x + (34 if x < 280 else -34); anc = 'start' if x < 280 else 'end'
        mundos += (f'<a href="{E(url)}" class="mundo"><circle cx="{x}" cy="{y}" r="22" fill="{color}" fill-opacity=".16" stroke="{color}" stroke-width="2.5"/>'
                   f'<circle cx="{x}" cy="{y}" r="7" fill="{color}"/>'
                   f'<text x="{lx}" y="{y + 5}" text-anchor="{anc}">{E(nombre)}</text></a>')
    return f'''<svg class="mapa" viewBox="0 0 560 480" role="group" aria-label="{E(t['mapa'])}">
  <g class="estrellas" fill="#eef3fb" fill-opacity=".55">{estrellas}</g>
  <g fill="none" stroke="#2c4566" stroke-width="1"><circle cx="280" cy="240" r="90"/><circle cx="280" cy="240" r="160"/><circle cx="280" cy="240" r="230"/>
    <path d="M280 0v480M0 240h560" stroke-dasharray="2 6"/></g>
  <path id="ruta" d="{ruta}" fill="none" stroke="#d9a441" stroke-opacity=".75" stroke-width="2.2" stroke-linecap="round" stroke-dasharray="0.01 1.6" pathLength="100"/>
  <circle class="viajero" r="5" fill="#eef3fb"><animateMotion dur="14s" repeatCount="indefinite" rotate="auto"><mpath href="#ruta"/></animateMotion></circle>
  <g class="estacion"><circle cx="280" cy="240" r="38" fill="#13243a" stroke="#d9a441" stroke-width="3"/>
    <ellipse cx="280" cy="240" rx="62" ry="18" fill="none" stroke="#7fd1c7" stroke-width="2" transform="rotate(-20 280 240)"/>
    <circle cx="280" cy="240" r="12" fill="#d9a441"/><circle cx="334" cy="222" r="4.5" fill="#7fd1c7"/></g>
  {mundos}
</svg>'''

CSS = '''@font-face{font-family:"Unbounded";src:url(/fonts/unbounded-latin-600-normal.woff2) format("woff2");font-weight:600;font-display:swap}
@font-face{font-family:"Unbounded";src:url(/fonts/unbounded-latin-800-normal.woff2) format("woff2");font-weight:800;font-display:swap}
@font-face{font-family:"Atkinson Hyperlegible";src:url(/fonts/atkinson-hyperlegible-latin-400-normal.woff2) format("woff2");font-weight:400;font-display:swap}
@font-face{font-family:"Atkinson Hyperlegible";src:url(/fonts/atkinson-hyperlegible-latin-700-normal.woff2) format("woff2");font-weight:700;font-display:swap}
:root{--tinta:#0e1a2b;--hondo:#13243a;--carta:#2c4566;--laton:#d9a441;--vidrio:#7fd1c7;--luz:#eef3fb;--niebla:#a7b6cc;
 --disp:"Unbounded",system-ui,sans-serif;--txt:"Atkinson Hyperlegible",system-ui,-apple-system,"Segoe UI",sans-serif;color-scheme:dark}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--tinta);color:var(--luz);font:400 18px/1.6 var(--txt);-webkit-font-smoothing:antialiased}
a{color:var(--vidrio)}a:hover{color:var(--luz)}
:focus-visible{outline:3px solid var(--vidrio);outline-offset:3px;border-radius:4px}
.ancho{max-width:1160px;margin:0 auto;padding:0 20px}
.salto{position:absolute;left:-999px}.salto:focus{left:16px;top:12px;z-index:9;background:var(--luz);color:var(--tinta);padding:8px 12px}
header{border-bottom:1px solid var(--carta)}
.barra{display:flex;align-items:center;gap:18px;min-height:72px}
.marca{display:flex;align-items:center;gap:10px;color:var(--luz);text-decoration:none;font:800 20px var(--disp);letter-spacing:-.01em}
.marca svg{width:34px;height:34px}
.barra nav{display:flex;gap:22px;margin-left:auto}
.barra nav a{color:var(--niebla);text-decoration:none;font-size:16px}.barra nav a:hover{color:var(--luz)}
.idioma{color:var(--niebla);font-size:15px;text-decoration:none;border:1px solid var(--carta);border-radius:8px;padding:6px 10px}
.boton{display:inline-flex;align-items:center;justify-content:center;min-height:52px;padding:0 24px;border-radius:12px;font:700 17px var(--txt);text-decoration:none;border:2px solid var(--laton);color:var(--luz)}
.boton.lleno{background:var(--laton);color:#1a1205}.boton.lleno:hover{background:#e8b75a;color:#1a1205}.boton:hover{color:var(--luz);border-color:#e8b75a}
.barra .boton{min-height:44px;padding:0 16px;font-size:15px}
.portada{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1.05fr);gap:40px;align-items:center;padding-top:64px;padding-bottom:72px}
h1{font:800 clamp(32px,4.2vw,52px)/1.1 var(--disp);letter-spacing:-.025em;margin:0 0 22px;max-width:18ch}
.portada p{font-size:20px;color:var(--niebla);max-width:34em;margin:0 0 30px}
.acciones{display:flex;gap:12px;flex-wrap:wrap}
.mapa{width:100%;height:auto;display:block}
.mapa text{font:700 15px var(--txt);fill:var(--luz)}
.mapa .mundo:hover text,.mapa .mundo:focus text{fill:var(--laton)}
section{padding:72px 0;border-top:1px solid var(--carta)}
h2{font:600 clamp(26px,3vw,36px)/1.15 var(--disp);letter-spacing:-.015em;margin:0 0 14px;max-width:24ch}
.intro{color:var(--niebla);max-width:40em;margin:0 0 40px}
.pasos{list-style:none;padding:0;margin:0;display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:0;counter-reset:p;position:relative}
.pasos li{counter-increment:p;padding:0 28px 0 0;position:relative}
.pasos li::before{content:counter(p);display:grid;place-items:center;width:46px;height:46px;border-radius:50%;border:2px solid var(--laton);color:var(--laton);font:800 18px var(--disp);background:var(--tinta);position:relative;z-index:1}
.pasos::before{content:"";position:absolute;left:23px;right:20%;top:23px;border-top:2px dashed var(--carta)}
.pasos h3{font:700 20px var(--txt);margin:18px 0 6px}.pasos p{margin:0;color:var(--niebla)}
.tabla{width:100%;border-collapse:collapse}
.tabla th{text-align:left;font:700 14px var(--txt);color:var(--niebla);padding:0 16px 10px 0;border-bottom:1px solid var(--carta)}
.tabla td{padding:22px 16px 22px 0;border-bottom:1px solid var(--carta);vertical-align:top}
.tabla .nom{font:600 19px var(--disp);white-space:nowrap}.tabla .nom i{display:inline-block;width:12px;height:12px;border-radius:50%;margin-right:10px;vertical-align:1px}
.tabla .que{color:var(--niebla);max-width:36em}.tabla .dato{white-space:nowrap;color:var(--luz)}
.tabla a.jugar{font-weight:700;white-space:nowrap}
.mentores{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:28px}
.mentor svg{width:56px;height:56px}
.mentor h3{font:600 20px var(--disp);margin:12px 0 2px}.mentor .rol{color:var(--niebla);font-size:15px;margin:0 0 10px}
.mentor blockquote{margin:0;padding-left:14px;border-left:2px solid currentColor;color:var(--luz);font-size:16px}
.principios{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:30px 56px;margin:0}
.principios dt{font:700 19px var(--txt);margin:0 0 4px}.principios dd{margin:0;color:var(--niebla)}
.final{display:flex;justify-content:space-between;align-items:center;gap:30px;flex-wrap:wrap}
.final p{color:var(--niebla);max-width:36em;margin:0}
footer{border-top:1px solid var(--carta);padding:28px 0 40px;color:var(--niebla);font-size:15px}
footer .ancho{display:flex;gap:20px;flex-wrap:wrap;align-items:center}footer .der{margin-left:auto;display:flex;gap:18px}
.legal{max-width:760px;padding:48px 0 64px}.legal h1{font-size:clamp(30px,4vw,42px);max-width:none}.legal h2{font-size:22px;margin-top:36px}
.legal p,.legal li{color:var(--niebla)}.legal strong{color:var(--luz)}
@media (max-width:900px){.portada{grid-template-columns:1fr;padding-top:40px;padding-bottom:48px}.barra nav{display:none}.pasos{grid-template-columns:1fr;gap:28px}.pasos::before{display:none}
 .mentores{grid-template-columns:1fr 1fr}.principios{grid-template-columns:1fr}
 .tabla thead{display:none}.tabla tr{display:block;padding:18px 0;border-bottom:1px solid var(--carta)}.tabla td{display:block;border:0;padding:4px 0}.tabla .dato{display:inline-block;margin-right:16px}}
@media (max-width:520px){body{font-size:17px}.mentores{grid-template-columns:1fr}.barra{gap:10px}.barra .boton{display:none}.portada p{font-size:18px}}
@media (prefers-reduced-motion:reduce){.viajero{display:none}html{scroll-behavior:auto}}
'''

LOGO = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="29" fill="#13243a" stroke="#d9a441" stroke-width="4"/><ellipse cx="32" cy="32" rx="25" ry="9" fill="none" stroke="#7fd1c7" stroke-width="2.5" transform="rotate(-24 32 32)"/><circle cx="32" cy="32" r="10" fill="#d9a441"/><circle cx="51" cy="22" r="4" fill="#7fd1c7"/></svg>'

def cabecera(t, canon, alt_es, alt_fr, titulo=None, desc=None):
    return f'''<!doctype html>
<html lang="{t['lang']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{E(titulo or t['title'])}</title>
<meta name="description" content="{E(desc or t['desc'])}">
<link rel="canonical" href="https://curionauta.com{canon}">
<link rel="alternate" hreflang="es" href="https://curionauta.com{alt_es}">
<link rel="alternate" hreflang="fr" href="https://curionauta.com{alt_fr}">
<link rel="alternate" hreflang="x-default" href="https://curionauta.com{alt_es}">
<meta property="og:title" content="{E(titulo or t['title'])}">
<meta property="og:description" content="{E(desc or t['desc'])}">
<meta property="og:type" content="website">
<meta name="theme-color" content="#0e1a2b">
<link rel="icon" href="/estacion/icon-192.png">
<link rel="preload" href="/fonts/unbounded-latin-800-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/estilo.css">
</head>
<body>
<a class="salto" href="#contenido">{'Saltar al contenido' if t['lang']=='es' else 'Aller au contenu'}</a>
<header><div class="ancho barra">
  <a class="marca" href="{'/' if t['lang']=='es' else '/fr/'}">{LOGO}Curionauta</a>
  <nav aria-label="{'Secciones' if t['lang']=='es' else 'Sections'}">{''.join(f'<a href="{"/" if t["lang"]=="es" else "/fr/"}{h}">{E(x)}</a>' for h,x in t['nav'])}</nav>
  <a class="idioma" href="{alt_fr if t['lang']=='es' else alt_es}" hreflang="{t['otro']}" lang="{t['otro']}">{t['otroNombre']}</a>
  <a class="boton" href="/estacion/">{E(t['entrar'])}</a>
</div></header>
'''

def pie(t):
    return f'''<footer><div class="ancho"><span>© 2026 Curionauta. {E(t['pie'])}</span>
<span class="der"><a href="{t['privUrl']}">{E(t['privacidad'])}</a><a href="mailto:{CORREO}">{E(t['contacto'])}</a></span></div></footer>
</body>
</html>
'''

def portada(lang):
    t = TXT[lang]; men = mentores(lang)
    tt = lambda o: o.get(lang) or o.get('es')
    filas = ''.join(f'''<tr><td class="nom"><i style="background:{c}"></i>{E(n)}</td><td class="que">{E(q)}</td><td class="dato">{E(edad)}</td><td class="dato">{E(idi)}</td><td><a class="jugar" href="{E(u)}">{E(t['jugar'])}<span class="salto"> {E(n)}</span></a></td></tr>'''
                    for n, u, c, q, edad, idi in t['juegos'])
    mentores_html = ''.join(f'''<article class="mentor" style="color:{men['M'][m]['color']}"><svg viewBox="0 0 48 48" aria-hidden="true">{ICONOS[m]}</svg>
<h3 style="color:var(--luz)">{E(tt(men['M'][m]['nombre']))}</h3><p class="rol">{E(tt(men['M'][m]['rol']))}</p><blockquote>{E(tt(men['M'][m]['presenta']))}</blockquote></article>'''
                            for m in men['ORDEN'])
    pasos = ''.join(f'<li><h3>{E(h)}</h3><p>{E(p)}</p></li>' for h, p in t['pasos'])
    fam = ''.join(f'<div><dt>{E(h)}</dt><dd>{E(p)}</dd></div>' for h, p in t['fam'])
    return cabecera(t, '/' if lang == 'es' else '/fr/', '/', '/fr/') + f'''<main id="contenido">
<div class="ancho portada">
  <div><h1>{E(t['h1'])}</h1><p>{E(t['lead'])}</p>
  <div class="acciones"><a class="boton lleno" href="/estacion/">{E(t['entrar'])}</a><a class="boton" href="#mundos">{E(t['cta2'])}</a></div></div>
  {mapa(t)}
</div>
<section id="como"><div class="ancho"><h2>{E(t['como_h'])}</h2><p class="intro">{E(t['como_p'])}</p><ol class="pasos">{pasos}</ol></div></section>
<section id="mundos"><div class="ancho"><h2>{E(t['mundos_h'])}</h2><p class="intro">{E(t['mundos_p'])}</p>
<table class="tabla"><thead><tr>{''.join(f'<th scope="col">{E(c)}</th>' for c in t['cols'])}<th><span class="salto">{E(t['jugar'])}</span></th></tr></thead><tbody>{filas}</tbody></table></div></section>
<section id="mentores"><div class="ancho"><h2>{E(t['ment_h'])}</h2><p class="intro">{E(t['ment_p'])}</p><div class="mentores">{mentores_html}</div></div></section>
<section id="familias"><div class="ancho"><h2>{E(t['fam_h'])}</h2><dl class="principios">{fam}</dl></div></section>
<section><div class="ancho final"><div><h2>{E(t['cta_h'])}</h2><p>{E(t['cta_p'])}</p></div><a class="boton lleno" href="/estacion/">{E(t['entrar'])}</a></div></section>
</main>
''' + pie(t)

PRIV = {
 'es': ('Privacidad', 'Qué datos guarda Curionauta, dónde y para qué.', [
  ('En pocas palabras', ['Curionauta no tiene publicidad, no vende datos y no usa herramientas de seguimiento ni de estadísticas. Solo guarda lo necesario para que la Estación y los juegos funcionen, y la familia puede pedir que se borre todo.']),
  ('Sin cuenta', ['Los juegos y la Estación guardan el progreso, las notas y las reflexiones <strong>solo en el navegador del aparato</strong> (almacenamiento local). No se envía nada a ningún servidor. Borrar los datos del navegador lo borra todo.']),
  ('Con la cuenta familiar', ['Al entrar con la cuenta de la familia se guardan en un servidor de <strong>Supabase situado en la Unión Europea (Irlanda)</strong>:',
     '<ul><li>el correo y la contraseña cifrada de la cuenta;</li><li>las notas, los recordatorios y los enlaces del colegio que se escriban en la Estación;</li><li>un resumen del progreso de cada juego (puntos, misiones, medallas);</li><li>las reflexiones escritas en el cuaderno de vuelo, con la valoración y la nota del adulto.</li></ul>',
     'Cada niño solo ve lo suyo. El adulto de la familia ve lo de sus hijos. Nadie más tiene acceso, y las reglas de la base de datos lo impiden aunque alguien lo intentara desde fuera.']),
  ('Para qué se usan', ['Exclusivamente para mostrar esos datos a la propia familia y sincronizarlos entre sus aparatos. No se usan para publicidad, perfiles comerciales ni entrenamiento de inteligencia artificial.']),
  ('Menores', ['Las cuentas las crea el adulto responsable, que es quien acepta el uso de la cuenta en nombre del menor y quien puede revisar, corregir o borrar sus datos.']),
  ('Alojamiento', ['La web se sirve a través de Cloudflare, que como cualquier servidor web procesa la dirección IP para entregar las páginas y protegerlas de ataques. Los tipos de letra van alojados en la propia web: no se llama a servicios de terceros al cargarla.']),
  ('Borrar o descargar los datos', [f'Escribe a <a href="mailto:{CORREO}">{CORREO}</a> desde el correo de la cuenta familiar y se te enviará una copia o se borrará todo en un plazo máximo de 30 días.']),
  ('Cambios', ['Si esta página cambia, la fecha de abajo lo indicará. Última actualización: noviembre de 2026.']),
 ]),
 'fr': ('Confidentialité', 'Quelles données Curionauta enregistre, où et pourquoi.', [
  ('En bref', ['Curionauta n’a pas de publicité, ne vend aucune donnée et n’utilise aucun outil de suivi ni de statistiques. Il n’enregistre que le nécessaire au fonctionnement de la Station et des jeux, et la famille peut demander que tout soit supprimé.']),
  ('Sans compte', ['Les jeux et la Station enregistrent la progression, les notes et les réflexions <strong>uniquement dans le navigateur de l’appareil</strong> (stockage local). Rien n’est envoyé à un serveur. Effacer les données du navigateur efface tout.']),
  ('Avec le compte familial', ['En se connectant avec le compte de la famille, sont enregistrés sur un serveur <strong>Supabase situé dans l’Union européenne (Irlande)</strong> :',
     '<ul><li>l’e-mail et le mot de passe chiffré du compte ;</li><li>les notes, rappels et liens du collège écrits dans la Station ;</li><li>un résumé de la progression de chaque jeu (points, missions, médailles) ;</li><li>les réflexions écrites dans le carnet de bord, avec la validation et la note de l’adulte.</li></ul>',
     'Chaque enfant ne voit que ce qui le concerne. L’adulte de la famille voit ce qui concerne ses enfants. Personne d’autre n’y a accès, et les règles de la base de données l’empêchent même en cas de tentative extérieure.']),
  ('À quoi elles servent', ['Uniquement à montrer ces données à la famille elle-même et à les synchroniser entre ses appareils. Elles ne servent ni à la publicité, ni au profilage commercial, ni à l’entraînement d’intelligences artificielles.']),
  ('Mineurs', ['Les comptes sont créés par l’adulte responsable, qui accepte l’utilisation du compte au nom du mineur et peut consulter, corriger ou supprimer ses données.']),
  ('Hébergement', ['Le site est servi via Cloudflare, qui, comme tout serveur web, traite l’adresse IP pour délivrer les pages et les protéger des attaques. Les polices de caractères sont hébergées sur le site lui-même : aucun service tiers n’est appelé au chargement.']),
  ('Supprimer ou télécharger ses données', [f'Écrivez à <a href="mailto:{CORREO}">{CORREO}</a> depuis l’e-mail du compte familial : une copie vous sera envoyée ou tout sera supprimé sous 30 jours maximum.']),
  ('Modifications', ['Si cette page change, la date ci-dessous l’indiquera. Dernière mise à jour : novembre 2026.']),
 ])}

def privacidad(lang):
    t = TXT[lang]; titulo, desc, secs = PRIV[lang]
    cuerpo = ''.join(f'<h2>{E(h)}</h2>' + ''.join(p if p.startswith('<ul') else f'<p>{p}</p>' for p in ps) for h, ps in secs)
    canon = '/legal/privacidad.html' if lang == 'es' else '/fr/confidentialite.html'
    return cabecera(t, canon, '/legal/privacidad.html', '/fr/confidentialite.html', f'{titulo} · Curionauta', desc) + \
        f'<main id="contenido" class="ancho"><article class="legal"><h1>{E(titulo)}</h1><p>{E(desc)}</p>{cuerpo}</article></main>\n' + pie(t)

def escribe(ruta, texto):
    ruta = os.path.join(RAIZ, ruta); os.makedirs(os.path.dirname(ruta), exist_ok=True)
    open(ruta, 'w', encoding='utf-8').write(texto); print('  ', os.path.relpath(ruta, RAIZ), len(texto), 'bytes')

if __name__ == '__main__':
    escribe('estilo.css', CSS)
    escribe('index.html', portada('es'))
    escribe('fr/index.html', portada('fr'))
    escribe('legal/privacidad.html', privacidad('es'))
    escribe('fr/confidentialite.html', privacidad('fr'))
