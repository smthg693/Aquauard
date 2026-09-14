import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchComplaintById, updateComplaintStatus, fetchComplaintEvents, addComplaintNote } from '../../lib/services/complaints';
import { uploadEvidenceFile, fetchComplaintEvidence } from '../../lib/services/evidence';
import { TicketCode } from '../../components/ui/TicketCode';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { ComplaintTimeline } from '../../components/ui/ComplaintTimeline';
import { Button } from '../../components/ui/Button';
import { Textarea } from '../../components/ui/Textarea';
import { useToast } from '../../components/ui/Toast';
import { ArrowLeft, Wrench, Upload, MessageSquare, Image as ImageIcon, FileText } from 'lucide-react';
import type { Complaint, ComplaintStatusEvent, ComplaintStatus, Evidence } from '../../types';

export const FieldOfficerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [events, setEvents] = useState<ComplaintStatusEvent[]>([]);
  const [evidenceList, setEvidenceList] = useState<Evidence[]>([]);
  const [fieldNote, setFieldNote] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [cmp, evts, evd] = await Promise.all([
      fetchComplaintById(id),
      fetchComplaintEvents(id),
      fetchComplaintEvidence(id),
    ]);

    setComplaint(cmp);
    setEvents(evts);
    setEvidenceList(evd);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFieldStateUpdate = async (targetStatus: ComplaintStatus) => {
    if (!complaint) return;
    setSubmitting(true);
    const res = await updateComplaintStatus(complaint.id, targetStatus, 'Field Officer');
    setSubmitting(false);

    if (res.success) {
      addToast('Status Updated', `State transitioned to ${targetStatus}.`, 'success');
      loadData();
    } else {
      addToast('Transition Denied', res.message || 'Error updating status.', 'error');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        addToast('File too large', 'Maximum upload size is 10MB.', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleAddNoteAndProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaint) return;
    if (!fieldNote.trim() && !selectedFile) {
      addToast('Input Required', 'Please enter a field note or attach repair evidence.', 'error');
      return;
    }

    setSubmitting(true);
    if (fieldNote.trim()) {
      await addComplaintNote({
        complaintId: complaint.id,
        noteText: fieldNote,
        isInternal: false,
      });
    }

    if (selectedFile) {
      await uploadEvidenceFile(complaint.id, selectedFile);
      setSelectedFile(null);
    }

    setSubmitting(false);
    setFieldNote('');
    addToast('Field Record Saved', 'Inspection notes & evidence uploaded to complaint history.', 'success');
    loadData();
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-12 text-center text-xs text-slate-400">
        Loading task record...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center space-y-4">
        <p className="text-base font-bold text-navy-700">Task Record Not Found</p>
        <Button variant="outline" onClick={() => navigate('/field-officer/dashboard')}>
          Back to Workload List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
        Back to Officer Workload
      </Button>

      {/* Complaint Info */}
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

        <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3.5 rounded border border-slate-200">
          {complaint.description}
        </p>

        {/* State Machine Transition Actions */}
        <div className="p-4 bg-amber-50/70 rounded-ag-md border border-amber-200 space-y-2">
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
              disabled={submitting || complaint.status !== 'Assigned'}
              onClick={() => handleFieldStateUpdate('In Progress')}
            >
              Start Site Work (In Progress)
            </Button>
            <Button
              size="sm"
              variant="secondary"
              disabled={submitting || complaint.status !== 'In Progress'}
              onClick={() => handleFieldStateUpdate('Resolved')}
            >
              Flag Resolved (For Authority Review)
            </Button>
          </div>
        </div>
      </div>

      {/* Uploaded Evidence Gallery */}
      {evidenceList.length > 0 && (
        <div className="bg-white rounded-ag-lg p-5 border border-slate-200 shadow-subtle space-y-3">
          <h3 className="text-xs font-bold text-navy-700 uppercase tracking-wider flex items-center gap-2">
            <ImageIcon className="w-4 h-4 text-cyan-600" /> Uploaded Field Photo Evidence ({evidenceList.length})
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
                  alt="Field Evidence"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <div className="absolute inset-0 bg-navy-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white text-xs font-medium transition-opacity">
                  View Full Image
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Field Note & Proof Upload Form */}
        <div className="elevation-raised rounded-ag-lg p-6 bg-white border border-slate-200 space-y-4 shadow-subtle">
          <h3 className="text-sm font-bold text-navy-700 flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageSquare className="w-4 h-4 text-cyan-600" />
            Add Field Inspection Notes & Repair Proof
          </h3>

          <form onSubmit={handleAddNoteAndProof} className="space-y-3">
            <Textarea
              rows={3}
              value={fieldNote}
              onChange={(e) => setFieldNote(e.target.value)}
              placeholder="Record pipe pressure readings, trench observations, or repair status..."
            />

            <div className="p-3 border border-dashed border-slate-300 rounded bg-slate-50 text-center text-xs relative cursor-pointer hover:bg-slate-100/50 transition-colors">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {selectedFile ? (
                <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700">
                  <FileText className="w-4 h-4 text-emerald-600" />
                  <span>Selected: {selectedFile.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                  <p className="font-semibold text-slate-700">Upload Site Repair Evidence Photo</p>
                  <p className="text-[11px] text-slate-500">JPG, PNG up to 10MB</p>
                </>
              )}
            </div>

            <Button type="submit" variant="primary" size="sm" className="w-full" isLoading={submitting}>
              Save Field Record & Proof
            </Button>
          </form>
        </div>

        {/* Audit Timeline */}
        <div className="elevation-raised rounded-ag-lg p-6 bg-white border border-slate-200 space-y-4 shadow-subtle">
          <h3 className="text-sm font-bold text-navy-700 border-b border-slate-100 pb-3">
            Status Audit History
          </h3>
          <ComplaintTimeline events={events} />
        </div>
      </div>
    </div>
  );
};
