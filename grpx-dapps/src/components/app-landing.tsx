import AppLogo from './app-logo'
import { WalletButton } from './solana/solana-provider'
import { DefaultContainer } from './nft/nft-ui'

export default function AppLandingPage() {
  return (
    <>
      <div className="flex justify-between px-2 py-5">
        <AppLogo />
        <WalletButton />
      </div>
      <div className="container mx-auto py-8 text-center">
        <DefaultContainer />
      </div>
    </>
  )
}
