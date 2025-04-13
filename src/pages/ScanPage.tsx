
import NavBar from '@/components/NavBar';
import QrScanner from '@/components/QrScanner';

const ScanPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Escanear Código QR</h1>
          <p className="text-gray-600">Escanee el código QR del carnet de identidad para acceder a los datos del paciente</p>
        </div>
        
        <QrScanner />
      </main>
    </div>
  );
};

export default ScanPage;
