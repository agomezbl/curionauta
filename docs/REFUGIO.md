# El Refugio — ficha del juego

Mundo 3D de Curionaut donde el niño **aplica** lo que aprende en los juegos: monta, cablea y mide un refugio que funciona a 12 V.
Nace del documento de especificación hecho con Gemini (nov. 2026) y de las decisiones del plan maestro
(«Curionaut · Plan maestro y checklist», en los documentos de Alejandro).

## Estado: prototipo 0.1 (10/11/2026)
- Dirección: `curionaut.org/refugio/` · código: `site/refugio/index.html` (un solo archivo) + `three.min.js` (three.js r147, MIT).
- Guarda en el aparato con la clave `curionauta-refugio-0.1`. Solo en español (textos preparados para añadir francés). Sin cuentas.
- Todavía **no** sale en la lista de juegos de la Estación ni da puntos a su monedero.
- Prueba: `bash tools/montar.sh && node tools/test-refugio.js` (29 comprobaciones: los tres retos tocando la escena, móvil y tabletas,
  sin llamadas a servidores de fuera).

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
1. Darlo de alta en la Estación: tarjeta en `GAMES` de `site/estacion/app.js` (leer `curionauta-refugio-0.1`) y temas en `mentores.js`.
2. Francés.
3. Circuito y averías más ricos; retos por curso enlazados al Pasaporte; si un reto se atasca, el mentor manda a la misión del juego que lo enseña.
4. Más salas y piezas; después fluidos (depósitos), estructura (pesos) y la cinta métrica con Pitágoras.
5. Guardado en la nube y tienda conectada al monedero común de la Estación (⚡ Energía y 💎 Cristales).
