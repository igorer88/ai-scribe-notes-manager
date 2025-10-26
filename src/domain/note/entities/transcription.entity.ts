import { Exclude } from 'class-transformer'
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm'

import type { Note } from './note.entity'

export interface TranscriptionSegment {
  id: number
  start: number
  end: number
  text: string
  confidence?: number
}

@Entity('transcriptions')
export class Transcription {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'text' })
  text: string

  @Column({ type: 'jsonb', nullable: true })
  segments: TranscriptionSegment[]

  @Column({ type: 'jsonb', nullable: true })
  structuredData: Record<string, unknown>

  @Column({ type: 'varchar', length: 10, nullable: true })
  language: string

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, unknown>

  @OneToOne('Note', 'transcription')
  @JoinColumn()
  note: Note

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date | null
}
