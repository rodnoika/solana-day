import { Connection, PublicKey, Keypair } from '@solana/web3.js'
import { Program, AnchorProvider, Wallet } from '@coral-xyz/anchor'
import axios from 'axios'
import dotenv from 'dotenv'

dotenv.config()

// Configuration
const RPC_URL = process.env.RPC_URL || 'https://api.devnet.solana.com'
const PROGRAM_ID = new PublicKey('Fg6PaFpoGXkYsidMpWTK6W2BeZ7FEfcYkg476zPFsLnS')
const VAULT_ADDRESS = new PublicKey('') // Will be set after deployment
const ADMIN_KEYPAIR_PATH = process.env.ADMIN_KEYPAIR_PATH || './admin-keypair.json'

// Jupiter API configuration
const JUPITER_API_URL = 'https://quote-api.jup.ag/v6'
const USDC_MINT = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' // USDC on devnet
const WSOL_MINT = 'So11111111111111111111111111111111111111112' // wSOL

class DCACranker {
  constructor() {
    this.connection = new Connection(RPC_URL, 'confirmed')
    this.adminKeypair = this.loadKeypair()
    this.provider = new AnchorProvider(
      this.connection,
      new Wallet(this.adminKeypair),
      { commitment: 'confirmed' }
    )
    this.program = null
  }

  loadKeypair() {
    try {
      // In production, load from secure keypair file
      // For demo purposes, we'll generate a new one
      const keypair = Keypair.generate()
      console.log('Generated new admin keypair:', keypair.publicKey.toString())
      return keypair
    } catch (error) {
      console.error('Failed to load admin keypair:', error)
      process.exit(1)
    }
  }

  async initializeProgram() {
    try {
      // Load the IDL (Interface Definition Language)
      // In a real project, you would load this from the generated IDL file
      const idl = {
        "version": "0.1.0",
        "name": "dca_vault",
        "instructions": [
          {
            "name": "executeDca",
            "accounts": [
              {
                "name": "vault",
                "isMut": true,
                "isSigner": false
              }
            ],
            "args": []
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

      this.program = new Program(idl, PROGRAM_ID, this.provider)
      console.log('Program initialized successfully')
    } catch (error) {
      console.error('Failed to initialize program:', error)
      throw error
    }
  }

  async getVaultData() {
    try {
      if (!this.program) {
        throw new Error('Program not initialized')
      }

      // Fetch vault account data
      const vaultAccount = await this.program.account.vault.fetch(VAULT_ADDRESS)
      return vaultAccount
    } catch (error) {
      console.error('Failed to fetch vault data:', error)
      return null
    }
  }

  async shouldExecuteDCA() {
    try {
      const vaultData = await this.getVaultData()
      if (!vaultData) {
        console.log('Vault not found or not initialized')
        return false
      }

      const currentTime = Math.floor(Date.now() / 1000)
      const shouldExecute = currentTime >= vaultData.nextExecTs

      console.log(`Current time: ${currentTime}`)
      console.log(`Next execution time: ${vaultData.nextExecTs}`)
      console.log(`Should execute: ${shouldExecute}`)

      return shouldExecute
    } catch (error) {
      console.error('Error checking DCA execution:', error)
      return false
    }
  }

  async getJupiterQuote(inputMint, outputMint, amount) {
    try {
      const response = await axios.get(`${JUPITER_API_URL}/quote`, {
        params: {
          inputMint,
          outputMint,
          amount,
          slippageBps: 50 // 0.5% slippage
        }
      })

      return response.data
    } catch (error) {
      console.error('Failed to get Jupiter quote:', error)
      throw error
    }
  }

  async executeSwap(quote) {
    try {
      // Get swap transaction from Jupiter
      const response = await axios.post(`${JUPITER_API_URL}/swap`, {
        quoteResponse: quote,
        userPublicKey: this.adminKeypair.publicKey.toString(),
        wrapAndUnwrapSol: true
      })

      const { swapTransaction } = response.data

      // Deserialize and sign the transaction
      const transaction = await this.connection.deserializeTransaction(
        Buffer.from(swapTransaction, 'base64')
      )

      transaction.sign(this.adminKeypair)

      // Send the transaction
      const signature = await this.connection.sendRawTransaction(
        transaction.serialize()
      )

      console.log('Swap transaction sent:', signature)
      return signature
    } catch (error) {
      console.error('Failed to execute swap:', error)
      throw error
    }
  }

  async executeDCA() {
    try {
      if (!this.program) {
        throw new Error('Program not initialized')
      }

      // Call the execute_dca instruction
      const tx = await this.program.methods
        .executeDca()
        .accounts({
          vault: VAULT_ADDRESS
        })
        .rpc()

      console.log('DCA execution transaction:', tx)
      return tx
    } catch (error) {
      console.error('Failed to execute DCA:', error)
      throw error
    }
  }

  async runDCAExecution() {
    try {
      console.log('Starting DCA execution check...')

      if (!(await this.shouldExecuteDCA())) {
        console.log('DCA execution not needed at this time')
        return
      }

      console.log('Executing DCA...')

      // Get vault data to determine swap amount
      const vaultData = await this.getVaultData()
      if (!vaultData) {
        throw new Error('Could not fetch vault data')
      }

      // For demo purposes, swap 100 USDC (100 * 10^6 for 6 decimals)
      const swapAmount = 100 * 10**6

      // Get quote from Jupiter
      console.log('Getting quote from Jupiter...')
      const quote = await this.getJupiterQuote(
        USDC_MINT,
        WSOL_MINT,
        swapAmount
      )

      console.log('Quote received:', quote)

      // Execute the swap
      console.log('Executing swap...')
      const swapSignature = await this.executeSwap(quote)

      // Wait for swap confirmation
      await this.connection.confirmTransaction(swapSignature)

      // Execute DCA on-chain (updates timestamp)
      console.log('Updating vault timestamp...')
      const dcaSignature = await this.executeDCA()

      console.log('DCA execution completed successfully!')
      console.log('Swap signature:', swapSignature)
      console.log('DCA signature:', dcaSignature)

    } catch (error) {
      console.error('DCA execution failed:', error)
    }
  }

  async start() {
    console.log('Starting DCA Cranker...')
    console.log('Admin wallet:', this.adminKeypair.publicKey.toString())
    console.log('RPC URL:', RPC_URL)

    await this.initializeProgram()

    // Run initial check
    await this.runDCAExecution()

    // Set up periodic execution (every 5 minutes)
    setInterval(async () => {
      await this.runDCAExecution()
    }, 5 * 60 * 1000)

    console.log('DCA Cranker is running. Checking every 5 minutes...')
  }
}

// Start the cranker
const cranker = new DCACranker()
cranker.start().catch(console.error)

