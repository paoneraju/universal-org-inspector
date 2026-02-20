# Universal Org Inspector

A stateless, front-end-only Salesforce admin utility that connects to any org via OAuth 2.0 Authorization Code Flow with PKCE. No backend, no database, no token persistence beyond the session.

## Features

- **OAuth 2.0 PKCE** – Connect to production, sandbox, or custom My Domain
- **Object explorer** – List and search standard/custom objects with virtualized scrolling
- **Object describe** – View label, API name, type, and flags; browse **Fields**, **Relationships**, **ERD**, and **Raw JSON**
- **Fields tab** – Sortable, filterable table with copy API name and expandable metadata
- **Relationships tab** – Parent and child relationships; click a row to highlight the corresponding edge in the ERD
- **ERD tab** – Entity-relationship diagram with depth (1–5), standard/custom toggles, hierarchical/radial/force layout, export PNG/SVG/JSON, and node metadata drawer
- **Export** – ERD as PNG/SVG/JSON; object schema as JSON
- **Dark mode** – Toggle in the top bar

## Tech stack

- React, TypeScript, Vite
- React Router, TanStack Query, Axios
- React Flow, TailwindCSS
- No backend, no database, no `localStorage`

## Setup

1. **Create a Salesforce Connected App**
   - Setup → App Manager → New Connected App
   - Enable OAuth, set Callback URL: `http://localhost:5173/auth/callback`
   - Enable PKCE; do **not** use a client secret
   - Copy the Consumer Key (Client ID)

2. **Enable CORS for OAuth in Salesforce (required for browser sign-in)**
   - Setup → search for **CORS**
   - Open **CORS Allowed Origins List** (or “Allowed Origins List”)
   - Add **New** and enter: `http://localhost:5173`
   - In **CORS Policy Settings**, enable **Enable CORS for OAuth endpoints**
   - Save (exact names may vary by org; see Salesforce Help for “CORS” and “OAuth” if needed)

3. **Configure the app**
   - Copy `.env.example` to `.env`
   - Set `VITE_SF_CLIENT_ID` to your Consumer Key

4. **Install and run**
   ```bash
   npm install
   npm run dev
   ```
   Open http://localhost:5173, choose login (Production, Sandbox, or Custom My Domain), and sign in.

## Scripts

- `npm run dev` – Start dev server (port 5173)
- `npm run build` – Production build
- `npm run preview` – Preview production build

## Project structure

- `src/auth/` – PKCE, token manager, OAuth service
- `src/api/` – Salesforce REST client (token injection, refresh)
- `src/features/` – objects, fields, relationships, ERD (worker, canvas, controls)
- `src/components/` – TopBar, Sidebar, Button, Card, Tabs, Toast, etc.
- `src/hooks/` – useAuth, useApiVersion, useSObjects, useSObjectDescribe, useErdGraph
- `src/pages/` – Login, Auth callback, App layout, Object view
- `src/contexts/` – Auth, Theme, Toast
- `src/types/` – Auth, Salesforce, ERD types
- `src/utils/` – debounce, copyToClipboard, describeTransform, ERD layout, worker client
