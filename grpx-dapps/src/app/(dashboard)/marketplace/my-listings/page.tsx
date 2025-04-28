/// app/marketplace/browse/page.tsx
'use client'

import { CreateCollectionForm } from '@/components/nft/nft-data-access'
import { Button } from '@/components/ui/button'
import { Dialog, DialogClose, DialogTrigger } from '@/components/ui/dialog'
import { DialogContent } from '@radix-ui/react-dialog'
import { Flame, X } from 'lucide-react'
import { motion } from 'framer-motion'

export default function MyListingsPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold">My Listings</h1>

      <Dialog>
        <div className="min-w-[350px] max-w-md md:max-w-lg w-auto mx-auto flex flex-col items-center justify-center px-8 py-8 relative md:absolute md:left-1/2 top-10 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2 bg-gradient-to-r from-background via-primary-foreground to-accent rounded-2xl h-[500px]">
          <div className="p-4 bg-background rounded-full mb-6">
            <Flame className="h-12 w-12 text-yellow-600" />
          </div>

          <h2 className="text-2xl font-bold text-muted-foreground text-center mb-3">Register Mint</h2>

          <p className="text-sm text-center text-muted-foreground tracking-wide max-w-xs mb-16">
            Create a master edition to start publishing on the marketplace
          </p>

          <DialogTrigger asChild>
            <Button
              size="lg"
              className="w-full h-12 -bottom-15 relative overflow-hidden bg-background hover:bg-green-500 text-yellow-600 hover:text-black transition-colors cursor-pointer group"
            >
              <span className="relative z-10">Start Creating</span>
              <span className="absolute top-0 left-[-75%] w-[50%] h-full bg-gradient-to-r from-transparent via-white/60 to-transparent transform skew-x-[-20deg] shine-effect" />
            </Button>
          </DialogTrigger>
        </div>

        <DialogContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 30 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 30 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="fixed inset-0 bg-background/80 z-40"
          >
            <div className="max-w-sm md:max-w-2xl mx-auto relative md:absolute md:left-1/2 top-10 md:top-1/2 md:-translate-x-1/2 md:-translate-y-1/2">
              <DialogClose asChild>
                <button
                  className="cursor-pointer absolute top-4 right-4 p-2 rounded-full hover:bg-muted transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </DialogClose>
              <CreateCollectionForm />
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
