import axios from 'axios'
import { toast } from 'sonner'
import { forceSignOut, getAccessToken } from '@/lib/auth'
import { useAuthStore } from '@/stores/authStore'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    } else {
      delete config.headers.Authorization
    }
    return config
  },
  (error) => Promise.reject(error)
)

function isAdminApiUrl(url?: string): boolean {
  return Boolean(url?.includes('/admin/api'))
}

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Không kết nối được máy chủ. Kiểm tra backend đang chạy.')
      return Promise.reject(error)
    }

    const status = error.response.status
    const requestUrl = error.config?.url as string | undefined
    const skipRedirect = error.config?.skipAuthRedirect

    if (status === 401) {
      useAuthStore.getState().auth.reset()
      forceSignOut('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.')
      return Promise.reject(error)
    }

    if (status === 403 && isAdminApiUrl(requestUrl) && !skipRedirect) {
      useAuthStore.getState().auth.reset()
      forceSignOut(
        'Tài khoản không có quyền quản trị. Dùng tài khoản admin (admin / admin123).'
      )
      return Promise.reject(error)
    }

    if (status === 403) {
      toast.error('Bạn không có quyền truy cập')
    }

    return Promise.reject(error)
  }
)

export default axiosInstance
