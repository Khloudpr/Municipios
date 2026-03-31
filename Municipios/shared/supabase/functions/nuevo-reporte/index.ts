// shared/supabase/functions/nuevo-reporte/index.ts
// Edge Function: recibe un reporte nuevo, sube fotos, inserta en DB, envía email

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

    const body = await req.json();
    const { nombre, email, telefono, categoria, departamento,
            ubicacion, descripcion, fotos_base64, lat, lng, prioridad } = body;

    // 1. Subir fotos a Storage
    const fotosUrls: string[] = [];
    if (fotos_base64 && fotos_base64.length > 0) {
      for (const [i, fotoData] of fotos_base64.entries()) {
        const base64 = fotoData.split(',')[1];
        const ext = fotoData.startsWith('data:image/png') ? 'png' : 'jpg';
        const tempId = `temp-${Date.now()}-${i}`;
        const path = `${tempId}/foto-${i}.${ext}`;

        const bytes = Uint8Array.from(atob(base64), c => c.charCodeAt(0));
        const { data, error } = await supabase.storage
          .from('fotos-reportes')
          .upload(path, bytes, { contentType: `image/${ext}` });

        if (!error && data) {
          const { data: urlData } = supabase.storage
            .from('fotos-reportes')
            .getPublicUrl(path);
          fotosUrls.push(urlData.publicUrl);
        }
      }
    }

    // 2. Insertar reporte (el trigger genera el ID y la fecha_limite)
    const { data: reporte, error } = await supabase
      .from('reportes')
      .insert({
        nombre, email, telefono, categoria, departamento,
        ubicacion, descripcion, lat, lng,
        prioridad: prioridad || 'Media',
        fotos: fotosUrls,
        estatus: 'Recibido'
      })
      .select()
      .single();

    if (error) throw error;

    // 3. Renombrar fotos con el ID real del reporte
    if (fotosUrls.length > 0) {
      const fotosFinales: string[] = [];
      for (const [i, url] of fotosUrls.entries()) {
        const oldPath = url.split('/fotos-reportes/')[1];
        const ext = oldPath.split('.').pop();
        const newPath = `${reporte.id}/foto-${i}.${ext}`;
        await supabase.storage.from('fotos-reportes').move(oldPath, newPath);
        const { data: urlData } = supabase.storage.from('fotos-reportes').getPublicUrl(newPath);
        fotosFinales.push(urlData.publicUrl);
      }
      await supabase.from('reportes').update({ fotos: fotosFinales }).eq('id', reporte.id);
      reporte.fotos = fotosFinales;
    }

    // 4. Enviar email de confirmación al ciudadano
    await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: `${Deno.env.get('MUNICIPIO_NOMBRE')} Reporta <noreply@municipioreporta.com>`,
        to: email,
        subject: `Reporte ${reporte.id} recibido — ${Deno.env.get('MUNICIPIO_NOMBRE')} Reporta`,
        html: `
          <h2>¡Gracias, ${nombre}!</h2>
          <p>Hemos recibido tu reporte. Aquí está tu número de caso:</p>
          <h1 style="color:#1E3A5F;letter-spacing:2px">${reporte.id}</h1>
          <p><strong>Categoría:</strong> ${categoria}</p>
          <p><strong>Ubicación:</strong> ${ubicacion}</p>
          <p><strong>Prioridad:</strong> ${reporte.prioridad}</p>
          <p>Puedes dar seguimiento a tu reporte en: <a href="${Deno.env.get('SITE_URL')}/consulta.html">consulta.html</a></p>
          <p>Te notificaremos cuando haya actualizaciones.</p>
        `
      })
    });

    return new Response(JSON.stringify({ success: true, reporte }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
