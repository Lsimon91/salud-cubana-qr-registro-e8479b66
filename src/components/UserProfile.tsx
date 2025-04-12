
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/db/localDatabase';

interface ProfileData {
  id: string;
  email: string;
  full_name: string;
  role: string;
  specialty?: string;
}

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [editableProfile, setEditableProfile] = useState<{ full_name: string; specialty: string }>({
    full_name: '',
    specialty: ''
  });
  const { toast } = useToast();

  // Cargar perfil del usuario
  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          toast({
            title: "Error de autenticación",
            description: "No se pudo identificar al usuario",
            variant: "destructive",
          });
          return;
        }

        // Obtener usuario de la base de datos local
        const user = await db.users.get(userId);
        
        if (user) {
          setProfile({
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            role: user.role,
            specialty: user.specialty
          });
          
          setEditableProfile({
            full_name: user.full_name,
            specialty: user.specialty || ''
          });
        } else {
          toast({
            title: "Perfil no encontrado",
            description: "No se pudo encontrar la información del perfil",
            variant: "destructive",
          });
        }
      } catch (error) {
        console.error("Error cargando perfil:", error);
        toast({
          title: "Error",
          description: "Ocurrió un error al cargar el perfil",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadUserProfile();
  }, [toast]);

  const handleUpdateProfile = async () => {
    if (!profile) return;
    
    try {
      setSaving(true);
      
      // Actualizar en la base de datos local
      await db.users.update(profile.id, {
        full_name: editableProfile.full_name,
        specialty: editableProfile.specialty,
        updated_at: new Date()
      });
      
      // Actualizar nombre en localStorage
      localStorage.setItem('userName', editableProfile.full_name);
      
      // Actualizar estado local
      setProfile({
        ...profile,
        full_name: editableProfile.full_name,
        specialty: editableProfile.specialty
      });
      
      // Registrar actividad
      await db.activityLogs.add({
        action: 'Actualización de Perfil',
        user_id: profile.id,
        user_name: editableProfile.full_name,
        details: 'Información de perfil actualizada',
        created_at: new Date()
      });
      
      toast({
        title: "Perfil actualizado",
        description: "Su información ha sido actualizada exitosamente",
      });
    } catch (error) {
      console.error("Error actualizando perfil:", error);
      toast({
        title: "Error",
        description: "No se pudo actualizar el perfil",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="text-center p-6 bg-white rounded-lg shadow">
        <p className="text-gray-500">No se pudo cargar la información del perfil</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="" alt={profile.full_name} />
              <AvatarFallback className="text-lg bg-medical-blue text-white">
                {profile.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-xl">{profile.full_name}</CardTitle>
              <CardDescription>{profile.role}</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="email">Correo electrónico</Label>
              <Input id="email" value={profile.email} disabled />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rol</Label>
              <Input id="role" value={profile.role} disabled />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="full_name">Nombre completo</Label>
            <Input 
              id="full_name" 
              value={editableProfile.full_name} 
              onChange={(e) => setEditableProfile({...editableProfile, full_name: e.target.value})}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidad</Label>
            <Input 
              id="specialty" 
              value={editableProfile.specialty} 
              onChange={(e) => setEditableProfile({...editableProfile, specialty: e.target.value})}
              placeholder="Ej: Medicina General, Pediatría, etc."
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            onClick={handleUpdateProfile} 
            disabled={saving} 
            className="ml-auto bg-medical-blue hover:bg-medical-blue/90"
          >
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UserProfile;
