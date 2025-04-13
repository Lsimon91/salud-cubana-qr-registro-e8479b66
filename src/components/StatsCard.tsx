
import { ReactNode } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { HelpCircle } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  helpText?: string;
  icon: ReactNode;
  color: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const StatsCard = ({ 
  title, 
  value, 
  description, 
  helpText,
  icon, 
  color, 
  trend 
}: StatsCardProps) => {
  const getBorderColor = () => {
    switch (color) {
      case 'blue':
        return 'border-medical-blue';
      case 'teal':
        return 'border-medical-teal';
      case 'purple':
        return 'border-medical-purple';
      case 'red':
        return 'border-medical-red';
      default:
        return 'border-gray-300';
    }
  };

  const getIconColor = () => {
    switch (color) {
      case 'blue':
        return 'text-medical-blue bg-medical-blue/10';
      case 'teal':
        return 'text-medical-teal bg-medical-teal/10';
      case 'purple':
        return 'text-medical-purple bg-medical-purple/10';
      case 'red':
        return 'text-medical-red bg-medical-red/10';
      default:
        return 'text-gray-500 bg-gray-100';
    }
  };
  
  const getTrendColor = (isPositive: boolean) => {
    // Si es positivo y rojo o negativo y no rojo, entonces es malo (rojo)
    if ((isPositive && color === 'red') || (!isPositive && color !== 'red')) {
      return 'text-red-500 bg-red-50';
    }
    // De lo contrario es bueno (verde)
    return 'text-green-500 bg-green-50';
  };

  return (
    <div className={`stats-card p-6 bg-white rounded-xl shadow-sm border-l-4 ${getBorderColor()} hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start">
        <div>
          <div className="flex items-center mb-1">
            <p className="text-sm text-gray-500 mr-1">{title}</p>
            {helpText && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span>
                      <HelpCircle className="h-3.5 w-3.5 text-gray-400 cursor-help" />
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs text-xs">{helpText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          <div className="flex items-end gap-2">
            <h3 className="text-2xl font-bold">{value}</h3>
            {trend && (
              <div className={`text-xs px-1.5 py-0.5 rounded ${getTrendColor(trend.isPositive)} font-medium`}>
                {trend.isPositive ? '+' : ''}{trend.value}%
              </div>
            )}
          </div>
          {description && (
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          )}
        </div>
        <div className={`p-3 rounded-full ${getIconColor()}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;
