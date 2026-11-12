/* =====================================================================
   Curionaut · la Estación
   Panel del niño en cinco pantallas: Inicio (mentor, novedades, horario,
   colegio, Rutinator, notas), Juegos, Monedero (Energía, Cristales, mercado
   y hucha), Pasaporte (saberes y títulos) y Yo (avatar y fondos).
   Las reglas de los puntos están en economia.js; los dibujos, en arte.js.
   Español y francés. Sin cuenta funciona en el aparato; con la cuenta
   de Rutinator (Supabase) se comparte entre aparatos y con el padre.
   ===================================================================== */
(function () {
'use strict';
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const CFG = Object.assign({ supabaseUrl: '', supabaseKey: '', rutinatorUrl: '../rutinator/', oldUrl: 'https://agomezbl.github.io/estacion-nil/' }, window.ESTACION || {});
const MEN = window.CURIO_MENTORES, ECO = window.CURIO_ECO, ARTE = window.CURIO_ARTE;
const KEY = 'estacion-nil-v1';          // se mantiene: así la mudanza desde la Estación antigua es directa
const uid = () => (crypto.randomUUID ? crypto.randomUUID() : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2));
const ymd = d => { const z = new Date(d.getTime() - d.getTimezoneOffset() * 6e4); return z.toISOString().slice(0, 10); };
const addDays = (d, n) => { const x = new Date(d); x.setDate(x.getDate() + n); return x; };

/* ---------------- estado guardado en este aparato ---------------- */
const DEF = { mode: '', device: uid(), links: null, notes: [], localPin: '', cache: {}, pending: [],
  lang: '', mentor: '', seen: {}, bita: [], qi: {}, refl: [], shown: {}, mentorOff: false, hist: {},
  /* monedero: libro de puntos (cada apunte {k, e, c, g, at} con clave única), multiplicador del padre y oferta del día */
  led: [], mult: 1, ecoAt: 0, oferta: null,
  /* yo: avatar por piezas, fondo, títulos que luce (hasta tres), género de los títulos y cuándo ganó cada uno */
  av: null, fondo: 'orbita', tit: [], gen: 'n', titAt: {}, childName: '' };
let S; try { S = Object.assign({}, DEF, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { S = Object.assign({}, DEF); }
['seen', 'qi', 'shown', 'cache', 'hist', 'titAt', 'mias'].forEach(k => { if (!S[k] || typeof S[k] !== 'object') S[k] = {}; });
['bita', 'refl', 'notes', 'pending', 'led', 'tit'].forEach(k => { if (!Array.isArray(S[k])) S[k] = []; });
S.led = S.led.filter(x => x && typeof x.k === 'string'); S.av = ARTE.limpia(S.av);
if (![0.5, 0.75, 1, 1.5, 2].includes(S.mult)) S.mult = 1;
/* reflexiones escritas en ESTE aparato: solo esas se pagan aquí (el monedero va por aparato y las reflexiones están en la nube;
   sin esto, el móvil y la tableta pagarían las dos la misma). Al estrenar la regla, cuentan como propias las ya pagadas aquí. */
if (!S.miasOk) { S.led.forEach(x => { if (/^refl:/.test(x.k)) S.mias[x.k.slice(5)] = 1; }); S.miasOk = 1; }
if (!ARTE.FONDOS.some(f => f.id === S.fondo)) S.fondo = 'orbita';
if (!['m', 'f', 'n'].includes(S.gen)) S.gen = 'n';
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} };

/* ---------------- idioma ---------------- */
if (S.lang !== 'es' && S.lang !== 'fr') { let n = ''; try { n = (navigator.languages && navigator.languages[0]) || navigator.language || ''; } catch (e) {} S.lang = /^fr/i.test(n) ? 'fr' : 'es'; }
save();
let L = S.lang;
const LOC = () => (L === 'fr' ? 'fr-FR' : 'es-ES');
const I = {
  'app.name': ['Curionaut', 'Curionaut'],
  'login.lead': ['Entra con tu cuenta y tendrás lo mismo en el móvil y en la tableta.', 'Connecte-toi avec ton compte et tu retrouveras tout sur le téléphone et la tablette.'],
  'login.mail': ['Correo', 'E-mail'], 'login.pass': ['Contraseña', 'Mot de passe'],
  'login.local': ['Usar sin cuenta', 'Utiliser sans compte'], 'login.go': ['Entrar', 'Se connecter'],
  'login.empty': ['Escribe el correo y la contraseña.', 'Écris ton e-mail et ton mot de passe.'],
  'login.wait': ['Entrando…', 'Connexion…'],
  'login.net': ['No hay conexión. Prueba otra vez o usa la Estación sin cuenta.', 'Pas de connexion. Réessaie ou utilise la Station sans compte.'],
  'login.bad': ['Correo o contraseña incorrectos.', 'E-mail ou mot de passe incorrect.'],
  'login.nofam': ['Esta cuenta no pertenece a ninguna familia.', 'Ce compte n’appartient à aucune famille.'],
  'lang.switch': ['Version française', 'Versión en español'],
  'card.today': ['Hoy', 'Aujourd’hui'], 'card.school': ['Colegio', 'Collège'], 'card.notes': ['Notas y recordatorios', 'Notes et rappels'],
  'card.games': ['Mis juegos', 'Mes jeux'], 'mentor.card': ['Cuaderno de vuelo', 'Carnet de bord'], 'mentor.book': ['Mi cuaderno', 'Mon carnet'],
  'nav.inicio': ['Inicio', 'Accueil'], 'nav.juegos': ['Juegos', 'Jeux'], 'nav.monedero': ['Monedero', 'Bourse'], 'nav.pasaporte': ['Pasaporte', 'Passeport'], 'nav.yo': ['Yo', 'Moi'],
  'nav.label': ['Pantallas de la Estación', 'Écrans de la Station'], 'card.new': ['Novedades', 'Nouveautés'],
  'hi.morning': ['Buenos días', 'Bonjour'], 'hi.afternoon': ['Buenas tardes', 'Bonjour'], 'hi.night': ['Buenas noches', 'Bonsoir'],
  'notes.add': ['Añadir', 'Ajouter'], 'notes.ph': ['Escribe una nota o un recordatorio…', 'Écris une note ou un rappel…'],
  'notes.empty': ['Aquí puedes apuntar deberes, exámenes o lo que no quieras olvidar.', 'Ici, tu peux noter tes devoirs, tes contrôles ou ce que tu ne veux pas oublier.'],
  'notes.del': ['Nota borrada', 'Note supprimée'], 'notes.done': ['Hecho', 'Fait'], 'notes.undo': ['Desmarcar', 'Décocher'], 'notes.delete': ['Borrar', 'Supprimer'],
  'due.none': ['Sin fecha', 'Sans date'], 'due.today': ['Hoy', 'Aujourd’hui'], 'due.tomorrow': ['Mañana', 'Demain'], 'due.yesterday': ['ayer', 'hier'],
  'due.today.s': ['hoy', 'aujourd’hui'], 'due.tomorrow.s': ['mañana', 'demain'], 'due.other': ['Otra fecha', 'Autre date'], 'due.group': ['Para cuándo', 'Pour quand'],
  'links.edit': ['Editar', 'Modifier'], 'links.done': ['Hecho', 'Terminé'], 'links.missing': ['Falta el enlace', 'Lien manquant'],
  'links.add': ['Añadir enlace', 'Ajouter un lien'], 'links.new': ['Nuevo enlace', 'Nouveau lien'], 'links.editT': ['Editar enlace', 'Modifier le lien'],
  'links.safe': ['Solo enlaces seguros (que empiezan por https://).', 'Uniquement des liens sécurisés (qui commencent par https://).'],
  'links.name': ['Nombre', 'Nom'], 'links.url': ['Dirección', 'Adresse'],
  'links.pronote': ['La dirección de Pronote es la del colegio: ábrelo una vez en el navegador, entra hasta la página de inicio de sesión y copia la dirección de arriba.', 'L’adresse de Pronote est celle du collège : ouvre-le une fois dans le navigateur, va jusqu’à la page de connexion et copie l’adresse en haut.'],
  'links.noname': ['Ponle un nombre.', 'Donne-lui un nom.'], 'links.badurl': ['La dirección debe empezar por https://', 'L’adresse doit commencer par https://'],
  'links.remove': ['¿Quitar «{x}»?', 'Retirer « {x} » ?'], 'links.removeA': ['Quitar', 'Retirer'],
  'btn.cancel': ['Cancelar', 'Annuler'], 'btn.save': ['Guardar', 'Enregistrer'], 'btn.close': ['Cerrar', 'Fermer'], 'btn.ok': ['Entendido', 'Compris'],
  'pin.title': ['Clave de padre', 'Code parent'], 'pin.local1': ['Elige una clave para la zona de padres en este aparato.', 'Choisis un code pour l’espace parents sur cet appareil.'],
  'pin.local': ['Escribe la clave de este aparato.', 'Écris le code de cet appareil.'], 'pin.cloud': ['La misma clave del panel de padre de Rutinator.', 'Le même code que l’espace parent de Rutinator.'],
  'pin.label': ['Clave', 'Code'], 'pin.enter': ['Entrar', 'Entrer'], 'pin.short': ['Al menos 4 caracteres.', 'Au moins 4 caractères.'],
  'pin.wrong': ['No es esa clave.', 'Ce n’est pas le bon code.'], 'pin.wait': ['Demasiados intentos. Espera un poco.', 'Trop d’essais. Attends un peu.'],
  'pin.net': ['No he podido comprobarla. ¿Hay conexión?', 'Impossible de vérifier. Y a-t-il une connexion ?'],
  'rut.login': ['Entra con tu cuenta para ver tus tareas y créditos.', 'Connecte-toi pour voir tes tâches et tes crédits.'],
  'rut.noconn': ['Rutinator aparecerá aquí cuando la Estación esté conectada con su cuenta.', 'Rutinator apparaîtra ici quand la Station sera connectée à son compte.'],
  'rut.none': ['Cuando uses Rutinator en este aparato, aquí verás tus tareas de hoy, tus créditos y tu hucha.', 'Quand tu utiliseras Rutinator sur cet appareil, tu verras ici tes tâches du jour, tes crédits et ta tirelire.'],
  'rut.hucha': ['{n} en la hucha', '{n} dans la tirelire'],
  'rut.open': ['Abrir Rutinator', 'Ouvrir Rutinator'], 'rut.tasks': ['{a} de {b} tareas hoy', '{a} tâches sur {b} aujourd’hui'],
  'rut.credits': ['créditos', 'crédits'], 'rut.stars': ['estrellas', 'étoiles'],
  'hoy.until': ['hasta las {h}', 'jusqu’à {h}'], 'hoy.then': ['luego {x}', 'ensuite {x}'], 'hoy.end': ['y se acabó por hoy', 'et c’est fini pour aujourd’hui'],
  'hoy.next': ['Próxima: {x}', 'Prochain cours : {x}'], 'hoy.at': ['a las {h}', 'à {h}'], 'hoy.free': ['Sin clases ahora', 'Pas de cours maintenant'],
  'hoy.freeS': ['El resto del día es tuyo.', 'Le reste de la journée est à toi.'], 'hoy.login': ['Entra con tu cuenta para ver aquí tu horario y tu agenda.', 'Connecte-toi pour voir ici ton emploi du temps et ton agenda.'],
  'hoy.empty': ['Nada en la agenda esta semana.', 'Rien dans l’agenda cette semaine.'],
  'games.play': ['Seguir jugando', 'Continuer'], 'games.start': ['Empezar', 'Commencer'], 'games.none': ['Aún sin empezar', 'Pas encore commencé'],
  'games.progress': ['Progreso', 'Progression'], 'games.inprog': ['Partida en curso', 'Partie en cours'], 'games.started': ['Empezado', 'Commencé'],
  'lvl.title': ['Nivel de la Estación', 'Niveau de la Station'], 'lvl.text': ['{xp} XP · nivel {n}', '{xp} XP · niveau {n}'],
  'foot.cloud': ['Conectada a tu cuenta', 'Connectée à ton compte'], 'foot.local': ['Solo en este aparato', 'Uniquement sur cet appareil'], 'foot.upd': ['actualizada {h}', 'mise à jour {h}'],
  'sync.local': ['Solo en este aparato', 'Uniquement sur cet appareil'], 'sync.busy': ['Sincronizando…', 'Synchronisation…'], 'sync.ok': ['Sincronizado', 'Synchronisé'],
  'sync.wait': ['Cambios esperando conexión', 'Modifications en attente de connexion'], 'sync.off': ['Sin conexión: mostrando lo último guardado', 'Pas de connexion : dernière version enregistrée'],
  'sync.later': ['Sin conexión: se enviará más tarde', 'Pas de connexion : envoi plus tard'], 'sync.offline': ['Sin conexión', 'Pas de connexion'],
  'set.title': ['Ajustes', 'Réglages'], 'set.lang': ['Idioma', 'Langue'], 'set.mentor': ['Mi mentor', 'Mon mentor'], 'set.change': ['Cambiar de mentor', 'Changer de mentor'],
  'set.account': ['Cuenta', 'Compte'], 'set.cloud': ['Conectada con la cuenta de <b>{x}</b>. Las notas, los enlaces, el progreso y el cuaderno se comparten entre tus aparatos.', 'Connectée au compte de <b>{x}</b>. Les notes, les liens, la progression et le carnet sont partagés entre tes appareils.'],
  'set.localA': ['Estás usando la Estación sin cuenta: todo se guarda solo en este aparato.', 'Tu utilises la Station sans compte : tout est enregistré uniquement sur cet appareil.'],
  'set.noconn': ['Esta Estación todavía no está conectada: todo se guarda en este aparato.', 'Cette Station n’est pas encore connectée : tout est enregistré sur cet appareil.'],
  'set.sync': ['Sincronizar ahora', 'Synchroniser'], 'set.out': ['Salir de la cuenta', 'Se déconnecter'], 'set.in': ['Entrar con la cuenta', 'Se connecter'],
  'set.install': ['Instalar como app', 'Installer l’appli'], 'set.parents': ['Zona de padres', 'Espace parents'],
  'set.about': ['Curionaut · Estación v3.0 · Sin publicidad. Lo que escribes solo lo ves tú (y tu familia, si entras con tu cuenta).', 'Curionaut · Station v3.0 · Sans publicité. Ce que tu écris, toi seul le vois (et ta famille, si tu te connectes).'],
  'set.privacy': ['Privacidad', 'Confidentialité'],
  'inst.title': ['Instalar como app', 'Installer l’appli'], 'inst.ios': ['<b>iPhone o iPad (Safari):</b> botón Compartir ⬆️ → «Añadir a pantalla de inicio».', '<b>iPhone ou iPad (Safari) :</b> bouton Partager ⬆️ → « Sur l’écran d’accueil ».'],
  'inst.and': ['<b>Android (Chrome):</b> menú ⋮ → «Instalar aplicación» o «Añadir a pantalla de inicio».', '<b>Android (Chrome) :</b> menu ⋮ → « Installer l’application » ou « Ajouter à l’écran d’accueil ».'],
  'syncing': ['Sincronizando…', 'Synchronisation…'],
  /* mentor y cuaderno */
  'm.choose': ['Elige tu mentor', 'Choisis ton mentor'], 'm.chooseLead': ['Te acompañará en la Estación. Todos ayudan igual de bien: cambia solo la manera de hablar. Puedes cambiarlo cuando quieras.', 'Il t’accompagnera dans la Station. Ils aident tous aussi bien : seule leur façon de parler change. Tu peux en changer quand tu veux.'],
  'm.listen': ['Escuchar', 'Écouter'],
  'm.pick': ['Elegir a {x}', 'Choisir {x}'], 'm.answer': ['Responder', 'Répondre'], 'm.later': ['Ahora no', 'Pas maintenant'],
  'm.send': ['Enviar al cuaderno', 'Envoyer au carnet'], 'm.write': ['Escribe lo que piensas… (no hay respuesta mala)', 'Écris ce que tu penses… (il n’y a pas de mauvaise réponse)'],
  'm.dato': ['Dato', 'Le saviez-vous'], 'm.queue': ['{n} más en el cuaderno', '{n} de plus dans le carnet'],
  'm.parentNote': ['Nota de papá', 'Note de papa'], 'm.retry': ['Volver a intentarlo', 'Réessayer'],
  'm.chars': ['{n} caracteres', '{n} caractères'], 'm.off': ['El mentor está en pausa. Puedes activarlo en la zona de padres.', 'Le mentor est en pause. On peut le réactiver dans l’espace parents.'],
  'book.title': ['Mi cuaderno de vuelo', 'Mon carnet de bord'], 'book.points': ['Puntos de bitácora', 'Points de bord'],
  'book.empty': ['Todavía no has escrito ninguna reflexión. Cuando vuelvas de un juego, tu mentor te hará una pregunta.', 'Tu n’as encore écrit aucune réflexion. Quand tu reviendras d’un jeu, ton mentor te posera une question.'],
  'book.badges': ['Insignias de bitácora', 'Insignes de bord'], 'book.list': ['Mis reflexiones', 'Mes réflexions'],
  'st.pend': ['esperando a papá', 'en attente de papa'], 'st.ok': ['+{p} puntos', '+{p} points'], 'st.back': ['para mejorar', 'à améliorer'],
  'b.first': ['Primera reflexión', 'Première réflexion'], 'b.five': ['Cinco reflexiones', 'Cinq réflexions'], 'b.ten': ['Diez reflexiones', 'Dix réflexions'],
  'b.bright': ['Idea brillante', 'Idée brillante'], 'b.worlds': ['Tres mundos', 'Trois mondes'], 'b.days': ['Tres días pensando', 'Trois jours de réflexion'],
  'b.again': ['Lo intenté otra vez', 'J’ai réessayé'],
  'b.first.h': ['Te validan una reflexión', 'Une réflexion validée'], 'b.five.h': ['5 reflexiones validadas', '5 réflexions validées'], 'b.ten.h': ['10 reflexiones validadas', '10 réflexions validées'],
  'b.bright.h': ['Una reflexión de 50 puntos', 'Une réflexion à 50 points'], 'b.worlds.h': ['Reflexiones en 3 juegos', 'Des réflexions dans 3 jeux'],
  'b.days.h': ['Reflexiones 3 días seguidos', 'Des réflexions 3 jours de suite'], 'b.again.h': ['Mejorar una reflexión devuelta', 'Améliorer une réflexion renvoyée'],
  'unit.mission': ['{n} misión nueva', '{n} nouvelle mission'], 'unit.missions': ['{n} misiones nuevas', '{n} nouvelles missions'],
  'unit.room': ['{n} cámara superada', '{n} salle réussie'], 'unit.rooms': ['{n} cámaras superadas', '{n} salles réussies'],
  'unit.key': ['{n} llave nueva', '{n} nouvelle clé'], 'unit.keys': ['{n} llaves nuevas', '{n} nouvelles clés'],
  'unit.challenge': ['{n} reto superado', '{n} défi réussi'], 'unit.challenges': ['{n} retos superados', '{n} défis réussis'],
  'unit.session': ['una partida', 'une partie'], 'unit.progress': ['nuevos avances', 'de nouveaux progrès'],
  /* zona de padres */
  'p.title': ['Zona de padres', 'Espace parents'], 'p.pending': ['Por revisar', 'À relire'], 'p.history': ['Historial', 'Historique'], 'p.settings': ['Ajustes', 'Réglages'],
  'p.waiting': ['Hay {n} reflexión(es) esperando tu lectura.', '{n} réflexion(s) attendent ta lecture.'],
  'p.none': ['No hay reflexiones esperando. 👌', 'Aucune réflexion en attente. 👌'], 'p.noneH': ['Todavía no hay reflexiones revisadas.', 'Aucune réflexion relue pour l’instant.'],
  'p.note': ['Nota para {x} (opcional; obligatoria si la devuelves)', 'Note pour {x} (facultative ; obligatoire si tu la renvoies)'],
  'p.v10': ['Pensó · 10', 'A réfléchi · 10'], 'p.v25': ['Razonó bien · 25', 'Bien raisonné · 25'], 'p.v50': ['Brillante · 50', 'Brillant · 50'],
  'p.back': ['Devolver para mejorar', 'Renvoyer pour améliorer'], 'p.needNote': ['Escribe una nota para explicarle qué mejorar.', 'Écris une note pour expliquer quoi améliorer.'],
  'p.done': ['Revisada', 'Relue'], 'p.err': ['No se ha podido guardar: {x}', 'Impossible d’enregistrer : {x}'],
  'p.mentorOn': ['Preguntas del mentor activadas en este aparato', 'Questions du mentor activées sur cet appareil'],
  'p.mentorOff': ['Preguntas del mentor en pausa en este aparato', 'Questions du mentor en pause sur cet appareil'],
  'p.toggle': ['Cambiar', 'Changer'], 'p.how': ['Cómo puntuar: 10 si contestó pensando, 25 si explicó el porqué, 50 si te sorprendió. Devuelve con una nota amable si solo contestó con monosílabos.', 'Comment noter : 10 s’il a répondu en réfléchissant, 25 s’il a expliqué le pourquoi, 50 s’il t’a surpris. Renvoie avec une note bienveillante s’il a répondu en un mot.'],
  'r.tab': ['Informe', 'Bilan'], 'r.prev': ['Semana anterior', 'Semaine précédente'], 'r.next': ['Semana siguiente', 'Semaine suivante'],
  'r.title': ['Semana de {x} · del {a} al {b}', 'Semaine de {x} · du {a} au {b}'],
  'r.games': ['Juegos', 'Jeux'], 'r.noGames': ['Esta semana no ha avanzado en ningún juego.', 'Cette semaine, aucun progrès dans les jeux.'],
  'r.units': ['{n} {u} nuevas', '{n} {u} nouvelles'], 'r.days': ['{n} días', '{n} jours'], 'r.day': ['1 día', '1 jour'],
  'r.topics': ['Temas trabajados', 'Thèmes travaillés'], 'r.refl': ['Cuaderno de vuelo', 'Carnet de bord'], 'r.reflS': ['reflexiones', 'réflexions'],
  'r.reflN': ['{n} reflexiones escritas, {v} validadas, {p} puntos de bitácora', '{n} réflexions écrites, {v} validées, {p} points de bord'],
  'r.rut': ['{p} % de las tareas hechas ({ok} de {n}), {c} créditos ganados', '{p} % des tâches faites ({ok} sur {n}), {c} crédits gagnés'],
  'r.due': ['Recordatorios atrasados', 'Rappels en retard'], 'r.talk': ['Para hablar en la cena', 'Pour en parler au dîner'],
  'r.copy': ['Copiar el informe', 'Copier le bilan'], 'r.share': ['Compartir', 'Partager'], 'r.copied': ['Informe copiado', 'Bilan copié'],
  'r.note': ['Se calcula con lo que hay en este aparato. Las semanas anteriores aparecen a partir de ahora, conforme se use la Estación.', 'Calculé à partir de ce qui est sur cet appareil. Les semaines précédentes apparaîtront au fil de l’utilisation de la Station.'],
  'p.links': ['Enlaces del colegio', 'Liens du collège'], 'p.editLinks': ['Editar los enlaces', 'Modifier les liens'],
  /* monedero, mercado y hucha */
  'w.energy': ['Energía', 'Énergie'], 'w.crystals': ['Cristales', 'Cristaux'],
  'w.title': ['Tu monedero: {e} de Energía y {c} Cristales', 'Ta bourse : {e} d’Énergie et {c} Cristaux'],
  'new.welcome': ['¡Tu monedero ya funciona! Por todo lo que habías conseguido hasta hoy, recibes:', 'Ta bourse est en service ! Pour tout ce que tu avais déjà réussi, tu reçois :'],
  'new.start': ['Cada misión, cámara o reto que superes en un juego te da Energía. Los grandes hitos dan Cristales.', 'Chaque mission, salle ou défi réussi dans un jeu te donne de l’Énergie. Les grandes étapes donnent des Cristaux.'],
  'new.last': ['Lo último que has ganado', 'Tes derniers gains'], 'new.more': ['y {n} más', 'et {n} de plus'],
  'new.title': ['Nuevo título', 'Nouveau titre'], 'new.wallet': ['Ver el monedero', 'Voir la bourse'], 'new.games': ['Ir a los juegos', 'Aller aux jeux'],
  'new.offer': ['Oferta de hoy: {n} de Energía extra si avanzas en {x}', 'Offre du jour : {n} d’Énergie en plus si tu progresses dans {x}'],
  'of.title': ['Oferta del día', 'Offre du jour'],
  'of.text': ['Hoy, si avanzas en {x}, te llevas {n} de Energía extra.', 'Aujourd’hui, si tu progresses dans {x}, tu gagnes {n} d’Énergie en plus.'],
  'of.why': ['Es el juego al que llevas más tiempo sin jugar.', 'C’est le jeu auquel tu n’as pas joué depuis le plus longtemps.'],
  'of.done': ['¡Oferta conseguida! Mañana habrá otra.', 'Offre obtenue ! Il y en aura une autre demain.'], 'of.go': ['Jugar a {x}', 'Jouer à {x}'],
  'games.earned': ['ganados aquí', 'gagnés ici'],
  'mon.bal': ['Mi monedero', 'Ma bourse'], 'mon.eHelp': ['Se gana jugando. Para el día a día.', 'Se gagne en jouant. Pour tous les jours.'],
  'mon.cHelp': ['Solo por grandes hitos. Valen mucho.', 'Seulement pour les grandes étapes. Ils valent cher.'],
  'mon.saved': ['En la hucha', 'Dans la tirelire'], 'mon.savedHelp': ['Energía guardada que está creciendo.', 'Énergie mise de côté, qui grandit.'],
  'how.title': ['¿Cómo se gana?', 'Comment en gagner ?'],
  'how.1': ['Superar una misión, una cámara o un reto: de 20 a 40 de Energía, una sola vez.', 'Réussir une mission, une salle ou un défi : de 20 à 40 d’Énergie, une seule fois.'],
  'how.2': ['Terminar un capítulo o lograr algo difícil: de 1 a 5 Cristales.', 'Terminer un chapitre ou réussir quelque chose de difficile : de 1 à 5 Cristaux.'],
  'how.3': ['Avanzar en un juego: 10 de Energía, una vez por juego y día.', 'Progresser dans un jeu : 10 d’Énergie, une fois par jeu et par jour.'],
  'how.4': ['Una reflexión validada en tu cuaderno: 10, 25 o 50 de Energía (tres al día como mucho).', 'Une réflexion validée dans ton carnet : 10, 25 ou 50 d’Énergie (trois par jour au maximum).'],
  'how.5': ['Repetir un nivel ya superado no da puntos: lo que cuenta es aprender algo nuevo.', 'Refaire un niveau déjà réussi ne rapporte rien : ce qui compte, c’est d’apprendre quelque chose de nouveau.'],
  'mk.title': ['Mercado', 'Marché'], 'mk.price': ['Hoy, 1 Cristal cuesta', 'Aujourd’hui, 1 Cristal coûte'], 'mk.yest': ['ayer: {p}', 'hier : {p}'],
  'mk.note': ['El precio cambia un poco cada día, entre 90 y 110. Si vendes un Cristal recuperas el 80 %: cambiar y deshacer el cambio sale caro, como en un mercado de verdad.', 'Le prix change un peu chaque jour, entre 90 et 110. Si tu vends un Cristal, tu récupères 80 % : échanger puis revenir en arrière coûte cher, comme sur un vrai marché.'],
  'mk.buy': ['Comprar 1 Cristal', 'Acheter 1 Cristal'], 'mk.sell': ['Vender 1 Cristal', 'Vendre 1 Cristal'],
  'mk.buyQ': ['¿Cambiar {p} de Energía por 1 Cristal?', 'Échanger {p} d’Énergie contre 1 Cristal ?'],
  'mk.sellQ': ['¿Vender 1 Cristal por {p} de Energía?', 'Vendre 1 Cristal contre {p} d’Énergie ?'],
  'mk.sellW': ['Hoy, volver a comprarlo te costaría {q}.', 'Aujourd’hui, le racheter te coûterait {q}.'],
  'mk.do': ['Cambiar', 'Échanger'], 'mk.done': ['Cambio hecho', 'Échange effectué'],
  'mk.noE': ['Te faltan {n} de Energía', 'Il te manque {n} d’Énergie'], 'mk.noC': ['No tienes Cristales', 'Tu n’as pas de Cristal'],
  'hu.title': ['Hucha', 'Tirelire'],
  'hu.lead': ['Guarda Energía unos días y te devuelve más. Si la rompes antes de tiempo, recuperas lo tuyo, pero sin premio.', 'Mets de l’Énergie de côté quelques jours et elle te rend davantage. Si tu la casses avant la fin, tu récupères ta mise, mais sans bonus.'],
  'hu.amount': ['¿Cuánta Energía guardas?', 'Combien d’Énergie mets-tu de côté ?'], 'hu.term': ['¿Cuántos días?', 'Combien de jours ?'],
  'hu.days': ['{d} días', '{d} jours'], 'hu.preview': ['El {f} recogerás {n} de Energía: tus {a} y {i} de premio.', 'Le {f}, tu récupéreras {n} d’Énergie : tes {a} et {i} de bonus.'],
  'hu.save': ['Guardar en la hucha', 'Mettre dans la tirelire'], 'hu.min': ['Elige una cantidad entre {a} y {b}.', 'Choisis un montant entre {a} et {b}.'],
  'hu.poor': ['Necesitas al menos {n} de Energía para abrir una hucha.', 'Il te faut au moins {n} d’Énergie pour ouvrir une tirelire.'],
  'hu.full': ['Ya tienes {n} huchas abiertas. Cuando recojas una podrás abrir otra.', 'Tu as déjà {n} tirelires ouvertes. Quand tu en récupéreras une, tu pourras en ouvrir une autre.'],
  'hu.left': ['faltan {n} días', 'encore {n} jours'], 'hu.left1': ['falta 1 día', 'encore 1 jour'], 'hu.leftH': ['faltan unas horas', 'encore quelques heures'],
  'hu.ready': ['¡lista para recoger!', 'prête à récupérer !'], 'hu.collect': ['Recoger {n}', 'Récupérer {n}'], 'hu.break': ['Romper', 'Casser'],
  'hu.breakQ': ['¿Romper la hucha?', 'Casser la tirelire ?'], 'hu.breakW': ['Recuperas {a} de Energía, pero pierdes el premio de {i}. Faltaba poco: {x}.', 'Tu récupères {a} d’Énergie, mais tu perds le bonus de {i}. Il ne restait plus beaucoup : {x}.'],
  'hu.broken': ['Hucha rota: recuperas {a} de Energía', 'Tirelire cassée : tu récupères {a} d’Énergie'], 'hu.got': ['¡Hucha recogida! Recibes {n} de Energía', 'Tirelire récupérée ! Tu reçois {n} d’Énergie'],
  'hu.saved': ['Guardado en la hucha', 'Mis dans la tirelire'], 'hu.bar': ['Tiempo que lleva guardada', 'Temps écoulé'],
  'mv2.title': ['Movimientos', 'Mouvements'], 'mv2.none': ['Todavía no hay movimientos.', 'Aucun mouvement pour l’instant.'], 'mv2.all': ['Ver todos', 'Tout voir'],
  'l.dia': ['Práctica del día · {x}', 'Entraînement du jour · {x}'], 'l.oferta': ['Oferta del día · {x}', 'Offre du jour · {x}'],
  'l.buyC': ['Mercado · Cristal comprado', 'Marché · Cristal acheté'], 'l.sellC': ['Mercado · Cristal vendido', 'Marché · Cristal vendu'],
  'l.huIn': ['Hucha · guardado {d} días', 'Tirelire · {d} jours'], 'l.huOut': ['Hucha · recogida con premio', 'Tirelire · récupérée avec bonus'], 'l.huBreak': ['Hucha · rota antes de tiempo', 'Tirelire · cassée avant la fin'],
  'l.buy': ['Compra · {x}', 'Achat · {x}'], 'l.logro': ['Logro en {x}', 'Succès dans {x}'], 'l.refl': ['Reflexión validada', 'Réflexion validée'],
  /* pasaporte y títulos */
  'pas.title': ['Pasaporte de saberes', 'Passeport des savoirs'], 'pas.lead': ['Lo que sabe hacer y dónde lo demostró.', 'Ce que je sais faire et où je l’ai montré.'],
  'pas.print': ['Imprimir', 'Imprimer'], 'pas.count': ['{a} de {b}', '{a} sur {b}'], 'pas.skills': ['Saberes', 'Savoirs'],
  'pas.where': ['Demostrado en {x} · {f}', 'Démontré dans {x} · {f}'], 'pas.todo': ['Se demuestra en {x}', 'À démontrer dans {x}'],
  'pas.ok': ['Demostrado', 'Démontré'], 'pas.no': ['Pendiente', 'À venir'], 'pas.pending': ['Por demostrar ({n})', 'À démontrer ({n})'], 'pas.fr': ['Francia', 'France'], 'pas.es': ['España', 'Espagne'],
  'pas.curr': ['La equivalencia con los programas escolares de Francia y España es orientativa.', 'La correspondance avec les programmes scolaires de France et d’Espagne est indicative.'],
  'pas.empty': ['Todavía no hay saberes demostrados.', 'Aucun savoir démontré pour l’instant.'], 'pas.date': ['Pasaporte del {f}', 'Passeport du {f}'],
  'tit.title': ['Títulos', 'Titres'], 'tit.lead': ['Se ganan, no se compran. Elige hasta tres para lucirlos junto a tu nombre.', 'Ils se gagnent, ils ne s’achètent pas. Choisis-en jusqu’à trois à afficher à côté de ton prénom.'],
  'tit.on': ['Luciendo', 'Affiché'], 'tit.wear': ['Lucir', 'Afficher'], 'tit.max': ['Puedes lucir tres a la vez: quita uno primero.', 'Tu peux en afficher trois à la fois : retires-en un d’abord.'],
  /* yo: avatar, fondos */
  'yo.title': ['Mi avatar', 'Mon avatar'], 'yo.bg': ['Fondo de la Estación', 'Fond de la Station'], 'yo.name': ['Mi nombre', 'Mon prénom'],
  'yo.gen': ['Mis títulos, en', 'Mes titres, au'], 'yo.gen.m': ['masculino', 'masculin'], 'yo.gen.f': ['femenino', 'féminin'], 'yo.gen.n': ['neutro', 'neutre'],
  'yo.lead': ['Cambia lo que quieras. Las piezas con precio se compran una vez y son tuyas para siempre.', 'Change ce que tu veux. Les pièces payantes s’achètent une fois et sont à toi pour toujours.'],
  'shop.have': ['Tuyo', 'À toi'], 'shop.using': ['Puesto', 'Porté'], 'shop.active': ['En uso', 'Actif'],
  'shop.buyQ': ['¿Comprar «{x}»?', 'Acheter « {x} » ?'], 'shop.buy': ['Comprar', 'Acheter'], 'shop.bought': ['¡Comprado! Ya es tuyo.', 'Acheté ! C’est à toi.'],
  'shop.cost': ['Cuesta', 'Prix :'], 'shop.after': ['Te quedarán', 'Il te restera'],
  'shop.poorE': ['Te faltan {n} de Energía. Sigue jugando y vuelve.', 'Il te manque {n} d’Énergie. Continue à jouer et reviens.'],
  'shop.poorC': ['Te faltan {n} Cristales. Se ganan con los grandes hitos o en el mercado.', 'Il te manque {n} Cristaux. Ils se gagnent avec les grandes étapes ou au marché.'],
  'p.eco': ['Valor de los logros', 'Valeur des succès'], 'p.ecoHelp': ['Sube o baja la Energía que da cada logro nuevo, de ×0,5 a ×2. Lo ya ganado no cambia.', 'Augmente ou diminue l’Énergie donnée par chaque nouveau succès, de ×0,5 à ×2. Ce qui est déjà gagné ne change pas.'],
  'r.wallet': ['Monedero', 'Bourse'], 'r.walletN': ['{e} de Energía y {c} Cristales ganados', '{e} d’Énergie et {c} Cristaux gagnés'],
  /* mudanza */
  'mv.title': ['Traer tus partidas', 'Récupérer tes parties'], 'mv.lead': ['Estas partidas vienen de la dirección antigua de la Estación. ¿Las guardamos aquí?', 'Ces parties viennent de l’ancienne adresse de la Station. On les enregistre ici ?'],
  'mv.keep': ['Ya tenías una partida más avanzada aquí: se queda la de aquí.', 'Tu avais déjà une partie plus avancée ici : on garde celle d’ici.'],
  'mv.go': ['Guardar aquí', 'Enregistrer ici'], 'mv.done': ['Partidas traídas. ¡Bienvenido a Curionaut!', 'Parties récupérées. Bienvenue sur Curionaut !'],
  'mv.bad': ['El enlace de la mudanza está incompleto. Vuelve a pulsar el botón en la Estación antigua.', 'Le lien du déménagement est incomplet. Appuie à nouveau sur le bouton dans l’ancienne Station.'],
  'mv.station': ['Notas y ajustes de la Estación', 'Notes et réglages de la Station'], 'mv.other': ['Otros datos', 'Autres données']
};
const t = (k, v) => { const e = I[k]; let s = e ? e[L === 'fr' ? 1 : 0] : k; if (v) for (const x in v) s = s.split('{' + x + '}').join(v[x]); return s; };
const tt = o => (o ? (o[L] || o.es || '') : '');
function applyStatic() {
  document.documentElement.lang = L;
  $$('[data-t]').forEach(e => { e.textContent = t(e.dataset.t); });
  $('#noteIn').placeholder = t('notes.ph'); $('#noteIn').setAttribute('aria-label', t('notes.ph'));
  $('#dueChips').setAttribute('aria-label', t('due.group')); $('#dueDate').setAttribute('aria-label', t('due.other'));
  $('#btnSet').setAttribute('aria-label', t('set.title')); $('#lvl').title = t('lvl.title');
  $('#nav').setAttribute('aria-label', t('nav.label')); $('#navTop').setAttribute('aria-label', t('nav.label'));
  $('#lgLang').textContent = t('lang.switch');
}
function setLang(l) { L = S.lang = l; save(); applyStatic(); if (!$('#main').hidden) { tick(); renderAll(); } }

/* ---------------- Supabase ---------------- */
const CLOUD = !!(CFG.supabaseUrl && CFG.supabaseKey && window.supabase);
const sb = CLOUD ? window.supabase.createClient(CFG.supabaseUrl, CFG.supabaseKey, { auth: { persistSession: true, autoRefreshToken: true, storageKey: 'estacion-nil-auth' } }) : null;
let ME = null;
const cloudOn = () => !!(sb && ME);
function syncDot(state, title) { const d = $('#sync'); d.className = 'sync ' + (state || ''); d.title = title || ''; }

/* ---------------- utilidades de interfaz ---------------- */
let toastT = null;
function toast(x) { const e = $('#toast'); e.textContent = x; e.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => (e.hidden = true), 2800); }
let lastFocus = null;
function modal(html, onMount, wide) {
  const m = $('#modal'); lastFocus = document.activeElement; $('#sheet').className = 'sheet' + (wide ? ' wide' : ''); $('#sheet').innerHTML = html; m.hidden = false;
  const h = $('#sheet h3'); if (h) { h.id = 'sheetT'; $('#sheet').setAttribute('aria-labelledby', 'sheetT'); } else $('#sheet').removeAttribute('aria-labelledby');
  const close = () => { stopVoice(); m.hidden = true; $('#sheet').innerHTML = ''; removeEventListener('keydown', k); if (lastFocus && lastFocus.focus) try { lastFocus.focus(); } catch (e) {} };
  m.onclick = e => { if (e.target === m) close(); };
  const k = e => { if (e.key === 'Escape') close(); }; addEventListener('keydown', k);
  if (onMount) onMount(close);
  const f = $('#sheet input:not([type=hidden]),#sheet textarea,#sheet button'); if (f) setTimeout(() => { try { f.focus(); } catch (e) {} }, 50);
  return close;
}
const fmtDate = d => d.toLocaleDateString(LOC(), { weekday: 'long', day: 'numeric', month: 'long' });
const fmtShort = ts => new Date(ts).toLocaleDateString(LOC(), { day: 'numeric', month: 'short' });
function dueLabel(s) {
  if (!s) return ''; const td = ymd(new Date());
  if (s === td) return t('due.today.s'); if (s === ymd(addDays(new Date(), 1))) return t('due.tomorrow.s'); if (s === ymd(addDays(new Date(), -1))) return t('due.yesterday');
  return new Date(s + 'T12:00').toLocaleDateString(LOC(), { weekday: 'short', day: 'numeric', month: 'short' });
}
const childName = () => (ME && ME.role !== 'padre' && ME.display_name) || S.childName || 'Nil';

