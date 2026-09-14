import React from 'react';
import { ShieldAlert, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from './Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface AccessDeniedProps {
  requiredRole?: string;
  attemptedPath?: string;
}

export const AccessDenied: React.FC<AccessDeniedProps> = ({ requiredRole, attemptedPath }) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleReturnHome = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    switch (user.role) {
      case 'Citizen':
        navigate('/citizen/dashboard');
        break;
      case 'Authority':
        navigate('/authority/dashboard');
        break;
      case 'Field Officer':
        navigate('/field-officer/dashboard');
        break;
      case 'Admin':
        navigate('/admin/dashboard');
        break;
      default:
        navigate('/');
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-surface-bg">
      <div className="max-w-md w-full elevation-raised rounded-ag-lg p-8 bg-white text-center space-y-5 border border-red-200 shadow-modal">
        <div className="w-14 h-14 bg-red-50 text-agStatus-danger rounded-full flex items-center justify-center mx-auto border border-red-200">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <span className="inline-block px-2.5 py-0.5 text-xs font-mono font-semibold bg-red-100 text-red-800 rounded-ag-sm">
            HTTP 403 — FORBIDDEN
          </span>
          <h2 className="text-xl font-bold text-navy-700">Access Restricted</h2>
          <p className="text-xs text-agText-secondary leading-relaxed">
            Your authenticated account (<strong className="font-semibold text-agText-primary">{user?.role || 'Guest'}</strong>) is not authorized to view this restricted endpoint{attemptedPath ? `: ` : '.'}
            {attemptedPath && <code className="block mt-1 p-1 bg-slate-100 font-mono text-[11px] text-slate-700 rounded">{attemptedPath}</code>}
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-ag-md border border-slate-200 text-left text-xs space-y-1 text-slate-600">
          <div className="flex items-center gap-1.5 font-semibold text-agText-primary">
            <KeyRound className="w-3.5 h-3.5 text-cyan-600" />
            <span>Role-Based Access Control (RBAC) Policy</span>
          </div>
          <p className="text-[11px] text-agText-muted leading-normal">
            Server-side PostgreSQL Row Level Security (RLS) & auth policies prevent cross-role data access.
            {requiredRole && ` This section requires "${requiredRole}" privilege.`}
          </p>
        </div>

        <div className="pt-2 flex flex-col gap-2">
          <Button
            variant="primary"
            className="w-full"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
            onClick={handleReturnHome}
          >
            Return to Authorized Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};
