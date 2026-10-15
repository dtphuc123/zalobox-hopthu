import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { NguoiDung } from './nguoi-dung.entity';
import { KhachHang } from './khach-hang.entity';
import { TinNhan } from './tin-nhan.entity';
import { GhiChuNoiBo } from './ghi-chu-noi-bo.entity';
import { Nhan } from './nhan.entity';

@Entity('hoi_thoai')
export class HoiThoai {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  toChucId: string;

  @Column({ type: 'uuid' })
  khachHangId: string;

  @Column({ type: 'uuid' })
  taiKhoanNenTangId: string;

  @Column({ type: 'uuid', nullable: true })
  nguoiPhuTrachId: string | null;

  @Column({ type: 'varchar', length: 50, default: 'moi' })
  trangThai: string; // 'moi' | 'dang_xu_ly' | 'da_xong'

  @CreateDateColumn()
  ngayTao: Date;

  @UpdateDateColumn()
  ngayCapNhat: Date;

  @ManyToOne(() => KhachHang, (kh) => kh.danhSachHoiThoai)
  @JoinColumn({ name: 'khachHangId' })
  khachHang: KhachHang;

  @ManyToOne(() => NguoiDung, (nd) => nd.danhSachHoiThoai, { nullable: true })
  @JoinColumn({ name: 'nguoiPhuTrachId' })
  nguoiPhuTrach: NguoiDung | null;

  @OneToMany(() => TinNhan, (tn) => tn.hoiThoai)
  danhSachTinNhan: TinNhan[];

  @OneToMany(() => GhiChuNoiBo, (gc) => gc.hoiThoai)
  danhSachGhiChu: GhiChuNoiBo[];

  @ManyToMany(() => Nhan)
  @JoinTable({
    name: 'hoi_thoai_nhan',
    joinColumn: { name: 'hoiThoaiId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'nhanId', referencedColumnName: 'id' },
  })
  danhSachNhan: Nhan[];
}