/* ---------------- reloj y saludo ---------------- */
function tick() {
  const n = new Date(); $('#clock').textContent = n.toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit' });
  const h = n.getHours(); const g = h < 6 ? t('hi.night') : h < 13 ? t('hi.morning') : h < (L === 'fr' ? 18 : 21) ? t('hi.afternoon') : t('hi.night');
  $('#hi').innerHTML = `${esc(g)}, <span>${esc((ME && ME.display_name) || childName())}</span>`;
  $('#today').textContent = fmtDate(n).replace(/^./, c => c.toUpperCase());
}

/* =================== JUEGOS =================== */
/* Todos los juegos viven en la misma dirección (curionaut.org/juegos/...), así que su progreso
   está en este mismo navegador y la Estación lo puede leer sin pedir nada a nadie. */
const read = k => { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } };
const rankOf = (R, xp) => { let r = R[0][1]; R.forEach(([x, n]) => { if ((xp || 0) >= x) r = n; }); return r; };
const R_OHM = [[0, ['Aprendiz', 'Novice']], [200, ['Ayudante', 'Stagiaire']], [500, ['Analista', 'Analyste']], [900, ['Especialista', 'Spécialiste']], [1500, ['Genio', 'Génie']], [2400, ['Leyenda del Tiempo', 'Légende du Temps']], [3500, ['Ingeniería de redes', 'Ingénierie des réseaux']], [5000, ['Maestría de nudos', 'Maîtrise des nœuds']], [7000, ['Arquitectura de la corriente', 'Architecture du courant']], [9500, ['Guardián de la Red', 'Gardien du Réseau']]];
const R_PIT = [[0, ['Aprendiz de la Arena', 'Apprenti des sables']], [120, ['Portador de Antorcha', 'Porteur de torche']], [300, ['Lector de Pergaminos', 'Lecteur de parchemins']], [550, ['Cartógrafo del Templo', 'Cartographe du Temple']], [900, ['Agrimensor Real', 'Arpenteur royal']], [1350, ['Arquitecto del Templo', 'Architecte du Temple']], [2000, ['Maestro Pitagórico', 'Maître pythagoricien']], [2800, ['Discípulo de Euclides', 'Disciple d’Euclide']], [3800, ['Astrónomo de Alejandría', 'Astronome d’Alexandrie']], [5000, ['Leyenda Viva', 'Légende vivante']]];
const pick2 = a => a[L === 'fr' ? 1 : 0];
const PIT_IDS = ['c1', 'c2', 'c3', 'c7', 'c4', 'c8', 'c9', 'c10', 'c5', 'c6'];
const hash = s => { let h = 0; s = String(s || ''); for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return h; };
const REF_KEY = 'curionauta-refugio-0.1', REF_IDS = ['r1', 'r2', 'r3'];
const REF_NOMBRES = [['Luz de emergencia', 'Éclairage de secours'], ['¿Aguanta la noche?', 'Ça tient toute la nuit ?'], ['El cable cortado', 'Le câble coupé']];
const GAMES = [
  { id: 'chrono-ohm', name: 'Chrono-Ohm', sub: ['Electricidad · viaje en el tiempo', 'Électricité · voyage dans le temps'], url: '../juegos/chrono-ohm/', color: '#f2a65a', unit: ['misiones', 'missions'],
    read() {
      const s = read('chrono-ohm-v1'); if (!s || !(s.xp || s.introSeen)) return null; const ch = s.ch || {}; let done = 0; Object.values(ch).forEach(c => (done += (c && c.done) || 0));
      const stars = Object.values(ch).reduce((a, c) => a + Object.values((c && c.stars) || {}).reduce((x, y) => x + y, 0), 0);
      return { xp: s.xp || 0, done, total: 68, stars, medals: Object.keys(s.ach || {}).length, label: pick2(rankOf(R_OHM, s.xp)), at: s.savedAt || 0 };
    },
    snap() {
      const s = read('chrono-ohm-v1'); if (!s) return null; const ch = {};
      Object.keys(s.ch || {}).forEach(k => { const c = s.ch[k] || {}; ch[k] = { d: c.done || 0, s: Object.values(c.stars || {}).reduce((a, b) => a + b, 0) }; });
      return { xp: s.xp || 0, ch, ty: hash(JSON.stringify(s.tyc || null)) };
    },
    diff(a, b) {
      let best = null, n = 0, ds = 0;
      Object.keys(b.ch).forEach(k => { const d = b.ch[k].d - ((a.ch[k] && a.ch[k].d) || 0); if (d > 0) { n += d; ds += b.ch[k].s - ((a.ch[k] && a.ch[k].s) || 0); if (!best || d > best.d) best = { k, d }; } });
      const xp = Math.max(0, b.xp - a.xp);
      if (best) return { topic: best.k, n, unit: 'mission', xp, hard: ds / n < 2 };
      if (b.ty !== a.ty && xp > 0) return { topic: 'tycoon', n: 0, xp, hard: false };
      if (xp > 0) return { topic: 'general', n: 0, xp, hard: false };
      return null;
    } },
  { id: 'pitagoras', name: 'La Expedición Pitágoras', sub: ['Pitágoras, raíces, coseno', 'Pythagore, racines, cosinus'], url: '../juegos/pitagoras/', color: '#f2a541', unit: ['cámaras', 'salles'],
    read() {
      const s = read('expedicion-pitagoras-v1'); if (!s || !(s.xp || s.prologue)) return null; const st = s.stars || {};
      const done = PIT_IDS.filter(k => (st[k] || 0) >= 1).length, stars = PIT_IDS.reduce((a, k) => a + (st[k] || 0), 0);
      return { xp: s.xp || 0, done, total: 10, stars, medals: Object.keys(s.relics || {}).length, label: pick2(rankOf(R_PIT, s.xp)), at: s.updated || 0 };
    },
    snap() { const s = read('expedicion-pitagoras-v1'); if (!s) return null; const st = {}; PIT_IDS.forEach(k => (st[k] = (s.stars || {})[k] || 0)); return { xp: s.xp || 0, st }; },
    diff(a, b) {
      let best = null, n = 0, low = 0;
      PIT_IDS.forEach(k => { const d = b.st[k] - ((a.st && a.st[k]) || 0); if (d > 0) { n++; if (b.st[k] <= 1) low++; if (!best || d > best.d) best = { k, d }; } });
      const xp = Math.max(0, b.xp - a.xp);
      if (best) return { topic: best.k, n, unit: 'room', xp, hard: low > n / 2 };
      if (xp > 0) return { topic: 'general', n: 0, xp, hard: false };
      return null;
    } },
  { id: 'philoquest', name: 'PhiloQuest', sub: ['Filosofía con Noctua', 'Philosophie avec Noctua'], url: '../juegos/philoquest/', color: '#7ec8ff', unit: ['llaves', 'clés'],
    read() {
      const s = read('philoquest.v3.store'); if (!s || !s.slots) return null; let best = null;
      Object.values(s.slots).forEach(x => { const d = Object.keys(x.done || {}).length; if (!best || d > best.done) best = { done: d, at: x.updated || 0 }; });
      return best ? { xp: best.done * 100, done: best.done, total: 0, label: best.done ? `${best.done} ${pick2(['llaves', 'clés'])}` : t('games.started'), at: best.at } : null;
    },
    snap() { const p = this.read(); return p ? { d: p.done } : null; },
    diff(a, b) { const d = b.d - (a.d || 0); return d > 0 ? { topic: 'general', n: d, unit: 'key', xp: d * 100, hard: false } : null; } },
  { id: 'umbral', name: 'UMBRAL', sub: ['Mazmorras tácticas en 3D', 'Donjons tactiques en 3D'], url: '../juegos/umbral/', color: '#c77dff',
    read() { const s = read('umbral.save.v3'); return s ? { xp: 0, done: 0, total: 0, label: t('games.inprog'), at: s.savedAt || s.t || 0 } : null; },
    snap() { const s = read('umbral.save.v3'); return s ? { at: s.savedAt || s.t || 0 } : null; },
    diff(a, b) { return b.at && b.at !== a.at ? { topic: 'general', n: 0, unit: 'session', xp: 0, hard: false } : null; } },
  /* El Refugio: tres retos (r1 LED y ley de Ohm, r2 energía y batería, r3 cable cortado). Cada reto superado vale 40,
     lo mismo que da el juego en Energía. Después de los tres, modo libre. */
  { id: 'refugio', name: 'El Refugio', sub: ['Monta, cablea y mide tu refugio a 12 V', 'Monte, câble et mesure ton refuge en 12 V'], url: '../refugio/', color: '#6fd99a', unit: ['retos', 'défis'],
    read() {
      const s = read(REF_KEY); if (!s || !(s.reto || s.step || (s.cables && s.cables.length))) return null;
      const done = REF_IDS.filter(k => (s.done || {})[k]).length;
      return { xp: done * 40, done, total: REF_IDS.length, label: pick2(done >= REF_IDS.length ? ['Modo libre', 'Mode libre'] : REF_NOMBRES[done]), at: s.at || 0 };
    },
    snap() {
      const s = read(REF_KEY); if (!s) return null; const d = {}; REF_IDS.forEach(k => (d[k] = (s.done || {})[k] ? 1 : 0));
      const montaje = Object.keys(s.placed || {}).sort().map(k => k + ':' + s.placed[k].t).join() + '|' + (s.cables || []).map(c => c.a + '-' + c.b).sort().join();
      return { d, st: (s.reto || 0) * 10 + (s.step || 0), q: (s.stats && s.stats.ledsQuemados) || 0, m: hash(montaje) };
    },
    diff(a, b) {
      const nuevos = REF_IDS.filter(k => b.d[k] && !(a.d && a.d[k]));
      if (nuevos.length) return { topic: nuevos[nuevos.length - 1], n: nuevos.length, unit: 'challenge', xp: nuevos.length * 40, hard: b.q - (a.q || 0) >= 2 };
      if (b.st > (a.st || 0)) return { topic: 'general', n: 0, unit: '', xp: 0, hard: false };                      // ha avanzado pasos de un reto
      if (b.st >= REF_IDS.length * 10 && b.m !== a.m) return { topic: 'general', n: 0, unit: 'session', xp: 0, hard: false };   // modo libre: ha montado algo distinto
      return null;
    } }
];
let remoteProg = {};
function bestProgress(g) { const loc = g.read(); const rem = remoteProg[g.id]; if (!rem) return loc; if (!loc) return rem; return (rem.xp || 0) > (loc.xp || 0) || (rem.done || 0) > (loc.done || 0) ? rem : loc; }
function renderGames() {
  let totalXP = 0;
  const ganado = {}; S.led.forEach(x => { if (x.g && x.e > 0) ganado[x.g] = (ganado[x.g] || 0) + x.e; });
  $('#games').innerHTML = GAMES.map(g => {
    const p = bestProgress(g); if (p) totalXP += p.xp || 0; const pct = p && p.total ? Math.round(p.done / p.total * 100) : 0;
    return `<article class="game" style="--gc:${esc(g.color)}"><div><h3>${esc(g.name)}</h3><div class="sub">${esc(pick2(g.sub))}</div></div>
      ${p ? `${p.total ? `<div class="pb" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(t('games.progress'))}"><i style="width:${pct}%"></i></div>` : ''}
        <div class="meta">${p.label ? `<span>${esc(p.label)}</span>` : ''}${p.total ? `<span>${p.done}/${p.total} ${esc(pick2(g.unit || ['misiones', 'missions']))}</span>` : ''}${p.xp ? `<span>${p.xp} XP</span>` : ''}${p.stars ? `<span>★ ${p.stars}</span>` : ''}${p.medals ? `<span>🏅 ${p.medals}</span>` : ''}</div>${ganado[g.id] ? `<div class="gearn">${cur(ganado[g.id], 'e')} ${esc(t('games.earned'))}</div>` : ''}`
        : `<div class="meta"><span>${esc(t('games.none'))}</span></div>`}
      <a class="btn ${p ? 'pri' : ''}" href="${esc(g.url)}">${esc(p ? t('games.play') : t('games.start'))}</a></article>`;
  }).join('');
  const bp = bitaPoints(); totalXP += bp;
  const lv = 1 + Math.floor(totalXP / 500), rest = totalXP % 500;
  $('#lvN').textContent = lv; $('#lvT').textContent = t('lvl.text', { xp: totalXP, n: lv }); $('#lvB').style.width = (rest / 5) + '%';
}
async function pushProgress() {
  if (!cloudOn() || ME.role === 'padre') return; const rows = [];
  GAMES.forEach(g => { const p = g.read(); if (p) rows.push({ game: g.id, device: S.device, data: p, updated_at: new Date().toISOString() }); });
  if (rows.length) { const { error } = await sb.from('estacion_progress').upsert(rows, { onConflict: 'member_id,game,device' }); if (error) console.warn(error.message); }
  const { data, error } = await sb.from('estacion_progress').select('game,data,updated_at').eq('member_id', ME.id);
  if (!error && data) { remoteProg = {}; data.forEach(r => { const cur = remoteProg[r.game]; if (!cur || (r.data.xp || 0) > (cur.xp || 0) || (r.data.done || 0) > (cur.done || 0)) remoteProg[r.game] = r.data; }); S.cache.prog = remoteProg; save(); }
}

