// Các kiểu dữ liệu khớp với entity phía backend (hoi-thoai.service.ts, hoi-thoai.controller.ts).
// Nếu entity thật có thêm/khác field, chỉnh lại ở đây — chỉ 1 chỗ.

export type VaiTro = 'quan_tri' | 'nhan_vien';

export interface NguoiDung {
  id: string;
  hoTen: string;
  email: string;
  vaiTro: VaiTro;
  toChucId: string;
}

export interface NhanVien {
  id: string;
  hoTen: string;
  email: string;
  vaiTro: VaiTro;
  trangThai?: 'hoat_dong' | 'khoa';
}

export interface DangNhapResponse {
  accessToken: string;
  nguoiDung: NguoiDung;
}

export interface KhachHang {
  id: string;
  maNgoai: string;
  ten?: string;
  soDienThoai?: string;
}

export type TrangThaiHoiThoai = 'moi' | 'dang_xu_ly' | 'da_xong';

export interface Nhan {
  id: string;
  ten: string;
}

export interface HoiThoai {
  id: string;
  toChucId: string;
  khachHangId: string;
  nguoiPhuTrachId?: string | null;
  trangThai: TrangThaiHoiThoai;
  ngayCapNhat: string;
  khachHang?: KhachHang;
  danhSachNhan?: Nhan[];
}

export type LoaiNguoiGui = 'khach_hang' | 'nhan_vien';
export type TrangThaiTinNhan = 'da_gui' | 'loi' | 'da_nhan';

export interface TinNhan {
  id: string;
  hoiThoaiId: string;
  nguoiGuiId?: string | null;
  loaiNguoiGui: LoaiNguoiGui;
  noiDung: string;
  trangThai: TrangThaiTinNhan;
  ngayTao: string;
}

export interface GhiChuNoiBo {
  id: string;
  hoiThoaiId: string;
  nguoiDungId: string;
  noiDung: string;
  ngayTao: string;
  nguoiDung?: NhanVien;
}

export interface MauTraLoiNhanh {
  id: string;
  toChucId: string;
  tieuDe: string;
  noiDung: string;
}

export interface HieuSuatNhanVien {
  nguoiDungId: string;
  hoTen: string;
  soHoiThoaiDaXuLy: number;
  soHoiThoaiDaXong: number;
  soTinNhanDaGui: number;
  thoiGianPhanHoiTrungBinhPhut: number | null;
}