
import { useState } from 'react';
import NavBar from '@/components/NavBar';
import StatsCard from '@/components/StatsCard';
import PatientCard from '@/components/PatientCard';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Stethoscope, 
  CalendarClock, 
  Activity,
  Search,
  QrCode,
  PlusCircle
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';

// Mock patient data
const mockPatients = [
  {
    id: "89061223456",
    nombre: "Carlos Rodríguez",
    edad: 34,
    genero: "Masculino",
    ultimaVisita: "10/04/2023",
    diagnosticos: ["Hipertensión arterial", "Diabetes tipo 2"],
    tratamientos: ["Control de presión arterial", "Dieta baja en carbohidratos"],
    medicamentos: ["Enalapril 10mg", "Metformina 500mg"],
  },
  {
    id: "76052334567",
    nombre: "Ana Díaz",
    edad: 58,
    genero: "Femenino",
    ultimaVisita: "08/04/2023",
    diagnosticos: ["Artritis reumatoide"],
    tratamientos: ["Fisioterapia", "Antiinflamatorios"],
    medicamentos: ["Prednisona 5mg", "Metotrexato 7.5mg semanal"],
  },
  {
    id: "92030545678",
    nombre: "Miguel Santos",
    edad: 29,
    genero: "Masculino",
    ultimaVisita: "05/04/2023",
    diagnosticos: ["Asma bronquial"],
    tratamientos: ["Terapia inhalatoria", "Evitar alergenos"],
    medicamentos: ["Salbutamol inhalador", "Fluticasona inhalador"],
  }
];

const DashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredPatients = mockPatients.filter(patient => 
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.includes(searchTerm)
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
            <p className="text-gray-600">Bienvenido al sistema de gestión médica</p>
          </div>
          
          <div className="mt-4 md:mt-0 flex space-x-3">
            <Link to="/escanear">
              <Button className="bg-medical-blue hover:bg-medical-blue/90">
                <QrCode className="mr-2 h-4 w-4" />
                Escanear QR
              </Button>
            </Link>
            <Link to="/pacientes/nuevo">
              <Button variant="outline">
                <PlusCircle className="mr-2 h-4 w-4" />
                Nuevo Paciente
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatsCard 
            title="Pacientes Atendidos" 
            value="128" 
            description="Últimos 30 días" 
            icon={<Users size={24} />} 
            color="blue" 
          />
          <StatsCard 
            title="Consultas Realizadas" 
            value="254" 
            description="Últimos 30 días" 
            icon={<Stethoscope size={24} />} 
            color="teal" 
          />
          <StatsCard 
            title="Próximas Citas" 
            value="18" 
            description="Próximos 7 días" 
            icon={<CalendarClock size={24} />} 
            color="purple" 
          />
          <StatsCard 
            title="Casos Urgentes" 
            value="3" 
            description="Atención inmediata requerida" 
            icon={<Activity size={24} />} 
            color="red" 
          />
        </div>
        
        {/* Main Content */}
        <div className="bg-white p-6 rounded-xl shadow-sm mb-8">
          <Tabs defaultValue="recientes">
            <div className="flex justify-between items-center mb-4">
              <TabsList>
                <TabsTrigger value="recientes">Pacientes Recientes</TabsTrigger>
                <TabsTrigger value="urgentes">Casos Urgentes</TabsTrigger>
                <TabsTrigger value="seguimiento">Seguimiento</TabsTrigger>
              </TabsList>
              
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                <Input
                  placeholder="Buscar paciente o ID..."
                  className="pl-9"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            
            <TabsContent value="recientes" className="mt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {filteredPatients.length > 0 ? (
                  filteredPatients.map(patient => (
                    <PatientCard key={patient.id} patient={patient} />
                  ))
                ) : (
                  <div className="col-span-2 py-8 text-center">
                    <p className="text-gray-500">No se encontraron pacientes que coincidan con la búsqueda</p>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="urgentes" className="mt-0">
              <div className="py-8 text-center">
                <p className="text-gray-500">No hay casos urgentes en este momento</p>
              </div>
            </TabsContent>
            
            <TabsContent value="seguimiento" className="mt-0">
              <div className="py-8 text-center">
                <p className="text-gray-500">No hay pacientes en seguimiento asignados</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Activity Summary */}
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Actividad Reciente</h3>
          
          <div className="space-y-3">
            <div className="flex items-start pb-3 border-b border-gray-100">
              <div className="p-2 rounded-full bg-blue-100 mr-3">
                <QrCode size={16} className="text-medical-blue" />
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-medium">Dra. María González</span> escaneó el QR del paciente Carlos Rodríguez
                </p>
                <p className="text-xs text-gray-500 mt-1">Hace 20 minutos</p>
              </div>
            </div>
            
            <div className="flex items-start pb-3 border-b border-gray-100">
              <div className="p-2 rounded-full bg-green-100 mr-3">
                <Stethoscope size={16} className="text-medical-teal" />
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-medium">Dr. Carlos Rodríguez</span> actualizó el diagnóstico de Miguel Santos
                </p>
                <p className="text-xs text-gray-500 mt-1">Hace 2 horas</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="p-2 rounded-full bg-purple-100 mr-3">
                <Activity size={16} className="text-medical-purple" />
              </div>
              <div>
                <p className="text-sm">
                  <span className="font-medium">Enf. Juan Pérez</span> registró los signos vitales de Ana Díaz
                </p>
                <p className="text-xs text-gray-500 mt-1">Hace 3 horas</p>
              </div>
            </div>
          </div>
          
          <div className="mt-4 text-center">
            <Button variant="ghost" size="sm" className="text-medical-blue">
              Ver todo el historial de actividades
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
