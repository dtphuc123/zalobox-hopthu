import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { NguoiDungService } from './nguoi-dung.service';
import { NguoiDung } from '../entities';

jest.mock('bcrypt');

describe('NguoiDungService', () => {
  let service: NguoiDungService;
  let repo: { find: jest.Mock; findOne: jest.Mock; save: jest.Mock };

  const admin = { id: 'a1', toChucId: 'tc1', vaiTro: 'quan_tri' };
  const nhanVien = { id: 'n1', toChucId: 'tc1', vaiTro: 'nhan_vien' };

  const dtoTao = {
    hoTen: 'Nguyễn Văn B',
    email: 'B@Congty.com',
    matKhau: '123456',
    vaiTro: 'nhan_vien',
  };

  beforeEach(() => {
    repo = { find: jest.fn(), findOne: jest.fn(), save: jest.fn() };
    service = new NguoiDungService(repo as any);
    jest.clearAllMocks();
    (bcrypt.hash as jest.Mock).mockResolvedValue('hash-gia-lap');
  });

  describe('taoNguoiDung', () => {
    it('ném ForbiddenException khi người gọi không phải admin', async () => {
      await expect(service.taoNguoiDung(nhanVien, dtoTao)).rejects.toThrow(
        ForbiddenException,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('ném ConflictException khi email đã tồn tại', async () => {
      repo.findOne.mockResolvedValue({ id: 'x' });

      await expect(service.taoNguoiDung(admin, dtoTao)).rejects.toThrow(
        ConflictException,
      );
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('tạo người dùng cùng tổ chức với admin, mã hoá mật khẩu và không trả mật khẩu', async () => {
      repo.findOne.mockResolvedValue(null);
      repo.save.mockImplementation(async (d) => ({ id: 'moi', ...d }));

      const ketQua = await service.taoNguoiDung(admin, dtoTao);

      expect(bcrypt.hash).toHaveBeenCalledWith('123456', 10);
      expect(repo.save).toHaveBeenCalledWith(
        expect.objectContaining({
          toChucId: 'tc1',
          email: 'b@congty.com',
          matKhauMaHoa: 'hash-gia-lap',
          vaiTro: 'nhan_vien',
        }),
      );
      expect(ketQua).not.toHaveProperty('matKhauMaHoa');
      expect(ketQua.email).toBe('b@congty.com');
    });
  });

  describe('capNhatNguoiDung', () => {
    const nguoiKhac = (): NguoiDung =>
      ({
        id: 'n1',
        toChucId: 'tc1',
        hoTen: 'B',
        email: 'b@congty.com',
        matKhauMaHoa: 'cu',
        vaiTro: 'nhan_vien',
        trangThai: 'hoat_dong',
      }) as NguoiDung;

    it('ném ForbiddenException khi người gọi không phải admin', async () => {
      await expect(
        service.capNhatNguoiDung(nhanVien, 'n1', { vaiTro: 'quan_tri' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('ném NotFoundException khi người dùng không thuộc tổ chức của admin', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(
        service.capNhatNguoiDung(admin, 'khac-to-chuc', { vaiTro: 'quan_tri' }),
      ).rejects.toThrow(NotFoundException);
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'khac-to-chuc', toChucId: 'tc1' },
      });
    });

    it('không cho admin tự khoá hoặc tự hạ quyền chính mình', async () => {
      repo.findOne.mockResolvedValue({ ...nguoiKhac(), id: 'a1', vaiTro: 'quan_tri' });

      await expect(
        service.capNhatNguoiDung(admin, 'a1', { trangThai: 'khoa' }),
      ).rejects.toThrow(BadRequestException);
      await expect(
        service.capNhatNguoiDung(admin, 'a1', { vaiTro: 'nhan_vien' }),
      ).rejects.toThrow(BadRequestException);
      expect(repo.save).not.toHaveBeenCalled();
    });

    it('đổi vai trò, khoá tài khoản và đặt lại mật khẩu của người khác', async () => {
      repo.findOne.mockResolvedValue(nguoiKhac());
      repo.save.mockImplementation(async (d) => d);

      const ketQua = await service.capNhatNguoiDung(admin, 'n1', {
        vaiTro: 'quan_tri',
        trangThai: 'khoa',
        matKhauMoi: 'matkhau-moi',
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('matkhau-moi', 10);
      expect(ketQua.vaiTro).toBe('quan_tri');
      expect(ketQua.trangThai).toBe('khoa');
      expect(ketQua).not.toHaveProperty('matKhauMaHoa');
    });
  });
});
