# Bandhanaa

A production-oriented authentication foundation for Bandhanaa, built with Next.js App Router, React, TypeScript, Material UI, React Hook Form, Zod, and Supabase SSR authentication.

## Setup

1. Install dependencies with `npm install`.
2. Create a Supabase project and copy `.env.example` to `.env.local`.
3. Add the project URL, publishable/anon key, and `NEXT_PUBLIC_SITE_URL=http://localhost:3000` to `.env.local`.
4. Run `supabase/schema.sql` in the Supabase SQL editor. It creates the private profile table, RLS policies, automatic profile trigger, and update timestamp trigger.
5. In Supabase Authentication > URL Configuration, set the production Site URL and allow the callback/reset URLs documented below.
6. For Google sign-in, enable the Google provider in Supabase and add the Google client ID/secret. In Google Cloud, use the callback URL shown by Supabase (normally `https://<project-ref>.supabase.co/auth/v1/callback`).
7. Run `npm run dev`; for a production check use `npm run build` and `npm start`.

## Authentication architecture

The browser client handles password and OAuth initiation. The callback exchanges PKCE codes server-side. `proxy.ts` refreshes auth cookies and protects `/dashboard` before rendering, while server components validate the user with `getUser()`. Authenticated visitors are redirected away from `/login` and `/register`. Signing out occurs through a server route.

Profiles are separate from `auth.users` and are created by a security-definer trigger. RLS permits each signed-in user to select and update only their own row; there is no public write policy.

## Production deployment

Add the Supabase public variables and `NEXT_PUBLIC_SITE_URL` to the hosting provider. `NEXT_PUBLIC_SITE_URL` must be the canonical production origin, such as `https://bandhanaa.com`, without a trailing slash. On Netlify, configure it under Site configuration > Environment variables and redeploy. A temporary Netlify domain may be used only when it is the actual canonical site. Vercel deployments can use `NEXT_PUBLIC_VERCEL_URL` as a fallback, but `NEXT_PUBLIC_SITE_URL` remains preferred. Never expose a service-role key. Deploy after `npm run build` succeeds.

In Supabase Authentication > URL Configuration:

- Set **Site URL** to the canonical production origin.
- Allow `http://localhost:3000/reset-password` and `http://localhost:3000/auth/callback` for local development.
- Allow `https://<your-netlify-site>.netlify.app/reset-password` and `/auth/callback` only if that domain is used.
- Allow `https://<your-production-domain>/reset-password` and `/auth/callback`.

The URL passed to Supabase must exactly match an allowed redirect URL. Add only domains used by this project.

## Future AI features

Keep future model/provider clients under `lib/ai`, server-only orchestration in route handlers or server actions, and persistence in dedicated RLS-protected tables. Do not expose model credentials to client components; stream only authorized results from server endpoints.

## Generated visual

The original hero artwork lives at `public/bandhanaa-hero.png` and was generated specifically for this UI. Prompt: “A premium soft-focus editorial illustration of an adult couple facing each other, warm backlight, flowing translucent blush-pink and violet ribbons, airy white background, no text, logo, watermark, or UI.”
