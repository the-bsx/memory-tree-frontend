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


