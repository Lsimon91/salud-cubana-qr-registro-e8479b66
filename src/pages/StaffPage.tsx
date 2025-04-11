
import NavBar from '@/components/NavBar';
import StaffTable from '@/components/StaffTable';

const StaffPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Personal</h1>
          <p className="text-gray-600">Administre el personal médico, enfermeros, técnicos y administradores</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <StaffTable />
        </div>
      </main>
    </div>
  );
};

export default StaffPage;
