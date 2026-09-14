import React from 'react';
import type { ComplaintSeverity } from '../../types';
import { AlertOctagon, AlertTriangle, Info } from 'lucide-react';

interface SeverityBadgeProps {
  severity: ComplaintSeverity;
  size?: 'sm' | 'md';
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity, size = 'md' }) => {
  const configs: Record<ComplaintSeverity, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    Low: {
      label: 'Low Severity',
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: <Info className="w-3.5 h-3.5" />,
    },
    Medium: {
      label: 'Medium Severity',
      bg: 'bg-blue-50',
      text: 'text-blue-800',
      border: 'border-blue-200',
      icon: <Info className="w-3.5 h-3.5" />,
    },
    High: {
      label: 'High Severity',
      bg: 'bg-amber-50',
      text: 'text-amber-900',
      border: 'border-amber-300',
      icon: <AlertTriangle className="w-3.5 h-3.5" />,
    },
    Critical: {
      label: 'CRITICAL',
      bg: 'bg-red-100',
      text: 'text-red-800 font-bold',
      border: 'border-red-300',
      icon: <AlertOctagon className="w-3.5 h-3.5 text-red-600" />,
    },
  };

  const config = configs[severity] || configs.Medium;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs font-semibold gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-ag-sm border ${config.bg} ${config.text} ${config.border} ${sizeClasses}`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
