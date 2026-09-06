import {
  ConflictException,
  Injectable,
  NotFoundException
} from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import type { User } from '@/domain/user/entities/user.entity'

import { CreatePatientDto } from './dto/create-patient.dto'
import { UpdatePatientDto } from './dto/update-patient.dto'
import { Patient } from './entities/patient.entity'

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>
  ) {}

  private async findOwnedById(id: string, userId: string): Promise<Patient> {
    const patient = await this.patientsRepository.findOneBy({
      id,
      user: { id: userId }
    })
    if (!patient) {
      throw new NotFoundException(`Patient with ID "${id}" not found`)
    }
    return patient
  }

  async create(
    createPatientDto: CreatePatientDto,
    userId: string
  ): Promise<Patient> {
    const patient = this.patientsRepository.create(createPatientDto)
    patient.user = { id: userId } as User
    return this.patientsRepository.save(patient)
  }

  async findAll(userId: string): Promise<Patient[]> {
    return this.patientsRepository.find({
      where: { user: { id: userId } }
    })
  }

  async findOne(id: string, userId: string): Promise<Patient> {
    return this.findOwnedById(id, userId)
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto,
    userId: string
  ): Promise<Patient> {
    await this.findOwnedById(id, userId)
    await this.patientsRepository.update(id, updatePatientDto)
    return this.findOwnedById(id, userId)
  }

  async remove(id: string, userId: string): Promise<void> {
    await this.findOwnedById(id, userId)
    await this.patientsRepository.softDelete(id)
  }

  async recover(id: string, userId: string): Promise<void> {
    const patient = await this.patientsRepository.findOne({
      where: { id, user: { id: userId } },
      withDeleted: true
    })
    if (!patient) {
      throw new NotFoundException(`Patient with ID "${id}" not found`)
    }
    if (patient.deletedAt === null) {
      throw new ConflictException(`Patient with ID "${id}" is not deleted`)
    }
    await this.patientsRepository.recover({ id })
  }
}
