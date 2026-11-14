# Asiful Maula Abir

# Portfolio CMS

A dynamic portfolio website and content-management dashboard built with
[Next.js](https://nextjs.org/), React, TypeScript, Tailwind CSS, and
[Appwrite](https://appwrite.io/).

The public site displays portfolio content such as the hero section, about
information, skills, projects, experience, and contact details. The protected
admin dashboard lets you manage that content without editing source files.

## Features

- Dynamic portfolio sections with custom section support
- Admin dashboard for:
  - About and hero content
  - Branding and loader settings
  - Skills and technology icons
  - Projects
  - Experience and education
  - Contact information
  - Contact-form messages
- Appwrite database and storage integration
- Admin authentication with protected `/admin` routes
- Image uploads for portfolio content
- Theme support, animated loading screen, custom cursor, and scroll progress
- Contact-form delivery through SMTP or Resend

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI:** React 19, Tailwind CSS 4
- **Animation:** Framer Motion
- **Icons:** Lucide React and Iconify
- **Backend:** Appwrite
- **Authentication:** JWT with HTTP-only cookies and bcrypt password hashing
- **Email:** Nodemailer or Resend
- **Package manager:** pnpm

## Requirements

- Node.js 20 or newer
- pnpm
- An Appwrite project with the required database, collections, and storage
  bucket configured

## Getting Started

### 1. Install dependencies

```bash
pnpm install
```

### 2. Configure environment variables

Create a `.env.local` file in the project root:

```env
# Appwrite
NEXT_PUBLIC_APPWRITE_ENDPOINT=https://fra.cloud.appwrite.io/v1
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-appwrite-project-id
APPWRITE_API_KEY=your-server-api-key
APPWRITE_DATABASE_ID=your-database-id

# Admin authentication
ADMIN_USERNAME=admin
JWT_SECRET=replace-with-a-long-random-secret

# Contact email (choose SMTP or Resend)
CONTACT_EMAIL=you@example.com
EMAIL_USER=you@example.com
EMAIL_PASS=your-smtp-password
# RESEND_API_KEY=re_your-api-key
```

Keep `.env.local` and all server-side API keys out of version control. The
`APPWRITE_API_KEY`, `JWT_SECRET`, email password, and Resend key must never be
exposed to the browser.

### 3. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the public
portfolio. Open [http://localhost:3000/admin](http://localhost:3000/admin) to
sign in to the dashboard.

## Available Scripts

| Command | Description |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm start` | Start the production server |
| `pnpm lint` | Run ESLint |

## Project Structure

```text
app/
  page.tsx                 Public portfolio page
  admin/                   Protected admin dashboard pages
  api/                     Appwrite-backed API route handlers
components/
  sections/                Public portfolio sections
  admin/                   Dashboard components
lib/
  appwrite.ts              Appwrite client and collection definitions
  auth.ts                  JWT authentication helpers
public/                    Static assets
scratch/                   One-off Appwrite maintenance scripts
```

## Appwrite Setup

The application uses Appwrite Database collections for portfolio content and
an Appwrite Storage bucket for uploaded images. The collection identifiers are
defined in [`lib/appwrite.ts`](./lib/appwrite.ts), including collections for
about content, projects, experience, skills, messages, branding, loaders, and
custom sections.

Before running the application in a new Appwrite project:

1. Create an Appwrite project and database.
2. Create the collections listed in `COLLECTIONS` in
   [`lib/appwrite.ts`](./lib/appwrite.ts).
3. Create the `portfolio_uploads` storage bucket, or update the configured
   bucket ID.
4. Create an admin document with a username and password hash.
5. Add the project endpoint, project ID, database ID, and server API key to
   `.env.local`.

The scripts in `scratch/` are maintenance utilities, not part of the
production request path. Review their source and environment configuration
before running one.

## Routes

### Public

- `/` — Public portfolio
- `/api/contact` — Contact-form submission endpoint

### Admin

- `/admin/login` — Admin sign-in
- `/admin` — Dashboard
- `/admin/about` — About and hero content
- `/admin/branding` — Branding settings
- `/admin/projects` — Projects
- `/admin/skills` — Skills
- `/admin/experience` — Experience and education
- `/admin/contact` — Contact information
- `/admin/messages` — Submitted messages
- `/admin/settings` — Project and section settings

All admin pages except `/admin/login` are protected by the authentication
proxy.

## Production Build

Validate the project before deployment:

```bash
pnpm lint
pnpm build
pnpm start
```

The application can be deployed to any platform that supports Next.js
server-side rendering. Vercel is one option, but Appwrite and the email
provider must still be configured separately. Add the same environment
variables from `.env.local` to the deployment platform’s server environment.
