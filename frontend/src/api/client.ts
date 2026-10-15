import axios from 'axios';

// Khi dev: Vite proxy /api -> backend (xem vite.config.ts).
// Khi build production, đổi baseURL theo domain backend thật.
export const apiClient = axios.create({
  baseURL: '/api',
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      // Token hết hạn / không hợp lệ -> đăng xuất, quay lại trang đăng nhập.
      localStorage.removeItem('token');
      localStorage.removeItem('nguoiDung');
      if (window.location.pathname !== '/dang-nhap') {
        window.location.href = '/dang-nhap';
      }
    }
    return Promise.reject(error);
  },
);
