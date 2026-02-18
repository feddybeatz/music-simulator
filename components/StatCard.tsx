
import React from 'react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: number;
  color?: string;
}

const StatCard: React.FC<StatCardProps> = ({ label, value, icon, trend, color = "text-violet-400" }) => {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex items-center justify-between hover:border-violet-500/50 transition-colors">
      <div>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-bold mt-1">{value}</h3>
        {trend !== undefined && (
          <p className={`text-xs mt-1 ${trend >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </p>
        )}
      </div>
      <div className={`p-3 rounded-lg bg-zinc-800/50 ${color}`}>
        {icon}
      </div>
    </div>
  );
};

export default StatCard;
