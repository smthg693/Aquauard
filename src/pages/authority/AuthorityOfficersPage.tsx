import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MOCK_OFFICERS } from '../../lib/mockDataService';
import { Button } from '../../components/ui/Button';

export const AuthorityOfficersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Field Officer Roster & Assignments"
        description="Monitor active technicians, assigned ward territories, and live field workloads"
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MOCK_OFFICERS.map((officer) => (
          <div key={officer.id} className="elevation-raised rounded-ag-lg p-5 bg-white border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-navy-700 text-white flex items-center justify-center font-bold text-sm">
                  {officer.userName?.charAt(0) || 'O'}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-navy-700">{officer.userName}</h3>
                  <p className="text-xs text-agText-muted">{officer.userEmail}</p>
                </div>
              </div>
              <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-full ${
                officer.status === 'on_field' ? 'bg-amber-50 text-amber-800 border border-amber-200' : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}>
                {officer.status === 'on_field' ? 'On Field Duty' : 'Available'}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Assigned Ward</p>
                <p className="font-semibold text-agText-primary mt-0.5">{officer.area}</p>
              </div>

              <div className="p-2.5 bg-slate-50 rounded border border-slate-200">
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Current Workload</p>
                <p className="font-semibold text-agText-primary mt-0.5">{officer.currentWorkload} Active Complaints</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button variant="outline" size="sm">
                Reassign Territory
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
