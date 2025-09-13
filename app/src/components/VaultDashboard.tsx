'use client'

import { useState, useEffect } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { WalletMultiButton, WalletDisconnectButton } from '@solana/wallet-adapter-react-ui'
import { DepositForm } from './DepositForm'
import { WithdrawForm } from './WithdrawForm'
import { VaultStats } from './VaultStats'

export function VaultDashboard() {
  const { publicKey, connected } = useWallet()
  const { connection } = useConnection()
  const [vaultData, setVaultData] = useState<any>(null)

  useEffect(() => {
    if (connected && publicKey) {
      // TODO: Fetch vault data from on-chain
      console.log('Wallet connected:', publicKey.toString())
    }
  }, [connected, publicKey])

  if (!connected) {
    return (
      <div className="max-w-md mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-lg p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Connect Your Wallet
          </h2>
          <p className="text-gray-300 mb-6">
            Connect your Solana wallet to start using the DCA Vault
          </p>
          <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700" />
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-2xl font-bold text-white">
          Welcome to DCA Vault
        </h2>
        <WalletDisconnectButton className="!bg-red-600 hover:!bg-red-700" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vault Stats */}
        <div className="lg:col-span-1">
          <VaultStats vaultData={vaultData} />
        </div>

        {/* Deposit Form */}
        <div className="lg:col-span-1">
          <DepositForm />
        </div>

        {/* Withdraw Form */}
        <div className="lg:col-span-1">
          <WithdrawForm />
        </div>
      </div>
    </div>
  )
}

