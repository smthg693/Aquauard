import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { fetchAllUsers } from '../../lib/services/users';
import { Plus, RefreshCw } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import type { User } from '../../types';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const loadUsers = async () => {
    setLoading(true);
    const data = await fetchAllUsers();
    setUsers(data);
    setLoading(false);
  };

  useEffect(() => {
    loadUsers();
  }, []);

  return (
    <div className="space-y-6">
      <PageHeader
        title="User & Role Administration"
        description="View registered citizens, provision authority and field officer accounts, and audit RBAC roles"
        action={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadUsers}
              leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            >
              Refresh Directory
            </Button>
            <Button variant="primary" size="sm" leftIcon={<Plus className="w-4 h-4" />}>
              Provision Officer/Authority Account
            </Button>
          </div>
        }
      />

      <div className="overflow-x-auto rounded-ag-lg border border-slate-200 bg-white shadow-subtle">
        {loading ? (
          <div className="p-8 text-center text-xs text-slate-400">Loading user directory from database...</div>
        ) : (
          <table className="w-full text-left border-collapse min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase">
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Phone</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs text-slate-800">
              {users.map((userItem) => (
                <tr key={userItem.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-semibold text-navy-700">{userItem.name}</td>
                  <td className="py-3 px-4 text-slate-600">{userItem.email}</td>
                  <td className="py-3 px-4 text-slate-600">{userItem.phone || '—'}</td>
                  <td className="py-3 px-4">
                    <span
                      className={`px-2 py-0.5 text-[11px] font-semibold rounded ${
                        userItem.role === 'Admin'
                          ? 'bg-purple-100 text-purple-800'
                          : userItem.role === 'Authority'
                          ? 'bg-navy-100 text-navy-800'
                          : userItem.role === 'Field Officer'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-cyan-50 text-cyan-800'
                      }`}
                    >
                      {userItem.role}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 text-[11px] font-semibold text-emerald-800 bg-emerald-50 rounded">
                      {userItem.accountStatus}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
