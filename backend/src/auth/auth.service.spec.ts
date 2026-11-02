import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { NguoiDung } from '../entities';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;
  let nguoiDungRepo: { findOne: jest.Mock };
  let jwtService: { sign: jest.Mock };

  const nguoiDungMau: NguoiDung = {
    id: 'u1',
    toChucId: 'tc1',
    hoTen: 'Nguyễn Văn A',
    email: 'a@congty.com',
    matKhauMaHoa: 'hash-trong-db',
    vaiTro: 'nhan_vien',
  } as NguoiDung;

  beforeEach(() => {
    nguoiDungRepo = { findOne: jest.fn() };
    jwtService = { sign: jest.fn().mockReturnValue('token-gia-lap') };
    service = new AuthService(nguoiDungRepo as any, jwtService as any);
    jest.clearAllMocks();
  });

  describe('dangNhap', () => {
    it('ném UnauthorizedException khi không tìm thấy email', async () => {
      nguoiDungRepo.findOne.mockResolvedValue(null);

      await expect(
        service.dangNhap({ email: 'khong-ton-tai@congty.com', matKhau: '123456' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('ném UnauthorizedException khi sai mật khẩu', async () => {
      nguoiDungRepo.findOne.mockResolvedValue(nguoiDungMau);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.dangNhap({ email: nguoiDungMau.email, matKhau: 'sai-mat-khau' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('trả về accessToken và thông tin người dùng (không kèm mật khẩu) khi đăng nhập đúng', async () => {
      nguoiDungRepo.findOne.mockResolvedValue(nguoiDungMau);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const ketQua = await service.dangNhap({
        email: nguoiDungMau.email,
        matKhau: 'mat-khau-dung',
      });

      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: nguoiDungMau.id,
        toChucId: nguoiDungMau.toChucId,
        vaiTro: nguoiDungMau.vaiTro,
      });
      expect(ketQua).toEqual({
        accessToken: 'token-gia-lap',
        nguoiDung: {
          id: nguoiDungMau.id,
          hoTen: nguoiDungMau.hoTen,
          email: nguoiDungMau.email,
          vaiTro: nguoiDungMau.vaiTro,
        },
      });
      // Không được rò rỉ mật khẩu đã mã hóa ra ngoài response
      expect((ketQua.nguoiDung as any).matKhauMaHoa).toBeUndefined();
    });
  });

  describe('baoMatMatKhau', () => {
    it('gọi bcrypt.hash với độ khó (salt rounds) = 10', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hash-moi');

      const ketQua = await service.baoMatMatKhau('matkhau123');

      expect(bcrypt.hash).toHaveBeenCalledWith('matkhau123', 10);
      expect(ketQua).toBe('hash-moi');
    });
  });
});
