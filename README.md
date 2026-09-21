# Token Intelligence & Sniper

> **A production-quality crypto token discovery, developer intelligence, and human-approved trading terminal and bot.**
> Focused on **Solana** (Pump.fun, Raydium, Meteora) and **BNB Chain** (PancakeSwap, Launchpads), extensible to Base and EVM networks.

---

## 1. Core Philosophy & Workflow

The system strictly enforces the human-in-the-loop operational pipeline:

```
SCAN ➔ ANALYZE ➔ REPORT ➔ USER APPROVES ➔ USER SETS ENTRY ➔ BOT MONITORS ➔ EXECUTES ➔ USER SETS EXIT ➔ BOT MONITORS ➔ EXECUTES EXIT
```

- **Autonomous Actions**: Continuous discovery of tokens created within the last 30 days, deployer wallet tracking, historical launch profiling, rug/scam vulnerability auditing, wallet cluster co-entry detection, 2X–100X scenario modeling, price tick tracking, and position PnL monitoring.
- **Strictly Non-Autonomous Actions**: **Trade entry decisions**. The bot can **NEVER** enter a trade without prior explicit human review, parameter configuration (entry trigger price, position size, take profit, stop loss, slippage), and human authorization.
- **Data Integrity Guarantee**: Clean architectural separation between **REAL DATA** (via live DexScreener and public RPC feeds) and **DEMO MODE** (deterministic simulation). Real data is never fabricated, and demo data is always prominently badged with `[DEMO MODE]`.

---

## 2. Key Capabilities

### 🔍 Token Discovery Engine
- Continuously indexes DEX pairs and tokens created within the last 30 days.
- Multi-chain filtering: **Solana**, **BNB Chain**, **Base**, or **All Chains**.
- Rich metric cards: Price, 24h Price Change, Market Cap, Liquidity Pool Depth, 24h Volume, Buy/Sell Volume split, Holder Count, 24h Holder Growth, Deployer Wallet, Risk Score, Opportunity Score.
- Real-time categories: `NEW TOKENS`, `HOT TOKENS`, `WATCHLIST`, `HIGH RISK`, `DEVELOPER ALERTS`, `SMART MONEY ACTIVITY`.

### 🕵️ Developer & Creator Intelligence
- Identifies deployer wallets and tracks cross-token historical launch timelines.
- Categorizes deployer risk: `LOW CONCERN`, `WATCH`, `HIGH RISK`, `CRITICAL RISK`.
- Tracks observable on-chain events:
  - Historical liquidity removal incidents
  - Large creator dump transactions
  - Insider token transfers to auxiliary wallets
  - Common funding origins (e.g. CEX hot wallets vs dispenser wallets vs Tornado Cash)
- Never makes baseless allegations; backs every risk level with cryptographic proof (tx hash, timestamp, wallet address).

### 🛡️ Rug & Scam Risk Engine
- **Solana First-Class Security**:
  - **Mint Authority**: Verifies if mint authority is revoked or active (preventing arbitrary supply inflation).
  - **Freeze Authority**: Verifies if freeze authority is revoked (preventing wallet blacklisting).
  - **LP Burn / Lock**: Verifies Raydium LP token burn status to the incinerator address.
  - **Holder Distribution**: Inspects top 10 SPL token account concentration.
- **BNB Chain / EVM Security**:
  - Honeypot simulation tests
  - Buy and sell tax rates
  - Ownership renounced verification
  - Upgradeable proxy pattern detection
  - PinkLock / Uncx liquidity locker verification
- **Strict Separation of Evidence**:
  - **[FACT]**: "Creator wallet sold 42,000,000 tokens (4.2% supply) at tx 0x382a... for 18.2 BNB."
  - **[INDICATOR]**: "Moderate creator selling pressure detected within 6h of launch."
  - **[INFERENCE]**: "Elevated creator-related sell risk due to historical pattern of capital extraction."

