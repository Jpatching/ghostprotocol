# Ghost Protocol - Technical Architecture

**Version:** 1.0  
**Date:** February 13, 2026  
**For:** Developers & Technical Reviewers

---

## 🏗️ System Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    USER'S COMPUTER                      │
│                                                         │
│  ┌──────────────────────────────────────────────────┐  │
│  │         Ghost Protocol Desktop App               │  │
│  │         (Tauri + React + Rust)                   │  │
│  └──────────────────────────────────────────────────┘  │
│           │                    │                        │
│           ▼                    ▼                        │
│  ┌─────────────────┐  ┌──────────────────────┐         │
│  │  Local Storage  │  │   Solana Wallet      │         │
│  │  (SQLite)       │  │   (Phantom/Backpack) │         │
│  │                 │  │                      │         │
│  │  • Tasks        │  │  • $GHOST tokens     │         │
│  │  • Subscriptions│  │  • Receipt NFTs      │         │
│  │  • API Keys     │  │  • Knowledge proofs  │         │
│  └─────────────────┘  └──────────────────────┘         │
└─────────────────────────────────────────────────────────┘
                    │
                    │ (Encrypted HTTPS only)
                    ▼
        ┌────────────────────────────┐
        │    External Services       │
        │                            │
        │  • Anthropic (Claude API)  │
        │  • Plaid (Bank connection) │
        │  • Bland.ai (Phone calls)  │
        │  • Solana RPC (Helius)     │
        └────────────────────────────┘
                    │
                    ▼
        ┌────────────────────────────┐
        │   Solana Blockchain        │
        │                            │
        │  • Receipt NFTs            │
        │  • Knowledge Graph         │
        │  • $GHOST Token            │
        │  • Reward Distribution     │
        └────────────────────────────┘
