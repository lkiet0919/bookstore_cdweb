import { createFileRoute, redirect } from '@tanstack/react-router'
import { z } from 'zod'
import { isAuthenticated, safeRedirectPath } from '@/lib/auth'
import SignIn from '@/features/auth/sign-in'

const signInSearchSchema = z.object({
  redirect: z.string().optional(),
  error: z.string().optional(),
  // URL ?logout=1 có thể parse thành number → dùng union tránh lỗi 500
  logout: z.union([z.string(), z.number(), z.boolean()]).optional(),
})

export const Route = createFileRoute('/(auth)/sign-in')({
  validateSearch: signInSearchSchema,
  beforeLoad: ({ search }) => {
    // Vừa đăng xuất — không tự nhảy lại dashboard
    if (search.logout != null && search.logout !== '') {
      return
    }
    if (isAuthenticated()) {
      throw redirect({ to: safeRedirectPath(search.redirect || '/dashboard') })
    }
  },
  component: SignIn,
})
