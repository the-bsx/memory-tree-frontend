# MemoryTree — Frontend

The frontend for **MemoryTree**, a personal life-memory app for organizing life into chapters (Events), the moments within them (Memories), and the photos that capture those moments (Media).

This is a single-user app: you create an account, build up your own chapters and memories, and explore them later through an interactive, winding "memory trail" — inspired by level-select screens in mobile games — instead of a plain list.

Built with **React + Vite**, talking to a separate Node.js/Express + PostgreSQL backend over a REST API.

---

## ✨ Features

- **Auth** — registration with optional avatar upload, email verification, login/logout, automatic silent session refresh using an httpOnly cookie
- **Events (chapters)** — full CRUD, cover image upload, category tagging (Travel, Relationship, Career, Health, Goals, Other), ongoing/private flags
- **Memories** — full CRUD within an event, mood tagging with a 1–10 mood score, location, and free-text notes
- **Media** — multi-photo upload per memory, inline caption editing, full-screen lightbox viewer with keyboard navigation
- **Memory Trail** — a winding, Candy-Crush-inspired path connecting memories within a chapter, with:
  - Real chronological spacing (time gaps between memories affect spacing on the path)
  - Organic, animated "rope" connecting each node, drawn in progressively as you scroll
  - A lightweight popover preview on click, linking through to a full memory page
- **Story Mode** — a linear, readable feed of a chapter's memories, for reading start to finish without clicking through the trail
- **Full memory page** — dedicated page per memory with prev/next navigation between memories in the same chapter
- Warm, scrapbook-inspired visual design (custom earthy palette, handwritten accent font, subtle photo rotation, paper-grain texture)

---

## 🧱 Tech Stack

- **React 19** + **Vite**
- **React Router** for client-side routing
- **Axios** for API calls, with interceptors for auth token attachment and silent refresh
- **TailwindCSS** (custom palette: `bark`, `parchment`, `sage`, `clay`, `ink`, `mist`)
- Backend (separate repo): Node.js, Express, PostgreSQL, Cloudinary for media storage

---

## 📁 Project Structure

```
src/
├── api/                  # Axios calls, one file per backend resource
│   ├── axiosInstance.js  # Base axios config + auth interceptors
│   ├── authApi.js
│   ├── eventsApi.js
│   ├── memoriesApi.js
│   └── mediaApi.js
├── components/
│   ├── layout/            # AppShell, AuthLayout, ProtectedRoute
│   ├── events/             # EventCard, EventForm
│   └── memories/           # MemoryPath, MemoryNode, popover, lightbox, story mode, etc.
├── context/
│   └── AuthContext.jsx    # Holds logged-in user + access token in memory
├── pages/
│   ├── auth/               # Login, Register, CheckEmail, VerifyEmail
│   ├── events/             # EventsList, CreateEvent, EditEvent, EventDetail
│   ├── memories/           # MemoryDetailPage
│   └── Dashboard.jsx
├── utils/
│   ├── constants.js       # Category/mood enums + visual styles
│   ├── pathLayout.js      # Memory trail node positioning math
│   └── easing.js
├── config.js               # API base URL, read from env vars
└── App.jsx                 # Route definitions
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- The MemoryTree backend running and reachable (locally or deployed)

### Setup

```bash
npm install
cp .env.example .env.local   # then edit .env.local with your backend URL
npm run dev
```

The app runs at `http://localhost:5173` by default.

### Environment Variables

| Variable | Description | Example |
|---|---|---|
| `VITE_API_BASE_URL` | Base URL of the backend API (without `/api/v1`) | `http://localhost:3000` |

If unset, it falls back to `http://localhost:3000` for local development.

---

## 🔐 Authentication Model

- **Access token** — returned in the login response body, kept in memory (`window.__accessToken`), attached to every request via an Axios interceptor. Never persisted to localStorage.
- **Refresh token** — set as an `httpOnly` cookie by the backend; the frontend never reads it directly. On app load, and whenever a request returns `401`, the app silently calls the refresh endpoint to get a new access token. If that fails, the user is signed out and redirected to `/login` via React Router (no hard page reloads).

This means the backend's CORS config must allow the frontend's origin **with credentials**, and in production, the refresh cookie must be set with `SameSite=None; Secure` if the frontend and backend are on different domains.

---

## 🏗️ Build

```bash
npm run build      # outputs to dist/
npm run preview     # preview the production build locally
```

---

## ☁️ Deploying to Vercel

1. Push this repo to GitHub and import it into Vercel.
2. Vercel auto-detects the Vite framework preset (build command `npm run build`, output directory `dist`) — no changes needed there.
3. In the Vercel project's **Settings → Environment Variables**, add:
   - `VITE_API_BASE_URL` = your deployed backend's URL (e.g. `https://memorytree-api.up.railway.app`)
4. `vercel.json` is already included with a rewrite rule so client-side routes (e.g. `/events/abc123`) don't 404 on a hard refresh or direct link.
5. Make sure your **backend**:
   - Has CORS `origin` set to your Vercel domain (not `localhost`), with `credentials: true`
   - Sets the refresh-token cookie with `SameSite=None; Secure` if frontend and backend are on different domains
   - Is served over HTTPS (required for `Secure` cookies to work)

---

## 📌 Known Notes / Quirks

- One backend route (`GET /memories/:memoryId/meida`) currently has a typo in its path (`meida` instead of `media`). The frontend matches this exactly in `mediaApi.js` so things work today — update both sides together if/when the typo is fixed.
- Memory deletion is a **soft delete**; the memory's media rows are not currently cleaned up automatically. Media deletion itself is a **hard delete**, removing the file from Cloudinary as well.

---

## 🗺️ Roadmap

- [ ] Profile management (update name/avatar/email, change password)
- [ ] Search/filtering across events and memories
- [ ] Media reordering / setting a primary photo per memory
