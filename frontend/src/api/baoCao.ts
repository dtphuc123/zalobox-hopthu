import { apiClient } from './client';
import type { HieuSuatNhanVien } from './types';

export async function layBaoCaoHieuSuat(
  tuNgay?: string,
  denNgay?: string,
): Promise<HieuSuatNhanVien[]> {
  const { data } = await apiClient.get<HieuSuatNhanVien[]>('/bao-cao/hieu-suat', {
    params: { tuNgay, denNgay },
  });
  return data;
}