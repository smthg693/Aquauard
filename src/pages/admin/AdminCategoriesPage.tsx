import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { INITIAL_CATEGORIES } from '../../lib/mockDataService';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminCategoriesPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Water Problem Categories"
        description="Manage civic complaint classification categories seeded into PostgreSQL"
        action={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Add New Category
          </Button>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {INITIAL_CATEGORIES.map((cat) => (
          <div key={cat.id} className="elevation-raised rounded-ag-lg p-4 bg-white border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-navy-700">{cat.name}</h3>
              <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 rounded">
                Active
              </span>
            </div>
            <p className="text-xs text-agText-secondary leading-relaxed">{cat.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
