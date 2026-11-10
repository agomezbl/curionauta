# Cómo trabajamos (Alejandro + Claude)

Guía corta para ir ordenado, gastar menos y no perder nada. Para tenerla a mano y repasarla de vez en cuando.

## 1. Una conversación por proyecto

| Proyecto | Repositorio | Cuándo abrir conversación nueva |
|---|---|---|
| Curionaut (web, Estación, mentores, voces) | `curionauta` | Publicación, Estación, dominio, voces |
| Chrono-Ohm | `chrono-ohm` | Capítulos, electromagnetismo |
| Expedición Pitágoras | `expedicion-pitagoras` | Cámaras nuevas, Tales/trigonometría |
| PhiloQuest | `PHYLOQUEST` | Capítulos VI–X |
| UMBRAL | `UMBRAL-D-D-QUEST` | Aventuras, Android |
| Rutinator v3 | `RutinatorV3` | Tareas, tienda, panel de papá |
| Escenas animadas | `curionauta-estudio` (privado) | Personajes, estilo, escenas |
| Trabajo de Schneider | — | Siempre aparte de lo personal |

**Por qué:** cada mensaje arrastra toda la conversación anterior. Una conversación larga y mezclada gasta varias veces
más y me hace perder detalle. Cada repositorio tiene un archivo `CLAUDE.md` con lo esencial, así que en una
conversación nueva retomo el hilo en segundos.

**Cómo empezar una conversación nueva:**
> Trabajamos en **Chrono-Ohm** (repo `agomezbl/chrono-ohm`). Hoy quiero **[una cosa]**.

## 2. Tu hora diaria

1. **Un solo objetivo por sesión**, dicho en el primer mensaje: *qué* quieres, *para quién* y *cómo sabrás que está bien*.
   Ejemplo: «Capítulo VI de PhiloQuest jugable en ES/FR; Nil lo prueba esta tarde».
2. **Junta las peticiones** en un mensaje en vez de mandarlas de una en una. Las capturas y las notas de voz están bien.
3. Dime si prefieres **«pregunta antes»** o **«decide tú y avísame»**. Lo primero para cosas grandes; lo segundo para detalles.
4. **Al acabar**, escribe: **«cierra la sesión»**. Dejo apuntado lo pendiente en el `CLAUDE.md`, lo subo a GitHub
   y te digo en 3 líneas qué ha quedado hecho.

## 3. Para gastar menos tokens

- Conversación nueva por proyecto (punto 1). Es lo que más ahorra.
- **«¿En qué se han ido los tokens?»** → informe con la herramienta *token-usage* para ver qué tareas gastan más.
- Para dudas rápidas, textos o traducciones basta un modelo más ligero. El modelo potente, para programar algo grande.
- No hace falta pegarme archivos que ya están en GitHub: dime el repositorio y el nombre.

## 4. Seguridad y copias

- **Las claves (Gemini, ElevenLabs…) nunca en el chat.** Van en GitHub: *Settings → Secrets and variables → Actions*.
- Pon **límite o aviso de gasto** en cada servicio de pago. Si una clave se escapa, se borra y se crea otra.
- **Todo vive en GitHub.** Mi espacio de trabajo es temporal: lo que no está subido se puede perder.
  Si te mando un `.zip`, guárdalo, pero la copia buena es GitHub.
- Los repositorios de juegos son **públicos**: nada de datos personales de la familia.
- Las contraseñas (la de Nil, las tuyas) no se guardan en ningún sitio que yo lea.

## 5. Antes de publicar un juego o un cambio

1. Pruebas automáticas en verde y revisión en navegador (PC y móvil). De esto me encargo yo.
2. **Nil lo prueba** y le preguntas: ¿qué te ha aburrido?, ¿qué no has entendido?, ¿qué repetirías?
3. Apuntar la versión (v1.x beta) y qué cambia, en el historial del juego.
4. Publicar el juego y luego **volver a publicar Curionaut** (subir un cambio a su repositorio) para que la web lo recoja.

## 6. Orden de prioridades (noviembre 2026)

1. Terminar lo empezado: **PhiloQuest VI–X**; pruebas con 2–3 familias amigas de Chrono-Ohm y Pitágoras.
2. Dominio `curionaut.org` → mudanza de Nil.
3. Voces de los mentores (ElevenLabs) y escenas animadas (Gemini), las dos mediante GitHub.
4. Juego nuevo: electromagnetismo, química o Tales/trigonometría (que vote Nil).
5. Mentor con IA e inglés, al final.

**Regla de oro:** un catálogo corto y terminado se vende mejor que muchos juegos a medias.
