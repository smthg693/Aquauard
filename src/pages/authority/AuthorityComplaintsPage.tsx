import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { INITIAL_COMPLAINTS } from '../../lib/mockDataService';
import { ComplaintTable } from '../../components/ui/ComplaintTable';
import { Select } from '../../components/ui/Select';
import { useNavigate } from 'react-router-dom';

export const AuthorityComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState('ALL');

  const filtered = filterStatus === 'ALL' 
    ? INITIAL_COMPLAINTS 
    : INITIAL_COMPLAINTS.filter((c) => c.status === filterStatus);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authority Complaint Queue"
        description="Filter and manage state-wide water complaints by status, ward, or assignment state"
        action={
          <div className="w-48">
            <Select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Statuses' },
                { value: 'Submitted', label: 'Submitted' },
                { value: 'Acknowledged', label: 'Acknowledged' },
                { value: 'Assigned', label: 'Assigned' },
                { value: 'In Progress', label: 'In Progress' },
                { value: 'Resolved', label: 'Resolved' },
                { value: 'Closed', label: 'Closed' },
              ]}
            />
          </div>
        }
      />

      <ComplaintTable
        complaints={filtered}
        onRowClick={(item) => navigate(`/authority/complaints/${item.id}`)}
      />
    </div>
  );
};
