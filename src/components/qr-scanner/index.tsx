
import { useQrScanner } from './useQrScanner';
import ScannerHeader from './ScannerHeader';
import CameraPermission from './CameraPermission';
import QrReaderContainer from './QrReaderContainer';
import ScannerControls from './ScannerControls';
import PatientDataDisplay from './PatientDataDisplay';

const QrScanner = () => {
  const {
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
    registerVisit,
    createNewPatient
  } = useQrScanner();

  const processQrResult = () => {
    if (!result || !patient) return null;
    
    try {
      return (
        <PatientDataDisplay
          patient={patient}
          patientExists={patientExists}
          resetScanner={resetScanner}
          registerVisit={registerVisit}
          createNewPatient={createNewPatient}
        />
      );
    } catch (error) {
      console.error("Error procesando datos del QR:", error);
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-600">Error al procesar los datos del QR</p>
          <button className="mt-2" onClick={resetScanner}>
            Intentar nuevamente
          </button>
        </div>
      );
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm">
      <ScannerHeader />

      {cameraPermission === false && (
        <CameraPermission requestCameraPermission={requestCameraPermission} />
      )}

      {!result ? (
        <>
          <QrReaderContainer scanning={scanning} handleScan={handleScan} />
          {!result && (
            <ScannerControls
              scanning={scanning}
              startScanning={startScanning}
              stopScanning={stopScanning}
              cameraPermission={cameraPermission}
            />
          )}
        </>
      ) : (
        processQrResult()
      )}
    </div>
  );
};

export default QrScanner;
