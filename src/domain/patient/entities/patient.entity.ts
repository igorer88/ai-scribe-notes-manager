import { Exclude } from 'class-transformer'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Check
} from 'typeorm'

import type { Note } from '@/domain/note/entities/note.entity'

@Entity('patients')
@Check('CHK_Patient_DateOfBirth', '"dateOfBirth" <= CURRENT_DATE')
export class Patient {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 255, nullable: false })
  name: string

  @Column({ type: 'date', nullable: true })
  dateOfBirth: Date

  @OneToMany('Note', 'patient')
  notes: Note[]

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date | null
}