### 🌐 Wallet Cluster & Smart Money Analysis
- Identifies coordinated wallet entries within tight time windows ($\Delta t \le 120\text{ seconds}$).
- Detects common ancestor funding wallets (e.g., funding dispenser wallets distributing gas prior to launch).
- Discloses historical overlap across previous tokens.
- Uses objective terminology: `COORDINATED WALLET ACTIVITY`, `EARLY WALLET CLUSTER`, `REPEATED WALLET NETWORK`, `POTENTIAL SMART MONEY CLUSTER`.

### 📈 2X to 100X Scenario Analysis
- Models exact mathematical requirements for target multiples (**2X, 5X, 10X, 20X, 50X, 100X**):
  - Required target market cap
  - Required target token price
  - Required liquidity pool depth to avoid catastrophic price slippage
  - Required net capital inflow
  - Required expansion of holder base
- Explores downside scenarios (-50% normal correction, -80% cluster exit, -99% liquidity pull).
- Explicitly disclaims that scenario calculations are mathematical models and never guaranteed outcomes.

### 📋 Report First & Human Approval Workflow
- When a discovered token matches configured filters, the bot issues an **Opportunity Alert Report**.
- Displays key signals, developer risk, cluster activity, and upside/downside models.
- Provides `[ BUY ]` and `[ IGNORE ]` actions.
- Clicking `[ BUY ]` opens the **Trade Setup Modal**:
  - Human defines: Entry Trigger Price, Position Size ($), Take Profit (+%), Stop Loss (-%), Max Slippage (%), Order Type (Trigger Limit / Trigger Market), and Expiry.
  - Requires explicit confirmation check before arming the bot.
- Once approved, the bot transitions to `WAITING FOR ENTRY`.
- The bot cannot modify any approved parameter without another explicit human approval.

### 📊 Position Monitoring & Exits
- Real-time PnL tracking (unrealized and realized).
- Automated exit triggers when market price satisfies user conditions:
  - Take Profit triggered
  - Stop Loss triggered
  - Trailing Stop floor hit
  - Time Expiry reached
  - Manual market exit
- Instant emergency risk alerts (e.g., liquidity collapses > 50% or deployer starts dumping).

### 🔒 Security Guardrails & Emergency Kill Switch
- **Zero Client Secrets**: Private keys and API credentials are never stored in client code or state.
- **Execution Limits**: Max position size ($5,000 ceiling), daily loss stop, max slippage tolerance.
- **Emergency Kill Switch**: Accessible on every view. Instantly freezes all bot monitoring, cancels pending triggers, and blocks new order submissions.

---

## 3. Project Structure

