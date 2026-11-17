import React from 'react';

export const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue' }) => {
  const colorMap = {
    blue: 'bg-blue-50 text-brand-900 border-blue-200',
    emerald: 'bg-emerald-50 text-emerald-900 border-emerald-200',
    amber: 'bg-amber-50 text-amber-900 border-amber-200',
    red: 'bg-red-50 text-red-900 border-red-200',
    indigo: 'bg-indigo-50 text-indigo-900 border-indigo-200'
  };

  const iconBgMap = {
    blue: 'bg-blue-600 text-white',
    emerald: 'bg-emerald-600 text-white',
    amber: 'bg-amber-600 text-white',
    red: 'bg-red-600 text-white',
    indigo: 'bg-indigo-600 text-white'
  };

  return (
    <div className={`p-6 rounded-2xl border shadow-sm transition hover:shadow-md ${colorMap[color] || colorMap.blue} bg-white`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-extrabold text-slate-900">{value}</h3>
          {subtitle && <p className="text-xs text-slate-600 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl shadow-sm ${iconBgMap[color] || iconBgMap.blue}`}>
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
