import { apiClient } from './client';
import type { DangNhapResponse } from './types';

export async function dangNhap(
  email: string,
  matKhau: string,
): Promise<DangNhapResponse> {
  const { data } = await apiClient.post<DangNhapResponse>('/auth/dang-nhap', {
    email,
    matKhau,
  });
  return data;
}