```
token-intelligence/
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
├── index.html
├── .env.example
├── README.md
├── src/
│   ├── main.tsx
│   ├── App.tsx
│   ├── index.css
│   ├── types/
│   │   ├── token.ts            # Token, Chain, Filters, Tags
│   │   ├── developer.ts        # Developer profile, previous launches, evidence chain
│   │   ├── risk.ts             # RugRiskAudit, SolanaSecurity, EvmSecurity
│   │   ├── wallet.ts           # Wallet clusters, co-entries, smart money signals
│   │   ├── opportunity.ts     # Opportunity score, upside/downside scenario models
│   │   ├── trade.ts            # Trade setups, positions, order statuses, exit reasons
│   │   ├── audit.ts            # Immutable audit log entries and actions
│   │   └── provider.ts         # Provider abstractions
│   ├── providers/
│   │   ├── dexScreenerProvider.ts  # Real live DEX token discovery & market feeds
│   │   ├── demoDataProvider.ts     # Deterministic demo scenario (Solana & BSC)
│   │   ├── executionProvider.ts    # Simulated fill engine & guarded live execution layer
│   │   └── providerRegistry.ts     # Central registry & Demo/Live switcher
│   ├── engines/
│   │   ├── developerAnalysisEngine.ts  # Deployer profiling & evidence classification
│   │   ├── rugRiskEngine.ts            # Solana & EVM structural security audits
│   │   ├── walletClusterEngine.ts      # Co-entry time window & funding cluster detection
│   │   ├── opportunityEngine.ts        # Composite score with positive/negative attribution
│   │   ├── scenarioEngine.ts           # 2X-100X required capital modeling
│   │   ├── tradeSetupEngine.ts         # Trade validation & human approval invariants
│   │   ├── entryMonitorEngine.ts       # Watches market price against pending setups
│   │   ├── positionMonitorEngine.ts    # Live PnL tracking & risk alert emission
│   │   ├── exitEngine.ts               # Pre-approved Take Profit & Stop Loss execution
│   │   ├── auditLogEngine.ts           # Chronological immutable event tracking
│   │   └── alertEngine.ts              # Actionable notification emission
│   ├── store/
│   │   └── useTradingStore.ts          # Central reactive store & simulation loop
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Header.tsx              # Top bar, stats, mode toggle, Kill Switch
│   │   │   └── Navigation.tsx          # Terminal navigation tabs with badges
│   │   ├── common/
│   │   │   └── Badge.tsx               # Risk, Opportunity, and Chain badges
│   │   ├── discover/
│   │   │   ├── FilterToolbar.tsx       # Category pills, search, liquidity/age selectors
│   │   │   └── TokenCard.tsx           # High-density token cards
│   │   └── trade/
│   │       ├── OpportunityReportModal.tsx # "Report First" investigative modal
│   │       └── TradeSetupModal.tsx        # Human parameter configuration form
│   ├── pages/
│   │   ├── DiscoverPage.tsx            # Live token scanner grid
│   │   ├── TokenDetailPage.tsx         # 9 inspection tabs (Overview, Chart, Dev, Holders, etc.)
│   │   ├── DevelopersPage.tsx          # Deployer intelligence hub
│   │   ├── WalletsPage.tsx             # Coordinated wallet cluster visualizer
│   │   ├── SetupsPage.tsx              # Approved orders waiting for entry
│   │   ├── PositionsPage.tsx           # Active open positions with live PnL
│   │   ├── HistoryPage.tsx             # Realized PnL & closed trades history
│   │   ├── AuditPage.tsx               # Full searchable audit trail
│   │   └── SettingsPage.tsx            # Guardrails, RPC endpoints, and mode switches
│   └── utils/
│       ├── formatters.ts               # Currency, percent, time ago, address truncation
│       ├── math.ts                     # Scenario math, CPMM liquidity math, PnL
│       └── validation.ts               # Trade draft safety validation
└── tests/
    ├── tokenDiscovery.test.ts          # Age, chain, and volume tests
    ├── developerAnalysis.test.ts       # Deployer history & evidence tests
    ├── rugRiskEngine.test.ts           # Solana & EVM security checks
    ├── walletCluster.test.ts           # Co-entry window & funding tree tests
    ├── opportunityEngine.test.ts       # Score bounds and attribution tests
    ├── scenarioEngine.test.ts          # 2x-100x math & downside models
    ├── humanApprovalInvariants.test.ts # Proof that bot cannot execute without human approval
    ├── entryAndExitEngine.test.ts      # Entry triggers, TP, SL, and liquidity collapse
    └── killSwitch.test.ts              # Emergency halt & audit trail verification
```

---

## 4. How to Run Locally

### Prerequisites
- Node.js v18+ (tested on Node.js v24.15.0)
- npm v9+ (tested on npm v11.12.1)

### 1. Install Dependencies
```bash
cd c:\Users\HomePC\kairo-website\token-intelligence
npm install
```

### 2. Run Test Suite (Vitest)
Verify all 9 test suites and 25 unit/invariant tests:
```bash
npm test
```

### 3. Start Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` to interact with the terminal.

### 4. Build for Production
```bash
npm run build
```

---

## 5. Walkthrough of the Deterministic Demo Scenario

The application includes a built-in one-click deterministic walkthrough:

