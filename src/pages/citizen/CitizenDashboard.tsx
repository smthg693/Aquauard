import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { INITIAL_COMPLAINTS } from '../../lib/mockDataService';
import { ComplaintCard } from '../../components/ui/ComplaintCard';
import { Button } from '../../components/ui/Button';
import { PlusCircle, FileText, CheckCircle2, Wrench } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const citizenComplaints = INITIAL_COMPLAINTS.filter((c) => c.citizenId === 'user-cit-1' || c.citizenId === user?.id);

  const activeCount = citizenComplaints.filter((c) => c.status !== 'Closed' && c.status !== 'Resolved').length;
  const resolvedCount = citizenComplaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name || 'Citizen'}`}
        description="Track your reported water shortages, leakage, and municipal infrastructure status"
        action={
          <Button variant="secondary" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={() => navigate('/citizen/report')}>
            Report Water Issue
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="elevation-raised p-5 rounded-ag-lg bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-agText-muted uppercase tracking-wider">Total Filed Reports</p>
            <p className="text-2xl font-bold text-navy-700 mt-1">{citizenComplaints.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-ag-md">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="elevation-raised p-5 rounded-ag-lg bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-agText-muted uppercase tracking-wider">Active Investigations</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{activeCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-ag-md">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="elevation-raised p-5 rounded-ag-lg bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-agText-muted uppercase tracking-wider">Resolved Issues</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">{resolvedCount}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-ag-md">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-navy-700">Your Complaints & Trackers</h2>
          <Button variant="ghost" size="sm" onClick={() => navigate('/citizen/complaints')}>
            View All ({citizenComplaints.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {citizenComplaints.map((item) => (
            <ComplaintCard
              key={item.id}
              complaint={item}
              onClick={() => navigate(`/citizen/complaints/${item.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
