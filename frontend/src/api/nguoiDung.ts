import { apiClient } from './client';
import type { NhanVien } from './types';

export async function layDanhSachNhanVien(): Promise<NhanVien[]> {
  const { data } = await apiClient.get<NhanVien[]>('/nguoi-dung');
  return data;
}