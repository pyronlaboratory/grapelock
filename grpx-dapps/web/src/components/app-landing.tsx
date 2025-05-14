'use client'
import AppLogo from './app-logo'
import { WalletButton } from './solana/solana-provider'
import { Button } from './ui/button'
import { useWallet } from '@solana/wallet-adapter-react'
import { LucideArrowRight } from 'lucide-react'

export default function AppLandingPage() {
  const { connect } = useWallet()
  return (
    <>
      <div className="flex justify-between px-2 py-5">
        <AppLogo />
        <WalletButton />
      </div>
      <div className="flex flex-col items-center justify-center h-[90vh] px-4 text-center">
        <div className="max-w-3xl space-y-8">
          <h1 className="text-4xl font-bold text-pretty tracking-tighter sm:text-5xl">Grapelock Exchange</h1>

          <p className="text-muted-foreground text-lg text-balance">
            A decentralized supply chain and authenticity network for fine wines. Powered by <b>Solana</b> and{' '}
            <b>Metaplex</b> ensuring transparency and trust in every bottle.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button>
              Connect Wallet <LucideArrowRight className="h-4 w-5 ml-2" />
            </Button>

            <Button variant="outline">View Source</Button>
          </div>
        </div>
      </div>
    </>
  )
}
