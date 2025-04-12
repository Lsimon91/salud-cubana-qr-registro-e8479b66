
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
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

interface MedicalRecord {
  id: string;
  date: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  notes: string | null;
  doctor_id: string;
  doctor_name?: string;
}

interface PatientData {
  id: string;
  identity_id: string;
  name: string;
  birth_date: string;
  gender: string;
  address: string;
  phone: string | null;
  email: string | null;
  blood_type: string | null;
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
  const [newRecord, setNewRecord] = useState<Omit<MedicalRecord, 'id' | 'doctor_id'>>({
    date: new Date().toISOString().split('T')[0],
    diagnosis: '',
    treatment: '',
    medications: '',
    notes: ''
  });
  const [doctorName, setDoctorName] = useState('');

  // Calculate age from birth date
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

  // Check if user is authenticated
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        toast({
          title: "No ha iniciado sesión",
          description: "Debe iniciar sesión para acceder a esta página",
          variant: "destructive",
        });
        navigate('/');
      }
    };

    checkAuth();
  }, [navigate, toast]);

  // Get doctor name
  useEffect(() => {
    const getDoctorName = async () => {
      const { data: sessionData } = await supabase.auth.getSession();
      if (sessionData.session) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', sessionData.session.user.id)
          .single();
          
        if (profileData) {
          setDoctorName(profileData.full_name);
        }
      }
    };

    getDoctorName();
  }, []);

  // Load patient data from Supabase
  useEffect(() => {
    const fetchPatient = async () => {
      setLoading(true);
      try {
        // Check if we're creating a new patient (ID will be 'new-patient')
        if (id === 'new-patient') {
          setCreatingNewPatient(true);
          setPatient({
            id: '',
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

        // Query for patient by identity_id (from QR code)
        const { data: patientData, error: patientError } = await supabase
          .from('patients')
          .select('*')
          .eq('identity_id', id)
          .single();

        if (patientError) {
          // If not found by identity_id, try by UUID
          const { data: patientByUuid, error: uuidError } = await supabase
            .from('patients')
            .select('*')
            .eq('id', id)
            .single();
          
          if (uuidError) {
            // Neither found, set creating new patient
            setCreatingNewPatient(true);
            setPatient({
              id: '',
              identity_id: id || '', // Use the scanned ID as identity_id
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
          } else {
            // Found by UUID
            const age = calculateAge(patientByUuid.birth_date);
            setPatient({ ...patientByUuid, age });
            await fetchMedicalRecords(patientByUuid.id);
          }
        } else {
          // Found by identity_id
          const age = calculateAge(patientData.birth_date);
          setPatient({ ...patientData, age });
          await fetchMedicalRecords(patientData.id);
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

    fetchPatient();
  }, [id, toast]);

  // Fetch medical records for a patient
  const fetchMedicalRecords = async (patientId: string) => {
    try {
      const { data: records, error } = await supabase
        .from('medical_records')
        .select(`
          *,
          profiles:doctor_id(full_name)
        `)
        .eq('patient_id', patientId)
        .order('date', { ascending: false });

      if (error) throw error;

      if (records) {
        const formattedRecords = records.map(record => ({
          ...record,
          doctor_name: record.profiles?.full_name
        }));
        setMedicalRecords(formattedRecords);
      }
    } catch (error) {
      console.error("Error fetching medical records:", error);
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
    
    // If changing birth date, recalculate age
    if (field === 'birth_date') {
      const age = calculateAge(value);
      setPatient({
        ...patient,
        [field]: value,
        age
      });
    } else if (field === 'allergies' && typeof value === 'string') {
      // Handle allergies array
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
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "No ha iniciado sesión",
          description: "Debe iniciar sesión para guardar datos",
          variant: "destructive",
        });
        return;
      }

      const userId = sessionData.session.user.id;
      
      // Convert allergies array to proper format if it's a string
      const formattedAllergies = Array.isArray(patient.allergies) 
        ? patient.allergies 
        : patient.allergies.split(',').map(item => item.trim());
      
      // Format patient data for Supabase
      const patientData = {
        identity_id: patient.identity_id,
        name: patient.name,
        birth_date: patient.birth_date,
        gender: patient.gender,
        address: patient.address,
        phone: patient.phone || null,
        email: patient.email || null,
        blood_type: patient.blood_type || null,
        allergies: formattedAllergies,
        created_by: userId
      };
      
      let result;
      
      if (creatingNewPatient) {
        // Insert new patient
        result = await supabase
          .from('patients')
          .insert(patientData)
          .select()
          .single();
      } else {
        // Update existing patient
        result = await supabase
          .from('patients')
          .update(patientData)
          .eq('id', patient.id)
          .select()
          .single();
      }
      
      if (result.error) throw result.error;
      
      // Update patient state with new data
      const updatedPatient = result.data;
      const age = calculateAge(updatedPatient.birth_date);
      setPatient({ ...updatedPatient, age });
      
      // If was creating new patient, now we're not
      if (creatingNewPatient) {
        setCreatingNewPatient(false);
        // Navigate to the new patient's page
        navigate(`/paciente/${updatedPatient.id}`);
      }
      
      toast({
        title: creatingNewPatient ? "Paciente creado" : "Datos actualizados",
        description: creatingNewPatient 
          ? "El paciente ha sido creado exitosamente" 
          : "La información del paciente ha sido actualizada",
      });
      
      // Add activity log
      sonnerToast.success(creatingNewPatient 
        ? "Paciente añadido a la base de datos" 
        : "Información del paciente actualizada");
      
      setEditMode(false);
    } catch (error: any) {
      console.error("Error saving patient data:", error);
      toast({
        title: "Error al guardar",
        description: error.message || "No se pudo guardar la información del paciente",
        variant: "destructive",
      });
    }
  };

  const handleAddRecord = async () => {
    if (!patient) return;
    
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        toast({
          title: "No ha iniciado sesión",
          description: "Debe iniciar sesión para añadir registros",
          variant: "destructive",
        });
        return;
      }

      const userId = sessionData.session.user.id;
      
      // Create medical record
      const { data, error } = await supabase
        .from('medical_records')
        .insert({
          patient_id: patient.id,
          date: newRecord.date,
          diagnosis: newRecord.diagnosis,
          treatment: newRecord.treatment,
          medications: newRecord.medications,
          notes: newRecord.notes,
          doctor_id: userId
        })
        .select(`
          *,
          profiles:doctor_id(full_name)
        `)
        .single();
      
      if (error) throw error;
      
      // Add to medical records state
      const recordWithDoctor = {
        ...data,
        doctor_name: data.profiles?.full_name
      };
      
      setMedicalRecords([recordWithDoctor, ...medicalRecords]);
      
      // Reset form
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
      
      // Switch to medical history tab
      document.querySelector('[data-state="inactive"][data-value="historial"]')?.click();
    } catch (error: any) {
      console.error("Error adding record:", error);
      toast({
        title: "Error al añadir registro",
        description: error.message || "No se pudo añadir el registro médico",
        variant: "destructive",
      });
    }
  };

  const handleDeleteRecord = async (recordId: string) => {
    if (!patient) return;
    
    try {
      const { error } = await supabase
        .from('medical_records')
        .delete()
        .eq('id', recordId);
      
      if (error) throw error;
      
      // Update records state
      setMedicalRecords(medicalRecords.filter(record => record.id !== recordId));
      
      toast({
        title: "Registro eliminado",
        description: "El registro médico ha sido eliminado exitosamente",
      });
    } catch (error: any) {
      console.error("Error deleting record:", error);
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
                id: '',
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
