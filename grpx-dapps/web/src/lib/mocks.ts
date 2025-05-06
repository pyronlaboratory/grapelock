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
    sellerFee: 600, // 6%
    maxSupply: 150,
    status: 'failed',
    errorMessage: 'Transaction rejected due to network congestion.',
    createdAt: '2023-05-12T08:45:00Z',
    updatedAt: '2023-05-12T09:30:00Z',
  },
]

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
