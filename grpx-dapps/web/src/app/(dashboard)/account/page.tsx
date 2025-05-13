// app/marketplace/browse/page.tsx
'use client'
import { AccountBalance } from '@/components/account/account-ui'
import { Card } from '@/components/ui/card'
import { useWallet } from '@solana/wallet-adapter-react'

// Add these individual components to accounts-ui
export default function MyWalletPage() {
  const { publicKey, wallet, wallets } = useWallet()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">My Wallet</h1>
      <div className="flex gap-4 w-full justify-between my-4 text-center">
        <Card className="w-full">
          Total Balance
          <AccountBalance address={publicKey!} />
        </Card>
        <Card className="w-full">Wallet Address </Card>
      </div>
      <div className="w-full text-center">
        <Card>Table</Card>
      </div>
    </div>
  )
}
