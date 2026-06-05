import Cookies from 'js-cookie'

/** Token riêng cho admin — không dùng chung `access_token` với frontend user */
export const ADMIN_ACCESS_TOKEN_KEY = 'admin_access_token'
const LEGACY_COOKIE_KEY = 'thisisjustarandomstring'
const USER_ACCESS_TOKEN_KEY = 'access_token'

export const PUBLIC_ROUTES = [
  '/sign-in',
  '/sign-in-2',
  '/sign-up',
  '/forgot-password',
  '/otp',
  '/401',
  '/403',
  '/404',
  '/500',
  '/503',
] as const

export function isPublicRoute(pathname: string): boolean {
  const path = pathname.replace(/\/$/, '') || '/'
  return PUBLIC_ROUTES.some(
    (route) => path === route || path.startsWith(`${route}/`)
  )
}

/** Xóa token cookie cũ từ template Shadcn */
export function clearLegacyAuthStorage(): void {
  Cookies.remove(LEGACY_COOKIE_KEY)
}

function normalizeToken(raw: string | null): string {
  if (!raw) return ''

  const trimmed = raw.trim()
  if (trimmed.startsWith('"') && trimmed.endsWith('"')) {
    try {
      const parsed = JSON.parse(trimmed) as unknown
      return typeof parsed === 'string' ? parsed : trimmed
    } catch {
      return trimmed
    }
  }

  return trimmed
}

export function getAccessToken(): string {
  return normalizeToken(localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY))
}

export function setAccessToken(token: string): void {
  localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, token)
}

export function clearAccessToken(): void {
  localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY)
  clearLegacyAuthStorage()
}

export function isAuthenticated(): boolean {
  return getAccessToken().length > 0
}

/** Chỉ cho phép redirect nội bộ sau đăng nhập */
export function safeRedirectPath(path: string | undefined): string {
  if (!path || path === '/') return '/dashboard'

  try {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      const url = new URL(path)
      return (url.pathname + url.search) || '/dashboard'
    }
  } catch {
    return '/dashboard'
  }

  return path.startsWith('/') ? path : '/dashboard'
}

/** Đăng xuất admin — gọi trực tiếp từ nút Log out */
export function logoutAdmin(): void {
  clearAccessToken()
  window.location.assign('/sign-in?logout=1')
}

export function forceSignOut(message?: string): void {
  clearAccessToken()
  const params = new URLSearchParams()
  params.set('logout', '1')
  if (message) {
    params.set('error', message)
  }
  window.location.replace(`/sign-in?${params.toString()}`)
}

/**
 * Chặn ngay trước khi load React (đồng bộ).
 * Trả về false nếu đang chuyển sang /sign-in.
 */
export function runSyncAuthGuard(): boolean {
  const { pathname, search } = window.location

  if (isPublicRoute(pathname)) {
    return true
  }

  if (!isAuthenticated()) {
    const redirect = encodeURIComponent(pathname + search)
    window.location.replace(`/sign-in?redirect=${redirect}`)
    return false
  }

  return true
}

/** Kiểm tra token user (chỉ để hiển thị cảnh báo, không dùng cho API admin) */
export function hasUserFrontendToken(): boolean {
  return normalizeToken(localStorage.getItem(USER_ACCESS_TOKEN_KEY)).length > 0
}
