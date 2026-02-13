# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build Commands
- `npm run tauri dev` - Start development (frontend + Rust backend)
- `npm run tauri build` - Production build (generates .deb, .rpm, .AppImage)
- `npm run dev` - Frontend only (Vite dev server on :1420)
- `npm run build` - Frontend build only (tsc + vite build)

## Architecture

**Stack**: Tauri v2 (Rust backend) + React 19 + TypeScript + TailwindCSS v4 + Solana

### Backend (src-tauri/src/)
- `lib.rs` — App setup, DB init, seeds demo data, registers all commands
- `db/mod.rs` — `Database` struct with `Mutex<Connection>`, WAL mode SQLite
- `db/schema.rs` — CREATE TABLE migrations + `seed_demo_data()`
- `db/models.rs` — Serde structs: `Subscription`, `CancelResult`
- `commands/subscriptions.rs` — CRUD for subscriptions, cancel flow, savings summary
- `commands/scan.rs` — AI transaction scanning simulation, stats aggregation
- `commands/settings.rs` — API key management, activity log builder

### Frontend (src/)
- `components/Dashboard/` — Main view: subscription list, SolanaWallet, CancelModal, ScanOverlay
- `components/Layout/Header.tsx` — App header with live stats from `get_stats` command
- `components/Activity/` — Agent activity log (built from subscription events)
- `components/Settings/` — API key management (Claude, Plaid, Solana RPC)
- `App.tsx` — Tab navigation (Dashboard | Activity | Settings)

### Key Patterns
- Tauri IPC: `invoke()` from `@tauri-apps/api/core`
- Database: `Mutex<Connection>` as Tauri managed state, accessed via `State<'_, Database>`
- Solana: Keypair stored in localStorage, memo transactions for on-chain proof
- Buffer polyfill required in `main.tsx`: `import { Buffer } from "buffer"; window.Buffer = Buffer;`
- Vite config needs `define: { "process.env": {} }` for Solana deps

## Database
- Location: `~/.local/share/com.ghostprotocol.desktop/ghost_protocol.db`
- Tables: `subscriptions`, `tasks`, `api_keys`
- Bundle identifier: `com.ghostprotocol.desktop` (not `.app` — macOS conflict)

## Conventions
- TailwindCSS v4: `@import "tailwindcss"` in CSS, `@theme` block for custom tokens
- Custom theme tokens prefixed with `ghost-` (e.g., `bg-ghost-dark`, `text-ghost-muted`)
- Tauri v2 imports from `@tauri-apps/api/core` (not v1 paths)
- Rust commands return `Result<T, String>` for Tauri IPC compatibility
