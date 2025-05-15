'use client'

import { WalletAdapterNetwork, WalletError } from '@solana/wallet-adapter-base'
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react'
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui'
import {
  UnsafeBurnerWalletAdapter,
  SolflareWalletAdapter,
  PhantomWalletAdapter,
  LedgerWalletAdapter,
} from '@solana/wallet-adapter-wallets'
import dynamic from 'next/dynamic'
import { ReactNode, useCallback, useMemo } from 'react'
import '@solana/wallet-adapter-react-ui/styles.css'
import { clusterApiUrl } from '@solana/web3.js'
import { useCluster } from '../cluster/cluster-data-access'

export const WalletButton = dynamic(async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton, {
  ssr: false,
})

export function SolanaProvider({ children }: { children: ReactNode }) {
  const { cluster } = useCluster()
  const endpoint = useMemo(() => cluster.endpoint, [cluster])

  // ALT --

  // The network can be set to 'devnet', 'testnet', or 'mainnet-beta'.
  // const network = WalletAdapterNetwork.Testnet

  // // You can also provide a custom RPC endpoint.
  // const endpoint = useMemo(() => clusterApiUrl(network), [network])

  const onError = useCallback((error: WalletError) => {
    console.error(error)
  }, [])

  const wallets = useMemo(
    () => [
      new UnsafeBurnerWalletAdapter(),
      new SolflareWalletAdapter(),
      new PhantomWalletAdapter(),
      new LedgerWalletAdapter(),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [cluster],
  )
  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} onError={onError} autoConnect={true}>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  )
}
