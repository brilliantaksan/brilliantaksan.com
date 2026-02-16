# Brilliant Aksan - Next.js Portfolio

This project has been migrated to **Next.js (App Router) + TypeScript + TailwindCSS** and is ready for **Vercel**.

## Stack

- Next.js 15
- TypeScript
- TailwindCSS
- Framer Motion (intro animations + dock interactions)
- next-themes (dark/light toggle)
- shadcn-style UI primitives (`Badge`, utility classes)

## Local development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Content editing

Main content source:
- `content/site.json`

Design tokens source:
- `content/design.json`

Admin + CMS:
- Login page: `/admin`
- Protected studio: `/admin/studio`
- Decap config: `public/admin/config.yml`
- OAuth callback route: `src/app/api/auth/route.ts`

Media storage:
- Upload media in `/admin/studio` via Supabase Storage uploader
- Paste generated public URLs into CMS fields

## Vercel deploy

1. Import this repo into Vercel.
2. Deploy with default settings (`npm run build`).

## Environment variables

Copy `.env.example` to `.env.local` and fill values.

Required:
1. `NEXT_PUBLIC_SUPABASE_URL`
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. `SUPABASE_SERVICE_ROLE_KEY`
4. `ADMIN_EMAILS`
5. `ADMIN_SESSION_SECRET`
6. `GITHUB_OAUTH_CLIENT_ID`
7. `GITHUB_OAUTH_CLIENT_SECRET`
8. `CMS_OAUTH_ORIGIN`

## Supabase setup

1. Create at least one auth user (email/password) for admin login.
2. Add that email to `ADMIN_EMAILS`.
3. Create a public Storage bucket (default name: `media`).
4. Set `NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET` if you use a different bucket name.

## GitHub OAuth setup for Decap

Create a GitHub OAuth App with:
1. Homepage URL: `https://brilliantaksan.com`
2. Authorization callback URL: `https://brilliantaksan.com/api/auth`
