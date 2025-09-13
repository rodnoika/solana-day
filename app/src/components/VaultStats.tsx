'use client'

interface VaultStatsProps {
  vaultData: any
}

export function VaultStats({ vaultData }: VaultStatsProps) {
  // Mock data for now
  const mockData = {
    totalUsdc: '10,000',
    totalTarget: '5.2',
    totalShares: '10,000',
    sharePrice: '1.0',
    nextExecution: '2 hours',
    period: '24 hours'
  }

  return (
    <div className="bg-gray-800 rounded-lg p-6">
      <h3 className="text-xl font-bold text-white mb-4">Vault Statistics</h3>
      
      <div className="space-y-4">
        <div className="flex justify-between">
          <span className="text-gray-300">Total USDC:</span>
          <span className="text-white font-medium">{mockData.totalUsdc}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Total wSOL:</span>
          <span className="text-white font-medium">{mockData.totalTarget}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Total Shares:</span>
          <span className="text-white font-medium">{mockData.totalShares}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Share Price:</span>
          <span className="text-white font-medium">${mockData.sharePrice}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">Next Execution:</span>
          <span className="text-white font-medium">{mockData.nextExecution}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-gray-300">DCA Period:</span>
          <span className="text-white font-medium">{mockData.period}</span>
        </div>
      </div>
    </div>
  )
}

