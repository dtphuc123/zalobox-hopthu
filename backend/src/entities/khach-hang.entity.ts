import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { HoiThoai } from './hoi-thoai.entity';

@Entity('khach_hang')
export class KhachHang {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  toChucId: string;

  @Column({ type: 'uuid' })
  taiKhoanNenTangId: string;

  @Column({ type: 'varchar', length: 255 })
  maNgoai: string; // threadId Zalo

  @Column({ type: 'varchar', length: 255, nullable: true })
  ten: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  soDienThoai: string;

  @CreateDateColumn()
  ngayTao: Date;

  @OneToMany(() => HoiThoai, (ht) => ht.khachHang)
  danhSachHoiThoai: HoiThoai[];
}