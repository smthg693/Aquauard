import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { fetchComplaints } from '../../lib/services/complaints';
import { useComplaintsRealtime } from '../../lib/services/realtime';
import { ComplaintTable } from '../../components/ui/ComplaintTable';
import { Button } from '../../components/ui/Button';
import { Building2, Users, AlertOctagon, CheckCircle2, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Complaint } from '../../types';

export const AuthorityDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    const data = await fetchComplaints();
    setComplaints(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Connect live realtime updates
  useComplaintsRealtime(loadData);

  const criticalCount = complaints.filter((c) => c.severity === 'Critical').length;
  const unassignedCount = complaints.filter((c) => !c.assignedOfficerId).length;
  const resolvedCount = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Authority Operations Dashboard"
        description="Central Zone Water Utility Board — Operational Queue & Ward Jurisdiction Control"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Refresh Queue
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Complaints</p>
            <p className="text-2xl font-bold text-navy-700 mt-1">{complaints.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-navy-700 rounded-ag-md">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Critical Escalations</p>
            <p className="text-2xl font-bold text-red-700 mt-1">{criticalCount}</p>
          </div>
          <div className="p-3 bg-red-50 text-red-700 rounded-ag-md">
            <AlertOctagon className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Unassigned Tasks</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{unassignedCount}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-ag-md">
            <Users className="w-6 h-6" />
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
          <h2 className="text-base font-bold text-navy-700">Jurisdiction Operational Queue</h2>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/authority/complaints')}
          >
            Manage Full Queue
          </Button>
        </div>

        {loading ? (
          <div className="p-8 bg-white rounded-ag-lg border border-slate-200 text-center text-xs text-slate-400">
            Loading operational complaint queue...
          </div>
        ) : (
          <ComplaintTable
            complaints={complaints}
            onRowClick={(item) => navigate(`/authority/complaints/${item.id}`)}
          />
        )}
      </div>
    </div>
  );
};
