import { StrictMode } from 'react'
import ReactDOM from 'react-dom/client'
import { AxiosError } from 'axios'
import {
  QueryCache,
  QueryClient,
  QueryClientProvider,
} from '@tanstack/react-query'
import { RouterProvider, createRouter } from '@tanstack/react-router'
import { toast } from 'sonner'
import {
  clearLegacyAuthStorage,
  isPublicRoute,
  runSyncAuthGuard,
} from '@/lib/auth'
import { ensureAuthBeforeApp } from '@/lib/ensure-auth'
import { useAuthStore } from '@/stores/authStore'
import { handleServerError } from '@/utils/handle-server-error'
import { FontProvider } from './context/font-context'
import { ThemeProvider } from './context/theme-context'
import './index.css'
import { routeTree } from './routeTree.gen'

clearLegacyAuthStorage()

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: (failureCount, error) => {
        if (import.meta.env.DEV) console.log({ failureCount, error })

        if (failureCount >= 0 && import.meta.env.DEV) return false
        if (failureCount > 3 && import.meta.env.PROD) return false

        return !(
          error instanceof AxiosError &&
          [401, 403].includes(error.response?.status ?? 0)
        )
      },
      refetchOnWindowFocus: import.meta.env.PROD,
      staleTime: 10 * 1000,
    },
    mutations: {
      onError: (error) => {
        handleServerError(error)

        if (error instanceof AxiosError && error.response?.status === 304) {
          toast.error('Content not modified!')
        }
      },
    },
  },
  queryCache: new QueryCache({
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast.error('Session expired!')
          useAuthStore.getState().auth.reset()
          const redirect = router.history.location.pathname
          router.navigate({
            to: '/sign-in',
            search: {
              redirect,
              error: 'Phiên đăng nhập đã hết hạn.',
            },
          })
        }
        if (
          error.response?.status === 500 &&
          !router.history.location.pathname.startsWith('/sign-in')
        ) {
          toast.error('Internal Server Error!')
          router.navigate({ to: '/500' })
        }
      }
    },
  }),
})

const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPreload: 'intent',
  defaultPreloadStaleTime: 0,
})

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

let reactRoot: ReturnType<typeof ReactDOM.createRoot> | null = null

async function initApp() {
  if (!runSyncAuthGuard()) {
    return
  }

  const pathname = window.location.pathname
  if (!isPublicRoute(pathname)) {
    await ensureAuthBeforeApp()
  }

  const rootElement = document.getElementById('root')
  if (!rootElement) {
    return
  }

  if (!reactRoot) {
    reactRoot = ReactDOM.createRoot(rootElement)
  }

  reactRoot.render(
    <StrictMode>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider defaultTheme='light' storageKey='vite-ui-theme'>
          <FontProvider>
            <RouterProvider router={router} />
          </FontProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </StrictMode>
  )
}

void initApp()
