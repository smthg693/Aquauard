import React from 'react';
import { Inbox } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  actionLabel,
  onAction,
  icon = <Inbox className="w-10 h-10 text-slate-400" />,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-ag-lg border border-dashed border-slate-300 bg-slate-50/50 my-4 space-y-3">
      <div className="p-3 bg-white rounded-full border border-slate-200 shadow-subtle text-cyan-600">
        {icon}
      </div>
      <div className="max-w-sm space-y-1">
        <h4 className="text-sm font-semibold text-agText-primary">{title}</h4>
        <p className="text-xs text-agText-muted leading-relaxed">{description}</p>
      </div>
      {actionLabel && onAction && (
        <Button size="sm" onClick={onAction} className="mt-2">
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
