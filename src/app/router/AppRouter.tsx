import { Navigate, Route, Routes } from 'react-router-dom'
import { AdminRoute } from '@/app/guards/AdminRoute'
import { GuestOnlyRoute } from '@/app/guards/GuestOnlyRoute'
import { ProtectedRoute } from '@/app/guards/ProtectedRoute'
import { AdminLayout } from '@/app/layouts/AdminLayout'
import { AuthLayout } from '@/app/layouts/AuthLayout'
import { MainLayout } from '@/app/layouts/MainLayout'
import { AdminAuditLogsPage } from '@/pages/admin/AdminAuditLogsPage'
import { AdminBrandsPage } from '@/pages/admin/AdminBrandsPage'
import { AdminCatalogImportPage } from '@/pages/admin/AdminCatalogImportPage'
import { AdminCatalogQualityPage } from '@/pages/admin/AdminCatalogQualityPage'
import { AdminDashboardPage } from '@/pages/admin/AdminDashboardPage'
import { AdminDuplicatesPage } from '@/pages/admin/AdminDuplicatesPage'
import { AdminIntegrationsPage } from '@/pages/admin/AdminIntegrationsPage'
import { AdminJobsPage } from '@/pages/admin/AdminJobsPage'
import { AdminNotesPage } from '@/pages/admin/AdminNotesPage'
import { AdminPerfumesPage } from '@/pages/admin/AdminPerfumesPage'
import { AdminReviewsPage } from '@/pages/admin/AdminReviewsPage'
import { AdminSeasonsPage } from '@/pages/admin/AdminSeasonsPage'
import { AdminTypesPage } from '@/pages/admin/AdminTypesPage'
import { AnalyticsPage } from '@/pages/AnalyticsPage'
import { BarcodeSearchPage } from '@/pages/BarcodeSearchPage'
import { BlindComparisonPage } from '@/pages/BlindComparisonPage'
import { CatalogPage } from '@/pages/CatalogPage'
import { CollectionDetailsPage } from '@/pages/CollectionDetailsPage'
import { CollectionsPage } from '@/pages/CollectionsPage'
import { ComparePage } from '@/pages/ComparePage'
import { FavoritesPage } from '@/pages/FavoritesPage'
import { GiftMatchPage } from '@/pages/GiftMatchPage'
import { GiftMatchResultsPage } from '@/pages/GiftMatchResultsPage'
import { HistoryPage } from '@/pages/HistoryPage'
import { HomePage } from '@/pages/HomePage'
import { JournalPage } from '@/pages/JournalPage'
import { LoginPage } from '@/pages/LoginPage'
import { MatchPage } from '@/pages/MatchPage'
import { MyReviewsPage } from '@/pages/MyReviewsPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { NotificationsPage } from '@/pages/NotificationsPage'
import { PerfumeDetailsPage } from '@/pages/PerfumeDetailsPage'
import { PreferencesPage } from '@/pages/PreferencesPage'
import { PriceWatchesPage } from '@/pages/PriceWatchesPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { RecommendationsPage } from '@/pages/RecommendationsPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { TextMatchPage } from '@/pages/TextMatchPage'
import { WardrobePage } from '@/pages/WardrobePage'
import { WishlistPage } from '@/pages/WishlistPage'
import { ROUTES } from '@/shared/constants/routes'

export function AppRouter() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path={ROUTES.catalog} element={<CatalogPage />} />
        <Route path={ROUTES.perfumeDetails} element={<PerfumeDetailsPage />} />
        <Route path={ROUTES.compare} element={<ComparePage />} />
        <Route path={ROUTES.matchGift} element={<GiftMatchPage />} />
        <Route path={ROUTES.matchGiftResults} element={<GiftMatchResultsPage />} />
        <Route path={ROUTES.barcode} element={<BarcodeSearchPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path={ROUTES.match} element={<MatchPage />} />
          <Route path={ROUTES.matchText} element={<TextMatchPage />} />
          <Route path={ROUTES.recommendations} element={<RecommendationsPage />} />
          <Route path={ROUTES.analytics} element={<AnalyticsPage />} />
          <Route path={ROUTES.favorites} element={<FavoritesPage />} />
          <Route path={ROUTES.collections} element={<CollectionsPage />} />
          <Route path={ROUTES.collectionDetails} element={<CollectionDetailsPage />} />
          <Route path={ROUTES.journal} element={<JournalPage />} />
          <Route path={ROUTES.wardrobe} element={<WardrobePage />} />
          <Route path={ROUTES.wishlist} element={<WishlistPage />} />
          <Route path={ROUTES.blindComparison} element={<BlindComparisonPage />} />
          <Route path={ROUTES.priceWatches} element={<PriceWatchesPage />} />
          <Route path={ROUTES.profile} element={<ProfilePage />} />
          <Route path={ROUTES.preferences} element={<PreferencesPage />} />
          <Route path={ROUTES.history} element={<HistoryPage />} />
          <Route path={ROUTES.myReviews} element={<MyReviewsPage />} />
          <Route path={ROUTES.notifications} element={<NotificationsPage />} />
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>

      <Route element={<AuthLayout />}>
        <Route element={<GuestOnlyRoute />}>
          <Route path={ROUTES.login} element={<LoginPage />} />
          <Route path={ROUTES.register} element={<RegisterPage />} />
        </Route>
      </Route>

      <Route element={<AdminRoute />}>
        <Route element={<AdminLayout />}>
          <Route path={ROUTES.admin.dashboard} element={<AdminDashboardPage />} />
          <Route path={ROUTES.admin.perfumes} element={<AdminPerfumesPage />} />
          <Route path={ROUTES.admin.brands} element={<AdminBrandsPage />} />
          <Route path={ROUTES.admin.notes} element={<AdminNotesPage />} />
          <Route path={ROUTES.admin.seasons} element={<AdminSeasonsPage />} />
          <Route path={ROUTES.admin.types} element={<AdminTypesPage />} />
          <Route path={ROUTES.admin.reviews} element={<AdminReviewsPage />} />
          <Route
            path={ROUTES.admin.catalogQuality}
            element={<AdminCatalogQualityPage />}
          />
          <Route path={ROUTES.admin.duplicates} element={<AdminDuplicatesPage />} />
          <Route
            path={ROUTES.admin.catalogImport}
            element={<AdminCatalogImportPage />}
          />
          <Route path={ROUTES.admin.auditLogs} element={<AdminAuditLogsPage />} />
          <Route path={ROUTES.admin.jobs} element={<AdminJobsPage />} />
          <Route
            path={ROUTES.admin.integrations}
            element={<AdminIntegrationsPage />}
          />
          <Route
            path="/admin"
            element={<Navigate to={ROUTES.admin.dashboard} replace />}
          />
        </Route>
      </Route>
    </Routes>
  )
}
