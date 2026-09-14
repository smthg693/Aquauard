import React from 'react';
import type { ComplaintStatusEvent } from '../../types';
import { StatusBadge } from './StatusBadge';
import { User, Calendar } from 'lucide-react';

interface ComplaintTimelineProps {
  events: ComplaintStatusEvent[];
}

export const ComplaintTimeline: React.FC<ComplaintTimelineProps> = ({ events }) => {
  if (!events || events.length === 0) {
    return <p className="text-xs text-slate-500 italic">No status history recorded yet.</p>;
  }

  return (
    <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
      {events.map((evt) => {
        const formattedDate = new Date(evt.createdAt).toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });

        const currentStatus = evt.toStatus || evt.status || 'Submitted';
        const displayNote = evt.reasonNotes || evt.note;
        const author = evt.changedByName || evt.updatedByName || 'System';

        return (
          <div key={evt.id} className="relative group">
            {/* Timeline node dot */}
            <div className="absolute -left-6 top-1 w-3 h-3 rounded-full bg-white border-2 border-cyan-500 group-hover:scale-110 transition-transform" />

            <div className="bg-slate-50 border border-slate-200 rounded-ag-md p-3 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <StatusBadge status={currentStatus} size="sm" />
                <div className="flex items-center gap-1 text-slate-400">
                  <Calendar className="w-3 h-3" />
                  <span>{formattedDate}</span>
                </div>
              </div>

              {displayNote && <p className="text-agText-secondary leading-relaxed pt-1 font-normal">{displayNote}</p>}

              <div className="flex items-center gap-1 text-[11px] text-slate-500 pt-1">
                <User className="w-3 h-3 text-slate-400" />
                <span>Updated by <strong className="font-semibold text-agText-primary">{author}</strong></span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
