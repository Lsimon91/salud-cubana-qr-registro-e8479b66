
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { QrCode, Camera, UserCheck, UserX, UserPlus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
import { QrReader } from 'react-qr-reader';
import { db } from '@/db/localDatabase';

interface ScannedPatientData {
  id: string;
  nombre: string;
  fechaNacimiento: string;
  genero: string;
  direccion: string;
  telefono?: string;
  email?: string;
}

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [cameraPermission, setCameraPermission] = useState<boolean | null>(null);
  const [result, setResult] = useState<string | null>(null);
  const [patientExists, setPatientExists] = useState(false);
  const [patient, setPatient] = useState<any | null>(null);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Verificar permiso de cámara cuando se monta el componente
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      // Detener la transmisión después de verificar el permiso
      stream.getTracks().forEach(track => track.stop());
      setCameraPermission(true);
    } catch (error) {
      console.error("Error al acceder a la cámara:", error);
      setCameraPermission(false);
    }
  };

  const requestCameraPermission = async () => {
    try {
      await navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          stream.getTracks().forEach(track => track.stop());
          setCameraPermission(true);
          setScanning(true);
        })
        .catch(error => {
          console.error("No se pudo acceder a la cámara", error);
          setCameraPermission(false);
          toast({
            title: "Error de cámara",
            description: "No se pudo acceder a la cámara. Por favor, verifique los permisos en su navegador.",
            variant: "destructive",
          });
        });
    } catch (error) {
      console.error("Error al solicitar permisos de cámara:", error);
      setCameraPermission(false);
    }
  };

  const startScanning = () => {
    if (cameraPermission) {
      setScanning(true);
    } else {
      requestCameraPermission();
    }
  };

  const stopScanning = () => {
    setScanning(false);
  };

  const resetScanner = () => {
    setResult(null);
    setPatient(null);
    setPatientExists(false);
  };

  const handleScan = async (data: any) => {
    if (data && data.text && !result) {
      try {
        const scannedText = data.text;
        setResult(scannedText);
        setScanning(false);

        // Intentar parsear el contenido del QR como JSON
        let patientData: ScannedPatientData;
        try {
          patientData = JSON.parse(scannedText);
        } catch (e) {
          // Si no es JSON válido, tratar como un ID simple
          patientData = {
            id: scannedText,
            nombre: "Desconocido",
            fechaNacimiento: new Date().toISOString().split('T')[0],
            genero: "No especificado",
            direccion: "No especificada"
          };
        }

        // Buscar paciente en la base de datos local
        const existingPatient = await db.patients
          .where('identity_id')
          .equals(patientData.id)
          .first();

        if (existingPatient) {
          setPatientExists(true);
          setPatient(existingPatient);
          toast({
            title: "Paciente encontrado",
            description: "Se ha encontrado el registro del paciente en el sistema.",
          });
        } else {
          setPatientExists(false);
          
          // Calcular edad a partir de la fecha de nacimiento
          const birthDate = new Date(patientData.fechaNacimiento);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          // Crear nuevo objeto de paciente
          const newPatient = {
            identity_id: patientData.id,
            name: patientData.nombre,
            birth_date: patientData.fechaNacimiento,
            gender: patientData.genero,
            address: patientData.direccion,
            phone: patientData.telefono || '',
            email: patientData.email || '',
            blood_type: '',
            allergies: [],
            age: age
          };
          
          setPatient(newPatient);
          toast({
            title: "Nuevo paciente",
            description: "Este paciente no existe en el sistema. Puede registrarlo ahora.",
          });
        }
      } catch (error) {
        console.error("Error procesando el código QR:", error);
        toast({
          title: "Error",
          description: "No se pudo procesar el código QR. Inténtelo de nuevo.",
          variant: "destructive",
        });
        resetScanner();
      }
    }
  };

  const handleScanError = (error: any) => {
    console.error("Error de escaneo:", error);
    toast({
      title: "Error de escaneo",
      description: "Se produjo un error al escanear. Inténtelo de nuevo.",
      variant: "destructive",
    });
  };

  const registerVisit = () => {
    // Solo redirigir a la página del paciente
    if (patient) {
      navigate(`/paciente/${patient.identity_id}`);
    }
  };

  const createNewPatient = async () => {
    if (!patient) return;
    
    try {
      // Obtener el usuario actual
      const userId = localStorage.getItem('userId') || 'unknown';
      const userName = localStorage.getItem('userName') || 'Usuario desconocido';
      
      // Preparar objeto del paciente para guardar
      const newPatient = {
        identity_id: patient.identity_id,
        name: patient.name,
        birth_date: patient.birth_date,
        gender: patient.gender,
        address: patient.address,
        phone: patient.phone || '',
        email: patient.email || '',
        blood_type: patient.blood_type || '',
        allergies: Array.isArray(patient.allergies) ? patient.allergies : [],
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Guardar el paciente en la base de datos
      const patientId = await db.patients.add(newPatient);
      
      // Registrar actividad
      await db.activityLogs.add({
        action: 'Registro de Paciente',
        user_id: userId,
        user_name: userName,
        details: `Paciente ${patient.name} (ID: ${patient.identity_id}) registrado`,
        created_at: new Date()
      });
      
      toast({
        title: "Paciente registrado",
        description: "Se ha registrado el paciente en el sistema.",
      });
      
      sonnerToast.success("Paciente añadido a la base de datos");
      
      // Navegar a la página del paciente
      navigate(`/paciente/${patient.identity_id}`);
    } catch (error) {
      console.error("Error guardando paciente:", error);
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
    } catch (error) {
      console.error("Error procesando datos del QR:", error);
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

      {cameraPermission === false && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
          <div className="flex">
            <div className="ml-3">
              <p className="text-yellow-700">
                No se pudo acceder a la cámara. Por favor, conceda permisos de cámara y haga clic en "Solicitar acceso a cámara".
              </p>
              <Button 
                onClick={requestCameraPermission} 
                variant="outline" 
                className="mt-2"
              >
                Solicitar acceso a cámara
              </Button>
            </div>
          </div>
        </div>
      )}

      {!result ? (
        <div className="bg-gray-100 aspect-video rounded-lg overflow-hidden mb-4">
          {scanning ? (
            <QrReader
              constraints={{ facingMode: 'environment' }}
              onResult={handleScan}
              scanDelay={500}
              videoStyle={{ width: '100%', height: 'auto' }}
              videoContainerStyle={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
              videoId="qr-reader-video"
            />
          ) : (
            <div className="h-full flex flex-col items-center justify-center">
              <Camera size={64} className="text-gray-400 mb-3" />
              <p className="text-gray-500">La cámara se activará al iniciar el escaneo</p>
            </div>
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
              disabled={cameraPermission === false}
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
