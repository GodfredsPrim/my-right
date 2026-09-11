# MY RIGHT

MY RIGHT is a safety-first support and human follow-up platform for users in Ghana. It helps people understand their options and request professional follow-up without requiring an account to begin.

## Local setup

1. Copy `.env.example` to `.env.local` and fill in the Supabase values.
2. Install dependencies with `npm install`.
3. Apply `supabase/migrations/0001_foundation.sql` to a development Supabase project.
4. Start the app with `npm run dev`.

The AI provider and notification integrations are intentionally interfaces until their providers are configured. No fake production responses or public evidence URLs are included.

## Staff workspace

Set `DASHBOARD_ACCESS_TOKEN` to a long random value for the super-admin workspace, then open `/dashboard/login`. Staff tokens are validated against active `staff_members.token_hash` records. Dashboard session cookies are HTTP-only and expire after eight hours.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
