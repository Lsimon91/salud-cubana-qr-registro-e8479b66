
import { useState, useEffect } from 'react';
import NavBar from '@/components/NavBar';
import StatsCard from '@/components/StatsCard';
import PatientCard from '@/components/PatientCard';
import AdvancedStats from '@/components/AdvancedStats';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Stethoscope, 
  CalendarClock, 
  Activity,
  Search,
  QrCode,
  PlusCircle,
  RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { db, Patient, MedicalRecord, ActivityLog, stats, StatsData } from '@/db/localDatabase';

interface PatientWithData {
  id: string;
  nombre: string;
  edad: number;
  genero: string;
  ultimaVisita: string;
  diagnosticos: string[];
  tratamientos: string[];
  medicamentos: string[];
}

const DashboardPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [patients, setPatients] = useState<PatientWithData[]>([]);
  const [recentActivities, setRecentActivities] = useState<ActivityLog[]>([]);
  const [statsData, setStatsData] = useState<StatsData>({
    patientsCount: 0,
    consultationsCount: 0,
    upcomingAppointments: 0,
    urgentCases: 0
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Cargar estadísticas
      const dashboardStats = await stats.getStats();
      setStatsData(dashboardStats);
      
      // Cargar pacientes recientes
      const dbPatients = await db.patients.toArray();
      const patientIds = dbPatients.map(p => p.id).filter(id => id !== undefined) as number[];
      
      // Obtener los registros médicos más recientes para cada paciente
      const patientData: PatientWithData[] = [];
      
      for (const patient of dbPatients) {
        if (patient.id) {
          // Calcular edad
          const birthDate = new Date(patient.birth_date);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const m = today.getMonth() - birthDate.getMonth();
          if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          // Obtener el registro médico más reciente
          const medicalRecords = await db.medicalRecords
            .where('patient_id')
            .equals(patient.id)
            .reverse()
            .sortBy('date');
          
          const lastRecord = medicalRecords[0];
          
          patientData.push({
            id: patient.identity_id,
            nombre: patient.name,
            edad: age,
            genero: patient.gender,
            ultimaVisita: lastRecord ? lastRecord.date : 'Sin visitas',
            diagnosticos: lastRecord ? lastRecord.diagnosis.split(',').map(d => d.trim()) : [],
            tratamientos: lastRecord ? lastRecord.treatment.split(',').map(t => t.trim()) : [],
            medicamentos: lastRecord ? lastRecord.medications.split(',').map(m => m.trim()) : [],
          });
        }
      }
      
      setPatients(patientData);
      
      // Cargar actividades recientes
      const activities = await db.activityLogs
        .orderBy('created_at')
        .reverse()
        .limit(10)
        .toArray();
      
      setRecentActivities(activities);
    } catch (error) {
      console.error('Error cargando datos del dashboard:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);
  
  const handleRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };
  
  const filteredPatients = patients.filter(patient => 
    patient.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.includes(searchTerm)
  );

  // Función para formatear la fecha relativa
  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} minutos`;
    if (diffHours < 24) return `Hace ${diffHours} horas`;
    return `Hace ${diffDays} días`;
  };

  // Función para obtener el icono para la actividad
  const getActivityIcon = (action: string) => {
    if (action.includes('Escaneo') || action.includes('QR')) {
      return <QrCode size={16} className="text-medical-blue" />;
    } else if (action.includes('Actualización') || action.includes('Registro Médico')) {
      return <Stethoscope size={16} className="text-medical-teal" />;
    } else {
      return <Activity size={16} className="text-medical-purple" />;
    }
  };

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
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="mr-2"
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
            <Link to="/escanear">
              <Button className="bg-medical-blue hover:bg-medical-blue/90">
                <QrCode className="mr-2 h-4 w-4" />
                Escanear QR
              </Button>
            </Link>
            <Link to="/paciente/new-patient">
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
            title="Pacientes Registrados" 
            value={statsData.patientsCount.toString()} 
            description="Total en la base de datos" 
            icon={<Users size={24} />} 
            color="blue" 
            trend={{ value: 12, isPositive: true }}
            helpText="Total de pacientes registrados en el sistema"
          />
          <StatsCard 
            title="Consultas Realizadas" 
            value={statsData.consultationsCount.toString()} 
            description="Últimos 30 días" 
            icon={<Stethoscope size={24} />} 
            color="teal" 
            trend={{ value: 5, isPositive: true }}
            helpText="Número de consultas médicas realizadas en los últimos 30 días"
          />
          <StatsCard 
            title="Próximas Citas" 
            value={statsData.upcomingAppointments.toString()} 
            description="Próximos 7 días" 
            icon={<CalendarClock size={24} />} 
            color="purple" 
            helpText="Citas programadas para los próximos 7 días"
          />
          <StatsCard 
            title="Casos Urgentes" 
            value={statsData.urgentCases.toString()} 
            description="Atención inmediata requerida" 
            icon={<Activity size={24} />} 
            color="red" 
            trend={{ value: 2, isPositive: false }}
            helpText="Pacientes que requieren atención médica inmediata"
          />
        </div>
        
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-xl shadow-sm mb-6">
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
                  {loading ? (
                    <div className="py-12 flex justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue"></div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {filteredPatients.length > 0 ? (
                        filteredPatients.slice(0, 4).map(patient => (
                          <PatientCard key={patient.id} patient={patient} />
                        ))
                      ) : (
                        <div className="col-span-2 py-8 text-center">
                          <p className="text-gray-500">No se encontraron pacientes que coincidan con la búsqueda</p>
                        </div>
                      )}
                    </div>
                  )}
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
            
            {/* Estadísticas Avanzadas */}
            <AdvancedStats />
          </div>
          
          {/* Activity Summary */}
          <div className="bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium text-gray-800 mb-4">Actividad Reciente</h3>
            
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-blue"></div>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.length > 0 ? (
                  recentActivities.slice(0, 6).map((activity, index) => (
                    <div key={activity.id || index} className="flex items-start pb-3 border-b border-gray-100">
                      <div className="p-2 rounded-full bg-blue-100 mr-3">
                        {getActivityIcon(activity.action)}
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-medium">{activity.user_name}</span> {activity.action.toLowerCase()}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">{getRelativeTime(activity.created_at)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-6">
                    <p className="text-gray-500">No hay actividades registradas</p>
                  </div>
                )}
              </div>
            )}
            
            <div className="mt-4 text-center">
              <Link to="/actividad">
                <Button variant="ghost" size="sm" className="text-medical-blue">
                  Ver todo el historial de actividades
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