/* =================== MENTOR Y CUADERNO DE VUELO =================== */
const SVG_M = {
  bitacora: '<svg viewBox="0 0 48 48" aria-hidden="true"><rect x="10" y="7" width="27" height="34" rx="4" fill="none" stroke="currentColor" stroke-width="3"/><path d="M16 7v34" stroke="currentColor" stroke-width="3"/><path d="M21 16h11M21 22h11M21 28h7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M33 33l6-12 3 2-6 12-4 1z" fill="currentColor"/></svg>',
  brujula: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="24" r="17" fill="none" stroke="currentColor" stroke-width="3"/><path d="M24 11l5 13-5 13-5-13z" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linejoin="round"/><path d="M24 11l5 13h-10z" fill="currentColor"/><circle cx="24" cy="24" r="2.5" fill="currentColor"/></svg>',
  astrolabio: '<svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="24" cy="26" r="16" fill="none" stroke="currentColor" stroke-width="3"/><circle cx="24" cy="26" r="9" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 4v6M20 6h8M10 26h28" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M14 16l20 20" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><circle cx="31" cy="19" r="2.5" fill="currentColor"/></svg>',
  faro: '<svg viewBox="0 0 48 48" aria-hidden="true"><path d="M19 42l3-24h4l3 24z" fill="none" stroke="currentColor" stroke-width="3" stroke-linejoin="round"/><path d="M20.5 31h7M21.5 24h5" stroke="currentColor" stroke-width="2.5"/><rect x="20" y="11" width="8" height="7" rx="2" fill="currentColor"/><path d="M24 11V7M17 13l-9-4M31 13l9-4M17 16l-9 2M31 16l9 2" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/><path d="M12 42h24" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>'
};
const mentorId = () => (MEN.M[S.mentor] ? S.mentor : 'bitacora');
const mentor = () => MEN.M[mentorId()];
const portrait = (id, cls) => `<span class="mport ${cls || ''}" style="--mc:${esc(MEN.M[id].color)};color:${esc(MEN.M[id].color)}">${SVG_M[id]}</span>`;
/* frase del mentor: elige una variante que tenga todos sus marcadores rellenos */
function say(kind, vars, seed) {
  const all = (MEN.T[mentorId()] || {})[kind] || []; vars = vars || {};
  const ok = all.filter(v => !(tt(v).match(/\{(\w+)\}/g) || []).some(m => vars[m.slice(1, -1)] === undefined || vars[m.slice(1, -1)] === '' || vars[m.slice(1, -1)] === null));
  const list = ok.length ? ok : all; if (!list.length) return '';
  let s = tt(list[Math.abs(seed || 0) % list.length]);
  Object.keys(vars).forEach(k => { s = s.split('{' + k + '}').join(vars[k]); });
  return s.replace(/\{\w+\}/g, '');
}
function unitText(e) {
  if (e.unit === 'session') return t('unit.session');
  if (!e.n || !e.unit) return t('unit.progress');
  return t('unit.' + e.unit + (e.n === 1 ? '' : 's'), { n: e.n });
}
const topicOf = e => MEN.TOPICS[e.game + ':' + e.topic] || MEN.TOPICS[e.game + ':general'] || null;
const gameName = id => (GAMES.find(g => g.id === id) || { name: id }).name;

/* detecta lo que ha hecho en cada juego desde la última visita y lo apunta en el cuaderno */
function detect() {
  if (ME && ME.role === 'padre') return false;
  let added = false; const now = Date.now();
  GAMES.forEach(g => {
    let cur = null; try { cur = g.snap(); } catch (e) { cur = null; }
    if (!cur) return;
    const prev = S.seen[g.id];
    S.seen[g.id] = cur;
    if (!prev) return;                          // primera vez: no se comenta todo el pasado
    let d = null; try { d = g.diff(prev, cur); } catch (e) { d = null; }
    if (!d) return;
    if (!avances.includes(g.id)) avances.push(g.id);          // cuenta para la práctica y la oferta del día
    const key = g.id + ':' + d.topic;
    const last = S.bita.find(x => x.estado === 'nueva' && x.game === g.id && x.topic === d.topic);
    if (last) { last.n = (last.n || 0) + (d.n || 0); last.xp = (last.xp || 0) + (d.xp || 0); last.hard = last.hard || d.hard; last.at = now; added = true; return; }
    const qi = S.qi[key] || 0; S.qi[key] = qi + 1;
    S.bita.unshift({ id: uid(), game: g.id, topic: d.topic, n: d.n || 0, unit: d.unit || '', xp: d.xp || 0, hard: !!d.hard, q: qi, at: now, estado: 'nueva', seed: Math.floor(Math.random() * 1000) });
    added = true;
  });
  S.bita = S.bita.slice(0, 12);
  recordDay();
  save();
  return added;
}

