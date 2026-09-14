import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { INITIAL_COMPLAINTS, INITIAL_STATUS_EVENTS, INITIAL_NOTES } from '../../lib/mockDataService';
import { TicketCode } from '../../components/ui/TicketCode';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { ComplaintTimeline } from '../../components/ui/ComplaintTimeline';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, MapPin, UserCheck, Calendar, ShieldCheck } from 'lucide-react';

export const CitizenComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const complaint = INITIAL_COMPLAINTS.find((c) => c.id === id) || INITIAL_COMPLAINTS[0];
  const events = INITIAL_STATUS_EVENTS.filter((e) => e.complaintId === complaint.id);
  const publicNotes = INITIAL_NOTES.filter((n) => n.complaintId === complaint.id && !n.isInternal);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
          Back to Complaints List
        </Button>
      </div>

      <div className="elevation-raised rounded-ag-lg p-6 bg-white border border-slate-200 space-y-4">
        <div className="flex items-center justify-between gap-4 flex-wrap pb-3 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <TicketCode code={complaint.complaintCode} size="lg" />
            <h1 className="text-lg font-bold text-navy-700">{complaint.categoryName}</h1>
          </div>
          <div className="flex items-center gap-2">
            <SeverityBadge severity={complaint.severity} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-semibold text-agText-muted uppercase tracking-wider">Report Description</h3>
          <p className="text-sm text-agText-primary leading-relaxed bg-slate-50 p-4 rounded-ag-md border border-slate-200">
            {complaint.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-agText-secondary">
          <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200">
            <MapPin className="w-4 h-4 text-cyan-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Location</p>
              <p className="font-medium text-navy-700">{complaint.address}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200">
            <UserCheck className="w-4 h-4 text-cyan-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Assigned Officer</p>
              <p className="font-medium text-navy-700">{complaint.assignedOfficerName || 'Pending Assignment'}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded bg-slate-50 border border-slate-200">
            <Calendar className="w-4 h-4 text-cyan-600 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">Report Date</p>
              <p className="font-medium text-navy-700">{new Date(complaint.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 elevation-raised rounded-ag-lg p-6 bg-white border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-navy-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              Append-Only Status Lifecycle History
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">PostgreSQL Audit Engine</span>
          </div>

          <ComplaintTimeline events={events} />
        </div>

        <div className="elevation-raised rounded-ag-lg p-6 bg-white border border-slate-200 space-y-4 h-fit">
          <h3 className="text-sm font-bold text-navy-700 border-b border-slate-100 pb-3">
            Public Field Notes
          </h3>

          {publicNotes.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No public notes added yet.</p>
          ) : (
            <div className="space-y-3 text-xs">
              {publicNotes.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <p className="text-agText-primary font-normal">{n.noteText}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/50">
                    <span>{n.authorName}</span>
                    <span>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
