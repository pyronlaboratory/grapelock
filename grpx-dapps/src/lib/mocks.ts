import { CollectionType } from '@/schemas/collection'

export const mockCollections: CollectionType[] = [
  {
    _id: '507f1f77bcf86cd799439011',
    collectionName: 'Space Explorers',
    collectionSymbol: 'SPEX',
    collectionDescription: 'A collection of space explorers traveling through the cosmos.',
    collectionMedia:
      'https://images.pexels.com/photos/1169754/pexels-photo-1169754.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    creatorAddress: '0x1234567890abcdef1234567890abcdef12345678',
    creatorShare: 10,
    sellerFee: 500, // 5%
    maxSupply: 100,
    mintAddress: '0xabcdef1234567890abcdef1234567890abcdef12',
    metadataAddress: '0x2345678901abcdef2345678901abcdef23456789',
    masterEditionAddress: '0x3456789012abcdef3456789012abcdef34567890',
    status: 'completed',
    txSignature: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
    createdAt: '2023-01-15T12:00:00Z',
    updatedAt: '2023-01-15T14:30:00Z',
  },
  {
    _id: '507f1f77bcf86cd799439012',
    collectionName: 'Cyber Punks',
    collectionSymbol: 'CPNK',
    collectionDescription: 'A collection of cyberpunk-inspired digital art.',
    collectionMedia:
      'https://images.pexels.com/photos/2179483/pexels-photo-2179483.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    creatorAddress: '0x2345678901abcdef2345678901abcdef23456789',
    creatorShare: 15,
    sellerFee: 750, // 7.5%
    maxSupply: 50,
    mintAddress: '0xbcdef1234567890abcdef1234567890abcdef123',
    metadataAddress: '0xcdef1234567890abcdef1234567890abcdef1234',
    masterEditionAddress: '0xdef1234567890abcdef1234567890abcdef12345',
    status: 'archived',
    txSignature: '0x2345678901abcdef2345678901abcdef2345678901abcdef2345678901abcdef',
    createdAt: '2023-02-20T10:15:00Z',
    updatedAt: '2023-02-20T11:45:00Z',
  },
  {
    _id: '507f1f77bcf86cd799439013',
    collectionName: 'Abstract Dreams',
    collectionSymbol: 'ADRM',
    collectionDescription: 'Abstract art pieces representing dream sequences.',
    creatorAddress: '0x3456789012abcdef3456789012abcdef34567890',
    creatorShare: 5,
    sellerFee: 250, // 2.5%
    maxSupply: 200,
    status: 'pending',
    createdAt: '2023-03-10T09:00:00Z',
    updatedAt: '2023-03-10T09:00:00Z',
  },
  {
    _id: '507f1f77bcf86cd799439014',
    collectionName: 'Digital Landscapes',
    collectionSymbol: 'DLND',
    collectionDescription: 'Beautiful digital landscape artworks.',
    collectionMedia:
      'https://images.pexels.com/photos/3075993/pexels-photo-3075993.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2',
    creatorAddress: '0x4567890123abcdef4567890123abcdef45678901',
    creatorShare: 8,
    sellerFee: 450, // 4.5%
    maxSupply: 75,
    status: 'processing',
    createdAt: '2023-04-05T14:30:00Z',
    updatedAt: '2023-04-05T15:45:00Z',
  },
  {
    _id: '507f1f77bcf86cd799439015',
    collectionName: 'Mythical Creatures',
    collectionSymbol: 'MYTH',
    collectionDescription: 'A collection featuring mythical creatures from various cultures.',
    collectionMedia: null,
    creatorAddress: '0x5678901234abcdef5678901234abcdef56789012',
    creatorShare: 12,
    sellerFee: 600, // 6%
    maxSupply: 150,
    status: 'failed',
    errorMessage: 'Transaction rejected due to network congestion.',
    createdAt: '2023-05-12T08:45:00Z',
    updatedAt: '2023-05-12T09:30:00Z',
  },
]
