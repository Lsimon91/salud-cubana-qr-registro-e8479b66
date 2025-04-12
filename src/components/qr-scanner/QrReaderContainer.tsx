
import { Camera } from 'lucide-react';
import { QrReader } from 'react-qr-reader';

interface QrReaderContainerProps {
  scanning: boolean;
  handleScan: (data: any) => void;
}

const QrReaderContainer = ({ scanning, handleScan }: QrReaderContainerProps) => {
  return (
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
  );
};

export default QrReaderContainer;
