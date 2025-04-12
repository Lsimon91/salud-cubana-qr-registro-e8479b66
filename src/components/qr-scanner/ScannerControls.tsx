
import { Button } from '@/components/ui/button';

interface ScannerControlsProps {
  scanning: boolean;
  startScanning: () => void;
  stopScanning: () => void;
  cameraPermission: boolean | null;
}

const ScannerControls = ({ 
  scanning, 
  startScanning, 
  stopScanning, 
  cameraPermission 
}: ScannerControlsProps) => {
  return (
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
  );
};

export default ScannerControls;
