# Ghost Protocol

## Local-First AI Agent That Kills Your Forgotten Subscriptions

---

## The Problem

**$165 billion** wasted annually on forgotten subscriptions in the US alone.

The existing "solutions" are broken:

| | DoNotPay | Rocket Money | Ghost Protocol |
|---|---|---|---|
| **Data** | Their cloud | Their cloud | **Your machine** |
| **Cost** | $36/yr | 60% of savings | **Free** |
| **Trust** | FTC fined $193K | Under scrutiny | **Open source** |
| **Proof** | None | None | **On-chain (Solana)** |

---

## How It Works

```
1. SCAN    → AI analyzes bank transactions (7-step animated pipeline)
2. DETECT  → Pattern recognition identifies recurring charges
3. CANCEL  → AI generates merchant-specific cancellation emails
4. SIGN    → Solana memo transaction = immutable proof of cancellation
5. SAVE    → Real-time savings tracker shows monthly & annual impact
```

**Your data never leaves your machine.**

---

## Architecture

- **Tauri v2 (Rust)** — 14.8MB native binary, not 200MB Electron
- **SQLite WAL** — all data stored locally, zero cloud dependency
- **React 19 + TailwindCSS v4** — modern UI with dark theme
- **Solana @solana/web3.js** — devnet wallet, memo transactions, on-chain proofs
- **11 IPC commands** across 3 Rust modules

---

## Solana Integration

Every cancellation can be signed as a **Solana memo transaction**:

```json
{
  "action": "cancel_subscription",
  "subscription": "Netflix Premium",
  "amount": 22.99,
  "merchant": "Netflix Inc.",
  "timestamp": "2026-02-13T12:00:00Z",
  "agent": "ghost-protocol"
}
```

Immutable, verifiable proof on [Solana Explorer](https://explorer.solana.com/?cluster=devnet).

---

## Demo Highlights

- **12 subscription types** randomized per install (unique demos every time)
- **Spending Insights panel** — monthly burn, top cost, vs US average ($91/mo)
- **Live stats header** — auto-refreshes every 5 seconds
- **Airdrop feedback** — inline success/error messages
- **Activity timeline** — every agent action logged with timestamps

---

## What Makes This Different

1. **Local-first** — no server to hack, no database to breach
2. **On-chain receipts** — Solana memo txs as immutable proof
3. **AI-generated emails** — merchant-specific, FTC-compliant
4. **Native desktop** — Rust backend, not a web wrapper
5. **Privacy by architecture** — not just a policy, a technical guarantee

---

## Future Vision

- Insurance claim appeals & medical bill negotiation
- $GHOST SPL token rewards for cancellations
- On-chain knowledge graph (anonymized strategies as PDAs)
- Multi-chain support + DAO governance
- Mobile companion via Tauri mobile targets

---

## Built For

**Colosseum Agent Hackathon** | February 2026

**Stack:** Tauri v2 + React 19 + TypeScript + TailwindCSS v4 + SQLite + Solana

**Repo:** [github.com/Jpatching/ghostprotocol](https://github.com/Jpatching/ghostprotocol)

**100% AI-generated code** — built by Claude agents with human direction.
