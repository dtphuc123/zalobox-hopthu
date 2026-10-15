import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { NguoiDung } from './nguoi-dung.entity';

@Entity('to_chuc')
export class ToChuc {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  ten: string;

  @Column({ type: 'varchar', length: 50, default: 'hoat_dong' })
  trangThai: string; // 'hoat_dong' | 'tam_khoa'

  @CreateDateColumn()
  ngayTao: Date;

  @OneToMany(() => NguoiDung, (nd) => nd.toChuc)
  danhSachNguoiDung: NguoiDung[];
}