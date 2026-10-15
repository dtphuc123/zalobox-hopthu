import { apiClient } from './client';
import type { MauTraLoiNhanh } from './types';

export async function layDanhSachMau(): Promise<MauTraLoiNhanh[]> {
  const { data } = await apiClient.get<MauTraLoiNhanh[]>('/mau-tra-loi-nhanh');
  return data;
}

export async function taoMau(
  tieuDe: string,
  noiDung: string,
): Promise<MauTraLoiNhanh> {
  const { data } = await apiClient.post<MauTraLoiNhanh>('/mau-tra-loi-nhanh', {
    tieuDe,
    noiDung,
  });
  return data;
}

export async function suaMau(
  id: string,
  tieuDe: string,
  noiDung: string,
): Promise<MauTraLoiNhanh> {
  const { data } = await apiClient.patch<MauTraLoiNhanh>(
    `/mau-tra-loi-nhanh/${id}`,
    { tieuDe, noiDung },
  );
  return data;
}

export async function xoaMau(id: string): Promise<void> {
  await apiClient.delete(`/mau-tra-loi-nhanh/${id}`);
}