/* ---------- reflexiones: guardadas aquí y, con cuenta, en Supabase ---------- */
function bitaPoints() { return S.refl.filter(r => r.estado === 'validada').reduce((a, r) => a + (r.puntos || 0), 0); }
function badges() {
  const ok = S.refl.filter(r => r.estado === 'validada');
  const games = new Set(ok.map(r => r.game));
  const days = [...new Set(S.refl.map(r => ymd(new Date(r.created))))].sort();
  let run = 1, best = days.length ? 1 : 0;
  for (let i = 1; i < days.length; i++) { const p = new Date(days[i - 1] + 'T12:00'), c = new Date(days[i] + 'T12:00'); run = Math.round((c - p) / 864e5) === 1 ? run + 1 : 1; best = Math.max(best, run); }
  return [
    { id: 'first', i: '✒️', on: ok.length >= 1 }, { id: 'five', i: '📘', on: ok.length >= 5 }, { id: 'ten', i: '📚', on: ok.length >= 10 },
    { id: 'bright', i: '💡', on: ok.some(r => r.puntos >= 50) }, { id: 'worlds', i: '🪐', on: games.size >= 3 },
    { id: 'days', i: '🔭', on: best >= 3 }, { id: 'again', i: '🔁', on: ok.some(r => r.retry) }
  ];
}
function reflFromRow(r) { return { id: r.id, game: r.game, topic: r.topic, mentor: r.mentor, lang: r.lang, ctx: r.contexto, pregunta: r.pregunta, respuesta: r.respuesta, estado: r.estado, puntos: r.puntos || 0, nota: r.nota || '', created: Date.parse(r.created_at) || Date.now(), revisada: r.revisada_at ? Date.parse(r.revisada_at) : 0, retry: !!(r.contexto && /^↻/.test(r.contexto)), member: r.member_id }; }
async function pullRefl() {
  if (!cloudOn()) return;
  let q = sb.from('estacion_reflexiones').select('*').order('created_at', { ascending: false }).limit(300);
  if (ME.role !== 'padre') q = q.eq('member_id', ME.id);
  const { data, error } = await q; if (error) { console.warn(error.message); return; }
  const pendIds = new Set(S.pending.filter(o => o.t === 'refl').map(o => o.row.id));
  S.refl = data.map(reflFromRow).concat(S.refl.filter(r => pendIds.has(r.id) && !data.some(x => x.id === r.id)));
  save();
}
function sendRefl(entry, text) {
  const tp = topicOf(entry); const q = tp ? tt(tp.preguntas[entry.q % tp.preguntas.length]) : '';
  const ctxt = (entry.retry ? '↻ ' : '') + `${gameName(entry.game)} · ${tp ? tt(tp.nombre) : entry.topic} · ${unitText(entry)}${entry.xp ? ` · +${entry.xp} XP` : ''}`;
  const r = { id: uid(), game: entry.game, topic: entry.topic, mentor: mentorId(), lang: L, ctx: ctxt.slice(0, 300), pregunta: q.slice(0, 400), respuesta: text.slice(0, 1500), estado: 'pendiente', puntos: 0, nota: '', created: Date.now(), retry: !!entry.retry };
  S.refl.unshift(r); S.mias[r.id] = 1;
  if (cloudOn()) queue({ t: 'refl', row: { id: r.id, game: r.game, topic: r.topic, mentor: r.mentor, lang: r.lang, contexto: r.ctx, pregunta: r.pregunta, respuesta: r.respuesta } });
  save();
}

/* ---------- la voz del mentor ----------
   Si existe el audio grabado (audio/<idioma>/<mentor>/<id>.mp3, listado en audio/manifest.json) se usa;
   si no, la voz del propio aparato, con un tono y un ritmo distintos para cada mentor. Nunca suena sola. */