```

---

## 🛠️ Tech Stack

### Frontend: Tauri + React

**Why Tauri over Electron?**
- ✅ Written in Rust (faster, more secure)
- ✅ ~600KB binary vs Electron's ~50MB
- ✅ Lower memory usage (50-100MB vs 300-500MB)
- ✅ Native OS integration
- ✅ Rust backend = direct system access

**Frontend Stack:**
```typescript
- React 18+ (UI components)
- TailwindCSS (styling)
- Zustand (state management - lightweight)
- TanStack Query (async data fetching)
- Radix UI (accessible components)
- Framer Motion (animations)
```

### Backend: Rust (Tauri)

**Core Libraries:**
```toml
[dependencies]
tauri = "2.0"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
tokio = { version = "1.0", features = ["full"] }
rusqlite = { version = "0.30", features = ["bundled"] }
reqwest = { version = "0.11", features = ["json"] }
anchor-client = "0.30"
solana-sdk = "1.18"
solana-client = "1.18"
aes-gcm = "0.10"  # Encryption
argon2 = "0.5"     # Key derivation
```

**Why Rust?**
- Memory safety (no buffer overflows)
- Async runtime (Tokio) for concurrent tasks
- Native Solana SDK support
- Fast compilation to native binary
- Excellent error handling

### Database: SQLite (Embedded)

**Why SQLite?**
- Zero-configuration
- Single file database (~5MB for typical user)
- ACID compliant
- Fast for local operations
- Easy backup (just copy file)
- No server process needed

### Blockchain: Solana (Anchor Framework)

**Why Solana?**
- Low transaction costs (~$0.00025 per tx)
- Fast finality (~400ms)
- Native Rust support (Anchor)
- High throughput for scaling
- Active developer ecosystem

---

## 📁 Project Structure

```
ghost-protocol/
├── src-tauri/                    # Rust backend
│   ├── src/
│   │   ├── main.rs              # App entry point
│   │   ├── lib.rs               # Library exports
│   │   ├── db/
│   │   │   ├── mod.rs           # Database module
│   │   │   ├── schema.rs        # SQLite schema
│   │   │   ├── models.rs        # Data structures
│   │   │   └── migrations.rs    # DB migrations
│   │   ├── services/
│   │   │   ├── mod.rs
│   │   │   ├── plaid.rs         # Plaid integration
│   │   │   ├── claude.rs        # Claude API
│   │   │   ├── solana.rs        # Solana transactions
│   │   │   ├── email.rs         # Email generation
│   │   │   └── knowledge.rs     # Knowledge graph sync
│   │   ├── crypto/
│   │   │   ├── mod.rs
│   │   │   ├── encryption.rs    # AES-256-GCM
│   │   │   └── wallet.rs        # Wallet integration
│   │   ├── commands/            # Tauri commands (API for frontend)
│   │   │   ├── mod.rs
│   │   │   ├── subscriptions.rs
│   │   │   ├── tasks.rs
│   │   │   ├── knowledge.rs
│   │   │   └── wallet.rs
│   │   └── utils/
│   │       ├── mod.rs
│   │       └── logger.rs
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── build.rs
├── src/                         # React frontend
│   ├── components/
│   │   ├── Dashboard/
│   │   │   ├── index.tsx
│   │   │   └── Dashboard.module.css
│   │   ├── SubscriptionList/
│   │   │   ├── index.tsx
│   │   │   ├── SubscriptionCard.tsx
│   │   │   └── styles.module.css
│   │   ├── TaskQueue/
│   │   │   ├── index.tsx
│   │   │   └── TaskItem.tsx
│   │   ├── KnowledgeGraph/
│   │   │   ├── index.tsx
│   │   │   └── GraphVisualization.tsx
│   │   ├── WalletConnect/
│   │   │   └── index.tsx
│   │   └── Layout/
│   │       ├── Header.tsx
│   │       ├── Sidebar.tsx
│   │       └── Footer.tsx
│   ├── hooks/
│   │   ├── useSubscriptions.ts
│   │   ├── useSolana.ts
│   │   ├── useTasks.ts
│   │   └── useKnowledge.ts
│   ├── store/
│   │   ├── appStore.ts          # Zustand global state
│   │   ├── walletStore.ts
│   │   └── subscriptionStore.ts
│   ├── api/
│   │   └── tauri.ts             # Tauri API wrapper
│   ├── types/
│   │   ├── subscription.ts
│   │   ├── task.ts
│   │   └── knowledge.ts
│   ├── utils/
│   │   ├── format.ts
│   │   └── constants.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── solana-program/              # Anchor smart contract
│   ├── programs/
│   │   └── ghost-protocol/
│   │       ├── src/
│   │       │   ├── lib.rs       # Main program
│   │       │   ├── instructions/
│   │       │   │   ├── mod.rs
│   │       │   │   ├── initialize.rs
│   │       │   │   ├── mint_receipt.rs
│   │       │   │   ├── contribute_knowledge.rs
│   │       │   │   └── verify_knowledge.rs
│   │       │   └── state/
│   │       │       ├── mod.rs
│   │       │       ├── config.rs
│   │       │       ├── receipt.rs
│   │       │       └── knowledge.rs
│   │       └── Cargo.toml
│   ├── tests/
│   │   └── ghost-protocol.ts
│   ├── migrations/
│   ├── Anchor.toml
│   └── package.json
├── .github/
│   └── workflows/
│       ├── rust.yml
│       ├── frontend.yml
│       └── solana.yml
├── docs/
│   └── [all documentation files]
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── vite.config.ts
└── README.md
```

---

## 🗄️ Database Schema (SQLite)

```sql
-- Subscriptions table
CREATE TABLE subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    amount REAL NOT NULL,  -- in dollars
    frequency TEXT NOT NULL CHECK(frequency IN ('monthly', 'yearly', 'quarterly')),
    merchant TEXT NOT NULL,
    merchant_category TEXT,  -- 'streaming', 'fitness', 'software', etc.
    first_detected DATE NOT NULL,
    last_charged DATE,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'cancelled', 'pending', 'paused')),
    cancellation_method TEXT,  -- 'email', 'phone', 'web', 'mail'
    cancellation_instructions TEXT,
    cancelled_at TIMESTAMP,
    saved_amount REAL,  -- calculated annual savings
    receipt_nft_mint TEXT,  -- Solana mint address
    plaid_transaction_id TEXT,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tasks table
CREATE TABLE tasks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN (
        'cancel_subscription',
        'call_support',
        'fight_bill',
        'insurance_appeal',
        'track_delivery',
        'custom'
    )),
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN (
        'pending',
        'in_progress',
        'waiting_user',
        'completed',
        'failed',
        'cancelled'
    )),
    priority INTEGER DEFAULT 3 CHECK(priority BETWEEN 1 AND 5),  -- 1=highest
    input_data TEXT,  -- JSON blob
    output_data TEXT,  -- JSON blob
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    receipt_nft_mint TEXT,
    related_subscription_id INTEGER,
    FOREIGN KEY (related_subscription_id) REFERENCES subscriptions(id)
);

-- Knowledge contributions table
CREATE TABLE knowledge (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company TEXT NOT NULL,
    task_type TEXT NOT NULL,
    method TEXT NOT NULL,  -- Detailed instructions
    success_rate REAL DEFAULT 0.0 CHECK(success_rate BETWEEN 0 AND 1),
    verified_count INTEGER DEFAULT 0,
    failed_count INTEGER DEFAULT 0,
    on_chain_address TEXT,  -- Solana account address
    on_chain_hash TEXT,  -- Transaction signature
    contributed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_verified_at TIMESTAMP,
    is_synced_to_chain BOOLEAN DEFAULT FALSE
);

-- API Keys table (encrypted at rest)
CREATE TABLE api_keys (
    service TEXT PRIMARY KEY CHECK(service IN (
        'anthropic',
        'plaid',
        'bland',
        'solana_rpc'
    )),
    encrypted_key BLOB NOT NULL,
    encryption_salt BLOB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    usage_count INTEGER DEFAULT 0
);

