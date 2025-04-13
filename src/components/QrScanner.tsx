
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { QrReader } from 'react-qr-reader';
import { toast } from 'sonner';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Loader2, Check, QrCode, UserPlus, Search } from 'lucide-react';
import { db } from '@/db/localDatabase';

const QrScanner = () => {
  const navigate = useNavigate();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'success' | 'error'>('idle');
  const [manualId, setManualId] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Reiniciar el estado al montar el componente
  useEffect(() => {
    setScanResult(null);
    setScanStatus('idle');
    setIsScanning(true);
  }, []);

  // Manejar el resultado del escaneo
  const handleScanResult = async (result: string | null) => {
    if (result && scanStatus !== 'success') {
      setScanResult(result);
      setScanStatus('success');
      setIsScanning(false);
      toast.success('Código QR escaneado con éxito');
      
      try {
        // Verificar si el paciente existe en la base de datos
        const patient = await db.patients.where('identity_id').equals(result).first();
        
        // Registrar actividad
        const userId = localStorage.getItem('userId');
        const userName = localStorage.getItem('userName');
        
        if (userId && userName) {
          await db.activityLogs.add({
            action: 'Escaneo de código QR',
            user_id: userId,
            user_name: userName,
            details: `Código QR ${result} escaneado ${patient ? 'paciente encontrado' : 'paciente no encontrado'}`,
            created_at: new Date()
          });
        }
        
        // Navegar a la página del paciente
        navigate(`/paciente/${result}`);
      } catch (error) {
        console.error('Error al procesar el código QR:', error);
        toast.error('Error al procesar el código QR');
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
  };

  // Crear nuevo paciente
  const handleCreateNewPatient = () => {
    if (scanResult) {
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
                Alinee el código QR del paciente con la cámara para escanearlo
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
            
            {!isScanning && scanResult && (
              <div className="p-6 flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <Check className="h-8 w-8 text-green-600" />
                </div>
                <h3 className="text-lg font-medium mb-2 text-center">Código QR escaneado correctamente</h3>
                <p className="text-sm text-gray-500 mb-4 text-center">
                  ID: {scanResult}
                </p>
                <div className="flex space-x-4">
                  <Button onClick={handleReset} variant="outline">
                    Escanear otro
                  </Button>
                </div>
              </div>
            )}
            
            <div className="p-4 flex flex-col items-center border-t">
              <Button 
                onClick={handleCreateNewPatient}
                className="w-full bg-medical-teal hover:bg-medical-teal/90 mt-2"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Registrar Nuevo Paciente
              </Button>
            </div>
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
