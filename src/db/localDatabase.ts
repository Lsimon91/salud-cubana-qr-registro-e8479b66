
import Dexie, { Table } from 'dexie';

// Definir interfaces para los modelos de datos
export interface Patient {
  id?: number;
  identity_id: string;
  name: string;
  birth_date: string;
  gender: string;
  address: string;
  phone?: string;
  email?: string;
  blood_type?: string;
  allergies: string[];
  created_at: Date;
  updated_at: Date;
}

export interface MedicalRecord {
  id?: number;
  patient_id: number;
  date: string;
  diagnosis: string;
  treatment: string;
  medications: string;
  notes?: string;
  doctor_id: string;
  doctor_name: string;
  created_at: Date;
  updated_at: Date;
}

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  specialty?: string;
  created_at: Date;
  updated_at: Date;
}

export interface ActivityLog {
  id?: number;
  action: string;
  user_id: string;
  user_name: string;
  details: string;
  created_at: Date;
}

export interface StaffMember {
  id?: number;
  nombre: string;
  rol: string;
  especialidad: string;
  email: string;
  telefono: string;
  estado: string;
  created_at: Date;
  updated_at: Date;
}

// Stats interfaces
export interface StatsData {
  patientsCount: number;
  consultationsCount: number;
  upcomingAppointments: number;
  urgentCases: number;
}

// Definir la clase de la base de datos
class MedicalDB extends Dexie {
  patients!: Table<Patient, number>;
  medicalRecords!: Table<MedicalRecord, number>;
  users!: Table<User, string>;
  activityLogs!: Table<ActivityLog, number>;
  staff!: Table<StaffMember, number>;

  constructor() {
    super('MedicalDB');
    this.version(1).stores({
      patients: '++id, identity_id, name, birth_date',
      medicalRecords: '++id, patient_id, date, doctor_id',
      users: 'id, email, role',
      activityLogs: '++id, user_id, created_at',
      staff: '++id, rol, email'
    });
  }
}

// Crear y exportar una instancia de la base de datos
export const db = new MedicalDB();

// Función para inicializar datos de prueba
export async function initializeDatabase() {
  // Comprobar si ya hay usuarios
  const userCount = await db.users.count();
  if (userCount > 0) return;

  // Crear usuario administrador por defecto
  const adminUser = {
    id: 'admin-user-id',
    email: 'admin@example.com',
    full_name: 'Administrador',
    role: 'Administrador',
    specialty: 'Sistema',
    created_at: new Date(),
    updated_at: new Date()
  };

  const doctorUser = {
    id: 'doctor-user-id',
    email: 'doctor@example.com',
    full_name: 'Dr. Juan Pérez',
    role: 'Doctor',
    specialty: 'Medicina General',
    created_at: new Date(),
    updated_at: new Date()
  };

  // Guardar usuarios
  await db.users.bulkAdd([adminUser, doctorUser]);

  // Crear algunos miembros del personal
  const staffMembers = [
    {
      nombre: 'Dra. María Torres',
      rol: 'Doctor',
      especialidad: 'Cardiología',
      email: 'mtorres@ejemplo.com',
      telefono: '555-1234',
      estado: 'Activo',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Jorge Ramirez',
      rol: 'Enfermero',
      especialidad: 'Cuidados Intensivos',
      email: 'jramirez@ejemplo.com',
      telefono: '555-5678',
      estado: 'Activo',
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      nombre: 'Lic. Ana Silva',
      rol: 'Técnico',
      especialidad: 'Laboratorio',
      email: 'asilva@ejemplo.com',
      telefono: '555-9012',
      estado: 'Activo',
      created_at: new Date(),
      updated_at: new Date()
    }
  ];
  
  await db.staff.bulkAdd(staffMembers);

  // Crear algunos pacientes de ejemplo
  const patients = [
    {
      identity_id: "89061223456",
      name: "Carlos Rodríguez",
      birth_date: "1989-06-12",
      gender: "Masculino",
      address: "Calle Principal 123",
      phone: "555-1234",
      email: "carlos@ejemplo.com",
      blood_type: "O+",
      allergies: ["Penicilina", "Maní"],
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      identity_id: "76052334567",
      name: "Ana Díaz",
      birth_date: "1976-05-23",
      gender: "Femenino",
      address: "Avenida Central 456",
      phone: "555-5678",
      email: "ana@ejemplo.com",
      blood_type: "A-",
      allergies: ["Sulfamidas"],
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      identity_id: "92030545678",
      name: "Miguel Santos",
      birth_date: "1992-03-05",
      gender: "Masculino",
      address: "Plaza Mayor 789",
      phone: "555-9012",
      email: "miguel@ejemplo.com",
      blood_type: "B+",
      allergies: ["Polen", "Ácaros"],
      created_at: new Date(),
      updated_at: new Date()
    }
  ];
  
  // Guardar pacientes
  const patientIds = await db.patients.bulkAdd(patients, { allKeys: true });
  
  // Crear algunos registros médicos
  const medicalRecords = [
    {
      patient_id: patientIds[0] as number,
      date: "2023-04-10",
      diagnosis: "Hipertensión arterial, Diabetes tipo 2",
      treatment: "Control de presión arterial, Dieta baja en carbohidratos",
      medications: "Enalapril 10mg, Metformina 500mg",
      notes: "Paciente responde bien al tratamiento actual",
      doctor_id: doctorUser.id,
      doctor_name: doctorUser.full_name,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      patient_id: patientIds[1] as number,
      date: "2023-04-08",
      diagnosis: "Artritis reumatoide",
      treatment: "Fisioterapia, Antiinflamatorios",
      medications: "Prednisona 5mg, Metotrexato 7.5mg semanal",
      notes: "Programar revisión en 3 meses",
      doctor_id: doctorUser.id,
      doctor_name: doctorUser.full_name,
      created_at: new Date(),
      updated_at: new Date()
    },
    {
      patient_id: patientIds[2] as number,
      date: "2023-04-05",
      diagnosis: "Asma bronquial",
      treatment: "Terapia inhalatoria, Evitar alergenos",
      medications: "Salbutamol inhalador, Fluticasona inhalador",
      notes: "Control mensual recomendado",
      doctor_id: doctorUser.id,
      doctor_name: doctorUser.full_name,
      created_at: new Date(),
      updated_at: new Date()
    }
  ];
  
  await db.medicalRecords.bulkAdd(medicalRecords);

  // Crear log de inicialización
  await db.activityLogs.add({
    action: 'Inicialización del Sistema',
    user_id: adminUser.id,
    user_name: adminUser.full_name,
    details: 'Base de datos inicializada con datos por defecto',
    created_at: new Date()
  });

  console.log('Base de datos inicializada con éxito');
}

