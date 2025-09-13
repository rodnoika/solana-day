'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'

export function WithdrawForm() {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [shares, setShares] = useState('')
  const [loading, setLoading] = useState(false)

  const handleWithdraw = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!publicKey || !signTransaction) return

    setLoading(true)
    try {
      // TODO: Implement withdraw logic
      console.log('Withdrawing:', shares, 'shares')
      alert('Withdraw functionality will be implemented with Anchor integration')
    } catch (error) {
      console.error('Withdraw failed:', error)
      alert('Withdraw failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-lg rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Withdraw Shares</h3>
      <form onSubmit={handleWithdraw} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Shares Amount
          </label>
          <input
            type="number"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            placeholder="Enter shares amount"
            className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading || !shares}
          className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-medium py-2 px-4 rounded-md transition-colors"
        >
          {loading ? 'Processing...' : 'Withdraw'}
        </button>
      </form>
    </div>
  )
}

