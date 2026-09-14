import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MOCK_AUTHORITIES } from '../../lib/mockDataService';
import { Building2, MapPin, Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminAuthoritiesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Municipal Water Authorities"
        description="Register and manage regional water utility boards and ward jurisdiction boundaries"
        action={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Create Water Board
          </Button>
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_AUTHORITIES.map((auth) => (
          <div key={auth.id} className="elevation-raised rounded-ag-lg p-5 bg-white border border-slate-200 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-navy-700 text-white flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-navy-700">{auth.name}</h3>
                <p className="text-xs text-agText-muted flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3 h-3 text-cyan-600" /> {auth.jurisdictionArea}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
