
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
