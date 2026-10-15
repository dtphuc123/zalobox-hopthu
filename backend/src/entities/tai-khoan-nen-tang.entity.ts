import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('tai_khoan_nen_tang')
export class TaiKhoanNenTang {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  toChucId: string;

  @Column({ type: 'varchar', length: 50, default: 'zalo' })
  loaiNenTang: string;

  @Column({ type: 'varchar', length: 255 })
  dinhDanh: string; // tên hiển thị / SĐT tài khoản Zalo

  @Column({ type: 'varchar', length: 50, default: 'ngat_ket_noi' })
  trangThai: string; // 'hoat_dong' | 'ngat_ket_noi' | 'loi'

  @CreateDateColumn()
  ngayTao: Date;
}