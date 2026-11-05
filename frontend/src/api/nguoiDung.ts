import { apiClient } from './client';
import type { NhanVien } from './types';

export async function layDanhSachNhanVien(): Promise<NhanVien[]> {
  const { data } = await apiClient.get<NhanVien[]>('/nguoi-dung');
  return data;
}

export interface TaoNguoiDungInput {
  hoTen: string;
  email: string;
  matKhau: string;
  vaiTro: 'quan_tri' | 'nhan_vien';
}

export interface CapNhatNguoiDungInput {
  vaiTro?: 'quan_tri' | 'nhan_vien';
  trangThai?: 'hoat_dong' | 'khoa';
  matKhauMoi?: string;
}

export async function taoNguoiDung(input: TaoNguoiDungInput): Promise<NhanVien> {
  const { data } = await apiClient.post<NhanVien>('/nguoi-dung', input);
  return data;
}

export async function capNhatNguoiDung(
  id: string,
  input: CapNhatNguoiDungInput,
): Promise<NhanVien> {
  const { data } = await apiClient.patch<NhanVien>(`/nguoi-dung/${id}`, input);
  return data;
}

export async function xoaNguoiDung(id: string): Promise<void> {
  await apiClient.delete(`/nguoi-dung/${id}`);
}
