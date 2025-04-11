
import { ChevronRight, FileText, Pill, Stethoscope, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PatientCardProps {
  patient: {
    id: string;
    nombre: string;
    edad: number;
    genero: string;
    ultimaVisita: string;
    diagnosticos: string[];
    tratamientos: string[];
    medicamentos: string[];
  };
}

const PatientCard = ({ patient }: PatientCardProps) => {
  return (
    <Card className="w-full card-gradient">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl text-medical-blue">{patient.nombre}</CardTitle>
            <CardDescription>
              ID: {patient.id} | {patient.edad} años | {patient.genero}
            </CardDescription>
          </div>
          <span className="text-xs text-gray-500">
            Última visita: {patient.ultimaVisita}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center mb-2">
              <FileText size={18} className="text-medical-blue mr-2" />
              <h4 className="font-medium text-gray-700">Diagnósticos</h4>
            </div>
            <div className="ml-6">
              {patient.diagnosticos.length > 0 ? (
                <ul className="list-disc ml-5 text-sm text-gray-600">
                  {patient.diagnosticos.map((diagnostico, index) => (
                    <li key={index}>{diagnostico}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Sin diagnósticos registrados</p>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <Stethoscope size={18} className="text-medical-teal mr-2" />
              <h4 className="font-medium text-gray-700">Tratamientos</h4>
            </div>
            <div className="ml-6">
              {patient.tratamientos.length > 0 ? (
                <ul className="list-disc ml-5 text-sm text-gray-600">
                  {patient.tratamientos.map((tratamiento, index) => (
                    <li key={index}>{tratamiento}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Sin tratamientos registrados</p>
              )}
            </div>
          </div>
          
          <div>
            <div className="flex items-center mb-2">
              <Pill size={18} className="text-medical-purple mr-2" />
              <h4 className="font-medium text-gray-700">Medicamentos</h4>
            </div>
            <div className="ml-6">
              {patient.medicamentos.length > 0 ? (
                <ul className="list-disc ml-5 text-sm text-gray-600">
                  {patient.medicamentos.map((medicamento, index) => (
                    <li key={index}>{medicamento}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-gray-500 italic">Sin medicamentos registrados</p>
              )}
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2">
        <div className="flex items-center">
          <Activity size={16} className="text-medical-red mr-1" />
          <span className="text-xs text-gray-600">Estado: Estable</span>
        </div>
        <Button variant="ghost" size="sm" className="text-medical-blue">
          Ver historial completo
          <ChevronRight size={16} className="ml-1" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PatientCard;
