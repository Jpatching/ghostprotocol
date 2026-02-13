# GHOST PROTOCOL - 4-WEEK BUILD PLAN

## Overview

**Goal:** Ship a demo-able MVP of "Subscription Sentinel" in 4 weeks

**Strategy:** Build vertically (one complete feature) rather than horizontally (all features partially)

---

## WEEK 1: Foundation + Local App

### Day 1 (Feb 13): Project Setup
**Goal:** Get development environment ready

- [ ] Install Rust, Node.js, Solana CLI, Anchor CLI
- [ ] Create GitHub repo: `ghost-protocol`
- [ ] Initialize Tauri project: `npm create tauri-app`
- [ ] Initialize Anchor project: `anchor init ghost-protocol-program`
- [ ] Set up project structure (see architecture doc)
- [ ] Configure `.env` for API keys (template only)
- [ ] First commit: "Initial project structure"

**Validation:** App compiles, Solana program compiles

---

### Day 2 (Feb 14): Database + Basic UI
**Goal:** Local storage + skeleton UI

**Backend:**
- [ ] Create SQLite schema (see architecture doc)
- [ ] Implement database connection in `src-tauri/src/db/schema.rs`
- [ ] Write migration script
- [ ] Test database CRUD operations

**Frontend:**
- [ ] Set up React with TailwindCSS
- [ ] Create basic layout (header, sidebar, main)
- [ ] Add routing (Dashboard, Settings, Tasks)
- [ ] Placeholder components

**Validation:** App opens, shows UI, database created in correct location

---

### Day 3 (Feb 15): Plaid Integration
**Goal:** Connect to bank, fetch transactions

- [ ] Sign up for Plaid (sandbox mode - free)
- [ ] Implement Plaid Link token creation
- [ ] Create `PlaidConnect` React component
- [ ] Implement OAuth flow
- [ ] Store encrypted access token in database
- [ ] Fetch last 90 days of transactions
- [ ] Display raw transactions in UI (for testing)

**Validation:** User can connect bank, see their transactions

---

### Day 4 (Feb 16): Transaction Storage
**Goal:** Parse and store transactions locally

- [ ] Create `Transaction` model
- [ ] Store transactions in SQLite
- [ ] Implement transaction filtering (remove duplicates)
- [ ] Add transaction list view
- [ ] Add search/filter functionality
- [ ] Display transaction totals

**Validation:** Transactions persist across app restarts

---

### Day 5 (Feb 17): API Key Management
**Goal:** Secure storage of API keys

- [ ] Implement encryption module (`crypto/encryption.rs`)
- [ ] Create API key storage commands
- [ ] Build Settings UI for API key input
- [ ] Test encryption/decryption
- [ ] Add Claude API key storage
- [ ] Add Solana wallet connection

**Validation:** API keys encrypted at rest, can be retrieved

---

### Day 6-7 (Feb 18-19): AI Detection + Polish
**Goal:** Use Claude to detect subscriptions

**Saturday:**
- [ ] Implement Claude API integration
- [ ] Create prompt for subscription detection
- [ ] Parse Claude's JSON response
- [ ] Create `Subscription` model
- [ ] Store detected subscriptions in database

**Sunday:**
- [ ] Build subscription dashboard UI
- [ ] Add subscription cards (show name, amount, frequency)
- [ ] Calculate total savings
- [ ] Add loading states, error handling
- [ ] Polish UI/UX
- [ ] Write tests for critical paths

**Validation:** User sees detected subscriptions with accurate amounts

---

## WEEK 2: Cancellation Flow + Solana Setup

### Day 8 (Feb 20): Email Generation
**Goal:** Generate cancellation emails

- [ ] Create email template system
- [ ] Implement Claude-powered email generation
- [ ] Add company-specific templates
- [ ] Create email preview component
- [ ] Add edit functionality
- [ ] Test with real examples

**Validation:** Clicking "Cancel" generates professional email

---

### Day 9 (Feb 21): Email Sending
**Goal:** Actually send the emails

**Option A: Default Email Client (Easier)**
- [ ] Implement `mailto:` link generation
- [ ] Open default email client with pre-filled email

**Option B: Gmail API (Better UX, more work)**
- [ ] Set up Gmail OAuth
- [ ] Implement send email function
- [ ] Add sent email tracking

**Choose Option A for MVP**

**Validation:** Clicking "Send" opens email client with perfect email

---

### Day 10 (Feb 22): Task Management
**Goal:** Track task lifecycle

- [ ] Create task queue UI
- [ ] Implement task state machine (pending → in_progress → completed)
- [ ] Add task history view
- [ ] Create task detail modal
- [ ] Add retry functionality
- [ ] Implement task notifications

**Validation:** All tasks tracked from start to finish

---

### Day 11 (Feb 23): Solana Program - Part 1
**Goal:** Deploy basic Solana program

- [ ] Copy smart contract code (from doc 03)
- [ ] Update program ID
- [ ] Build program: `anchor build`
- [ ] Deploy to devnet: `anchor deploy`
- [ ] Write basic tests
- [ ] Initialize program with config

