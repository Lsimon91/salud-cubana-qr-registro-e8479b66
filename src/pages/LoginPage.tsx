
import LoginForm from '@/components/LoginForm';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-medical-lightGray to-white p-4">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">
          <span className="text-medical-blue">Salud</span>
          <span className="text-medical-teal">Cubana</span>
        </h1>
        <p className="text-gray-600">Sistema de Gestión Médica con Registro QR</p>
      </div>
      
      <LoginForm />
      
      <div className="mt-8 text-center">
        <p className="text-sm text-gray-500 max-w-md">
          Este sistema es exclusivo para el personal autorizado del sistema de salud.
          El acceso no autorizado está prohibido y puede ser penalizado según la ley.
        </p>
        
        <p className="mt-3 text-xs text-gray-400">
          <span className="font-medium">Usuario administrador:</span> Admin@host.example.com
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
