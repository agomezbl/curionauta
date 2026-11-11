# El Refugio — ficha del juego

Mundo 3D de Curionaut donde el niño **aplica** lo que aprende en los juegos: monta, cablea y mide un refugio que funciona a 12 V.
Nace del documento de especificación hecho con Gemini (nov. 2026) y de las decisiones del plan maestro
(«Curionaut · Plan maestro y checklist», en los documentos de Alejandro).

## Estado: prototipo 0.2 (11/11/2026)
- Dirección: `curionaut.org/refugio/` · código: `site/refugio/index.html` (un solo archivo) + `three.min.js` (three.js r147, MIT).
- Guarda en el aparato con la clave `curionauta-refugio-0.1` (no se cambia aunque suba la versión, para no perder partidas). Sin cuentas.
- **Español y francés.** El título «El Refugio» no se traduce, igual que en los demás juegos.
- **Sale en la Estación** (tarjeta en «Mis juegos») y el mentor comenta cada reto. Todavía no está conectado al monedero común.
- Prueba: `bash tools/montar.sh && node tools/test-refugio.js` (47 comprobaciones: los tres retos tocando la escena, el francés,
  móvil y tabletas, sin llamadas a servidores de fuera). También entra en `tools/test.js` (Estación) y en `tools/test-accesibilidad.js`.

## Historial
- **0.2 (11/11/2026):** francés completo; alta en la Estación con cuatro temas para los mentores; frases sin género
  («Pieza colocada: Interruptor», antes «Interruptor colocada»); la espera de cada paso cuenta tiempo real (antes se alargaba
  en aparatos lentos); lo último que se hace se guarda aunque se salga enseguida; mejoras de accesibilidad.
- **0.1 (10/11/2026):** primera versión: una sala, tres retos y el multímetro, solo en español.

## Idiomas (cómo funciona)
- Todos los textos están al principio del código, cada uno con sus dos versiones: `q('español', 'francés')`
  (diccionario `TX`, piezas `COMP`, sitios `SLOTS`, retos `RETOS` y `PASS`). La prueba falla si a alguno le falta un idioma.
- Qué idioma sale: el elegido con los botones **ES / FR** (abajo, junto a «Empezar de nuevo»); si no se ha elegido,
  el de la Estación; si no, el del aparato. Al cambiarlo, la página se recarga sola sin perder la partida.
- En francés se pone solo el espacio que no se parte antes de `? ! : ;`. Vocabulario: LED (femenino), ampoule, tableau,
  établi, câble, borne, buzzer, multimètre, Énergie, Passeport, défi.

## En la Estación
- Tarjeta `refugio` en `GAMES` de `site/estacion/app.js`: muestra el reto en curso, `n/3 retos` y 40 XP por reto superado
  (lo mismo que da el juego en Energía ⚡). Con los tres hechos pone «Modo libre».
- Temas en `mentores.js`: `refugio:r1`, `refugio:r2`, `refugio:r3` (un reto superado) y `refugio:general`
  (avances a medias o montajes nuevos en modo libre). Son 128 audios más en el inventario de voces (ahora 928 en total).

## Qué hay dentro
- Sala con ranuras de montaje (tocar pieza → tocar hueco): banco (batería), cuadro (3 huecos), encima de la puerta (LED),
  techo (bombilla), pared (ventilador o zumbador) y exterior (placa solar).
- Cables tocando borne a borne; herramientas Montar, Cable, Medir y Quitar.
- Circuito resuelto de verdad (análisis nodal): LED con 2 V de caída, placa solar limitada a 18 V, batería que se vacía y se carga,
  fusible de 2 A, cable que se quema en un cortocircuito.
- Multímetro: voltios (punta roja y negra), pinza de amperios, ohmios (con el circuito apagado) y continuidad con pitido.
- Día y noche: la placa carga de día; botón ⏩ para pasar la noche o el día.
- Tres retos con la mentora Bitácora:
  1. **Luz de emergencia:** R = (12 − 2) V ÷ 0,02 A = 500 Ω → elegir la comercial de 560 Ω (con 470 Ω el LED se quema).
  2. **¿Aguanta la noche?:** E = 5 W × 10 h = 50 Wh > 40 Wh → comprar la batería grande; después la placa la recarga.
  3. **El cable cortado:** una tormenta corta un cable; encontrarlo con el multímetro en continuidad.
- Energía ⚡ por reto (40), tienda de piezas y Pasaporte con las tres competencias. Después, modo libre.

## Decisiones de diseño (no cambiar sin hablarlo)
- 12 V en todo el refugio. Los 230 V solo aparecerán detrás de un inversor, como zona de peligro.
- Ranuras y toques, no gizmos 3D libres: en tableta un niño no maneja bien la colocación libre.
- Sin combate: el reto lo ponen las averías, la noche y el tiempo.
- Al principio, modelos dibujados por código (sin archivos .glb) para que cargue rápido.
- Cada reto enlaza a una competencia del Pasaporte y a su equivalencia en el currículo FR/ES («alineado», nunca «100 %»).

## Condición para seguir
Que Nil vuelva por su cuenta al menos tres veces en una semana y resuelva los tres retos.

## Siguiente (El Refugio 1.0, por este orden)
1. ~~Darlo de alta en la Estación~~ — hecho en la 0.2.
2. ~~Francés~~ — hecho en la 0.2. Falta que alguien de habla francesa lo lea entero una vez.
3. Circuito y averías más ricos; retos por curso enlazados al Pasaporte; si un reto se atasca, el mentor manda a la misión del juego que lo enseña.
4. Más salas y piezas; después fluidos (depósitos), estructura (pesos) y la cinta métrica con Pitágoras.
5. Guardado en la nube y tienda conectada al monedero común de la Estación (⚡ Energía y 💎 Cristales).
