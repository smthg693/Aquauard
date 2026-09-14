import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { fetchComplaints } from '../../lib/services/complaints';
import { useComplaintsRealtime } from '../../lib/services/realtime';
import { ComplaintCard } from '../../components/ui/ComplaintCard';
import { Button } from '../../components/ui/Button';
import { Wrench, MapPin, ArrowRight, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import type { Complaint } from '../../types';

export const FieldOfficerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadTasks = useCallback(async () => {
    setLoading(true);
    // Fetch complaints assigned to this officer or fallback list
    const data = await fetchComplaints();
    const officerTasks = data.filter((c) => c.status === 'Assigned' || c.status === 'In Progress' || c.assignedOfficerId === user?.id);
    setComplaints(officerTasks.length > 0 ? officerTasks : data);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  useComplaintsRealtime(loadTasks);

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Field Operations Console — ${user?.name || 'Officer'}`}
        description="Assigned site investigations, state updates, and evidence collection"
        action={
          <Button
            variant="outline"
            size="sm"
            onClick={loadTasks}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
          >
            Sync Workload
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Active Site Tasks</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{complaints.length}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-ag-md">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase">Assigned Ward Zone</p>
            <p className="text-base font-bold text-navy-700 mt-1">Ward 14 (Industrial Corridor)</p>
          </div>
          <div className="p-3 bg-blue-50 text-navy-700 rounded-ag-md">
            <MapPin className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-navy-700">Assigned Complaints Requiring Action</h2>
          <Button
            variant="ghost"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={() => navigate('/field-officer/complaints')}
          >
            View All ({complaints.length})
          </Button>
        </div>

        {loading ? (
          <div className="p-8 bg-white rounded-ag-lg border border-slate-200 text-center text-xs text-slate-400">
            Loading assigned field tasks...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {complaints.map((item) => (
              <ComplaintCard
                key={item.id}
                complaint={item}
                onClick={() => navigate(`/field-officer/complaints/${item.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
