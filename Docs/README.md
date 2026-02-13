# Ghost Protocol

**Your Local-First AI Agent That Fights Corporations on Your Behalf**

Built with Rust, React, and Solana for the [Colosseum Agent Hackathon](https://colosseum.com/agent-hackathon) - February 2026

## What It Does

Ghost Protocol is a desktop application that detects hidden subscriptions in your bank transactions, generates AI-powered cancellation emails, and mints proof-of-savings receipts on Solana. Your data never leaves your machine.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop | Tauri v2 (Rust) |
| Frontend | React + TypeScript + TailwindCSS v4 |
| Database | SQLite (local, WAL mode) |
| AI | Claude API (Anthropic) |
| Blockchain | Solana (Anchor framework) |
| Bank | Plaid API |

## Solana Integration

- **Receipt NFTs**: Every successful cancellation mints a proof-of-savings NFT on Solana
- **$GHOST Token**: Users earn tokens for completing tasks and contributing knowledge
- **Knowledge Graph**: On-chain storage of anonymized cancellation strategies that help future users

## Setup

### Prerequisites
- Node.js 18+
- Rust (via rustup)
- System dependencies for Tauri: `webkit2gtk`, `rsvg2` (Linux)

### Development
```bash
npm install
npm run tauri dev
```

### Build
```bash
npm run tauri build
```

## Project Structure
```
ghost-protocol/
├── src/                    # React frontend
│   ├── components/
│   │   ├── Dashboard/      # Main dashboard view
│   │   └── Layout/         # App header/layout
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css           # TailwindCSS v4
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── commands/       # Tauri IPC commands
│   │   ├── db/             # SQLite database module
│   │   ├── lib.rs          # App setup
│   │   └── main.rs         # Entry point
│   └── Cargo.toml
├── Docs/                   # Documentation
├── CLAUDE.md               # AI dev guide
└── package.json
```

## How It Works

1. **Connect Bank** - Link your bank account via Plaid (coming soon)
2. **Detect Subscriptions** - AI scans transactions for recurring charges
3. **Cancel** - AI generates personalized cancellation emails
4. **Prove It** - Mint a receipt NFT on Solana as proof of savings
5. **Earn** - Receive $GHOST tokens for each successful action
6. **Share** - Your anonymized strategy helps other users

## License

MIT
