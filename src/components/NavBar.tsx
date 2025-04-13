
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu, User, Bell, LogOut, ChevronDown, Users, QrCode, Activity, Home, Settings, Database, Shield } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const NavBar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [userInitials, setUserInitials] = useState<string>("UC");
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const storedRole = localStorage.getItem('userRole') || '';
    const storedName = localStorage.getItem('userName') || '';
    const email = localStorage.getItem('userEmail') || '';
    
    setUserRole(storedRole);
    
    // Use stored name or generate from email
    if (storedName) {
      setUserName(storedName);
      // Generate initials from name
      const initials = storedName
        .split(' ')
        .map(name => name[0])
        .join('')
        .toUpperCase()
        .substring(0, 2);
      setUserInitials(initials);
    } else if (email) {
      const nameFromEmail = email.split('@')[0];
      setUserName(nameFromEmail);
      // Generate initials from email
      const initials = nameFromEmail.substring(0, 2).toUpperCase();
      setUserInitials(initials);
    }
  }, []);

  const handleLogout = () => {
    // Clear authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    
    toast({
      title: "Cerrando sesión",
      description: "Has cerrado sesión correctamente.",
    });
    
    // Redirect to login
    navigate('/');
  };

  const isAdmin = userRole === 'Administrador';

  return (
    <nav className="bg-white border-b shadow-sm py-3 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/dashboard" className="flex items-center">
            <span className="text-medical-blue text-xl font-bold">Salud</span>
            <span className="text-medical-teal text-xl font-bold">Cubana</span>
          </Link>
          
          <div className="hidden md:flex ml-10 space-x-6">
            <Link to="/dashboard" className="text-gray-600 hover:text-medical-blue flex items-center">
              <Home className="mr-1" size={16} />
              Dashboard
            </Link>
            <Link to="/escanear" className="text-gray-600 hover:text-medical-blue flex items-center">
              <QrCode className="mr-1" size={16} />
              Escanear QR
            </Link>
            <Link to="/actividad" className="text-gray-600 hover:text-medical-blue flex items-center">
              <Activity className="mr-1" size={16} />
              Actividad
            </Link>
            <Link to="/personal" className="text-gray-600 hover:text-medical-blue flex items-center">
              <User className="mr-1" size={16} />
              Personal
            </Link>
            {isAdmin && (
              <Link to="/admin" className="text-gray-600 hover:text-medical-blue flex items-center">
                <Shield className="mr-1" size={16} />
                Administración
              </Link>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full hover:bg-gray-100 relative">
            <Bell size={20} className="text-gray-600" />
            <span className="absolute top-0 right-0 w-2 h-2 bg-medical-red rounded-full"></span>
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-medical-purple text-white">{userInitials}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span>{userName}</span>
                  <span className="text-xs text-gray-500">{userRole}</span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/perfil')}>
                <User className="mr-2 h-4 w-4" />
                <span>Mi Perfil</span>
              </DropdownMenuItem>
              {isAdmin && (
                <>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/admin')}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>Panel Admin</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/usuarios')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Gestionar Usuarios</span>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Cerrar sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            className="md:hidden p-2 rounded-full hover:bg-gray-100"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu size={20} className="text-gray-600" />
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden mt-3 px-4 py-2 bg-white border-t">
          <Link to="/dashboard" className="block py-2 text-gray-600 hover:text-medical-blue flex items-center">
            <Home className="mr-2" size={16} />
            Dashboard
          </Link>
          <Link to="/escanear" className="block py-2 text-gray-600 hover:text-medical-blue flex items-center">
            <QrCode className="mr-2" size={16} />
            Escanear QR
          </Link>
          <Link to="/actividad" className="block py-2 text-gray-600 hover:text-medical-blue flex items-center">
            <Activity className="mr-2" size={16} />
            Actividad
          </Link>
          <Link to="/personal" className="block py-2 text-gray-600 hover:text-medical-blue flex items-center">
            <User className="mr-2" size={16} />
            Personal
          </Link>
          <Link to="/perfil" className="block py-2 text-gray-600 hover:text-medical-blue flex items-center">
            <Settings className="mr-2" size={16} />
            Mi Perfil
          </Link>
          {isAdmin && (
            <>
              <Link to="/admin" className="block py-2 text-gray-600 hover:text-medical-blue flex items-center">
                <Shield className="mr-2" size={16} />
                Panel Admin
              </Link>
              <Link to="/usuarios" className="block py-2 text-gray-600 hover:text-medical-blue flex items-center">
                <Users className="mr-2" size={16} />
                Gestionar Usuarios
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default NavBar;
