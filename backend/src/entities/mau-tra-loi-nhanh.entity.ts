import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('mau_tra_loi_nhanh')
export class MauTraLoiNhanh {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  toChucId: string;

  @Column({ type: 'varchar', length: 255 })
  tieuDe: string;

  @Column({ type: 'text' })
  noiDung: string;
}