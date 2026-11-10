/* Configuración de la Estación de Curionaut.
   supabaseUrl y supabaseKey: los del proyecto (Supabase → Project Settings → API).
   La clave «publishable/anon» es pública por diseño: lo que protege los datos son las
   reglas (RLS) de la base de datos. Si se dejan vacíos, la Estación funciona solo en el aparato. */
window.ESTACION = {
  supabaseUrl: 'https://rkunylxrbnndijyvisfj.supabase.co',
  supabaseKey: 'sb_publishable_KhfVpiIf3dmRJ7C9ZJcwEw_ypS98OM7',
  // Nil usa Rutinator v2 (Vercel + Supabase): el botón «Abrir Rutinator» lleva allí.
  // Si en el aparato hay datos de Rutinator v3 (/rutinator/), la tarjeta los muestra y el botón abre la v3.
  rutinatorUrl: 'https://rutinator-v2.vercel.app/'
};
