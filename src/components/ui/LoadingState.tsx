import React from 'react';
import { Loader2 } from 'lucide-react';

export const Skeleton: React.FC<{ className?: string }> = ({ className = '' }) => (
  <div className={`animate-pulse bg-slate-200/80 rounded-ag-sm ${className}`} />
);

export const LoadingState: React.FC<{ label?: string }> = ({ label = 'Loading AquaGuard data...' }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center space-y-3 min-h-[240px]">
      <Loader2 className="w-8 h-8 text-cyan-600 animate-spin" />
      <p className="text-xs font-medium text-agText-secondary">{label}</p>
    </div>
  );
};
