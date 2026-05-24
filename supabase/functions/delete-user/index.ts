import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { userId, requesterId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: requester } = await supabase.from("profiles").select("is_admin").eq("id", requesterId).single();
    if (!requester?.is_admin) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (userId === requesterId) {
      return new Response(JSON.stringify({ error: "Cannot delete yourself" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    await supabase.from("notifications").delete().eq("user_id", userId);
    await supabase.from("ratings").delete().or(`rater_id.eq.${userId},rated_id.eq.${userId}`);
    await supabase.from("saved_posts").delete().eq("user_id", userId);
    await supabase.from("messages").delete().eq("sender_id", userId);
    await supabase.from("offers").delete().or(`sender_id.eq.${userId},receiver_id.eq.${userId}`);
    await supabase.from("payments").delete().or(`seeker_id.eq.${userId},provider_id.eq.${userId}`);
    await supabase.from("matches").delete().or(`seeker_id.eq.${userId},provider_id.eq.${userId}`);
    await supabase.from("posts").delete().eq("author_id", userId);
    await supabase.from("profiles").delete().eq("id", userId);
    await supabase.auth.admin.deleteUser(userId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
