// shared/supabase/functions/verificar-duplicado/index.ts
// Detecta reportes similares en la misma categoría y área en los últimos 7 días

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
      Deno.env.get('SUPABASE_ANON_KEY')!
    );

    const { categoria, ubicacion, lat, lng } = await req.json();

    const hace7dias = new Date();
    hace7dias.setDate(hace7dias.getDate() - 7);

    // Buscar por categoría + palabras clave de ubicación (últimos 7 días)
    const palabras = ubicacion
      .toLowerCase()
      .split(' ')
      .filter((p: string) => p.length >= 4);

    let query = supabase
      .from('reportes')
      .select('id, ubicacion, estatus, fecha_creacion, descripcion')
      .eq('categoria', categoria)
      .neq('estatus', 'Resuelto')
      .neq('estatus', 'Cerrado')
      .gte('fecha_creacion', hace7dias.toISOString())
      .limit(5);

    // Si hay coordenadas, filtrar por proximidad (aprox 200 metros)
    if (lat && lng) {
      const delta = 0.002; // ~200 metros
      query = query
        .gte('lat', lat - delta)
        .lte('lat', lat + delta)
        .gte('lng', lng - delta)
        .lte('lng', lng + delta);
    }

    const { data: candidatos, error } = await query;
    if (error) throw error;

    // Filtrar por similitud de ubicación si no hay coordenadas
    let duplicados = candidatos || [];
    if (!lat && palabras.length > 0) {
      duplicados = duplicados.filter(r =>
        palabras.some((p: string) => r.ubicacion.toLowerCase().includes(p))
      );
    }

    return new Response(JSON.stringify({
      success: true,
      esDuplicado: duplicados.length > 0,
      reportesSimilares: duplicados
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (err) {
    return new Response(JSON.stringify({ success: false, error: err.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
