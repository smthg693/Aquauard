import React from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { MOCK_USERS } from '../../lib/mockDataService';
import { Plus } from 'lucide-react';
import { Button } from '../../components/ui/Button';

export const AdminUsersPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Role Administration"
        description="View registered citizens, provision authority and field officer accounts, and audit RBAC roles"
        action={
          <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
            Provision Officer/Authority Account
          </Button>
        }
      />

      <div className="overflow-x-auto rounded-ag-lg border border-slate-200 bg-white shadow-subtle">
        <table className="w-full text-left border-collapse min-w-[640px]">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-agText-secondary uppercase">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Phone</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 text-xs text-agText-primary">
            {MOCK_USERS.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="py-3 px-4 font-semibold text-navy-700">{user.name}</td>
                <td className="py-3 px-4 text-slate-600">{user.email}</td>
                <td className="py-3 px-4 text-slate-600">{user.phone || '—'}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                    user.role === 'Admin' ? 'bg-purple-100 text-purple-800' :
                    user.role === 'Authority' ? 'bg-navy-100 text-navy-800' :
                    user.role === 'Field Officer' ? 'bg-amber-100 text-amber-800' : 'bg-cyan-50 text-cyan-800'
                  }`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 rounded">
                    {user.accountStatus}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
