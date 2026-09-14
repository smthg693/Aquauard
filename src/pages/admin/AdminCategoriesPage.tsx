import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { fetchCategories } from '../../lib/services/categories';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { Category } from '../../types';

export const AdminCategoriesPage: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadCategories = async () => {
    setLoading(true);
    const data = await fetchCategories();
    setCategories(data);
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Water Problem Categories"
        description="Manage civic complaint classification categories seeded into PostgreSQL"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadCategories}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Add New Category
            </Button>
          </div>
        }
      />

      {loading ? (
        <div className="p-8 text-center text-xs text-slate-400">Loading categories...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {categories.map((cat) => (
            <div key={cat.id} className="rounded-ag-lg p-4 bg-white border border-slate-200 shadow-subtle space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-navy-700">{cat.name}</h3>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-emerald-50 text-emerald-800 rounded">
                  {cat.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">{cat.description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
