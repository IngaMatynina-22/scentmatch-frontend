import type { ReactNode } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/features/auth'
import { ComparisonProvider } from '@/features/comparison'
import { FavoritesProvider } from '@/features/favorites'
import { NotificationsProvider } from '@/features/notifications'
import { ThemeProvider } from '@/features/theme'

type AppProvidersProps = {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ComparisonProvider>
            <FavoritesProvider>
              <NotificationsProvider>{children}</NotificationsProvider>
            </FavoritesProvider>
          </ComparisonProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  )
}
