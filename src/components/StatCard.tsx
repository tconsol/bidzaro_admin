import React from 'react';
import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, color, change, changeType }) => {
  return (
    <div className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 overflow-hidden">
      <div className="hidden sm:block absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl opacity-0 group-hover:opacity-80 transition-opacity duration-500 -mr-16 -mt-16" />
      
      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3.5 rounded-xl bg-gradient-to-br ${color} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
            <Icon className="w-6 h-6 text-white" strokeWidth={2.5} />
          </div>
          {change && (
            <div className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg font-medium text-sm ${
              changeType === 'increase' 
                ? 'bg-green-50 text-green-700' 
                : changeType === 'decrease'
                ? 'bg-red-50 text-red-700'
                : 'bg-gray-50 text-gray-700'
            }`}>
              {changeType === 'increase' ? (
                <TrendingUp className="w-4 h-4" />
              ) : changeType === 'decrease' ? (
                <TrendingDown className="w-4 h-4" />
              ) : null}
              <span>{change}</span>
            </div>
          )}
        </div>
        <h3 className="text-gray-500 text-xs font-semibold mb-1.5 uppercase tracking-wide">{title}</h3>
        <p className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;