-- User preferences
CREATE TABLE preferences (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Wallet info
CREATE TABLE wallet (
    id INTEGER PRIMARY KEY CHECK(id = 1),  -- Only one row
    public_key TEXT NOT NULL,
    provider TEXT NOT NULL,  -- 'phantom', 'backpack', etc.
    connected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_synced_at TIMESTAMP,
    ghost_token_balance REAL DEFAULT 0.0,
    sol_balance REAL DEFAULT 0.0
);

-- Indexes for performance
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_merchant ON subscriptions(merchant);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_created ON tasks(created_at DESC);
CREATE INDEX idx_knowledge_company ON knowledge(company);
CREATE INDEX idx_knowledge_task_type ON knowledge(task_type);

-- Triggers for updated_at timestamps
CREATE TRIGGER update_subscription_timestamp 
AFTER UPDATE ON subscriptions
BEGIN
    UPDATE subscriptions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;
```

---

## 🔌 Data Flow Diagrams

### Flow 1: Subscription Detection

```
┌─────────────┐
│ User opens  │
│     app     │
└──────┬──────┘
       │
       ▼
┌──────────────────────┐
│ App: "Connect bank   │
│    via Plaid"        │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ User authorizes      │
│ (OAuth in browser)   │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Plaid returns token  │
│ → STORED LOCALLY     │
│ (encrypted)          │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Fetch last 90 days   │
│ transactions (local) │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Claude API analyzes: │
│ "Recurring charges:  │
│  - Netflix $15.99/mo │
│  - Spotify $10.99/mo"│
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Store in SQLite      │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│ Show dashboard:      │
│ "Found 3 subs =      │
│  $619.64/year"       │
└──────────────────────┘
```

### Flow 2: Cancel Subscription

```
User clicks "Cancel Netflix"
           │
           ▼
Check on-chain knowledge graph
           │
           ▼
On-chain: "Email works 94%"
           │
           ▼
Claude generates cancellation email
           │
           ▼
User reviews → "Send"
           │
           ▼
Email sent via Gmail API
           │
           ▼
Mint Receipt NFT on Solana
           │
           ▼
Earn 5 $GHOST tokens
           │
           ▼
Reminder in 7 days: "Did it work?"
           │
           ▼
User confirms → Knowledge graph updated
           │
           ▼
Original contributor earns bonus tokens
```

---

## 🔐 Security Architecture

### Encryption at Rest

**API Keys:**
```rust
// AES-256-GCM encryption
// Key derived from user's machine ID + random salt
// Stored in SQLite as BLOB

use aes_gcm::{Aes256Gcm, Key, Nonce};
use argon2::{Argon2, PasswordHasher};

fn encrypt_api_key(key: &str, machine_id: &str) -> Vec<u8> {
    // Derive encryption key from machine ID
    let salt = generate_random_salt();
    let derived_key = Argon2::default()
        .hash_password(machine_id.as_bytes(), &salt)
        .unwrap();
    
    // Encrypt
    let cipher = Aes256Gcm::new(Key::from_slice(&derived_key));
    cipher.encrypt(&nonce, key.as_bytes())
}
```

### Communication Security

**All external API calls:**
- HTTPS only (TLS 1.3)
- Certificate pinning for critical services
- Request signing for Solana transactions
- Rate limiting to prevent abuse

---

## 🚀 Performance Targets

| Metric | Target | Rationale |
|--------|--------|-----------|
| **App startup** | < 2 seconds | Native Rust binary |
| **Transaction scan** | < 5 seconds | Async processing |
| **Solana tx confirm** | < 1 second | Fast finality |
| **Memory usage** | < 150MB | Lean binary |
| **Disk usage** | < 50MB | Minimal footprint |
| **API latency** | < 2 seconds | Cached responses |

---

## 📦 Build & Deployment

### Development Build

```bash
# Install dependencies
npm install
cd src-tauri && cargo build

# Run dev server
npm run tauri dev

# Build Solana program
cd solana-program
anchor build
anchor deploy --provider.cluster devnet
```

### Production Build

```bash
# Build optimized binary
npm run tauri build

# Outputs:
# - MacOS: src-tauri/target/release/bundle/macos/Ghost Protocol.app
# - Windows: src-tauri/target/release/bundle/msi/Ghost Protocol_1.0.0_x64.msi
# - Linux: src-tauri/target/release/bundle/appimage/ghost-protocol_1.0.0_amd64.AppImage
```

---

## 🧪 Testing Strategy

### Unit Tests (Rust)
```bash
cd src-tauri
cargo test
```

### Integration Tests (Anchor)
```bash
cd solana-program
anchor test
```

### E2E Tests (Playwright)
```bash
npm run test:e2e
```

---

**Next:** See `03-SOLANA-SMART-CONTRACT.md` for on-chain program details
