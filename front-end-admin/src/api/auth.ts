import { UserLoginResponseDTO } from '@/types/user'
import axiosInstance from './axios'
import API_ENDPOINTS from './endpoint'

export const login = async (
  username: string,
  password: string
): Promise<UserLoginResponseDTO> => {
  const response = await axiosInstance.post(API_ENDPOINTS.USER.LOGIN, {
    username,
    password,
  })
  return response.data
}

/** Kiểm tra token có quyền truy cập API admin */
export const verifyAdminAccess = async (): Promise<void> => {
  await axiosInstance.get(API_ENDPOINTS.CHART.GET_SUMMARY_DASHBOARD, {
    skipAuthRedirect: true,
  })
}
