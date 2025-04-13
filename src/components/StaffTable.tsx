
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { 
  PlusCircle, 
  Pencil, 
  Trash2, 
  Search, 
  X, 
  UserPlus 
} from 'lucide-react';
import { db, StaffMember } from '@/db/localDatabase';

const StaffTable = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentStaff, setCurrentStaff] = useState<StaffMember | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    rol: 'Doctor',
    especialidad: '',
    email: '',
    telefono: '',
    estado: 'Activo'
  });
  const { toast } = useToast();

  // Cargar personal
  useEffect(() => {
    const loadStaff = async () => {
      try {
        const staffMembers = await db.staff.toArray();
        setStaff(staffMembers);
      } catch (error) {
        console.error('Error cargando personal:', error);
        toast({
          title: 'Error',
          description: 'No se pudo cargar la lista de personal',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    loadStaff();
  }, [toast]);

  // Filtrar personal según término de búsqueda
  const filteredStaff = staff.filter(member => 
    member.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.rol.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.especialidad.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Abrir diálogo para editar
  const handleEdit = (staffMember: StaffMember) => {
    setCurrentStaff(staffMember);
    setFormData({
      nombre: staffMember.nombre,
      rol: staffMember.rol,
      especialidad: staffMember.especialidad,
      email: staffMember.email,
      telefono: staffMember.telefono,
      estado: staffMember.estado
    });
    setDialogOpen(true);
  };

  // Abrir diálogo para nuevo miembro
  const handleNew = () => {
    setCurrentStaff(null);
    setFormData({
      nombre: '',
      rol: 'Doctor',
      especialidad: '',
      email: '',
      telefono: '',
      estado: 'Activo'
    });
    setDialogOpen(true);
  };

  // Eliminar miembro
  const handleDelete = async (id?: number) => {
    if (!id) return;

    try {
      await db.staff.delete(id);
      setStaff(staff.filter(member => member.id !== id));
      toast({
        title: 'Personal eliminado',
        description: 'El miembro del personal ha sido eliminado exitosamente',
      });
    } catch (error) {
      console.error('Error eliminando personal:', error);
      toast({
        title: 'Error',
        description: 'No se pudo eliminar al miembro del personal',
        variant: 'destructive',
      });
    }
  };

  // Manejar cambios en el formulario
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejar cambios en select
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Guardar cambios
  const handleSave = async () => {
    // Validar campos obligatorios
    if (!formData.nombre || !formData.rol || !formData.email) {
      toast({
        title: 'Campos incompletos',
        description: 'Por favor complete los campos obligatorios',
        variant: 'destructive',
      });
      return;
    }

    try {
      const now = new Date();
      let updatedStaff;

      if (currentStaff) {
        // Actualizar existente
        const staffData = {
          ...formData,
          updated_at: now
        };
        await db.staff.update(currentStaff.id!, staffData);
        
        // Obtener datos actualizados
        updatedStaff = await db.staff.get(currentStaff.id!);
        
        // Actualizar lista
        setStaff(staff.map(member => 
          member.id === currentStaff.id ? updatedStaff! : member
        ));
        
        toast({
          title: 'Personal actualizado',
          description: 'Los datos del personal han sido actualizados exitosamente',
        });
      } else {
        // Crear nuevo
        const staffData = {
          ...formData,
          created_at: now,
          updated_at: now
        };
        
        const id = await db.staff.add(staffData);
        
        // Obtener registro completo
        updatedStaff = await db.staff.get(id);
        
        if (updatedStaff) {
          setStaff([...staff, updatedStaff]);
        }
        
        toast({
          title: 'Personal añadido',
          description: 'El nuevo miembro del personal ha sido añadido exitosamente',
        });
      }

      // Cerrar diálogo
      setDialogOpen(false);
    } catch (error) {
      console.error('Error guardando personal:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron guardar los datos del personal',
        variant: 'destructive',
      });
    }
  };

  // Color de badge según rol
  const getRoleBadgeColor = (role: string) => {
    switch(role.toLowerCase()) {
      case 'doctor':
        return 'bg-blue-100 text-blue-800';
      case 'enfermero':
      case 'enfermera':
        return 'bg-green-100 text-green-800';
      case 'técnico':
        return 'bg-purple-100 text-purple-800';
      case 'administrativo':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  // Color de badge según estado
  const getStatusBadgeColor = (status: string) => {
    switch(status.toLowerCase()) {
      case 'activo':
        return 'bg-green-100 text-green-800';
      case 'inactivo':
        return 'bg-red-100 text-red-800';
      case 'vacaciones':
        return 'bg-blue-100 text-blue-800';
      case 'licencia':
        return 'bg-amber-100 text-amber-800';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="h-8 w-8 border-4 border-t-blue-500 border-blue-200 rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
          <Input
            placeholder="Buscar personal..."
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          {searchTerm && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchTerm('')}
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <Button onClick={handleNew} className="bg-medical-teal hover:bg-medical-teal/90">
          <UserPlus className="mr-2 h-4 w-4" />
          Agregar Personal
        </Button>
      </div>
      
      <Table>
        <TableCaption>Lista del personal médico y administrativo</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Nombre</TableHead>
            <TableHead>Rol</TableHead>
            <TableHead className="hidden md:table-cell">Especialidad</TableHead>
            <TableHead className="hidden md:table-cell">Email</TableHead>
            <TableHead className="hidden md:table-cell">Teléfono</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStaff.length > 0 ? (
            filteredStaff.map((member) => (
              <TableRow key={member.id}>
                <TableCell className="font-medium">{member.nombre}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getRoleBadgeColor(member.rol)}>
                    {member.rol}
                  </Badge>
                </TableCell>
                <TableCell className="hidden md:table-cell">{member.especialidad}</TableCell>
                <TableCell className="hidden md:table-cell">{member.email}</TableCell>
                <TableCell className="hidden md:table-cell">{member.telefono}</TableCell>
                <TableCell>
                  <Badge variant="outline" className={getStatusBadgeColor(member.estado)}>
                    {member.estado}
                  </Badge>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleEdit(member)}
                    className="h-8 w-8 text-blue-600"
                  >
                    <Pencil size={16} />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleDelete(member.id)}
                    className="h-8 w-8 text-red-600"
                  >
                    <Trash2 size={16} />
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-gray-500">
                {searchTerm 
                  ? "No se encontraron resultados para su búsqueda" 
                  : "No hay personal registrado"}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Diálogo para agregar/editar personal */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {currentStaff ? 'Editar Personal' : 'Agregar Nuevo Personal'}
            </DialogTitle>
            <DialogDescription>
              {currentStaff 
                ? 'Modifique los datos del personal según sea necesario' 
                : 'Complete la información para agregar un nuevo miembro del personal'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nombre" className="text-right">
                Nombre*
              </Label>
              <Input
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="rol" className="text-right">
                Rol*
              </Label>
              <Select 
                value={formData.rol} 
                onValueChange={(value) => handleSelectChange('rol', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Doctor">Doctor</SelectItem>
                  <SelectItem value="Enfermero">Enfermero/a</SelectItem>
                  <SelectItem value="Técnico">Técnico</SelectItem>
                  <SelectItem value="Administrativo">Administrativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="especialidad" className="text-right">
                Especialidad
              </Label>
              <Input
                id="especialidad"
                name="especialidad"
                value={formData.especialidad}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">
                Email*
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telefono" className="text-right">
                Teléfono
              </Label>
              <Input
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="estado" className="text-right">
                Estado
              </Label>
              <Select 
                value={formData.estado} 
                onValueChange={(value) => handleSelectChange('estado', value)}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Seleccione un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Activo">Activo</SelectItem>
                  <SelectItem value="Inactivo">Inactivo</SelectItem>
                  <SelectItem value="Vacaciones">Vacaciones</SelectItem>
                  <SelectItem value="Licencia">Licencia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" onClick={handleSave} className="bg-medical-blue hover:bg-medical-blue/90">
              {currentStaff ? 'Guardar Cambios' : 'Agregar Personal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StaffTable;
