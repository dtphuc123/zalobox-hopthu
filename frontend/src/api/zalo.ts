import { apiClient } from './client';

export type TrangThaiZalo =
  | 'hoat_dong'
  | 'cho_quet_qr'
  | 'dang_ket_noi'
  | 'ngat_ket_noi'
  | 'loi';

export interface ThongTinZalo {
  trangThai: TrangThaiZalo;
  maQr: string | null; // base64, không có tiền tố data:
  idTaiKhoanZalo: string | null;
}

export async function layTrangThaiZalo(): Promise<ThongTinZalo> {
  const { data } = await apiClient.get<ThongTinZalo>('/zalo/trang-thai');
  return data;
}

export async function doiTaiKhoanZalo(): Promise<void> {
  await apiClient.post('/zalo/doi-tai-khoan');
}
