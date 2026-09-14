import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { BarChart3, TrendingUp, Clock, AlertTriangle } from 'lucide-react';

export const AuthorityAnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Analytics & Response Trends"
        description="Key performance metrics, resolution turnaround times, and ward complaint frequency"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="elevation-raised p-5 rounded-ag-lg bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-agText-muted uppercase">Avg Resolution Time</span>
            <Clock className="w-5 h-5 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-navy-700">18.4 Hours</p>
          <p className="text-[11px] text-emerald-600 font-medium">↓ 2.1 hrs improvement vs last month</p>
        </div>

        <div className="elevation-raised p-5 rounded-ag-lg bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-agText-muted uppercase">First Response SLA</span>
            <TrendingUp className="w-5 h-5 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-navy-700">94.2%</p>
          <p className="text-[11px] text-emerald-600 font-medium">Within 2 hours target</p>
        </div>

        <div className="elevation-raised p-5 rounded-ag-lg bg-white border border-slate-200 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-agText-muted uppercase">Highest Frequency Issue</span>
            <AlertTriangle className="w-5 h-5 text-amber-600" />
          </div>
          <p className="text-2xl font-bold text-navy-700">Pipeline Leakage</p>
          <p className="text-[11px] text-slate-500 font-medium">42% of total logged complaints</p>
        </div>
      </div>

      <div className="elevation-raised p-6 rounded-ag-lg bg-white border border-slate-200 text-center space-y-3">
        <BarChart3 className="w-10 h-10 text-cyan-600 mx-auto" />
        <h3 className="text-sm font-bold text-navy-700">Analytics Visualization Module</h3>
        <p className="text-xs text-agText-muted max-w-md mx-auto">
          Chart canvas target for resolution velocity graphs, ward comparison bar charts, and seasonal shortage forecasting.
        </p>
      </div>
    </div>
  );
};
