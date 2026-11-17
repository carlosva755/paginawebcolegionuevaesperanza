import React from 'react';

export const RiskBadge = ({ level, score }) => {
  const normLevel = String(level).toLowerCase();

  if (normLevel === 'alto' || normLevel === 'high') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
        <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
        Alerta Alta {score !== undefined && `(${score} pts)`}
      </span>
    );
  }

  if (normLevel === 'medio' || normLevel === 'medium') {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-800 border border-amber-200">
        <span className="w-2 h-2 rounded-full bg-amber-500"></span>
        Alerta Media {score !== undefined && `(${score} pts)`}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      Riesgo Bajo {score !== undefined && `(${score} pts)`}
    </span>
  );
};

export default RiskBadge;
