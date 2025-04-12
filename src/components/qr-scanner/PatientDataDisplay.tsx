
import { Button } from '@/components/ui/button';
import { UserCheck, UserX, UserPlus } from 'lucide-react';

interface Patient {
  identity_id: string;
  name: string;
  birth_date: string;
  gender: string;
  address: string;
  phone?: string;
  email?: string;
  blood_type?: string;
  allergies: string[] | [];
  age?: number;
}

interface PatientDataDisplayProps {
  patient: Patient | null;
  patientExists: boolean;
  resetScanner: () => void;
  registerVisit: () => void;
  createNewPatient: () => void;
}

const PatientDataDisplay = ({ 
  patient, 
  patientExists,
  resetScanner,
  registerVisit,
  createNewPatient 
}: PatientDataDisplayProps) => {
  if (!patient) return null;

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">Datos del Paciente</h3>
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline" onClick={resetScanner}>
            Escanear otro
          </Button>
          {patientExists ? (
            <Button 
              size="sm" 
              className="bg-medical-teal hover:bg-medical-teal/90"
              onClick={registerVisit}
            >
              <UserCheck className="mr-2 h-4 w-4" />
              Ver historial
            </Button>
          ) : (
            <Button 
              size="sm" 
              className="bg-medical-purple hover:bg-medical-purple/90"
              onClick={createNewPatient}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Registrar paciente
            </Button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">ID</p>
          <p className="font-medium">{patient.identity_id}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Nombre</p>
          <p className="font-medium">{patient.name}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
          <p className="font-medium">{patient.birth_date}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Género</p>
          <p className="font-medium">{patient.gender}</p>
        </div>
        <div className="md:col-span-2">
          <p className="text-sm text-gray-500">Dirección</p>
          <p className="font-medium">{patient.address}</p>
        </div>
      </div>
      
      {patientExists && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-2">Historial Médico</h4>
          <div className="mt-3">
            <Button
              className="bg-medical-blue hover:bg-medical-blue/90"
              onClick={registerVisit}
            >
              Ver Historial Completo
            </Button>
          </div>
        </div>
      )}
      
      {!patientExists && (
        <div className="mt-6">
          <h4 className="font-medium text-gray-700 mb-2">Registro de Paciente</h4>
          <p className="text-sm text-gray-600 italic">
            Este paciente no existe en el sistema. ¿Desea crear un nuevo registro?
          </p>
          <div className="mt-3">
            <Button variant="outline" className="mr-2" onClick={resetScanner}>
              <UserX className="mr-2 h-4 w-4" />
              No registrar
            </Button>
            <Button 
              className="bg-medical-blue hover:bg-medical-blue/90"
              onClick={createNewPatient}
            >
              Crear nuevo registro
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDataDisplay;
