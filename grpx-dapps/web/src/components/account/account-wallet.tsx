'use client'
import React, { useState } from 'react'
import { Copy, ExternalLink } from 'lucide-react'
import { ellipsify } from '@wallet-ui/react'
import { AccountBalance, AccountButtons, ModalQR } from './account-ui'

import { Badge } from '../ui/badge'
import { ExplorerLink } from '../cluster/cluster-ui'
import { PublicKey } from '@solana/web3.js'

function AccountWallet({ connected, address }: { connected: boolean; address: PublicKey }) {
  const [copySuccess, setCopySuccess] = useState(false)
  const handleCopyAddress = () => {
    if (!address) return

    navigator.clipboard.writeText(address.toBase58()).then(() => {
      setCopySuccess(true)
      setTimeout(() => setCopySuccess(false), 2000)
    })
  }

  return (
    <>
      <div className="text-left">
        <AccountButtons address={address} />
      </div>
      <div className="bg-white dark:bg-sidebar-primary rounded-xl shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="px-8 py-4 border-b">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between">
            <div className="mb-4 sm:mb-0">
              <h2 className="text-sm font-medium text-gray-500 dark:text-primary">Available Balance</h2>
              <div className="flex items-end mt-1">
                {address && <AccountBalance address={address} />}
                <span className="ml-2 text-sm font-semibold text-green-400 mb-1">SOL</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Badge
                variant={connected ? 'default' : 'outline'}
                className="px-3 py-1 text-xs dark:bg-white dark:border-none dark:text-primary-foreground"
              >
                <span className={`mr-1.5 h-2 w-2 rounded-full ${connected ? 'bg-green-500' : 'bg-gray-400'}`} />
                {connected ? 'Wallet Connected' : 'Wallet Disconnected'}
              </Badge>
            </div>
          </div>
        </div>

        <div className="px-8 py-4 bg-yellow-50 dark:bg-black">
          <div className="flex flex-wrap gap-y-8 items-center justify-between">
            <div className="flex items-center">
              <span className="text-sm font-medium text-gray-900 dark:text-primary font-mono">
                {ellipsify(address?.toBase58() || '', 10)}
              </span>
            </div>
            <div className="gap-2 flex">
              <button className="cursor-pointer inline-flex items-center px-3 py-1.5 border  text-xs font-medium rounded-md text-gray-700 dark:text-gray-400 bg-white dark:bg-muted/40 border-none hover:bg-gray-50 focus:outline-none duration-200">
                <ExplorerLink
                  className="font-sans"
                  path={`account/${address}`}
                  label={
                    <div className="flex ">
                      <ExternalLink size={14} className="mr-1" />
                      Explorer
                    </div>
                  }
                />
              </button>
              <button
                onClick={handleCopyAddress}
                className="cursor-pointer ml-2 inline-flex items-center px-3 py-1.5 border  text-xs font-medium rounded-md text-gray-700 dark:text-gray-400 bg-white dark:bg-muted/40 border-none hover:bg-gray-50 focus:outline-none duration-200"
              >
                <Copy size={14} className="mr-1" />
                {copySuccess ? 'Copied!' : 'Copy'}
              </button>
              <ModalQR address={address} />
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default AccountWallet
