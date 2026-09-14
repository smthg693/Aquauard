import React from 'react';
import type { Complaint } from '../../types';
import { TicketCode } from './TicketCode';
import { StatusBadge } from './StatusBadge';
import { SeverityBadge } from './SeverityBadge';
import { ChevronRight } from 'lucide-react';

interface ComplaintTableProps {
  complaints: Complaint[];
  onRowClick?: (complaint: Complaint) => void;
}

export const ComplaintTable: React.FC<ComplaintTableProps> = ({ complaints, onRowClick }) => {
  return (
    <div className="w-full overflow-x-auto rounded-ag-lg border border-slate-200 bg-white shadow-subtle">
      <table className="w-full text-left border-collapse min-w-[768px]">
        <thead>
          <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-agText-secondary uppercase tracking-wider">
            <th className="py-3 px-4">Ticket ID</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Citizen</th>
            <th className="py-3 px-4">Location</th>
            <th className="py-3 px-4">Severity</th>
            <th className="py-3 px-4">Status</th>
            <th className="py-3 px-4">Officer</th>
            <th className="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 text-xs text-agText-primary">
          {complaints.map((item) => (
            <tr
              key={item.id}
              onClick={() => onRowClick && onRowClick(item)}
              className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
            >
              <td className="py-3 px-4 whitespace-nowrap">
                <TicketCode code={item.complaintCode} showCopy={false} />
              </td>
              <td className="py-3 px-4 font-medium text-navy-700">
                {item.categoryName}
              </td>
              <td className="py-3 px-4 text-slate-600">
                {item.citizenName || 'Citizen'}
              </td>
              <td className="py-3 px-4 max-w-[200px] truncate text-slate-600">
                {item.address}
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                <SeverityBadge severity={item.severity} size="sm" />
              </td>
              <td className="py-3 px-4 whitespace-nowrap">
                <StatusBadge status={item.status} size="sm" />
              </td>
              <td className="py-3 px-4 whitespace-nowrap text-slate-600">
                {item.assignedOfficerName || <span className="text-slate-400 italic">Unassigned</span>}
              </td>
              <td className="py-3 px-4 text-right whitespace-nowrap">
                <span className="inline-flex items-center gap-1 text-cyan-600 font-medium group-hover:text-cyan-700">
                  View
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