// Funciones para obtener estadísticas
export const stats = {
  async getStats(): Promise<StatsData> {
    const now = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);
    
    const sevenDaysAhead = new Date();
    sevenDaysAhead.setDate(now.getDate() + 7);
    
    // Contar pacientes
    const patientsCount = await db.patients.count();
    
    // Contar consultas (registros médicos) de los últimos 30 días
    const consultationsCount = await db.medicalRecords
      .where('date')
      .aboveOrEqual(thirtyDaysAgo.toISOString().split('T')[0])
      .count();
    
    // Para casos urgentes y citas, en una app real estos vendrían de tablas específicas
    // Aquí simplemente proporcionamos datos simulados
    const upcomingAppointments = 18;
    const urgentCases = 3;
    
    return {
      patientsCount,
      consultationsCount,
      upcomingAppointments,
      urgentCases
    };
  }
};

// Exportar funciones de utilidad para la autenticación
export const auth = {
  // Función para iniciar sesión
  async login(email: string, password: string): Promise<User | null> {
    // En una implementación real, debería verificar la contraseña con hash
    // Aquí simplificamos para propósitos de demostración
    if (password !== '123456') return null;
    
    const user = await db.users.where('email').equals(email).first();
    if (user) {
      // Guardar información de sesión
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userId', user.id);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userName', user.full_name);
      localStorage.setItem('userRole', user.role);
      
      // Registrar actividad
      await db.activityLogs.add({
        action: 'Inicio de Sesión',
        user_id: user.id,
        user_name: user.full_name,
        details: `Inicio de sesión exitoso desde ${new Date().toISOString()}`,
        created_at: new Date()
      });
      
      return user;
    }
    return null;
  },
  
  // Función para cerrar sesión
  async logout(): Promise<void> {
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    
    if (userId && userName) {
      await db.activityLogs.add({
        action: 'Cierre de Sesión',
        user_id: userId,
        user_name: userName,
        details: `Cierre de sesión desde ${new Date().toISOString()}`,
        created_at: new Date()
      });
    }
    
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    localStorage.removeItem('userRole');
  },
  
  // Función para obtener el usuario actual
  getCurrentUser(): {id: string, name: string, role: string} | null {
    const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
    if (!isAuthenticated) return null;
    
    return {
      id: localStorage.getItem('userId') || '',
      name: localStorage.getItem('userName') || '',
      role: localStorage.getItem('userRole') || ''
    };
  }
};
