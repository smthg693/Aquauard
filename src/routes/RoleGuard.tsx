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
    return <div className="p-8 text-center text-xs text-slate-500">Authenticating session privileges...</div>;
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
