import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchComplaintById, fetchComplaintEvents, fetchComplaintNotes } from '../../lib/services/complaints';
import { fetchComplaintEvidence } from '../../lib/services/evidence';
import { TicketCode } from '../../components/ui/TicketCode';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { ComplaintTimeline } from '../../components/ui/ComplaintTimeline';
import { Button } from '../../components/ui/Button';
import { ArrowLeft, MapPin, UserCheck, Calendar, ShieldCheck, Image as ImageIcon } from 'lucide-react';
import type { Complaint, ComplaintStatusEvent, Note, Evidence } from '../../types';

export const CitizenComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [events, setEvents] = useState<ComplaintStatusEvent[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const cmp = await fetchComplaintById(id);
    setComplaint(cmp);

    if (cmp) {
      const [evts, nts, evd] = await Promise.all([
        fetchComplaintEvents(cmp.id),
        fetchComplaintNotes(cmp.id),
        fetchComplaintEvidence(cmp.id),
      ]);
      setEvents(evts);
      setNotes(nts.filter((n) => !n.isInternal));
      setEvidenceList(evd);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-xs text-slate-400">
        Loading complaint record...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
        <p className="text-base font-bold text-navy-700">Complaint Record Not Found</p>
        <Button variant="outline" onClick={() => navigate('/citizen/complaints')}>
          Return to Complaints List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
          Back to Complaints Tracker
        </Button>
      </div>

      {/* Header Info */}
      <div className="elevation-raised rounded-ag-lg p-6 bg-white border border-slate-200 space-y-4 shadow-subtle">
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
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Report Description</h3>
          <p className="text-sm text-slate-800 leading-relaxed bg-slate-50 p-4 rounded-ag-md border border-slate-200">
            {complaint.description}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs text-slate-600">
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
              <p className="font-medium text-navy-700">{complaint.assignedOfficerName || 'Pending Officer Dispatch'}</p>
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

      {/* Evidence Attachments Section */}
      {evidenceList.length > 0 && (
        <div className="bg-white rounded-ag-lg p-5 border border-slate-200 shadow-subtle space-y-3">
          <h3 className="text-xs font-bold text-navy-700 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-600" /> Attached Photo Evidence ({evidenceList.length})
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {evidenceList.map((ev) => (
              <a
                key={ev.id}
                href={ev.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="group relative rounded-ag-md overflow-hidden border border-slate-200 aspect-video bg-slate-100 block"
              >
                <img
                  src={ev.fileUrl}
                  alt="Evidence photo"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity">
                  View Image
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* State Machine Timeline */}
        <div className="md:col-span-2 bg-white rounded-ag-lg p-6 border border-slate-200 shadow-subtle space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-navy-700 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-600" />
              Append-Only Status Lifecycle Audit
            </h3>
            <span className="text-[11px] text-slate-400 font-mono">PostgreSQL RLS Protected</span>
          </div>

          <ComplaintTimeline events={events} />
        </div>

        {/* Public Notes */}
        <div className="bg-white rounded-ag-lg p-6 border border-slate-200 shadow-subtle space-y-4 h-fit">
          <h3 className="text-sm font-bold text-navy-700 border-b border-slate-100 pb-3">
            Official Field Notes
          </h3>

          {notes.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No public notes added yet.</p>
          ) : (
            <div className="space-y-3 text-xs">
              {notes.map((n) => (
                <div key={n.id} className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
                  <p className="text-slate-800 font-normal">{n.noteText}</p>
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
