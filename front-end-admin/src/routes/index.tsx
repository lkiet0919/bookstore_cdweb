import { createFileRoute, redirect } from '@tanstack/react-router'
import { verifyAdminAccess } from '@/api/auth'
import {
  clearAccessToken,
  isAuthenticated,
  safeRedirectPath,
} from '@/lib/auth'

/**
 * Route gốc `/`: luôn điều hướng trước khi mount dashboard (tránh lỗi khi gõ localhost:5174).
 */
export const Route = createFileRoute('/')({
  beforeLoad: async ({ location }) => {
    if (!isAuthenticated()) {
      throw redirect({
        to: '/sign-in',
        replace: true,
        search: {
          redirect: safeRedirectPath(location.pathname + location.search),
        },
      })
    }

    try {
      await verifyAdminAccess()
    } catch {
      clearAccessToken()
      throw redirect({
        to: '/sign-in',
        replace: true,
        search: {
          error:
            'Tài khoản không có quyền quản trị hoặc phiên đã hết hạn. Dùng admin / admin123.',
          redirect: safeRedirectPath(location.pathname + location.search),
        },
      })
    }

    throw redirect({
      to: '/dashboard',
      replace: true,
    })
  },
})
