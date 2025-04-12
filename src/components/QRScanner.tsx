
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QrCode, Camera, UserCheck, UserX, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PatientData {
  id: string;
  nombre: string;
  fechaNacimiento: string;
  edad?: number;
  genero: string;
  direccion: string;
  telefono?: string;
  email?: string;
  alergias?: string[];
  grupoSanguineo?: string;
  historiaClinica: any[];
}

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const [patientExists, setPatientExists] = useState(false);
  const [patient, setPatient] = useState<PatientData | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if camera is available
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
          setHasCamera(true);
        })
        .catch(error => {
          console.error("No se pudo acceder a la cámara", error);
          setHasCamera(false);
        });
    } else {
      setHasCamera(false);
    }
  }, []);

  const startScanning = () => {
    setScanning(true);
    
    // This is a mock function since we can't implement actual QR scanning without a library
    // In a real implementation, you would use a library like 'react-qr-reader'
    setTimeout(() => {
      // Simulating a successful scan with mock data
      const mockPatientData = {
        id: "89061223456",
        nombre: "Carlos Rodríguez",
        fechaNacimiento: "1989-06-12",
        genero: "Masculino",
        direccion: "Calle 23 #456, La Habana"
      };
      
      setResult(JSON.stringify(mockPatientData));
      setScanning(false);
      
      // Check if patient exists in local database
      const patientsDB = localStorage.getItem('patientsDB');
      if (patientsDB) {
        const patients: PatientData[] = JSON.parse(patientsDB);
        const existingPatient = patients.find(p => p.id === mockPatientData.id);
        
        if (existingPatient) {
          setPatientExists(true);
          setPatient(existingPatient);
          toast({
            title: "Paciente encontrado",
            description: "Se ha encontrado el registro del paciente en el sistema.",
          });
        } else {
          setPatientExists(false);
          // Calculate age from birth date
          const birthDate = new Date(mockPatientData.fechaNacimiento);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          // Create new patient object
          const newPatient: PatientData = {
            ...mockPatientData,
            edad: age,
            alergias: [],
            historiaClinica: []
          };
          
          setPatient(newPatient);
          toast({
            title: "Nuevo paciente",
            description: "Este paciente no existe en el sistema. Puede registrarlo ahora.",
          });
        }
      } else {
        // No patients database exists, this is the first patient
        setPatientExists(false);
        
        // Calculate age from birth date
        const birthDate = new Date(mockPatientData.fechaNacimiento);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        // Create new patient object
        const newPatient: PatientData = {
          ...mockPatientData,
          edad: age,
          alergias: [],
          historiaClinica: []
        };
        
        setPatient(newPatient);
        toast({
          title: "Nuevo paciente",
          description: "Este paciente no existe en el sistema. Puede registrarlo ahora.",
        });
      }
    }, 2000);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  const resetScanner = () => {
    setResult(null);
    setPatient(null);
    setPatientExists(false);
  };

  const registerVisit = () => {
    // Just redirect to the patient page, will create a visit there
    if (patient) {
      navigate(`/paciente/${patient.id}`);
    }
  };

  const createNewPatient = () => {
    if (!patient) return;
    
    try {
      // Get current patients database or create a new one
      const patientsDB = localStorage.getItem('patientsDB');
      let patients: PatientData[] = patientsDB ? JSON.parse(patientsDB) : [];
      
      // Add the new patient
      patients.push(patient);
      
      // Save to localStorage
      localStorage.setItem('patientsDB', JSON.stringify(patients));
      
      // Add activity log
      const activityLog = localStorage.getItem('activityLog');
      const activities = activityLog ? JSON.parse(activityLog) : [];
      activities.push({
        id: Date.now().toString(),
        user: localStorage.getItem('userName') || 'Usuario desconocido',
        action: 'Registro de paciente',
        patient: patient.nombre,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('activityLog', JSON.stringify(activities));
      
      toast({
        title: "Paciente registrado",
        description: "Se ha registrado el paciente en el sistema.",
      });
      
      // Navigate to the patient page
      navigate(`/paciente/${patient.id}`);
    } catch (error) {
      console.error("Error saving patient:", error);
      toast({
        title: "Error al registrar",
        description: "No se pudo registrar el paciente. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const processMockData = () => {
    if (!result || !patient) return null;
    
    try {
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
              <p className="font-medium">{patient.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="font-medium">{patient.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
              <p className="font-medium">{patient.fechaNacimiento}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Género</p>
              <p className="font-medium">{patient.genero}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Dirección</p>
              <p className="font-medium">{patient.direccion}</p>
            </div>
          </div>
          
          {patientExists ? (
            <div className="mt-6">
              <h4 className="font-medium text-gray-700 mb-2">Historial Médico</h4>
              {patient.historiaClinica && patient.historiaClinica.length > 0 ? (
                <div className="bg-gray-50 p-3 rounded-md">
                  <p className="text-sm">
                    <span className="font-medium">Última visita:</span>{' '}
                    {new Date(patient.historiaClinica[patient.historiaClinica.length - 1].date).toLocaleDateString()}
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Diagnóstico:</span>{' '}
                    {patient.historiaClinica[patient.historiaClinica.length - 1].diagnosis}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-gray-600 italic">No se encontraron registros médicos previos.</p>
              )}
              <div className="mt-3">
                <Button
                  className="bg-medical-blue hover:bg-medical-blue/90"
                  onClick={registerVisit}
                >
                  Ver Historial Completo
                </Button>
              </div>
            </div>
          ) : (
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
    } catch (error) {
      console.error("Error processing QR data:", error);
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Error al procesar los datos del QR</p>
          <Button size="sm" variant="outline" onClick={resetScanner} className="mt-2">
            Intentar nuevamente
          </Button>
        </div>
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center p-3 bg-medical-blue/10 rounded-full mb-3">
          <QrCode size={28} className="text-medical-blue" />
        </div>
        <h2 className="text-2xl font-bold text-gray-800">Escanear Carnet de Identidad</h2>
        <p className="text-gray-600 mt-1">Escanee el código QR del carnet para acceder a los datos del paciente</p>
      </div>

      {!hasCamera && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-yellow-700">
                No se pudo acceder a la cámara. Por favor, asegúrese de que su dispositivo tiene acceso a una cámara y que ha concedido los permisos necesarios.
              </p>
            </div>
          </div>
        </div>
      )}

      {!result ? (
        <div className="bg-gray-100 aspect-video rounded-lg flex flex-col items-center justify-center mb-4">
          {scanning ? (
            <>
              <div className="h-24 w-24 border-4 border-medical-blue border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-gray-600">Escaneando...</p>
            </>
          ) : (
            <>
              <Camera size={64} className="text-gray-400 mb-3" />
              <p className="text-gray-500">La cámara se activará al iniciar el escaneo</p>
            </>
          )}
        </div>
      ) : (
        processMockData()
      )}

      {!result && (
        <div className="flex justify-center">
          {scanning ? (
            <Button variant="outline" onClick={stopScanning} className="px-6">
              Cancelar
            </Button>
          ) : (
            <Button 
              onClick={startScanning} 
              className="bg-medical-blue hover:bg-medical-blue/90 px-6"
              disabled={!hasCamera}
            >
              Iniciar escaneo
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default QRScanner;
