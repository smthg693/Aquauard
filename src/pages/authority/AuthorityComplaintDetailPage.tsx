import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { INITIAL_COMPLAINTS, MOCK_OFFICERS, INITIAL_STATUS_EVENTS } from '../../lib/mockDataService';
import { TicketCode } from '../../components/ui/TicketCode';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { ComplaintTimeline } from '../../components/ui/ComplaintTimeline';
import { Button } from '../../components/ui/Button';
import { Select } from '../../components/ui/Select';
import { useToast } from '../../components/ui/Toast';
import { validateStateTransition } from '../../lib/stateMachine';
import { ArrowLeft, UserPlus } from 'lucide-react';
import type { ComplaintStatus } from '../../types';

export const AuthorityComplaintDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [complaint, setComplaint] = useState(
    () => INITIAL_COMPLAINTS.find((c) => c.id === id) || INITIAL_COMPLAINTS[0]
  );
  const [selectedOfficer, setSelectedOfficer] = useState(complaint.assignedOfficerId || MOCK_OFFICERS[0].id);

  const events = INITIAL_STATUS_EVENTS.filter((e) => e.complaintId === complaint.id);

  const handleStateUpdate = (targetStatus: ComplaintStatus) => {
    const check = validateStateTransition(complaint.status, targetStatus, 'Authority');
    if (!check.allowed) {
      addToast('Invalid State Transition', check.reason, 'error');
      return;
    }

    const updated = { ...complaint, status: targetStatus };
    setComplaint(updated);
    addToast('Complaint Status Updated', `Transitioned to ${targetStatus}. Audit event appended.`, 'success');
  };

  const handleAssignOfficer = () => {
    const officerObj = MOCK_OFFICERS.find((o) => o.id === selectedOfficer);
    setComplaint((prev) => ({
      ...prev,
      assignedOfficerId: selectedOfficer,
      assignedOfficerName: officerObj?.userName,
      status: prev.status === 'Submitted' || prev.status === 'Acknowledged' ? 'Assigned' : prev.status,
    }));
    addToast('Officer Assigned', `Assigned ${officerObj?.userName} to ${complaint.complaintCode}.`, 'success');
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <Button variant="ghost" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />} onClick={() => navigate(-1)}>
        Back to Authority Queue
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

        <div className="p-4 bg-navy-50/50 rounded-ag-md border border-navy-100 space-y-2">
          <p className="text-xs font-semibold text-navy-800 uppercase tracking-wider">
            State Machine Operations (Server Enforced)
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <Button
              size="sm"
              variant="outline"
              disabled={complaint.status !== 'Submitted'}
              onClick={() => handleStateUpdate('Acknowledged')}
            >
              1. Acknowledge
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={complaint.status !== 'Submitted' && complaint.status !== 'Acknowledged'}
              onClick={() => handleStateUpdate('Assigned')}
            >
              2. Assign Officer
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={complaint.status !== 'Assigned'}
              onClick={() => handleStateUpdate('In Progress')}
            >
              3. Mark In Progress
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={complaint.status !== 'In Progress'}
              onClick={() => handleStateUpdate('Resolved')}
            >
              4. Mark Resolved
            </Button>
            <Button
              size="sm"
              variant="primary"
              disabled={complaint.status !== 'Resolved'}
              onClick={() => handleStateUpdate('Closed')}
            >
              5. Close Complaint
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="elevation-raised rounded-ag-lg p-6 bg-white border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-navy-700 flex items-center gap-2 border-b border-slate-100 pb-3">
            <UserPlus className="w-4 h-4 text-cyan-600" />
            Field Officer Dispatch
          </h3>

          <div className="space-y-3">
            <label className="block text-xs font-semibold text-agText-secondary uppercase">Select Officer</label>
            <Select
              value={selectedOfficer}
              onChange={(e) => setSelectedOfficer(e.target.value)}
              options={MOCK_OFFICERS.map((o) => ({
                value: o.id,
                label: `${o.userName} (${o.area})`,
              }))}
            />

            <Button variant="secondary" size="sm" className="w-full" onClick={handleAssignOfficer}>
              Dispatch Officer
            </Button>
          </div>
        </div>

        <div className="md:col-span-2 elevation-raised rounded-ag-lg p-6 bg-white border border-slate-200 space-y-4">
          <h3 className="text-sm font-bold text-navy-700 border-b border-slate-100 pb-3">
            Append-Only Audit Timeline History
          </h3>
          <ComplaintTimeline events={events} />
        </div>
      </div>
    </div>
  );
};
