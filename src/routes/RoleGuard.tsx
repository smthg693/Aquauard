import React from 'react';
import { useAuth } from '../context/AuthContext';
import type { UserRole } from '../types';
import { AccessDenied } from '../components/ui/AccessDenied';
import { Navigate, useLocation } from 'react-router-dom';

interface RoleGuardProps {
  allowedRoles: UserRole[];
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({ allowedRoles, children }) => {
  const { user, role, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-surface-bg flex items-center justify-center p-6 text-center text-xs text-slate-500 font-medium">
        <div className="flex flex-col items-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-600 font-semibold">Authenticating session privileges...</p>
        </div>
      </div>
    );
  }

  if (!user || !role) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!allowedRoles.includes(role)) {
    return (
      <AccessDenied
        requiredRole={allowedRoles.join(' or ')}
        attemptedPath={location.pathname}
      />
    );
  }

  return <>{children}</>;
};
