
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Download, Filter } from 'lucide-react';

// Mock activity log data
const activityLogs = [
  {
    id: 1,
    usuario: "Dra. María González",
    accion: "Consulta de paciente",
    detalles: "Consulta del historial médico del paciente Carlos Rodríguez (ID: 89061223456)",
    fecha: "2023-04-10 10:23:45",
    ip: "192.168.1.103"
  },
  {
    id: 2,
    usuario: "Adm. Sofía Hernández",
    accion: "Creación de usuario",
    detalles: "Creación de nuevo usuario: Tec. Laura Martínez (Técnico - Radiología)",
    fecha: "2023-04-10 09:15:32",
    ip: "192.168.1.105"
  },
  {
    id: 3,
    usuario: "Enf. Juan Pérez",
    accion: "Actualización de tratamiento",
    detalles: "Actualización del tratamiento del paciente Ana Díaz (ID: 76052334567)",
    fecha: "2023-04-09 16:45:21",
    ip: "192.168.1.110"
  },
  {
    id: 4,
    usuario: "Dr. Carlos Rodríguez",
    accion: "Registro de diagnóstico",
    detalles: "Nuevo diagnóstico para el paciente Miguel Santos (ID: 92030545678)",
    fecha: "2023-04-09 14:30:45",
    ip: "192.168.1.112"
  },
  {
    id: 5,
    usuario: "Tec. Laura Martínez",
    accion: "Subida de resultados",
    detalles: "Subida de resultados de radiografía para el paciente Carlos Rodríguez (ID: 89061223456)",
    fecha: "2023-04-09 11:20:33",
    ip: "192.168.1.108"
  }
];

const ActivityLog = () => {
  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Registro de Actividades</h2>
        
        <Button variant="outline" className="flex items-center gap-2">
          <Download size={16} />
          Exportar Logs
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <Input
            placeholder="Buscar en logs..."
            className="pl-10"
          />
        </div>
        
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Tipo de acción" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas las acciones</SelectItem>
            <SelectItem value="consulta">Consulta</SelectItem>
            <SelectItem value="creacion">Creación</SelectItem>
            <SelectItem value="actualizacion">Actualización</SelectItem>
            <SelectItem value="eliminacion">Eliminación</SelectItem>
          </SelectContent>
        </Select>
        
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="Usuario" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los usuarios</SelectItem>
            <SelectItem value="medico">Médicos</SelectItem>
            <SelectItem value="enfermero">Enfermeros</SelectItem>
            <SelectItem value="tecnico">Técnicos</SelectItem>
            <SelectItem value="admin">Administradores</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuario</TableHead>
              <TableHead>Acción</TableHead>
              <TableHead>Detalles</TableHead>
              <TableHead>Fecha y Hora</TableHead>
              <TableHead>IP</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activityLogs.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-medium">{log.usuario}</TableCell>
                <TableCell>{log.accion}</TableCell>
                <TableCell className="max-w-xs truncate">{log.detalles}</TableCell>
                <TableCell>{log.fecha}</TableCell>
                <TableCell>{log.ip}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Mostrando 5 de 145 registros de actividad
      </div>
    </div>
  );
};

export default ActivityLog;
