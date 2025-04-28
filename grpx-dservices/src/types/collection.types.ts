import { z } from 'zod'

export const CollectionSchemaZod = z.object({
  name: z.string(),
  description: z.string(),
  imageUrl: z.string().url(),
  createdAt: z.date().optional(),
})

export type CollectionType = z.infer<typeof CollectionSchemaZod>
