import { useLayoutEffect } from 'react'
import { QueryClient } from '@tanstack/react-query'
import {
  createRootRouteWithContext,
  Outlet,
  useRouterState,
} from '@tanstack/react-router'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'
import { Toaster } from '@/components/ui/sonner'
import { NavigationProgress } from '@/components/navigation-progress'
import {
  isAuthenticated,
  isPublicRoute,
  safeRedirectPath,
} from '@/lib/auth'
import GeneralError from '@/features/errors/general-error'
import NotFoundError from '@/features/errors/not-found-error'

function AuthRouteGuard() {
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const search = useRouterState({ select: (s) => s.location.searchStr })

  useLayoutEffect(() => {
    if (isPublicRoute(pathname)) {
      return
    }

    if (!isAuthenticated()) {
      const redirect = encodeURIComponent(
        safeRedirectPath(pathname + search)
      )
      window.location.replace(`/sign-in?redirect=${redirect}`)
    }
  }, [pathname, search])

  return null
}

function RootLayout() {
  return (
    <>
      <AuthRouteGuard />
      <NavigationProgress />
      <Outlet />
      <Toaster duration={50000} />
      {import.meta.env.MODE === 'development' && (
        <>
          <ReactQueryDevtools buttonPosition='bottom-left' />
          <TanStackRouterDevtools position='bottom-right' />
        </>
      )}
    </>
  )
}

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootLayout,
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
})
