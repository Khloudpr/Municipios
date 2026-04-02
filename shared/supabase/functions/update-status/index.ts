// shared/supabase/functions/update-status/index.ts
// Edge Function: actualiza estatus/prioridad y notifica al ciudadano

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { id_reporte, nuevo_estatus, nueva_prioridad, comentario, usuario_email } = await req.json();

    // 1. Obtener reporte actual
    const { data: reporte, error: fetchError } = await supabase
      .from('reportes')
      .select('*')
      .eq('id', id_reporte)
      .single();

    if (fetchError) throw fetchError;

    // 2. Preparar actualización
    const updates: Record<string, unknown> = {};
    if (nuevo_estatus)    updates.estatus = nuevo_estatus;
    if (nueva_prioridad)  updates.prioridad = nueva_prioridad;
    if (nuevo_estatus === 'Resuelto') updates.fecha_cierre = new Date().toISOString();

    // 3. Actualizar reporte (el trigger de audit_log se dispara automáticamente)
    const { data: actualizado, error: updateError } = await supabase
      .from('reportes')
      .update(updates)
      .eq('id', id_reporte)
      .select()
      .single();

    if (updateError) throw updateError;

    // 4. Agregar comentario si viene
    if (comentario) {
      await supabase.from('comentarios').insert({
        id_reporte,
        texto: comentario,
        autor: usuario_email,
        autor_email: usuario_email
      });
    }

    // 5. Notificar al ciudadano si cambió el estatus
    if (nuevo_estatus && nuevo_estatus !== reporte.estatus) {
      const mensajes: Record<string, string> = {
        'En proceso': 'Tu reporte está siendo atendido por nuestro equipo.',
        'Resuelto':   '¡Tu reporte ha sido resuelto! Gracias por reportarlo.',
        'Cerrado':    'Tu reporte ha sido cerrado.'
      };

      await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: `${Deno.env.get('MUNICIPIO_NOMBRE')} Reporta <noreply@municipioreporta.com>`,
          to: reporte.email,
          subject: `Reporte ${id_reporte} — ${nuevo_estatus}`,
          html: `
            <h2>Actualización de tu reporte</h2>
            <p>Reporte: <strong>${id_reporte}</strong></p>
            <p>Nuevo estatus: <strong style="color:#1E3A5F">${nuevo_estatus}</strong></p>
            <p>${mensajes[nuevo_estatus] || ''}</p>
            ${comentario ? `<p><em>"${comentario}"</em></p>` : ''}
            <p>Ver tu reporte: <a href="${Deno.env.get('SITE_URL')}/consulta.html">${id_reporte}</a></p>
          `
        })
      });
    }

    return new Response(JSON.stringify({ success: true, reporte: actualizado }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
