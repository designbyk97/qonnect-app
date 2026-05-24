import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@14.11.0?target=deno";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { sessionId, matchId } = await req.json();

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const seekerId = session.metadata?.seekerId;
    const providerId = session.metadata?.providerId;
    const amountCents = session.amount_total ?? 0;
    const platformFee = Math.round(amountCents * 0.10);

    const { error } = await supabase.from("payments").insert({
      match_id: matchId,
      seeker_id: seekerId,
      provider_id: providerId,
      amount: amountCents,
      platform_fee: platformFee,
      stripe_session_id: sessionId,
      status: "paid",
    });

    await supabase.from("matches").update({ status: "active" }).eq("id", matchId);

    if (!error) {
      const amountEur = (amountCents / 100).toFixed(2);
      await supabase.from("notifications").insert({
        user_id: providerId,
        type: "payment",
        title: "Zahlung eingegangen!",
        body: `€${amountEur} wurden sicher hinterlegt. Löse das Problem, dann gibt der Kunde frei.`,
        related_id: matchId,
      });
    }

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
