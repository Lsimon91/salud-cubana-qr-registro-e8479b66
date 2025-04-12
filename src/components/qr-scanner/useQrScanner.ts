
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { toast as sonnerToast } from 'sonner';
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

export const useQrScanner = () => {
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

  return {
    scanning,
    cameraPermission,
    result,
    patientExists,
    patient,
    requestCameraPermission,
    startScanning,
    stopScanning,
    resetScanner,
    handleScan,
    handleScanError,
    registerVisit,
    createNewPatient
  };
};
