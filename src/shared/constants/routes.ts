export const ROUTES = {
  home: '/',
  catalog: '/catalog',
  perfumeDetails: '/perfumes/:id',
  compare: '/compare',
  login: '/login',
  register: '/register',
  match: '/match',
  matchText: '/match/text',
  matchGift: '/match/gift',
  recommendations: '/recommendations',
  analytics: '/analytics',
  favorites: '/favorites',
  collections: '/collections',
  collectionDetails: '/collections/:id',
  journal: '/journal',
  wardrobe: '/wardrobe',
  wishlist: '/wishlist',
  blindComparison: '/blind-comparison',
  barcode: '/barcode',
  priceWatches: '/price-watches',
  profile: '/profile',
  preferences: '/preferences',
  history: '/history',
  myReviews: '/my-reviews',
  notifications: '/notifications',
  admin: {
    dashboard: '/admin/dashboard',
    perfumes: '/admin/perfumes',
    brands: '/admin/brands',
    notes: '/admin/notes',
    seasons: '/admin/seasons',
    types: '/admin/types',
    reviews: '/admin/reviews',
    catalogQuality: '/admin/catalog-quality',
    duplicates: '/admin/duplicates',
    catalogImport: '/admin/catalog-import',
    auditLogs: '/admin/audit-logs',
    jobs: '/admin/jobs',
    integrations: '/admin/integrations',
  },
  notFound: '*',
} as const

export function perfumeDetailsPath(id: string | number): string {
  return `/perfumes/${id}`
}

export function collectionPath(id: string | number): string {
  return `/collections/${id}`
}

export function loginPathWithReturn(returnTo: string): string {
  const params = new URLSearchParams({ returnUrl: returnTo })
  return `${ROUTES.login}?${params.toString()}`
}
