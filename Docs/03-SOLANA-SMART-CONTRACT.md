# Ghost Protocol - Solana Smart Contract Specification

**Version:** 1.0  
**Framework:** Anchor 0.30+  
**Network:** Solana Devnet → Mainnet  
**Language:** Rust

---

## 📋 Contract Overview

The Ghost Protocol smart contract manages:
1. **Receipt NFTs** - Proof of completed tasks
2. **Knowledge Graph** - Shared cancellation strategies
3. **$GHOST Token** - Reward distribution
4. **Verification System** - Community validation

---

## 🏗️ Program Architecture

```
ghost_protocol (Program ID: GhostProtocoL11111111111111111111111111111)
│
├── Instructions
│   ├── initialize          # One-time setup
│   ├── mint_receipt        # Create task completion proof
│   ├── contribute_knowledge # Add cancellation strategy
│   └── verify_knowledge    # Confirm strategy works
│
├── State Accounts
│   ├── Config              # Global program configuration
│   ├── Receipt             # Individual task proof
│   └── Knowledge           # Shared strategy data
│
└── Token
    └── $GHOST              # SPL Token (reward currency)
```

---

## 💻 Full Smart Contract Code

```rust
// File: solana-program/programs/ghost-protocol/src/lib.rs

use anchor_lang::prelude::*;
use anchor_spl::token::{self, Token, TokenAccount, Mint, MintTo};

declare_id!("GhostProtocoL11111111111111111111111111111");

#[program]
pub mod ghost_protocol {
    use super::*;

    /// Initialize the Ghost Protocol program (run once)
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        let config = &mut ctx.accounts.config;
        config.authority = ctx.accounts.authority.key();
        config.total_receipts = 0;
        config.total_knowledge = 0;
        config.total_users = 0;
        config.ghost_token_mint = ctx.accounts.ghost_token_mint.key();
        config.paused = false;
        
        msg!("Ghost Protocol initialized!");
        Ok(())
    }

    /// Mint a receipt NFT when user completes a task
    pub fn mint_receipt(
        ctx: Context<MintReceipt>,
        task_type: String,
        company: String,
        amount_saved: u64,  // in cents
        metadata_uri: String,
    ) -> Result<()> {
        require!(!ctx.accounts.config.paused, ErrorCode::ProgramPaused);
        require!(task_type.len() <= 50, ErrorCode::TaskTypeTooLong);
        require!(company.len() <= 100, ErrorCode::CompanyNameTooLong);
        require!(metadata_uri.len() <= 200, ErrorCode::MetadataUriTooLong);
        
        let receipt = &mut ctx.accounts.receipt;
        receipt.owner = ctx.accounts.user.key();
        receipt.task_type = task_type;
        receipt.company = company;
        receipt.amount_saved = amount_saved;
        receipt.timestamp = Clock::get()?.unix_timestamp;
        receipt.metadata_uri = metadata_uri;
        receipt.verified = false;
        receipt.receipt_number = ctx.accounts.config.total_receipts + 1;

        // Increment global counter
        let config = &mut ctx.accounts.config;
        config.total_receipts += 1;

        // Reward user with 5 $GHOST tokens
        let seeds = &[
            b"config".as_ref(),
            &[ctx.bumps.config],
        ];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.ghost_token_mint.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.config.to_account_info(),
                },
                signer,
            ),
            5_000_000, // 5 tokens (6 decimals)
        )?;

        msg!("Receipt #{} minted! User earned 5 $GHOST", receipt.receipt_number);
        Ok(())
    }

    /// User contributes a cancellation strategy to shared knowledge
    pub fn contribute_knowledge(
        ctx: Context<ContributeKnowledge>,
        company: String,
        task_type: String,
        method: String,
        difficulty_rating: u8,  // 1-5
    ) -> Result<()> {
        require!(!ctx.accounts.config.paused, ErrorCode::ProgramPaused);
        require!(company.len() <= 100, ErrorCode::CompanyNameTooLong);
        require!(task_type.len() <= 50, ErrorCode::TaskTypeTooLong);
        require!(method.len() <= 1000, ErrorCode::MethodTooLong);
        require!(difficulty_rating >= 1 && difficulty_rating <= 5, ErrorCode::InvalidDifficulty);
        
        let knowledge = &mut ctx.accounts.knowledge;
        knowledge.contributor = ctx.accounts.user.key();
        knowledge.company = company;
        knowledge.task_type = task_type;
        knowledge.method = method;
        knowledge.difficulty_rating = difficulty_rating;
        knowledge.success_count = 0;
        knowledge.fail_count = 0;
        knowledge.verification_count = 0;
        knowledge.timestamp = Clock::get()?.unix_timestamp;
        knowledge.last_updated = Clock::get()?.unix_timestamp;
        knowledge.is_active = true;

        // Increment global counter
        let config = &mut ctx.accounts.config;
        config.total_knowledge += 1;

        // Reward contributor with 20 $GHOST tokens
        let seeds = &[
            b"config".as_ref(),
            &[ctx.bumps.config],
        ];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.ghost_token_mint.to_account_info(),
                    to: ctx.accounts.user_token_account.to_account_info(),
                    authority: ctx.accounts.config.to_account_info(),
                },
                signer,
            ),
            20_000_000, // 20 tokens
        )?;

        msg!("Knowledge contributed! User earned 20 $GHOST");
        Ok(())
    }

    /// User verifies whether a cancellation strategy worked
    pub fn verify_knowledge(
        ctx: Context<VerifyKnowledge>,
        worked: bool,
    ) -> Result<()> {
        require!(!ctx.accounts.config.paused, ErrorCode::ProgramPaused);
        require!(ctx.accounts.knowledge.is_active, ErrorCode::KnowledgeInactive);
        
        let knowledge = &mut ctx.accounts.knowledge;
        
        if worked {
            knowledge.success_count += 1;
        } else {
            knowledge.fail_count += 1;
        }
        knowledge.verification_count += 1;
        knowledge.last_updated = Clock::get()?.unix_timestamp;

        // Calculate success rate
        let total_verifications = knowledge.success_count + knowledge.fail_count;
        if total_verifications > 0 {
            // If success rate drops below 30%, mark as inactive
            let success_rate = (knowledge.success_count as f64) / (total_verifications as f64);
            if success_rate < 0.3 && total_verifications >= 10 {
                knowledge.is_active = false;
                msg!("Knowledge marked inactive due to low success rate");
            }
        }

        // Reward original contributor with 5 $GHOST tokens
        let seeds = &[
            b"config".as_ref(),
            &[ctx.bumps.config],
        ];
        let signer = &[&seeds[..]];

        token::mint_to(
            CpiContext::new_with_signer(
                ctx.accounts.token_program.to_account_info(),
                MintTo {
                    mint: ctx.accounts.ghost_token_mint.to_account_info(),
                    to: ctx.accounts.contributor_token_account.to_account_info(),
                    authority: ctx.accounts.config.to_account_info(),
                },
                signer,
            ),
            5_000_000, // 5 tokens bonus
        )?;

        msg!("Knowledge verified! Success: {} / {}", knowledge.success_count, knowledge.verification_count);
        Ok(())
    }

    /// Emergency pause (admin only)
    pub fn pause(ctx: Context<AdminAction>) -> Result<()> {
        require!(ctx.accounts.authority.key() == ctx.accounts.config.authority, ErrorCode::Unauthorized);
        ctx.accounts.config.paused = true;
        msg!("Program paused!");
        Ok(())
    }

    /// Unpause (admin only)
    pub fn unpause(ctx: Context<AdminAction>) -> Result<()> {
        require!(ctx.accounts.authority.key() == ctx.accounts.config.authority, ErrorCode::Unauthorized);
        ctx.accounts.config.paused = false;
        msg!("Program unpaused!");
        Ok(())
    }
}

// ============================================
// STATE ACCOUNT STRUCTURES
// ============================================

#[account]
pub struct Config {
    pub authority: Pubkey,           // Program admin
    pub total_receipts: u64,         // Total tasks completed
    pub total_knowledge: u64,        // Total strategies shared
    pub total_users: u64,            // Unique users
    pub ghost_token_mint: Pubkey,    // $GHOST token mint
    pub paused: bool,                // Emergency pause
}

impl Config {
    pub const LEN: usize = 8 + 32 + 8 + 8 + 8 + 32 + 1;
}

#[account]
pub struct Receipt {
    pub owner: Pubkey,               // User who completed task
    pub task_type: String,           // "cancel_subscription"
    pub company: String,             // "Netflix"
    pub amount_saved: u64,           // in cents
    pub timestamp: i64,              // Unix timestamp
    pub metadata_uri: String,        // IPFS link to full details
    pub verified: bool,              // User confirmed it worked
    pub receipt_number: u64,         // Sequential ID
}

impl Receipt {
    pub const LEN: usize = 8 + 32 + (4 + 50) + (4 + 100) + 8 + 8 + (4 + 200) + 1 + 8;
}

#[account]
pub struct Knowledge {
    pub contributor: Pubkey,         // Who shared this
    pub company: String,             // "Planet Fitness"
    pub task_type: String,           // "cancel_subscription"
    pub method: String,              // Detailed instructions
    pub difficulty_rating: u8,       // 1-5 scale
    pub success_count: u32,          // How many times it worked
    pub fail_count: u32,             // How many times it failed
    pub verification_count: u32,     // Total verifications
    pub timestamp: i64,              // When created
    pub last_updated: i64,           // Last verification
    pub is_active: bool,             // Auto-disabled if success_rate < 30%
}

impl Knowledge {
    pub const LEN: usize = 8 + 32 + (4 + 100) + (4 + 50) + (4 + 1000) + 1 + 4 + 4 + 4 + 8 + 8 + 1;
}

// ============================================
// CONTEXT STRUCTURES (Accounts for each instruction)
// ============================================

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = Config::LEN,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    
    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub ghost_token_mint: Account<'info, Mint>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(task_type: String, company: String)]
pub struct MintReceipt<'info> {
    #[account(
        init,
        payer = user,
        space = Receipt::LEN,
        seeds = [
            b"receipt",
            user.key().as_ref(),
            config.total_receipts.to_le_bytes().as_ref()
        ],
        bump
    )]
    pub receipt: Account<'info, Receipt>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    
    #[account(mut)]
    pub ghost_token_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
#[instruction(company: String, task_type: String)]
pub struct ContributeKnowledge<'info> {
    #[account(
        init,
        payer = user,
        space = Knowledge::LEN,
        seeds = [
            b"knowledge",
            company.as_bytes(),
            task_type.as_bytes(),
            user.key().as_ref()
        ],
        bump
    )]
    pub knowledge: Account<'info, Knowledge>,
    
    #[account(mut)]
    pub user: Signer<'info>,
    
    #[account(
        mut,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    
    #[account(mut)]
    pub ghost_token_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub user_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

#[derive(Accounts)]
pub struct VerifyKnowledge<'info> {
    #[account(mut)]
    pub knowledge: Account<'info, Knowledge>,
    
    #[account(
        mut,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    
    #[account(mut)]
    pub ghost_token_mint: Account<'info, Mint>,
    
    #[account(mut)]
    pub contributor_token_account: Account<'info, TokenAccount>,
    
    pub token_program: Program<'info, Token>,
}

#[derive(Accounts)]
pub struct AdminAction<'info> {
    #[account(
        mut,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,
    
    pub authority: Signer<'info>,
}

// ============================================
// ERROR CODES
// ============================================

#[error_code]
pub enum ErrorCode {
    #[msg("Program is paused")]
    ProgramPaused,
    
    #[msg("Unauthorized")]
    Unauthorized,
    
    #[msg("Task type too long (max 50 chars)")]
    TaskTypeTooLong,
    
    #[msg("Company name too long (max 100 chars)")]
    CompanyNameTooLong,
    
    #[msg("Metadata URI too long (max 200 chars)")]
    MetadataUriTooLong,
    
    #[msg("Method description too long (max 1000 chars)")]
    MethodTooLong,
    
    #[msg("Invalid difficulty rating (must be 1-5)")]
    InvalidDifficulty,
    
    #[msg("Knowledge entry is inactive")]
    KnowledgeInactive,
}
```

