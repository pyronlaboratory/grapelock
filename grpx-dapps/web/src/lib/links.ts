import {
  ArrowRightLeft,
  ChartArea,
  ClipboardList,
  FileBadge,
  IdCard,
  LifeBuoy,
  PackagePlus,
  Scroll,
  Send,
  ServerCog,
  ShieldCheck,
  Store,
  User2,
  UserCheck2,
  UserCircle2,
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
          title: 'Asset Manager',
          url: '/marketplace/asset-manager',
        },
        {
          title: 'Trade History',
          url: '/marketplace/history',
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
      title: 'Wallet',
      url: '/wallet',
      icon: Wallet,
      items: [
        {
          title: 'Earnings',
          url: '/wallet/earnings',
        },
        {
          title: 'Transactions',
          url: '/wallet/transactions',
        },
        {
          title: 'Rewards',
          url: '/wallet/rewards',
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
  navItems: [
    {
      name: 'Marketplace',
      url: '/marketplace',
      icon: Store,
    },
    {
      name: 'Asset Manager',
      url: '/asset-manager',
      icon: PackagePlus,
    },
    // {
    //   name: 'Infrastructure',
    //   url: '/infrastructure',
    //   icon: ServerCog,
    // },
    {
      name: 'Orders',
      url: '/orders',
      icon: ClipboardList,
    },
    {
      name: 'Account Center',
      url: '/account-center',
      icon: UserCheck2,
    },
  ],
}
