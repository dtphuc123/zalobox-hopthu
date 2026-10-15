import { apiClient } from './client';
import type { Nhan } from './types';

export async function layDanhSachNhan(): Promise<Nhan[]> {
  const { data } = await apiClient.get<Nhan[]>('/nhan');
  return data;
}

export async function taoNhan(ten: string): Promise<Nhan> {
  const { data } = await apiClient.post<Nhan>('/nhan', { ten });
  return data;
}