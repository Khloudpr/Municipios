// shared/supabase/functions/sla-check/index.ts
// Cron diario: detecta reportes vencidos o por vencer y notifica a admins
// Configurar en Supabase Dashboard → Edge Functions → Schedule: "0 8 * * *"

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

serve(async () => {
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const ahora = new Date();
  const manana = new Date(ahora.getTime() + 24 * 60 * 60 * 1000);

  // Reportes vencidos (fecha_limite < ahora, no resueltos)
  const { data: vencidos } = await supabase
    .from('reportes')
    .select('id, categoria, ubicacion, prioridad, fecha_limite, departamento')
    .lt('fecha_limite', ahora.toISOString())
    .not('estatus', 'in', '("Resuelto","Cerrado")')
    .order('fecha_limite', { ascending: true });

  // Reportes que vencen hoy
  const { data: porVencer } = await supabase
    .from('reportes')
    .select('id, categoria, ubicacion, prioridad, fecha_limite, departamento')
    .gte('fecha_limite', ahora.toISOString())
    .lt('fecha_limite', manana.toISOString())
    .not('estatus', 'in', '("Resuelto","Cerrado")')
    .order('fecha_limite', { ascending: true });

  const totalProblemas = (vencidos?.length || 0) + (porVencer?.length || 0);

  if (totalProblemas === 0) {
    return new Response(JSON.stringify({ message: 'Sin alertas SLA hoy' }));
  }

  // Obtener emails de admins
  const { data: admins } = await supabase
    .from('perfiles')
    .select('id, nombre, apellido')
    .eq('rol', 'admin')
    .eq('activo', true);

  // Obtener emails de auth.users para los admins
  const emailsAdmin: string[] = [];
  for (const admin of admins || []) {
    const { data: userData } = await supabase.auth.admin.getUserById(admin.id);
    if (userData?.user?.email) emailsAdmin.push(userData.user.email);
  }

  if (emailsAdmin.length === 0) {
    return new Response(JSON.stringify({ message: 'Sin admins para notificar' }));
  }

  // Construir email de resumen
  const filaVencido = (r: { id: string; categoria: string; ubicacion: string; prioridad: string; fecha_limite: string }) =>
    `<tr style="background:#FEF2F2">
      <td style="padding:8px;border:1px solid #eee"><strong>${r.id}</strong></td>
      <td style="padding:8px;border:1px solid #eee">${r.categoria}</td>
      <td style="padding:8px;border:1px solid #eee">${r.ubicacion}</td>
      <td style="padding:8px;border:1px solid #eee"><strong style="color:#DC2626">VENCIDO</strong></td>
    </tr>`;

  const filaPorVencer = (r: { id: string; categoria: string; ubicacion: string; prioridad: string; fecha_limite: string }) =>
    `<tr style="background:#FFFBEB">
      <td style="padding:8px;border:1px solid #eee"><strong>${r.id}</strong></td>
      <td style="padding:8px;border:1px solid #eee">${r.categoria}</td>
      <td style="padding:8px;border:1px solid #eee">${r.ubicacion}</td>
      <td style="padding:8px;border:1px solid #eee"><strong style="color:#D97706">VENCE HOY</strong></td>
    </tr>`;

  const html = `
    <h2>⚠️ Reporte diario SLA — ${Deno.env.get('MUNICIPIO_NOMBRE')}</h2>
    <p>${new Date().toLocaleDateString('es-PR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
    
    ${(vencidos?.length || 0) > 0 ? `
      <h3 style="color:#DC2626">🔴 Reportes vencidos (${vencidos?.length})</h3>
      <table style="width:100%;border-collapse:collapse">
        <tr style="background:#1E3A5F;color:white">
          <th style="padding:8px">ID</th><th style="padding:8px">Categoría</th>
          <th style="padding:8px">Ubicación</th><th style="padding:8px">Estado</th>
        </tr>
        ${vencidos?.map(filaVencido).join('')}
      </table>
    ` : ''}

    ${(porVencer?.length || 0) > 0 ? `
      <h3 style="color:#D97706">🟡 Vencen hoy (${porVencer?.length})</h3>
      <table style="width:100%;border-collapse:collapse">
        <tr style="background:#1E3A5F;color:white">
          <th style="padding:8px">ID</th><th style="padding:8px">Categoría</th>
          <th style="padding:8px">Ubicación</th><th style="padding:8px">Estado</th>
        </tr>
        ${porVencer?.map(filaPorVencer).join('')}
      </table>
    ` : ''}
  `;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      from: `${Deno.env.get('MUNICIPIO_NOMBRE')} Reporta <noreply@municipioreporta.com>`,
      to: emailsAdmin,
      subject: `⚠️ SLA: ${vencidos?.length || 0} vencidos, ${porVencer?.length || 0} vencen hoy`,
      html
    })
  });

  return new Response(JSON.stringify({
    success: true,
    vencidos: vencidos?.length || 0,
    porVencer: porVencer?.length || 0,
    notificados: emailsAdmin.length
  }));
});
