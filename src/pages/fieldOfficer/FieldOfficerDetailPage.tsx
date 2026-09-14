import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { INITIAL_COMPLAINTS, INITIAL_STATUS_EVENTS } from '../../lib/mockDataService';
import { TicketCode } from '../../components/ui/TicketCode';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { ComplaintTimeline } from '../../components/ui/ComplaintTimeline';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { useToast } from '../../components/ui/Toast';
import { validateStateTransition } from '../../lib/stateMachine';
import { ArrowLeft, Wrench, Upload, MessageSquare } from 'lucide-react';
import type { ComplaintStatus } from '../../types';

export const FieldOfficerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [complaint, setComplaint] = useState(
    () => INITIAL_COMPLAINTS.find((c) => c.id === id) || INITIAL_COMPLAINTS[0]
  );
  const [fieldNote, setFieldNote] = useState('');

  const events = INITIAL_STATUS_EVENTS.filter((e) => e.complaintId === complaint.id);

  const handleFieldStateUpdate = (targetStatus: ComplaintStatus) => {
    const check = validateStateTransition(complaint.status, targetStatus, 'Field Officer');
    if (!check.allowed) {
      addToast('Transition Denied', check.reason, 'error');
      return;
    }

    const updated = { ...complaint, status: targetStatus };
    setComplaint(updated);
    addToast('Status Updated', `State transitioned to ${targetStatus}.`, 'success');
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fieldNote.trim()) return;
    addToast('Field Note Logged', 'On-site notes saved to complaint audit trail.', 'success');
    setFieldNote('');
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
        Back to Officer Workload
      </Button>

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

        <p className="text-xs text-agText-secondary leading-relaxed bg-slate-50 p-3.5 rounded border border-slate-200">
          {complaint.description}
        </p>

        <div className="p-4 bg-amber-50/60 rounded-ag-md border border-amber-200 space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wider">
              <Wrench className="w-4 h-4 text-amber-700" />
              Field Officer Permitted Actions
            </p>
            <span className="text-[10px] text-amber-800 font-semibold bg-amber-100 px-2 py-0.5 rounded">
              Cannot Close Directly
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap pt-1">
            <Button
              size="sm"
              variant="outline"
              disabled={complaint.status !== 'Assigned'}
              onClick={() => handleFieldStateUpdate('In Progress')}
            >
              Start Site Work (In Progress)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={complaint.status !== 'In Progress'}
              onClick={() => handleFieldStateUpdate('Resolved')}
            >
              Flag Resolved (For Authority Review)
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="elevation-raised rounded-ag-lg p-6 bg-white border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-navy-700 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquare className="w-4 h-4 text-cyan-600" />
            Add Field Inspection Notes
          </h3>

          <form onSubmit={handleAddNote} className="space-y-3">
            <Textarea
              rows={3}
              value={fieldNote}
              onChange={(e) => setFieldNote(e.target.value)}
              placeholder="Record pipe pressure readings, trench observations, or repair status..."
            />

            <div className="p-3 border border-dashed border-slate-300 rounded bg-slate-50 text-center text-xs">
              <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
              <p className="font-semibold text-agText-primary">Upload Repair Evidence</p>
            </div>

            <Button type="submit" variant="primary" size="sm" className="w-full">
              Save Field Record
            </Button>
          </form>
        </div>

        <div className="elevation-raised rounded-ag-lg p-6 bg-white border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-navy-700 border-b border-slate-100 pb-3">
            Status Audit History
          </h3>
          <ComplaintTimeline events={events} />
        </div>
      </div>
    </div>
  );
};
