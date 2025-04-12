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
  Trash2, 
  AlertTriangle,
  UserPlus
} from 'lucide-react';
import { toast as sonnerToast } from 'sonner';
import { db, Patient as DbPatient, MedicalRecord as DbMedicalRecord } from '@/db/localDatabase';

// Updated to match the DB interface
interface MedicalRecord {
  id?: number;
  patient_id: number;
  date: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  notes?: string | null;
  doctor_id: string;
  doctor_name: string;
}

// Updated to match the DB interface
interface PatientData {
  id?: number;
  identity_id: string;
  name: string;
  birth_date: string;
  gender: string;
  address: string;
  phone?: string | null;
  email?: string | null;
  blood_type?: string | null;
  allergies: string[];
  age?: number;
}

const PatientMedicalHistory = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [patient, setPatient] = useState<PatientData | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [creatingNewPatient, setCreatingNewPatient] = useState(false);
  const [newRecord, setNewRecord] = useState<Omit<MedicalRecord, 'id' | 'doctor_id' | 'doctor_name' | 'patient_id'>>({
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    medications: '',
    notes: ''
  });
  const [doctorName, setDoctorName] = useState('');

  // Calcular edad a partir de la fecha de nacimiento
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birthDateObj = new Date(birthDate);
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const m = today.getMonth() - birthDateObj.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }
    return age;
  };

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      if (!isAuthenticated) {
        toast({
          title: "No ha iniciado sesión",
          description: "Debe iniciar sesión para acceder a esta página",
          variant: "destructive",
        });
        navigate('/');
      } else {
        // Configurar el nombre del doctor desde el almacenamiento local
        const userName = localStorage.getItem('userName');
        if (userName) {
          setDoctorName(userName);
        }
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Cargar datos del paciente desde la base de datos local
  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      try {
        // Comprobar si estamos creando un nuevo paciente (ID será 'new-patient')
        if (id === 'new-patient') {
          setCreatingNewPatient(true);
          setPatient({
            identity_id: '',
            name: '',
            birth_date: new Date().toISOString().split('T')[0],
            gender: '',
            address: '',
            phone: '',
            email: '',
            blood_type: '',
            allergies: [],
            age: 0
          });
          setLoading(false);
          return;
        }

        // Buscar paciente por ID de identidad (del código QR)
        let foundPatient = await db.patients.where('identity_id').equals(id || '').first();
        
        if (!foundPatient && !isNaN(Number(id))) {
          // Si no se encuentra por identity_id, intentar buscar por ID numérico
          foundPatient = await db.patients.get(Number(id));
        }

        if (foundPatient) {
          // Calculamos la edad
          const age = calculateAge(foundPatient.birth_date);
          const patientWithAge: PatientData = { ...foundPatient, age };
          setPatient(patientWithAge);
          
          // Cargar registros médicos del paciente
          if (foundPatient.id) {
            await fetchMedicalRecords(foundPatient.id);
          }
        } else {
          // No se encontró, configurar para crear nuevo paciente
          setCreatingNewPatient(true);
          setPatient({
            identity_id: id || '',
            name: '',
            birth_date: new Date().toISOString().split('T')[0],
            gender: '',
            address: '',
            phone: '',
            email: '',
            blood_type: '',
            allergies: [],
            age: 0
          });
        }
      } catch (error) {
        console.error("Error cargando datos del paciente:", error);
        toast({
          title: "Error de carga",
          description: "No se pudo cargar la información del paciente",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchPatient();
  }, [id, toast]);

  // Obtener registros médicos para un paciente
  const fetchMedicalRecords = async (patientId: number) => {
    try {
      const records = await db.medicalRecords
        .where('patient_id')
        .equals(patientId)
        .toArray();
      
      // Ordenar por fecha (más reciente primero)
      records.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      // Ensure records match our local interface
      const typedRecords: MedicalRecord[] = records.map(record => ({
        id: record.id,
        patient_id: record.patient_id,
        date: record.date,
        diagnosis: record.diagnosis,
        treatment: record.treatment,
        medications: record.medications,
        notes: record.notes,
        doctor_id: record.doctor_id,
        doctor_name: record.doctor_name
      }));
      
      setMedicalRecords(typedRecords);
    } catch (error) {
      console.error("Error obteniendo registros médicos:", error);
      toast({
        title: "Error de carga",
        description: "No se pudieron cargar los registros médicos",
        variant: "destructive",
      });
    }
  };

  const handleEditToggle = () => {
    setEditMode(!editMode);
  };

  const handlePatientDataChange = (field: keyof PatientData, value: any) => {
    if (!patient) return;
    
    // Si se cambia la fecha de nacimiento, recalcular la edad
    if (field === 'birth_date') {
      const age = calculateAge(value);
      setPatient({
        ...patient,
        [field]: value,
        age
      });
    } else if (field === 'allergies' && typeof value === 'string') {
      // Manejar array de alergias
      setPatient({
        ...patient,
        allergies: value.split(',').map(item => item.trim()).filter(item => item)
      });
    } else {
      setPatient({
        ...patient,
        [field]: value
      });
    }
  };

  const handleSavePatientData = async () => {
    if (!patient) return;
    
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        toast({
          title: "No ha iniciado sesión",
          description: "Debe iniciar sesión para guardar datos",
          variant: "destructive",
        });
        return;
      }

      // Convertir alergias a formato adecuado si es un string
      const formattedAllergies = Array.isArray(patient.allergies) 
        ? patient.allergies 
        : (patient.allergies as unknown as string).split(',').map(item => item.trim());
      
      // Preparar datos del paciente
      const patientData: DbPatient = {
        identity_id: patient.identity_id,
        name: patient.name,
        birth_date: patient.birth_date,
        gender: patient.gender,
        address: patient.address,
        phone: patient.phone || null,
        email: patient.email || null,
        blood_type: patient.blood_type || null,
        allergies: formattedAllergies,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      let patientId;
      
      if (creatingNewPatient) {
        // Insertar nuevo paciente
        patientId = await db.patients.add(patientData);
        
        // Registrar actividad
        await db.activityLogs.add({
          action: 'Registro de Paciente',
          user_id: userId,
          user_name: localStorage.getItem('userName') || 'Usuario desconocido',
          details: `Paciente ${patientData.name} (ID: ${patientData.identity_id}) registrado`,
          created_at: new Date()
        });
      } else {
        // Actualizar paciente existente
        if (patient.id) {
          patientData.created_at = (await db.patients.get(patient.id))?.created_at || new Date();
          await db.patients.update(patient.id, patientData);
          patientId = patient.id;
          
          // Registrar actividad
          await db.activityLogs.add({
            action: 'Actualización de Paciente',
            user_id: userId,
            user_name: localStorage.getItem('userName') || 'Usuario desconocido',
            details: `Información del paciente ${patientData.name} (ID: ${patientData.identity_id}) actualizada`,
            created_at: new Date()
          });
        }
      }
      
      // Obtener el paciente actualizado
      if (patientId) {
        const updatedPatient = await db.patients.get(patientId);
        if (updatedPatient) {
          const age = calculateAge(updatedPatient.birth_date);
          const patientWithAge: PatientData = { ...updatedPatient, age };
          setPatient(patientWithAge);
        }
        
        // Si estábamos creando un nuevo paciente, ahora no lo estamos
        if (creatingNewPatient) {
          setCreatingNewPatient(false);
          // Navegar a la página del nuevo paciente
          navigate(`/paciente/${updatedPatient?.identity_id || patientId}`);
        }
      }
      
      toast({
        title: creatingNewPatient ? "Paciente creado" : "Datos actualizados",
        description: creatingNewPatient 
          ? "El paciente ha sido creado exitosamente" 
          : "La información del paciente ha sido actualizada",
      });
      
      // Añadir log de actividad
      sonnerToast.success(creatingNewPatient 
        ? "Paciente añadido a la base de datos" 
        : "Información del paciente actualizada");
      
      setEditMode(false);
    } catch (error: any) {
      console.error("Error guardando datos del paciente:", error);
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo guardar la información del paciente",
        variant: "destructive",
      });
    }
  };

  const handleAddRecord = async () => {
    if (!patient || !patient.id) return;
    
    try {
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      
      if (!userId || !userName) {
        toast({
          title: "No ha iniciado sesión",
          description: "Debe iniciar sesión para añadir registros",
          variant: "destructive",
        });
        return;
      }
      
      // Crear registro médico
      const recordData: DbMedicalRecord = {
        patient_id: patient.id,
        date: newRecord.date,
        diagnosis: newRecord.diagnosis,
        treatment: newRecord.treatment,
        medications: newRecord.medications,
        notes: newRecord.notes,
        doctor_id: userId,
        doctor_name: userName,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      // Guardar en la base de datos
      const recordId = await db.medicalRecords.add(recordData);
      
      // Obtener el registro completo
      const savedRecord = await db.medicalRecords.get(recordId);
      
      if (savedRecord) {
        // Convert to our local interface and add to state
        const typedRecord: MedicalRecord = {
          id: savedRecord.id,
          patient_id: savedRecord.patient_id,
          date: savedRecord.date,
          diagnosis: savedRecord.diagnosis,
          treatment: savedRecord.treatment,
          medications: savedRecord.medications,
          notes: savedRecord.notes,
          doctor_id: savedRecord.doctor_id,
          doctor_name: savedRecord.doctor_name
        };
        
        // Añadir al estado
        setMedicalRecords([typedRecord, ...medicalRecords]);
      }
      
      // Reiniciar formulario
      setNewRecord({
        date: new Date().toISOString().split('T')[0],
        diagnosis: '',
        treatment: '',
        medications: '',
        notes: ''
      });
      
      toast({
        title: "Registro añadido",
        description: "El registro médico ha sido añadido exitosamente",
      });
      
      // Registrar actividad
      await db.activityLogs.add({
        action: 'Nuevo Registro Médico',
        user_id: userId,
        user_name: userName,
        details: `Registro médico añadido para paciente ${patient.name} (ID: ${patient.identity_id})`,
        created_at: new Date()
      });
      
      // Cambiar a la pestaña de historial médico
      const historialTab = document.querySelector('[data-value="historial"]');
      if (historialTab instanceof HTMLElement) {
        historialTab.click();
      }
    } catch (error: any) {
      console.error("Error añadiendo registro:", error);
      toast({
        title: "Error al añadir registro",
        description: error.message || "No se pudo añadir el registro médico",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecord = async (recordId: number) => {
    if (!patient) return;
    
    try {
      // Eliminar de la base de datos
      await db.medicalRecords.delete(recordId);
      
      // Actualizar estado
      setMedicalRecords(medicalRecords.filter(record => record.id !== recordId));
      
      toast({
        title: "Registro eliminado",
        description: "El registro médico ha sido eliminado exitosamente",
      });
      
      // Registrar actividad
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      
      if (userId && userName) {
        await db.activityLogs.add({
          action: 'Eliminación de Registro Médico',
          user_id: userId,
          user_name: userName,
          details: `Registro médico eliminado para paciente ${patient.name} (ID: ${patient.identity_id})`,
          created_at: new Date()
        });
      }
    } catch (error: any) {
      console.error("Error eliminando registro:", error);
      toast({
        title: "Error al eliminar",
        description: error.message || "No se pudo eliminar el registro médico",
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

  if (!patient && !creatingNewPatient) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-center mb-8">
          <FileText size={48} className="mx-auto text-gray-400 mb-4" />
          <h2 className="text-2xl font-bold text-gray-700">Paciente no encontrado</h2>
          <p className="text-gray-500 mt-2">No se encontró información para este paciente en el sistema.</p>
        </div>
        <div className="flex space-x-4">
          <Button onClick={() => navigate('/escanear')} className="bg-medical-blue hover:bg-medical-blue/90">
            Escanear otro paciente
          </Button>
          <Button 
            onClick={() => {
              setCreatingNewPatient(true);
              setPatient({
                identity_id: id || '',
                name: '',
                birth_date: new Date().toISOString().split('T')[0],
                gender: '',
                address: '',
                phone: '',
                email: '',
                blood_type: '',
                allergies: [],
                age: 0
              });
              setEditMode(true);
            }} 
            className="bg-medical-teal hover:bg-medical-teal/90"
          >
            <UserPlus className="mr-2" size={16} />
            Crear nuevo paciente
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 px-4">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">
            {creatingNewPatient ? 'Crear Nuevo Paciente' : 'Historial Médico'}
          </h1>
          {!creatingNewPatient && (
            <p className="text-gray-600">
              Paciente: {patient?.name} | ID: {patient?.identity_id}
            </p>
          )}
          {creatingNewPatient && (
            <p className="text-gray-600 flex items-center">
              <AlertTriangle className="text-amber-500 mr-1" size={16} />
              Complete la información y guarde para crear el paciente
            </p>
          )}
        </div>
        {!creatingNewPatient && (
          <Button 
            onClick={handleEditToggle} 
            variant={editMode ? "destructive" : "outline"}
            className={editMode ? "" : "border-medical-teal text-medical-teal"}
          >
            {editMode ? "Cancelar Edición" : "Editar Información"}
          </Button>
        )}
      </div>

      <Tabs defaultValue={creatingNewPatient ? "informacion" : "historial"}>
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="informacion">Información Personal</TabsTrigger>
          <TabsTrigger value="historial" disabled={creatingNewPatient}>Historial Clínico</TabsTrigger>
          <TabsTrigger value="nuevo" disabled={creatingNewPatient}>Agregar Registro</TabsTrigger>
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
                {creatingNewPatient 
                  ? 'Ingrese los datos personales del nuevo paciente' 
                  : 'Datos personales y de contacto del paciente'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="identity_id">Número de identificación</Label>
                  <Input 
                    id="identity_id"
                    value={patient?.identity_id || ''}
                    onChange={e => handlePatientDataChange('identity_id', e.target.value)}
                    disabled={!editMode}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input 
                    id="name"
                    value={patient?.name || ''}
                    onChange={e => handlePatientDataChange('name', e.target.value)}
                    disabled={!editMode}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="birth_date">Fecha de Nacimiento</Label>
                  <div className="flex items-center">
                    <Calendar className="mr-2 text-gray-500" size={16} />
                    <Input 
                      id="birth_date"
                      type="date"
                      value={patient?.birth_date || ''}
                      onChange={e => handlePatientDataChange('birth_date', e.target.value)}
                      disabled={!editMode}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Género</Label>
                  <Input 
                    id="gender"
                    value={patient?.gender || ''}
                    onChange={e => handlePatientDataChange('gender', e.target.value)}
                    disabled={!editMode}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">Edad</Label>
                  <Input 
                    id="age"
                    type="number"
                    value={patient?.age || 0}
                    disabled={true}
                  />
                  <p className="text-xs text-gray-500">Calculada automáticamente</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección</Label>
                  <div className="flex items-center">
                    <MapPin className="mr-2 text-gray-500" size={16} />
                    <Input 
                      id="address"
                      value={patient?.address || ''}
                      onChange={e => handlePatientDataChange('address', e.target.value)}
                      disabled={!editMode}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono</Label>
                  <div className="flex items-center">
                    <Phone className="mr-2 text-gray-500" size={16} />
                    <Input 
                      id="phone"
                      value={patient?.phone || ''}
                      onChange={e => handlePatientDataChange('phone', e.target.value)}
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
                      value={patient?.email || ''}
                      onChange={e => handlePatientDataChange('email', e.target.value)}
                      disabled={!editMode}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood_type">Grupo Sanguíneo</Label>
                  <Input 
                    id="blood_type"
                    value={patient?.blood_type || ''}
                    onChange={e => handlePatientDataChange('blood_type', e.target.value)}
                    disabled={!editMode}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Alergias</Label>
                <Textarea 
                  id="allergies"
                  value={Array.isArray(patient?.allergies) ? patient?.allergies.join(', ') : patient?.allergies || ''}
                  onChange={e => handlePatientDataChange('allergies', e.target.value)}
                  disabled={!editMode}
                  placeholder="Separe las alergias con comas"
                />
              </div>
            </CardContent>
            {(editMode || creatingNewPatient) && (
              <CardFooter>
                <Button 
                  onClick={handleSavePatientData} 
                  className="ml-auto bg-medical-blue hover:bg-medical-blue/90"
                >
                  <Save className="mr-2" size={16} />
                  {creatingNewPatient ? 'Crear Paciente' : 'Guardar Cambios'}
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
              {medicalRecords && medicalRecords.length > 0 ? (
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
                    {medicalRecords.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell className="font-medium">{new Date(record.date).toLocaleDateString()}</TableCell>
                        <TableCell>{record.diagnosis}</TableCell>
                        <TableCell>{record.treatment}</TableCell>
                        <TableCell>{record.medications}</TableCell>
                        <TableCell>{record.doctor_name}</TableCell>
                        <TableCell>
                          <Button 
                            variant="destructive" 
                            size="sm" 
                            onClick={() => record.id && handleDeleteRecord(record.id)}
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
                    value={doctorName}
                    disabled
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
                  value={newRecord.notes || ''}
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
