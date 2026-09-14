import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { fetchComplaints } from '../../lib/services/complaints';
import { useComplaintsRealtime } from '../../lib/services/realtime';
import { ComplaintCard } from '../../components/ui/ComplaintCard';
import { Button } from '../../components/ui/Button';
import { PlusCircle, FileText, CheckCircle2, Wrench, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Complaint } from '../../types';

export const CitizenDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const data = await fetchComplaints({ citizenId: user.id });
    setComplaints(data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Connect live realtime updates
  useComplaintsRealtime(loadData);

  const activeCount = complaints.filter((c) => c.status !== 'Closed' && c.status !== 'Resolved').length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Welcome back, ${user?.name || 'Citizen'}`}
        description="Track your reported water shortages, leakage, and municipal infrastructure status"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadData}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Sync
            </Button>
            <Button
              variant="secondary"
              leftIcon={<PlusCircle className="w-4 h-4" />}
              onClick={() => navigate('/citizen/report')}
            >
              Report Water Issue
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Filed Reports</p>
            <p className="text-2xl font-bold text-navy-700 mt-1">{complaints.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-ag-md">
            <FileText className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Investigations</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{activeCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-ag-md">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resolved Issues</p>
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
            View All ({complaints.length})
          </Button>
        </div>

        {loading ? (
          <div className="p-8 bg-white rounded-ag-lg border border-slate-200 text-center text-xs text-slate-400">
            Loading your registered water complaints...
          </div>
        ) : complaints.length === 0 ? (
          <div className="p-8 bg-white rounded-ag-lg border border-slate-200 text-center space-y-3">
            <p className="text-sm font-semibold text-slate-700">No Water Complaints Filed Yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              You haven't submitted any complaints. Click "Report Water Issue" above to file a problem in your ward.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((item) => (
              <ComplaintCard
                key={item.id}
                complaint={item}
                onClick={() => navigate(`/citizen/complaints/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