const VOZ = { bitacora: { rate: 0.95, pitch: 1.0, n: 0 }, brujula: { rate: 1.08, pitch: 1.12, n: 1 }, astrolabio: { rate: 0.9, pitch: 0.82, n: 2 }, faro: { rate: 0.88, pitch: 0.95, n: 3 } };
let AUDIO_OK = null, playing = null;
fetch('audio/manifest.json').then(r => (r.ok ? r.json() : {})).then(j => { AUDIO_OK = new Set(j.files || []); }).catch(() => { AUDIO_OK = new Set(); });
const audioId = (id, m) => `${L}/${m}/${id.replace(/:/g, '_')}`;
function stopVoice() { if (playing && playing.pause) playing.pause(); playing = null; try { speechSynthesis.cancel(); } catch (e) {} }
function speak(parts, who) {
  const mid = who || mentorId(); stopVoice(); parts = parts.filter(x => x && x.text);
  const run = i => {
    if (i >= parts.length) { playing = null; return; }
    const pth = audioId(parts[i].id, mid);
    if (AUDIO_OK && AUDIO_OK.has(pth)) { const a = new Audio('audio/' + pth + '.mp3'); playing = a; a.onended = () => run(i + 1); a.play().catch(() => run(i + 1)); return; }
    if (!('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(parts[i].text); const v = VOZ[mid]; u.lang = L === 'fr' ? 'fr-FR' : 'es-ES'; u.rate = v.rate; u.pitch = v.pitch;
    const vs = speechSynthesis.getVoices().filter(x => x.lang && x.lang.toLowerCase().startsWith(L)); if (vs.length) u.voice = vs[v.n % vs.length];
    u.onend = () => run(i + 1); playing = { pause: () => speechSynthesis.cancel() }; speechSynthesis.speak(u);
  };
  run(0);
}
const btnVoz = (key) => `<button class="btn sm voz" data-voz="${esc(key)}" aria-label="${esc(t('m.listen'))}">🔊</button>`;

/* ---------- la tarjeta del mentor ---------- */
let answering = null, nudged = {};
function renderMentor() {
  const box = $('#mentorBox'); if (!box) return;
  const id = mentorId(), m = mentor();
  $('#mentor').style.setProperty('--mc', m.color);
  if (!S.mentor) {   // primera vez: presentación y elección
    box.innerHTML = `<div class="mhead">${portrait('bitacora')}<div><div class="mname">${esc(t('m.choose'))}</div><p class="msay">${esc(t('m.chooseLead'))}</p></div></div>
      <div class="mfoot"><button class="btn pri" id="mChoose">${esc(t('m.choose'))}</button></div>`;
    $('#mChoose').onclick = chooseMentor; return;
  }
  const name = childName();
  if (ME && ME.role === 'padre') {   // el padre, en su aparato: resumen y acceso directo a revisar
    const n = S.refl.filter(r => r.estado === 'pendiente').length;
    box.innerHTML = `<div class="mhead">${portrait(id)}<div><div class="mname">${esc(t('p.title'))}</div><p class="msay">${esc(n ? t('p.waiting', { n }) : t('p.none'))}</p></div></div>
      <div class="mfoot"><button class="btn pri" id="mPar">${esc(t('p.pending'))}${n ? ` (${n})` : ''}</button></div>`;
    $('#mPar').onclick = parentZone; return;
  }
  const head = `<div class="mhead">${portrait(id)}<div style="min-width:0"><div class="mname">${esc(tt(m.nombre))}</div><div class="mrol">${esc(tt(m.rol))}</div>`;
  /* 1) respuestas del padre que aún no ha visto */
  const fresh = S.refl.filter(r => (r.estado === 'validada' || r.estado === 'devuelta') && !S.shown[r.id]);
  const feed = fresh.slice(0, 3).map(r => r.estado === 'validada'
    ? `<div class="fb ok"><b>${esc(say('validada', { p: r.puntos, nombre: name }, hash(r.id)))}</b>${r.nota ? `<span class="muted small">${esc(t('m.parentNote'))}: «${esc(r.nota)}»</span>` : ''}</div>`
    : `<div class="fb back"><b>${esc(say('devuelta', { nombre: name }, hash(r.id)))}</b>${r.nota ? `<span class="muted small">${esc(t('m.parentNote'))}: «${esc(r.nota)}»</span>` : ''}<div style="margin-top:8px"><button class="btn sm" data-retry="${esc(r.id)}">${esc(t('m.retry'))}</button></div></div>`).join('');
  if (fresh.length) setTimeout(() => { fresh.slice(0, 3).forEach(r => { S.shown[r.id] = 1; }); save(); }, 4000);
  /* 2) la entrada más reciente del cuaderno */
  const open = S.bita.filter(x => x.estado === 'nueva');
  const e = answering ? S.bita.find(x => x.id === answering) || open[0] : open[0];
  if (S.mentorOff || !e) {
    box.innerHTML = `${head}<p class="msay">${esc(say('saludo', { nombre: name }, new Date().getDate()))}</p></div></div>
      ${S.mentorOff ? `<p class="muted small" style="margin-top:10px">${esc(t('m.off'))}</p>` : ''}${feed ? `<div class="mfeed">${feed}</div>` : ''}`;
    bindRetry(); return;
  }
  const tp = topicOf(e);
  const vars = { nombre: name, juego: gameName(e.game), tema: tp ? tt(tp.nombre) : '', n: unitText(e), xp: e.xp ? String(e.xp) : '' };
  const first = e.retry ? '' : say(e.hard ? 'dificil' : 'buena', vars, e.seed);
  const q = tp ? tt(tp.preguntas[e.q % tp.preguntas.length]) : '';
  const isAns = answering === e.id;
  box.innerHTML = `${head}${first ? `<p class="msay">${esc(first)}</p>` : ''}</div></div>
    ${tp && !e.retry ? `<p class="mdato">${btnVoz('dato')}<b>${esc(t('m.dato'))} · </b>${esc(say('dato', { dato: tt(tp.dato) }, e.seed))}</p>` : ''}
    ${q ? `<div class="mq"><p class="lead">${btnVoz('q')}${esc(say('pregunta', vars, e.seed))}</p><p class="qq">${esc(q)}</p>
      ${isAns ? `<textarea id="mAns" maxlength="1500" placeholder="${esc(t('m.write'))}" aria-label="${esc(q)}">${esc(S.draft && S.draft[e.id] || '')}</textarea><p class="hint" id="mHint" aria-live="polite"></p>
        <div class="row"><span class="mcount" id="mCount"></span><span style="display:flex;gap:8px;flex-wrap:wrap"><button class="btn" id="mCancel">${esc(t('btn.cancel'))}</button><button class="btn pri" id="mSend">${esc(t('m.send'))}</button></span></div>`
      : `<div class="mfoot"><button class="btn pri" id="mAnswer">${esc(t('m.answer'))}</button><button class="btn" id="mLater">${esc(t('m.later'))}</button>${open.length > 1 ? `<span class="mqueue">${esc(t('m.queue', { n: open.length - 1 }))}</span>` : ''}</div>`}</div>` : ''}
    ${feed ? `<div class="mfeed">${feed}</div>` : ''}`;
  bindRetry();
  const tkey = e.game + ':' + (MEN.TOPICS[e.game + ':' + e.topic] ? e.topic : 'general'), qn = tp ? e.q % tp.preguntas.length : 0;
  $$('#mentorBox [data-voz]').forEach(b => b.onclick = () => speak(b.dataset.voz === 'dato'
    ? [{ id: 'd:' + tkey, text: tp ? tt(tp.dato) : '' }]
    : [{ id: 'm.pregunta', text: say('pregunta', {}, 0) }, { id: 'q:' + tkey + ':' + qn, text: q }]));
  if (isAns) {
    const ta = $('#mAns'), cnt = () => { $('#mCount').textContent = t('m.chars', { n: ta.value.trim().length }); S.draft = S.draft || {}; S.draft[e.id] = ta.value; save(); };
    ta.oninput = cnt; cnt(); setTimeout(() => ta.focus(), 30);
    $('#mCancel').onclick = () => { answering = null; renderMentor(); };
    $('#mSend').onclick = () => {
      const v = ta.value.trim(); if (!v) { ta.focus(); return; }
      const why = /porque|por qu|ya que|parce que|car |puisque|pourquoi|si |entonces|donc|alors/i.test(v);
      if ((v.length < 40 || !why) && !nudged[e.id]) { nudged[e.id] = 1; $('#mHint').textContent = say('corta', vars, e.seed); return; }
      sendRefl(e, v); e.estado = 'respondida'; if (S.draft) delete S.draft[e.id]; answering = null; save();
      toast(say('enviada', vars, e.seed)); renderMentor(); renderGames(); flush();
    };
  } else if (q) {
    $('#mAnswer').onclick = () => { answering = e.id; renderMentor(); };
    $('#mLater').onclick = () => { e.estado = 'descartada'; save(); toast(say('ahorano', vars, e.seed)); renderMentor(); };
  }
}
function bindRetry() {
  $$('#mentorBox [data-retry]').forEach(b => b.onclick = () => {
    const r = S.refl.find(x => x.id === b.dataset.retry); if (!r) return; S.shown[r.id] = 1;
    const tp = MEN.TOPICS[r.game + ':' + r.topic]; const qIdx = tp ? Math.max(0, tp.preguntas.findIndex(p => tt(p) === r.pregunta || p.es === r.pregunta || p.fr === r.pregunta)) : 0;
    const e = { id: uid(), game: r.game, topic: r.topic, n: 0, unit: '', xp: 0, hard: false, q: qIdx, at: Date.now(), estado: 'nueva', seed: 1, retry: true };
    S.bita.unshift(e); answering = e.id; save(); renderMentor();
  });
}
function chooseMentor() {
  const cur = S.mentor;
  modal(`<h3>${esc(t('m.choose'))}</h3><p class="muted small">${esc(t('m.chooseLead'))}</p><div class="mlist">${MEN.ORDEN.map(id => {
    const m = MEN.M[id];
    return `<div style="position:relative"><button class="mopt" data-m="${esc(id)}" aria-pressed="${cur === id}" style="--mc:${esc(m.color)};width:100%">${portrait(id)}<span><b>${esc(tt(m.nombre))}</b> · <span class="muted small">${esc(tt(m.estilo))}</span><p>${esc(tt(m.presenta))}</p></span></button><button class="btn sm voz" data-oir="${esc(id)}" style="position:absolute;right:8px;bottom:8px" aria-label="${esc(t('m.listen'))}: ${esc(tt(m.nombre))}">🔊</button></div>`;
  }).join('')}</div><div class="row"><button class="btn" id="mcClose">${esc(t('btn.close'))}</button></div>`, close => {
    $('#mcClose').onclick = close;
    $$('#sheet [data-m]').forEach(b => b.onclick = () => { stopVoice(); S.mentor = b.dataset.m; save(); close(); renderMentor(); toast(tt(MEN.M[S.mentor].nombre)); });
    $$('#sheet [data-oir]').forEach(b => b.onclick = ev => { ev.stopPropagation(); speak([{ id: 'm.presenta', text: tt(MEN.M[b.dataset.oir].presenta) }], b.dataset.oir); });
  }, true);
}
function openBook() {
  const list = S.refl.slice(0, 60);
  const B = badges();
  modal(`<h3>${esc(t('book.title'))}</h3>
    <div class="stats" style="grid-template-columns:repeat(2,minmax(0,1fr));margin-top:10px"><div class="stat"><b>${bitaPoints()}</b><span>${esc(t('book.points'))}</span></div><div class="stat"><b>${S.refl.length}</b><span>${esc(t('book.list'))}</span></div></div>
    <div class="set-sec"><h4>${esc(t('book.badges'))}</h4><div class="badges">${B.map(b => `<div class="badge ${b.on ? 'on' : ''}" title="${esc(t('b.' + b.id + '.h'))}"><span class="bi" aria-hidden="true">${b.i}</span><b>${esc(t('b.' + b.id))}</b>${esc(t('b.' + b.id + '.h'))}</div>`).join('')}</div></div>
    <div class="set-sec"><h4>${esc(t('book.list'))}</h4>${list.length ? `<ul class="rlist">${list.map(reflItem).join('')}</ul>` : `<p class="empty">${esc(t('book.empty'))}</p>`}</div>
    <div class="row"><button class="btn pri" id="bkClose">${esc(t('btn.close'))}</button></div>`, close => { $('#bkClose').onclick = close; }, true);
}
function reflItem(r) {
  const st = r.estado === 'validada' ? `<span class="tag ok">${esc(t('st.ok', { p: r.puntos }))}</span>` : r.estado === 'devuelta' ? `<span class="tag back">${esc(t('st.back'))}</span>` : `<span class="tag wait">${esc(t('st.pend'))}</span>`;
  return `<li class="ritem"><div class="rq">${esc(r.pregunta)}</div><div class="ra">${esc(r.respuesta)}</div>
    ${r.nota ? `<p class="muted small" style="margin:6px 0 0">${esc(t('m.parentNote'))}: «${esc(r.nota)}»</p>` : ''}
    <div class="rm">${st}<span>${esc(fmtShort(r.created))}</span><span>${esc(r.ctx || gameName(r.game))}</span>${MEN.M[r.mentor] ? `<span>${esc(tt(MEN.M[r.mentor].nombre))}</span>` : ''}</div></li>`;
}

/* ---------- zona de padres ---------- */
let parentPin = '';      // solo en memoria mientras la zona está abierta
function parentZone() { parentGate(pin => { parentPin = pin; showParent('pend'); }); }
/* ---------- informe semanal para padres ----------
   Cada visita apunta en S.hist el progreso de cada juego de ese día; el informe compara
   el final de la semana con lo que había antes de empezarla. Nada sale del aparato. */
function recordDay() {
  if (!S.hist || typeof S.hist !== 'object') S.hist = {};
  const d = ymd(new Date()), row = {};
  GAMES.forEach(g => { let p = null; try { p = g.read(); } catch (e) {} if (p) row[g.id] = { xp: p.xp || 0, done: p.done || 0 }; });
  if (!Object.keys(S.hist).length) S.hist['0000-00-00'] = row;   // punto de partida: lo jugado antes no cuenta como «esta semana»
  S.hist[d] = row;
  const keys = Object.keys(S.hist).sort(); while (keys.length > 120) delete S.hist[keys.shift()];
}
function weekBounds(offset) { const n = new Date(); const mon = addDays(n, -((n.getDay() + 6) % 7) + 7 * offset); const sun = addDays(mon, 6); return { a: ymd(mon), b: ymd(sun), mon }; }
function rutinatorWeek(a, b) {
  const e = read(RUT3); if (!e || !e.tareas) return null; let exp = 0, ok = 0, earned = 0;
  for (let d = new Date(a + 'T12:00'); ymd(d) <= b && ymd(d) <= ymd(new Date()); d = addDays(d, 1)) {
    const k = ymd(d), di = dayIdx(d);
    const blocks = Object.values(e.horario || {}).filter(x => x.dia === di);
    const cat = Object.values(e.tareas || {}).filter(x => x.tipo !== 'habito' && x.activa !== false && (x.tipo === 'puntual' ? x.fecha === k : (!x.dias || x.dias === 'todos' || (Array.isArray(x.dias) && x.dias.includes(di)))));
    const all = cat.concat(blocks.filter(x => x.requierePreparacion).map(x => ({ id: 'gen_' + x.id })));
    exp += all.length; ok += all.filter(x => { const m = (e.marcas || {})[k + '__' + x.id]; return m && (m.estado === 'aprobada' || m.estado === 'pendiente'); }).length;
  }
  Object.values(e.ledger || {}).forEach(m => { if (m.cuenta === 'semana' && m.tipo === 'ganado' && !m.anuladoPor && m.fecha >= a && m.fecha <= b) earned += Number(m.cantidad || 0); });
  return { pct: exp ? Math.round(ok / exp * 100) : 0, ok, exp, earned: Math.round(earned) };
}
function buildReport(offset) {
  const { a, b, mon } = weekBounds(offset); const H = S.hist || {}; const days = Object.keys(H).sort();
  const before = days.filter(d => d < a).pop(), inWeek = days.filter(d => d >= a && d <= b);
  const games = GAMES.map(g => {
    const start = (before && H[before][g.id]) || (inWeek.length && H[inWeek[0]][g.id]) || { xp: 0, done: 0 };
    const endD = inWeek.slice().reverse().find(d => H[d][g.id]); const end = endD ? H[endD][g.id] : start;
    let prev = start, played = 0; inWeek.forEach(d => { const x = H[d][g.id]; if (x && x.xp > prev.xp) played++; if (x) prev = x; });
    return { g, xp: Math.max(0, end.xp - start.xp), done: Math.max(0, end.done - start.done), days: played };
  }).filter(x => x.xp || x.done);
  const ts = x => ymd(new Date(x));
  const topics = [...new Set(S.bita.filter(x => ts(x.at) >= a && ts(x.at) <= b).map(x => { const tp = topicOf(x); return `${gameName(x.game)} · ${tp ? tt(tp.nombre) : x.topic}`; }))];
  const refl = S.refl.filter(r => ts(r.created) >= a && ts(r.created) <= b);
  const val = refl.filter(r => r.estado === 'validada'), pts = val.reduce((x, r) => x + r.puntos, 0);
  const talk = (val.slice().sort((x, y) => y.puntos - x.puntos)[0] || refl[0] || null);
  const due = S.notes.filter(n => !n.done && n.due && n.due < ymd(new Date()));
  const gan = S.led.filter(x => !x.w && x.at && ts(x.at) >= a && ts(x.at) <= b && !/^(hucha|cambio|buy):/.test(x.k));
  const wal = { e: gan.reduce((x, y) => x + Math.max(0, y.e || 0), 0), c: gan.reduce((x, y) => x + Math.max(0, y.c || 0), 0) };
  return { a, b, mon, games, topics, refl, val, pts, talk, due, wal, rut: rutinatorWeek(a, b), name: childName() };
}
function reportText(R) {
  const L1 = [], fd = d => new Date(d + 'T12:00').toLocaleDateString(LOC(), { day: 'numeric', month: 'long' });
  L1.push(t('r.title', { x: R.name, a: fd(R.a), b: fd(R.b) }));
  L1.push('', t('r.games'));
  if (R.games.length) R.games.forEach(x => L1.push(`• ${x.g.name}: +${x.xp} XP${x.done ? `, ${t('r.units', { n: x.done, u: pick2(x.g.unit || ['misiones', 'missions']) })}` : ''}${x.days ? ` (${x.days === 1 ? t('r.day') : t('r.days', { n: x.days })})` : ''}`));
  else L1.push('• ' + t('r.noGames'));
  if (R.topics.length) { L1.push('', t('r.topics')); R.topics.forEach(x => L1.push('• ' + x)); }
  L1.push('', t('r.refl'), '• ' + t('r.reflN', { n: R.refl.length, v: R.val.length, p: R.pts }));
  if (R.wal.e || R.wal.c) L1.push('', t('r.wallet'), '• ' + t('r.walletN', R.wal));
  if (R.rut) L1.push('', 'Rutinator', '• ' + t('r.rut', { p: R.rut.pct, ok: R.rut.ok, n: R.rut.exp, c: R.rut.earned }));
  if (R.due.length) L1.push('', t('r.due'), ...R.due.map(n => '• ' + n.title));
  if (R.talk) L1.push('', t('r.talk'), '«' + R.talk.pregunta + '»');
  L1.push('', '— Curionaut');
  return L1.join('\n');
}
let reportOffset = 0;
function reportHTML() {
  const R = buildReport(reportOffset); const fd = d => new Date(d + 'T12:00').toLocaleDateString(LOC(), { day: 'numeric', month: 'short' });
  return `<div class="row" style="justify-content:space-between;margin:0 0 10px"><button class="btn sm" id="rPrev" aria-label="${esc(t('r.prev'))}">‹</button>
    <b>${esc(fd(R.a))} – ${esc(fd(R.b))}</b><button class="btn sm" id="rNext" aria-label="${esc(t('r.next'))}" ${reportOffset >= 0 ? 'disabled' : ''}>›</button></div>
    <div class="stats" style="grid-template-columns:repeat(3,minmax(0,1fr))"><div class="stat"><b>${R.games.reduce((x, g) => x + g.xp, 0)}</b><span>XP</span></div><div class="stat"><b>${R.refl.length}</b><span>${esc(t('r.reflS'))}</span></div><div class="stat"><b>${R.pts}</b><span>${esc(t('book.points'))}</span></div></div>
    <div class="set-sec"><h4>${esc(t('r.games'))}</h4>${R.games.length ? `<ul class="rlist">${R.games.map(x => `<li class="ritem"><b>${esc(x.g.name)}</b> <span class="muted">+${x.xp} XP${x.done ? ` · ${esc(t('r.units', { n: x.done, u: pick2(x.g.unit || ['misiones', 'missions']) }))}` : ''}${x.days ? ` · ${esc(x.days === 1 ? t('r.day') : t('r.days', { n: x.days }))}` : ''}</span></li>`).join('')}</ul>` : `<p class="empty">${esc(t('r.noGames'))}</p>`}</div>
    ${R.topics.length ? `<div class="set-sec"><h4>${esc(t('r.topics'))}</h4><p>${R.topics.map(esc).join('<br>')}</p></div>` : ''}
    ${R.wal.e || R.wal.c ? `<div class="set-sec"><h4>${esc(t('r.wallet'))}</h4><p>${esc(t('r.walletN', R.wal))}</p></div>` : ''}
    ${R.rut ? `<div class="set-sec"><h4>Rutinator</h4><p>${esc(t('r.rut', { p: R.rut.pct, ok: R.rut.ok, n: R.rut.exp, c: R.rut.earned }))}</p></div>` : ''}
    ${R.due.length ? `<div class="set-sec"><h4>${esc(t('r.due'))}</h4><p>${R.due.map(n => esc(n.title)).join('<br>')}</p></div>` : ''}
    ${R.talk ? `<div class="set-sec"><h4>${esc(t('r.talk'))}</h4><p class="mdato" style="margin:0">«${esc(R.talk.pregunta)}»<br><span class="small">${esc(R.talk.respuesta.slice(0, 220))}${R.talk.respuesta.length > 220 ? '…' : ''}</span></p></div>` : ''}
    <div class="row" style="justify-content:flex-start"><button class="btn" id="rCopy">${esc(t('r.copy'))}</button>${navigator.share ? `<button class="btn" id="rShare">${esc(t('r.share'))}</button>` : ''}</div>
    <p class="muted small">${esc(t('r.note'))}</p>`;
}
function bindReport() {
  const R = () => reportText(buildReport(reportOffset));
  const pv = $('#rPrev'); if (pv) pv.onclick = () => { reportOffset--; showParent('inf'); };
  const nx = $('#rNext'); if (nx) nx.onclick = () => { if (reportOffset < 0) { reportOffset++; showParent('inf'); } };
  const cp = $('#rCopy'); if (cp) cp.onclick = async () => { try { await navigator.clipboard.writeText(R()); toast(t('r.copied')); } catch (e) { prompt(t('r.copy'), R()); } };
  const sh = $('#rShare'); if (sh) sh.onclick = () => navigator.share({ title: 'Curionaut', text: R() }).catch(() => {});
}
function showParent(tab) {
  const pend = S.refl.filter(r => r.estado === 'pendiente'), done = S.refl.filter(r => r.estado !== 'pendiente').slice(0, 40);
  const nm = r => (ME && ME.role === 'padre' && r.member && FAM[r.member]) || childName();
  const body = tab === 'pend' ? (pend.length ? `<p class="muted small">${esc(t('p.how'))}</p><ul class="rlist">${pend.map(r => `<li class="ritem rev" data-id="${esc(r.id)}">
        <div class="rm" style="margin:0 0 6px"><span>${esc(nm(r))}</span><span>${esc(fmtShort(r.created))}</span><span>${esc(r.ctx || gameName(r.game))}</span></div>
        <div class="rq">${esc(r.pregunta)}</div><div class="ra">${esc(r.respuesta)}</div>
        <textarea maxlength="300" placeholder="${esc(t('p.note', { x: nm(r) }))}" aria-label="${esc(t('p.note', { x: nm(r) }))}"></textarea>
        <div class="acts"><button class="btn sm ok" data-p="10">${esc(t('p.v10'))}</button><button class="btn sm ok" data-p="25">${esc(t('p.v25'))}</button><button class="btn sm ok" data-p="50">${esc(t('p.v50'))}</button><button class="btn sm" data-p="back">${esc(t('p.back'))}</button></div>
        <p class="msg"></p></li>`).join('')}</ul>` : `<p class="empty">${esc(t('p.none'))}</p>`)
    : tab === 'inf' ? reportHTML()
    : tab === 'hist' ? (done.length ? `<ul class="rlist">${done.map(reflItem).join('')}</ul>` : `<p class="empty">${esc(t('p.noneH'))}</p>`)
    : `<p>${esc(S.mentorOff ? t('p.mentorOff') : t('p.mentorOn'))}</p><div class="row" style="justify-content:flex-start"><button class="btn" id="pTog">${esc(t('p.toggle'))}</button></div>
       <div class="set-sec"><h4 id="pMultL">${esc(t('p.eco'))}</h4><p class="muted small">${esc(t('p.ecoHelp'))}</p><div class="seg" role="group" aria-labelledby="pMultL">${[0.5, 0.75, 1, 1.5, 2].map(m => `<button type="button" data-mult="${m}" aria-pressed="${S.mult === m}">×${String(m).replace('.', ',')}</button>`).join('')}</div></div>
       <div class="set-sec"><h4>${esc(t('p.links'))}</h4><button class="btn" id="pLinks">${esc(t('p.editLinks'))}</button></div>`;
  modal(`<h3>${esc(t('p.title'))}</h3><div class="tabs" role="tablist">
      <button role="tab" aria-selected="${tab === 'pend'}" data-tab="pend">${esc(t('p.pending'))}${pend.length ? ` (${pend.length})` : ''}</button>
      <button role="tab" aria-selected="${tab === 'inf'}" data-tab="inf">${esc(t('r.tab'))}</button>
      <button role="tab" aria-selected="${tab === 'hist'}" data-tab="hist">${esc(t('p.history'))}</button>
      <button role="tab" aria-selected="${tab === 'set'}" data-tab="set">${esc(t('p.settings'))}</button></div>
    ${body}<div class="row"><button class="btn pri" id="pClose">${esc(t('btn.close'))}</button></div>`, close => {
    $('#pClose').onclick = () => { parentPin = ''; close(); };
    $$('#sheet [data-tab]').forEach(b => b.onclick = () => showParent(b.dataset.tab));
    if (tab === 'inf') bindReport();
    const tg = $('#pTog'); if (tg) tg.onclick = () => { S.mentorOff = !S.mentorOff; save(); renderMentor(); showParent('set'); };
    $$('#sheet [data-mult]').forEach(b => b.onclick = () => { S.mult = Number(b.dataset.mult); save(); showParent('set'); renderNuevo(); if (VIEW === 'juegos') renderOferta(); });
    const pl = $('#pLinks'); if (pl) pl.onclick = () => { close(); editLinks = true; go('inicio', true); renderLinks(); const c = $('#cole'); if (c) c.scrollIntoView(); };
    $$('#sheet .rev [data-p]').forEach(b => b.onclick = async () => {
      const li = b.closest('.rev'), id = li.dataset.id, note = li.querySelector('textarea').value.trim(), msg = li.querySelector('.msg');
      const back = b.dataset.p === 'back'; if (back && !note) { msg.textContent = t('p.needNote'); return; }
      const estado = back ? 'devuelta' : 'validada', puntos = back ? 0 : Number(b.dataset.p);
      $$('#sheet .rev [data-p]').forEach(x => (x.disabled = true));
      const ok = await reviewRefl(id, estado, puntos, note, m => { msg.textContent = t('p.err', { x: m }); });
      $$('#sheet .rev [data-p]').forEach(x => (x.disabled = false));
      if (ok) { toast(t('p.done')); showParent('pend'); renderMentor(); renderGames(); ganar(); }
    });
  }, true);
}
async function reviewRefl(id, estado, puntos, nota, onErr) {
  const r = S.refl.find(x => x.id === id); if (!r) return false;
  if (cloudOn()) {
    if (S.pending.some(o => o.t === 'refl' && o.row.id === id)) await flush();
    const { data, error } = await sb.rpc('estacion_revisar', { p_pin: parentPin || '', p_id: id, p_estado: estado, p_puntos: puntos, p_nota: nota || null });
    if (error || !data || data.ok === false) { onErr((data && data.error) || (error && error.message) || '?'); return false; }
  }
  Object.assign(r, { estado, puntos, nota, revisada: Date.now() }); save(); return true;
}

/* =================== ENLACES DEL COLEGIO =================== */
let editLinks = false;
const DEFAULT_LINKS = () => [{ id: uid(), title: 'Pronote', url: '', color: '#2fb26a', sort: 0 }, { id: uid(), title: 'Pix', url: 'https://app.pix.fr/connexion', color: '#6b4fe0', sort: 1 }];
if (!S.links) { S.links = DEFAULT_LINKS(); save(); }
const letterColor = x => ['#2fb26a', '#6b4fe0', '#e0704f', '#2f8fd8', '#c9a227', '#d84f8f'][[...x].reduce((a, c) => a + c.charCodeAt(0), 0) % 6];
const logoTxt = x => { x = (x || '?').trim(); return x.length <= 3 ? x.toLowerCase() : x[0].toUpperCase(); };
function renderLinks() {
  const Ls = (S.links || []).slice().sort((a, b) => (a.sort || 0) - (b.sort || 0));
  $('#links').innerHTML = Ls.map(l => {
    const ok = /^https:\/\//.test(l.url || ''); const inner = `<span class="lg" style="background:${esc(l.color || letterColor(l.title))}">${esc(logoTxt(l.title))}</span>${esc(l.title)}${ok ? '' : `<small>${esc(t('links.missing'))}</small>`}`;
    const x = editLinks ? `<button class="x" data-del="${esc(l.id)}" aria-label="${esc(t('links.removeA'))} ${esc(l.title)}">✕</button>` : '';
    return ok && !editLinks ? `<a class="link" href="${esc(l.url)}" target="_blank" rel="noopener">${inner}</a>` : `<button class="link ${ok ? '' : 'todo'}" data-edit="${esc(l.id)}">${inner}${x}</button>`;
  }).join('') + (editLinks ? `<button class="link todo" id="addLink"><span class="lg" style="background:var(--line2)">+</span>${esc(t('links.add'))}</button>` : '');
  $('#editLinks').textContent = editLinks ? t('links.done') : t('links.edit');
  $$('#links [data-edit]').forEach(b => b.onclick = e => { if (e.target.closest('[data-del]')) return; const l = S.links.find(x => x.id === b.dataset.edit); if (!editLinks) { parentGate(() => { editLinks = true; renderLinks(); linkForm(l); }); return; } linkForm(l); });
  $$('#links [data-del]').forEach(b => b.onclick = e => { e.stopPropagation(); const l = S.links.find(x => x.id === b.dataset.del); if (!l) return; if (!confirm(t('links.remove', { x: l.title }))) return; S.links = S.links.filter(x => x !== l); save(); renderLinks(); cloudDel(l.id); });
  const a = $('#addLink'); if (a) a.onclick = () => linkForm(null);
}
function linkForm(l) {
  modal(`<h3>${esc(l ? t('links.editT') : t('links.new'))}</h3><p class="muted small">${esc(t('links.safe'))}</p>
  <div class="field"><label for="lkT">${esc(t('links.name'))}</label><input id="lkT" maxlength="40" value="${esc(l ? l.title : '')}"></div>
  <div class="field"><label for="lkU">${esc(t('links.url'))}</label><input id="lkU" inputmode="url" placeholder="https://" value="${esc(l ? l.url : '')}"></div>
  ${l && l.title === 'Pronote' ? `<p class="muted small">${esc(t('links.pronote'))}</p>` : ''}
  <p class="msg" id="lkMsg"></p><div class="row"><button class="btn" id="lkNo">${esc(t('btn.cancel'))}</button><button class="btn pri" id="lkOk">${esc(t('btn.save'))}</button></div>`, close => {
    $('#lkNo').onclick = close; $('#lkOk').onclick = () => {
      const ti = $('#lkT').value.trim(), u = $('#lkU').value.trim(); if (!ti) { $('#lkMsg').textContent = t('links.noname'); return; }
      if (u && !/^https:\/\/[^\s]+\.[^\s]+/.test(u)) { $('#lkMsg').textContent = t('links.badurl'); return; }
      if (l) { l.title = ti; l.url = u; } else { l = { id: uid(), title: ti, url: u, color: letterColor(ti), sort: S.links.length }; S.links.push(l); }
      save(); renderLinks(); cloudUpsertLink(l); close();
    };
  });
}
/* la clave de padre: en la nube, la de Rutinator (la comprueba el servidor); sin cuenta, una clave local */
async function sha(s) { const b = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('estacion|' + s)); return [...new Uint8Array(b)].map(x => x.toString(16).padStart(2, '0')).join(''); }
function parentGate(ok) {
  if (cloudOn() && ME.role === 'padre') { ok(''); return; }
  const local = !cloudOn(); const first = local && !S.localPin;
  modal(`<h3>${esc(t('pin.title'))}</h3><p class="muted small">${esc(local ? (first ? t('pin.local1') : t('pin.local')) : t('pin.cloud'))}</p>
  <div class="field"><label for="pgIn">${esc(t('pin.label'))}</label><input id="pgIn" type="password" autocomplete="off"></div><p class="msg" id="pgMsg" aria-live="polite"></p>
  <div class="row"><button class="btn" id="pgNo">${esc(t('btn.cancel'))}</button><button class="btn pri" id="pgOk">${esc(t('pin.enter'))}</button></div>`, close => {
    const go = async () => {
      const v = $('#pgIn').value; if (!v) return; $('#pgOk').disabled = true;
      try {
        if (local) { const h = await sha(v); if (first) { if (v.length < 4) { $('#pgMsg').textContent = t('pin.short'); $('#pgOk').disabled = false; return; } S.localPin = h; save(); } else if (h !== S.localPin) { $('#pgMsg').textContent = t('pin.wrong'); $('#pgOk').disabled = false; return; } }
        else { const { data, error } = await sb.rpc('verify_parent_pin', { p_pin: v }); if (error || !data) { $('#pgMsg').textContent = error && /esper|wait|bloque/i.test(error.message) ? t('pin.wait') : t('pin.wrong'); $('#pgOk').disabled = false; return; } }
        close(); ok(v);
      } catch (e) { $('#pgMsg').textContent = t('pin.net'); $('#pgOk').disabled = false; }
    };
    $('#pgOk').onclick = go; $('#pgIn').onkeydown = e => { if (e.key === 'Enter') go(); }; $('#pgNo').onclick = close;
  });
}
$('#editLinks').onclick = () => { if (editLinks) { editLinks = false; renderLinks(); return; } parentGate(() => { editLinks = true; renderLinks(); }); };

/* =================== NOTAS Y RECORDATORIOS =================== */
let dueSel = '';
$$('#dueChips .chip').forEach(c => c.onclick = e => {
  if (c.dataset.due === 'x' && e.target.tagName !== 'INPUT') { const i = $('#dueDate'); try { i.showPicker(); } catch (_) { i.focus(); } }
  if (c.dataset.due !== 'x') { dueSel = c.dataset.due === '' ? '' : ymd(addDays(new Date(), +c.dataset.due)); $$('#dueChips .chip').forEach(x => x.classList.toggle('on', x === c)); }
});
$('#dueDate').onchange = e => { dueSel = e.target.value || ''; $$('#dueChips .chip').forEach(x => x.classList.toggle('on', (x.dataset.due === 'x' && !!dueSel) || (!dueSel && x.dataset.due === ''))); };
$('#noteForm').onsubmit = e => { e.preventDefault(); const v = $('#noteIn').value.trim(); if (!v) return; const n = { id: uid(), title: v.slice(0, 140), due: dueSel || null, done: false, created: Date.now() }; S.notes.unshift(n); save(); $('#noteIn').value = ''; renderNotes(); cloudUpsertNote(n); };
function renderNotes() {
  const today = ymd(new Date());
  const list = S.notes.slice().sort((a, b) => (a.done - b.done) || ((a.due || '9999') < (b.due || '9999') ? -1 : (a.due || '9999') > (b.due || '9999') ? 1 : (b.created || 0) - (a.created || 0)));
  $('#notesList').innerHTML = list.length ? list.map(n => `<li class="note ${n.done ? 'done' : ''}"><button class="tk" data-tk="${esc(n.id)}" aria-label="${esc(n.done ? t('notes.undo') : t('notes.done'))}: ${esc(n.title)}" aria-pressed="${n.done}"></button><span class="t">${esc(n.title)}</span>${n.due ? `<span class="due ${!n.done && n.due < today ? 'late' : ''}">${esc(dueLabel(n.due))}</span>` : ''}<button class="del" data-del="${esc(n.id)}" aria-label="${esc(t('notes.delete'))} ${esc(n.title)}">×</button></li>`).join('') : `<li class="empty">${esc(t('notes.empty'))}</li>`;
  $$('#notesList [data-tk]').forEach(b => b.onclick = () => { const n = S.notes.find(x => x.id === b.dataset.tk); n.done = !n.done; save(); renderNotes(); cloudUpsertNote(n); });
  $$('#notesList [data-del]').forEach(b => b.onclick = () => { const n = S.notes.find(x => x.id === b.dataset.del); if (!n) return; S.notes = S.notes.filter(x => x !== n); save(); renderNotes(); cloudDel(n.id); toast(t('notes.del')); });
}

/* =================== NUBE: cola de cambios =================== */
function queue(op) { S.pending.push(op); save(); flush(); }
function cloudUpsertNote(n) { if (!cloudOn()) return; queue({ t: 'up', row: { id: n.id, kind: 'note', title: n.title, due: n.due, done: !!n.done, sort: 0 } }); }
function cloudUpsertLink(l) { if (!cloudOn()) return; queue({ t: 'up', row: { id: l.id, kind: 'link', title: l.title, url: l.url || null, color: l.color || null, sort: l.sort || 0 } }); }
function cloudDel(id) { if (!cloudOn()) return; queue({ t: 'del', id }); }
let flushing = false;
async function flush() {
  if (!cloudOn() || flushing || !S.pending.length) return; flushing = true;
  try {
    while (S.pending.length) {
      const op = S.pending[0]; let r;
      if (op.t === 'up') r = await sb.from('estacion_items').upsert(Object.assign({}, op.row, { updated_at: new Date().toISOString() }));
      else if (op.t === 'refl') r = await sb.from('estacion_reflexiones').insert(op.row);
      else r = await sb.from('estacion_items').delete().eq('id', op.id);
      if (r.error) { if (/fetch|network/i.test(r.error.message)) break; console.warn(r.error.message); }
      S.pending.shift(); save();
    }
    syncDot(S.pending.length ? 'off' : 'ok', S.pending.length ? t('sync.wait') : t('sync.ok'));
  } catch (e) { syncDot('off', t('sync.later')); }
  flushing = false;
}
async function pullItems() {
  const { data, error } = await sb.from('estacion_items').select('*').eq('member_id', ME.id); if (error) throw error;
  const pend = new Set(S.pending.filter(o => o.t === 'up').map(o => o.row.id)), gone = new Set(S.pending.filter(o => o.t === 'del').map(o => o.id));
  const links = data.filter(r => r.kind === 'link'), notes = data.filter(r => r.kind === 'note');
  if (!links.length && !S.cloudLinksSeeded) { S.cloudLinksSeeded = true; S.links.forEach(cloudUpsertLink); }
  else S.links = links.filter(r => !gone.has(r.id)).map(r => ({ id: r.id, title: r.title, url: r.url || '', color: r.color, sort: r.sort })).concat(S.links.filter(l => pend.has(l.id) && !links.some(r => r.id === l.id)));
  const localOnly = S.notes.filter(n => !notes.some(r => r.id === n.id) && !S.notesSynced);
  S.notes = notes.filter(r => !gone.has(r.id)).map(r => { const p = S.pending.find(o => o.t === 'up' && o.row.id === r.id); return p ? { id: r.id, title: p.row.title, due: p.row.due, done: p.row.done, created: Date.parse(r.created_at) } : { id: r.id, title: r.title, due: r.due, done: r.done, created: Date.parse(r.created_at) }; })
    .concat(S.notes.filter(n => pend.has(n.id) && !notes.some(r => r.id === n.id)));
  if (localOnly.length) localOnly.forEach(n => { S.notes.push(n); cloudUpsertNote(n); });
  S.notesSynced = true; save();
}

/* =================== RUTINATOR =================== */
const dayIdx = d => (d.getDay() + 6) % 7;
async function pullRutinator() {
  if (loadRut()) return S.cache.rut;
  const now = new Date(), today = ymd(now), di = dayIdx(now), out = {};
  const q = await Promise.all([
    sb.from('tasks').select('id,title,category,day_of_week,active,adhoc_date').eq('active', true),
    sb.from('task_status').select('task_id,status,date').eq('member_id', ME.id).eq('date', today),
    sb.from('ledger_entries').select('amount,currency').eq('member_id', ME.id).limit(20000),
    sb.from('calendar_events').select('id,date,time,type,title,done').gte('date', today).lte('date', ymd(addDays(now, 7))).order('date').order('time'),
    sb.from('schedule_blocks').select('*').eq('day_of_week', di).order('start_min'),
    sb.from('settings').select('week_parity').maybeSingle()]);
  const [tk, ts, lg, ev, sch, st] = q.map(r => (r.error ? null : r.data));
  if (tk && ts) { const mine = tk.filter(x => x.category !== 'ocio' && (x.adhoc_date ? x.adhoc_date === today : x.day_of_week === di)); const ok = new Set(ts.filter(s => s.status === 'pendiente' || s.status === 'aprobado').map(s => s.task_id)); out.tasks = { total: mine.length, done: mine.filter(x => ok.has(x.id)).length }; }
  if (lg) { out.credits = Math.round(lg.filter(r => (r.currency || 'credito') === 'credito').reduce((a, r) => a + Number(r.amount), 0) * 10) / 10; out.stars = Math.round(lg.filter(r => r.currency === 'estrella').reduce((a, r) => a + Number(r.amount), 0)); }
  if (ev) out.events = ev.slice(0, 6);
  if (sch) { const par = (st && st.week_parity) || 'todas'; out.blocks = sch.filter(b => !b.parity || b.parity === 'todas' || par === 'todas' || b.parity === par).map(b => ({ s: b.start_min, e: b.end_min, t: b.subject || b.label || b.type, room: b.room || '', kind: b.type })); }
  out.at = Date.now(); S.cache.rut = out; save(); return out;
}
/* Rutinator v3 vive en la misma dirección (curionaut.org/rutinator/): se lee de este aparato.
   Misma lógica que su núcleo (tasks.js, schedule.js, ledger.js) para que los números coincidan. */
const RUT3 = 'rutineitor.v3.estado';
const minOf = h => { const m = /^(\d{1,2}):(\d{2})$/.exec(h || ''); return m ? (+m[1]) * 60 + (+m[2]) : null; };
function readRutinatorV3() {
  const e = read(RUT3); if (!e || !e.tareas) return null;
  const now = new Date(), today = ymd(now), di = dayIdx(now), out = { v3: true };
  const blocks = Object.values(e.horario || {}).filter(b => b.dia === di).sort((a, b) => (minOf(a.inicio) || 0) - (minOf(b.inicio) || 0));
  const cat = Object.values(e.tareas || {}).filter(x => x.tipo !== 'habito' && x.activa !== false && (x.tipo === 'puntual' ? x.fecha === today : (!x.dias || x.dias === 'todos' || (Array.isArray(x.dias) && x.dias.includes(di)))));
  const gen = blocks.filter(b => b.requierePreparacion).map(b => ({ id: 'gen_' + b.id, tipo: 'estandar' }));
  const libre = Object.values(e.compras || {}).some(c => c.fecha === today && c.itemId === 'p_sintareas' && c.estado === 'aprobada');
  let todas = cat.concat(gen); if (libre) todas = todas.filter(x => x.tipo === 'obligatoria');
  const hecha = id => { const m = (e.marcas || {})[today + '__' + id]; return m && (m.estado === 'aprobada' || m.estado === 'pendiente'); };
  out.tasks = { total: todas.length, done: todas.filter(x => hecha(x.id)).length };
  const L3 = Object.values(e.ledger || {}); const sum = f => Math.round(L3.filter(f).reduce((a, m) => a + Number(m.cantidad || 0), 0) * 10) / 10;
  const semanal = e.ajustes && e.ajustes.modoSaldo && e.ajustes.modoSaldo.valor === 'semanal';
  const lunes = ymd(addDays(now, -di));
  out.credits = sum(m => m.cuenta === 'semana' && (!semanal || (m.fecha >= lunes && m.fecha <= ymd(addDays(now, 6 - di)))));
  out.stars = Math.round(sum(m => m.cuenta === 'estrellas')); out.hucha = sum(m => m.cuenta === 'hucha');
  out.events = Object.values(e.eventos || {}).filter(x => x.fecha >= today && x.fecha <= ymd(addDays(now, 7)))
    .sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : (minOf(a.hora) || -1) - (minOf(b.hora) || -1)))
    .slice(0, 6).map(x => ({ date: x.fecha, time: x.hora || null, type: 'cita', title: x.titulo, done: false }));
  out.blocks = blocks.map(b => ({ s: minOf(b.inicio) || 0, e: minOf(b.fin) || 0, t: b.titulo, room: '', kind: b.tipo === 'comida' ? 'comida' : b.tipo }));
  out.at = Date.now(); return out;
}
function loadRut() { const r = readRutinatorV3(); if (r) { S.cache.rut = r; save(); } return !!r; }
const hm = m => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
function renderHoy() {
  const r = S.cache.rut || {}; const n = new Date(), m = n.getHours() * 60 + n.getMinutes(); const bl = r.blocks || [];
  const cur = bl.find(b => b.s <= m && m < b.e), nx = bl.find(b => b.s > m); let html = '';
  if (cur) html = `<div class="now"><span class="ic">${cur.kind === 'comida' ? '🍽' : '🏫'}</span><div><div class="big">${esc(cur.t)}${cur.room ? ` · ${esc(cur.room)}` : ''}</div><div class="muted small">${esc(t('hoy.until', { h: hm(cur.e) }))}${nx ? ` · ${esc(t('hoy.then', { x: nx.t }))}` : ` · ${esc(t('hoy.end'))}`}</div></div></div>`;
  else if (nx) html = `<div class="now"><span class="ic">🕐</span><div><div class="big">${esc(t('hoy.next', { x: nx.t }))}</div><div class="muted small">${esc(t('hoy.at', { h: hm(nx.s) }))}${nx.room ? ` · ${esc(nx.room)}` : ''}</div></div></div>`;
  else if (cloudOn() || (S.cache.rut && S.cache.rut.v3)) html = `<div class="now"><span class="ic">🌙</span><div><div class="big">${esc(t('hoy.free'))}</div><div class="muted small">${esc(t('hoy.freeS'))}</div></div></div>`;
  else html = `<p class="empty">${esc(t('hoy.login'))}</p>`;
  $('#nowBox').innerHTML = html;
  const ev = r.events || [];
  $('#agenda').innerHTML = ev.length ? ev.map(e => `<li class="${e.done ? 'done' : ''}"><span class="d">${esc(dueLabel(e.date))}${e.time ? `<br>${esc(e.time)}` : ''}</span><span class="t">${e.type === 'cita' ? '📌' : '🔔'} ${esc(e.title)}</span></li>`).join('') : (cloudOn() || (S.cache.rut && S.cache.rut.v3) ? `<li class="empty" style="background:none;border:0;padding:4px 0">${esc(t('hoy.empty'))}</li>` : '');
}
function ring(done, total) { const p = total ? done / total : 0, C = 2 * Math.PI * 26; return `<svg class="ring" viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="26" fill="none" stroke="#26324f" stroke-width="8"/><circle cx="32" cy="32" r="26" fill="none" stroke="${p >= 1 ? '#4fd18b' : '#f2a65a'}" stroke-width="8" stroke-linecap="round" stroke-dasharray="${(C * p).toFixed(1)} ${C.toFixed(1)}" transform="rotate(-90 32 32)"/></svg>`; }
function renderRut() {
  const r = S.cache.rut; const href = r && r.v3 ? '../rutinator/' : CFG.rutinatorUrl;   // v3 del aparato, o la v2 de la configuración
  const open = href ? `<a class="btn pri" style="width:100%;margin-top:12px" href="${esc(href)}">${esc(t('rut.open'))}</a>` : '';
  if (!cloudOn() && !(r && r.v3)) { $('#rutBox').innerHTML = `<p class="empty">${esc(t('rut.none'))}</p>${open}`; return; }
  if (!r) { $('#rutBox').innerHTML = '<div class="sk"></div>'; return; }
  const k = r.tasks || { done: 0, total: 0 };
  $('#rutBox').innerHTML = `<div class="stats"><div class="stat">${ring(k.done, k.total)}<span>${esc(t('rut.tasks', { a: k.done, b: k.total }))}</span></div><div class="stat"><b>${r.credits ?? '–'}</b><span>${esc(t('rut.credits'))}</span></div><div class="stat"><b>⭐ ${r.stars ?? '–'}</b><span>${esc(t('rut.stars'))}</span></div></div>${r.hucha != null ? `<p class="muted small" style="margin:10px 0 0;text-align:center">🐷 ${esc(t('rut.hucha', { n: r.hucha }))}</p>` : ''}${open}`;
}

