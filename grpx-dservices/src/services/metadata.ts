import { uploadData } from './irys.js'
import { getApiContext } from '../lib/context.js'
export interface TokenMetadata {
  name: string
  description: string
  image: string
  category: 'image'
  animation_url: string
  external_url: string
  attributes: Array<{
    trait_type: string
    value: string | number
  }>
  properties: {
    files: Array<{
      uri: string
      type: string
      cdn: boolean
    }>
  }
  symbol?: string
}
const context = await getApiContext()

export async function prepareMetadata({
  name,
  symbol,
  description,
  image,
  animationUrl,
  externalUrl,
  attributes,
}: {
  name: string
  symbol: string
  description: string
  image: string
  animationUrl?: string
  externalUrl?: string
  attributes?: TokenMetadata['attributes']
}): Promise<string> {
  const _metadata: TokenMetadata = {
    name: name,
    symbol: symbol,
    description: description,
    image: image,
    category: 'image',
    animation_url: animationUrl || '',
    external_url: externalUrl || '',
    attributes: attributes || [],
    properties: {
      files: [
        {
          uri: image,
          type: 'image/png',
          cdn: true,
        },
        ...(animationUrl
          ? [
              {
                uri: animationUrl,
                type: 'video/mp4',
                cdn: true,
              },
            ]
          : []),
      ],
    },
  }

  try {
    const receipt = await uploadData(JSON.stringify(_metadata))
    return receipt ? `https://gateway.irys.xyz/${receipt?.id}` : ''
  } catch (error: any) {
    context.log.error('Error preparing metadata:', error)
    throw new Error('Failed to prepare metadata')
  }
}
