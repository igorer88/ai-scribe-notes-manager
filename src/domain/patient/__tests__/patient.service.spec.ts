import { ConflictException, NotFoundException } from '@nestjs/common'

import { Patient } from '../entities/patient.entity'
import { PatientService } from '../patient.service'

describe('PatientService', () => {
  let service: PatientService

  const mockPatient = {
    id: 'patient-1',
    name: 'Audrey Williamson',
    user: { id: 'user-1' }
  } as Patient

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    softDelete: jest.fn(),
    recover: jest.fn()
  }

  beforeEach(() => {
    jest.clearAllMocks()
    service = new PatientService(mockRepository as never)
  })

  it('should be defined', () => {
    expect(service).toBeDefined()
  })

  describe('findAll', () => {
    it('should only return patients owned by the user', async () => {
      mockRepository.find.mockResolvedValue([mockPatient])

      const result = await service.findAll('user-1')

      expect(mockRepository.find).toHaveBeenCalledWith({
        where: { user: { id: 'user-1' } }
      })
      expect(result).toEqual([mockPatient])
    })
  })

  describe('create', () => {
    it('should assign the creating user as owner', async () => {
      const dto = { name: 'Audrey Williamson' }
      mockRepository.create.mockReturnValue({ ...dto })
      mockRepository.save.mockImplementation(async p => p)

      const result = await service.create(dto, 'user-1')

      expect(mockRepository.create).toHaveBeenCalledWith(dto)
      expect(result.user).toEqual({ id: 'user-1' })
    })
  })

  describe('findOne', () => {
    it('should return an owned patient', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockPatient)

      const result = await service.findOne('patient-1', 'user-1')

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: 'patient-1',
        user: { id: 'user-1' }
      })
      expect(result).toEqual(mockPatient)
    })

    it('should throw NotFoundException for another user patient', async () => {
      mockRepository.findOneBy.mockResolvedValue(null)

      await expect(service.findOne('patient-1', 'user-2')).rejects.toThrow(
        NotFoundException
      )
    })
  })

  describe('update', () => {
    it('should not update a patient owned by another user', async () => {
      mockRepository.findOneBy.mockResolvedValue(null)

      await expect(
        service.update('patient-1', { name: 'Hacked' }, 'user-2')
      ).rejects.toThrow(NotFoundException)

      expect(mockRepository.update).not.toHaveBeenCalled()
    })

    it('should update an owned patient', async () => {
      mockRepository.findOneBy.mockResolvedValueOnce(mockPatient)
      mockRepository.update.mockResolvedValue(undefined)
      mockRepository.findOneBy.mockResolvedValueOnce(mockPatient)

      const result = await service.update(
        'patient-1',
        { name: 'Renamed' },
        'user-1'
      )

      expect(mockRepository.update).toHaveBeenCalledWith('patient-1', {
        name: 'Renamed'
      })
      expect(result).toEqual(mockPatient)
    })
  })

  describe('remove', () => {
    it('should not delete a patient owned by another user', async () => {
      mockRepository.findOneBy.mockResolvedValue(null)

      await expect(service.remove('patient-1', 'user-2')).rejects.toThrow(
        NotFoundException
      )
      expect(mockRepository.softDelete).not.toHaveBeenCalled()
    })

    it('should soft delete an owned patient', async () => {
      mockRepository.findOneBy.mockResolvedValue(mockPatient)
      mockRepository.softDelete.mockResolvedValue(undefined)

      await service.remove('patient-1', 'user-1')

      expect(mockRepository.softDelete).toHaveBeenCalledWith('patient-1')
    })
  })

  describe('recover', () => {
    it('should not recover a patient owned by another user', async () => {
      mockRepository.findOne.mockResolvedValue(null)

      await expect(service.recover('patient-1', 'user-2')).rejects.toThrow(
        NotFoundException
      )
      expect(mockRepository.recover).not.toHaveBeenCalled()
    })

    it('should throw ConflictException if the patient is not deleted', async () => {
      mockRepository.findOne.mockResolvedValue({
        ...mockPatient,
        deletedAt: null
      })

      await expect(service.recover('patient-1', 'user-1')).rejects.toThrow(
        ConflictException
      )
    })
  })
})