/* =================== MONEDERO: el libro de puntos =================== */
/* Las reglas (cuánto vale cada cosa) están en economia.js. Aquí se apunta cada logro una sola vez:
   la clave del apunte es única, así que repetir un nivel o abrir la Estación dos veces no paga de nuevo. */
const SVG_E = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M13 2L5 13h6l-1 9 8-12h-6z" fill="currentColor"/></svg>';
const SVG_C = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9z" fill="currentColor"/></svg>';
const SVG_H = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a7 6 0 0 1 7-6h3a6 6 0 0 1 5.7 4H21v4h-1.6a6 6 0 0 1-2.4 2.6V19h-3v-1.5h-3V19H8v-2.3A6 6 0 0 1 4 12z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M10 6.5h4" stroke="currentColor" stroke-width="2" stroke-linecap="round"/><circle cx="16.5" cy="11" r="1" fill="currentColor"/></svg>';
const JCOL = { 'chrono-ohm': '#f2a65a', pitagoras: '#ffd27a', philoquest: '#7ec8ff', umbral: '#c77dff', refugio: '#6fd99a', cuaderno: '#5ee0ff', '': '#ffd27a' };
const num = n => (n < 0 ? '−' : '') + Math.abs(Math.round(n)).toLocaleString(LOC());
/* cantidad con su icono; sign: pone el + delante de lo ganado */
const cur = (n, k, sign) => `<span class="cur ${k}${n < 0 ? ' neg' : ''}">${k === 'e' ? SVG_E : SVG_C}<b>${sign && n > 0 ? '+' : ''}${num(n)}</b><span class="sr"> ${esc(t(k === 'e' ? 'w.energy' : 'w.crystals'))}</span></span>`;
const coste = p => (p ? (p.e ? cur(p.e, 'e') : '') + (p.c ? cur(p.c, 'c') : '') : '');
const hoy = () => ymd(new Date());
const saldoAhora = () => ECO.saldo(S.led);
const jname = g => (ECO.JUEGOS[g] ? tt(ECO.JUEGOS[g]) : 'Curionaut');
const esPadre = () => !!(ME && ME.role === 'padre');
const LBL = {};            // clave del logro → su texto (se rellena al leer las partidas)
let avances = [];          // juegos en los que detect() acaba de ver un avance
function nombrePieza(slot, id) {
  if (slot === 'fondo') { const f = ARTE.FONDOS.find(x => x.id === id); return f ? tt(f.n) : id; }
  const g = ARTE.GRUPOS.find(x => x.id === slot), o = ARTE.pieza(slot, id);
  return o && o.n ? `${g ? tt(g.n) + ' · ' : ''}${tt(o.n)}` : (g ? tt(g.n) : slot);
}
function etiqueta(x) {
  const k = x.k || ''; let m;
  if (LBL[k]) return tt(LBL[k]);
  if ((m = /^dia:[^:]+:(.+)$/.exec(k))) return t('l.dia', { x: jname(m[1]) });
  if (/^oferta:/.test(k)) return t('l.oferta', { x: jname(x.g) });
  if (/^cambio:/.test(k)) return t(x.c > 0 ? 'l.buyC' : 'l.sellC');
  if ((m = /^hucha:[^:]+:(in|out)$/.exec(k))) return m[1] === 'in' ? t('l.huIn', { d: (x.x && x.x.d) || 3 }) : t(x.x && x.x.premio > 0 ? 'l.huOut' : 'l.huBreak');
  if ((m = /^buy:([^:]+):(.+)$/.exec(k))) return t('l.buy', { x: nombrePieza(m[1], m[2]) });
  if (/^refl:/.test(k)) return t('l.refl');
  return t('l.logro', { x: jname(x.g) });
}
/* la oferta del día se decide una vez al día: el juego en el que hace más tiempo que no gana nada */
function ofertaHoy() {
  const d = hoy(); if (S.oferta && S.oferta.d === d && GAMES.some(g => g.id === S.oferta.g)) return S.oferta.g;
  const ult = {}; S.led.forEach(x => { if (x.g && x.at && !x.w && GAMES.some(g => g.id === x.g)) { const k = ymd(new Date(x.at)); if (!ult[x.g] || k > ult[x.g]) ult[x.g] = k; } });
  S.oferta = { d, g: ECO.ofertaDelDia(ult, GAMES.map(g => g.id), d) }; save(); return S.oferta.g;
}
/* títulos recién ganados: se apunta la fecha y, si hay sitio, se lucen solos */
function titulosNuevos() {
  const tg = ECO.titulosGanados(S.led), nt = tg.filter(id => !S.titAt[id]);
  nt.forEach(id => { S.titAt[id] = Date.now(); if (S.tit.length < 3 && !S.tit.includes(id)) S.tit.push(id); });
  S.tit = S.tit.filter(id => tg.includes(id)).slice(0, 3);
  return nt;
}
/* mira las partidas y apunta lo que falte. La primera vez paga de golpe todo lo conseguido hasta hoy (apuntes con w). */
function apuntar() {
  if (esPadre()) { avances = []; return { nuevos: [], titulos: [], primera: false }; }
  const now = Date.now(), d = hoy(), have = new Set(S.led.map(x => x.k)), nuevos = [], primera = !S.ecoAt;
  const add = (k, e, c, g) => { if (have.has(k)) return; const x = { k, e: ECO.escala(e || 0, S.mult), c: c || 0, g: g || '', at: now }; if (primera) x.w = 1; S.led.push(x); have.add(k); nuevos.push(x); };
  let cand = []; try { cand = ECO.logros(ECO.hechos(read)); } catch (e) { cand = []; }
  try { cand = cand.concat(ECO.logrosReflexion(S.refl.filter(r => S.mias[r.id]), ymd)); } catch (e) {}
  cand.forEach(a => { LBL[a.k] = a.l; add(a.k, a.e, a.c, a.g); });
  if (!primera && avances.length) { const of = ofertaHoy(); avances.forEach(g => { add(`dia:${d}:${g}`, ECO.V.dia, 0, g); if (g === of) add(`oferta:${d}`, ECO.V.oferta, 0, g); }); }
  avances = [];
  if (primera) S.ecoAt = now;
  const titulos = titulosNuevos();
  if (nuevos.length || titulos.length || primera) save();
  return { nuevos, titulos, primera };
}
/* un movimiento hecho a mano: mercado, hucha o una compra */
function mover(x) {
  S.led.push(Object.assign({ e: 0, c: 0, g: '', at: Date.now() }, x));
  const nt = titulosNuevos(); save(); renderWallet(); renderHero(); renderNuevo();
  if (nt.length) setTimeout(() => toast(`${t('new.title')}: ${tituloTxt(nt[0])}`), 3000);
}
const tituloTxt = id => { const x = ECO.TITULOS.find(y => y.id === id); return x ? ECO.nombreTitulo(x, L, S.gen) : ''; };
/* apunta lo nuevo y avisa con un mensaje corto */
function ganar(quiet) {
  const r = apuntar();
  if (!quiet && (r.nuevos.length || r.titulos.length)) { renderWallet(); renderHero(); renderNuevo(); renderGames(); if (VIEW !== 'inicio') renderView(); }
  if (!r.primera && r.nuevos.length) {
    const e = r.nuevos.reduce((a, x) => a + x.e, 0), c = r.nuevos.reduce((a, x) => a + x.c, 0);
    toast(`${e ? `+${e} ⚡ ` : ''}${c ? `+${c} 💎 ` : ''}· ${etiqueta(r.nuevos[0])}${r.nuevos.length > 1 ? ' ' + t('new.more', { n: r.nuevos.length - 1 }) : ''}`);
  } else if (!r.primera && r.titulos.length) toast(`${t('new.title')}: ${tituloTxt(r.titulos[0])}`);
  return r;
}
function confirma(html, okTxt, onOk) {
  modal(`${html}<div class="row"><button class="btn" id="cfNo">${esc(t('btn.cancel'))}</button><button class="btn pri" id="cfOk">${esc(okTxt)}</button></div>`, close => { $('#cfNo').onclick = close; $('#cfOk').onclick = () => { close(); onOk(); }; });
}

