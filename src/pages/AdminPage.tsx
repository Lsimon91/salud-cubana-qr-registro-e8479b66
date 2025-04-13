
import { useState } from 'react';
import NavBar from '@/components/NavBar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Users, 
  Settings, 
  Database, 
  BarChart, 
  Activity, 
  FileText, 
  Shield,
  User
} from 'lucide-react';
import UserManagement from '@/components/UserManagement';
import DatabaseBackup from '@/components/DatabaseBackup';
import AdvancedStats from '@/components/AdvancedStats';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';

const AdminPage = () => {
  const navigate = useNavigate();
  const [userRole, setUserRole] = useState<string | null>(null);
  
  useEffect(() => {
    // Comprobar si el usuario tiene rol de administrador
    const role = localStorage.getItem('userRole');
    setUserRole(role);
    
    if (role !== 'Administrador') {
      navigate('/dashboard');
    }
  }, [navigate]);

  if (userRole !== 'Administrador') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-medical-red">
              <Shield className="h-5 w-5" />
              Acceso Restringido
            </CardTitle>
            <CardDescription>
              Esta sección requiere privilegios de administrador
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <User className="h-16 w-16 text-gray-300 mb-4" />
            <p className="text-center mb-4">No tiene los permisos necesarios para acceder a esta sección.</p>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-4 py-2 bg-medical-blue text-white rounded-md hover:bg-medical-blue/90 transition-colors"
            >
              Volver al Dashboard
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Panel de Administración</h1>
          <p className="text-gray-600">Gestione todos los aspectos del sistema desde un solo lugar</p>
        </div>
        
        <Tabs defaultValue="users" className="w-full">
          <TabsList className="w-full flex overflow-x-auto mb-6 border-b pb-2">
            <TabsTrigger value="users" className="flex items-center">
              <Users className="mr-2 h-4 w-4" />
              Usuarios
            </TabsTrigger>
            <TabsTrigger value="backup" className="flex items-center">
              <Database className="mr-2 h-4 w-4" />
              Respaldo
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center">
              <BarChart className="mr-2 h-4 w-4" />
              Estadísticas
            </TabsTrigger>
            <TabsTrigger value="logs" className="flex items-center">
              <Activity className="mr-2 h-4 w-4" />
              Logs del Sistema
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="users" className="space-y-4">
            <UserManagement />
          </TabsContent>
          
          <TabsContent value="backup" className="space-y-4">
            <DatabaseBackup />
          </TabsContent>
          
          <TabsContent value="stats" className="space-y-4">
            <AdvancedStats />
          </TabsContent>
          
          <TabsContent value="logs" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-medical-teal" />
                  Registros del Sistema
                </CardTitle>
                <CardDescription>
                  Visualice todas las acciones realizadas en el sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Esta funcionalidad será implementada próximamente.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-medical-purple" />
                  Configuración del Sistema
                </CardTitle>
                <CardDescription>
                  Personalice la configuración general del sistema
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-center py-8 text-gray-500">
                  Esta funcionalidad será implementada próximamente.
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default AdminPage;
