
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Mail, Shield, Save, LogOut } from 'lucide-react';
import { toast as sonnerToast } from 'sonner';

interface UserData {
  id: string;
  full_name: string;
  email: string;
  role: string;
  specialty: string | null;
  created_at: string;
}

const UserProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Load user data from Supabase
  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) throw sessionError;
        
        if (!sessionData.session) {
          navigate('/');
          return;
        }
        
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionData.session.user.id)
          .single();
        
        if (profileError) throw profileError;
        
        if (profileData) {
          setUser({
            ...profileData,
            email: sessionData.session.user.email || ''
          });
        }
      } catch (error: any) {
        console.error("Error loading user data:", error);
        toast({
          title: "Error de carga",
          description: "No se pudo cargar la información del usuario",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate, toast]);

  const handleEditToggle = () => {
    setEditMode(!editMode);
    // Reset password fields when leaving edit mode
    if (editMode) {
      setPassword('');
      setConfirmPassword('');
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      // Check if passwords match if changing password
      if (password || confirmPassword) {
        if (password !== confirmPassword) {
          toast({
            title: "Error de validación",
            description: "Las contraseñas no coinciden",
            variant: "destructive",
          });
          return;
        }
        
        // Change password if specified
        if (password) {
          const { error: passwordError } = await supabase.auth.updateUser({
            password: password
          });
          
          if (passwordError) throw passwordError;
        }
      }
      
      // Update profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: user.full_name,
          specialty: user.specialty
        })
        .eq('id', user.id);
      
      if (profileError) throw profileError;
      
      toast({
        title: "Perfil actualizado",
        description: "Los cambios han sido guardados exitosamente",
      });
      
      setEditMode(false);
      setPassword('');
      setConfirmPassword('');
      
      sonnerToast.success("Perfil actualizado correctamente");
    } catch (error: any) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo guardar la información del perfil",
        variant: "destructive",
      });
    }
  };

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      toast({
        title: "Cerrando sesión",
        description: "Has cerrado sesión correctamente.",
      });
      
      // Redirect to login
      navigate('/');
    } catch (error: any) {
      console.error("Error signing out:", error);
      toast({
        title: "Error al cerrar sesión",
        description: error.message || "No se pudo cerrar sesión",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-4 border-medical-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-8">
          <User size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Usuario no encontrado</h2>
          <p className="text-gray-500 mt-2">No se encontró información para este usuario en el sistema.</p>
        </div>
        <Button onClick={() => navigate('/')} className="bg-medical-blue hover:bg-medical-blue/90">
          Volver al inicio
        </Button>
      </div>
    );
  }

  // Generate initials for avatar
  const initials = user.full_name
    .split(' ')
    .map(name => name[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Mi Perfil</h1>
        <div className="flex space-x-3">
          <Button 
            onClick={handleEditToggle} 
            variant={editMode ? "destructive" : "outline"}
            className={editMode ? "" : "border-medical-teal text-medical-teal"}
          >
            {editMode ? "Cancelar Edición" : "Editar Perfil"}
          </Button>
          <Button 
            onClick={handleLogout} 
            variant="outline" 
            className="border-medical-red text-medical-red"
          >
            <LogOut className="mr-2" size={16} />
            Cerrar Sesión
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-medical-purple text-white text-2xl">
                    {initials}
                  </AvatarFallback>
                </Avatar>
              </div>
              <CardTitle>{user.full_name}</CardTitle>
              <CardDescription className="flex items-center justify-center">
                <Shield className="mr-1" size={14} />
                {user.role}
              </CardDescription>
            </CardHeader>
            <CardContent className="text-center">
              <div className="flex items-center justify-center text-gray-500 mb-2">
                <Mail className="mr-2" size={16} />
                {user.email}
              </div>
              <p className="text-sm text-gray-500">
                Registrado: {new Date(user.created_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 text-medical-purple" size={20} />
                Información Personal
              </CardTitle>
              <CardDescription>
                Actualice su información de perfil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="full_name">Nombre completo</Label>
                <Input 
                  id="full_name"
                  value={user.full_name}
                  onChange={e => setUser({...user, full_name: e.target.value})}
                  disabled={!editMode}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input 
                  id="email"
                  type="email"
                  value={user.email}
                  disabled={true}
                />
                <p className="text-xs text-amber-500 mt-1">
                  El correo electrónico no se puede modificar
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="specialty">Especialidad</Label>
                <Input 
                  id="specialty"
                  value={user.specialty || ''}
                  onChange={e => setUser({...user, specialty: e.target.value})}
                  disabled={!editMode}
                  placeholder="Ej. Cardiología, Pediatría, etc."
                />
              </div>
              
              {editMode && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="password">Nueva contraseña</Label>
                    <Input 
                      id="password"
                      type="password"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Dejar en blanco para mantener la actual"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                    <Input 
                      id="confirmPassword"
                      type="password"
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="Confirme la nueva contraseña"
                    />
                  </div>
                </>
              )}
              
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Input 
                  id="role"
                  value={user.role}
                  disabled={true}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Su rol solo puede ser modificado por un administrador
                </p>
              </div>
            </CardContent>
            {editMode && (
              <CardFooter>
                <Button 
                  onClick={handleSaveProfile} 
                  className="ml-auto bg-medical-blue hover:bg-medical-blue/90"
                >
                  <Save className="mr-2" size={16} />
                  Guardar Cambios
                </Button>
              </CardFooter>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
