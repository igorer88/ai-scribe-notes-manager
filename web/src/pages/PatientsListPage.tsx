
import { useEffect, useState } from 'react'
import { usePatientStore } from '@/stores/patientStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PatientDetailsModal } from '@/components/PatientDetailsModal'
import { Users, Calendar } from 'lucide-react'
import type { Patient } from '@/lib/types'

export function PatientsListPage() {
  const { patients, isLoading, error, fetchPatients } = usePatientStore()
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchPatients()
  }, [fetchPatients])

  const handleViewDetails = (patient: Patient) => {
    setSelectedPatient(patient)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedPatient(null)
  }

  if (isLoading) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center">Loading patients...</div>
      </main>
    )
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8">
        <div className="text-center text-red-500">Error: {error}</div>
      </main>
    )
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <section className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-8 w-8" />
          Patients
        </h1>
        <p className="text-muted-foreground">
          Manage and view all patients in the system.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {patients.map((patient) => (
          <PatientCard
            key={patient.id}
            patient={patient}
            onViewDetails={handleViewDetails}
          />
        ))}
      </section>

      {patients.length === 0 && (
        <section className="text-center py-12">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold mb-2">No patients found</h2>
          <p className="text-muted-foreground">
            Patients will appear here once they are added to the system.
          </p>
        </section>
      )}

      <PatientDetailsModal
        patient={selectedPatient}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </main>
  )
}

interface PatientCardProps {
  patient: Patient
  onViewDetails: (patient: Patient) => void
}

function PatientCard({ patient, onViewDetails }: PatientCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <CardTitle className="text-lg">{patient.name}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
          <Calendar className="h-4 w-4" />
          <span>Born: {formatDate(patient.dateOfBirth)}</span>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="w-full"
          onClick={() => onViewDetails(patient)}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  )
}
