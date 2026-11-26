# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Layout

This is a full-stack social media app with two independent npm projects and no root `package.json`. Run each command from inside its folder.

- `client/`: React 19 + TypeScript + Vite + Tailwind CSS 4 single-page app, deployed on Vercel (`vercel.json` rewrites every path to `index.html`)
- `server/`: Express 5 + TypeScript API, Prisma 7 on Neon Postgres, Cloudinary for images, Nodemailer for email

## Commands

**Client** (`cd client`)
- `npm run dev`: start the Vite dev server
- `npm run build`: runs `tsc -b`, then `vite build`, so type errors fail the build
- `npm run lint`: ESLint
- `npm test` (watch mode) or `npm run test:run` (single run): Vitest + React Testing Library in jsdom
- Run one file or test: `npx vitest run src/__tests__/Post.test.tsx -t "rolls the like back"`

**Server** (`cd server`)
- `npm run dev`: nodemon + tsx on `server.ts` (port `PORT`, default 5000)
- `npm start`: tsx with no file watching
- `npm install` also runs `prisma generate` (postinstall). The client is generated into `server/generated/prisma/`, not `node_modules`.
- After changing `prisma/schema.prisma`: `npx prisma migrate dev --name <name>`, then `npx prisma generate`
- `server/rest.http` has hand-written requests for testing the API manually

Only the client has tests, in `client/src/__tests__/`; the server has none.
- Tests mock `config/api` with `vi.mock`, so they never reach a real server.
- `src/test/utils.tsx` provides:
  - `renderWithProviders`, which wraps a component in a router, a fake `AuthContext` value and the real `PostProvider`
  - the `makePost` and `makeAuth` factories
  - `deferred()`, for checking the UI while a request is still in flight, such as optimistic updates and disabled buttons

## Environment variables

- Server (`.env`, loaded by `dotenv/config` in `config/prisma.ts` and `prisma.config.ts`): `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL` (the CORS origin), `PORT`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` (sender address; falls back to `SMTP_USER`)
- Client: `VITE_API_URL` (defaults to `http://localhost:5000/api`)

## Architecture

### Server
- `server.ts` mounts three routers: `/api/auth`, `/api/posts`, `/api/users`. Handlers live in `contollers/`. The folder name is misspelled on purpose, so keep it consistent in imports.
- The server is ESM with `module: nodenext`. Relative imports must use the `.js` extension, even when they point at `.ts` files.
- Auth: `middleware/auth.ts` verifies the `Authorization: Bearer <jwt>` header and sets `req.user = { id }` (the type is extended in `types/express/index.d.ts`). Every route except those under `/api/auth` uses this middleware.
- Images:
  - Post images arrive as base64 data URIs in the JSON body, which is why the JSON body limit is 10mb. Note that `createPost` reads the image from a field named `avatar`.
  - The controllers upload images to Cloudinary (folder `socialTwo`) and call `cloudinary.uploader.destroy(publicId)` when an image is replaced or deleted.
  - Registration is the one multipart route: Multer's `upload.single("avatar")` reads the file into memory.
  - `routes/uploadRoutes.ts` exists but is not mounted anywhere.
- Data model (`prisma/schema.prisma`):
  - `User` has an optional `Avatar` and `Post` has an optional `PostImage`. Both store `{ publicId, url }` from Cloudinary.
  - `Like` and `Follow` are join tables with composite unique constraints, and likes and follows are toggled on and off.
  - Every relation deletes in cascade.
  - Password reset stores `resetPasswordToken` and `resetPasswordExpiry` on `User`.

### Client
- `config/api.ts` is the shared Axios instance. It reads the JWT from `localStorage.token` and attaches it to each request. Any 401 response clears the token and does a hard redirect to `/login`.
- State lives in React Context, with no external store. `context/` has a `*Context.ts` and `*Provider.tsx` pair for each of Auth, User and Post, and `hooks/useAuth|useUser|usePosts.ts` wrap them. `AuthProvider` keeps `token` and `user` in `localStorage`. Providers are composed in `providers/AppProvider.tsx`. `main.tsx` also wraps the app in a second `AuthProvider`, so there are two.
- Routing is in `App.tsx`. `/` (the feed) and `/profile/:id` sit behind `ProtectedRoute` inside `AppLayout`. `/login`, `/forgot-password` and `/reset-password` are public.
- Most create, edit and delete actions run through modal components in `components/`.
- Shared types are in `types/`. Each project has its own `getErrorMessage` helper, in `client/src/helper/` and `server/utils/`.
