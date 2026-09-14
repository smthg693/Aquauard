import React from 'react';
import type { ComplaintStatus } from '../../types';
import { Clock, CheckCircle2, AlertCircle, Wrench, ShieldCheck, Lock } from 'lucide-react';

interface StatusBadgeProps {
  status: ComplaintStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const configs: Record<ComplaintStatus, { label: string; bg: string; text: string; border: string; icon: React.ReactNode }> = {
    Submitted: {
      label: 'Submitted',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    Acknowledged: {
      label: 'Acknowledged',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: <AlertCircle className="w-3.5 h-3.5" />,
    },
    Assigned: {
      label: 'Assigned',
      bg: 'bg-cyan-50',
      text: 'text-cyan-800',
      border: 'border-cyan-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    },
    'In Progress': {
      label: 'In Progress',
      bg: 'bg-amber-50',
      text: 'text-amber-800',
      border: 'border-amber-300',
      icon: <Wrench className="w-3.5 h-3.5 animate-pulse" />,
    },
    Resolved: {
      label: 'Resolved',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200',
      icon: <ShieldCheck className="w-3.5 h-3.5" />,
    },
    Closed: {
      label: 'Closed',
      bg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      icon: <Lock className="w-3.5 h-3.5" />,
    },
  };

  const config = configs[status] || configs.Submitted;
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs gap-1' : 'px-2.5 py-1 text-xs font-semibold gap-1.5';

  return (
    <span className={`inline-flex items-center rounded-full border ${config.bg} ${config.text} ${config.border} ${sizeClasses} transition-colors`}>
      {config.icon}
      <span>{config.label}</span>
    </span>
  );
};
