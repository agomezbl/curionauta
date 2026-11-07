# Publicar curionauta.com — paso a paso

Para hacerlo una sola vez. Unos 20 minutos. No hace falta saber programar.

## 1. Dominio (Cloudflare)

1. Entra en **dash.cloudflare.com** con tu cuenta.
2. Menú de la izquierda → **Domain Registration → Register Domains**.
3. Escribe `curionauta.com` → si está libre, **Purchase**. Paga con tu tarjeta (lo haces tú).
4. Al terminar, el dominio aparece en **Websites / Domains**. Cloudflare ya lo gestiona: no hay que tocar DNS.

## 2. Repositorio (GitHub)

1. Entra en **github.com/new**.
2. Repository name: `curionauta` · **Public** · no marques nada más · **Create repository**.
3. Avisa a Claude: sube el código y comprueba que todo está.

## 3. La web (Cloudflare Pages)

1. Cloudflare → menú izquierdo → **Workers & Pages** → **Create application** → pestaña **Pages** → **Connect to Git**.
2. La primera vez pide **conectar GitHub**: elige *Only select repositories* → `curionauta` → **Install & Authorize**.
3. Elige el repositorio `curionauta` → **Begin setup**.
4. Rellena exactamente:
   - Project name: `curionauta`
   - Production branch: `main`
   - Framework preset: **None**
   - Build command: `bash tools/montar.sh`
   - Build output directory: `dist`
5. **Save and Deploy**. Tarda 2–3 minutos. Al acabar da una dirección provisional tipo `curionauta.pages.dev`: ábrela y comprueba que sale la web.
6. En el proyecto → pestaña **Custom domains** → **Set up a custom domain** → `curionauta.com` → **Continue → Activate domain**.
   Repite con `www.curionauta.com`.
7. En unos minutos `https://curionauta.com` funciona, con candado.

## 4. Correo de contacto (gratis, opcional pero recomendado)

1. Cloudflare → tu dominio `curionauta.com` → **Email → Email Routing → Get started / Enable**.
2. **Create address**: `contacto` → destino: tu correo **personal** (no el del trabajo).
3. Cloudflare te manda un correo para verificar el destino: ábrelo y confirma.
4. Desde ese momento, lo que llegue a `contacto@curionauta.com` te llega a tu correo.

## 5. La base de datos (Supabase)

1. supabase.com → el proyecto de siempre → **SQL Editor → New query**.
2. Abre `supabase/0032_cuaderno.sql` del repositorio (botón *Raw* en GitHub), copia todo y pégalo.
3. **Run**. Debe salir una fila con dos `true`.
4. Supabase → **Authentication → URL Configuration** → en *Redirect URLs* añade `https://curionauta.com/**`.

## 6. La mudanza de Nil

Cuando `https://curionauta.com/estacion/` funcione, Claude activa el botón «Llevar mis partidas» en la Estación antigua. Después, en el móvil y en la tableta de Nil:

1. Abre la **Estación antigua** (la de siempre) → aparece el recuadro *«La Estación se muda a Curionauta»* → **Llevar mis partidas**.
2. Se abre la nueva Estación → **Guardar aquí**. Partidas, notas, enlaces de Pronote y Rutinator viajan juntos.
3. En la nueva Estación: ⚙️ → **Instalar como app**.
4. Borra de la pantalla de inicio los iconos antiguos (Estación, Chrono-Ohm, Pitágoras, Rutinator) para no seguir usándolos por error.

Repite en cada aparato: la mudanza lleva lo que hay en *ese* aparato.

## Cuando algo cambie

Claude publica en GitHub y Cloudflare vuelve a montar la web solo. Si se ha cambiado un juego (por ejemplo Chrono-Ohm), hay que volver a desplegar Curionauta: Cloudflare → proyecto → **Deployments → Retry deployment** (o lo hace Claude con un cambio cualquiera).
