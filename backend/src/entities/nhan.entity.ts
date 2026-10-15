import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('nhan')
export class Nhan {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  toChucId: string;

  @Column({ type: 'varchar', length: 100 })
  ten: string;
}