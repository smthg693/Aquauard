import React from 'react';
import type { Complaint } from '../../types';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';
import { TicketCode } from './TicketCode';
import { MapPin, UserCheck, Calendar } from 'lucide-react';

interface ComplaintCardProps {
  complaint: Complaint;
  onClick?: () => void;
}

export const ComplaintCard: React.FC<ComplaintCardProps> = ({ complaint, onClick }) => {
  const formattedDate = new Date(complaint.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div
      onClick={onClick}
      className="elevation-raised rounded-ag-lg p-5 bg-white transition-all duration-200 hover:border-cyan-500 hover:shadow-elevated cursor-pointer group flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
          <TicketCode code={complaint.complaintCode} />
          <div className="flex items-center gap-2">
            <SeverityBadge severity={complaint.severity} size="sm" />
            <StatusBadge status={complaint.status} size="sm" />
          </div>
        </div>

        <h3 className="text-base font-semibold text-agText-primary group-hover:text-cyan-600 transition-colors mb-1.5 line-clamp-1">
          {complaint.categoryName || 'Water Problem Report'}
        </h3>

        <p className="text-xs text-agText-secondary line-clamp-2 mb-4 leading-relaxed">
          {complaint.description}
        </p>
      </div>

      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-agText-muted flex-wrap gap-2">
        <div className="flex items-center gap-1 min-w-0 max-w-[200px] truncate">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span className="truncate">{complaint.address}</span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {complaint.assignedOfficerName && (
            <div className="flex items-center gap-1 text-slate-600">
              <UserCheck className="w-3.5 h-3.5 text-cyan-600" />
              <span className="truncate max-w-[120px]">{complaint.assignedOfficerName}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{formattedDate}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
