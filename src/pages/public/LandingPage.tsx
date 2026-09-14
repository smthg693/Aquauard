import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Droplet, ArrowRight, Activity } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { TicketCode } from '../../components/ui/TicketCode';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-surface-bg text-agText-primary flex flex-col font-sans">
      <header className="bg-navy-700 text-white py-4 px-6 border-b border-navy-800 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-ag-md bg-cyan-500 flex items-center justify-center text-white shadow-subtle">
            <Droplet className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight">Aqua<span className="text-cyan-400">Guard</span></span>
            <span className="hidden sm:inline-block text-xs text-cyan-200/80 ml-2 border-l border-navy-500 pl-2">
              Smart Water Scarcity Management System
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" className="text-white hover:bg-navy-800" onClick={() => navigate('/login')}>
            Sign In
          </Button>
          <Button variant="secondary" onClick={() => navigate('/register')}>
            Report Issue (Citizen)
          </Button>
        </div>
      </header>

      <section className="bg-navy-700 text-white py-16 px-6 border-b border-navy-800">
        <div className="max-w-5xl mx-auto space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-navy-800 border border-navy-500 text-cyan-300 text-xs font-semibold">
            <Activity className="w-3.5 h-3.5 text-cyan-400" />
            <span>State Water Security Infrastructure</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight max-w-3xl mx-auto leading-tight">
            Transparent Civic Reporting & Water Scarcity Management
          </h1>

          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Report pipeline leaks, water contamination, low pressure, and shortages directly to municipal water authorities. Track resolution lifecycle with audit-logged status updates.
          </p>

          <div className="pt-4 flex items-center justify-center gap-4 flex-wrap">
            <Button
              size="lg"
              variant="secondary"
              rightIcon={<ArrowRight className="w-4 h-4" />}
              onClick={() => navigate('/register')}
            >
              Report a Water Problem
            </Button>
            <Button
              size="lg"
              variant="dark-outline"
              onClick={() => navigate('/login')}
            >
              Authority & Officer Portal
            </Button>
          </div>
        </div>
      </section>

      <section className="py-12 px-6 max-w-6xl mx-auto w-full flex-1 space-y-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="elevation-raised rounded-ag-lg p-6 bg-white space-y-3">
            <div className="w-10 h-10 rounded-ag-md bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
              01
            </div>
            <h3 className="text-base font-bold text-navy-700">Citizens Report Issues</h3>
            <p className="text-xs text-agText-secondary leading-relaxed">
              Submit water shortages, pipe bursts, or contamination with geolocation and instant ticket identifier generation.
            </p>
            <TicketCode code="AQ-2026-001245" size="sm" />
          </div>

          <div className="elevation-raised rounded-ag-lg p-6 bg-white space-y-3">
            <div className="w-10 h-10 rounded-ag-md bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              02
            </div>
            <h3 className="text-base font-bold text-navy-700">Authorities Dispatch</h3>
            <p className="text-xs text-agText-secondary leading-relaxed">
              Jurisdiction boards review incoming complaint queues, evaluate ward urgency, and assign certified field technicians.
            </p>
          </div>

          <div className="elevation-raised rounded-ag-lg p-6 bg-white space-y-3">
            <div className="w-10 h-10 rounded-ag-md bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
              03
            </div>
            <h3 className="text-base font-bold text-navy-700">Field Evidence & Audit</h3>
            <p className="text-xs text-agText-secondary leading-relaxed">
              Field officers log on-site notes and evidence. Append-only status history guarantees audit compliance.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-ag-lg border border-slate-200 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center md:text-left">
            <h4 className="text-sm font-bold text-navy-700">Role-Based Access Control Architecture</h4>
            <p className="text-xs text-agText-muted">
              Citizens, Water Authorities, Field Officers, and System Administrators operate under strict PostgreSQL RLS policies.
            </p>
          </div>
          <Button variant="primary" onClick={() => navigate('/login')}>
            Access Portal Login
          </Button>
        </div>
      </section>

      <footer className="bg-navy-900 text-slate-400 text-xs py-6 px-6 border-t border-navy-800 text-center">
        <p>© 2026 AquaGuard Water Scarcity Management System. All rights reserved.</p>
      </footer>
    </div>
  );
};
