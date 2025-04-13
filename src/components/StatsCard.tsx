
import { ReactNode } from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: ReactNode;
  color: string;
}

const StatsCard = ({ title, value, description, icon, color }: StatsCardProps) => {
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

  return (
    <div className={`stats-card ${getBorderColor()}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm text-gray-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold">{value}</h3>
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
