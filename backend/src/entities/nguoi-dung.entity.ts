import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  CreateDateColumn,
} from 'typeorm';
import { ToChuc } from './to-chuc.entity';
import { HoiThoai } from './hoi-thoai.entity';
import { GhiChuNoiBo } from './ghi-chu-noi-bo.entity';

@Entity('nguoi_dung')
export class NguoiDung {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  toChucId: string;

  @Column({ type: 'varchar', length: 255 })
  hoTen: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 255 })
  matKhauMaHoa: string;

  @Column({ type: 'varchar', length: 50, default: 'nhan_vien' })
  vaiTro: string; // 'quan_tri' | 'nhan_vien'

  @Column({ type: 'varchar', length: 50, default: 'hoat_dong' })
  trangThai: string;

  @CreateDateColumn()
  ngayTao: Date;

  @ManyToOne(() => ToChuc, (tc) => tc.danhSachNguoiDung, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'toChucId' })
  toChuc: ToChuc;

  @OneToMany(() => HoiThoai, (ht) => ht.nguoiPhuTrach)
  danhSachHoiThoai: HoiThoai[];

  @OneToMany(() => GhiChuNoiBo, (gc) => gc.nguoiDung)
  danhSachGhiChu: GhiChuNoiBo[];
}