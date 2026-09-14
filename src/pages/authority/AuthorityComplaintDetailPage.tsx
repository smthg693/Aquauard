import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchComplaintById, updateComplaintStatus, fetchComplaintEvents } from '../../lib/services/complaints';
import { fetchOfficers } from '../../lib/services/users';
import { assignOfficerToComplaint } from '../../lib/services/assignments';
import { TicketCode } from '../../components/ui/TicketCode';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { ComplaintTimeline } from '../../components/ui/ComplaintTimeline';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../components/ui/Toast';
import { ArrowLeft, UserPlus, RefreshCw } from 'lucide-react';
import type { Complaint, Officer, ComplaintStatusEvent, ComplaintStatus } from '../../types';

export const AuthorityComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<string>('');
  const [events, setEvents] = useState<ComplaintStatusEvent[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [updating, setUpdating] = useState<boolean>(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const [cmp, offs, evts] = await Promise.all([
      fetchComplaintById(id),
      fetchOfficers(),
      fetchComplaintEvents(id),
    ]);

    setComplaint(cmp);
    setOfficers(offs);
    setEvents(evts);
    if (offs.length > 0) {
      setSelectedOfficer(cmp?.assignedOfficerId || offs[0].id);
    }
    setLoading(false);
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStateUpdate = async (targetStatus: ComplaintStatus) => {
    if (!complaint) return;
    setUpdating(true);
    const res = await updateComplaintStatus(complaint.id, targetStatus, 'Authority');
    setUpdating(false);

    if (res.success) {
      addToast('Complaint Status Updated', `Transitioned to ${targetStatus}. Audit event appended.`, 'success');
      loadData();
    } else {
      addToast('Transition Denied', res.message || 'Error updating status.', 'error');
    }
  };

  const handleAssignOfficer = async () => {
    if (!complaint || !selectedOfficer) return;
    setUpdating(true);
    const res = await assignOfficerToComplaint(complaint.id, selectedOfficer);
    setUpdating(false);

    if (res.success) {
      const officerObj = officers.find((o) => o.id === selectedOfficer);
      addToast('Officer Assigned', `Dispatched ${officerObj?.userName || 'Officer'} to incident.`, 'success');
      loadData();
    } else {
      addToast('Assignment Failed', res.message || 'Failed to dispatch officer.', 'error');
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center text-xs text-slate-400">
        Loading complaint record & officer roster...
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="max-w-5xl mx-auto p-8 text-center space-y-4">
        <p className="text-base font-bold text-navy-700">Complaint Record Not Found</p>
        <Button variant="outline" onClick={() => navigate('/authority/dashboard')}>
          Back to Authority Queue
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
          Back to Authority Queue
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={loadData}
          leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${updating ? 'animate-spin' : ''}`} />}
        >
          Refresh Data
        </Button>
      </div>

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

        {/* State Machine Transition Toolbar */}
        <div className="p-4 bg-navy-50/70 rounded-ag-md border border-navy-100 space-y-2">
          <p className="text-xs font-bold text-navy-800 uppercase tracking-wider">
            State Machine Operations (Database Audit Enforced)
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              disabled={updating || complaint.status !== 'Submitted'}
              onClick={() => handleStateUpdate('Acknowledged')}
            >
              1. Acknowledge
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={updating || (complaint.status !== 'Submitted' && complaint.status !== 'Acknowledged')}
              onClick={() => handleStateUpdate('Assigned')}
            >
              2. Mark Assigned
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={updating || complaint.status !== 'Assigned'}
              onClick={() => handleStateUpdate('In Progress')}
            >
              3. Mark In Progress
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={updating || complaint.status !== 'In Progress'}
              onClick={() => handleStateUpdate('Resolved')}
            >
              4. Mark Resolved
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={updating || complaint.status !== 'Resolved'}
              onClick={() => handleStateUpdate('Closed')}
            >
              5. Close Complaint
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Officer Dispatch Widget */}
        <div className="elevation-raised rounded-ag-lg p-6 bg-white border border-slate-200 space-y-4 shadow-subtle h-fit">
          <h3 className="text-sm font-bold text-navy-700 flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserPlus className="w-4 h-4 text-cyan-600" />
            Field Officer Dispatch
          </h3>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-slate-600 uppercase">Select Officer</label>
            <Select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              options={officers.map((o) => ({
                value: o.id,
                label: `${o.userName} (${o.area})`,
              }))}
            />

            <Button
              variant="secondary"
              size="sm"
              className="w-full"
              isLoading={updating}
              onClick={handleAssignOfficer}
            >
              Dispatch Field Officer
            </Button>
          </div>
        </div>

        {/* Audit Timeline */}
        <div className="md:col-span-2 elevation-raised rounded-ag-lg p-6 bg-white border border-slate-200 space-y-4 shadow-subtle">
          <h3 className="text-sm font-bold text-navy-700 border-b border-slate-100 pb-3">
            Append-Only Audit Timeline History
          </h3>
          <ComplaintTimeline events={events} />
        </div>
      </div>
    </div>
  );
};
