
import NavBar from '@/components/NavBar';
import PatientMedicalHistory from '@/components/PatientMedicalHistory';

const PatientPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <PatientMedicalHistory />
      </main>
    </div>
  );
};

export default PatientPage;
