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
- Studio editor source: `src/components/admin/content-editor.tsx`
- Content API: `src/app/api/admin/content/route.ts`

Media storage:
- Upload media inline in each field from `/admin/studio`
- URLs are inserted directly into the corresponding profile/project fields

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

Optional (recommended in production so saves persist):
1. `GITHUB_CONTENT_TOKEN`
2. `GITHUB_REPO`
3. `GITHUB_BRANCH`
4. `SUPABASE_CONTENT_BUCKET`
5. `SUPABASE_CONTENT_PATH`

## Supabase setup

1. Create at least one auth user (email/password) for admin login.
2. Add that email to `ADMIN_EMAILS`.
3. Create a public Storage bucket (default name: `media`).
4. Set `NEXT_PUBLIC_SUPABASE_MEDIA_BUCKET` if you use a different bucket name.

## Admin save behavior

1. If `GITHUB_CONTENT_TOKEN` is set, saving in `/admin/studio` updates `content/site.json` in GitHub.
2. If `GITHUB_CONTENT_TOKEN` is not set, saving updates local `content/site.json` when writable (local development).
3. If local filesystem is read-only (e.g. `/var/task` on serverless), saving falls back to Supabase Storage (`SUPABASE_CONTENT_BUCKET`/`SUPABASE_CONTENT_PATH`, default `media/content/site.json`).

## GitHub OAuth setup for Decap

Create a GitHub OAuth App with:
1. Homepage URL: `https://brilliantaksan.com`
2. Authorization callback URL: `https://brilliantaksan.com/api/auth`
