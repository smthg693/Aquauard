import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { LeafletMap } from '../../components/ui/LeafletMap';
import { fetchComplaints } from '../../lib/services/complaints';
import type { Complaint } from '../../types';
import { Filter, RefreshCw, AlertOctagon, CheckCircle2, Clock } from 'lucide-react';
import { StatusBadge } from '../../components/ui/StatusBadge';
import { SeverityBadge } from '../../components/ui/SeverityBadge';
import { TicketCode } from '../../components/ui/TicketCode';

export const AuthorityMapPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);

  const loadMapData = async () => {
    setLoading(true);
    const data = await fetchComplaints();
    setComplaints(data);
    setLoading(false);
  };

  useEffect(() => {
    loadMapData();
  }, []);

  const filteredComplaints = complaints.filter((c) => {
    if (selectedSeverity !== 'ALL' && c.severity !== selectedSeverity) return false;
    if (selectedStatus !== 'ALL' && c.status !== selectedStatus) return false;
    return true;
  });

  const criticalCount = complaints.filter((c) => c.severity === 'Critical').length;
  const highCount = complaints.filter((c) => c.severity === 'High').length;
  const openCount = complaints.filter((c) => c.status !== 'Resolved' && c.status !== 'Closed').length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="GIS Ward Jurisdiction Map"
        description="Geospatial distribution and real-time mapping of reported water scarcity, pipe leaks, and contamination issues"
        action={
          <button
            onClick={loadMapData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-ag-md bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh GPS Data
          </button>
        }
      />

      {/* Summary KPI Pills */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-ag-md border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Critical Incidents</p>
            <p className="text-xl font-bold text-red-600">{criticalCount}</p>
          </div>
          <AlertOctagon className="w-8 h-8 text-red-500 opacity-80" />
        </div>
        <div className="bg-white p-4 rounded-ag-md border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">High Urgency</p>
            <p className="text-xl font-bold text-amber-600">{highCount}</p>
          </div>
          <Clock className="w-8 h-8 text-amber-500 opacity-80" />
        </div>
        <div className="bg-white p-4 rounded-ag-md border border-slate-200 shadow-subtle flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-500 font-medium">Active Open Pins</p>
            <p className="text-xl font-bold text-cyan-600">{openCount}</p>
          </div>
          <CheckCircle2 className="w-8 h-8 text-cyan-500 opacity-80" />
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-white p-4 rounded-ag-lg border border-slate-200 shadow-subtle flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filter Urgency:</span>
          </div>
          <select
            value={selectedSeverity}
            onChange={(e) => setSelectedSeverity(e.target.value)}
            className="text-xs border border-slate-200 rounded-ag-md px-2.5 py-1.5 bg-slate-50 focus:bg-white font-medium"
          >
            <option value="ALL">All Severities</option>
            <option value="Critical">Critical Only</option>
            <option value="High">High Only</option>
            <option value="Medium">Medium Only</option>
            <option value="Low">Low Only</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium ml-2">
            <span>Status:</span>
          </div>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="text-xs border border-slate-200 rounded-ag-md px-2.5 py-1.5 bg-slate-50 focus:bg-white font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
        </div>

        <span className="text-xs text-slate-500 font-medium">
          Showing {filteredComplaints.length} mapped incidents
        </span>
      </div>

      {/* Map & Detail Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {loading ? (
            <div className="h-[480px] w-full bg-slate-100 rounded-ag-lg flex items-center justify-center border border-slate-200">
              <span className="text-xs text-slate-500 font-medium animate-pulse">Loading GIS Map Layer...</span>
            </div>
          ) : (
            <LeafletMap
              complaints={filteredComplaints}
              height="480px"
              onSelectComplaint={(c) => setSelectedComplaint(c)}
            />
          )}
        </div>

        {/* Selected Incident Drawer / Roster */}
        <div className="bg-white rounded-ag-lg border border-slate-200 p-4 shadow-subtle flex flex-col h-[480px] overflow-hidden">
          <h3 className="text-sm font-bold text-navy-700 pb-3 border-b border-slate-100">
            {selectedComplaint ? 'Selected Incident' : 'Mapped Incidents List'}
          </h3>

          {selectedComplaint ? (
            <div className="py-4 space-y-4 overflow-y-auto flex-1">
              <div className="flex items-center justify-between">
                <TicketCode code={selectedComplaint.complaintCode} />
                <SeverityBadge severity={selectedComplaint.severity} />
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-900">{selectedComplaint.categoryName}</h4>
                <p className="text-xs text-slate-600 mt-1">{selectedComplaint.description}</p>
              </div>

              <div className="space-y-1.5 text-xs text-slate-600 border-t border-b border-slate-100 py-3">
                <p><strong>Address:</strong> {selectedComplaint.address}</p>
                <p><strong>Citizen:</strong> {selectedComplaint.citizenName}</p>
                <div className="mt-2">
                  <StatusBadge status={selectedComplaint.status} />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setSelectedComplaint(null)}
                  className="flex-1 py-1.5 px-3 border border-slate-200 rounded-ag-md text-xs font-medium text-slate-600 hover:bg-slate-50"
                >
                  Clear Selection
                </button>
                <a
                  href={`/authority/complaints/${selectedComplaint.id}`}
                  className="flex-1 py-1.5 px-3 bg-navy-700 text-white text-center rounded-ag-md text-xs font-medium hover:bg-navy-800"
                >
                  Full Detail & Dispatch
                </a>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-y-auto flex-1 mt-1">
              {filteredComplaints.length === 0 ? (
                <p className="text-xs text-slate-400 py-8 text-center">No mapped incidents match current filters.</p>
              ) : (
                filteredComplaints.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedComplaint(item)}
                    className="py-3 px-1 hover:bg-slate-50 cursor-pointer rounded transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <TicketCode code={item.complaintCode} size="sm" />
                      <SeverityBadge severity={item.severity} />
                    </div>
                    <p className="text-xs font-medium text-slate-800 truncate">{item.categoryName}</p>
                    <p className="text-[11px] text-slate-500 truncate">{item.address}</p>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
