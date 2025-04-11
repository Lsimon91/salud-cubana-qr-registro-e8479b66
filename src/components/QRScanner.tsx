
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { QrCode, Camera, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QRScanner = () => {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [hasCamera, setHasCamera] = useState(true);
  const { toast } = useToast();

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
      
      toast({
        title: "QR escaneado con éxito",
        description: "Se han recuperado los datos del paciente.",
      });
    }, 2000);
  };

  const stopScanning = () => {
    setScanning(false);
  };

  const resetScanner = () => {
    setResult(null);
  };

  const processMockData = () => {
    if (!result) return null;
    
    try {
      const data = JSON.parse(result);
      return (
        <div className="p-4 bg-white rounded-lg shadow-md">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Datos del Paciente</h3>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline" onClick={resetScanner}>
                Escanear otro
              </Button>
              <Button size="sm" className="bg-medical-teal hover:bg-medical-teal/90">
                <UserCheck className="mr-2 h-4 w-4" />
                Registrar visita
              </Button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">ID</p>
              <p className="font-medium">{data.id}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Nombre</p>
              <p className="font-medium">{data.nombre}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha de Nacimiento</p>
              <p className="font-medium">{data.fechaNacimiento}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Género</p>
              <p className="font-medium">{data.genero}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-gray-500">Dirección</p>
              <p className="font-medium">{data.direccion}</p>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="font-medium text-gray-700 mb-2">Historial Médico</h4>
            <p className="text-sm text-gray-600 italic">No se encontraron registros previos. ¿Desea crear un nuevo registro?</p>
            <div className="mt-3">
              <Button variant="outline" className="mr-2">
                <UserX className="mr-2 h-4 w-4" />
                No registrar
              </Button>
              <Button className="bg-medical-blue hover:bg-medical-blue/90">
                Crear nuevo registro
              </Button>
            </div>
          </div>
        </div>
      );
    } catch (error) {
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
