
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { db } from '@/db/localDatabase';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Activity, Users, Stethoscope, Calendar, PieChart as PieChartIcon } from 'lucide-react';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD', '#5DADE2'];

interface ChartData {
  name: string;
  value: number;
}

interface TimeSeriesData {
  date: string;
  count: number;
}

const AdvancedStats = () => {
  const [genderDistribution, setGenderDistribution] = useState<ChartData[]>([]);
  const [ageDistribution, setAgeDistribution] = useState<ChartData[]>([]);
  const [diagnosisDistribution, setDiagnosisDistribution] = useState<ChartData[]>([]);
  const [consultationTrend, setConsultationTrend] = useState<TimeSeriesData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadStatistics = async () => {
      try {
        setLoading(true);
        
        // Obtener todos los pacientes
        const patients = await db.patients.toArray();
        
        // Distribución por género
        const genderCount: Record<string, number> = {};
        patients.forEach(patient => {
          const gender = patient.gender || 'No especificado';
          genderCount[gender] = (genderCount[gender] || 0) + 1;
        });
        
        const genderData = Object.entries(genderCount).map(([name, value]) => ({ name, value }));
        setGenderDistribution(genderData);
        
        // Distribución por edad
        const ageGroups: Record<string, number> = {
          '0-18': 0,
          '19-30': 0,
          '31-45': 0,
          '46-60': 0,
          '61+': 0
        };
        
        patients.forEach(patient => {
          const birthDate = new Date(patient.birth_date);
          const today = new Date();
          let age = today.getFullYear() - birthDate.getFullYear();
          const monthDiff = today.getMonth() - birthDate.getMonth();
          
          if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
          }
          
          if (age <= 18) ageGroups['0-18']++;
          else if (age <= 30) ageGroups['19-30']++;
          else if (age <= 45) ageGroups['31-45']++;
          else if (age <= 60) ageGroups['46-60']++;
          else ageGroups['61+']++;
        });
        
        const ageData = Object.entries(ageGroups).map(([name, value]) => ({ name, value }));
        setAgeDistribution(ageData);
        
        // Obtener registros médicos
        const records = await db.medicalRecords.toArray();
        
        // Distribución por diagnóstico
        const diagnosisCounts: Record<string, number> = {};
        
        records.forEach(record => {
          const diagnoses = record.diagnosis.split(',').map(d => d.trim());
          
          diagnoses.forEach(diagnosis => {
            diagnosisCounts[diagnosis] = (diagnosisCounts[diagnosis] || 0) + 1;
          });
        });
        
        // Ordenar y obtener los 5 diagnósticos más comunes
        const sortedDiagnosis = Object.entries(diagnosisCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name, value]) => ({ name, value }));
        
        setDiagnosisDistribution(sortedDiagnosis);
        
        // Tendencia de consultas por mes
        const last6Months: Record<string, number> = {};
        const today = new Date();
        
        // Inicializar los últimos 6 meses
        for (let i = 5; i >= 0; i--) {
          const d = new Date(today);
          d.setMonth(d.getMonth() - i);
          const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          last6Months[monthKey] = 0;
        }
        
        // Contar registros por mes
        records.forEach(record => {
          const date = new Date(record.date);
          const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          
          if (last6Months[monthKey] !== undefined) {
            last6Months[monthKey]++;
          }
        });
        
        // Formatear datos para el gráfico
        const trendData = Object.entries(last6Months).map(([date, count]) => {
          const [year, month] = date.split('-');
          return {
            date: `${month}/${year.slice(2)}`,
            count
          };
        });
        
        setConsultationTrend(trendData);
        
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadStatistics();
  }, []);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-medical-blue"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-medical-purple" />
          Estadísticas Avanzadas
        </CardTitle>
        <CardDescription>
          Análisis detallado de datos de pacientes y consultas
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="patients">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="patients">
              <Users className="mr-2 h-4 w-4" />
              Pacientes
            </TabsTrigger>
            <TabsTrigger value="consultations">
              <Stethoscope className="mr-2 h-4 w-4" />
              Consultas
            </TabsTrigger>
            <TabsTrigger value="trends">
              <Calendar className="mr-2 h-4 w-4" />
              Tendencias
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="patients" className="space-y-6 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-medium mb-3">Distribución por Género</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={genderDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {genderDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Distribución por Edad</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ageDistribution}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" name="Cantidad" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="consultations" className="pt-4">
            <h3 className="text-lg font-medium mb-3">Diagnósticos más Comunes</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={diagnosisDistribution}
                  layout="vertical"
                  margin={{ top: 5, right: 30, left: 120, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="name" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name="Cantidad" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
          
          <TabsContent value="trends" className="pt-4">
            <h3 className="text-lg font-medium mb-3">Tendencia de Consultas (Últimos 6 meses)</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={consultationTrend}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    name="Consultas" 
                    stroke="#0088FE" 
                    activeDot={{ r: 8 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default AdvancedStats;
