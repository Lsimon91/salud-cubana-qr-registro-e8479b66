
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from '@/hooks/use-toast';

// Admin credentials
const ADMIN_EMAIL = "Admin@host.example.com";
const ADMIN_PASSWORD = "1Z2x3c4v";

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password || !role) {
      toast({
        title: "Error de validación",
        description: "Por favor complete todos los campos",
        variant: "destructive",
      });
      return;
    }
    
    setLoading(true);
    
    // Check if credentials match admin user
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      setTimeout(() => {
        setLoading(false);
        
        toast({
          title: "Inicio de sesión exitoso",
          description: "Bienvenido/a, Administrador",
        });
        
        // Save admin info to localStorage
        localStorage.setItem('userRole', 'Administrador');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', email);
        localStorage.setItem('userName', 'Administrador Principal');
        
        // Redirect to dashboard
        navigate('/dashboard');
      }, 1000);
      return;
    }
    
    // Simulated login logic for other users
    setTimeout(() => {
      setLoading(false);
      
      // Mock successful login
      toast({
        title: "Inicio de sesión exitoso",
        description: `Bienvenido/a. Has iniciado sesión como ${role}`,
      });
      
      // Save user info to localStorage (in a real app, this would use secure cookies and JWT)
      localStorage.setItem('userRole', role);
      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userEmail', email);
      
      // Redirect to dashboard
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Iniciar Sesión</CardTitle>
        <CardDescription className="text-center">
          Ingrese sus credenciales para acceder al sistema
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <Input
              id="email"
              type="email"
              placeholder="usuario@salud.cu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Contraseña</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Rol</Label>
            <Select onValueChange={setRole} value={role}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccione su rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Médico">Médico</SelectItem>
                <SelectItem value="Enfermero">Enfermero</SelectItem>
                <SelectItem value="Técnico">Técnico</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            type="submit" 
            className="w-full bg-medical-blue hover:bg-medical-blue/90"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center">
                <div className="h-4 w-4 rounded-full border-2 border-white border-t-transparent animate-spin mr-2"></div>
                Iniciando sesión...
              </div>
            ) : (
              'Iniciar Sesión'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center">
        <p className="text-sm text-gray-500">
          ¿Problemas para acceder? Contacte al administrador del sistema
        </p>
      </CardFooter>
    </Card>
  );
};

export default LoginForm;