1. Click the **`Run Demo Scenario`** button in the top header.
2. The bot discovers newly launched BNB token **`$CYBERDOGE`** (7 hours old).
3. The system profiles the developer (`0x123f...c83b`):
   - 4 previous launches indexed
   - 1 recorded liquidity removal event (pulled $28,400 from `$DOGEMAX`)
   - 18% token transfer to auxiliary wallet
4. The system detects a wallet cluster:
   - 7 coordinated wallets entered within 85 seconds
   - $47,000 combined buying position
   - Same dispenser wallet origin
5. The system models 5X ($2.25M mcap) and 10X ($4.5M mcap) upside requirements alongside downside risks.
6. The bot emits the **`TOKEN ALERT OPPORTUNITY REPORT`** modal.
7. The user reviews the evidence and clicks **`BUY (CONFIGURE SETUP)`**.
8. The **`Trade Setup Modal`** opens:
   - User inputs: Entry Trigger `$0.00040` (market currently at `$0.00045`), Position `$100`, Take Profit `+100%` (`$0.00080`), Stop Loss `-30%` (`$0.00028`), Slippage `3%`.
   - User checks explicit authorization: `"I explicitly authorize this trade setup."`
   - User clicks **`CONFIRM TRADE (ARM BOT)`**.
9. The setup moves to the **`TRADE SETUPS`** tab with status **`WAITING FOR ENTRY`**.
10. Click **`Simulate Market Reaching Entry Trigger`**:
    - Simulated market price touches `$0.00040`.
    - Bot executes the order within slippage limits.
    - Setup transitions to **`OPEN POSITIONS`** with real-time PnL tracking.
11. Click **`Simulate Market Hitting Take Profit Trigger`**:
    - Simulated price touches `$0.00080`.
    - Bot executes Take Profit exit.
    - Position closes with `+$100.00 (+100.00%)` profit and moves to **`TRADE HISTORY`**.
12. Navigate to **`AUDIT LOG`** to review the complete, immutable step-by-step history from discovery to exit.

---

## 6. How to Switch to Live Data & Connect Real DEXs

### Step 1: Switch Mode in UI or Config
- Click the **`Switch to LIVE`** button in the header, or toggle operational mode in **`SETTINGS`**.
- The `DexScreenerProvider` will immediately fetch newly created tokens on Solana and BNB Chain directly from the live public DexScreener API.

### Step 2: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Supply your preferred dedicated RPC endpoints (e.g., Helius / QuickNode for Solana; Binance Cloud / Ankr for BNB Chain):
```env
VITE_APP_MODE=live
VITE_SOLANA_RPC_URL=https://mainnet.helius-rpc.com/?api-key=YOUR_KEY
VITE_BSC_RPC_URL=https://bsc-dataseed.binance.org
```

### Step 3: Adding a Custom Provider
Implement the clean interfaces in `src/types/provider.ts`:
```typescript
import { ITokenDiscoveryProvider, IMarketDataProvider } from '../types/provider';
import { Token, Chain } from '../types/token';

export class CustomPumpFunProvider implements ITokenDiscoveryProvider {
  readonly name = 'Pump.fun Native WebSocket Provider';
  readonly isDemo = false;

  async discoverTokens(chain?: Chain): Promise<Token[]> {
    // Custom WebSocket / RPC parsing logic
    return [];
  }

  async getTokenByAddress(address: string, chain: Chain): Promise<Token | null> {
    return null;
  }
}
```
Register the provider in `src/providers/providerRegistry.ts`.

---

## 7. Security Philosophy

- **No Custodial Risk**: The frontend never stores or asks for private keys.
- **Hard Guardrails**: Hard ceilings on max position size, max daily loss, and max slippage prevent runaway execution.
- **Emergency Kill Switch**: Instantly freezes monitoring, cancels pending orders, and disarms execution.
- **Strict Invariants**: A trade can NEVER execute without prior explicit human approval.
