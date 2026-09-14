import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { INITIAL_COMPLAINTS } from '../../lib/mockDataService';
import { ComplaintTable } from '../../components/ui/ComplaintTable';
import { useNavigate } from 'react-router-dom';

export const FieldOfficerComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const assignedTasks = INITIAL_COMPLAINTS.filter((c) => c.assignedOfficerId === 'off-1' || c.assignedOfficerName?.includes('Rajesh'));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Officer Workload List"
        description="Active complaints assigned specifically to your field credentials for investigation and resolution"
      />

      <ComplaintTable
        complaints={assignedTasks}
        onRowClick={(item) => navigate(`/field-officer/complaints/${item.id}`)}
      />
    </div>
  );
};
