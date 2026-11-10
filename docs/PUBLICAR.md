# Publicar curionaut.org — paso a paso

Para hacerlo una sola vez. Unos 20 minutos. No hace falta saber programar.

## 1. Dominio (Cloudflare)

Hecho el 10/11/2026: `curionaut.org` comprado en Cloudflare, con renovación automática.
Cloudflare ya lo gestiona: no hay que tocar DNS.

## 2. Repositorio (GitHub)

1. Entra en **github.com/new**.
2. Repository name: `curionauta` · **Public** · no marques nada más · **Create repository**.
3. Avisa a Claude: sube el código y comprueba que todo está.

## 3. La web (Cloudflare Workers) — hecho

1. Cloudflare → **Workers & Pages** → **Create** → **Import a repository** → `curionauta`. La orden de publicar
   (`npx wrangler deploy`) se deja como viene: `wrangler.jsonc` ya le dice que monte la web con `tools/montar.sh`
   y publique la carpeta `dist`.
2. Cada vez que Claude sube un cambio a GitHub, Cloudflare vuelve a montar y publicar solo (2–3 minutos).
   Se ve en el Worker → pestaña **Deployments**.
3. Dirección gratuita: `https://curionauta.agomez-saturno.workers.dev` (Settings → Domains & Routes →
   *Production* encendido; *Preview* apagado).
4. Cuando tengas el dominio: Settings → **Domains & Routes** → **Add → Custom domain** → `curionaut.org`,
   y otra vez con `www.curionaut.org`. En unos minutos funciona con candado.

## 4. Correo de contacto (gratis, opcional pero recomendado)

1. Cloudflare → tu dominio `curionaut.org` → **Email → Email Routing → Get started / Enable**.
2. **Create address**: `contacto` → destino: tu correo **personal** (no el del trabajo).
3. Cloudflare te manda un correo para verificar el destino: ábrelo y confirma.
4. Desde ese momento, lo que llegue a `contacto@curionaut.org` te llega a tu correo.

## 5. La base de datos (Supabase)

1. supabase.com → el proyecto de siempre → **SQL Editor → New query**.
2. Abre `supabase/0032_cuaderno.sql` del repositorio (botón *Raw* en GitHub), copia todo y pégalo.
3. **Run**. Debe salir una fila con dos `true`.
4. Supabase → **Authentication → URL Configuration** → en *Redirect URLs* añade `https://curionaut.org/**`.

## 6. La mudanza de Nil

Cuando `https://curionaut.org/estacion/` funcione, Claude activa el botón «Llevar mis partidas» en la Estación antigua. Después, en el móvil y en la tableta de Nil:

1. Abre la **Estación antigua** (la de siempre) → aparece el recuadro *«La Estación se muda a Curionaut»* → **Llevar mis partidas**.
2. Se abre la nueva Estación → **Guardar aquí**. Partidas, notas, enlaces de Pronote y Rutinator viajan juntos.
3. En la nueva Estación: ⚙️ → **Instalar como app**.
4. Borra de la pantalla de inicio los iconos antiguos (Estación, Chrono-Ohm, Pitágoras, Rutinator) para no seguir usándolos por error.

Repite en cada aparato: la mudanza lleva lo que hay en *ese* aparato.

## Cuando algo cambie

Claude publica en GitHub y Cloudflare vuelve a montar la web solo. Si se ha cambiado un juego (por ejemplo Chrono-Ohm), hay que volver a desplegar Curionaut: Cloudflare → proyecto → **Deployments → Retry deployment** (o lo hace Claude con un cambio cualquiera).