**Validation:** Program deployed, tests pass

---

### Day 12 (Feb 24): Solana Program - Part 2
**Goal:** Receipt minting works

- [ ] Create $GHOST token mint (SPL token)
- [ ] Test `mint_receipt` instruction
- [ ] Test token rewards
- [ ] Add error handling
- [ ] Write comprehensive tests

**Validation:** Can mint receipt NFTs, receive tokens

---

### Day 13-14 (Feb 25-26): Solana Integration
**Goal:** Connect app to Solana program

**Saturday:**
- [ ] Add `@solana/web3.js` and `@coral-xyz/anchor` to frontend
- [ ] Implement wallet connection (Phantom/Backpack)
- [ ] Create Solana service in Rust backend
- [ ] Test program calls from Rust

**Sunday:**
- [ ] Implement receipt minting flow
- [ ] Add token balance display
- [ ] Add transaction confirmation
- [ ] Test on devnet
- [ ] Handle errors gracefully

**Validation:** Complete flow: cancel → email → mint receipt → receive tokens

---

## WEEK 3: Knowledge Graph + Token Rewards

### Day 15 (Feb 27): Knowledge Graph - Backend
**Goal:** Store/retrieve shared knowledge

- [ ] Implement `contribute_knowledge` program call
- [ ] Create knowledge storage in SQLite (cache)
- [ ] Add knowledge query functions
- [ ] Test knowledge creation

**Validation:** Can create knowledge entries on-chain

---

### Day 16 (Feb 28): Knowledge Graph - UI
**Goal:** Users can share knowledge

- [ ] Create "Share Knowledge" modal
- [ ] Add form (company, method, task type)
- [ ] Implement submission flow
- [ ] Show user's contributions
- [ ] Display earnings from contributions

**Validation:** User can contribute knowledge, earn tokens

---

### Day 17 (Mar 1): Knowledge Verification
**Goal:** Users verify what works

- [ ] Implement verification flow
- [ ] Add "Did this work?" prompts (7 days after task)
- [ ] Create verification UI
- [ ] Update success rates
- [ ] Reward contributors for verifications

**Validation:** Verification updates knowledge graph, rewards flow

---

### Day 18 (Mar 2): Knowledge Display
**Goal:** Show knowledge to users

- [ ] Create knowledge search component
- [ ] Display success rates
- [ ] Show verification counts
- [ ] Add sorting/filtering
- [ ] Highlight best methods

**Validation:** Users see proven cancellation methods

---

### Day 19 (Mar 3): Auto-Knowledge Application
**Goal:** Use knowledge automatically

- [ ] When cancelling, query knowledge graph
- [ ] Auto-select best method
- [ ] Show confidence score
- [ ] Allow manual override
- [ ] Track which method was used

**Validation:** App suggests best method automatically

---

### Day 20-21 (Mar 4-5): Token Dashboard
**Goal:** Visualize token economy

**Saturday:**
- [ ] Create token balance display
- [ ] Show earning history
- [ ] Display global stats (total saved, total tasks)
- [ ] Add leaderboard (top contributors)

**Sunday:**
- [ ] Implement token transaction history
- [ ] Add charts (earnings over time)
- [ ] Create rewards explanation page
- [ ] Polish token UX

**Validation:** Users understand their earnings, feel motivated

---

## WEEK 4: Polish + Demo Prep

### Day 22 (Mar 6): Onboarding Flow
**Goal:** Smooth first-time experience

- [ ] Create welcome screen
- [ ] Build step-by-step tutorial
- [ ] Add progress indicators
- [ ] Implement skip option
- [ ] Test with fresh install

**Validation:** New user can complete setup in <2 minutes

---

### Day 23 (Mar 7): Error Handling + Edge Cases
**Goal:** Handle failures gracefully

- [ ] Add error boundaries (React)
- [ ] Implement retry logic
- [ ] Add user-friendly error messages
- [ ] Handle network failures
- [ ] Test offline mode
- [ ] Add loading states everywhere

**Validation:** App doesn't crash, errors are clear

---

### Day 24 (Mar 8): Performance Optimization
**Goal:** Fast and responsive

- [ ] Implement caching for Solana queries
- [ ] Add pagination for long lists
- [ ] Optimize database queries
- [ ] Lazy load images/components
- [ ] Reduce bundle size
- [ ] Test on slower machines

**Validation:** App loads <2 seconds, interactions instant

---

### Day 25 (Mar 9): Design Polish
**Goal:** Beautiful UI

- [ ] Consistent spacing/typography
- [ ] Add micro-interactions (hover states, transitions)
- [ ] Create empty states
- [ ] Add illustrations/icons
- [ ] Dark mode support (optional)
- [ ] Responsive design checks

**Validation:** App looks professional, feels polished

---

### Day 26 (Mar 10): Testing + Bug Fixes
**Goal:** Everything works

- [ ] Test complete user journey 10 times
- [ ] Fix all critical bugs
- [ ] Test on Windows (if Mac user)
- [ ] Test on Mac (if Windows user)
- [ ] Write test documentation
- [ ] Create bug list

**Validation:** Can demo without crashes

