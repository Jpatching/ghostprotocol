# Ghost Protocol - API Integration Guide

**Version:** 1.0  
**Updated:** February 13, 2026

---

## 🔑 Required API Keys

### 1. Anthropic Claude API
**Purpose:** AI-powered subscription detection and email generation

**Setup:**
1. Visit https://console.anthropic.com
2. Create account
3. Get API key from dashboard
4. **Cost:** ~$5-10 for MVP testing

**Usage in app:**
```rust
// Store encrypted in SQLite
let api_key = "sk-ant-api03-...";

// Make request
let response = anthropic::Client::new(api_key)
    .messages()
    .create(anthropic::MessagesRequest {
        model: "claude-sonnet-4-20250514",
        messages: vec![/* ... */],
        max_tokens: 1024,
    })
    .await?;
```

**Rate Limits:**
- Tier 1: 50 requests/min
- Cost: $3 per million input tokens, $15 per million output tokens

---

### 2. Plaid API
**Purpose:** Bank account connection and transaction fetching

**Setup:**
1. Visit https://dashboard.plaid.com/signup
2. Create account
3. Start in Sandbox mode (free)
4. Get client_id and secret
5. **Cost:** Free for development, $0.10-0.30 per user in production

**Usage in app:**
```rust
use plaid::PlaidClient;

let client = PlaidClient::new(client_id, secret, env);

// Create Link token
let link_token = client.link_token_create(LinkTokenRequest {
    user: User { client_user_id: "user_123" },
    products: vec!["transactions"],
    // ...
}).await?;

// Exchange public token for access token
let access_token = client.item_public_token_exchange(
    public_token
).await?;

// Get transactions
let transactions = client.transactions_get(
    access_token,
    start_date,
    end_date
).await?;
```

**Rate Limits:**
- Development: Unlimited
- Production: Fair use policy

---

### 3. Solana RPC (Helius recommended)
**Purpose:** Blockchain transactions and account fetching

**Setup:**
1. Visit https://helius.dev
2. Create free account
3. Create project
4. Get RPC URL: `https://mainnet.helius-rpc.com/?api-key=YOUR_KEY`
5. **Cost:** Free tier: 100,000 requests/day

**Usage in app:**
```rust
use solana_client::rpc_client::RpcClient;

let rpc_url = "https://mainnet.helius-rpc.com/?api-key=...";
let client = RpcClient::new(rpc_url);

// Get balance
let balance = client.get_balance(&pubkey)?;

// Send transaction
let signature = client.send_and_confirm_transaction(&transaction)?;
```

**Alternatives:**
- Alchemy: https://alchemy.com
- Quicknode: https://quicknode.com

---

### 4. (Optional) Bland.ai - AI Phone Calls
**Purpose:** Automated customer service calls

**Setup:**
1. Visit https://bland.ai
2. Create account
3. Get API key
4. **Cost:** ~$0.08 per minute

**Usage:**
```typescript
await fetch('https://api.bland.ai/v1/calls', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${api_key}`,
  },
  body: JSON.stringify({
    phone_number: '+1234567890',
    task: 'Cancel my gym membership',
    voice: 'maya',
  }),
});
```

**Note:** This is Phase 2 feature, not needed for MVP

---

## 📋 API Keys Storage (Security)

### Local Encryption

```rust
// src-tauri/src/crypto/encryption.rs

use aes_gcm::{Aes256Gcm, Key, Nonce};
use argon2::Argon2;

pub fn encrypt_api_key(api_key: &str) -> Result<Vec<u8>> {
    // Get machine-specific seed
    let machine_id = get_machine_id()?;
    
    // Derive encryption key
    let salt = generate_salt();
    let derived_key = Argon2::default()
        .hash_password(machine_id.as_bytes(), &salt)?;
    
    // Encrypt
    let cipher = Aes256Gcm::new(Key::from_slice(&derived_key));
    let nonce = Nonce::from_slice(b"unique nonce");
    
    Ok(cipher.encrypt(nonce, api_key.as_bytes()).unwrap())
}
```

### SQLite Storage

```sql
CREATE TABLE api_keys (
    service TEXT PRIMARY KEY,
    encrypted_key BLOB NOT NULL,
    encryption_salt BLOB NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert encrypted key
INSERT INTO api_keys (service, encrypted_key, encryption_salt)
VALUES ('anthropic', X'...', X'...');
```

---

## 🧪 Testing with Mock Data

### Anthropic Mock

```rust
// For testing without API calls
#[cfg(test)]
mod tests {
    fn mock_claude_response() -> String {
        r#"{
            "subscriptions": [
                {
                    "name": "Netflix",
                    "amount": 15.99,
                    "frequency": "monthly",
                    "merchant": "Netflix.com"
                }
            ]
        }"#.to_string()
    }
}
```

### Plaid Sandbox

```javascript
// Use Plaid sandbox credentials
const config = {
  user: { client_user_id: 'test_user' },
  client_name: 'Ghost Protocol',
  products: ['transactions'],
  country_codes: ['US'],
  language: 'en',
};

// Sandbox test credentials:
// Username: user_good
// Password: pass_good
```

---

## 💰 Cost Estimates (MVP Testing)

| Service | Free Tier | Expected Cost |
|---------|-----------|---------------|
| Anthropic | $5 credit | ~$3-5 |
| Plaid | Sandbox free | $0 |
| Helius | 100k req/day | $0 |
| Total | - | **$3-5** |

---

## 🔄 Environment Variables

```bash
# .env.example

# Anthropic
ANTHROPIC_API_KEY=sk-ant-api03-...

# Plaid
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
PLAID_ENV=sandbox  # sandbox | development | production

# Solana
SOLANA_RPC_URL=https://api.devnet.solana.com
HELIUS_API_KEY=your_helius_key

# App
DATABASE_PATH=./ghost-protocol.db
LOG_LEVEL=debug
```

---

## 📚 Further Reading

- Anthropic Docs: https://docs.anthropic.com
- Plaid Quickstart: https://plaid.com/docs/quickstart/
- Solana Web3.js: https://solana-labs.github.io/solana-web3.js/
- Helius Docs: https://docs.helius.dev
