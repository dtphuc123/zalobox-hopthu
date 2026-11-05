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
  let repo: {
    find: jest.Mock;
    findOne: jest.Mock;
    save: jest.Mock;
    manager: { transaction: jest.Mock };
  };
  let manager: { update: jest.Mock; delete: jest.Mock };

  const admin = { id: 'a1', toChucId: 'tc1', vaiTro: 'quan_tri' };
  const nhanVien = { id: 'n1', toChucId: 'tc1', vaiTro: 'nhan_vien' };

  const dtoTao = {
    hoTen: 'Nguyễn Văn B',
    email: 'B@Congty.com',
    matKhau: '123456',
    vaiTro: 'nhan_vien',
  };

  beforeEach(() => {
    manager = { update: jest.fn(), delete: jest.fn() };
    repo = {
      find: jest.fn(),
      findOne: jest.fn(),
      save: jest.fn(),
      manager: { transaction: jest.fn(async (cb) => cb(manager)) },
    };
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

  describe('xoaNguoiDung', () => {
    it('ném ForbiddenException khi người gọi không phải admin', async () => {
      await expect(service.xoaNguoiDung(nhanVien, 'n2')).rejects.toThrow(
        ForbiddenException,
      );
      expect(repo.manager.transaction).not.toHaveBeenCalled();
    });

    it('không cho admin tự xoá chính mình', async () => {
      await expect(service.xoaNguoiDung(admin, 'a1')).rejects.toThrow(
        BadRequestException,
      );
      expect(repo.manager.transaction).not.toHaveBeenCalled();
    });

    it('ném NotFoundException khi người dùng không thuộc tổ chức của admin', async () => {
      repo.findOne.mockResolvedValue(null);

      await expect(service.xoaNguoiDung(admin, 'khac-to-chuc')).rejects.toThrow(
        NotFoundException,
      );
      expect(repo.findOne).toHaveBeenCalledWith({
        where: { id: 'khac-to-chuc', toChucId: 'tc1' },
      });
      expect(repo.manager.transaction).not.toHaveBeenCalled();
    });

    it('gỡ phân công hội thoại, xoá ghi chú rồi xoá người dùng', async () => {
      repo.findOne.mockResolvedValue({ id: 'n1', toChucId: 'tc1' });

      const ketQua = await service.xoaNguoiDung(admin, 'n1');

      expect(ketQua).toEqual({ daXoa: true });
      expect(manager.update).toHaveBeenCalledWith(
        expect.anything(),
        { nguoiPhuTrachId: 'n1' },
        { nguoiPhuTrachId: null },
      );
      expect(manager.delete).toHaveBeenCalledWith(expect.anything(), { nguoiDungId: 'n1' });
      expect(manager.delete).toHaveBeenLastCalledWith(NguoiDung, { id: 'n1' });
    });
  });
});
