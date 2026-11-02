import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { HoiThoaiService, NguoiDungHienTai } from './hoi-thoai.service';
import { HoiThoai } from '../entities/hoi-thoai.entity';

describe('HoiThoaiService', () => {
  let service: HoiThoaiService;
  let hoiThoaiRepo: { find: jest.Mock; findOne: jest.Mock };
  let tinNhanRepo: { find: jest.Mock };

  const admin: NguoiDungHienTai = {
    id: 'admin-1',
    toChucId: 'tc-1',
    vaiTro: 'quan_tri',
  };
  const nhanVien: NguoiDungHienTai = {
    id: 'nv-1',
    toChucId: 'tc-1',
    vaiTro: 'nhan_vien',
  };

  const hoiThoaiCuaNhanVien = {
    id: 'ht-1',
    toChucId: 'tc-1',
    nguoiPhuTrachId: 'nv-1',
    trangThai: 'dang_xu_ly',
  } as HoiThoai;

  beforeEach(() => {
    hoiThoaiRepo = { find: jest.fn(), findOne: jest.fn() };
    tinNhanRepo = { find: jest.fn() };
    service = new HoiThoaiService(
      hoiThoaiRepo as any,
      tinNhanRepo as any,
      {} as any, // khachHangRepo - không dùng trong các test này
      {} as any, // ghiChuRepo
      {} as any, // nhanRepo
      {} as any, // zaloListenerService
    );
  });

  describe('layDanhSach — lọc theo quyền', () => {
    it('admin xem được toàn bộ hội thoại trong tổ chức, không lọc theo người phụ trách', async () => {
      hoiThoaiRepo.find.mockResolvedValue([]);

      await service.layDanhSach(admin);

      expect(hoiThoaiRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { toChucId: admin.toChucId },
        }),
      );
    });

    it('nhân viên chỉ xem được hội thoại mình phụ trách', async () => {
      hoiThoaiRepo.find.mockResolvedValue([]);

      await service.layDanhSach(nhanVien);

      expect(hoiThoaiRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { toChucId: nhanVien.toChucId, nguoiPhuTrachId: nhanVien.id },
        }),
      );
    });
  });

  describe('layLichSuTinNhan — kiểm tra quyền truy cập hội thoại', () => {
    it('ném NotFoundException nếu hội thoại không thuộc tổ chức của người dùng', async () => {
      hoiThoaiRepo.findOne.mockResolvedValue(null);

      await expect(
        service.layLichSuTinNhan('ht-khong-ton-tai', nhanVien),
      ).rejects.toThrow(NotFoundException);
    });

    it('ném ForbiddenException nếu nhân viên không phải người phụ trách hội thoại', async () => {
      hoiThoaiRepo.findOne.mockResolvedValue({
        ...hoiThoaiCuaNhanVien,
        nguoiPhuTrachId: 'nv-khac',
      });

      await expect(
        service.layLichSuTinNhan('ht-1', nhanVien),
      ).rejects.toThrow(ForbiddenException);
    });

    it('nhân viên phụ trách xem được lịch sử tin nhắn của chính hội thoại mình', async () => {
      hoiThoaiRepo.findOne.mockResolvedValue(hoiThoaiCuaNhanVien);
      tinNhanRepo.find.mockResolvedValue([{ id: 'tn-1' }]);

      const ketQua = await service.layLichSuTinNhan('ht-1', nhanVien);

      expect(ketQua).toEqual([{ id: 'tn-1' }]);
    });

    it('admin xem được lịch sử tin nhắn của bất kỳ hội thoại nào trong tổ chức, dù không phải người phụ trách', async () => {
      hoiThoaiRepo.findOne.mockResolvedValue(hoiThoaiCuaNhanVien);
      tinNhanRepo.find.mockResolvedValue([]);

      await expect(
        service.layLichSuTinNhan('ht-1', admin),
      ).resolves.not.toThrow();
    });
  });

  describe('ganNguoiPhuTrach — chỉ admin được gán', () => {
    it('ném ForbiddenException nếu người gọi không phải admin', async () => {
      await expect(
        service.ganNguoiPhuTrach('ht-1', 'nv-2', nhanVien),
      ).rejects.toThrow(ForbiddenException);
      // Không được chạm tới DB nếu đã chặn quyền từ đầu
      expect(hoiThoaiRepo.findOne).not.toHaveBeenCalled();
    });
  });
});
