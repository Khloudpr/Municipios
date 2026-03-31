// shared/js/utils.js
// Funciones de utilidad compartidas entre todos los municipios

// ── FECHAS ───────────────────────────────────────────────────

export function formatFecha(dateString) {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleDateString('es-PR', {
    year: 'numeric', month: 'short', day: 'numeric',
    hour: '2-digit', minute: '2-digit'
  });
}

export function diasTranscurridos(dateString) {
  if (!dateString) return 0;
  const diff = Date.now() - new Date(dateString).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

// ── SLA BADGE ────────────────────────────────────────────────

export function getSLABadge(reporte) {
  if (reporte.estatus === 'Resuelto') {
    return { texto: 'RESUELTO', clase: 'bg-green-100 text-green-800' };
  }
  if (!reporte.fecha_limite) {
    return { texto: 'SIN FECHA', clase: 'bg-gray-100 text-gray-600' };
  }

  const ahora = new Date();
  const limite = new Date(reporte.fecha_limite);
  const diffHoras = (limite - ahora) / (1000 * 60 * 60);

  if (diffHoras < 0) {
    return { texto: 'VENCIDO', clase: 'bg-red-100 text-red-800' };
  }
  if (diffHoras < 24) {
    return { texto: 'VENCE HOY', clase: 'bg-amber-100 text-amber-800' };
  }
  return { texto: 'A TIEMPO', clase: 'bg-green-100 text-green-700' };
}

// ── ESTATUS BADGE ────────────────────────────────────────────

export function getEstatusBadge(estatus) {
  const map = {
    'Recibido':   { clase: 'bg-blue-100 text-blue-800',   icon: '📋' },
    'En proceso': { clase: 'bg-yellow-100 text-yellow-800', icon: '🔧' },
    'Resuelto':   { clase: 'bg-green-100 text-green-800', icon: '✅' },
    'Cerrado':    { clase: 'bg-gray-100 text-gray-600',   icon: '🔒' }
  };
  return map[estatus] || { clase: 'bg-gray-100 text-gray-600', icon: '❓' };
}

// ── PRIORIDAD BADGE ──────────────────────────────────────────

export function getPrioridadBadge(prioridad) {
  const map = {
    'Alta':  { clase: 'bg-red-100 text-red-800',    icon: '🔴' },
    'Media': { clase: 'bg-yellow-100 text-yellow-800', icon: '🟡' },
    'Baja':  { clase: 'bg-green-100 text-green-700', icon: '🟢' }
  };
  return map[prioridad] || { clase: 'bg-gray-100 text-gray-600', icon: '⚪' };
}

// ── FOTOS ────────────────────────────────────────────────────

export async function subirFoto(supabaseClient, archivo, reporteId) {
  const ext = archivo.name.split('.').pop();
  const path = `${reporteId}/${Date.now()}.${ext}`;

  const { data, error } = await supabaseClient.storage
    .from('fotos-reportes')
    .upload(path, archivo, { contentType: archivo.type });

  if (error) throw error;

  const { data: urlData } = supabaseClient.storage
    .from('fotos-reportes')
    .getPublicUrl(path);

  return urlData.publicUrl;
}

// ── GPS ──────────────────────────────────────────────────────

export function obtenerGPS() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocalización no disponible'));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

// ── TOAST NOTIFICATIONS ──────────────────────────────────────

export function toast(mensaje, tipo = 'info') {
  const colores = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    warning: 'bg-amber-500',
    info:    'bg-blue-600'
  };
  const div = document.createElement('div');
  div.className = `fixed bottom-6 right-6 z-50 ${colores[tipo]} text-white px-5 py-3 rounded-xl shadow-lg text-sm font-bold transition-all`;
  div.textContent = mensaje;
  document.body.appendChild(div);
  setTimeout(() => div.remove(), 3500);
}

// ── EXPORTAR CSV ─────────────────────────────────────────────

export function exportarCSV(data, nombreArchivo) {
  if (!data.length) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(r => headers.map(h => `"${(r[h] ?? '').toString().replace(/"/g, '""')}"`).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${nombreArchivo}-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
