// app/(dashboard)/account/page.tsx
'use client'
import { useMemo } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { PublicKey } from '@solana/web3.js'
import AccountTransactionsTable from '@/components/account/data-tables/account-transactions-table'
import AccountTokensTable from '@/components/account/data-tables/account-tokens-table'
import AccountWallet from '@/components/account/account-wallet'

export default function AccountCenterPage() {
  const { connected, publicKey } = useWallet()
  const address = useMemo(() => {
    if (!publicKey) return

    try {
      return new PublicKey(publicKey)
    } catch (e) {
      console.log(`Invalid public key`, e)
    }
  }, [publicKey])

  if (!address) return
  return (
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        <AccountWallet connected={connected} address={address} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-y-8 lg:gap-8">
          <AccountTokensTable address={address} />
          <AccountTransactionsTable address={address} />
        </div>
      </div>
    </div>
  )
}
