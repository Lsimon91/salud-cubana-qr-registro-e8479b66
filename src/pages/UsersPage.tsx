
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import NavBar from '@/components/NavBar';
import UserManagement from '@/components/UserManagement';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Users, InfoIcon } from 'lucide-react';

const UsersPage = () => {
  const navigate = useNavigate();
  const userRole = localStorage.getItem('userRole');
  
  useEffect(() => {
    // Redireccionar al panel de administración completo
    if (userRole === 'Administrador') {
      navigate('/admin');
    }
  }, [navigate, userRole]);

  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p className="text-gray-600">
            Administre los usuarios y roles del sistema
          </p>
        </div>
        
        <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-800">
          <InfoIcon className="h-4 w-4 text-blue-600" />
          <AlertTitle>Información</AlertTitle>
          <AlertDescription>
            Para acceder a todas las funciones administrativas, visite el 
            <a 
              href="/admin" 
              className="text-blue-600 underline font-medium ml-1 hover:text-blue-800"
            >
              Panel de Administración Completo
            </a>
          </AlertDescription>
        </Alert>
        
        <Card>
          <CardHeader className="bg-gray-50 border-b">
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-medical-purple" />
              Gestión de Usuarios
            </CardTitle>
            <CardDescription>
              Administre los perfiles y permisos de los usuarios del sistema
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <UserManagement />
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default UsersPage;
