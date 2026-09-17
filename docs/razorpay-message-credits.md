# Razorpay message credits

Bandhanaa uses Razorpay Checkout for the fixed message-credit pack: INR 10 = 10 outgoing-message credits.

## Required server environment variables

Configure these in Netlify for the Bandhanaa site and keep secret values server-side:

- `RAZORPAY_KEY_ID`
- `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`
- `SUPABASE_SERVICE_ROLE_KEY`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

Do not commit secret values to the repository.

## Razorpay webhook

Webhook URL:

`https://bandhanaa.netlify.app/api/razorpay/webhook`

Enable these events:

- `payment.authorized`
- `payment.captured`

The Razorpay webhook secret must exactly match `RAZORPAY_WEBHOOK_SECRET` in Netlify.

## Database

Apply `supabase/razorpay-message-credit-purchases.sql` to the Bandhanaa Supabase project. The finalization function is restricted to server/service-role use and credits are granted only after verified Razorpay payment details match the fixed credit pack.

## Deployment

After adding or rotating payment environment variables, trigger a new production deployment so the Next.js server runtime receives the updated values.