/* =================== PANTALLAS =================== */
const VIEWS = ['inicio', 'juegos', 'monedero', 'pasaporte', 'yo'];
let VIEW = 'inicio';
function go(v, keep) {
  if (!VIEWS.includes(v)) v = 'inicio'; VIEW = v;
  VIEWS.forEach(x => { $('#v-' + x).hidden = x !== v; });
  $$('nav [data-go]').forEach(a => { const on = a.dataset.go === v; a.classList.toggle('on', on); if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  $('#hero').classList.toggle('mini', v !== 'inicio');
  renderView();
  if (!keep) { try { scrollTo({ top: 0, behavior: 'instant' }); } catch (e) { scrollTo(0, 0); } }
  if (!/^#mudanza=/.test(location.hash)) { try { history.replaceState(null, '', v === 'inicio' ? location.pathname + location.search : '#' + v); } catch (e) {} }
}
function renderView() {
  if (VIEW === 'juegos') renderOferta(); else if (VIEW === 'monedero') renderMonedero(); else if (VIEW === 'pasaporte') renderPasaporte(); else if (VIEW === 'yo') renderYo();
}
document.addEventListener('click', e => { const a = e.target.closest && e.target.closest('[data-go]'); if (!a || $('#main').hidden) return; e.preventDefault(); go(a.dataset.go); });
addEventListener('hashchange', () => { const h = location.hash.slice(1); if (VIEWS.includes(h) && h !== VIEW && !$('#main').hidden) go(h); });
addEventListener('beforeprint', () => { if (!$('#main').hidden) renderPasaporte(); });

function aplicaFondo() { $('#fondo').className = 'fx f-' + S.fondo; }
function renderWallet() {
  const s = saldoAhora(), w = $('#wal'); $('#wE').textContent = num(s.e); $('#wC').textContent = num(s.c);
  w.title = t('w.title', { e: num(s.e), c: num(s.c) });
}
const chipsTitulos = () => S.tit.map(id => ECO.TITULOS.find(x => x.id === id)).filter(Boolean).map(x => `<span class="tchip" style="--tc:${JCOL[x.g] || JCOL['']}">${esc(ECO.nombreTitulo(x, L, S.gen))}</span>`).join('');
function renderHero() {
  const a = $('#heroAv'); a.innerHTML = ARTE.avatar(S.av); a.setAttribute('aria-label', t('yo.title'));
  $('#heroTit').innerHTML = chipsTitulos();
}

/* ---------- Inicio: novedades ---------- */
function renderNuevo() {
  const box = $('#nuevoBox'); if (!box) return;
  const gan = S.led.filter(x => (x.e > 0 || x.c > 0) && !/^(hucha|cambio):/.test(x.k));
  const bienv = gan.filter(x => x.w), rec = gan.filter(x => !x.w).map((x, i) => ({ x, i })).sort((a, b) => (b.x.at - a.x.at) || (b.i - a.i)).map(o => o.x);
  const of = GAMES.find(g => g.id === ofertaHoy()), ofDone = S.led.some(x => x.k === 'oferta:' + hoy());
  const tNew = Object.keys(S.titAt).filter(id => Date.now() - S.titAt[id] < 5 * 864e5 && !(bienv.length && !rec.length)).sort((a, b) => S.titAt[b] - S.titAt[a]).slice(0, 2);
  let html = '';
  if (rec.length) html = `<p class="muted small" style="margin:0 0 8px">${esc(t('new.last'))}</p><ul class="nlist">${rec.slice(0, 4).map(movItem).join('')}</ul>`;
  else if (bienv.length) { const e = bienv.reduce((a, x) => a + x.e, 0), c = bienv.reduce((a, x) => a + x.c, 0);
    html = `<p style="margin:0 0 10px">${esc(t('new.welcome'))}</p><div class="nbig">${e ? cur(e, 'e', 1) : ''}${c ? cur(c, 'c', 1) : ''}</div>`; }
  else html = `<p style="margin:0">${esc(t('new.start'))}</p>`;
  if (tNew.length) html += `<ul class="nlist" style="margin-top:8px">${tNew.map(id => `<li><div class="nl"><small>${esc(t('new.title'))}</small><b>${esc(tituloTxt(id))}</b></div><a class="btn sm" href="#pasaporte" data-go="pasaporte">${esc(t('nav.pasaporte'))}</a></li>`).join('')}</ul>`;
  if (of && !ofDone && !esPadre()) html += `<p class="noffer"><a href="#juegos" data-go="juegos">${esc(t('new.offer', { n: ECO.escala(ECO.V.oferta, S.mult), x: of.name }))}</a></p>`;
  html += `<div class="nfoot">${gan.length ? `<a class="btn sm" href="#monedero" data-go="monedero">${esc(t('new.wallet'))}</a>` : `<a class="btn sm pri" href="#juegos" data-go="juegos">${esc(t('new.games'))}</a>`}</div>`;
  box.innerHTML = html;
}
const movItem = x => `<li><div class="nl">${esc(etiqueta(x))}<small>${esc(fmtShort(x.at))}</small></div><div class="nv">${x.e ? cur(x.e, 'e', 1) : ''}${x.c ? cur(x.c, 'c', 1) : ''}</div></li>`;

/* ---------- Juegos: oferta del día ---------- */
function renderOferta() {
  const el = $('#oferta'); if (!el) return; const g = GAMES.find(x => x.id === ofertaHoy()); if (!g || esPadre()) { el.hidden = true; return; }
  const done = S.led.some(x => x.k === 'oferta:' + hoy()), n = ECO.escala(ECO.V.oferta, S.mult); el.hidden = false;
  el.className = 'card c-oferta' + (done ? ' done' : '');
  el.innerHTML = `<div class="ot"><h2><span class="ico">${SVG_E}</span>${esc(t('of.title'))}</h2><p>${esc(done ? t('of.done') : t('of.text', { x: g.name, n }))}</p>${done ? '' : `<p class="muted small">${esc(t('of.why'))}</p>`}</div>${done ? '' : `<a class="btn pri" href="${esc(g.url)}">${esc(t('of.go', { x: g.name }))}</a>`}`;
}

/* ---------- Monedero: saldos, mercado, hucha y movimientos ---------- */
let huAmt = 0, huD = 7;
function renderMonedero() {
  const box = $('#monBox'); if (!box) return;
  const s = saldoAhora(), d = hoy(), p = ECO.precio(d), v = ECO.venta(d), ayer = ECO.precio(ymd(addDays(new Date(), -1))), now = Date.now();
  const deps = ECO.depositos(S.led, now).filter(x => !x.cerrada), enH = deps.reduce((a, x) => a + x.e, 0);
  const H = ECO.HUCHA, maxA = Math.min(H.max, s.e), puede = s.e >= H.min && deps.length < H.abiertas;
  if (!huAmt) huAmt = 100; if (puede) huAmt = Math.max(H.min, Math.min(maxA, huAmt));
  const corta = ts => new Date(ts).toLocaleDateString(LOC(), { day: 'numeric', month: 'short' });
  const falta = x => { const h = (x.fin - now) / 36e5; return x.lista ? t('hu.ready') : h < 24 ? t('hu.leftH') : Math.ceil(h / 24) === 1 ? t('hu.left1') : t('hu.left', { n: Math.ceil(h / 24) }); };
  const dep = x => { const pct = Math.max(0, Math.min(100, Math.round((now - x.at) / (x.fin - x.at) * 100)));
    return `<div class="dep ${x.lista ? 'ready' : ''}"><div class="dh">${cur(x.e, 'e')}<span aria-hidden="true">→</span>${cur(x.e + x.premio, 'e')}<span class="when">${esc(corta(x.fin))} · ${esc(falta(x))}</span></div>
      <div class="pb" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${esc(t('hu.bar'))}"><i style="width:${pct}%"></i></div>
      <div class="da">${x.lista ? `<button class="btn pri sm" data-col="${esc(x.id)}">${esc(t('hu.collect', { n: num(x.e + x.premio) }))}</button>` : `<button class="btn sm" data-brk="${esc(x.id)}">${esc(t('hu.break'))}</button>`}</div></div>`; };
  const movs = S.led.map((x, i) => ({ x, i })).sort((a, b) => (b.x.at - a.x.at) || (b.i - a.i)).map(o => o.x);
  box.innerHTML = `<div class="mgrid">
    <section class="card c-saldo full"><h2><span class="ico">${SVG_E}</span>${esc(t('mon.bal'))}</h2>
      <div class="bal"><div class="bl e">${SVG_E}<b id="balE">${num(s.e)}</b><span>${esc(t('w.energy'))}</span><small>${esc(t('mon.eHelp'))}</small></div>
        <div class="bl c">${SVG_C}<b id="balC">${num(s.c)}</b><span>${esc(t('w.crystals'))}</span><small>${esc(t('mon.cHelp'))}</small></div>
        <div class="bl h">${SVG_H}<b id="balH">${num(enH)}</b><span>${esc(t('mon.saved'))}</span><small>${esc(t('mon.savedHelp'))}</small></div></div>
      <details class="how"><summary>${esc(t('how.title'))}</summary><ul>${[1, 2, 3, 4, 5].map(i => `<li>${esc(t('how.' + i))}</li>`).join('')}</ul></details></section>
    <section class="card c-mercado"><h2><span class="ico">${SVG_C}</span>${esc(t('mk.title'))}</h2>
      <div class="mk"><span>${esc(t('mk.price'))}</span>${cur(p, 'e')}<small class="muted">${p > ayer ? '▲' : p < ayer ? '▼' : '='} ${esc(t('mk.yest', { p: ayer }))}</small></div>
      <div class="mkb"><button class="btn pri" id="mkBuy" ${s.e < p ? 'disabled' : ''}><span>${esc(t('mk.buy'))}</span><small>${s.e < p ? esc(t('mk.noE', { n: p - s.e })) : `−${p} ⚡`}</small></button>
        <button class="btn" id="mkSell" ${s.c < 1 ? 'disabled' : ''}><span>${esc(t('mk.sell'))}</span><small>${s.c < 1 ? esc(t('mk.noC')) : `+${v} ⚡`}</small></button></div>
      <p class="muted small" style="margin:12px 0 0">${esc(t('mk.note'))}</p></section>
    <section class="card c-hucha"><h2><span class="ico">${SVG_H}</span>${esc(t('hu.title'))}</h2>
      <p class="muted small" style="margin:0 0 10px">${esc(t('hu.lead'))}</p>
      ${deps.length ? `<div class="deps">${deps.map(dep).join('')}</div>` : ''}
      ${puede ? `<div class="hform"><label for="huIn">${esc(t('hu.amount'))}</label><input id="huIn" type="number" inputmode="numeric" min="${H.min}" max="${maxA}" step="10" value="${huAmt}">
        <span class="lab" id="huTL">${esc(t('hu.term'))}</span><div class="seg" role="group" aria-labelledby="huTL">${ECO.PLAZOS.map(z => `<button type="button" data-hd="${z.d}" aria-pressed="${huD === z.d}">${esc(t('hu.days', { d: z.d }))} · +${z.pct} %</button>`).join('')}</div>
        <p class="hprev" id="huPrev" aria-live="polite"></p><p class="msg" id="huMsg" aria-live="polite"></p><button class="btn pri" id="huGo">${esc(t('hu.save'))}</button></div>`
      : `<p class="empty">${esc(deps.length >= H.abiertas ? t('hu.full', { n: H.abiertas }) : t('hu.poor', { n: H.min }))}</p>`}</section>
    <section class="card c-mov full"><h2><span class="ico"><svg viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h10"/></svg></span>${esc(t('mv2.title'))}${movs.length > 12 ? `<button class="btn sm act" id="movAll">${esc(t('mv2.all'))}</button>` : ''}</h2>
      ${movs.length ? `<ul class="nlist">${movs.slice(0, 12).map(movItem).join('')}</ul>` : `<p class="empty">${esc(t('mv2.none'))}</p>`}</section></div>`;
  const cambio = () => 'cambio:' + Date.now().toString(36);
  $('#mkBuy').onclick = () => confirma(`<h3>${esc(t('mk.buyQ', { p }))}</h3>`, t('mk.do'), () => { if (saldoAhora().e < p) return; mover({ k: cambio(), e: -p, c: 1 }); toast(t('mk.done')); renderMonedero(); });
  $('#mkSell').onclick = () => confirma(`<h3>${esc(t('mk.sellQ', { p: v }))}</h3><p class="muted">${esc(t('mk.sellW', { q: p }))}</p>`, t('mk.do'), () => { if (saldoAhora().c < 1) return; mover({ k: cambio(), e: v, c: -1 }); toast(t('mk.done')); renderMonedero(); });
  const all = $('#movAll'); if (all) all.onclick = () => modal(`<h3>${esc(t('mv2.title'))}</h3><ul class="nlist" style="margin-top:10px">${movs.slice(0, 200).map(movItem).join('')}</ul><div class="row"><button class="btn pri" id="mvX">${esc(t('btn.close'))}</button></div>`, c => { $('#mvX').onclick = c; }, true);
  $$('#monBox [data-col]').forEach(b => b.onclick = () => { const x = deps.find(y => y.id === b.dataset.col); if (!x || Date.now() < x.fin) return; mover({ k: `hucha:${x.id}:out`, e: x.e + x.premio, x: { d: x.d, premio: x.premio } }); toast(t('hu.got', { n: num(x.e + x.premio) })); renderMonedero(); });
  $$('#monBox [data-brk]').forEach(b => b.onclick = () => { const x = deps.find(y => y.id === b.dataset.brk); if (!x) return;
    confirma(`<h3>${esc(t('hu.breakQ'))}</h3><p>${esc(t('hu.breakW', { a: num(x.e), i: num(x.premio), x: falta(x) }))}</p>`, t('hu.break'), () => { mover({ k: `hucha:${x.id}:out`, e: x.e, x: { d: x.d, premio: 0 } }); toast(t('hu.broken', { a: num(x.e) })); renderMonedero(); }); });
  if (puede) {
    const inp = $('#huIn'), val = () => Math.floor(Number(inp.value) || 0);
    const prev = () => { const a = val(), ok = a >= H.min && a <= maxA; $('#huMsg').textContent = '';
      $('#huPrev').textContent = ok ? t('hu.preview', { f: new Date(Date.now() + huD * 864e5).toLocaleDateString(LOC(), { weekday: 'long', day: 'numeric', month: 'long' }), n: num(a + ECO.interes(a, huD)), a: num(a), i: num(ECO.interes(a, huD)) }) : t('hu.min', { a: H.min, b: maxA }); };
    inp.oninput = () => { huAmt = val() || huAmt; prev(); };
    $$('#monBox [data-hd]').forEach(b => b.onclick = () => { huD = Number(b.dataset.hd); $$('#monBox [data-hd]').forEach(x => x.setAttribute('aria-pressed', String(x === b))); prev(); });
    $('#huGo').onclick = () => { const a = val(); if (!(a >= H.min && a <= maxA)) { $('#huMsg').textContent = t('hu.min', { a: H.min, b: maxA }); inp.focus(); return; }
      mover({ k: `hucha:${Date.now().toString(36)}:in`, e: -a, x: { d: huD } }); toast(t('hu.saved')); renderMonedero(); };
    prev();
  }
}

/* ---------- Pasaporte: títulos y saberes ---------- */
const pasOpen = {};        // áreas con «por demostrar» desplegado (se recuerda mientras la Estación está abierta)
function renderPasaporte() {
  const box = $('#pasBox'); if (!box) return; const byK = {}; S.led.forEach(x => { byK[x.k] = x; });
  const gan = ECO.titulosGanados(S.led), name = (ME && ME.display_name) || childName(), hechosN = ECO.SABERES.filter(x => byK[x.k]).length;
  const tits = ECO.TITULOS.map((x, i) => ({ x, i, got: gan.includes(x.id) })).sort((a, b) => (b.got - a.got) || (a.i - b.i)).map(({ x, got }) => {
    const on = S.tit.includes(x.id), nm = esc(ECO.nombreTitulo(x, L, S.gen)), st = `style="--tc:${JCOL[x.g] || JCOL['']}"`;
    return got ? `<button class="tit got ${on ? '' : 'off'}" data-tit="${esc(x.id)}" aria-pressed="${on}" ${st}><b>${nm}</b><small>${esc(jname(x.g))}</small><span class="st">${esc(on ? t('tit.on') : t('tit.wear'))}</span></button>`
      : `<div class="tit lock" ${st}><b>${nm}</b><small>${esc(tt(x.como))}</small></div>`; }).join('');
  /* lo demostrado va a la vista; lo que falta, plegado (se abre si se quiere ver) para que la lista no abrume */
  const saber = x => { const e = byK[x.k], donde = `${jname(x.g)} · ${tt(x.d)}`;
    return `<li class="${e ? 'ok' : ''}"><span class="ck" aria-hidden="true"></span><div><span class="sr">${esc(t(e ? 'pas.ok' : 'pas.no'))}: </span><div class="st">${esc(tt(x.s))}</div><small>${esc(e ? t('pas.where', { x: donde, f: fmtShort(e.at) }) : t('pas.todo', { x: donde }))}</small><small>${esc(t('pas.fr'))}: ${esc(x.fr)} · ${esc(t('pas.es'))}: ${esc(x.es)}</small></div></li>`; };
  const areas = ECO.AREAS.map(a => { const list = ECO.SABERES.filter(x => x.a === a.id), ok = list.filter(x => byK[x.k]), no = list.filter(x => !byK[x.k]);
    return `<div class="area ${ok.length ? '' : 'none'}" style="--ac:${a.c}"><h3><i aria-hidden="true"></i>${esc(tt(a.n))}<span>${esc(t('pas.count', { a: ok.length, b: list.length }))}</span></h3>${ok.length ? `<ul class="sab">${ok.map(saber).join('')}</ul>` : ''}${no.length ? `<details class="pend"${pasOpen[a.id] ? ' open' : ''} data-area="${esc(a.id)}"><summary>${esc(t('pas.pending', { n: no.length }))}</summary><ul class="sab">${no.map(saber).join('')}</ul></details>` : ''}</div>`; }).join('');
  box.innerHTML = `<section class="card"><div class="pashead"><span class="hav">${ARTE.avatar(S.av)}</span><div class="pt"><h2>${esc(t('pas.title'))}</h2><p class="pname">${esc(name)}</p><p class="htit">${chipsTitulos()}</p>
        <p class="muted small">${esc(t('pas.lead'))} <span class="printonly">${esc(t('pas.date', { f: new Date().toLocaleDateString(LOC(), { day: 'numeric', month: 'long', year: 'numeric' }) }))} · curionaut.org</span></p></div>
      <button class="btn noprint" id="pasPrint">${esc(t('pas.print'))}</button></div></section>
    <section class="card c-tit"><h2><span class="ico"><svg viewBox="0 0 24 24"><path d="M12 3l2.6 5.6 6 .8-4.4 4.2 1.1 6-5.3-3-5.3 3 1.1-6L3.4 9.4l6-.8z"/></svg></span>${esc(t('tit.title'))}<span class="act cnt">${esc(t('pas.count', { a: gan.length, b: ECO.TITULOS.length }))}</span></h2>
      <p class="muted small noprint" style="margin:0 0 12px">${esc(t('tit.lead'))}</p><div class="titles">${tits}</div></section>
    <section class="card c-sab"><h2><span class="ico"><svg viewBox="0 0 24 24"><rect x="5" y="3" width="14" height="18" rx="2"/><path d="M9 8h6M9 12h6M9 16h3"/></svg></span>${esc(t('pas.skills'))}<span class="act cnt">${esc(t('pas.count', { a: hechosN, b: ECO.SABERES.length }))}</span></h2>
      ${hechosN ? '' : `<p class="empty printonly">${esc(t('pas.empty'))}</p>`}${areas}<p class="muted small" style="margin:14px 0 0">${esc(t('pas.curr'))}</p></section>`;
  $('#pasPrint').onclick = () => window.print();
  $$('#pasBox details.pend').forEach(d => d.ontoggle = () => { pasOpen[d.dataset.area] = d.open; });
  $$('#pasBox [data-tit]').forEach(b => b.onclick = () => { const id = b.dataset.tit;
    if (S.tit.includes(id)) S.tit = S.tit.filter(x => x !== id); else if (S.tit.length >= 3) { toast(t('tit.max')); return; } else S.tit.push(id);
    save(); renderHero(); renderPasaporte(); const again = $(`#pasBox [data-tit="${id}"]`); if (again) again.focus(); });
}

/* ---------- Yo: avatar por piezas, fondos y nombre ---------- */
let yoG = 'pelo';
function tiene(slot, id) { const it = slot === 'fondo' ? ARTE.FONDOS.find(x => x.id === id) : (ARTE.PIEZAS[slot] || []).find(x => x.id === id); return !!it && (!it.p || S.led.some(x => x.k === ARTE.claveCompra(slot, id))); }
const miniFondo = id => `<span class="fthumb"><span class="fx f-${esc(id)}" aria-hidden="true"><i></i><b></b></span></span>`;
function elegir(slot, id) {
  const fondo = slot === 'fondo', it = fondo ? ARTE.FONDOS.find(x => x.id === id) : (ARTE.PIEZAS[slot] || []).find(x => x.id === id); if (!it) return;
  const poner = () => { if (fondo) S.fondo = id; else S.av = Object.assign(ARTE.limpia(S.av), { [slot]: id }); save(); aplicaFondo(); renderHero(); renderYo(); const b = $(`#yoBox [data-slot="${slot}"][data-id="${id}"]`); if (b) b.focus(); };
  if (tiene(slot, id)) { poner(); return; }
  const s = saldoAhora(), p = it.p, fe = Math.max(0, (p.e || 0) - s.e), fc = Math.max(0, (p.c || 0) - s.c), nm = nombrePieza(slot, id);
  const prev = fondo ? `<div class="pv">${miniFondo(id)}</div>` : `<div class="pv"><span class="yobig">${ARTE.muestra(S.av, slot, id)}</span></div>`;
  if (fe || fc) { modal(`<h3>${esc(nm)}</h3>${prev}<p>${esc(t('shop.cost'))} ${coste(p)}</p><p class="hint">${esc(fe ? t('shop.poorE', { n: fe }) : t('shop.poorC', { n: fc }))}</p><div class="row"><button class="btn pri" id="cfOk">${esc(t('btn.ok'))}</button></div>`, c => { $('#cfOk').onclick = c; }); return; }
  confirma(`<h3>${esc(t('shop.buyQ', { x: nm }))}</h3>${prev}<p>${esc(t('shop.cost'))} ${coste(p)} · ${esc(t('shop.after'))} ${cur(s.e - (p.e || 0), 'e')} ${cur(s.c - (p.c || 0), 'c')}</p>`, t('shop.buy'), () => {
    if (tiene(slot, id)) return; const z = saldoAhora(); if (z.e < (p.e || 0) || z.c < (p.c || 0)) return;
    mover({ k: ARTE.claveCompra(slot, id), e: -(p.e || 0), c: -(p.c || 0) }); poner(); toast(t('shop.bought')); });
}
function renderYo() {
  const box = $('#yoBox'); if (!box) return; const cfg = ARTE.limpia(S.av), grp = ARTE.GRUPOS.find(g => g.id === yoG) || ARTE.GRUPOS[0], nube = !!(ME && ME.display_name);
  const estado = (own, on, it, usando) => `<span class="pr">${on ? esc(t(usando)) : own ? (it.p ? esc(t('shop.have')) : '') : coste(it.p)}</span>`;
  const opts = ARTE.PIEZAS[grp.id].map((o, i) => { const own = tiene(grp.id, o.id), on = cfg[grp.id] === o.id;
    return `<button class="opt ${own ? '' : 'lock'}" data-slot="${esc(grp.id)}" data-id="${esc(o.id)}" aria-pressed="${on}">${ARTE.muestra(cfg, grp.id, o.id)}<span class="${o.n ? '' : 'sr'}">${esc(o.n ? tt(o.n) : `${tt(grp.n)} ${i + 1}`)}</span>${estado(own, on, o, 'shop.using')}</button>`; }).join('');
  const fondos = ARTE.FONDOS.map(f => { const own = tiene('fondo', f.id), on = S.fondo === f.id;
    return `<button class="opt ${own ? '' : 'lock'}" data-slot="fondo" data-id="${esc(f.id)}" aria-pressed="${on}">${miniFondo(f.id)}<span>${esc(tt(f.n))}</span>${estado(own, on, f, 'shop.active')}</button>`; }).join('');
  box.innerHTML = `<section class="card c-yo"><h2><span class="ico"><svg viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21c1-5 4-7 8-7s7 2 8 7"/></svg></span>${esc(t('yo.title'))}</h2>
      <div class="yotop"><span class="yobig">${ARTE.avatar(cfg)}</span><div class="yoinfo">
        <div class="field"><label for="yoName">${esc(t('yo.name'))}</label><input id="yoName" maxlength="20" autocomplete="off" value="${esc(nube ? ME.display_name : childName())}" ${nube ? 'readonly' : ''}></div>
        <p class="lab" id="yoGL">${esc(t('yo.gen'))}</p><div class="seg" role="group" aria-labelledby="yoGL">${['m', 'f', 'n'].map(g => `<button type="button" data-gen="${g}" aria-pressed="${S.gen === g}">${esc(t('yo.gen.' + g))}</button>`).join('')}</div></div></div>
      <p class="muted small" style="margin:14px 0 0">${esc(t('yo.lead'))}</p>
      <div class="gtabs" role="group" aria-label="${esc(t('yo.title'))}">${ARTE.GRUPOS.map(g => `<button type="button" data-grp="${esc(g.id)}" aria-pressed="${g.id === grp.id}">${esc(tt(g.n))}</button>`).join('')}</div>
      <div class="opts" id="yoOpts">${opts}</div></section>
    <section class="card c-fondos"><h2><span class="ico"><svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 15l5-4 4 3 3-2 6 4"/></svg></span>${esc(t('yo.bg'))}</h2><div class="opts fopts">${fondos}</div></section>`;
  $$('#yoBox [data-slot]').forEach(b => b.onclick = () => elegir(b.dataset.slot, b.dataset.id));
  $$('#yoBox [data-grp]').forEach(b => b.onclick = () => { yoG = b.dataset.grp; renderYo(); const x = $(`#yoBox [data-grp="${yoG}"]`); if (x) x.focus(); });
  $$('#yoBox [data-gen]').forEach(b => b.onclick = () => { S.gen = b.dataset.gen; save(); renderHero(); renderYo(); const x = $(`#yoBox [data-gen="${S.gen}"]`); if (x) x.focus(); });
  if (!nube) $('#yoName').onchange = e => { S.childName = e.target.value.trim().slice(0, 20); save(); tick(); };
}

/* =================== MUDANZA desde la dirección antigua =================== */
/* La Estación antigua (agomezbl.github.io) manda todas las partidas en el enlace:
   #mudanza=g.<base64url de JSON comprimido con gzip>  (o j.<base64url de JSON> si el navegador no comprime) */
const b64u = { dec: s => { s = s.replace(/-/g, '+').replace(/_/g, '/'); while (s.length % 4) s += '='; const bin = atob(s); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; } };
async function readMove(hashStr) {
  const raw = hashStr.slice('#mudanza='.length); const kind = raw.slice(0, 2), body = raw.slice(2);
  let bytes = b64u.dec(body);
  if (kind === 'g.') { const ds = new DecompressionStream('gzip'); const out = await new Response(new Blob([bytes]).stream().pipeThrough(ds)).arrayBuffer(); bytes = new Uint8Array(out); }
  else if (kind !== 'j.') throw new Error('formato');
  return JSON.parse(new TextDecoder().decode(bytes));
}
const progressOf = (k, v) => { try { const o = JSON.parse(v); if (!o || typeof o !== 'object') return 0;
  const peso = o.xp || (o.ledger ? Object.keys(o.ledger).length : 0) || (o.slots ? Object.keys(o.slots).length : 0);
  return peso * 1e13 + (o.savedAt || o.updated || o.t || 0); } catch (e) { return 0; } };
async function checkMove() {
  if (!/^#mudanza=/.test(location.hash)) return;
  let data = null; try { data = await readMove(location.hash); } catch (e) { data = null; }
  history.replaceState(null, '', location.pathname + location.search);
  if (!data || typeof data !== 'object' || !data.keys) { modal(`<h3>${esc(t('mv.title'))}</h3><p>${esc(t('mv.bad'))}</p><div class="row"><button class="btn pri" id="mvX">${esc(t('btn.ok'))}</button></div>`, c => { $('#mvX').onclick = c; }); return; }
  const names = { 'chrono-ohm-v1': 'Chrono-Ohm', 'expedicion-pitagoras-v1': 'La Expedición Pitágoras', 'philoquest.v3.store': 'PhiloQuest', 'umbral.save.v3': 'UMBRAL', 'curionauta-refugio-0.1': 'El Refugio', 'rutineitor.v3.estado': 'Rutinator', [KEY]: t('mv.station') };
  const rows = Object.keys(data.keys).filter(k => typeof data.keys[k] === 'string' && !/auth|sb-|fake-sess/i.test(k)).map(k => {
    const mine = localStorage.getItem(k); const keepMine = mine && k !== KEY && progressOf(k, mine) >= progressOf(k, data.keys[k]);
    return { k, name: names[k] || k, keepMine };
  });
  const known = rows.filter(r => names[r.k]), other = rows.filter(r => !names[r.k]);
  modal(`<h3>${esc(t('mv.title'))}</h3><p class="muted">${esc(t('mv.lead'))}</p><ul class="rlist">${known.map(r => `<li class="ritem"><b>${esc(r.name)}</b>${r.keepMine ? `<p class="muted small" style="margin:4px 0 0">${esc(t('mv.keep'))}</p>` : ''}</li>`).join('')}${other.length ? `<li class="ritem"><b>${esc(t('mv.other'))}</b> <span class="muted small">(${other.length})</span></li>` : ''}</ul>
    <div class="row"><button class="btn" id="mvNo">${esc(t('btn.cancel'))}</button><button class="btn pri" id="mvGo">${esc(t('mv.go'))}</button></div>`, close => {
    $('#mvNo').onclick = close;
    $('#mvGo').onclick = () => {
      rows.forEach(r => {
        if (r.keepMine) return;
        if (r.k === KEY) {      // la Estación: se mezclan notas y enlaces, sin perder el aparato ni la sesión de aquí
          try {
            const o = JSON.parse(data.keys[r.k]);
            ['notes', 'localPin', 'mentor', 'refl', 'shown', 'qi'].forEach(f => { if (o[f] !== undefined && (!S[f] || (Array.isArray(S[f]) ? !S[f].length : typeof S[f] === 'object' ? !Object.keys(S[f]).length : false))) S[f] = o[f]; });
            const has = ls => (ls || []).some(l => l.url && l.title !== 'Pix');
            if (Array.isArray(o.links) && has(o.links) && !has(S.links)) S.links = o.links;
          } catch (e) {}
          return;
        }
        try { localStorage.setItem(r.k, data.keys[r.k]); } catch (e) {}
      });
      S.seen = {}; save(); close(); toast(t('mv.done')); detect(); renderAll();
    };
  }, true);
}

/* =================== ARRANQUE Y SESIÓN =================== */
const FAM = {};          // nombres de la familia (para el padre)
function showMain() {
  loadRut(); $('#login').hidden = true; $('#main').hidden = false; $('#nav').hidden = false; $('#navTop').hidden = false; aplicaFondo();
  tick(); detect(); const h = location.hash.slice(1); VIEW = VIEWS.includes(h) ? h : 'inicio'; renderAll(); go(VIEW, true); checkMove();
}
function renderAll() {
  ganar(true); renderHero(); renderWallet(); renderMentor(); renderNuevo(); renderHoy(); renderLinks(); renderRut(); renderNotes(); renderGames(); renderView();
  $('#foot').textContent = cloudOn() ? `${t('foot.cloud')}${S.cache.rut && S.cache.rut.at ? ' · ' + t('foot.upd', { h: new Date(S.cache.rut.at).toLocaleTimeString(LOC(), { hour: '2-digit', minute: '2-digit' }) }) : ''}` : t('foot.local');
}
async function refresh() {
  if (!cloudOn()) { syncDot('', t('sync.local')); return; }
  syncDot('', t('sync.busy'));
  try { await flush(); await pullItems(); await pullRefl(); await pullRutinator(); await pushProgress(); syncDot(S.pending.length ? 'off' : 'ok', S.pending.length ? t('sync.wait') : t('sync.ok')); }
  catch (e) { console.warn(e); syncDot('off', t('sync.off')); }
  renderAll();
}
async function loadMe() {
  const { data: { user } } = await sb.auth.getUser(); if (!user) return null;
  const { data, error } = await sb.from('family_members').select('id,display_name,role,auth_user_id,family_id').eq('auth_user_id', user.id).maybeSingle(); if (error) throw error;
  if (data && data.role === 'padre') { const f = await sb.from('family_members').select('id,display_name').eq('family_id', data.family_id); (f.data || []).forEach(m => { FAM[m.id] = m.display_name; }); }
  return data;
}
async function start() {
  applyStatic(); remoteProg = (S.cache && S.cache.prog) || {};
  if (!CLOUD) { S.mode = 'local'; save(); showMain(); syncDot('', t('sync.local')); return; }
  let session = null; try { session = (await sb.auth.getSession()).data.session; } catch (e) {}
  if (session) { try { ME = await loadMe(); } catch (e) { ME = S.cache.me || null; } if (ME) { S.cache.me = ME; S.mode = 'cloud'; save(); showMain(); refresh(); return; } }
  if (S.mode === 'local') { showMain(); syncDot('', t('sync.local')); return; }
  $('#login').hidden = false; $('#main').hidden = true; $('#nav').hidden = true; $('#navTop').hidden = true;
  if (/^#mudanza=/.test(location.hash)) { $('#lgMsg').className = 'msg ok'; $('#lgMsg').textContent = t('mv.lead'); }
}
$('#lgGo').onclick = async () => {
  const m = $('#lgMail').value.trim(), p = $('#lgPass').value; const msg = $('#lgMsg'); if (!m || !p) { msg.textContent = t('login.empty'); return; }
  $('#lgGo').disabled = true; msg.className = 'msg'; msg.textContent = t('login.wait');
  const { error } = await sb.auth.signInWithPassword({ email: m, password: p }); $('#lgGo').disabled = false;
  if (error) { msg.textContent = /fetch|network/i.test(error.message) ? t('login.net') : t('login.bad'); return; }
  try { ME = await loadMe(); } catch (e) { ME = null; } if (!ME) { msg.textContent = t('login.nofam'); await sb.auth.signOut(); return; }
  S.cache.me = ME; S.mode = 'cloud'; save(); showMain(); refresh();
};
$('#lgPass').onkeydown = e => { if (e.key === 'Enter') $('#lgGo').click(); };
$('#lgLocal').onclick = () => { S.mode = 'local'; save(); showMain(); syncDot('', t('sync.local')); };
$('#lgLang').onclick = () => setLang(L === 'fr' ? 'es' : 'fr');
$('#openBook').onclick = openBook;

/* ajustes */
$('#btnSet').onclick = () => {
  const cloud = cloudOn(); const m = mentor();
  modal(`<h3>${esc(t('set.title'))}</h3>
  <div class="set-sec" style="border:0;padding:0"><h4>${esc(t('set.lang'))}</h4><div class="seg"><button data-lang="es" aria-pressed="${L === 'es'}">Español</button><button data-lang="fr" aria-pressed="${L === 'fr'}">Français</button></div></div>
  <div class="set-sec"><h4>${esc(t('set.mentor'))}</h4><div class="mhead">${portrait(mentorId())}<div><div class="mname">${esc(tt(m.nombre))}</div><div class="mrol">${esc(tt(m.rol))}</div><button class="btn sm" id="stMentor" style="margin-top:8px">${esc(t('set.change'))}</button></div></div></div>
  <div class="set-sec"><h4>${esc(t('set.account'))}</h4><p class="muted">${cloud ? t('set.cloud', { x: esc(ME.display_name || '') }) : esc(CLOUD ? t('set.localA') : t('set.noconn'))}</p>
  <div class="row" style="justify-content:flex-start">${cloud ? `<button class="btn" id="stSync">${esc(t('set.sync'))}</button><button class="btn" id="stOut">${esc(t('set.out'))}</button>` : CLOUD ? `<button class="btn pri" id="stIn">${esc(t('set.in'))}</button>` : ''}<button class="btn" id="stInst">${esc(t('set.install'))}</button><button class="btn" id="stPar">${esc(t('set.parents'))}</button></div></div>
  <p class="muted small" style="margin-top:16px">${esc(t('set.about'))} · <a href="${L === 'fr' ? '../fr/confidentialite.html' : '../legal/privacidad.html'}">${esc(t('set.privacy'))}</a></p>
  <div class="row"><button class="btn pri" id="stClose">${esc(t('btn.close'))}</button></div>`, close => {
    $('#stClose').onclick = close;
    $$('#sheet [data-lang]').forEach(b => b.onclick = () => { setLang(b.dataset.lang); close(); $('#btnSet').click(); });
    $('#stMentor').onclick = () => { close(); chooseMentor(); };
    $('#stPar').onclick = () => { close(); parentZone(); };
    const s1 = $('#stSync'); if (s1) s1.onclick = () => { close(); refresh(); toast(t('syncing')); };
    const so = $('#stOut'); if (so) so.onclick = async () => { await sb.auth.signOut(); ME = null; S.mode = ''; S.cache = {}; S.pending = []; S.notesSynced = false; S.refl = []; save(); close(); location.reload(); };
    const si = $('#stIn'); if (si) si.onclick = () => { S.mode = ''; save(); close(); location.reload(); };
    $('#stInst').onclick = () => { close(); install(); };
  });
};
let deferredPrompt = null; addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredPrompt = e; });
function install() {
  if (deferredPrompt) { deferredPrompt.prompt(); deferredPrompt = null; return; }
  modal(`<h3>${esc(t('inst.title'))}</h3><p>${t('inst.ios')}</p><p>${t('inst.and')}</p><div class="row"><button class="btn pri" id="ok">${esc(t('btn.ok'))}</button></div>`, close => ($('#ok').onclick = close));
}

/* refrescos: al volver a la pestaña, al recuperar la conexión y cada 5 minutos */
setInterval(tick, 15000); setInterval(() => { if (!document.hidden) renderHoy(); }, 60000); setInterval(() => { if (!document.hidden) refresh(); }, 300000);
document.addEventListener('visibilitychange', () => { if (!document.hidden && !$('#main').hidden) { if (detect()) renderMentor(); ganar(); if (loadRut()) { renderHoy(); renderRut(); } renderGames(); refresh(); } });
addEventListener('online', () => refresh()); addEventListener('offline', () => syncDot('off', t('sync.offline')));
addEventListener('storage', e => { if (e.key && e.key !== KEY && !$('#main').hidden) { if (e.key === RUT3 && loadRut()) { renderHoy(); renderRut(); } if (detect()) renderMentor(); ganar(); renderGames(); } });
if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register('sw.js').catch(() => {});
start();
window.__EST = { get S() { return S; }, GAMES, ECO, ARTE, renderAll, detect, ganar, go, save, ymd, setLang, get VIEW() { return VIEW; }, get ME() { return ME; } };
})();
