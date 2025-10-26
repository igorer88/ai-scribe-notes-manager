import { Exclude } from 'class-transformer'
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  OneToMany,
  Unique
} from 'typeorm'

import type { Note } from '@/domain/note/entities/note.entity'

@Entity('users')
@Unique('UQ_User_Username', ['username'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column({ type: 'varchar', length: 50, nullable: false })
  username: string

  @Exclude()
  @Column({ type: 'varchar', length: 255, nullable: false })
  password: string

  @OneToMany('Note', 'user')
  notes: Note[]

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date

  @UpdateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date

  @Exclude()
  @DeleteDateColumn({ type: 'timestamp', nullable: true })
  deletedAt: Date | null
}
