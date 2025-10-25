import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Patch,
  Delete
} from '@nestjs/common'

import { CreatePatientDto } from './dto/create-patient.dto'
import { UpdatePatientDto } from './dto/update-patient.dto'
import { Patient } from './entities/patient.entity'
import { PatientService } from './patient.service'

@Controller('patients')
export class PatientController {
  constructor(private readonly patientService: PatientService) {}

  @Post()
  create(@Body() createPatientDto: CreatePatientDto): Promise<Patient> {
    return this.patientService.create(createPatientDto)
  }

  @Get()
  findAll(): Promise<Patient[]> {
    return this.patientService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Patient> {
    return this.patientService.findOne(id)
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto
  ): Promise<Patient> {
    return this.patientService.update(id, updatePatientDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string): Promise<void> {
    return this.patientService.remove(id)
  }

  @Patch(':id/recover')
  recover(@Param('id') id: string): Promise<void> {
    return this.patientService.recover(id)
  }
}
