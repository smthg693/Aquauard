import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { INITIAL_COMPLAINTS } from '../../lib/mockDataService';
import { ComplaintCard } from '../../components/ui/ComplaintCard';
import { ComplaintTable } from '../../components/ui/ComplaintTable';
import { Button } from '../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, List, PlusCircle } from 'lucide-react';

export const CitizenComplaintsPage: React.FC = () => {
  const navigate = useNavigate();
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Filed Complaints"
        description="Comprehensive audit of all water issue tickets submitted from your citizen account"
        action={
          <div className="flex items-center gap-2">
            <div className="bg-white border border-slate-200 rounded-ag-md p-1 flex items-center gap-1 shadow-subtle">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-cyan-50 text-cyan-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded ${viewMode === 'table' ? 'bg-cyan-50 text-cyan-600 font-semibold' : 'text-slate-400 hover:text-slate-600'}`}
                title="Table View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            <Button variant="secondary" leftIcon={<PlusCircle className="w-4 h-4" />} onClick={() => navigate('/citizen/report')}>
              Report Issue
            </Button>
          </div>
        }
      />

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INITIAL_COMPLAINTS.map((item) => (
            <ComplaintCard
              key={item.id}
              complaint={item}
              onClick={() => navigate(`/citizen/complaints/${item.id}`)}
            />
          ))}
        </div>
      ) : (
        <ComplaintTable
          complaints={INITIAL_COMPLAINTS}
          onRowClick={(item) => navigate(`/citizen/complaints/${item.id}`)}
        />
      )}
    </div>
  );
};
