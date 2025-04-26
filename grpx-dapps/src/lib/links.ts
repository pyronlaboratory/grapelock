import {
  ChartArea,
  FileBadge,
  LifeBuoy,
  Send,
  ServerCog,
  ShieldCheck,
  Store,
  Vote,
  Wallet,
  Warehouse,
} from 'lucide-react'

export const links = {
  navUser: {
    name: 'shadcn',
    email: 'm@example.com',
    avatar: '/avatars/shadcn.jpg',
  },
  navMain: [
    {
      title: 'Marketplace',
      url: '/marketplace',
      icon: Store,
      isActive: true,
      items: [
        {
          title: 'Collections',
          url: '/marketplace/collections',
        },
        {
          title: 'My Listings',
          url: '/marketplace/my-listings',
        },
        {
          title: 'Purchase History',
          url: '/marketplace/purchase-history',
        },
      ],
    },
    {
      title: 'Infrastructure',
      url: '/infrastructure',
      icon: ServerCog,
      items: [
        {
          title: 'Devices',
          url: '/infrastructure/devices',
        },
        {
          title: 'Nodes',
          url: '/infrastructure/nodes',
        },
        {
          title: 'Deployments',
          url: '/infrastructure/deployments',
        },
        {
          title: 'Alerts',
          url: '/infrastructure/alerts',
        },
        {
          title: 'Maintenance',
          url: '/infrastructure/maintenance',
        },
      ],
    },
    {
      title: 'Supply Chain',
      url: '/supply-chain',
      icon: Warehouse,
      items: [
        {
          title: 'Inventory',
          url: '/supply-chain/inventory',
        },
        {
          title: 'Orders',
          url: '/supply-chain/orders',
        },
        {
          title: 'Shipments',
          url: '/supply-chain/shipments',
        },
        {
          title: 'Logistics',
          url: '/supply-chain/logistics',
        },
        {
          title: 'Traceability',
          url: '/supply-chain/traceability',
        },
      ],
    },
    {
      title: 'Insights',
      url: '/reporting',
      icon: ChartArea,
      items: [
        {
          title: 'Sales Overview',
          url: '/insights/sales-overview',
        },
        {
          title: 'Supply Chain Insights',
          url: '/insights/supply-chain-insights',
        },
        {
          title: 'Marketplace & Device Metrics',
          url: '/insights/marketplace-device-metrics',
        },
        {
          title: 'Network Performance',
          url: '/insights/network-performance',
        },
      ],
    },
    {
      title: 'Earnings',
      url: '/earnings',
      icon: Wallet,
      items: [
        {
          title: 'Wallet',
          url: '/earnings/wallet',
        },
        {
          title: 'Transactions',
          url: '/earnings/transactions',
        },
        {
          title: 'Rewards',
          url: '/earnings/rewards',
        },
      ],
    },
  ],
  navSecondary: [
    {
      title: 'Support',
      url: '/support',
      icon: LifeBuoy,
    },
    {
      title: 'Feedback',
      url: '/feedback',
      icon: Send,
    },
  ],
  navProtocol: [
    {
      name: 'Proposals',
      url: '/protocol/proposals',
      icon: FileBadge,
    },
    {
      name: 'Consensus',
      url: '/protocol/consensus',
      icon: Vote,
    },
    {
      name: 'Staking',
      url: '/protocol/staking',
      icon: ShieldCheck,
    },
  ],
}
