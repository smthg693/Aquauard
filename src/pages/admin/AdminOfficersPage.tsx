import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MOCK_OFFICERS } from '../../lib/mockDataService';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminOfficersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Officer Registry"
        description="Provision field technician accounts, assign authority affiliations, and set ward coverage"
        action={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Provision Field Officer
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_OFFICERS.map((off) => (
          <div key={off.id} className="elevation-raised rounded-ag-lg p-5 bg-white border border-slate-200 space-y-2">
            <h3 className="text-sm font-bold text-navy-700">{off.userName}</h3>
            <p className="text-xs text-slate-600">Email: {off.userEmail}</p>
            <p className="text-xs text-cyan-700 font-medium">Assigned Zone: {off.area}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
