import React, { useState } from 'react';
import { Copy, Check } from 'lucide-react';

interface TicketCodeProps {
  code: string;
  size?: 'sm' | 'md' | 'lg';
  showCopy?: boolean;
}

export const TicketCode: React.FC<TicketCodeProps> = ({
  code,
  size = 'md',
  showCopy = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };

  return (
    <span
      className={`ticket-code inline-flex items-center gap-1.5 rounded-ag-sm bg-navy-50 text-navy-800 border border-navy-100 font-mono tracking-tight ${sizeClasses[size]}`}
    >
      <span>{code}</span>
      {showCopy && (
        <button
          type="button"
          onClick={handleCopy}
          className="text-slate-400 hover:text-navy-700 transition-colors focus:outline-none"
          title="Copy Ticket ID"
        >
          {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
        </button>
      )}
    </span>
  );
};
