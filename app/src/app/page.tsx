'use client'

import { WalletContextProvider } from '@/components/WalletProvider'
import { VaultDashboard } from '@/components/VaultDashboard'

export default function Home() {
  return (
    <WalletContextProvider>
      <main className="min-h-screen bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">
              DCA Vault
            </h1>
            <p className="text-xl text-gray-300">
              Dollar Cost Averaging on Solana
            </p>
          </div>
          
          <VaultDashboard />
        </div>
      </main>
    </WalletContextProvider>
  )
}

