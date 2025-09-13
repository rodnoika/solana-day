'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { getProgram, getVaultPDA, getSharesMintPDA, USDC_MINT, WSOL_MINT, BN } from '@/lib/anchor'
import { PublicKey, SystemProgram, Transaction } from '@solana/web3.js'
import { getAssociatedTokenAddress, createAssociatedTokenAccountInstruction } from '@solana/spl-token'

export function DepositForm() {
  const { publicKey, signTransaction, wallet } = useWallet()
  const { connection } = useConnection()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !signTransaction || !wallet) return

    setLoading(true)
    try {
      const program = getProgram(connection, wallet.adapter)
      const [vaultPDA] = getVaultPDA()
      const [sharesMintPDA] = getSharesMintPDA()
      
      // Convert amount to lamports (USDC has 6 decimals)
      const usdcAmount = Math.floor(parseFloat(amount) * 1_000_000)
      
      // Get user's USDC ATA
      const userUsdcAta = await getAssociatedTokenAddress(USDC_MINT, publicKey)
      
      // Get vault's USDC ATA
      const vaultUsdcAta = await getAssociatedTokenAddress(USDC_MINT, vaultPDA)
      
      // Get user's shares ATA
      const userSharesAta = await getAssociatedTokenAddress(sharesMintPDA, publicKey)
      
      // Check if user has USDC ATA, create if not
      const userUsdcAccount = await connection.getAccountInfo(userUsdcAta)
      const createUserUsdcIx = userUsdcAccount 
        ? null 
        : createAssociatedTokenAccountInstruction(
            publicKey,
            userUsdcAta,
            publicKey,
            USDC_MINT
          )
      
      // Check if user has shares ATA, create if not
      const userSharesAccount = await connection.getAccountInfo(userSharesAta)
      const createUserSharesIx = userSharesAccount
        ? null
        : createAssociatedTokenAccountInstruction(
            publicKey,
            userSharesAta,
            publicKey,
            sharesMintPDA
          )

      // Get recent blockhash
      const { blockhash } = await connection.getLatestBlockhash()
      
      // Build transaction
      const tx = new Transaction()
      tx.recentBlockhash = blockhash
      tx.feePayer = publicKey
      
      if (createUserUsdcIx) tx.add(createUserUsdcIx)
      if (createUserSharesIx) tx.add(createUserSharesIx)
      
      tx.add(
        await program.methods
          .deposit(new BN(usdcAmount))
          .accounts({
            vault: vaultPDA,
            user: publicKey,
            sharesMint: sharesMintPDA,
            userSharesAta: userSharesAta,
            vaultUsdcAta: vaultUsdcAta,
            userUsdcAta: userUsdcAta,
            tokenProgram: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
          })
          .instruction()
      )

      const signature = await signTransaction(tx)
      const txid = await connection.sendRawTransaction(signature.serialize())
      await connection.confirmTransaction(txid)
      
      console.log('Deposit successful:', signature)
      alert(`Deposit successful! Transaction: ${signature}`)
      setAmount('')
    } catch (error) {
      console.error('Deposit failed:', error)
      alert(`Deposit failed: ${error.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Deposit USDC</h3>
      <form onSubmit={handleDeposit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Amount (USDC)
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter USDC amount"
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading ? 'Processing...' : 'Deposit'}
        </button>
      </form>
    </div>
  )
}

