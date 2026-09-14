import React from 'react';
import { AlertTriangle, RotateCcw } from 'lucide-react';
import { Button } from './Button';

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export const ErrorState: React.FC<ErrorStateProps> = ({
  title = 'System Warning',
  message = 'Unable to complete operational request. Please check connectivity or authorization.',
  onRetry,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-ag-lg border border-red-200 bg-red-50/50 my-4 space-y-3">
      <div className="p-3 bg-white rounded-full border border-red-200 text-red-600 shadow-subtle">
        <AlertTriangle className="w-8 h-8" />
      </div>
      <div className="max-w-md space-y-1">
        <h4 className="text-sm font-semibold text-red-950">{title}</h4>
        <p className="text-xs text-red-800 leading-relaxed">{message}</p>
      </div>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} leftIcon={<RotateCcw className="w-3.5 h-3.5" />}>
          Retry Action
        </Button>
      )}
    </div>
  );
};
