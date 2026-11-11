/* =====================================================================
   Curionaut · los cuatro mentores y su cuaderno de preguntas
   ---------------------------------------------------------------------
   Todo el texto vive aquí, en español y en francés, para poder revisarlo,
   traducirlo y grabarlo con voz sin tocar la lógica de la Estación.

   Marcadores que se sustituyen al mostrar el texto:
     {nombre}  nombre del niño          {juego}  nombre del juego
     {tema}    tema o capítulo          {n}      misiones / cámaras nuevas
     {xp}      XP ganada                {dato}   dato histórico del tema
     {p}       puntos concedidos

   Cada línea tiene un id estable (mentor.tipo.n o tema.q.n) para poder
   asociarle más adelante su audio grabado: audio/<lang>/<id>.mp3
   ===================================================================== */
window.CURIO_MENTORES = (function () {
  'use strict';

  /* ---------------- los cuatro mentores ---------------- */
  const M = {
    bitacora: {
      color: '#5ee0ff',
      nombre: { es: 'Bitácora', fr: 'Bitácora' },
      rol: { es: 'La comandante del cuaderno de vuelo', fr: 'La commandante du carnet de bord' },
      estilo: { es: 'Serena y reflexiva', fr: 'Sereine et réfléchie' },
      presenta: {
        es: 'Soy Bitácora. Apunto cada viaje en el cuaderno de la Estación. No me importa lo rápido que vayas, sino lo que descubres por el camino.',
        fr: "Je suis Bitácora. Je note chaque voyage dans le carnet de bord de la Station. Ce qui compte pour moi, ce n'est pas ta vitesse, c'est ce que tu découvres en chemin."
      }
    },
    brujula: {
      color: '#f2a65a',
      nombre: { es: 'Brújula', fr: 'Boussole' },
      rol: { es: 'La entrenadora de retos', fr: "L'entraîneuse des défis" },
      estilo: { es: 'Directa y con energía', fr: 'Directe et pleine d’énergie' },
      presenta: {
        es: 'Brújula al habla. Frases cortas, retos claros. Tú pones la cabeza, yo te señalo el norte.',
        fr: 'Ici Boussole. Phrases courtes, défis clairs. Toi, tu réfléchis ; moi, je t’indique le nord.'
      }
    },
    astrolabio: {
      color: '#ffd27a',
      nombre: { es: 'Astrolabio', fr: 'Astrolabe' },
      rol: { es: 'El sabio que viaja por la historia', fr: "Le sage qui voyage dans l'histoire" },
      estilo: { es: 'Curioso y cuentacuentos', fr: 'Curieux et conteur' },
      presenta: {
        es: 'Me llamo Astrolabio. He visto trabajar a Ampère, a Ohm y a Pitágoras. Detrás de cada fórmula hay una persona que dudó antes que tú.',
        fr: "Je m'appelle Astrolabe. J'ai vu travailler Ampère, Ohm et Pythagore. Derrière chaque formule, il y a quelqu'un qui a douté avant toi."
      }
    },
    faro: {
      color: '#4fd18b',
      nombre: { es: 'Faro', fr: 'Phare' },
      rol: { es: 'El guardián paciente', fr: 'Le gardien patient' },
      estilo: { es: 'Cálido y tranquilo', fr: 'Chaleureux et calme' },
      presenta: {
        es: 'Soy Faro. Cuando el mar se pone difícil, yo sigo encendido. Aquí nadie tiene prisa: vamos paso a paso.',
        fr: "Je suis Phare. Quand la mer devient difficile, je reste allumé. Ici, personne n'est pressé : on avance pas à pas."
      }
    }
  };

  /* ---------------- lo que dice cada mentor ----------------
     saludo      · sin nada nuevo desde la última visita
     buena       · ha avanzado y le ha ido bien
     dificil     · ha avanzado, pero con muchos fallos
     dato        · presenta el dato histórico del tema
     pregunta    · antes de la pregunta (siempre opcional)
     corta       · si la respuesta es muy corta (no bloquea: solo anima)
     enviada     · tras enviar la reflexión
     validada    · el padre la ha validado ({p} puntos)
     devuelta    · el padre pide que la explique mejor
     ahorano     · si prefiere no contestar                         */
  const T = {
    bitacora: {
      saludo: [
        { es: 'Buenas, {nombre}. El cuaderno está abierto y en calma. Cuando vuelvas de una misión, aquí la apuntaremos.', fr: 'Bonjour, {nombre}. Le carnet est ouvert et tout est calme. Quand tu reviendras de mission, on la notera ici.' },
        { es: 'Estación en órbita estable, {nombre}. ¿Qué rumbo tomamos hoy?', fr: 'Station en orbite stable, {nombre}. Quel cap prenons-nous aujourd’hui ?' }
      ],
      buena: [
        { es: 'Registro de vuelo: {n} en {juego}, en «{tema}». Has mantenido la atención en cada paso, y se nota.', fr: 'Journal de vol : {n} dans {juego}, sur « {tema} ». Tu as gardé ton attention à chaque étape, et ça se voit.' },
        { es: 'Apunto en el cuaderno: {juego}, «{tema}», {xp} XP. No fue suerte: fue método.', fr: 'Je note dans le carnet : {juego}, « {tema} », {xp} XP. Ce n’était pas de la chance : c’était de la méthode.' }
      ],
      dificil: [
        { es: '«{tema}» se te ha resistido un poco en {juego}. En ciencia, un resultado inesperado no es un fallo: es el mapa exacto de dónde mirar ahora.', fr: '« {tema} » t’a un peu résisté dans {juego}. En science, un résultat inattendu n’est pas un échec : c’est la carte exacte de l’endroit où regarder maintenant.' }
      ],
      dato: [{ es: 'Una nota al margen del cuaderno: {dato}', fr: 'Une note dans la marge du carnet : {dato}' }],
      pregunta: [{ es: 'Antes de seguir, una sola pregunta para el cuaderno. Sin prisa:', fr: 'Avant de continuer, une seule question pour le carnet. Sans te presser :' }],
      corta: [{ es: 'Buen comienzo. ¿Puedes añadir el porqué? Eso es lo que de verdad queda en el cuaderno.', fr: 'Bon début. Peux-tu ajouter le pourquoi ? C’est ça qui reste vraiment dans le carnet.' }],
      enviada: [{ es: 'Anotado en el cuaderno. Papá lo leerá con calma.', fr: 'C’est noté dans le carnet. Papa le lira tranquillement.' }],
      validada: [{ es: 'Tu reflexión ha quedado en el cuaderno: +{p} puntos de bitácora. Pensar despacio también es avanzar.', fr: 'Ta réflexion est entrée dans le carnet : +{p} points de bord. Réfléchir lentement, c’est aussi avancer.' }],
      devuelta: [{ es: 'Papá ha dejado una nota en tu reflexión. Léela y vuelve a intentarlo cuando quieras.', fr: 'Papa a laissé une note sur ta réflexion. Lis-la et réessaie quand tu veux.' }],
      ahorano: [{ es: 'De acuerdo. La pregunta se queda en el cuaderno por si te apetece más tarde.', fr: 'D’accord. La question reste dans le carnet, au cas où tu en aies envie plus tard.' }]
    },
    brujula: {
      saludo: [
        { es: '¡Eh, {nombre}! Sin novedades. Elige un juego y vamos.', fr: 'Salut, {nombre} ! Rien de neuf. Choisis un jeu et on y va.' },
        { es: 'Norte claro, {nombre}. ¿Hoy toca electricidad o geometría?', fr: 'Nord bien en vue, {nombre}. Aujourd’hui, électricité ou géométrie ?' }
      ],
      buena: [
        { es: '{n} en {juego}. «{tema}» superado. Bien hecho.', fr: '{n} dans {juego}. « {tema} », réussi. Bien joué.' },
        { es: '+{xp} XP en {juego}. Ritmo bueno, cabeza fría. Así.', fr: '+{xp} XP dans {juego}. Bon rythme, tête froide. C’est ça.' }
      ],
      dificil: [
        { es: '«{tema}» ha costado. Normal: es de los duros. Los fallos te dicen dónde entrenar.', fr: '« {tema} » a été difficile. Normal : c’est un des plus durs. Les erreurs te montrent où t’entraîner.' }
      ],
      dato: [{ es: 'Dato rápido: {dato}', fr: 'Info express : {dato}' }],
      pregunta: [{ es: 'Reto de cabeza. Uno solo:', fr: 'Défi pour la tête. Un seul :' }],
      corta: [{ es: 'Vale. Ahora el porqué. Una frase más.', fr: 'D’accord. Maintenant le pourquoi. Une phrase de plus.' }],
      enviada: [{ es: 'Enviado. Papá lo revisa.', fr: 'Envoyé. Papa va le regarder.' }],
      validada: [{ es: '+{p} puntos. Eso es razonar.', fr: '+{p} points. Ça, c’est raisonner.' }],
      devuelta: [{ es: 'Papá quiere más detalle. Revisa su nota y otra vez.', fr: 'Papa veut plus de détails. Regarde sa note et recommence.' }],
      ahorano: [{ es: 'Ok. Lo dejamos para luego.', fr: 'Ok. On garde ça pour plus tard.' }]
    },
    astrolabio: {
      saludo: [
        { es: 'Saludos, {nombre}. Mis engranajes giran despacio esperando tu próximo viaje.', fr: 'Bonjour, {nombre}. Mes engrenages tournent doucement en attendant ton prochain voyage.' },
        { es: '¿Sabías que los antiguos navegantes medían las estrellas para no perderse? Hoy tú eliges la estrella, {nombre}.', fr: 'Savais-tu que les anciens navigateurs mesuraient les étoiles pour ne pas se perdre ? Aujourd’hui, c’est toi qui choisis l’étoile, {nombre}.' }
      ],
      buena: [
        { es: 'Has vuelto de {juego} con {n}, en «{tema}». Los grandes científicos habrían reconocido tu paciencia.', fr: 'Tu reviens de {juego} avec {n}, sur « {tema} ». Les grands savants auraient reconnu ta patience.' },
        { es: '{xp} XP en {juego}. Cada misión es una página más de una historia que empezó hace siglos.', fr: '{xp} XP dans {juego}. Chaque mission est une page de plus d’une histoire commencée il y a des siècles.' }
      ],
      dificil: [
        { es: '«{tema}» te ha hecho tropezar en {juego}. Tranquilo: a los sabios también les pasó, y muchas veces.', fr: '« {tema} » t’a fait trébucher dans {juego}. Rassure-toi : aux savants aussi, c’est arrivé, et souvent.' }
      ],
      dato: [{ es: 'Déjame contarte algo: {dato}', fr: 'Laisse-moi te raconter quelque chose : {dato}' }],
      pregunta: [{ es: 'Y ahora, la pregunta que me habría hecho yo en su época:', fr: 'Et maintenant, la question que je me serais posée à leur époque :' }],
      corta: [{ es: 'Interesante. ¿Me cuentas cómo llegaste a esa idea? Los sabios siempre explicaban su camino.', fr: 'Intéressant. Tu me racontes comment tu es arrivé à cette idée ? Les savants expliquaient toujours leur chemin.' }],
      enviada: [{ es: 'Guardado como un manuscrito antiguo. Papá lo leerá.', fr: 'Rangé comme un vieux manuscrit. Papa le lira.' }],
      validada: [{ es: 'Tu reflexión entra en los archivos de la Estación: +{p} puntos de bitácora.', fr: 'Ta réflexion entre dans les archives de la Station : +{p} points de bord.' }],
      devuelta: [{ es: 'Papá ha anotado algo al margen de tu manuscrito. Como los sabios, puedes corregirlo y mejorarlo.', fr: 'Papa a écrit quelque chose dans la marge de ton manuscrit. Comme les savants, tu peux le corriger et l’améliorer.' }],
      ahorano: [{ es: 'Las buenas preguntas pueden esperar. Te la guardo.', fr: 'Les bonnes questions savent attendre. Je te la garde.' }]
    },
    faro: {
      saludo: [
        { es: 'Hola, {nombre}. Todo tranquilo por aquí. Cuando quieras, empezamos.', fr: 'Bonjour, {nombre}. Tout est calme ici. Quand tu veux, on commence.' },
        { es: 'La luz sigue encendida, {nombre}. Sin prisa: elige con calma.', fr: 'La lumière est toujours allumée, {nombre}. Pas de précipitation : choisis tranquillement.' }
      ],
      buena: [
        { es: 'Qué buen trabajo en {juego}, {nombre}: {n} en «{tema}». Me alegra verte avanzar así.', fr: 'Quel beau travail dans {juego}, {nombre} : {n} sur « {tema} ». Ça me fait plaisir de te voir avancer comme ça.' },
        { es: '{xp} XP en {juego}. Paso a paso se llega lejos.', fr: '{xp} XP dans {juego}. Pas à pas, on va loin.' }
      ],
      dificil: [
        { es: '«{tema}» ha sido duro en {juego}. Respira. Equivocarse es parte de aprender, y mañana lo verás más claro.', fr: '« {tema} » a été dur dans {juego}. Respire. Se tromper fait partie de l’apprentissage, et demain tu y verras plus clair.' }
      ],
      dato: [{ es: 'Una curiosidad para el camino: {dato}', fr: 'Une curiosité pour la route : {dato}' }],
      pregunta: [{ es: 'Si te apetece, piensa en esto. No hay respuesta mala:', fr: 'Si tu en as envie, réfléchis à ceci. Il n’y a pas de mauvaise réponse :' }],
      corta: [{ es: 'Me gusta. Si quieres, cuéntame un poco más: ¿por qué crees que es así?', fr: 'J’aime bien. Si tu veux, dis-m’en un peu plus : pourquoi penses-tu que c’est comme ça ?' }],
      enviada: [{ es: 'Gracias por pensarlo. Papá lo leerá pronto.', fr: 'Merci d’y avoir réfléchi. Papa le lira bientôt.' }],
      validada: [{ es: 'Papá ha leído tu reflexión: +{p} puntos de bitácora. Bien pensado.', fr: 'Papa a lu ta réflexion : +{p} points de bord. Bien réfléchi.' }],
      devuelta: [{ es: 'Papá te ha dejado una nota. Léela tranquilo y, cuando quieras, lo intentas otra vez.', fr: 'Papa t’a laissé une note. Lis-la tranquillement et, quand tu veux, tu réessaies.' }],
      ahorano: [{ es: 'Claro. Aquí la tienes cuando te venga bien.', fr: 'Bien sûr. Elle t’attend ici quand ça t’arrange.' }]
    }
  };

  /* ---------------- temas: nombre, dato histórico y preguntas ----------------
     clave: <juego>:<tema>. Si un juego no tiene tema concreto se usa <juego>:general */
  const q = (es, fr) => ({ es, fr });
  const TOPICS = {
    /* ============ Chrono-Ohm ============ */
    'chrono-ohm:c1': {
      nombre: q('La corriente y la intensidad', 'Le courant et l’intensité'),
      dato: q('En 1820, en París, Ampère vio que dos cables con corriente se atraen o se repelen. De ahí salió la manera de medir la intensidad, y por eso la unidad lleva su nombre.',
        'En 1820, à Paris, Ampère a vu que deux fils parcourus par un courant s’attirent ou se repoussent. C’est de là qu’est venue la façon de mesurer l’intensité, et c’est pour ça que l’unité porte son nom.'),
      preguntas: [
        q('¿Por qué el amperímetro se conecta en serie y no en paralelo? ¿Qué pasaría si lo hicieras al revés?', 'Pourquoi branche-t-on l’ampèremètre en série et pas en dérivation ? Que se passerait-il si on faisait l’inverse ?'),
        q('La corriente se parece al agua de una tubería. ¿En qué se parece… y en qué NO se parece?', 'Le courant ressemble à l’eau dans un tuyau. En quoi est-ce pareil… et en quoi ce n’est PAS pareil ?'),
        q('En un circuito en serie, ¿marca lo mismo el amperímetro antes y después de la lámpara? ¿Por qué?', 'Dans un circuit en série, l’ampèremètre indique-t-il la même valeur avant et après la lampe ? Pourquoi ?')
      ]
    },
    'chrono-ohm:c2': {
      nombre: q('Resistencias y ley de Ohm', 'Les résistances et la loi d’Ohm'),
      dato: q('Georg Ohm publicó su ley en 1827 y al principio casi nadie le creyó. Tardaron años en reconocer que tenía razón.',
        'Georg Ohm a publié sa loi en 1827 et, au début, presque personne ne l’a cru. Il a fallu des années pour reconnaître qu’il avait raison.'),
      preguntas: [
        q('¿Qué le pasaría a la corriente si duplicaras la resistencia sin tocar la tensión? Explica por qué.', 'Que deviendrait le courant si tu doublais la résistance sans toucher à la tension ? Explique pourquoi.'),
        q('¿Cómo explicarías U = R × I a alguien de diez años sin usar la fórmula?', 'Comment expliquerais-tu U = R × I à quelqu’un de dix ans sans utiliser la formule ?'),
        q('Dos resistencias iguales: ¿pasa más corriente si las pones en serie o en paralelo? ¿Por qué?', 'Deux résistances identiques : passe-t-il plus de courant en série ou en dérivation ? Pourquoi ?')
      ]
    },
    'chrono-ohm:c3': {
      nombre: q('Potencia, energía y efecto Joule', 'La puissance, l’énergie et l’effet Joule'),
      dato: q('James Joule medía el calor con termómetros tan precisos que algunos científicos de su época no se creían sus resultados.',
        'James Joule mesurait la chaleur avec des thermomètres si précis que certains savants de son époque ne croyaient pas ses résultats.'),
      preguntas: [
        q('Si dejas un aparato encendido el doble de tiempo, ¿qué se duplica: la potencia o la energía? ¿Por qué?', 'Si tu laisses un appareil allumé deux fois plus longtemps, qu’est-ce qui double : la puissance ou l’énergie ? Pourquoi ?'),
        q('¿Por qué un hervidor gasta mucho más que una bombilla LED en el mismo tiempo?', 'Pourquoi une bouilloire consomme-t-elle beaucoup plus qu’une ampoule LED pendant le même temps ?'),
        q('Los cables se calientan cuando pasa corriente. ¿Es siempre algo malo? Piensa en un ejemplo útil.', 'Les fils chauffent quand le courant passe. Est-ce toujours une mauvaise chose ? Pense à un exemple utile.')
      ]
    },
    'chrono-ohm:c4': {
      nombre: q('Seguridad: fusibles y cortocircuitos', 'La sécurité : fusibles et courts-circuits'),
      dato: q('Edison y Tesla discutieron durante años sobre la mejor manera de llevar la electricidad a las casas. La seguridad era uno de sus grandes argumentos.',
        'Edison et Tesla se sont disputés pendant des années sur la meilleure façon d’amener l’électricité dans les maisons. La sécurité était l’un de leurs grands arguments.'),
      preguntas: [
        q('Un fusible se funde a propósito. ¿Qué está protegiendo exactamente?', 'Un fusible fond exprès. Qu’est-ce qu’il protège exactement ?'),
        q('¿Qué es un cortocircuito? Explícalo con tus palabras, sin copiar la definición.', 'Qu’est-ce qu’un court-circuit ? Explique-le avec tes mots, sans recopier la définition.'),
        q('¿Por qué el agua y la electricidad son tan mala pareja en casa?', 'Pourquoi l’eau et l’électricité font-elles si mauvais ménage à la maison ?')
      ]
    },
    'chrono-ohm:c5': {
      nombre: q('El autómata: relés y automatismos', 'L’automate : relais et automatismes'),
      dato: q('Los primeros relés se usaron en el telégrafo, en el siglo XIX, para repetir los mensajes y que llegaran mucho más lejos.',
        'Les premiers relais ont été utilisés pour le télégraphe, au XIXe siècle, afin de répéter les messages et les faire aller beaucoup plus loin.'),
      preguntas: [
        q('Un relé usa un circuito pequeño para mandar sobre uno grande. ¿Dónde has visto algo parecido en casa o en la calle?', 'Un relais utilise un petit circuit pour commander un gros. Où as-tu vu quelque chose de semblable à la maison ou dans la rue ?'),
        q('Si quisieras que una luz se encendiera sola al anochecer, ¿qué tendría que «saber» el circuito?', 'Si tu voulais qu’une lampe s’allume toute seule à la tombée de la nuit, qu’est-ce que le circuit devrait « savoir » ?'),
        q('¿Qué ventajas y qué peligros tiene que las máquinas decidan solas?', 'Quels avantages et quels dangers y a-t-il à laisser les machines décider seules ?')
      ]
    },
    'chrono-ohm:c6': {
      nombre: q('Las redes y las leyes de Kirchhoff', 'Les réseaux et les lois de Kirchhoff'),
      dato: q('Gustav Kirchhoff formuló sus leyes en 1845, cuando todavía era estudiante en Königsberg.',
        'Gustav Kirchhoff a formulé ses lois en 1845, alors qu’il était encore étudiant à Königsberg.'),
      preguntas: [
        q('En un nudo, la corriente que entra es igual a la que sale. ¿Por qué no puede «perderse» corriente por el camino?', 'Dans un nœud, le courant qui entre est égal à celui qui sort. Pourquoi le courant ne peut-il pas « se perdre » en chemin ?'),
        q('¿Por qué los enchufes de casa están en paralelo y no en serie? Piensa en qué pasaría si no.', 'Pourquoi les prises de la maison sont-elles en dérivation et pas en série ? Imagine ce qui se passerait sinon.'),
        q('Si recorres una malla entera sumando las tensiones, acabas en cero. ¿Por qué tiene sentido?', 'Si tu fais le tour complet d’une maille en additionnant les tensions, tu arrives à zéro. Pourquoi est-ce logique ?')
      ]
    },
    'chrono-ohm:c7': {
      nombre: q('Las medidas: divisor y puente de Wheatstone', 'Les mesures : diviseur et pont de Wheatstone'),
      dato: q('El puente lleva el nombre de Charles Wheatstone, que lo dio a conocer en 1843, aunque lo había inventado antes Samuel Christie.',
        'Le pont porte le nom de Charles Wheatstone, qui l’a fait connaître en 1843, mais c’est Samuel Christie qui l’avait inventé avant lui.'),
      preguntas: [
        q('¿Por qué el puente de Wheatstone es tan preciso aunque el aparato que mide no lo sea tanto?', 'Pourquoi le pont de Wheatstone est-il si précis, même si l’appareil de mesure ne l’est pas autant ?'),
        q('Quieres obtener justo la mitad de la tensión con un divisor. ¿Cómo elegirías las resistencias y por qué?', 'Tu veux obtenir exactement la moitié de la tension avec un diviseur. Comment choisirais-tu les résistances, et pourquoi ?'),
        q('Cuando mides algo, ¿cómo sabes si te puedes fiar del resultado?', 'Quand tu mesures quelque chose, comment sais-tu si tu peux te fier au résultat ?')
      ]
    },
    'chrono-ohm:c8': {
      nombre: q('El transporte de la energía', 'Le transport de l’énergie'),
      dato: q('En 1882, Marcel Deprez llevó electricidad desde Miesbach hasta Múnich: unos 57 kilómetros. Fue una de las primeras veces que la electricidad viajó tan lejos.',
        'En 1882, Marcel Deprez a transporté de l’électricité de Miesbach jusqu’à Munich : environ 57 kilomètres. C’était l’une des premières fois que l’électricité voyageait aussi loin.'),
      preguntas: [
        q('¿Por qué la electricidad viaja a alta tensión por las líneas y se baja antes de llegar a las casas?', 'Pourquoi l’électricité voyage-t-elle en haute tension dans les lignes, et pourquoi la baisse-t-on avant les maisons ?'),
        q('Un cable más grueso pierde menos energía. Entonces, ¿por qué no se hacen todos gruesísimos?', 'Un câble plus gros perd moins d’énergie. Alors pourquoi ne les fait-on pas tous énormes ?'),
        q('Cobre o aluminio para una línea muy larga: ¿qué pesarías para decidir?', 'Cuivre ou aluminium pour une très longue ligne : qu’est-ce que tu prendrais en compte pour décider ?')
      ]
    },
    'chrono-ohm:c9': {
      nombre: q('La guerra de las corrientes', 'La guerre des courants'),
      dato: q('En 1896, la central del Niágara empezó a enviar corriente alterna hasta Búfalo, a unos 40 kilómetros. Fue el gran triunfo de Westinghouse y Tesla.',
        'En 1896, la centrale du Niagara a commencé à envoyer du courant alternatif jusqu’à Buffalo, à une quarantaine de kilomètres. Ce fut le grand triomphe de Westinghouse et de Tesla.'),
      preguntas: [
        q('¿Por qué ganó la corriente alterna para llevar la electricidad lejos?', 'Pourquoi le courant alternatif a-t-il gagné pour transporter l’électricité loin ?'),
        q('Un transformador no crea energía. Entonces, ¿qué hace exactamente?', 'Un transformateur ne crée pas d’énergie. Alors, que fait-il exactement ?'),
        q('Si fueras Edison, ¿qué argumento usarías para defender la corriente continua? ¿Tenía algo de razón?', 'Si tu étais Edison, quel argument utiliserais-tu pour défendre le courant continu ? Avait-il un peu raison ?')
      ]
    },
    'chrono-ohm:tycoon': {
      nombre: q('Tu compañía eléctrica', 'Ta compagnie d’électricité'),
      dato: q('La primera central comercial de Edison, en Pearl Street (Nueva York, 1882), empezó dando luz a unos ochenta clientes.',
        'La première centrale commerciale d’Edison, à Pearl Street (New York, 1882), a commencé par éclairer environ quatre-vingts clients.'),
      preguntas: [
        q('Cuando la demanda sube de golpe por la tarde, ¿qué central encenderías primero y por qué?', 'Quand la demande monte d’un coup en fin de journée, quelle centrale allumerais-tu en premier, et pourquoi ?'),
        q('¿Qué es más importante para tu compañía: ganar dinero, contaminar poco o no dejar a nadie sin luz? ¿Cómo lo equilibras?', 'Qu’est-ce qui compte le plus pour ta compagnie : gagner de l’argent, peu polluer ou ne laisser personne sans électricité ? Comment trouves-tu l’équilibre ?'),
        q('Una tormenta corta una línea. ¿Cómo diseñarías la red para que no se apague todo?', 'Une tempête coupe une ligne. Comment concevrais-tu le réseau pour que tout ne s’éteigne pas ?')
      ]
    },
    'chrono-ohm:general': {
      nombre: q('Modo experto y desafíos', 'Mode expert et défis'),
      dato: q('Michael Faraday numeraba cada párrafo de su diario de laboratorio, también los experimentos que salían mal. Llegó a más de 16.000.',
        'Michael Faraday numérotait chaque paragraphe de son journal de laboratoire, y compris les expériences ratées. Il en a écrit plus de 16 000.'),
      preguntas: [
        q('¿Qué error se te escapa más a menudo? ¿Qué truco usarás la próxima vez para evitarlo?', 'Quelle erreur fais-tu le plus souvent ? Quelle astuce utiliseras-tu la prochaine fois pour l’éviter ?'),
        q('¿Qué pregunta te costó más hoy? ¿En qué paso exacto te atascaste?', 'Quelle question t’a le plus coûté aujourd’hui ? À quelle étape exacte as-tu bloqué ?'),
        q('Antes de calcular, ¿qué compruebas primero? ¿Por qué ese orden?', 'Avant de calculer, que vérifies-tu en premier ? Pourquoi cet ordre ?')
      ]
    },

    /* ============ La Expedición Pitágoras ============ */
    'pitagoras:c1': {
      nombre: q('La Cámara de los Cuadrados', 'La Salle des Carrés'),
      dato: q('Euclides demostró este mismo secreto hace unos 2300 años, dibujando cuadrados sobre los lados de un triángulo.',
        'Euclide a démontré ce même secret il y a environ 2 300 ans, en dessinant des carrés sur les côtés d’un triangle.'),
      preguntas: [
        q('¿Por qué el cuadrado de la hipotenusa tiene que tener justo el área de los otros dos juntos?', 'Pourquoi le carré construit sur l’hypoténuse doit-il avoir exactement l’aire des deux autres réunis ?'),
        q('¿Funciona Pitágoras en cualquier triángulo? ¿Cómo lo comprobarías?', 'Le théorème de Pythagore marche-t-il pour n’importe quel triangle ? Comment le vérifierais-tu ?'),
        q('Explica a² + b² = c² con un dibujo que harías en una servilleta.', 'Explique a² + b² = c² avec un dessin que tu ferais sur une serviette en papier.')
      ]
    },
    'pitagoras:c2': {
      nombre: q('Los Puentes de Cuerda', 'Les Ponts de Corde'),
      dato: q('Se cuenta que los agrimensores de Egipto, los «tensores de cuerda», trazaban ángulos rectos con una cuerda de doce nudos: 3, 4 y 5.',
        'On raconte que les arpenteurs d’Égypte, les « tendeurs de corde », traçaient des angles droits avec une corde à douze nœuds : 3, 4 et 5.'),
      preguntas: [
        q('Con prisa, ¿qué es lo primero que miras para no equivocarte de lado?', 'Quand tu es pressé, que regardes-tu en premier pour ne pas te tromper de côté ?'),
        q('¿Cómo reconoces la hipotenusa sin medir nada?', 'Comment reconnais-tu l’hypoténuse sans rien mesurer ?'),
        q('¿Por qué el triángulo 3-4-5 sale siempre recto?', 'Pourquoi le triangle 3-4-5 est-il toujours rectangle ?')
      ]
    },
    'pitagoras:c3': {
      nombre: q('El Pozo del Cateto', 'Le Puits des Échelles'),
      dato: q('Una vieja anécdota cuenta que el sabio Tales se cayó a un pozo por ir mirando las estrellas.',
        'Une vieille anecdote raconte que le sage Thalès est tombé dans un puits parce qu’il regardait les étoiles en marchant.'),
      preguntas: [
        q('Para encontrar un cateto restas en vez de sumar. ¿Por qué?', 'Pour trouver un côté de l’angle droit, tu soustrais au lieu d’additionner. Pourquoi ?'),
        q('¿Cómo sabes si tu resultado tiene sentido antes de comprobarlo?', 'Comment sais-tu si ton résultat a du sens avant même de le vérifier ?'),
        q('Si el cateto te sale más largo que la hipotenusa, ¿qué ha pasado?', 'Si le côté que tu trouves est plus long que l’hypoténuse, que s’est-il passé ?')
      ]
    },
    'pitagoras:c7': {
      nombre: q('La Fuente de las Raíces', 'La Fontaine des Racines'),
      dato: q('Se dice que Hipaso descubrió que la diagonal de un cuadrado de lado 1 no se puede escribir como una fracción exacta, y que eso enfadó mucho a los pitagóricos.',
        'On dit qu’Hippase a découvert que la diagonale d’un carré de côté 1 ne peut pas s’écrire comme une fraction exacte, et que cela a beaucoup fâché les pythagoriciens.'),
      preguntas: [
        q('La diagonal de un cuadrado de lado 1 no es una fracción exacta. ¿Qué te parece eso? ¿Te sorprende?', 'La diagonale d’un carré de côté 1 n’est pas une fraction exacte. Qu’en penses-tu ? Ça te surprend ?'),
        q('¿Cómo estimas una raíz cuadrada sin calculadora?', 'Comment estimes-tu une racine carrée sans calculatrice ?'),
        q('¿Cuándo vale la pena dejar el resultado como raíz y no como decimal?', 'Quand vaut-il mieux laisser le résultat sous forme de racine plutôt qu’en nombre décimal ?')
      ]
    },
    'pitagoras:c4': {
      nombre: q('Los Pergaminos del Escriba', 'Les Parchemins du Scribe'),
      dato: q('Aristóteles escribió las reglas para razonar sin equivocarse. El escriba tramposo de los pergaminos no las respeta.',
        'Aristote a écrit les règles pour raisonner sans se tromper. Le scribe tricheur des parchemins ne les respecte pas.'),
      preguntas: [
        q('¿Qué dato del enunciado era una trampa? ¿Cómo lo descubriste?', 'Quelle donnée de l’énoncé était un piège ? Comment l’as-tu découvert ?'),
        q('¿Qué haces para leer un problema sin saltarte nada?', 'Que fais-tu pour lire un problème sans rien sauter ?'),
        q('¿Por qué crees que a veces los problemas traen datos que no hacen falta?', 'Pourquoi, à ton avis, les problèmes donnent-ils parfois des informations inutiles ?')
      ]
    },
    'pitagoras:c8': {
      nombre: q('El Tribunal de los Triángulos', 'Le Tribunal des Triangles'),
      dato: q('Justo después del teorema, Euclides demostró su recíproco: si a² + b² = c², el triángulo es rectángulo.',
        'Juste après le théorème, Euclide a démontré sa réciproque : si a² + b² = c², alors le triangle est rectangle.'),
      preguntas: [
        q('¿Qué diferencia hay entre usar Pitágoras para calcular y usarlo para demostrar que un ángulo es recto?', 'Quelle différence y a-t-il entre utiliser Pythagore pour calculer et l’utiliser pour prouver qu’un angle est droit ?'),
        q('Si a² + b² no da c², ¿qué puedes concluir del triángulo?', 'Si a² + b² n’est pas égal à c², que peux-tu conclure sur le triangle ?'),
        q('¿Cómo convencerías a alguien que no te cree de que un triángulo es rectángulo?', 'Comment convaincrais-tu quelqu’un qui ne te croit pas qu’un triangle est rectangle ?')
      ]
    },
    'pitagoras:c9': {
      nombre: q('El Observatorio del Coseno', 'L’Observatoire du Cosinus'),
      dato: q('Hiparco, hace más de 2100 años, hizo la primera tabla que relaciona ángulos y longitudes, para medir el cielo.',
        'Hipparque, il y a plus de 2 100 ans, a fabriqué la première table qui relie les angles et les longueurs, pour mesurer le ciel.'),
      preguntas: [
        q('¿Qué tiene que ver el coseno con Pitágoras?', 'Quel est le lien entre le cosinus et Pythagore ?'),
        q('¿Cómo decides si usar el seno, el coseno o la tangente?', 'Comment décides-tu d’utiliser le sinus, le cosinus ou la tangente ?'),
        q('Hiparco midió cosas que no podía tocar. ¿Qué medirías tú así?', 'Hipparque a mesuré des choses qu’il ne pouvait pas toucher. Que mesurerais-tu de cette façon ?')
      ]
    },
    'pitagoras:c10': {
      nombre: q('La Cripta de las Distancias', 'La Crypte des Distances'),
      dato: q('René Descartes tuvo la idea de situar cada punto con dos números. Desde entonces, la geometría y el álgebra van de la mano.',
        'René Descartes a eu l’idée de repérer chaque point avec deux nombres. Depuis, la géométrie et l’algèbre marchent main dans la main.'),
      preguntas: [
        q('¿Cómo usas Pitágoras para medir la distancia entre dos puntos de un mapa?', 'Comment utilises-tu Pythagore pour mesurer la distance entre deux points d’une carte ?'),
        q('Dentro de una caja, en 3D, ¿cuántas veces tienes que usar Pitágoras? ¿Por qué?', 'Dans une boîte, en 3D, combien de fois dois-tu utiliser Pythagore ? Pourquoi ?'),
        q('¿Por qué Descartes necesitaba dos números para cada punto del plano?', 'Pourquoi Descartes avait-il besoin de deux nombres pour chaque point du plan ?')
      ]
    },
    'pitagoras:c5': {
      nombre: q('La Cámara Sellada', 'La Salle scellée'),
      dato: q('Según la tradición, a la entrada de la Academia de Platón estaba escrito: «Que no entre nadie que no sepa geometría».',
        'Selon la tradition, à l’entrée de l’Académie de Platon, il était écrit : « Que nul n’entre ici s’il n’est géomètre ».'),
      preguntas: [
        q('En el escape, ¿qué estrategia seguiste para no perder tiempo?', 'Dans l’escape game, quelle stratégie as-tu suivie pour ne pas perdre de temps ?'),
        q('¿Qué pista te costó más? ¿Qué te hizo verla al final?', 'Quel indice t’a le plus résisté ? Qu’est-ce qui te l’a fait voir à la fin ?'),
        q('Si diseñaras tú un enigma con Pitágoras, ¿cómo sería?', 'Si tu inventais toi-même une énigme avec Pythagore, à quoi ressemblerait-elle ?')
      ]
    },
    'pitagoras:c6': {
      nombre: q('El Guardián del Teorema', 'Le Gardien du Théorème'),
      dato: q('Se conocen más de 300 demostraciones distintas del teorema de Pitágoras. Una de ellas la hizo un presidente de Estados Unidos.',
        'On connaît plus de 300 démonstrations différentes du théorème de Pythagore. L’une d’elles a été trouvée par un président des États-Unis.'),
      preguntas: [
        q('Contra el Guardián, ¿qué hiciste para mantener la calma?', 'Face au Gardien, qu’as-tu fait pour garder ton calme ?'),
        q('¿Qué parte de Pitágoras dominas ya y cuál quieres repasar?', 'Quelle partie de Pythagore maîtrises-tu déjà, et laquelle veux-tu revoir ?'),
        q('¿Cómo explicarías el teorema a tu yo de hace un mes?', 'Comment expliquerais-tu le théorème à toi-même il y a un mois ?')
      ]
    },
    'pitagoras:general': {
      nombre: q('Entrenamiento y desafíos', 'Entraînement et défis'),
      dato: q('Pitágoras no dejó nada escrito: lo que sabemos de él nos lo contaron sus discípulos, mucho tiempo después.',
        'Pythagore n’a rien laissé par écrit : ce que nous savons de lui nous a été raconté par ses disciples, bien plus tard.'),
      preguntas: [
        q('¿Qué error se te escapa más con Pitágoras y qué truco usarás para evitarlo?', 'Quelle erreur fais-tu le plus souvent avec Pythagore, et quelle astuce utiliseras-tu pour l’éviter ?'),
        q('¿Qué haces cuando un problema no se parece a ninguno que hayas visto?', 'Que fais-tu quand un problème ne ressemble à aucun de ceux que tu as déjà vus ?'),
        q('¿Dónde has visto un triángulo rectángulo hoy, fuera del juego?', 'Où as-tu vu un triangle rectangle aujourd’hui, en dehors du jeu ?')
      ]
    },

    /* ============ PhiloQuest ============ */
    'philoquest:general': {
      nombre: q('Dilemas y preguntas grandes', 'Dilemmes et grandes questions'),
      dato: q('Sócrates no escribió nada. Lo que sabemos de él lo contó su alumno Platón, sobre todo a través de diálogos.',
        'Socrate n’a rien écrit. Ce que nous savons de lui, c’est son élève Platon qui l’a raconté, surtout sous forme de dialogues.'),
      preguntas: [
        q('¿Qué valor pesó más en tu decisión? ¿Qué habrías sacrificado si elegías la otra opción?', 'Quelle valeur a le plus compté dans ta décision ? Qu’aurais-tu sacrifié en choisissant l’autre option ?'),
        q('¿Cambiarías tu respuesta si la decisión la tomara otra persona? ¿Por qué?', 'Changerais-tu ta réponse si c’était quelqu’un d’autre qui devait décider ? Pourquoi ?'),
        q('¿Qué argumento del otro lado te pareció más fuerte?', 'Quel argument de l’autre camp t’a semblé le plus fort ?')
      ]
    },

    /* ============ UMBRAL ============ */
    'umbral:general': {
      nombre: q('Estrategia en la mazmorra', 'Stratégie dans le donjon'),
      dato: q('El Go se juega desde hace más de 2500 años, y los jugadores siguen estudiando partidas antiguas para entender sus errores.',
        'Le go se joue depuis plus de 2 500 ans, et les joueurs étudient encore de vieilles parties pour comprendre leurs erreurs.'),
      preguntas: [
        q('¿Qué decisión de tu partida cambiarías si pudieras volver atrás?', 'Quelle décision de ta partie changerais-tu si tu pouvais revenir en arrière ?'),
        q('¿Cuándo te compensa arriesgar y cuándo es mejor esperar?', 'Quand vaut-il la peine de prendre un risque, et quand vaut-il mieux attendre ?'),
        q('¿Qué aprendiste de un enemigo que te ganó?', 'Qu’as-tu appris d’un ennemi qui t’a battu ?'),
        q('Con 2 dados, ¿cuántas veces de cada 4 sale al menos una calavera? ¿Cómo lo has pensado?', 'Avec 2 dés, combien de fois sur 4 obtiens-tu au moins un crâne ? Comment as-tu raisonné ?'),
        q('¿Qué dilema de la noche te costó más decidir? ¿Qué razón te convenció?', 'Quel dilemme de la nuit a été le plus difficile à trancher ? Quelle raison t’a convaincu ?')
      ]
    },

    /* ============ El Refugio ============ */
    'refugio:r1': {
      nombre: q('La luz de emergencia y su resistencia', 'L’éclairage de secours et sa résistance'),
      dato: q('El primer LED de luz visible lo fabricó Nick Holonyak en 1962, y era rojo. El LED azul tardó unos treinta años más, y sus inventores recibieron el Nobel de Física en 2014.',
        'La première LED à lumière visible a été fabriquée par Nick Holonyak en 1962, et elle était rouge. La LED bleue a mis une trentaine d’années de plus, et ses inventeurs ont reçu le prix Nobel de physique en 2014.'),
      preguntas: [
        q('El cálculo daba 500 Ω y en la caja había 470 Ω y 560 Ω. ¿Por qué conviene la de 560 Ω, si la de 470 Ω está más cerca?', 'Le calcul donnait 500 Ω et, dans la boîte, il y avait 470 Ω et 560 Ω. Pourquoi vaut-il mieux prendre celle de 560 Ω, alors que celle de 470 Ω est plus proche ?'),
        q('Si la batería fuera de 6 V en vez de 12 V, ¿qué resistencia necesitaría el mismo LED? Explica cómo lo calculas.', 'Si la batterie était de 6 V au lieu de 12 V, de quelle résistance la même LED aurait-elle besoin ? Explique ton calcul.'),
        q('¿Qué le pasaría al brillo del LED con la resistencia de 1.000 Ω? ¿Por qué?', 'Que deviendrait l’éclat de la LED avec la résistance de 1 000 Ω ? Pourquoi ?')
      ]
    },
    'refugio:r2': {
      nombre: q('Energía para toda la noche', 'De l’énergie pour toute la nuit'),
      dato: q('En 1859, el francés Gaston Planté inventó la primera batería recargable, de plomo y ácido. Muchos coches siguen arrancando hoy con una batería de ese tipo.',
        'En 1859, le Français Gaston Planté a inventé la première batterie rechargeable, au plomb et à l’acide. Aujourd’hui encore, beaucoup de voitures démarrent avec une batterie de ce type.'),
      preguntas: [
        q('¿En qué se diferencian los vatios (W) de los vatios-hora (Wh)? Explícalo con un aparato de tu casa.', 'Quelle est la différence entre les watts (W) et les wattheures (Wh) ? Explique-la avec un appareil de chez toi.'),
        q('Una batería de 120 Wh, ¿cuántas horas mantiene encendida una bombilla de 5 W? ¿Y dos bombillas a la vez?', 'Une batterie de 120 Wh, pendant combien d’heures garde-t-elle allumée une ampoule de 5 W ? Et deux ampoules en même temps ?'),
        q('¿Por qué la placa solar carga más al mediodía que a primera hora de la mañana?', 'Pourquoi le panneau solaire charge-t-il plus à midi que tôt le matin ?')
      ]
    },
    'refugio:r3': {
      nombre: q('El cable cortado y el multímetro', 'Le câble coupé et le multimètre'),
      dato: q('El multímetro lo ideó hacia 1920 Donald Macadie, un ingeniero de correos británico cansado de cargar con un aparato distinto para medir amperios, voltios y ohmios.',
        'Le multimètre a été imaginé vers 1920 par Donald Macadie, un ingénieur des postes britanniques fatigué de transporter un appareil différent pour mesurer les ampères, les volts et les ohms.'),
      preguntas: [
        q('Por fuera todos los cables parecían iguales. ¿Cómo decidiste por cuál empezar a medir?', 'De l’extérieur, tous les câbles avaient l’air pareils. Comment as-tu décidé par lequel commencer ?'),
        q('¿Por qué es mejor apagar el interruptor antes de medir la continuidad?', 'Pourquoi vaut-il mieux couper l’interrupteur avant de mesurer la continuité ?'),
        q('Una lámpara de casa deja de encender. Sin abrir nada, ¿qué comprobarías primero y por qué en ese orden?', 'Chez toi, une lampe ne s’allume plus. Sans rien ouvrir, que vérifierais-tu en premier, et pourquoi dans cet ordre ?')
      ]
    },
    'refugio:general': {
      nombre: q('El taller del refugio', 'L’atelier du refuge'),
      dato: q('En 1958, el satélite Vanguard 1 fue el primero que funcionó con energía solar. Dejó de emitir en 1964, pero sigue dando vueltas a la Tierra.',
        'En 1958, le satellite Vanguard 1 a été le premier à fonctionner à l’énergie solaire. Il a cessé d’émettre en 1964, mais il tourne toujours autour de la Terre.'),
      preguntas: [
        q('¿Qué has montado hoy en el refugio? ¿Qué problema querías resolver?', 'Qu’as-tu monté aujourd’hui dans le refuge ? Quel problème voulais-tu résoudre ?'),
        q('¿Dónde pondrías un fusible para que proteja todo el refugio? ¿Por qué ahí?', 'Où placerais-tu un fusible pour qu’il protège tout le refuge ? Pourquoi là ?'),
        q('Si pudieras añadir un aparato nuevo al refugio, ¿cuál sería y cuánta energía gastaría en una noche?', 'Si tu pouvais ajouter un nouvel appareil au refuge, lequel choisirais-tu, et combien d’énergie consommerait-il en une nuit ?')
      ]
    }
  };

  return { M, T, TOPICS, ORDEN: ['bitacora', 'brujula', 'astrolabio', 'faro'] };
})();
