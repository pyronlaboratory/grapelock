'use client'

import { useQuery } from '@tanstack/react-query'
import { collectionsResponseSchema } from '@/schemas/collection'
import api from '@/lib/api'

export const mockNFTs: { [collectionId: string]: any } = {
  // NFT[] } = {

  '507f1f77bcf86cd799439011': [
    {
      _id: '607f1f77bcf86cd799439021',
      name: 'Space Explorer #1',
      symbol: 'SPEX',
      description: 'A brave explorer of the outer rim.',
      image:
        'https://images.pexels.com/photos/2156881/pexels-photo-2156881.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      attributes: [
        { trait_type: 'Background', value: 'Deep Space' },
        { trait_type: 'Suit Color', value: 'Silver' },
        { trait_type: 'Helmet', value: 'Classic' },
      ],
      collectionId: '507f1f77bcf86cd799439011',
      mintAddress: '0xfedcba9876543210fedcba9876543210fedcba98',
      status: 'VERIFIED',
      createdAt: '2023-01-16T10:00:00Z',
      updatedAt: '2023-01-16T12:30:00Z',
    },
    {
      _id: '607f1f77bcf86cd799439022',
      name: 'Space Explorer #2',
      symbol: 'SPEX',
      description: 'A seasoned navigator through asteroid fields.',
      image:
        'https://images.pexels.com/photos/1274260/pexels-photo-1274260.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      attributes: [
        { trait_type: 'Background', value: 'Nebula' },
        { trait_type: 'Suit Color', value: 'Gold' },
        { trait_type: 'Helmet', value: 'Advanced' },
      ],
      collectionId: '507f1f77bcf86cd799439011',
      mintAddress: '0xedcba9876543210fedcba9876543210fedcba987',
      status: 'VERIFIED',
      createdAt: '2023-01-17T14:15:00Z',
      updatedAt: '2023-01-17T16:45:00Z',
    },
  ],
  '507f1f77bcf86cd799439012': [
    {
      _id: '607f1f77bcf86cd799439023',
      name: 'Cyber Punk #1',
      symbol: 'CPNK',
      description: 'A digital rebel in the cyberpunk universe.',
      image:
        'https://images.pexels.com/photos/1970139/pexels-photo-1970139.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
      attributes: [
        { trait_type: 'Background', value: 'Neon City' },
        { trait_type: 'Hair', value: 'Mohawk' },
        { trait_type: 'Cybernetic Enhancements', value: 'Eye Implant' },
      ],
      collectionId: '507f1f77bcf86cd799439012',
      mintAddress: '0xdcba9876543210fedcba9876543210fedcba9876',
      status: 'MINTED',
      createdAt: '2023-02-21T09:30:00Z',
      updatedAt: '2023-02-21T11:00:00Z',
    },
  ],
}

export function useGetCollections(publicKey: string) {
  return useQuery({
    queryKey: ['get-collections', publicKey],
    queryFn: async () => {
      const response = await api(`collections/${publicKey}`)
      const parsed = collectionsResponseSchema.parse(response)
      return parsed.data
    },
    enabled: !!publicKey,
    staleTime: 60_000,
  })
}
