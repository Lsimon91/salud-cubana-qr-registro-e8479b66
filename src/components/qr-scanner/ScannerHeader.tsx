
import { QrCode } from 'lucide-react';

const ScannerHeader = () => {
  return (
    <div className="text-center mb-6">
      <div className="inline-flex items-center justify-center p-3 bg-medical-blue/10 rounded-full mb-3">
        <QrCode size={28} className="text-medical-blue" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800">Escanear Carnet de Identidad</h2>
      <p className="text-gray-600 mt-1">Escanee el código QR del carnet para acceder a los datos del paciente</p>
    </div>
  );
};

export default ScannerHeader;
