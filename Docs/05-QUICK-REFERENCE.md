# GHOST PROTOCOL - QUICK REFERENCE GUIDE

## Essential Links

- **GitHub:** (to be created)
- **Solana Explorer (Devnet):** https://explorer.solana.com/?cluster=devnet
- **Anchor Docs:** https://www.anchor-lang.com/docs
- **Tauri Docs:** https://tauri.app/
- **Plaid Docs:** https://plaid.com/docs/
- **Claude API:** https://docs.anthropic.com/

---

## Required API Keys

### 1. Plaid (Bank Connection)
**Sign up:** https://dashboard.plaid.com/signup
**Free Tier:** Sandbox mode (unlimited)
**Get Keys:**
- Client ID: `Dashboard → Team Settings → Keys`
- Secret: Same location
- Environment: Use "sandbox" for development

**Add to .env:**
```bash
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox
```

---

### 2. Anthropic Claude (AI)
**Sign up:** https://console.anthropic.com/
**Free Tier:** $5 credit (enough for development)
**Get Key:** `Settings → API Keys → Create Key`

**Add to .env:**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-...
```

**Models to use:**
- Development: `claude-3-5-haiku-20241022` (cheap, fast)
- Production: `claude-3-5-sonnet-20241022` (better quality)

---

### 3. Solana RPC
**Options:**
1. **Public devnet RPC:** `https://api.devnet.solana.com` (free, rate limited)
2. **QuickNode:** https://www.quicknode.com/ (free tier available)
3. **Helius:** https://www.helius.dev/ (free tier available)

**Add to .env:**
```bash
SOLANA_RPC_URL=https://api.devnet.solana.com
```

---

## Common Commands

### Tauri (Desktop App)

```bash
# Development (hot reload)
npm run tauri dev

# Build for production
npm run tauri build

# Build for specific platform
npm run tauri build -- --target x86_64-pc-windows-msvc  # Windows
npm run tauri build -- --target x86_64-apple-darwin      # macOS Intel
npm run tauri build -- --target aarch64-apple-darwin     # macOS M1/M2
```

---

### Anchor (Solana Program)

```bash
# Build program
anchor build

# Deploy to devnet
anchor deploy --provider.cluster devnet

# Run tests
anchor test

# Get program ID
solana address -k target/deploy/ghost_protocol-keypair.json
```

---

### Solana CLI

```bash
# Check balance
solana balance --url devnet

# Airdrop SOL (devnet only, max 5 SOL)
solana airdrop 2 --url devnet

# Create new wallet
solana-keygen new --outfile ~/.config/solana/devnet.json

# Set devnet as default
solana config set --url devnet
```

---

### SPL Token (for $GHOST)

```bash
# Create new token
spl-token create-token --decimals 6 --url devnet

# Create token account
spl-token create-account <TOKEN_MINT_ADDRESS> --url devnet

# Mint tokens (for testing)
spl-token mint <TOKEN_MINT_ADDRESS> 1000000 --url devnet

# Check balance
spl-token balance <TOKEN_MINT_ADDRESS> --url devnet
```

---

## Project Structure

```
ghost-protocol/
├── src/                    # React frontend
│   ├── components/
│   ├── hooks/
│   ├── store/
│   └── App.tsx
├── src-tauri/             # Rust backend
│   ├── src/
│   │   ├── main.rs
│   │   ├── db/
│   │   ├── services/
│   │   ├── crypto/
│   │   └── commands/
│   └── Cargo.toml
├── solana-program/        # Anchor smart contract
│   ├── programs/
│   │   └── ghost-protocol/
│   └── Anchor.toml
├── .env                   # API keys (NEVER COMMIT)
├── package.json
└── README.md
```

---

## Critical Files

### .env (Create this, add to .gitignore)
```bash
# Plaid
PLAID_CLIENT_ID=
PLAID_SECRET=
PLAID_ENV=sandbox

# Claude
ANTHROPIC_API_KEY=

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
GHOST_PROGRAM_ID=  # After deploying

# Development
RUST_LOG=info
```

### .gitignore (Add these)
```
.env
*.db
*.db-*
target/
dist/
node_modules/
.DS_Store
```

---

## Tauri Commands (Frontend → Backend)

```typescript
// Frontend calls Rust backend like this:

import { invoke } from '@tauri-apps/api/tauri';

// Get subscriptions
const subs = await invoke('get_subscriptions');

// Connect bank
await invoke('connect_plaid', { userId: '123' });

// Mint receipt
const signature = await invoke('mint_receipt', {
  taskType: 'CancelSubscription',
  amountSaved: 19188,
  metadataUri: 'https://...'
});
```

### Rust Implementation

```rust
// src-tauri/src/commands/subscriptions.rs

#[tauri::command]
pub async fn get_subscriptions(
    db: State<'_, Database>
) -> Result<Vec<Subscription>, String> {
    // Implementation
}

#[tauri::command]
pub async fn mint_receipt(
    task_type: String,
    amount_saved: u64,
    metadata_uri: String,
) -> Result<String, String> {
    // Implementation
}
```

---

## Database Queries (SQLite)

```rust
// Insert subscription
db.execute(
    "INSERT INTO subscriptions (name, amount, frequency, merchant, first_detected) 
     VALUES (?1, ?2, ?3, ?4, ?5)",
    params![name, amount, frequency, merchant, now()]
)?;

// Get all active subscriptions
let subs = db.prepare(
    "SELECT * FROM subscriptions WHERE status = 'active' ORDER BY amount DESC"
)?;

// Update subscription status
db.execute(
    "UPDATE subscriptions SET status = 'cancelled', cancelled_at = ?1 WHERE id = ?2",
    params![now(), id]
)?;
```

