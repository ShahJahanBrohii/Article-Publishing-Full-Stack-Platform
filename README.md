# Come Read with Junaid

Full-stack publishing platform with a public reader experience and a protected admin CMS.

The project is built with React (Vite) on the client and Express + MongoDB on the server.

## Overview

This repository includes:

- Public website: homepage, sections, article detail, search, legal pages, about/contact/subscribe.
- Admin panel: login, dashboard, article management, home content management, subscribers/messages, site settings.
- Settings-driven content system: navbar/footer/legal/about/home newsletter content can be updated from admin.

## Current Feature Set

### Public (User) Features

- Responsive public layout (navbar, footer, content pages, article detail, search).
- Homepage with configurable hero/sidebar/opinion/most-read blocks.
- Hybrid home feeds: admin-pinned entries with automatic published-article fallback where applicable.
- Article detail page with:
  - reading progress bar
  - generated table of contents from H2/H3 content
  - share actions (X, LinkedIn, Facebook, Email, copy link)
  - local bookmark/save list
  - related article cards
- Search page with query/tag/section/sort/pagination support.
- Tag-click routing from article and search cards into filtered search results.
- Legal pages and footer labels/content loaded from site settings.

### Admin Features

- JWT-based admin authentication.
- Dashboard and article CRUD.
- Publish/unpublish workflow.
- Rich article editor (TipTap) with inline formatting and image insertion.
- Featured image upload for articles.
- Home content editor (hero/sidebar/opinion/most-read sections).
- Site settings editor:
  - branding/footer/newsletter/contact/social/legal
  - About page structured fields
  - generated About HTML fallback content
- Subscriber and message management.

## Tech Stack

- Frontend: React 18, React Router 6, Vite, CSS.
- Editor: TipTap.
- Backend: Node.js, Express.
- Database: MongoDB + Mongoose.
- Auth/Security: JWT, bcryptjs, route guards.
- File upload: multer.

## Project Structure

```text
.
|- client/          # Vite React app (public site + admin UI)
|- server/          # Express API + MongoDB models/routes
|- package.json     # root scripts for running client + server together
```

## Environment Variables

Create a `.env` file in `server/` with at least:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173

ADMIN_EMAIL=admin@wallstreetinvestor.com
ADMIN_PASSWORD=your_strong_password
```

Create a `.env` file in `client/` if needed:

```env
VITE_API_URL=http://localhost:5000
```

### Render + Vercel Deployment Notes

For a deployed setup (backend on Render, frontend on Vercel):

- Set frontend env on Vercel:

```env
VITE_API_URL=https://your-render-service.onrender.com
```

- Set backend env on Render:

```env
CLIENT_URL=https://your-vercel-domain.vercel.app
CLIENT_URLS=https://your-vercel-domain.vercel.app,https://your-custom-domain.com
```

Use `CLIENT_URLS` when you need multiple allowed origins (for example, Vercel preview + production custom domain).

## Getting Started

### 1) Install dependencies

At repo root:

```bash
npm install
```

Then install app dependencies:

```bash
npm install --prefix client
npm install --prefix server
```

### 2) Run development servers

From repo root:

```bash
npm run dev
```

This starts:

- client on `http://localhost:5173`
- server on `http://localhost:5000`

### 3) Build production client

```bash
npm run build
```

### 4) Run server in production mode

```bash
npm run start
```

## Scripts

Root:

- `npm run dev` - run client + server concurrently
- `npm run build` - build client
- `npm run start` - start server
- `npm run client` - run only client dev server
- `npm run server` - run only server dev server

Client:

- `npm run dev`
- `npm run build`
- `npm run preview`

Server:

- `npm run dev`
- `npm run start`

## API Summary

Main route groups:

- `/api/auth` - admin auth endpoints
- `/api/articles` - protected admin article write routes
- `/api/general` - public article listing/read endpoints
- `/api/settings` - public read + protected update of global settings
- `/api/home` - home content CMS data
- `/api/upload` - image upload endpoints
- `/api/subscribers` - subscriber admin routes
- `/api/messages` - message admin routes
- `/api/subscribe` and `/api/contact` - public form submissions

## Notes and Current Limitations

- Comments API is currently placeholder/non-persistent.
- Default admin seed fallback password exists in code if `ADMIN_PASSWORD` is not set.
- Public forms do not yet include rate limiting.
- SSR is not implemented; SEO/social meta tags are client-rendered.

## Recommended Next Improvements

- Persist comments with a proper model and moderation flow.
- Add server-side request validation and rate limiting.
- Enforce strict startup env validation (`JWT_SECRET`, `CLIENT_URL`, etc).
- Add automated tests for auth, filtering, settings save flow, and upload edge cases.

## License

MIT