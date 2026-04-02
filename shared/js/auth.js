// shared/js/auth.js
// Manejo de autenticación con Supabase Auth
// Reemplaza completamente el sistema de localStorage con GAS

import supabase from './supabase-client.js';

// ── LOGIN ────────────────────────────────────────────────────

export async function login(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;

  // Cargar perfil del empleado (rol, permisos, departamento)
  const { data: perfil, error: perfilError } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (perfilError) throw perfilError;

  return {
    user: data.user,
    session: data.session,
    perfil
  };
}

// ── LOGOUT ───────────────────────────────────────────────────

export async function logout() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  window.location.href = 'login.html';
}

// ── VERIFICAR SESIÓN ─────────────────────────────────────────
// Llama esto al inicio de cada página protegida.
// Redirige a login si no hay sesión activa.
// Redirige a hub si no tiene permiso para el módulo.

export async function verificarSesion(moduloRequerido = null) {
  const { data: { session }, error } = await supabase.auth.getSession();

  if (error || !session) {
    window.location.href = 'login.html';
    return null;
  }

  // Cargar perfil
  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  if (!perfil || !perfil.activo) {
    await supabase.auth.signOut();
    window.location.href = 'login.html';
    return null;
  }

  // Verificar permiso para el módulo
  if (moduloRequerido && perfil.rol !== 'admin') {
    if (!perfil.permisos?.includes(moduloRequerido)) {
      window.location.href = 'hub.html';
      return null;
    }
  }

  return { session, perfil };
}

// ── OBTENER SESIÓN ACTUAL (sin redirigir) ────────────────────

export async function getSesion() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return null;

  const { data: perfil } = await supabase
    .from('perfiles')
    .select('*')
    .eq('id', session.user.id)
    .single();

  return { session, perfil };
}

// ── CREAR EMPLEADO (solo admins) ─────────────────────────────

export async function crearEmpleado({ nombre, apellido, email, password, rol, departamento, permisos }) {
  // 1. Crear usuario en Supabase Auth
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });
  if (error) throw error;

  // 2. Crear perfil
  const { error: perfilError } = await supabase
    .from('perfiles')
    .insert({ id: data.user.id, nombre, apellido, email, rol, departamento, permisos });

  if (perfilError) throw perfilError;

  return data.user;
}
