import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { INITIAL_COMPLAINTS } from '../../lib/mockDataService';
import { ComplaintCard } from '../../components/ui/ComplaintCard';
import { Button } from '../../components/ui/Button';
import { Wrench, MapPin, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const FieldOfficerDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const assignedTasks = INITIAL_COMPLAINTS.filter((c) => c.assignedOfficerId === 'off-1' || c.assignedOfficerName?.includes('Rajesh'));

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Field Operations Console — ${user?.name || 'Officer Rajesh'}`}
        description="Assigned site investigations, state updates, and evidence collection"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="elevation-raised p-5 rounded-ag-lg bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-agText-muted uppercase">Active Site Tasks</p>
            <p className="text-2xl font-bold text-amber-700 mt-1">{assignedTasks.length}</p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-700 rounded-ag-md">
            <Wrench className="w-6 h-6" />
          </div>
        </div>

        <div className="elevation-raised p-5 rounded-ag-lg bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-agText-muted uppercase">Assigned Ward Zone</p>
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
            View All ({assignedTasks.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignedTasks.map((item) => (
            <ComplaintCard
              key={item.id}
              complaint={item}
              onClick={() => navigate(`/field-officer/complaints/${item.id}`)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
