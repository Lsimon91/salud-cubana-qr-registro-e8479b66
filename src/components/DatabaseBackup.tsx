
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Download, Upload, Database, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { db } from '@/db/localDatabase';

const DatabaseBackup = () => {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const { toast } = useToast();
  const [lastBackup, setLastBackup] = useState<string | null>(
    localStorage.getItem('lastBackupDate')
  );

  const handleExportData = async () => {
    try {
      setIsExporting(true);
      
      // Recopilar datos de todas las tablas
      const patients = await db.patients.toArray();
      const medicalRecords = await db.medicalRecords.toArray();
      const users = await db.users.toArray();
      const staff = await db.staff.toArray();
      const activityLogs = await db.activityLogs.toArray();
      
      // Crear un objeto con todos los datos
      const exportData = {
        patients,
        medicalRecords,
        users,
        staff,
        activityLogs,
        exportDate: new Date().toISOString(),
      };
      
      // Convertir a JSON
      const jsonData = JSON.stringify(exportData, null, 2);
      
      // Crear un blob y un objeto URL
      const blob = new Blob([jsonData], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      // Crear un enlace de descarga y hacer clic en él
      const a = document.createElement('a');
      a.href = url;
      a.download = `medicaldb_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      
      // Limpiar
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Registrar la fecha de la última copia de seguridad
      const now = new Date().toLocaleString();
      localStorage.setItem('lastBackupDate', now);
      setLastBackup(now);
      
      // Registrar actividad
      const userId = localStorage.getItem('userId');
      const userName = localStorage.getItem('userName');
      
      if (userId && userName) {
        await db.activityLogs.add({
          action: 'Exportación de Base de Datos',
          user_id: userId,
          user_name: userName,
          details: `Copia de seguridad creada el ${now}`,
          created_at: new Date()
        });
      }
      
      toast({
        title: "Exportación Exitosa",
        description: "La base de datos se ha exportado correctamente",
      });
    } catch (error) {
      console.error('Error al exportar datos:', error);
      toast({
        title: "Error de Exportación",
        description: "No se pudieron exportar los datos. Intente nuevamente.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const handleImportData = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      setIsImporting(true);
      
      // Leer el archivo
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const jsonData = e.target?.result as string;
          const importData = JSON.parse(jsonData);
          
          // Verificar que el archivo tiene la estructura correcta
          if (!importData.patients || !importData.medicalRecords || !importData.users) {
            throw new Error('Formato de archivo inválido');
          }
          
          // Confirmar antes de importar
          if (window.confirm('¿Está seguro de que desea importar estos datos? Esta acción reemplazará todos los datos existentes.')) {
            // Limpiar tablas existentes
            await db.patients.clear();
            await db.medicalRecords.clear();
            await db.users.clear();
            await db.staff.clear();
            
            // Importar datos
            await db.patients.bulkAdd(importData.patients);
            await db.medicalRecords.bulkAdd(importData.medicalRecords);
            await db.users.bulkAdd(importData.users);
            
            if (importData.staff) {
              await db.staff.bulkAdd(importData.staff);
            }
            
            // Registrar actividad
            const userId = localStorage.getItem('userId');
            const userName = localStorage.getItem('userName');
            
            if (userId && userName) {
              await db.activityLogs.add({
                action: 'Importación de Base de Datos',
                user_id: userId,
                user_name: userName,
                details: `Datos importados de copia de seguridad creada el ${importData.exportDate}`,
                created_at: new Date()
              });
            }
            
            toast({
              title: "Importación Exitosa",
              description: "Los datos se han importado correctamente",
            });
            
            // Actualizar fecha de última restauración
            const now = new Date().toLocaleString();
            localStorage.setItem('lastRestoreDate', now);
          }
        } catch (error) {
          console.error('Error al procesar el archivo:', error);
          toast({
            title: "Error de Importación",
            description: "El archivo seleccionado no es válido o está corrupto",
            variant: "destructive",
          });
        } finally {
          setIsImporting(false);
        }
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error al importar datos:', error);
      toast({
        title: "Error de Importación",
        description: "No se pudieron importar los datos. Intente nuevamente.",
        variant: "destructive",
      });
      setIsImporting(false);
    }
    
    // Limpiar el input de archivo
    event.target.value = '';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5 text-medical-blue" />
          Respaldo de Base de Datos
        </CardTitle>
        <CardDescription>
          Exporte e importe datos para respaldo y recuperación
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-gray-500">
              {lastBackup 
                ? `Último respaldo: ${lastBackup}` 
                : 'Aún no se ha realizado un respaldo'}
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleExportData} 
                disabled={isExporting}
                className="bg-medical-blue hover:bg-medical-blue/90 flex-1"
              >
                {isExporting ? (
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                Exportar Datos
              </Button>
              
              <div className="relative flex-1">
                <Button 
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isImporting}
                  variant="outline"
                  className="w-full border-medical-teal text-medical-teal hover:bg-medical-teal/10"
                >
                  {isImporting ? (
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  Importar Datos
                </Button>
                <input
                  id="file-upload"
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportData}
                />
              </div>
            </div>
          </div>
          
          <div className="rounded-md bg-blue-50 p-4 mt-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <Database className="h-5 w-5 text-blue-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Información importante
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc space-y-1 pl-5">
                    <li>La exportación creará un archivo JSON con todos los datos del sistema</li>
                    <li>Al importar datos, se reemplazarán todos los datos existentes</li>
                    <li>Se recomienda realizar respaldos periódicos para evitar pérdida de información</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default DatabaseBackup;
