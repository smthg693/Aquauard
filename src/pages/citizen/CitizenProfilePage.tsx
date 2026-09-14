import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { useAuth } from '../../context/AuthContext';
import { Mail, Phone, ShieldCheck, Calendar } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const CitizenProfilePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PageHeader
        title="Citizen Profile & Account"
        description="Your registered civic identity and contact preferences"
      />

      <div className="elevation-raised rounded-ag-lg bg-white p-6 border border-slate-200 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div className="w-16 h-16 rounded-full bg-navy-700 text-cyan-400 text-2xl font-bold flex items-center justify-center border-2 border-cyan-500 shadow-subtle">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'C'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-navy-700">{user?.name}</h2>
            <p className="text-xs text-agText-secondary">{user?.email}</p>
            <span className="inline-block px-2.5 py-0.5 mt-1.5 text-xs font-semibold bg-cyan-50 text-cyan-800 border border-cyan-200 rounded-full">
              Verified Citizen Account
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <p className="text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
              <Mail className="w-3 h-3 text-cyan-600" /> Primary Email
            </p>
            <p className="font-semibold text-agText-primary">{user?.email}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <p className="text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
              <Phone className="w-3 h-3 text-cyan-600" /> Phone Number
            </p>
            <p className="font-semibold text-agText-primary">{user?.phone || '+91 98765 43210'}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <p className="text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-cyan-600" /> Assigned Role
            </p>
            <p className="font-semibold text-navy-700">{user?.role}</p>
          </div>

          <div className="p-3 bg-slate-50 rounded border border-slate-200 space-y-1">
            <p className="text-[10px] uppercase text-slate-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3 h-3 text-cyan-600" /> Account Created
            </p>
            <p className="font-semibold text-agText-primary">{new Date(user?.createdAt || Date.now()).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex justify-end">
          <Button variant="outline" size="sm">
            Edit Contact Info
          </Button>
        </div>
      </div>
    </div>
  );
};
