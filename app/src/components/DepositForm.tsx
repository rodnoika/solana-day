'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'

export function DepositForm() {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [amount, setAmount] = useState('')
  const [loading, setLoading] = useState(false)

  const handleDeposit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !signTransaction) return

    setLoading(true)
    try {
      // TODO: Implement deposit logic
      console.log('Depositing:', amount, 'USDC')
      alert('Deposit functionality will be implemented with Anchor integration')
    } catch (error) {
      console.error('Deposit failed:', error)
      alert('Deposit failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
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
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !amount}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading ? 'Processing...' : 'Deposit'}
        </button>
      </form>
    </div>
  )
}

