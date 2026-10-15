import { apiClient } from './client';
import type { GhiChuNoiBo, HoiThoai, TinNhan } from './types';

export async function layDanhSachHoiThoai(): Promise<HoiThoai[]> {
  const { data } = await apiClient.get<HoiThoai[]>('/hoi-thoai');
  return data;
}

export async function layLichSuTinNhan(hoiThoaiId: string): Promise<TinNhan[]> {
  const { data } = await apiClient.get<TinNhan[]>(
    `/hoi-thoai/${hoiThoaiId}/tin-nhan`,
  );
  return data;
}

export async function guiTinNhan(
  hoiThoaiId: string,
  noiDung: string,
): Promise<TinNhan> {
  const { data } = await apiClient.post<TinNhan>(
    `/hoi-thoai/${hoiThoaiId}/tin-nhan`,
    { noiDung },
  );
  return data;
}

export async function ganNguoiPhuTrach(
  hoiThoaiId: string,
  nguoiPhuTrachId: string,
): Promise<HoiThoai> {
  const { data } = await apiClient.patch<HoiThoai>(
    `/hoi-thoai/${hoiThoaiId}/nguoi-phu-trach`,
    { nguoiPhuTrachId },
  );
  return data;
}

export async function doiTrangThai(
  hoiThoaiId: string,
  trangThai: string,
): Promise<HoiThoai> {
  const { data } = await apiClient.patch<HoiThoai>(
    `/hoi-thoai/${hoiThoaiId}/trang-thai`,
    { trangThai },
  );
  return data;
}

export async function ganNhan(
  hoiThoaiId: string,
  nhanId: string,
): Promise<HoiThoai> {
  const { data } = await apiClient.post<HoiThoai>(
    `/hoi-thoai/${hoiThoaiId}/nhan`,
    { nhanId },
  );
  return data;
}

export async function goNhan(
  hoiThoaiId: string,
  nhanId: string,
): Promise<HoiThoai> {
  const { data } = await apiClient.delete<HoiThoai>(
    `/hoi-thoai/${hoiThoaiId}/nhan/${nhanId}`,
  );
  return data;
}

export async function layDanhSachGhiChu(
  hoiThoaiId: string,
): Promise<GhiChuNoiBo[]> {
  const { data } = await apiClient.get<GhiChuNoiBo[]>(
    `/hoi-thoai/${hoiThoaiId}/ghi-chu`,
  );
  return data;
}

export async function themGhiChu(
  hoiThoaiId: string,
  noiDung: string,
): Promise<GhiChuNoiBo> {
  const { data } = await apiClient.post<GhiChuNoiBo>(
    `/hoi-thoai/${hoiThoaiId}/ghi-chu`,
    { noiDung },
  );
  return data;
}