---

## Solana Program Calls (from Rust)

```rust
use anchor_client::*;
use solana_sdk::{signature::Keypair, signer::Signer};

// Connect to program
let client = Client::new_with_options(
    Cluster::Devnet,
    Rc::new(wallet),
    CommitmentConfig::confirmed(),
);

let program = client.program(program_id)?;

// Call mint_receipt
let signature = program
    .request()
    .accounts(ghost_protocol::accounts::MintReceipt {
        receipt: receipt_pda,
        user: wallet.pubkey(),
        config: config_pda,
        ghost_token_mint: token_mint,
        user_token_account: user_ata,
        token_program: token::ID,
        system_program: system_program::ID,
    })
    .args(ghost_protocol::instruction::MintReceipt {
        task_type: TaskType::CancelSubscription,
        amount_saved: 19188,
        metadata_uri: "https://...".to_string(),
    })
    .send()?;
```

---

## Wallet Connection (Frontend)

```typescript
import { Connection, PublicKey } from '@solana/web3.js';

// Connect to Phantom wallet
const getProvider = () => {
  if ('phantom' in window) {
    return window.phantom?.solana;
  }
  window.open('https://phantom.app/', '_blank');
};

const connectWallet = async () => {
  const provider = getProvider();
  const response = await provider.connect();
  return response.publicKey.toString();
};

// Sign transaction
const signTransaction = async (tx) => {
  const provider = getProvider();
  const signed = await provider.signTransaction(tx);
  return signed;
};
```

---

## Common Errors & Solutions

### "Access token is expired" (Plaid)
**Solution:** Plaid access tokens expire after 30 days in sandbox. Re-authenticate user.

### "Transaction simulation failed" (Solana)
**Solution:** 
1. Check you have enough SOL for rent
2. Verify PDA derivation is correct
3. Check account exists

### "Database is locked" (SQLite)
**Solution:** Only one write at a time. Use async/await properly.

### "Failed to build" (Rust)
**Solution:**
```bash
# Clean and rebuild
rm -rf target
cargo clean
cargo build
```

---

## Testing Checklist

### Unit Tests
- [ ] Database operations
- [ ] Encryption/decryption
- [ ] Subscription detection logic
- [ ] Email generation

### Integration Tests
- [ ] Plaid OAuth flow
- [ ] Claude API calls
- [ ] Solana program calls
- [ ] End-to-end user flow

### Manual Tests
- [ ] Fresh install works
- [ ] Bank connection successful
- [ ] Subscriptions detected correctly
- [ ] Email generates properly
- [ ] Receipt mints on Solana
- [ ] Tokens appear in wallet

---

## Performance Benchmarks

**Target Metrics:**
- App launch: <2 seconds
- Bank connection: <5 seconds
- Subscription detection: <10 seconds
- Email generation: <3 seconds
- Solana transaction: <5 seconds

**If slower, optimize:**
1. Add caching
2. Lazy load components
3. Use pagination
4. Optimize database queries

---

## Security Checklist

- [ ] API keys never committed to git
- [ ] All sensitive data encrypted at rest
- [ ] No user data sent to external servers (except APIs)
- [ ] Wallet private keys never stored
- [ ] All external API calls use HTTPS
- [ ] Input validation on all user inputs
- [ ] SQL injection prevention (use parameterized queries)

---

## Deployment Checklist

### Before Demo
- [ ] Build on clean machine
- [ ] Test on both Mac and Windows
- [ ] Solana program deployed to devnet
- [ ] $GHOST token created
- [ ] Demo data loaded
- [ ] All API keys working

### Demo Day
- [ ] Laptop fully charged
- [ ] Backup laptop ready
- [ ] Demo video recorded (backup)
- [ ] Presentation rehearsed
- [ ] GitHub repo public
- [ ] README with screenshots

---

## Emergency Contacts

### If You Get Stuck

1. **Documentation:** Read the docs (Tauri, Anchor, Plaid)
2. **Claude AI:** Ask me! I'm here to help
3. **Discord:**
   - Solana: https://discord.gg/solana
   - Anchor: https://discord.gg/anchor
   - Tauri: https://discord.com/invite/tauri
4. **Stack Overflow:** Tag questions appropriately

---

## Useful Code Snippets

### Format Large Numbers
```typescript
const formatCurrency = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100);
};
```

### Calculate Savings
```typescript
const calculateYearlySavings = (amount: number, frequency: string) => {
  if (frequency === 'monthly') return amount * 12;
  if (frequency === 'yearly') return amount;
  if (frequency === 'weekly') return amount * 52;
  return 0;
};
```

### Derive PDA
```rust
let (pda, bump) = Pubkey::find_program_address(
    &[b"receipt", user.key().as_ref(), &receipt_count.to_le_bytes()],
    &program_id
);
```

---

## Final Notes

**Remember:**
- Build the MVP first, polish later
- Test on real data early
- Commit often ("works on my machine" moments)
- Ask for help when stuck >1 hour
- Ship something, even if imperfect

**You've got this! 🚀**

---

*Created: Feb 13, 2026*
*Last Updated: Feb 13, 2026*
