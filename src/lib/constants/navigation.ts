export interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  description?: string;
}

export const MAIN_NAVIGATION: NavigationItem[] = [
  { 
    label: 'Dashboard', 
    path: '/dashboard', 
    icon: 'HomeIcon',
    description: 'Overview of your business performance'
  },
  { 
    label: 'Invoices', 
    path: '/invoice-management', 
    icon: 'DocumentTextIcon',
    description: 'Manage and track your invoices'
  },
  { 
    label: 'Clients', 
    path: '/client-management', 
    icon: 'UsersIcon',
    description: 'Manage your client database'
  },
  { 
    label: 'Products', 
    path: '/product-management', 
    icon: 'ArchiveBoxIcon',
    description: 'Catalog of your services and goods'
  },
  { 
    label: 'Reports', 
    path: '/reports-analytics', 
    icon: 'ChartBarIcon',
    description: 'Financial insights and analytics'
  },
  { 
    label: 'Subscriptions', 
    path: '/dashboard/subscription', 
    icon: 'CreditCardIcon',
    description: 'Manage your plan and usage'
  },
  { 
    label: 'Settings', 
    path: '/user-profile-settings', 
    icon: 'Cog6ToothIcon',
    description: 'Configuration and profile preferences'
  },
];

export const MOBILE_QUICK_ACTIONS: NavigationItem[] = [
  {
    label: 'New Invoice',
    path: '/create-invoice',
    icon: 'PlusIcon',
    description: 'Quickly draft a new invoice'
  }
];

export const LANDING_NAVIGATION: NavigationItem[] = [
  { label: 'Home', path: '#home', icon: 'HomeIcon' },
  { label: 'Features', path: '#features', icon: 'StarIcon' },
  { label: 'How It Works', path: '#how-it-works', icon: 'LightBulbIcon' },
  { label: 'Pricing', path: '#pricing', icon: 'CurrencyDollarIcon' },
  { label: 'FAQ', path: '#faq', icon: 'QuestionMarkCircleIcon' }
];
