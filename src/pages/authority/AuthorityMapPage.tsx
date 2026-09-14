import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MapPin, Layers } from 'lucide-react';
import { TicketCode } from '../../components/ui/TicketCode';

export const AuthorityMapPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="GIS Ward Jurisdiction Map"
        description="Geospatial distribution of reported water shortages, pipeline bursts, and contaminated supplies"
      />

      <div className="elevation-raised rounded-ag-lg bg-white p-6 border border-slate-200 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2 pb-3 border-b border-slate-100 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-navy-700">Ward Sectors:</span>
            <span className="px-2 py-0.5 rounded bg-red-50 text-red-700 font-semibold border border-red-200">Ward 14 (Critical)</span>
            <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-800 font-semibold border border-amber-200">Ward 8 (Medium)</span>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1 text-slate-600 hover:text-navy-700 font-medium">
              <Layers className="w-3.5 h-3.5" /> Toggle Pipe Layer
            </button>
          </div>
        </div>

        <div className="h-[400px] w-full bg-slate-100 rounded-ag-md border border-slate-300 relative overflow-hidden flex items-center justify-center">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#0B2545_1px,transparent_1px)] [background-size:16px_16px]" />
          
          <div className="absolute top-1/3 left-1/4 bg-white p-3 rounded-ag-md border border-red-300 shadow-raised text-center space-y-1 z-10">
            <div className="flex items-center gap-1 text-xs font-bold text-red-700">
              <MapPin className="w-4 h-4 fill-red-100" />
              <span>Ward 14 — Main Burst</span>
            </div>
            <TicketCode code="AQ-2026-001245" size="sm" />
          </div>

          <div className="absolute bottom-1/3 right-1/3 bg-white p-3 rounded-ag-md border border-amber-300 shadow-raised text-center space-y-1 z-10">
            <div className="flex items-center gap-1 text-xs font-bold text-amber-800">
              <MapPin className="w-4 h-4 fill-amber-100" />
              <span>Ward 8 — Shortage</span>
            </div>
            <TicketCode code="AQ-2026-001247" size="sm" />
          </div>

          <p className="text-xs text-slate-400 font-medium z-0">
            GIS Interactive Map Layer Canvas (Leaflet/Mapbox Foundation Target)
          </p>
        </div>
      </div>
    </div>
  );
};
