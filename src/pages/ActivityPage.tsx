
import NavBar from '@/components/NavBar';
import ActivityLog from '@/components/ActivityLog';

const ActivityPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Registro de Actividades</h1>
          <p className="text-gray-600">Seguimiento de todas las acciones realizadas en el sistema</p>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <ActivityLog />
        </div>
      </main>
    </div>
  );
};

export default ActivityPage;
