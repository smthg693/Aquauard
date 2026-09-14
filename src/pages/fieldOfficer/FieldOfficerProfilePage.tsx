import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { Wrench, ShieldCheck, MapPin } from 'lucide-react';

export const FieldOfficerProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Field Officer Credentials"
        description="Technician certification, duty status, and assigned ward coverage"
      />

      <div className="elevation-raised rounded-ag-lg bg-white p-6 border border-slate-200 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-amber-600 text-white text-2xl font-bold flex items-center justify-center border-2 border-amber-300 shadow-subtle">
            <Wrench className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-700">{user?.name || 'Field Officer'}</h2>
            <p className="text-xs text-agText-secondary">{user?.email}</p>
            <span className="inline-block px-2.5 py-0.5 mt-1.5 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-full">
              On Active Field Duty
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <p className="text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
              <MapPin className="w-3 h-3 text-cyan-600" /> Assigned Jurisdiction
            </p>
            <p className="font-semibold text-agText-primary">Ward 14 (Industrial Corridor)</p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <p className="text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-cyan-600" /> Authority Board
            </p>
            <p className="font-semibold text-agText-primary">Central Zone Utility Board</p>
          </div>
        </div>
      </div>
    </div>
  );
};
