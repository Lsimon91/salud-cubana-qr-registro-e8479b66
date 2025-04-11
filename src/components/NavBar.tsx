
import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, User, Bell, LogOut, ChevronDown } from "lucide-react";
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
  const { toast } = useToast();

  const handleLogout = () => {
    // In a real app, this would be connected to an authentication system
    toast({
      title: "Cerrando sesión",
      description: "Has cerrado sesión correctamente.",
    });
  };

  return (
    <nav className="bg-white border-b shadow-sm py-3 px-4 md:px-6">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="flex items-center">
            <span className="text-medical-blue text-xl font-bold">Salud</span>
            <span className="text-medical-teal text-xl font-bold">Cubana</span>
          </Link>
          
          <div className="hidden md:flex ml-10 space-x-6">
            <Link to="/pacientes" className="text-gray-600 hover:text-medical-blue">
              Pacientes
            </Link>
            <Link to="/personal" className="text-gray-600 hover:text-medical-blue">
              Personal
            </Link>
            <Link to="/estadisticas" className="text-gray-600 hover:text-medical-blue">
              Estadísticas
            </Link>
            <Link to="/escanear" className="text-gray-600 hover:text-medical-blue">
              Escanear QR
            </Link>
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
                  <AvatarFallback className="bg-medical-purple text-white">MC</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                <span>Perfil</span>
              </DropdownMenuItem>
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
          <Link to="/pacientes" className="block py-2 text-gray-600 hover:text-medical-blue">
            Pacientes
          </Link>
          <Link to="/personal" className="block py-2 text-gray-600 hover:text-medical-blue">
            Personal
          </Link>
          <Link to="/estadisticas" className="block py-2 text-gray-600 hover:text-medical-blue">
            Estadísticas
          </Link>
          <Link to="/escanear" className="block py-2 text-gray-600 hover:text-medical-blue">
            Escanear QR
          </Link>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
