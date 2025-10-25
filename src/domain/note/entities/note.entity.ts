import { Exclude } from 'class-transformer'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne
} from 'typeorm'

import type { Patient } from '@/domain/patient/entities/patient.entity'
import type { User } from '@/domain/user/entities/user.entity'

@Entity('notes')
export class Note {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @ManyToOne('User', 'notes')
  user: User

  @ManyToOne('Patient', 'notes')
  patient: Patient

  @Column({ type: 'text', nullable: true })
  content: string

  @Column({ type: 'varchar', length: 255, nullable: true })
  audioFilePath: string

  @Column({ type: 'boolean', default: false })
  isVoiceNote: boolean

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date | null
}
