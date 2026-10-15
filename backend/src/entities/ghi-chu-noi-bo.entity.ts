import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { HoiThoai } from './hoi-thoai.entity';
import { NguoiDung } from './nguoi-dung.entity';

@Entity('ghi_chu_noi_bo')
export class GhiChuNoiBo {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  hoiThoaiId: string;

  @Column({ type: 'uuid' })
  nguoiDungId: string;

  @Column({ type: 'text' })
  noiDung: string;

  @CreateDateColumn()
  ngayTao: Date;

  @ManyToOne(() => HoiThoai, (ht) => ht.danhSachGhiChu)
  @JoinColumn({ name: 'hoiThoaiId' })
  hoiThoai: HoiThoai;

  @ManyToOne(() => NguoiDung, (nd) => nd.danhSachGhiChu)
  @JoinColumn({ name: 'nguoiDungId' })
  nguoiDung: NguoiDung;
}