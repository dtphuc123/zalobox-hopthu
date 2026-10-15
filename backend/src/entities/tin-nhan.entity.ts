import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
  CreateDateColumn,
} from 'typeorm';
import { HoiThoai } from './hoi-thoai.entity';
import { Nhan } from './nhan.entity';

@Entity('tin_nhan')
export class TinNhan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  hoiThoaiId: string;

  @Column({ type: 'uuid', nullable: true })
  nguoiGuiId: string | null; // null nếu người gửi là khách hàng

  @Column({ type: 'varchar', length: 50 })
  loaiNguoiGui: string; // 'khach_hang' | 'nhan_vien'

  @Column({ type: 'text' })
  noiDung: string;

  @Column({ type: 'varchar', length: 50, default: 'da_gui' })
  trangThai: string; // 'da_gui' | 'loi' | 'da_nhan'

  @Column({ type: 'varchar', length: 255, nullable: true })
  maTinNhanNenTang: string; // chống trùng

  @CreateDateColumn()
  ngayTao: Date;

  @ManyToOne(() => HoiThoai, (ht) => ht.danhSachTinNhan)
  @JoinColumn({ name: 'hoiThoaiId' })
  hoiThoai: HoiThoai;

  @ManyToMany(() => Nhan)
  @JoinTable({
    name: 'tin_nhan_nhan',
    joinColumn: { name: 'tinNhanId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'nhanId', referencedColumnName: 'id' },
  })
  danhSachNhan: Nhan[];
}