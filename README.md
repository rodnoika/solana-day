# DCA Vault - Solana Dollar Cost Averaging

A Solana-based Dollar Cost Averaging (DCA) vault that allows users to automatically invest in tokens over time.

## Features

- **Automated DCA**: Set up recurring investments in your favorite tokens
- **Vault Management**: Deposit, withdraw, and monitor your investments
- **Solana Integration**: Built on Solana blockchain with Anchor framework
- **Modern UI**: Clean, responsive interface built with Next.js and Tailwind CSS

## Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript, Tailwind CSS
- **Blockchain**: Solana, Anchor Framework
- **Wallet Integration**: Solana Wallet Adapter
- **Deployment**: Vercel

## Deployment on Vercel

### Prerequisites

1. Vercel account
2. GitHub repository with the code
3. Solana program deployed (for production)

### Steps

1. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Select the `app` folder as the root directory

2. **Configure Environment Variables**:
   In Vercel dashboard, add these environment variables:
   ```
   NEXT_PUBLIC_SOLANA_NETWORK=devnet
   NEXT_PUBLIC_PROGRAM_ID=FFEsdGVknjB3QZqTKjHufPq2uJeApiRJAj5UtYgUcijT
   ```

3. **Deploy**:
   - Click "Deploy"
   - Vercel will automatically build and deploy your app

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_SOLANA_NETWORK` | Solana network (devnet/testnet/mainnet-beta) | devnet |
| `NEXT_PUBLIC_PROGRAM_ID` | Deployed Anchor program ID | FFEsdGVknjB3QZqTKjHufPq2uJeApiRJAj5UtYgUcijT |

### Production Considerations

1. **Program Deployment**: Deploy your Anchor program to mainnet for production use
2. **RPC Endpoints**: Consider using a dedicated RPC provider for better performance
3. **Security**: Review all smart contract interactions before mainnet deployment
4. **Monitoring**: Set up monitoring for transaction failures and user errors

## Local Development

1. **Install Dependencies**:
   ```bash
   cd app
   npm install
   ```

2. **Run Development Server**:
   ```bash
   npm run dev
   ```

3. **Build for Production**:
   ```bash
   npm run build
   npm start
   ```

## Project Structure

```
├── app/                    # Next.js frontend
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── lib/           # Utilities and configurations
│   │   └── app/           # Next.js app router
│   ├── package.json
│   └── next.config.js     # Next.js configuration
├── programs/              # Anchor program
│   └── dca_vault/
├── cranker/               # Off-chain execution script
├── Anchor.toml           # Anchor configuration
└── vercel.json           # Vercel deployment config
```

## Smart Contract

The DCA vault is implemented as an Anchor program with the following features:

- **Initialize Vault**: Set up a new DCA vault with configurable parameters
- **Deposit**: Add USDC to the vault and receive shares
- **Withdraw**: Redeem shares for proportional USDC and target tokens
- **Execute DCA**: Automated execution of DCA strategy (handled by cranker)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
