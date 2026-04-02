import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { nombre, apellido, email, password, telefono, departamento, rol, permisos } = await req.json();

    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    // Crear usuario en Auth
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

    if (authError) {
      return new Response(JSON.stringify({ error: authError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Crear perfil
    const { error: perfilError } = await supabaseAdmin
      .from("perfiles")
      .insert({
        id: authData.user.id,
        nombre,
        apellido,
        telefono: telefono || null,
        rol,
        departamento: departamento || null,
        permisos: permisos ? permisos.split(",").map((p: string) => p.trim()).filter(Boolean) : [],
        activo: true,
      });

    if (perfilError) {
      // Si falla el perfil, elimina el usuario de Auth
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
      return new Response(JSON.stringify({ error: perfilError.message }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true, userId: authData.user.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});