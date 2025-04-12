
import { Button } from '@/components/ui/button';

interface CameraPermissionProps {
  requestCameraPermission: () => void;
}

const CameraPermission = ({ requestCameraPermission }: CameraPermissionProps) => {
  return (
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
  );
};

export default CameraPermission;
