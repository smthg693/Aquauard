import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MOCK_USERS, MOCK_AUTHORITIES, INITIAL_CATEGORIES } from '../../lib/mockDataService';
import { Shield, Users, Building2, ListFilter } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';

export const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin Control Center"
        description="System configuration, user role management, water authority provisioning, and category administration"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="elevation-raised p-5 rounded-ag-lg bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-agText-muted uppercase">Total Users</p>
            <p className="text-2xl font-bold text-navy-700 mt-1">{MOCK_USERS.length}</p>
          </div>
          <div className="p-3 bg-purple-50 text-purple-700 rounded-ag-md">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="elevation-raised p-5 rounded-ag-lg bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-agText-muted uppercase">Authorities</p>
            <p className="text-2xl font-bold text-blue-700 mt-1">{MOCK_AUTHORITIES.length}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-700 rounded-ag-md">
            <Building2 className="w-6 h-6" />
          </div>
        </div>

        <div className="elevation-raised p-5 rounded-ag-lg bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-agText-muted uppercase">Categories</p>
            <p className="text-2xl font-bold text-cyan-700 mt-1">{INITIAL_CATEGORIES.length}</p>
          </div>
          <div className="p-3 bg-cyan-50 text-cyan-700 rounded-ag-md">
            <ListFilter className="w-6 h-6" />
          </div>
        </div>

        <div className="elevation-raised p-5 rounded-ag-lg bg-white border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-agText-muted uppercase">RLS Policies</p>
            <p className="text-2xl font-bold text-emerald-700 mt-1">10 Enforced</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-700 rounded-ag-md">
            <Shield className="w-6 h-6" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="elevation-raised p-6 rounded-ag-lg bg-white border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-navy-700">Role Provisioning Policy</h3>
          <p className="text-xs text-agText-secondary leading-relaxed">
            Public registration generates <strong>Citizen</strong> role accounts. Authority, Field Officer, and Admin credentials are provisioned manually by administrators to prevent unauthorized access.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/users')}>
            Provision System Accounts
          </Button>
        </div>

        <div className="elevation-raised p-6 rounded-ag-lg bg-white border border-slate-200 space-y-3">
          <h3 className="text-sm font-bold text-navy-700">Complaint Categories Seed</h3>
          <p className="text-xs text-agText-secondary leading-relaxed">
            9 active categories seeded including Water Shortage, Pipeline Leakage, Contaminated Water, and Low Pressure.
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/admin/categories')}>
            Manage Categories
          </Button>
        </div>
      </div>
    </div>
  );
};
