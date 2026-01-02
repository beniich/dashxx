# Edge Functions Reference (Supabase / Deno)

## Stripe Webhook Handler
Cette fonction écoute les événements Stripe (ex: `checkout.session.completed`) pour mettre à jour les statuts de paiement en base de données de manière sécurisée.

**Déploiement**
```bash
supabase functions deploy stripe-webhook
```

**Variables d'environnement requises**
- `STRIPE_SECRET_KEY`: Clé secrète API Stripe (sk_live_...).
- `STRIPE_WEBHOOK_SECRET`: Secret de signature du webhook (whsec_...).
- `SUPABASE_URL`: URL API Supabase.
- `SUPABASE_SERVICE_KEY`: Clé `service_role` (nécessaire pour bypasser RLS et écrire l'update).
- `RESEND_API_KEY`: Clé API Resend (optionnel pour mails).

**Code Source (`functions/stripe-webhook/index.ts`)**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@8.174.0?deno-std=0.168.0';

// Initialisation Stripe
const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string, {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(), // Important pour Deno
});

const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') as string;

serve(async (req) => {
  // 1. Vérification de la méthode
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  // 2. Vérification de la signature Stripe
  const sig = req.headers.get('stripe-signature') as string;
  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig, stripeWebhookSecret);
  } catch (err) {
    console.error(`Webhook Signature Error: ${err.message}`);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  // 3. Traitement de l'événement
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const invoiceId = session.metadata?.invoice_id; // Metadata passée lors de la création de la session

    if (invoiceId) {
      console.log(`Processing payment for invoice: ${invoiceId}`);

      // Initialisation Supabase Admin (Service Role)
      const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') as string,
        Deno.env.get('SUPABASE_SERVICE_KEY') as string
      );

      // Mise à jour de la facture
      const { error } = await supabase
        .from('crm.invoices')
        .update({ 
            status: 'paid', 
            paid_at: new Date().toISOString() 
        })
        .eq('id', invoiceId);

      if (error) {
        console.error('DB Update Error:', error);
        return new Response('DB Error', { status: 500 });
      }

      // (Optionnel) Envoi d'email de confirmation via Resend
      const RESEND_KEY = Deno.env.get('RESEND_API_KEY');
      if (RESEND_KEY && session.customer_email) {
          const { Resend } = await import('https://esm.sh/resend@2.0.0');
          const resend = new Resend(RESEND_KEY);
          await resend.emails.send({
            from: 'noreply@cloud-industrie.com',
            to: session.customer_email,
            subject: 'Paiement Confirmé - Cloud Industrie',
            html: `<p>Votre facture <strong>${invoiceId}</strong> a bien été réglée. Merci de votre confiance !</p>`,
          });
      }
    } else {
        console.warn('No invoice_id found in session metadata');
    }
  }

  return new Response('Webhook Handled Successfully', { status: 200 });
});
```
