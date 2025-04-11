
import { useState } from 'react';
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

// Mock data for staff
const mockStaff = [
  {
    id: 1,
    nombre: 'Dra. María González',
    rol: 'Médico',
    especialidad: 'Cardiología',
    email: 'maria.gonzalez@salud.cu',
    telefono: '5355123456',
    estado: 'Activo'
  },
  {
    id: 2,
    nombre: 'Enf. Juan Pérez',
    rol: 'Enfermero',
    especialidad: 'Emergencias',
    email: 'juan.perez@salud.cu',
    telefono: '5356789012',
    estado: 'Activo'
  },
  {
    id: 3,
    nombre: 'Tec. Laura Martínez',
    rol: 'Técnico',
    especialidad: 'Radiología',
    email: 'laura.martinez@salud.cu',
    telefono: '5357890123',
    estado: 'Activo'
  },
  {
    id: 4,
    nombre: 'Dr. Carlos Rodríguez',
    rol: 'Médico',
    especialidad: 'Pediatría',
    email: 'carlos.rodriguez@salud.cu',
    telefono: '5358901234',
    estado: 'Inactivo'
  },
  {
    id: 5,
    nombre: 'Adm. Sofía Hernández',
    rol: 'Administrador',
    especialidad: 'Sistemas',
    email: 'sofia.hernandez@salud.cu',
    telefono: '5359012345',
    estado: 'Activo'
  }
];

interface StaffRecord {
  id: number;
  nombre: string;
  rol: string;
  especialidad: string;
  email: string;
  telefono: string;
  estado: string;
}

const StaffTable = () => {
  const [staff, setStaff] = useState<StaffRecord[]>(mockStaff);
  const [currentPage, setCurrentPage] = useState(1);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newStaff, setNewStaff] = useState({
    nombre: '',
    rol: '',
    especialidad: '',
    email: '',
    telefono: '',
  });
  
  const itemsPerPage = 5;
  const totalPages = Math.ceil(staff.length / itemsPerPage);
  
  const handleEditStaff = (id: number) => {
    // In a real app, this would open an edit dialog
    console.log(`Editar personal con ID: ${id}`);
  };
  
  const handleDeleteStaff = (id: number) => {
    // In a real app, this would confirm deletion
    setStaff(staff.filter(s => s.id !== id));
  };
  
  const handleAddStaff = () => {
    const newId = Math.max(...staff.map(s => s.id)) + 1;
    const staffRecord = {
      id: newId,
      ...newStaff,
      estado: 'Activo'
    };
    
    setStaff([...staff, staffRecord]);
    setIsAddDialogOpen(false);
    setNewStaff({
      nombre: '',
      rol: '',
      especialidad: '',
      email: '',
      telefono: '',
    });
  };
  
  const getCurrentPageData = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return staff.slice(startIndex, startIndex + itemsPerPage);
  };

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
                      <DropdownMenuItem onClick={() => handleEditStaff(person.id)}>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Editar</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem 
                        className="text-red-600"
                        onClick={() => handleDeleteStaff(person.id)}
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
