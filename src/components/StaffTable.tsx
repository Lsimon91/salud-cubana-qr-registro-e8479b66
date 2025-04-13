
import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Edit, 
  Trash2, 
  MoreVertical, 
  ChevronLeft, 
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';
import { db } from '@/db/localDatabase';

// Define the interface for staff
interface StaffMember {
  id?: number;
  nombre: string;
  rol: string;
  especialidad: string;
  email: string;
  telefono: string;
  estado: string;
  created_at?: Date;
  updated_at?: Date;
}

const StaffTable = () => {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStaff, setNewStaff] = useState<Omit<StaffMember, 'id' | 'estado' | 'created_at' | 'updated_at'>>({
    nombre: '',
    rol: '',
    especialidad: '',
    email: '',
    telefono: '',
  });
  const { toast } = useToast();
  
  const itemsPerPage = 5;
  const totalPages = Math.ceil(staff.length / itemsPerPage);
  
  // Load staff data from the database on component mount
  useEffect(() => {
    const loadStaffData = async () => {
      try {
        // Check if we have a staff table, if not create it
        if (!db.tables.some(table => table.name === 'staff')) {
          db.version(db.verno + 1).stores({
            staff: '++id, rol, email'
          });
          await db.open();
        }
        
        // Try to load staff data
        let staffData: StaffMember[] = [];
        
        try {
          // @ts-ignore - This is a dynamic table that might not exist in the TypeScript definitions
          staffData = await db.staff.toArray();
        } catch (err) {
          console.error("Error loading staff data:", err);
          // If there's an error, use mock data
          staffData = [
            {
              id: 1,
              nombre: 'Dra. María González',
              rol: 'Médico',
              especialidad: 'Cardiología',
              email: 'maria.gonzalez@salud.cu',
              telefono: '5355123456',
              estado: 'Activo',
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              id: 2,
              nombre: 'Enf. Juan Pérez',
              rol: 'Enfermero',
              especialidad: 'Emergencias',
              email: 'juan.perez@salud.cu',
              telefono: '5356789012',
              estado: 'Activo',
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              id: 3,
              nombre: 'Tec. Laura Martínez',
              rol: 'Técnico',
              especialidad: 'Radiología',
              email: 'laura.martinez@salud.cu',
              telefono: '5357890123',
              estado: 'Activo',
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              id: 4,
              nombre: 'Dr. Carlos Rodríguez',
              rol: 'Médico',
              especialidad: 'Pediatría',
              email: 'carlos.rodriguez@salud.cu',
              telefono: '5358901234',
              estado: 'Inactivo',
              created_at: new Date(),
              updated_at: new Date()
            },
            {
              id: 5,
              nombre: 'Adm. Sofía Hernández',
              rol: 'Administrador',
              especialidad: 'Sistemas',
              email: 'sofia.hernandez@salud.cu',
              telefono: '5359012345',
              estado: 'Activo',
              created_at: new Date(),
              updated_at: new Date()
            }
          ];
          
          // Add mock data to the database
          try {
            // @ts-ignore - This is a dynamic table
            await db.staff.bulkAdd(staffData);
          } catch (addErr) {
            console.error("Error adding mock staff data:", addErr);
          }
        }
        
        setStaff(staffData);
      } catch (error) {
        console.error("Error in loadStaffData:", error);
        toast({
          title: "Error al cargar datos",
          description: "No se pudieron cargar los datos del personal médico",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadStaffData();
  }, [toast]);
  
  const handleEditStaff = (id: number) => {
    // In a real app, this would open an edit dialog
    console.log(`Editar personal con ID: ${id}`);
  };
  
  const handleDeleteStaff = async (id: number) => {
    try {
      // Delete from the database
      // @ts-ignore - This is a dynamic table
      await db.staff.delete(id);
      
      // Update state
      setStaff(staff.filter(s => s.id !== id));
      
      toast({
        title: "Personal eliminado",
        description: "El miembro del personal ha sido eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error eliminando personal:", error);
      toast({
        title: "Error al eliminar",
        description: "No se pudo eliminar el miembro del personal",
        variant: "destructive",
      });
    }
  };
  
  const handleAddStaff = async () => {
    try {
      const staffRecord: StaffMember = {
        ...newStaff,
        estado: 'Activo',
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Add to the database
      // @ts-ignore - This is a dynamic table
      const newId = await db.staff.add(staffRecord);
      
      // Update state
      setStaff([...staff, { ...staffRecord, id: newId }]);
      
      // Reset form
      setIsAddDialogOpen(false);
      setNewStaff({
        nombre: '',
        rol: '',
        especialidad: '',
        email: '',
        telefono: '',
      });
      
      toast({
        title: "Personal añadido",
        description: "El nuevo miembro del personal ha sido añadido exitosamente",
      });
    } catch (error) {
      console.error("Error añadiendo personal:", error);
      toast({
        title: "Error al añadir",
        description: "No se pudo añadir el nuevo miembro del personal",
        variant: "destructive",
      });
    }
  };
  
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return staff.slice(startIndex, startIndex + itemsPerPage);
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center py-10">
        <div className="h-12 w-12 border-4 border-medical-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Personal Médico</h2>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-medical-blue hover:bg-medical-blue/90">
              <UserPlus className="mr-2 h-4 w-4" />
              Añadir Personal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Personal</DialogTitle>
              <DialogDescription>
                Complete los datos del nuevo miembro del personal médico.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="nombre" className="text-right">
                  Nombre
                </Label>
                <Input
                  id="nombre"
                  value={newStaff.nombre}
                  onChange={(e) => setNewStaff({...newStaff, nombre: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="rol" className="text-right">
                  Rol
                </Label>
                <Select 
                  onValueChange={(value) => setNewStaff({...newStaff, rol: value})}
                  value={newStaff.rol}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Seleccionar rol" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Médico">Médico</SelectItem>
                    <SelectItem value="Enfermero">Enfermero</SelectItem>
                    <SelectItem value="Técnico">Técnico</SelectItem>
                    <SelectItem value="Administrador">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="especialidad" className="text-right">
                  Especialidad
                </Label>
                <Input
                  id="especialidad"
                  value={newStaff.especialidad}
                  onChange={(e) => setNewStaff({...newStaff, especialidad: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="email" className="text-right">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={newStaff.email}
                  onChange={(e) => setNewStaff({...newStaff, email: e.target.value})}
                  className="col-span-3"
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="telefono" className="text-right">
                  Teléfono
                </Label>
                <Input
                  id="telefono"
                  value={newStaff.telefono}
                  onChange={(e) => setNewStaff({...newStaff, telefono: e.target.value})}
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={handleAddStaff} 
                className="bg-medical-blue hover:bg-medical-blue/90"
                disabled={!newStaff.nombre || !newStaff.rol}
              >
                Guardar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {getCurrentPageData().map((person) => (
              <TableRow key={person.id}>
                <TableCell className="font-medium">{person.nombre}</TableCell>
                <TableCell>{person.rol}</TableCell>
                <TableCell>{person.especialidad}</TableCell>
                <TableCell>{person.email}</TableCell>
                <TableCell>{person.telefono}</TableCell>
                <TableCell>
                  <span 
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      person.estado === 'Activo' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {person.estado}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Abrir menú</span>
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => person.id && handleEditStaff(person.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => person.id && handleDeleteStaff(person.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        <span>Eliminar</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {totalPages > 1 && (
        <div className="flex items-center justify-between space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>
          <span className="text-sm text-gray-600">
            Página {currentPage} de {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
          >
            Siguiente
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default StaffTable;
