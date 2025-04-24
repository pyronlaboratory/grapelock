'use client'

import { useState } from 'react'
import { redirect } from 'next/navigation'
import { WalletButton } from '../solana/solana-provider'
import { useWalletUi } from '@wallet-ui/react'

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Info, LockKeyhole, Wallet, DatabaseZap } from 'lucide-react'

export default function AccountListFeature() {
  const { account } = useWalletUi()
  const [showMore, setShowMore] = useState(false)

  if (account) {
    return redirect(`/account/${account.address.toString()}`)
  }

  return (
    <div className="hero py-[64px]">
      <div className="hero-content text-center">
        <Card className="max-w-md w-full mx-auto">
          <CardHeader className="text-center">
            <div className="mx-auto mb-2 bg-muted w-12 h-12 rounded-full flex items-center justify-center">
              <Wallet className="h-6 w-6" />
            </div>
            <CardTitle className="text-xl">Connect Your Wallet</CardTitle>
            <CardDescription>
              Connect your wallet to access your dashboard and manage your crypto assets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-3 text-start">
              <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                <div className="flex-shrink-0 w-6 h-6 flex items-center justify-start">
                  <LockKeyhole className="h-5 w-5 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="font-medium text-sm">Secure Connection</h3>
                  <p className="text-xs text-muted-foreground">Your private keys never leave your device</p>
                </div>
              </div>

              {showMore && (
                <>
                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      <Info className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">What to Expect</h3>
                      <p className="text-xs text-muted-foreground">
                        Your wallet will ask you to approve the connection
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="800px"
                        height="800px"
                        viewBox="0 0 20 20"
                        fill="none"
                      >
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M7.08398 5.22265C7.17671 5.08355 7.33282 5 7.5 5H18.5C18.6844 5 18.8538 5.10149 18.9408 5.26407C19.0278 5.42665 19.0183 5.62392 18.916 5.77735L16.916 8.77735C16.8233 8.91645 16.6672 9 16.5 9H5.5C5.3156 9 5.14617 8.89851 5.05916 8.73593C4.97215 8.57335 4.98169 8.37608 5.08398 8.22265L7.08398 5.22265ZM7.76759 6L6.43426 8H16.2324L17.5657 6H7.76759Z"
                          fill="#47495F"
                        />
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M7.08398 15.2226C7.17671 15.0836 7.33282 15 7.5 15H18.5C18.6844 15 18.8538 15.1015 18.9408 15.2641C19.0278 15.4267 19.0183 15.6239 18.916 15.7774L16.916 18.7774C16.8233 18.9164 16.6672 19 16.5 19H5.5C5.3156 19 5.14617 18.8985 5.05916 18.7359C4.97215 18.5734 4.98169 18.3761 5.08398 18.2226L7.08398 15.2226ZM7.76759 16L6.43426 18H16.2324L17.5657 16H7.76759Z"
                          fill="#47495F"
                        />
                        <path
                          fill-rule="evenodd"
                          clip-rule="evenodd"
                          d="M7.08398 13.7774C7.17671 13.9164 7.33282 14 7.5 14H18.5C18.6844 14 18.8538 13.8985 18.9408 13.7359C19.0278 13.5733 19.0183 13.3761 18.916 13.2226L16.916 10.2226C16.8233 10.0836 16.6672 10 16.5 10H5.5C5.3156 10 5.14617 10.1015 5.05916 10.2641C4.97215 10.4267 4.98169 10.6239 5.08398 10.7774L7.08398 13.7774ZM7.76759 13L6.43426 11H16.2324L17.5657 13H7.76759Z"
                          fill="#47495F"
                        />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">About Solana</h3>
                      <p className="text-xs text-muted-foreground">
                        Solana is a high-performance blockchain supporting fast transactions with low fees
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      <DatabaseZap className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Solana Benefits</h3>
                      <ul className="text-xs text-muted-foreground list-disc pl-4 mt-1 space-y-1">
                        <li>Transactions under 400ms</li>
                        <li>Costs less than $0.01 per transaction</li>
                        <li>Energy efficient Proof of Stake</li>
                        <li>Supports 65,000 transactions per second</li>
                      </ul>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-3 rounded-lg border bg-card">
                    <div className="flex-shrink-0 w-6 h-6 flex items-center justify-center">
                      <Wallet className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <h3 className="font-medium text-sm">Compatible Wallets</h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Popular Solana wallets include Phantom, Solflare, Backpack, and Glow. Make sure your wallet is
                        up-to-date for the best experience.
                      </p>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Your existing Select Wallet button goes here */}
            <div className="pt-2">
              <WalletButton />
            </div>

            <Button
              variant="link"
              size="sm"
              className="w-full text-xs text-muted-foreground"
              onClick={() => setShowMore(!showMore)}
            >
              {showMore ? 'Show less' : 'Learn more about wallet connections'}
            </Button>
          </CardContent>
          <CardFooter className="flex justify-between text-xs text-muted-foreground border-t pt-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger className="underline cursor-help">What is a wallet?</TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    A crypto wallet is a digital tool that allows you to store, send, and receive cryptocurrencies
                    securely.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <span>
              Need help?{' '}
              <a href="#" className="underline">
                Contact support
              </a>
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
