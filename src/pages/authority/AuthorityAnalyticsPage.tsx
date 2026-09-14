import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { Clock, TrendingUp, AlertTriangle, RefreshCw, BarChart3 } from 'lucide-react';
import { fetchAuthorityAnalytics, type AnalyticsSummary } from '../../lib/services/analytics';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const COLORS = ['#0B2545', '#2EA9C4', '#1F9D63', '#DB8A1E', '#D6493C', '#718096'];

export const AuthorityAnalyticsPage: React.FC = () => {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const loadAnalytics = async () => {
    setLoading(true);
    const res = await fetchAuthorityAnalytics();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Operational Analytics & Response Trends"
        description="Real-time performance metrics, resolution turnaround times, and ward complaint frequency analysis"
        action={
          <button
            onClick={loadAnalytics}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-ag-md bg-white border border-slate-200 text-slate-700 text-xs font-medium hover:bg-slate-50 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Analytics
          </button>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Total Logged</span>
            <BarChart3 className="w-5 h-5 text-navy-700" />
          </div>
          <p className="text-2xl font-bold text-navy-700">{data?.totalCount ?? 0}</p>
          <p className="text-[11px] text-slate-500 font-medium">All recorded complaints</p>
        </div>

        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Avg Resolution Time</span>
            <Clock className="w-5 h-5 text-cyan-600" />
          </div>
          <p className="text-2xl font-bold text-navy-700">{data?.avgResolutionHours ?? 0} Hours</p>
          <p className="text-[11px] text-emerald-600 font-medium">↓ 2.1 hrs vs target SLA</p>
        </div>

        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Resolution Rate</span>
            <TrendingUp className="w-5 h-5 text-emerald-600" />
          </div>
          <p className="text-2xl font-bold text-navy-700">
            {data && data.totalCount > 0
              ? `${Math.round((data.resolvedCount / data.totalCount) * 100)}%`
              : '0%'}
          </p>
          <p className="text-[11px] text-emerald-600 font-medium">Within target SLA window</p>
        </div>

        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase">Critical Incidents</span>
            <AlertTriangle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-2xl font-bold text-red-600">{data?.criticalCount ?? 0}</p>
          <p className="text-[11px] text-red-600 font-medium">High priority focus</p>
        </div>
      </div>

      {/* Recharts Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Complaint & Resolution Trends Bar Chart */}
        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-navy-700">Monthly Incident Volume & Resolution Velocity</h3>
          <div className="h-64 w-full">
            {loading || !data ? (
              <div className="h-full w-full bg-slate-50 animate-pulse rounded-ag-md flex items-center justify-center text-xs text-slate-400">
                Loading Monthly Data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.monthlyTrends}>
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#718096' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#718096' }} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0', borderRadius: '6px', fontSize: '12px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="reported" fill="#0B2545" name="Reported" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="resolved" fill="#2EA9C4" name="Resolved" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white p-5 rounded-ag-lg border border-slate-200 shadow-subtle space-y-4">
          <h3 className="text-sm font-bold text-navy-700">Complaints by Category Breakdown</h3>
          <div className="h-64 w-full">
            {loading || !data ? (
              <div className="h-full w-full bg-slate-50 animate-pulse rounded-ag-md flex items-center justify-center text-xs text-slate-400">
                Loading Category Data...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.categoryDistribution}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${((percent || 0) * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {data.categoryDistribution.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#E2E8F0', borderRadius: '6px', fontSize: '12px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
