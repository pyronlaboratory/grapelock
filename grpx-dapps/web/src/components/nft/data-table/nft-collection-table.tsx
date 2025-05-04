import { formatDate, getCollectionIdenticon } from '@/lib/utils'
import { CollectionType } from '@/schemas/collection'
import { CollectionStatusBadge } from '../nft-ui'
import { MoreHorizontal } from 'lucide-react'

interface CollectionTableProps {
  collections: CollectionType[]
  onViewCollection: (collection: CollectionType) => void
}

export function CollectionTable({ collections, onViewCollection }: CollectionTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg shadow border border-accent my-8">
      <table className="min-w-full divide-y divide-accent">
        <thead className="bg-primary-foreground">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Collection
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Created
            </th>

            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            ></th>
          </tr>
        </thead>
        <tbody className="bg-accent-background divide-y divide-accent">
          {collections.map((collection) => (
            <tr
              key={collection._id}
              className="hover:bg-primary-foreground transition duration-150 ease-in-out cursor-pointer"
              onClick={() => onViewCollection(collection)}
            >
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10">
                    <img
                      className="h-10 w-10 rounded-full object-cover"
                      src={collection.collectionMedia || getCollectionIdenticon(collection._id)}
                      alt={collection.collectionName}
                    />
                  </div>
                  <div className="ml-4">
                    <div>
                      <div className="text-sm font-medium text-neutral-400 text-pretty">
                        {collection.collectionName}
                      </div>
                      <div className="text-sm text-neutral-600 font-semibold">{collection.collectionSymbol}</div>
                    </div>
                  </div>
                </div>
              </td>

              <td className="px-6 py-4 whitespace-nowrap text-neutral-400">
                <CollectionStatusBadge status={collection.status} />
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-neutral-400 text-sm text-pretty">
                {formatDate(collection.createdAt)}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <div className="flex space-x-2">
                  <button className="text-gray-500 hover:text-gray-700 transition">
                    <MoreHorizontal size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