---

## 💰 Token Economics

### $GHOST Token Specifications

```rust
// SPL Token configuration
Token Mint: GHOSTtoken11111111111111111111111111111
Decimals: 6
Total Supply: 1,000,000,000 (1 billion)
```

### Distribution

| Allocation | Amount | Purpose |
|------------|--------|---------|
| User Rewards | 400M (40%) | Vested over 4 years |
| Treasury | 300M (30%) | Liquidity, grants |
| Team | 200M (20%) | 2yr cliff, 4yr vest |
| Early Adopters | 100M (10%) | Hackathon, beta users |

### Earning $GHOST

| Action | Reward | Notes |
|--------|--------|-------|
| Complete task | 5 $GHOST | Any successful task |
| Contribute knowledge | 20 $GHOST | Share cancellation method |
| Knowledge verified (worked) | +5 $GHOST | Per verification |
| Refer user | 2 $GHOST | When they complete first task |

### Spending $GHOST

| Service | Cost | Notes |
|---------|------|-------|
| Advanced AI calls | 10 $GHOST | Phone tree navigation |
| Priority support | 50 $GHOST/mo | Fast response |
| Export history | 5 $GHOST | One-time export |
| Governance vote | 100 $GHOST | Locked during vote |

---

## 🧪 Testing the Smart Contract