---

### Day 27-28 (Mar 11-12): Demo Prep
**Goal:** Killer presentation

**Saturday:**
- [ ] Record demo video (5 minutes)
- [ ] Create pitch deck (10 slides)
- [ ] Write demo script
- [ ] Practice presentation 5 times
- [ ] Set up demo data (realistic subscriptions)

**Sunday:**
- [ ] Final polish
- [ ] Test demo flow 10 times
- [ ] Prepare for questions
- [ ] Deploy to mainnet (if confident)
- [ ] Create README with screenshots
- [ ] Submit to hackathon

**Validation:** Can present confidently, demo works flawlessly

---

## DAILY ROUTINE

Each day:
1. **Morning (2 hours):** High-focus coding
2. **Afternoon (2 hours):** Testing + documentation
3. **Evening (1 hour):** Review progress, plan next day
4. **Weekends:** Catch up + extra features

**Total:** ~5 hours/day × 28 days = 140 hours

---

## FEATURE CHECKLIST (MVP)

### Must Have (Core Demo)
- [x] Local desktop app (Tauri)
- [x] Bank connection (Plaid)
- [x] Subscription detection (Claude AI)
- [x] Cancellation email generation
- [x] Solana receipt minting
- [x] $GHOST token rewards
- [x] Basic knowledge sharing
- [x] Token balance display

### Should Have (Impressive)
- [ ] Knowledge verification flow
- [ ] Success rate calculation
- [ ] Leaderboard
- [ ] Auto-apply best methods
- [ ] Beautiful UI

### Nice to Have (If time)
- [ ] Dark mode
- [ ] Export data
- [ ] Multi-wallet support
- [ ] More task types (beyond subscriptions)

---

## RISK MITIGATION

### If Behind Schedule:

**Cut these first:**
1. Dark mode
2. Charts/graphs
3. Leaderboard
4. Advanced filtering
5. Multi-wallet support

**Never cut:**
1. Core subscription detection
2. Email generation
3. Solana integration
4. Token rewards
5. Demo functionality

---

## DEMO DAY CHECKLIST

**24 Hours Before:**
- [ ] App builds on fresh machine
- [ ] Demo data loaded
- [ ] Presentation rehearsed 10+ times
- [ ] Backup video recorded (in case live demo fails)
- [ ] All screenshots/slides ready
- [ ] Solana program deployed to devnet (or mainnet)

**Demo Script (5 minutes):**
1. **Problem (30 sec):** "$165B wasted annually on annoyance economy"
2. **Demo (3 min):**
   - Open app → Connect bank → See subscriptions
   - Click "Cancel Netflix" → Email generated
   - Send email → Receipt minted → Tokens earned
   - Show knowledge graph → "143 users verified this works"
3. **Vision (30 sec):** "This is just subscriptions. Imagine: insurance, bills, delivery..."
4. **Tech (30 sec):** "Local-first, Solana-native, open source"
5. **Ask (30 sec):** "Try it at github.com/yourname/ghost-protocol"

---

## SUCCESS METRICS

### Minimum Success (Pass):
- ✅ Working demo (no crashes)
- ✅ Solana integration clear
- ✅ Novel use case
- ✅ Code quality good

### Target Success (Prize):
- ✅ Above +
- ✅ Beautiful UI
- ✅ Judges can test it themselves
- ✅ Clear network effects story
- ✅ Viral potential obvious

### Dream Success (Winner):
- ✅ Above +
- ✅ Users already using it
- ✅ Media coverage
- ✅ Multiple wallets connected
- ✅ Working token economy

---

## TOOLS & RESOURCES

### Development
- **VS Code** with Rust Analyzer extension
- **GitHub Copilot** (if available)
- **Cursor** (AI coding assistant)

### Testing
- **Solana Explorer** (devnet): https://explorer.solana.com/?cluster=devnet
- **Phantom Wallet** (devnet mode)
- **Plaid Sandbox** (free test accounts)

### Design
- **Figma** (UI mockups - optional)
- **Lucide Icons** (React icons)
- **Coolors.co** (color palettes)

---

## CONTINGENCY PLANS

### If Plaid Doesn't Work:
- Manual CSV upload of transactions
- Mock data for demo

### If Solana Program Has Bugs:
- Use local mock for demo
- Fix after hackathon

### If Tauri Build Fails:
- Fall back to Electron
- Or web app (React only)

### If You Get Stuck (>4 hours):
- Ask Claude for help (me!)
- Check Discord/Stack Overflow
- Simplify the feature
- Move to next item

---

## POST-HACKATHON PLAN

### Week 5-8:
- Fix all bugs from demo
- Add phone tree navigation (one company)
- Launch to 100 beta users
- Gather feedback

### Month 3-4:
- Add insurance appeals
- Build mobile app (React Native)
- 1,000 users

### Month 5-6:
- Full Ghost Protocol vision
- DAO launch
- 10,000 users

---

*Let's build this. One day at a time.*

**Start Date: February 13, 2026**
**Demo Date: March 12, 2026**
**Days Remaining: 28**

**YOU GOT THIS. 🚀**
