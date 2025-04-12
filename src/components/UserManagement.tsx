
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { User, UserPlus, Pencil, Trash2, Shield, AlertTriangle } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  lastLogin: string;
}

const UserManagement = () => {
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<UserData | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState<UserData | null>(null);
  
  // Form state for new user
  const [newUser, setNewUser] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ''
  });

  // Load users data from localStorage
  useEffect(() => {
    setLoading(true);
    
    try {
      // Get current users database
      const usersDB = localStorage.getItem('usersDB');
      let loadedUsers = usersDB ? JSON.parse(usersDB) : [];
      
      // Check if admin exists, if not add it
      const adminExists = loadedUsers.some((user: UserData) => user.email === 'Admin@host.example.com');
      
      if (!adminExists) {
        loadedUsers.push({
          id: '1',
          name: 'Administrador Principal',
          email: 'Admin@host.example.com',
          role: 'Administrador',
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        });
        localStorage.setItem('usersDB', JSON.stringify(loadedUsers));
      }
      
      setUsers(loadedUsers);
    } catch (error) {
      console.error("Error loading users data:", error);
      toast({
        title: "Error de carga",
        description: "No se pudo cargar la lista de usuarios",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const handleAddUser = () => {
    // Validate form
    if (!newUser.name || !newUser.email || !newUser.password || !newUser.role) {
      toast({
        title: "Error de validación",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }
    
    if (newUser.password !== newUser.confirmPassword) {
      toast({
        title: "Error de validación",
        description: "Las contraseñas no coinciden",
        variant: "destructive",
      });
      return;
    }
    
    // Check if email already exists
    const emailExists = users.some(user => user.email === newUser.email);
    if (emailExists) {
      toast({
        title: "Error de validación",
        description: "Ya existe un usuario con ese correo electrónico",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const newUserData: UserData = {
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        createdAt: new Date().toISOString(),
        lastLogin: ''
      };
      
      // In a real application, we would hash the password here
      // For demo purposes, we're just storing the user info without the password
      // In production, you'd store a hashed password
      
      const updatedUsers = [...users, newUserData];
      setUsers(updatedUsers);
      localStorage.setItem('usersDB', JSON.stringify(updatedUsers));
      
      toast({
        title: "Usuario creado",
        description: `Se ha creado el usuario ${newUser.name} con éxito`,
      });
      
      // Reset form and close dialog
      setNewUser({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: ''
      });
      setShowAddDialog(false);
      
      // Add activity log
      const activityLog = localStorage.getItem('activityLog');
      const activities = activityLog ? JSON.parse(activityLog) : [];
      activities.push({
        id: Date.now().toString(),
        user: localStorage.getItem('userName') || 'Usuario desconocido',
        action: 'Creación de usuario',
        details: `Creó el usuario ${newUser.name} (${newUser.role})`,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('activityLog', JSON.stringify(activities));
      
    } catch (error) {
      console.error("Error creating user:", error);
      toast({
        title: "Error al crear usuario",
        description: "No se pudo crear el usuario. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = () => {
    if (!editingUser) return;
    
    try {
      // Find the user to update
      const userIndex = users.findIndex(user => user.id === editingUser.id);
      
      if (userIndex !== -1) {
        // Create a copy of the users array
        const updatedUsers = [...users];
        updatedUsers[userIndex] = editingUser;
        
        setUsers(updatedUsers);
        localStorage.setItem('usersDB', JSON.stringify(updatedUsers));
        
        toast({
          title: "Usuario actualizado",
          description: `Se ha actualizado el usuario ${editingUser.name} con éxito`,
        });
        
        // Add activity log
        const activityLog = localStorage.getItem('activityLog');
        const activities = activityLog ? JSON.parse(activityLog) : [];
        activities.push({
          id: Date.now().toString(),
          user: localStorage.getItem('userName') || 'Usuario desconocido',
          action: 'Actualización de usuario',
          details: `Actualizó el usuario ${editingUser.name} (${editingUser.role})`,
          timestamp: new Date().toISOString()
        });
        localStorage.setItem('activityLog', JSON.stringify(activities));
        
        setEditingUser(null);
      }
    } catch (error) {
      console.error("Error updating user:", error);
      toast({
        title: "Error al actualizar usuario",
        description: "No se pudo actualizar el usuario. Intente nuevamente.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUser = () => {
    if (!userToDelete) return;
    
    // Prevent deleting the admin user
    if (userToDelete.email === 'Admin@host.example.com') {
      toast({
        title: "Operación no permitida",
        description: "No se puede eliminar el usuario administrador",
        variant: "destructive",
      });
      setShowDeleteDialog(false);
      setUserToDelete(null);
      return;
    }
    
    try {
      // Remove the user from the array
      const updatedUsers = users.filter(user => user.id !== userToDelete.id);
      
      setUsers(updatedUsers);
      localStorage.setItem('usersDB', JSON.stringify(updatedUsers));
      
      toast({
        title: "Usuario eliminado",
        description: `Se ha eliminado el usuario ${userToDelete.name} con éxito`,
      });
      
      // Add activity log
      const activityLog = localStorage.getItem('activityLog');
      const activities = activityLog ? JSON.parse(activityLog) : [];
      activities.push({
        id: Date.now().toString(),
        user: localStorage.getItem('userName') || 'Usuario desconocido',
        action: 'Eliminación de usuario',
        details: `Eliminó el usuario ${userToDelete.name} (${userToDelete.role})`,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('activityLog', JSON.stringify(activities));
      
      setShowDeleteDialog(false);
      setUserToDelete(null);
    } catch (error) {
      console.error("Error deleting user:", error);
      toast({
        title: "Error al eliminar usuario",
        description: "No se pudo eliminar el usuario. Intente nuevamente.",
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

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
          <p className="text-gray-600">
            Administre los usuarios y roles del sistema
          </p>
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-medical-blue hover:bg-medical-blue/90">
              <UserPlus className="mr-2" size={16} />
              Agregar Usuario
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Agregar Nuevo Usuario</DialogTitle>
              <DialogDescription>
                Complete el formulario para crear un nuevo usuario en el sistema
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre completo</Label>
                <Input 
                  id="name"
                  value={newUser.name}
                  onChange={e => setNewUser({...newUser, name: e.target.value})}
                  placeholder="Nombre del usuario"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input 
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={e => setNewUser({...newUser, email: e.target.value})}
                  placeholder="correo@ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Contraseña</Label>
                <Input 
                  id="password"
                  type="password"
                  value={newUser.password}
                  onChange={e => setNewUser({...newUser, password: e.target.value})}
                  placeholder="Contraseña segura"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                <Input 
                  id="confirmPassword"
                  type="password"
                  value={newUser.confirmPassword}
                  onChange={e => setNewUser({...newUser, confirmPassword: e.target.value})}
                  placeholder="Repita la contraseña"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Rol</Label>
                <Select
                  value={newUser.role}
                  onValueChange={(value) => setNewUser({...newUser, role: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Médico">Médico</SelectItem>
                    <SelectItem value="Enfermero">Enfermero</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant="outline">Cancelar</Button>
              </DialogClose>
              <Button type="submit" onClick={handleAddUser} className="bg-medical-blue hover:bg-medical-blue/90">
                Crear Usuario
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="mr-2 text-medical-purple" size={20} />
            Usuarios del Sistema
          </CardTitle>
          <CardDescription>
            Lista de todos los usuarios registrados en el sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-10">
              <User size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-700">No hay usuarios registrados</h3>
              <p className="text-gray-500 mt-2">No se encontraron usuarios en el sistema.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead>Fecha de registro</TableHead>
                  <TableHead>Último acceso</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell className="flex items-center">
                      <Shield size={14} className="mr-1 text-gray-500" />
                      {user.role}
                    </TableCell>
                    <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                    <TableCell>
                      {user.lastLogin 
                        ? new Date(user.lastLogin).toLocaleDateString() 
                        : 'Nunca'}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setEditingUser(user)}
                              className="text-medical-blue"
                            >
                              <Pencil size={14} />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-md">
                            <DialogHeader>
                              <DialogTitle>Editar Usuario</DialogTitle>
                              <DialogDescription>
                                Actualice la información del usuario
                              </DialogDescription>
                            </DialogHeader>
                            {editingUser && (
                              <div className="space-y-4 py-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Nombre completo</Label>
                                  <Input 
                                    id="edit-name"
                                    value={editingUser.name}
                                    onChange={e => setEditingUser({...editingUser, name: e.target.value})}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-email">Correo electrónico</Label>
                                  <Input 
                                    id="edit-email"
                                    type="email"
                                    value={editingUser.email}
                                    onChange={e => setEditingUser({...editingUser, email: e.target.value})}
                                    disabled={editingUser.email === 'Admin@host.example.com'}
                                  />
                                  {editingUser.email === 'Admin@host.example.com' && (
                                    <p className="text-xs text-amber-500 mt-1">
                                      El correo del administrador no se puede modificar
                                    </p>
                                  )}
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-role">Rol</Label>
                                  <Select
                                    value={editingUser.role}
                                    onValueChange={(value) => setEditingUser({...editingUser, role: value})}
                                    disabled={editingUser.email === 'Admin@host.example.com'}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="Médico">Médico</SelectItem>
                                      <SelectItem value="Enfermero">Enfermero</SelectItem>
                                      <SelectItem value="Técnico">Técnico</SelectItem>
                                      <SelectItem value="Administrador">Administrador</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  {editingUser.email === 'Admin@host.example.com' && (
                                    <p className="text-xs text-amber-500 mt-1">
                                      El rol del administrador no se puede modificar
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <DialogClose asChild>
                                <Button variant="outline">Cancelar</Button>
                              </DialogClose>
                              <Button onClick={handleEditUser} className="bg-medical-blue hover:bg-medical-blue/90">
                                Guardar Cambios
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setUserToDelete(user);
                            setShowDeleteDialog(true);
                          }}
                          className="text-medical-red"
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-medical-red">
              <AlertTriangle className="mr-2" size={18} />
              Confirmar eliminación
            </DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. ¿Está seguro que desea eliminar este usuario?
            </DialogDescription>
          </DialogHeader>
          {userToDelete && (
            <div className="py-4">
              <p className="font-medium">{userToDelete.name}</p>
              <p className="text-sm text-gray-500">{userToDelete.email}</p>
              <p className="text-sm text-gray-500">Rol: {userToDelete.role}</p>
              
              {userToDelete.email === 'Admin@host.example.com' && (
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-sm">
                  <AlertTriangle className="inline-block mr-2" size={14} />
                  No se puede eliminar el usuario administrador del sistema
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancelar</Button>
            </DialogClose>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
              disabled={userToDelete?.email === 'Admin@host.example.com'}
            >
              Eliminar Usuario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
