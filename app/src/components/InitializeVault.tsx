'use client'

import React, { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { getProgram, getVaultPDA, getSharesMintPDA, USDC_MINT, WSOL_MINT, BN } from '@/lib/anchor'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token'

export function InitializeVault() {
  const { publicKey, signTransaction, wallet } = useWallet()
  const { connection } = useConnection()
  const [loading, setLoading] = useState(false)
  const [initialized, setInitialized] = useState(false)

  const handleInitialize = async () => {
    if (!publicKey || !signTransaction || !wallet) return

    setLoading(true)
    try {
      const program = getProgram(connection, wallet.adapter)
      const [vaultPDA] = getVaultPDA()
      const [sharesMintPDA] = getSharesMintPDA()
      
      // Check if vault already exists
      const vaultAccount = await connection.getAccountInfo(vaultPDA)
      if (vaultAccount) {
        alert('Vault is already initialized!')
        setInitialized(true)
        return
      }

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      
      // Build transaction
      const tx = new Transaction()
      tx.recentBlockhash = blockhash
      tx.feePayer = publicKey
      
      tx.add(
        await program.methods
          .initializeVault(
            new BN(86400), // 24 hours in seconds
            new BN(50)     // 0.5% fee (50 basis points)
          )
          .accounts({
            vault: vaultPDA,
            admin: publicKey,
            usdcMint: USDC_MINT,
            targetMint: WSOL_MINT,
            sharesMint: sharesMintPDA,
            systemProgram: SystemProgram.programId,
            tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
            rent: new PublicKey('SysvarRent111111111111111111111111111111111'),
          })
          .instruction()
      )

      const signature = await signTransaction(tx)
      const txid = await connection.sendRawTransaction(signature.serialize())
      await connection.confirmTransaction(txid)
      
      console.log('Vault initialized:', signature)
      alert(`Vault initialized successfully! Transaction: ${signature}`)
      setInitialized(true)
    } catch (error) {
      console.error('Initialization failed:', error)
      alert(`Initialization failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  // Check if vault is already initialized
  React.useEffect(() => {
    const checkVault = async () => {
      if (!publicKey) return
      try {
        const [vaultPDA] = getVaultPDA()
        const vaultAccount = await connection.getAccountInfo(vaultPDA)
        setInitialized(!!vaultAccount)
      } catch (error) {
        console.error('Error checking vault:', error)
      }
    }
    checkVault()
  }, [publicKey, connection])

  if (initialized) {
    return (
      <div className="bg-green-500/20 rounded-lg p-6 border border-green-500/30">
        <h3 className="text-xl font-bold text-green-400 mb-2">✅ Vault Initialized</h3>
        <p className="text-green-300">The DCA Vault is ready for deposits!</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Initialize Vault</h3>
      <p className="text-gray-300 mb-4">
        The vault needs to be initialized before you can deposit funds.
      </p>
      <button
        onClick={handleInitialize}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
      >
        {loading ? 'Initializing...' : 'Initialize Vault'}
      </button>
    </div>
  )
}
