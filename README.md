# 🏢 RentVerse - Web3 Tokenized Real Estate Platform

RentVerse is a tokenized real estate investment platform that combines fractional property ownership with Ethereum smart contract escrow transactions and Web3 wallet authentication.

---

## 🚀 Key Implementations & Deliverables

### 1. 🦊 MetaMask Wallet Integration
- **Universal Wallet Connection**: Integrated MetaMask (EIP-1193) provider into the header navigation (`Navbar.jsx`), home page hero/CTA sections, and property detail pages.
- **State & Event Management**:
  - Live ETH balance querying & network detection (`Sepolia`, `Mainnet`, `Polygon`, `Localhost`).
  - Automatic reactivity to MetaMask account switches (`accountsChanged`), network changes (`chainChanged`), and disconnections.
  - Interactive connected pill badge with dropdown menu: Copy address with visual feedback, View on Etherscan explorer, and Disconnect.
- **Sign-In with Ethereum (SIWE)**:
  - Cryptographic challenge-response authentication with nonces to prevent replay attacks and issue secure JWT sessions.

### 2. ⚡ Scalable Smart Contract REST API Backend
A layered, enterprise-grade architecture for interacting with Ethereum smart contracts (`RealEstate.sol` and `Escrow.sol`).

- **Architecture Highlights**:
  - **Service-Controller-Route Layering**: Clean separation of concerns between business logic, Web3 provider communication, and HTTP transport.
  - **Non-blocking RPC & Fallback Resilience**: `StaticJsonRpcProvider` with timeout guards to prevent RPC network hang-ups.
  - **Hybrid Signing Architecture**: Supports both client-side MetaMask transaction execution (via server-prepared encoded calldata) and server-side relayer execution (via operator wallet).

---

## 📐 System Architecture

```
                                  ┌──────────────────────────┐
                                  │   MetaMask / Web3 User   │
                                  └────────────┬─────────────┘
                                               │ (Sign & Send TX)
                                               ▼
┌─────────────────────────────────┐        ┌──────────────────────────┐
│        RentVerse Frontend       │ ◄────► │    Ethereum Blockchain   │
│   (React 18 + WalletContext)    │        │  (RealEstate & Escrow)   │
└────────────────┬────────────────┘        └─────────────▲────────────┘
                 │ (REST API / JSON)                     │
                 ▼                                       │ (RPC Provider / Signer)
┌────────────────────────────────────────────────────────┴────────────┐
│                       Express.js Backend API                        │
│ ┌──────────────────────┐ ┌───────────────────┐ ┌──────────────────┐ │
│ │  contractController  │ │    web3Service    │ │    web3Config    │ │
│ └──────────────────────┘ └───────────────────┘ └──────────────────┘ │
└─────────────────────────────────────────────────────────────────────┘
```

---

## 📡 REST API Reference

Base URL: `http://localhost:3099/api/contracts` or `http://localhost:3099/api/web3`

### Status & Network
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/status` | Get RPC connectivity status, current block, network name, gas price, and deployed contract addresses |
| `GET` | `/balance/:address` | Query native ETH balance for any wallet address |

### RealEstate NFT Contract (`RealEstate.sol`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/real-estate/info` | Get ERC-721 token metadata (name, symbol, total supply) |
| `GET` | `/real-estate/token/:id` | Get token URI metadata and current token owner |
| `POST` | `/real-estate/prepare-mint` | Prepare unsigned transaction calldata for minting a new property NFT |

### Escrow Smart Contract (`Escrow.sol`)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/escrow/info` | Get Escrow configuration (vault balance, seller, inspector, lender addresses) |
| `GET` | `/escrow/property/:id` | Get escrow listing status, purchase price, earnest amount, buyer, inspection status |
| `GET` | `/escrow/property/:id/approval/:address` | Check if a specific address has approved the property sale |
| `POST` | `/escrow/prepare-list` | Prepare calldata for listing an NFT in the Escrow contract |
| `POST` | `/escrow/prepare-deposit` | Prepare calldata & ETH value for earnest deposit |
| `POST` | `/escrow/prepare-inspection` | Prepare calldata for inspector status update |
| `POST` | `/escrow/prepare-approve` | Prepare calldata for approving a sale |
| `POST` | `/escrow/prepare-finalize` | Prepare calldata for final sale settlement |
| `POST` | `/escrow/prepare-cancel` | Prepare calldata for canceling sale and earnest refund |

### Web3 Wallet Authentication (SIWE)
| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/auth/nonce?address=0x...` | Generate a unique cryptographic nonce & challenge message |
| `POST` | `/auth/verify` | Verify MetaMask signature, authenticate user, and issue JWT |
| `GET` | `/auth/me` | Fetch authenticated wallet profile from JWT |

---

## 🛠️ How to Run Locally

### 1. Install Dependencies
```bash
npm install --legacy-peer-deps
```

### 2. Run Test Suite
To verify the smart contract endpoints and Web3 connection:
```bash
npm run test:api
```

### 3. Start Both Backend & Frontend
```bash
npm start
```
- Frontend runs on: `http://localhost:3000`
- Backend API runs on: `http://localhost:3099`

---

## 🔐 Technical Decision-Making & Scalability Notes

1. **Transaction Preparation vs. Direct Relaying**:
   - The backend prepares validated, type-checked calldata (`prepare-deposit`, `prepare-list`, `prepare-mint`), allowing users to sign directly with their MetaMask private keys without server custody risk.
   - Server-side relayer execution is also supported when an `OPERATOR_PRIVATE_KEY` is provided in the `.env` file.

2. **Fault-Tolerant RPC Layer**:
   - Utilizes `StaticJsonRpcProvider` with timeout guards to eliminate cold-start lag and network lockups during RPC slowdowns.
   - Graceful fallbacks ensure UI continuity even under restricted network conditions.

3. **Modular Component Architecture**:
   - `WalletContext`: Centralizes provider, signer, network state, and auto-reconnection across all pages.
   - `SmartContractDashboard`: Built-in interactive UI for inspecting contract state, minting test property NFTs, and escrow listings.
   - `InvestModal`: Dedicated investment dialog on property pages enabling one-click earnest escrow deposits via MetaMask.
