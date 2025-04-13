
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2, Check, QrCode, UserPlus, Search, User, Calendar, CreditCard } from 'lucide-react';
import { db } from '@/db/localDatabase';

// Interfaces para los datos extraídos del carnet
interface CubanIDData {
  nombre: string;
  apellidos: string;
  identityId: string;
  codigoValidacion: string;
  fechaNacimiento: string;
  genero: 'Masculino' | 'Femenino';
}

const QrScanner = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [manualId, setManualId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [idData, setIdData] = useState<CubanIDData | null>(null);

  // Reiniciar el estado al montar el componente
  useEffect(() => {
    setScanResult(null);
    setScanStatus('idle');
    setIsScanning(true);
    setIdData(null);
  }, []);

  // Función para extraer datos del carnet cubano
  const extractCubanIDData = (qrText: string): CubanIDData | null => {
    try {
      // Patrón para extraer los datos del formato del carnet cubano
      // Asumimos que el formato es:
      // Nombre: [nombre]
      // Apellidos: [apellidos]
      // Número de identidad: [id]
      // Código de validación: [código]
      
      const nombreMatch = qrText.match(/Nombre: (.+?)(\n|$)/);
      const apellidosMatch = qrText.match(/Apellidos: (.+?)(\n|$)/);
      const idMatch = qrText.match(/Número de identidad: (.+?)(\n|$)/);
      const codigoMatch = qrText.match(/Código de validación: (.+?)(\n|$)/);

      if (!nombreMatch || !apellidosMatch || !idMatch) {
        console.error('Formato de QR no reconocido:', qrText);
        return null;
      }

      const nombre = nombreMatch[1].trim();
      const apellidos = apellidosMatch[1].trim();
      const identityId = idMatch[1].trim();
      const codigoValidacion = codigoMatch ? codigoMatch[1].trim() : '';

      // Determinar género - si el séptimo dígito es par: mujer, impar: hombre
      const septimoDigito = parseInt(identityId.charAt(6), 10);
      const genero = septimoDigito % 2 === 0 ? 'Femenino' : 'Masculino';

      // Extraer fecha de nacimiento (primeros 6 dígitos en formato YYMMDD)
      if (identityId.length >= 6) {
        const yearPrefix = parseInt(identityId.substring(0, 2), 10) >= 0 && 
                          parseInt(identityId.substring(0, 2), 10) <= 23 ? '20' : '19';
        const year = yearPrefix + identityId.substring(0, 2);
        const month = identityId.substring(2, 4);
        const day = identityId.substring(4, 6);
        
        const fechaNacimiento = `${day}/${month}/${year}`;
        
        return {
          nombre,
          apellidos,
          identityId,
          codigoValidacion,
          fechaNacimiento,
          genero
        };
      }

      return null;
    } catch (error) {
      console.error('Error al extraer datos del carnet:', error);
      return null;
    }
  };

  // Manejar el resultado del escaneo
  const handleScanResult = async (result: string | null) => {
    if (result && scanStatus !== 'success') {
      setScanResult(result);
      setScanStatus('success');
      setIsScanning(false);
      
      const extractedData = extractCubanIDData(result);
      if (extractedData) {
        setIdData(extractedData);
        toast.success('Código QR escaneado con éxito');
        
        try {
          // Verificar si el paciente existe en la base de datos
          const patient = await db.patients.where('identity_id').equals(extractedData.identityId).first();
          
          // Registrar actividad
          const userId = localStorage.getItem('userId');
          const userName = localStorage.getItem('userName');
          
          if (userId && userName) {
            await db.activityLogs.add({
              action: 'Escaneo de código QR',
              user_id: userId,
              user_name: userName,
              details: `Código QR ${extractedData.identityId} escaneado ${patient ? 'paciente encontrado' : 'paciente no encontrado'}`,
              created_at: new Date()
            });
          }
          
          // Si el paciente no existe, lo redirigimos a crear uno con los datos pre-completados
          if (!patient) {
            toast.info('Paciente no encontrado. Puedes crear uno nuevo con los datos escaneados.');
          } else {
            // Navegar a la página del paciente
            navigate(`/paciente/${extractedData.identityId}`);
          }
        } catch (error) {
          console.error('Error al procesar el código QR:', error);
          toast.error('Error al procesar el código QR');
        }
      } else {
        toast.error('Formato de QR no reconocido');
        setScanStatus('error');
      }
    }
  };

  // Manejar errores del escáner
  const handleScanError = (error: Error) => {
    console.error('Error al escanear código QR:', error);
    setScanStatus('error');
    toast.error('Error al acceder a la cámara. Por favor, verifica los permisos.');
  };

  // Manejar la búsqueda manual
  const handleManualSearch = async () => {
    if (!manualId.trim()) {
      toast.error('Ingrese un número de identificación válido');
      return;
    }
    
    setIsSearching(true);
    
    try {
      // Extraer datos del ID manual si cumple con el formato cubano
      if (manualId.length === 11) {
        // Determinar género
        const septimoDigito = parseInt(manualId.charAt(6), 10);
        const genero = septimoDigito % 2 === 0 ? 'Femenino' : 'Masculino';

        // Extraer fecha de nacimiento
        const yearPrefix = parseInt(manualId.substring(0, 2), 10) >= 0 && 
                          parseInt(manualId.substring(0, 2), 10) <= 23 ? '20' : '19';
        const year = yearPrefix + manualId.substring(0, 2);
        const month = manualId.substring(2, 4);
        const day = manualId.substring(4, 6);
        
        const fechaNacimiento = `${day}/${month}/${year}`;

        setIdData({
          nombre: '',
          apellidos: '',
          identityId: manualId,
          codigoValidacion: '',
          fechaNacimiento,
          genero
        });
      }
      
      // Registrar actividad
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      
      if (userId && userName) {
        await db.activityLogs.add({
          action: 'Búsqueda manual de paciente',
          user_id: userId,
          user_name: userName,
          details: `Búsqueda manual con ID: ${manualId}`,
          created_at: new Date()
        });
      }
      
      // Navegar a la página del paciente
      navigate(`/paciente/${manualId}`);
    } catch (error) {
      console.error('Error en búsqueda manual:', error);
      toast.error('Error al realizar la búsqueda');
    } finally {
      setIsSearching(false);
    }
  };

  // Reiniciar el escáner
  const handleReset = () => {
    setScanResult(null);
    setScanStatus('idle');
    setIsScanning(true);
    setIdData(null);
  };

  // Crear nuevo paciente
  const handleCreateNewPatient = () => {
    if (idData) {
      navigate(`/paciente/new-patient?id=${idData.identityId}&nombre=${idData.nombre}&apellidos=${idData.apellidos}&genero=${idData.genero}&fechaNacimiento=${idData.fechaNacimiento}`);
    } else if (scanResult) {
      navigate(`/paciente/new-patient?id=${scanResult}`);
    } else {
      navigate('/paciente/new-patient');
    }
  };

  return (
    <Card className="w-full max-w-3xl mx-auto shadow-lg">
      <Tabs defaultValue="scanner" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="scanner">Escanear QR</TabsTrigger>
          <TabsTrigger value="manual">Búsqueda Manual</TabsTrigger>
        </TabsList>
        
        <TabsContent value="scanner" className="p-0">
          <CardContent className="p-0 overflow-hidden">
            <div className="p-4 bg-blue-50 border-b border-blue-100">
              <h3 className="text-lg font-medium text-blue-800 mb-1">Escáner de Código QR</h3>
              <p className="text-sm text-blue-600">
                Alinee el código QR del carnet de identidad con la cámara para escanearlo
              </p>
            </div>
            
            {isScanning && (
              <div className="relative">
                <QrReader
                  constraints={{ facingMode: 'environment' }}
                  onResult={(result) => {
                    if (result) {
                      handleScanResult(result.getText());
                    }
                  }}
                  scanDelay={500}
                  className="w-full"
                  videoContainerStyle={{ 
                    borderRadius: '0', 
                    paddingTop: '100%',
                  }}
                  videoStyle={{ 
                    objectFit: 'cover',
                    borderRadius: '0',
                  }}
                />
                
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-1/2 h-1/2 border-2 border-white border-opacity-70 rounded-lg"></div>
                </div>
                
                {scanStatus === 'error' && (
                  <div className="absolute inset-0 bg-black bg-opacity-80 flex flex-col items-center justify-center text-white p-6">
                    <p className="text-center mb-4">
                      No se pudo acceder a la cámara. Verifique los permisos de su navegador.
                    </p>
                    <Button onClick={handleReset} className="mt-2">
                      Reintentar
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {!isScanning && idData && (
              <div className="p-6 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-4 text-center">Carnet escaneado correctamente</h3>
                
                <div className="w-full space-y-3 mb-6">
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Nombre completo</p>
                      <p className="font-medium">{idData.nombre} {idData.apellidos}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <CreditCard className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Número de identidad</p>
                      <p className="font-medium">{idData.identityId}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                      <p className="font-medium">{idData.fechaNacimiento}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <User className="h-5 w-5 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Género</p>
                      <p className="font-medium">{idData.genero}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-4 w-full">
                  <Button onClick={handleReset} variant="outline" className="flex-1">
                    Escanear otro
                  </Button>
                  <Button 
                    onClick={handleCreateNewPatient}
                    className="flex-1 bg-medical-teal hover:bg-medical-teal/90"
                  >
                    <UserPlus className="mr-2 h-4 w-4" />
                    Crear Paciente
                  </Button>
                </div>
              </div>
            )}
            
            {!isScanning && scanResult && !idData && (
              <div className="p-6 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-yellow-100 flex items-center justify-center mb-4">
                  <QrCode className="h-8 w-8 text-yellow-600" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-center">Código QR escaneado</h3>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  El formato del QR no corresponde a un carnet de identidad cubano
                </p>
                <div className="flex space-x-4 w-full">
                  <Button onClick={handleReset} variant="outline" className="flex-1">
                    Escanear otro
                  </Button>
                </div>
              </div>
            )}
            
            {isScanning && (
              <div className="p-4 flex flex-col items-center border-t">
                <Button 
                  onClick={handleCreateNewPatient}
                  className="w-full bg-medical-teal hover:bg-medical-teal/90 mt-2"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrar Nuevo Paciente
                </Button>
              </div>
            )}
          </CardContent>
        </TabsContent>
        
        <TabsContent value="manual">
          <CardContent className="p-6">
            <div className="mb-6">
              <h3 className="text-lg font-medium mb-2">Búsqueda Manual</h3>
              <p className="text-sm text-gray-500">
                Ingrese el número de identificación del paciente
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <QrCode className="text-gray-400" size={20} />
                <Input
                  placeholder="Número de identificación"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                />
              </div>
              
              <Button
                className="w-full bg-medical-blue hover:bg-medical-blue/90"
                onClick={handleManualSearch}
                disabled={isSearching || !manualId.trim()}
              >
                {isSearching ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Search className="mr-2 h-4 w-4" />
                )}
                Buscar Paciente
              </Button>
              
              <div className="mt-6 pt-4 border-t border-gray-100">
                <Button
                  onClick={handleCreateNewPatient}
                  variant="outline"
                  className="w-full border-medical-teal text-medical-teal hover:bg-medical-teal/10"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  Registrar Nuevo Paciente
                </Button>
              </div>
            </div>
          </CardContent>
        </TabsContent>
      </Tabs>
    </Card>
  );
};

export default QrScanner;
