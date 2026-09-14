import React from 'react';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../types';
import { Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const DemoRoleSwitcher: React.FC = () => {
  const { role, switchRole } = useAuth();
  const navigate = useNavigate();

  const roles: { key: UserRole; label: string; defaultRoute: string }[] = [
    { key: 'Citizen', label: 'Citizen', defaultRoute: '/citizen/dashboard' },
    { key: 'Authority', label: 'Authority', defaultRoute: '/authority/dashboard' },
    { key: 'Field Officer', label: 'Field Officer', defaultRoute: '/field-officer/dashboard' },
    { key: 'Admin', label: 'Admin', defaultRoute: '/admin/dashboard' },
  ];

  const handleRoleChange = (selectedRole: UserRole, defaultRoute: string) => {
    switchRole(selectedRole);
    navigate(defaultRoute);
  };

  return (
    <div className="bg-navy-900 text-white text-xs px-4 py-1.5 flex items-center justify-between border-b border-navy-800 flex-wrap gap-2">
      <div className="flex items-center gap-2 text-cyan-300 font-medium">
        <Shield className="w-3.5 h-3.5 text-cyan-400" />
        <span className="font-semibold tracking-wide uppercase text-[10px]">AquaGuard RBAC Environment:</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap">
        <span className="text-slate-400 text-[11px] mr-1">Active Role:</span>
        {roles.map((r) => {
          const isActive = role === r.key;
          return (
            <button
              key={r.key}
              onClick={() => handleRoleChange(r.key, r.defaultRoute)}
              className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-all ${
                isActive
                  ? 'bg-cyan-500 text-white font-semibold shadow-subtle ring-1 ring-white/30'
                  : 'bg-navy-800 text-slate-300 hover:bg-navy-700 hover:text-white'
              }`}
            >
              {r.label}
            </button>
          );
        })}
      </div>
    </div>
  );
};
