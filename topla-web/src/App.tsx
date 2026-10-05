import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthProvider'
import { AppRoutes } from '@/routes'
import { ScrollToTop } from '@/components/common/ScrollToTop'
import { Toaster, TooltipProvider } from '@/components/ui'
import { AppErrorBoundary } from '@/components/common/AppErrorBoundary'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        const status = (error as { status?: number }).status
        // Müştəri xətalarında təkrar cəhd etmirik.
        if (status && status >= 400 && status < 500) return false
        return failureCount < 2
      },
    },
    mutations: { retry: false },
  },
})

export function App() {
  return (
    <AppErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <AuthProvider>
            <TooltipProvider delayDuration={200}>
              <ScrollToTop />
              <AppRoutes />
              <Toaster />
            </TooltipProvider>
          </AuthProvider>
        </BrowserRouter>
      </QueryClientProvider>
    </AppErrorBoundary>
  )
}
