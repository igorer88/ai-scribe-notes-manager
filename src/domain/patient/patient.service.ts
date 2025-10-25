import { Injectable } from '@nestjs/common'
import { InjectRepository } from '@nestjs/typeorm'
import { Repository } from 'typeorm'

import { CreatePatientDto } from './dto/create-patient.dto'
import { UpdatePatientDto } from './dto/update-patient.dto'
import { Patient } from './entities/patient.entity'

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(Patient)
    private patientsRepository: Repository<Patient>
  ) {}

  async create(createPatientDto: CreatePatientDto): Promise<Patient> {
    const patient = this.patientsRepository.create(createPatientDto)
    return this.patientsRepository.save(patient)
  }

  async findAll(): Promise<Patient[]> {
    return this.patientsRepository.find()
  }

  async findOne(id: string): Promise<Patient> {
    return this.patientsRepository.findOneBy({ id })
  }

  async update(
    id: string,
    updatePatientDto: UpdatePatientDto
  ): Promise<Patient> {
    await this.patientsRepository.update(id, updatePatientDto)
    return this.patientsRepository.findOneBy({ id })
  }

  async remove(id: string): Promise<void> {
    await this.patientsRepository.softDelete(id)
  }

  async recover(id: string): Promise<void> {
    await this.patientsRepository.recover({ id })
  }
}