### Unit Tests

```typescript
// File: solana-program/tests/ghost-protocol.ts

import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { GhostProtocol } from "../target/types/ghost_protocol";
import { assert } from "chai";

describe("ghost-protocol", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.GhostProtocol as Program<GhostProtocol>;

  it("Initializes the program", async () => {
    const [configPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("config")],
      program.programId
    );

    const tx = await program.methods
      .initialize()
      .accounts({
        config: configPda,
        authority: provider.wallet.publicKey,
        ghostTokenMint: /* token mint pubkey */,
      })
      .rpc();

    const config = await program.account.config.fetch(configPda);
    assert.equal(config.totalReceipts.toNumber(), 0);
    assert.equal(config.totalKnowledge.toNumber(), 0);
  });

  it("Mints a receipt and rewards user", async () => {
    const [receiptPda] = anchor.web3.PublicKey.findProgramAddressSync(
      [
        Buffer.from("receipt"),
        provider.wallet.publicKey.toBuffer(),
        new anchor.BN(0).toArrayLike(Buffer, "le", 8),
      ],
      program.programId
    );

    await program.methods
      .mintReceipt(
        "cancel_subscription",
        "Netflix",
        1599, // $15.99
        "https://ipfs.io/..."
      )
      .accounts({
        receipt: receiptPda,
        user: provider.wallet.publicKey,
        // ... other accounts
      })
      .rpc();

    const receipt = await program.account.receipt.fetch(receiptPda);
    assert.equal(receipt.company, "Netflix");
    assert.equal(receipt.amountSaved.toNumber(), 1599);
  });
});
```

---

## 🚀 Deployment Guide

### 1. Build

```bash
cd solana-program
anchor build
```

### 2. Deploy to Devnet

```bash
# Configure for devnet
solana config set --url devnet

# Get devnet SOL
solana airdrop 2

# Deploy
anchor deploy
```

### 3. Initialize Program

```bash
# Run initialization script
anchor run initialize
```

### 4. Verify

```bash
# Check program deployed
solana program show GhostProtocoL11111111111111111111111111111

# Check accounts
solana account <config-pda>
```

---

**Next:** See `04-BUILD-PLAN-4-WEEKS.md` for implementation timeline
