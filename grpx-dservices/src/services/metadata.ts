import { uploadData } from './irys.js'
import { getApiContext } from '../lib/context.js'
export interface TokenMetadata {
  name: string
  description: string
  image: string
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
    }>
  }
  symbol?: string
}
const context = await getApiContext()

export async function prepareMetadata({
  name,
  description,
  image,
  animationUrl,
  externalUrl,
  attributes,
}: {
  name: string
  description: string
  image: string
  animationUrl?: string
  externalUrl?: string
  attributes?: TokenMetadata['attributes']
}): Promise<string> {
  const _metadata: TokenMetadata = {
    name: name,
    description: description,
    image: image,
    animation_url: animationUrl || '',
    external_url: externalUrl || '',
    attributes: attributes || [],
    properties: {
      files: [
        {
          uri: image,
          type: 'image/png',
        },
        ...(animationUrl
          ? [
              {
                uri: animationUrl,
                type: 'video/mp4',
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
