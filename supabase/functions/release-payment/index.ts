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
    const { paymentId, seekerId } = await req.json();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: payment, error: fetchError } = await supabase
      .from("payments")
      .select("*")
      .eq("id", paymentId)
      .eq("seeker_id", seekerId)
      .eq("status", "paid")
      .single();

    if (fetchError || !payment) {
      return new Response(JSON.stringify({ error: "Payment not found" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: providerProfile } = await supabase
      .from("profiles")
      .select("stripe_account_id")
      .eq("id", payment.provider_id)
      .single();

    const netAmount = payment.amount - payment.platform_fee;

    if (providerProfile?.stripe_account_id) {
      await stripe.transfers.create({
        amount: netAmount,
        currency: "eur",
        destination: providerProfile.stripe_account_id,
        description: `Qonnect Auszahlung – Match ${payment.match_id}`,
      });
    }

    await supabase.from("payments")
      .update({ status: "released", released_at: new Date().toISOString() })
      .eq("id", paymentId);

    await supabase.from("matches").update({ status: "completed" }).eq("id", payment.match_id);

    const netEur = (netAmount / 100).toFixed(2);
    const hasAccount = !!providerProfile?.stripe_account_id;

    await supabase.from("notifications").insert({
      user_id: payment.provider_id,
      type: "payment",
      title: "Zahlung freigegeben!",
      body: hasAccount
        ? `€${netEur} werden auf dein Bankkonto überwiesen.`
        : `€${netEur} warten auf dich – verbinde dein Bankkonto in den Einstellungen.`,
      related_id: payment.match_id,
    });

    return new Response(JSON.stringify({ success: true, transferred: hasAccount }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
