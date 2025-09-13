# Solana DCA Vault - DeFi MVP

A minimal **Dollar Cost Averaging (DCA) Vault** built on **Solana** for hackathon submission. Users deposit **USDC** → periodically buy target tokens (like **wSOL**) via **Jupiter** using an off-chain cranker → users receive **shares** (vault token) and can withdraw their proportional share of USDC + target tokens anytime.

## 🏗️ Project Structure

```
/
├── programs/dca_vault/          # Anchor program (Rust)
│   ├── src/lib.rs              # Main program logic
│   └── Cargo.toml              # Rust dependencies
├── app/                        # Next.js frontend
│   ├── src/
│   │   ├── app/                # Next.js 13+ app directory
│   │   ├── components/         # React components
│   │   └── lib/                # Utility functions
│   ├── package.json            # Frontend dependencies
│   └── tailwind.config.js      # Tailwind CSS config
├── cranker/                    # Node.js off-chain script
│   ├── index.js                # Main cranker logic
│   ├── package.json            # Cranker dependencies
│   └── env.example             # Environment variables template
├── Anchor.toml                 # Anchor configuration
├── Cargo.toml                  # Root Rust workspace
└── README.md                   # This file
```

## 🚀 Quick Start

### Prerequisites

- **Node.js** (v18+)
- **Rust** (latest stable)
- **Solana CLI** (v1.17+)
- **Anchor CLI** (v0.29+)

### 1. Install Dependencies

```bash
# Install Rust dependencies
cargo build

# Install frontend dependencies
cd app
npm install

# Install cranker dependencies
cd ../cranker
npm install
```

### 2. Solana Setup

```bash
# Configure Solana CLI for devnet
solana config set --url devnet

# Create a new keypair (if you don't have one)
solana-keygen new --outfile ~/.config/solana/id.json

# Fund your wallet with devnet SOL
solana airdrop 2
```

### 3. Deploy the Program

```bash
# Build and deploy the Anchor program
anchor build
anchor deploy

# Note the program ID from deployment output
# Update it in Anchor.toml and cranker/index.js
```

### 4. Initialize the Vault

```bash
# Run the initialization script (you'll need to create this)
# This will call initialize_vault instruction
```

### 5. Run the Frontend

```bash
cd app
npm run dev
```

Visit `http://localhost:3000` to see the DCA Vault interface.

### 6. Start the Cranker

```bash
cd cranker
cp env.example .env
# Edit .env with your configuration
npm start
```

## 📋 Features

### On-chain (Anchor Program)

- **`initialize_vault`**: Set up a new DCA vault with configurable period and fees
- **`deposit`**: Users deposit USDC and receive proportional vault shares
- **`withdraw`**: Users burn shares to receive proportional USDC + target tokens
- **`execute_dca`**: Updates vault timestamp (actual swap handled off-chain)

### Off-chain (Cranker)

- Monitors vault execution schedule
- Fetches quotes from Jupiter API
- Executes USDC → wSOL swaps
- Updates vault state on-chain

### Frontend (Next.js)

- Wallet connection (Phantom, Solflare)
- Deposit/withdraw interface
- Real-time vault statistics
- Modern, responsive UI with Tailwind CSS

## 🔧 Configuration

### Anchor.toml
```toml
[programs.devnet]
dca_vault = "YOUR_PROGRAM_ID"

[provider]
cluster = "devnet"
wallet = "~/.config/solana/id.json"
```

### Cranker Environment (.env)
```bash
RPC_URL=https://api.devnet.solana.com
ADMIN_KEYPAIR_PATH=./admin-keypair.json
VAULT_ADDRESS=YOUR_VAULT_ADDRESS
```

## 🏛️ Architecture

### Smart Contract Logic

1. **Vault Account**: Stores vault configuration and state
2. **Shares Mint**: ERC-20-like token representing vault ownership
3. **Token Accounts**: Associated token accounts for USDC and target tokens
4. **Access Control**: Only admin can execute DCA operations

### DCA Execution Flow

1. Cranker checks `vault.next_exec_ts`
2. If time to execute, fetches Jupiter quote
3. Performs swap using vault's USDC
4. Calls `execute_dca` to update timestamp
5. Process repeats based on `period_seconds`

### User Flow

1. **Deposit**: User sends USDC → receives vault shares
2. **DCA**: Cranker periodically swaps USDC for target tokens
3. **Withdraw**: User burns shares → receives proportional assets

## 🛠️ Development

### Building the Program

```bash
anchor build
```

### Running Tests

```bash
anchor test
```

### Frontend Development

```bash
cd app
npm run dev
```

### Cranker Development

```bash
cd cranker
npm run dev  # Runs with --watch flag
```

## 📊 Token Economics (MVP)

- **Deposit**: 1 USDC = 1 Share (simplified for MVP)
- **Fees**: Configurable basis points (default: 0.5%)
- **DCA Period**: Configurable (default: 24 hours)
- **Target Token**: wSOL (wrapped SOL)

## 🔒 Security Notes

⚠️ **This is a hackathon MVP - not production-ready!**

- No formal security audit
- Simplified token economics
- Basic access controls
- Admin key management needs improvement

## 🚀 Deployment Checklist

- [ ] Deploy Anchor program to devnet
- [ ] Update program ID in all configs
- [ ] Initialize vault with proper parameters
- [ ] Set up admin keypair for cranker
- [ ] Configure environment variables
- [ ] Test deposit/withdraw functionality
- [ ] Verify DCA execution works
- [ ] Deploy frontend to Vercel/Netlify

## 🤝 Contributing

This is a hackathon project, but feel free to:
- Report issues
- Suggest improvements
- Submit pull requests

## 📄 License

MIT License - feel free to use for your own projects!

## 🎯 Hackathon Submission

This project demonstrates:
- ✅ Solana smart contract development with Anchor
- ✅ Off-chain automation with Node.js
- ✅ Modern React frontend with wallet integration
- ✅ DeFi primitives (vault, shares, DCA)
- ✅ Integration with Jupiter DEX aggregator
- ✅ Clean, documented codebase

Perfect for blockchain hackathon submissions! 🏆

