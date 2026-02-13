# Ghost Protocol - Development Guide

## Build Commands
- `npm run tauri dev` - Start development (frontend + Rust backend)
- `npm run tauri build` - Production build
- `npm run dev` - Frontend only (Vite dev server)
- `npm run build` - Frontend build only

## Architecture
- **Frontend**: React + TypeScript + TailwindCSS v4 (Vite plugin)
- **Backend**: Tauri v2 (Rust)
- **Database**: SQLite via rusqlite (WAL mode)
- **State**: Zustand (frontend), Tauri State (backend)
- **Blockchain**: Solana (@solana/web3.js, @coral-xyz/anchor)

## Key Patterns
- Tauri commands live in `src-tauri/src/commands/`
- Database module in `src-tauri/src/db/` (models, schema, connection)
- Frontend components in `src/components/`
- Invoke Tauri commands with `invoke()` from `@tauri-apps/api/core`
- Database uses `Mutex<Connection>` managed as Tauri state

## Database Location
- Dev: `~/.local/share/com.ghostprotocol.app/ghost_protocol.db`

## Conventions
- TailwindCSS v4: use `@import "tailwindcss"` in CSS, no config file
- Custom theme tokens prefixed with `ghost-` (e.g., `bg-ghost-dark`)
- Tauri v2 imports from `@tauri-apps/api/core`
