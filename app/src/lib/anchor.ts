import { Program, AnchorProvider } from '@coral-xyz/anchor'
import { Connection, PublicKey } from '@solana/web3.js'
import BN from 'bn.js'

export { BN }

// Program ID from deployment
export const PROGRAM_ID = new PublicKey(process.env.NEXT_PUBLIC_PROGRAM_ID || 'FFEsdGVknjB3QZqTKjHufPq2uJeApiRJAj5UtYgUcijT')

// Network configuration
export const NETWORK = process.env.NEXT_PUBLIC_SOLANA_NETWORK || 'devnet'

// Mock IDL - in a real app, you'd load this from the generated IDL file
export const IDL = {
  "version": "0.1.0",
  "name": "dca_vault",
  "instructions": [
    {
      "name": "initializeVault",
      "accounts": [
        { "name": "vault", "isMut": true, "isSigner": false },
        { "name": "admin", "isMut": true, "isSigner": true },
        { "name": "usdcMint", "isMut": false, "isSigner": false },
        { "name": "targetMint", "isMut": false, "isSigner": false },
        { "name": "sharesMint", "isMut": true, "isSigner": false },
        { "name": "systemProgram", "isMut": false, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false },
        { "name": "rent", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "periodSeconds", "type": "u64" },
        { "name": "feeBps", "type": "u16" }
      ]
    },
    {
      "name": "deposit",
      "accounts": [
        { "name": "vault", "isMut": true, "isSigner": false },
        { "name": "user", "isMut": true, "isSigner": true },
        { "name": "sharesMint", "isMut": true, "isSigner": false },
        { "name": "userSharesAta", "isMut": true, "isSigner": false },
        { "name": "vaultUsdcAta", "isMut": true, "isSigner": false },
        { "name": "userUsdcAta", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "usdcAmount", "type": "u64" }
      ]
    },
    {
      "name": "withdraw",
      "accounts": [
        { "name": "vault", "isMut": true, "isSigner": false },
        { "name": "user", "isMut": true, "isSigner": true },
        { "name": "sharesMint", "isMut": true, "isSigner": false },
        { "name": "userSharesAta", "isMut": true, "isSigner": false },
        { "name": "vaultUsdcAta", "isMut": true, "isSigner": false },
        { "name": "userUsdcAta", "isMut": true, "isSigner": false },
        { "name": "vaultTargetAta", "isMut": true, "isSigner": false },
        { "name": "userTargetAta", "isMut": true, "isSigner": false },
        { "name": "tokenProgram", "isMut": false, "isSigner": false }
      ],
      "args": [
        { "name": "sharesAmount", "type": "u64" }
      ]
    }
  ],
  "accounts": [
    {
      "name": "Vault",
      "type": {
        "kind": "struct",
        "fields": [
          { "name": "admin", "type": "publicKey" },
          { "name": "usdcMint", "type": "publicKey" },
          { "name": "targetMint", "type": "publicKey" },
          { "name": "sharesMint", "type": "publicKey" },
          { "name": "periodSeconds", "type": "u64" },
          { "name": "nextExecTs", "type": "u64" },
          { "name": "feeBps", "type": "u16" },
          { "name": "totalShares", "type": "u64" }
        ]
      }
    }
  ]
}

// Devnet token mints
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v')
export const WSOL_MINT = new PublicKey('So11111111111111111111111111111111111111112')

export function getProgram(connection: Connection, wallet: any) {
  const provider = new AnchorProvider(connection, wallet, {})
  return new Program(IDL as any, PROGRAM_ID, provider)
}

export function getVaultPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('vault')], PROGRAM_ID)
}

export function getSharesMintPDA(): [PublicKey, number] {
  return PublicKey.findProgramAddressSync([Buffer.from('shares_mint')], PROGRAM_ID)
}
