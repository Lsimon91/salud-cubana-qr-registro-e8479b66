
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  FileText, 
  Pill, 
  Stethoscope, 
  Calendar, 
  User, 
  Phone, 
  MapPin, 
  Mail, 
  Save, 
  Plus, 
  Trash2
} from 'lucide-react';

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  notes: string;
  doctor: string;
}

interface PatientData {
  id: string;
  nombre: string;
  fechaNacimiento: string;
  edad: number;
  genero: string;
  direccion: string;
  telefono?: string;
  email?: string;
  alergias: string[];
  grupoSanguineo?: string;
  historiaClinica: MedicalRecord[];
}

const PatientMedicalHistory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [newRecord, setNewRecord] = useState<Omit<MedicalRecord, 'id'>>({
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    medications: '',
    notes: '',
    doctor: localStorage.getItem('userName') || 'Doctor sin especificar'
  });

  // Load patient data from localStorage
  useEffect(() => {
    setLoading(true);
    const loadPatient = () => {
      try {
        // Get the patients database from localStorage
        const patientsDB = localStorage.getItem('patientsDB');
        if (patientsDB) {
          const patients: PatientData[] = JSON.parse(patientsDB);
          const foundPatient = patients.find(p => p.id === id);
          
          if (foundPatient) {
            setPatient(foundPatient);
          } else {
            toast({
              title: "Paciente no encontrado",
              description: "No se encontró información para este paciente",
              variant: "destructive",
            });
          }
        }
      } catch (error) {
        console.error("Error loading patient data:", error);
        toast({
          title: "Error de carga",
          description: "No se pudo cargar la información del paciente",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    loadPatient();
  }, [id, toast]);

  const savePatientData = (updatedPatient: PatientData) => {
    try {
      // Get current patients database
      const patientsDB = localStorage.getItem('patientsDB');
      let patients: PatientData[] = patientsDB ? JSON.parse(patientsDB) : [];
      
      // Find and update the patient
      const patientIndex = patients.findIndex(p => p.id === updatedPatient.id);
      
      if (patientIndex !== -1) {
        patients[patientIndex] = updatedPatient;
      } else {
        patients.push(updatedPatient);
      }
      
      // Save back to localStorage
      localStorage.setItem('patientsDB', JSON.stringify(patients));
      
      // Add activity log
      const activityLog = localStorage.getItem('activityLog');
      const activities = activityLog ? JSON.parse(activityLog) : [];
      activities.push({
        id: Date.now().toString(),
        user: localStorage.getItem('userName') || 'Usuario desconocido',
        action: patientIndex !== -1 ? 'Actualización de historial médico' : 'Creación de historial médico',
        patient: updatedPatient.nombre,
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('activityLog', JSON.stringify(activities));
      
      toast({
        title: "Guardado exitosamente",
        description: "La información del paciente ha sido actualizada",
      });
      
      return true;
    } catch (error) {
      console.error("Error saving patient data:", error);
      toast({
        title: "Error al guardar",
        description: "No se pudo guardar la información del paciente",
        variant: "destructive",
      });
      return false;
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handlePatientDataChange = (field: keyof PatientData, value: any) => {
    if (!patient) return;
    
    setPatient({
      ...patient,
      [field]: value
    });
  };

  const handleSavePatientData = () => {
    if (!patient) return;
    
    const success = savePatientData(patient);
    if (success) {
      setEditMode(false);
    }
  };

  const handleAddRecord = () => {
    if (!patient) return;
    
    const newMedicalRecord: MedicalRecord = {
      id: Date.now().toString(),
      ...newRecord
    };
    
    const updatedPatient = {
      ...patient,
      historiaClinica: [...patient.historiaClinica, newMedicalRecord]
    };
    
    const success = savePatientData(updatedPatient);
    if (success) {
      setPatient(updatedPatient);
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        diagnosis: '',
        treatment: '',
        medications: '',
        notes: '',
        doctor: localStorage.getItem('userName') || 'Doctor sin especificar'
      });
    }
  };

  const handleDeleteRecord = (recordId: string) => {
    if (!patient) return;
    
    const updatedRecords = patient.historiaClinica.filter(record => record.id !== recordId);
    const updatedPatient = {
      ...patient,
      historiaClinica: updatedRecords
    };
    
    const success = savePatientData(updatedPatient);
    if (success) {
      setPatient(updatedPatient);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="h-16 w-16 border-4 border-medical-blue border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-8">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Paciente no encontrado</h2>
          <p className="text-gray-500 mt-2">No se encontró información para este paciente en el sistema.</p>
        </div>
        <Button onClick={() => navigate('/escanear')} className="bg-medical-blue hover:bg-medical-blue/90">
          Escanear otro paciente
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Historial Médico</h1>
          <p className="text-gray-600">
            Paciente: {patient.nombre} | ID: {patient.id}
          </p>
        </div>
        <Button 
          onClick={handleEditToggle} 
          variant={editMode ? "destructive" : "outline"}
          className={editMode ? "" : "border-medical-teal text-medical-teal"}
        >
          {editMode ? "Cancelar Edición" : "Editar Información"}
        </Button>
      </div>

      <Tabs defaultValue="informacion">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="informacion">Información Personal</TabsTrigger>
          <TabsTrigger value="historial">Historial Clínico</TabsTrigger>
          <TabsTrigger value="nuevo">Agregar Registro</TabsTrigger>
        </TabsList>

        {/* Información Personal Tab */}
        <TabsContent value="informacion">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 text-medical-purple" size={20} />
                Información Personal
              </CardTitle>
              <CardDescription>
                Datos personales y de contacto del paciente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="nombre">Nombre Completo</Label>
                  <Input 
                    id="nombre"
                    value={patient.nombre}
                    onChange={e => handlePatientDataChange('nombre', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fechaNacimiento">Fecha de Nacimiento</Label>
                  <div className="flex items-center">
                    <Calendar className="mr-2 text-gray-500" size={16} />
                    <Input 
                      id="fechaNacimiento"
                      type="date"
                      value={patient.fechaNacimiento}
                      onChange={e => handlePatientDataChange('fechaNacimiento', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="genero">Género</Label>
                  <Input 
                    id="genero"
                    value={patient.genero}
                    onChange={e => handlePatientDataChange('genero', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edad">Edad</Label>
                  <Input 
                    id="edad"
                    type="number"
                    value={patient.edad}
                    onChange={e => handlePatientDataChange('edad', parseInt(e.target.value))}
                    disabled={!editMode}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="direccion">Dirección</Label>
                  <div className="flex items-center">
                    <MapPin className="mr-2 text-gray-500" size={16} />
                    <Input 
                      id="direccion"
                      value={patient.direccion}
                      onChange={e => handlePatientDataChange('direccion', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="telefono">Teléfono</Label>
                  <div className="flex items-center">
                    <Phone className="mr-2 text-gray-500" size={16} />
                    <Input 
                      id="telefono"
                      value={patient.telefono || ''}
                      onChange={e => handlePatientDataChange('telefono', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Correo electrónico</Label>
                  <div className="flex items-center">
                    <Mail className="mr-2 text-gray-500" size={16} />
                    <Input 
                      id="email"
                      type="email"
                      value={patient.email || ''}
                      onChange={e => handlePatientDataChange('email', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="grupoSanguineo">Grupo Sanguíneo</Label>
                  <Input 
                    id="grupoSanguineo"
                    value={patient.grupoSanguineo || ''}
                    onChange={e => handlePatientDataChange('grupoSanguineo', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="alergias">Alergias</Label>
                <Textarea 
                  id="alergias"
                  value={patient.alergias.join(', ')}
                  onChange={e => handlePatientDataChange('alergias', e.target.value.split(', '))}
                  disabled={!editMode}
                  placeholder="Separe las alergias con comas"
                />
              </div>
            </CardContent>
            {editMode && (
              <CardFooter>
                <Button 
                  onClick={handleSavePatientData} 
                  className="ml-auto bg-medical-blue hover:bg-medical-blue/90"
                >
                  <Save className="mr-2" size={16} />
                  Guardar Cambios
                </Button>
              </CardFooter>
            )}
          </Card>
        </TabsContent>

        {/* Historial Clínico Tab */}
        <TabsContent value="historial">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 text-medical-blue" size={20} />
                Historial Clínico
              </CardTitle>
              <CardDescription>
                Registros médicos históricos del paciente
              </CardDescription>
            </CardHeader>
            <CardContent>
              {patient.historiaClinica && patient.historiaClinica.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Diagnóstico</TableHead>
                      <TableHead>Tratamiento</TableHead>
                      <TableHead>Medicamentos</TableHead>
                      <TableHead>Médico</TableHead>
                      <TableHead>Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {patient.historiaClinica.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{record.date}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{record.treatment}</TableCell>
                        <TableCell>{record.medications}</TableCell>
                        <TableCell>{record.doctor}</TableCell>
                        <TableCell>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => handleDeleteRecord(record.id)}
                          >
                            <Trash2 size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-10">
                  <FileText size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700">No hay registros médicos</h3>
                  <p className="text-gray-500 mt-2">Este paciente no tiene registros médicos en el sistema.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Agregar Nuevo Registro Tab */}
        <TabsContent value="nuevo">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="mr-2 text-medical-teal" size={20} />
                Nuevo Registro Médico
              </CardTitle>
              <CardDescription>
                Agregar un nuevo registro al historial médico del paciente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="date">Fecha</Label>
                  <Input 
                    id="date"
                    type="date"
                    value={newRecord.date}
                    onChange={e => setNewRecord({...newRecord, date: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doctor">Médico</Label>
                  <Input 
                    id="doctor"
                    value={newRecord.doctor}
                    onChange={e => setNewRecord({...newRecord, doctor: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center mb-2">
                  <FileText size={18} className="text-medical-blue mr-2" />
                  <Label htmlFor="diagnosis">Diagnóstico</Label>
                </div>
                <Textarea 
                  id="diagnosis"
                  value={newRecord.diagnosis}
                  onChange={e => setNewRecord({...newRecord, diagnosis: e.target.value})}
                  placeholder="Ingrese el diagnóstico detallado"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center mb-2">
                  <Stethoscope size={18} className="text-medical-teal mr-2" />
                  <Label htmlFor="treatment">Tratamiento</Label>
                </div>
                <Textarea 
                  id="treatment"
                  value={newRecord.treatment}
                  onChange={e => setNewRecord({...newRecord, treatment: e.target.value})}
                  placeholder="Describa el tratamiento recomendado"
                />
              </div>

              <div className="space-y-2">
                <div className="flex items-center mb-2">
                  <Pill size={18} className="text-medical-purple mr-2" />
                  <Label htmlFor="medications">Medicamentos</Label>
                </div>
                <Textarea 
                  id="medications"
                  value={newRecord.medications}
                  onChange={e => setNewRecord({...newRecord, medications: e.target.value})}
                  placeholder="Liste los medicamentos prescritos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notas adicionales</Label>
                <Textarea 
                  id="notes"
                  value={newRecord.notes}
                  onChange={e => setNewRecord({...newRecord, notes: e.target.value})}
                  placeholder="Notas adicionales sobre el paciente o tratamiento"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleAddRecord} 
                className="ml-auto bg-medical-teal hover:bg-medical-teal/90"
              >
                <Plus className="mr-2" size={16} />
                Agregar Registro
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PatientMedicalHistory;
