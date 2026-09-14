import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Droplet, Lock, Mail, Shield, User, Building2, Wrench, ShieldAlert } from 'lucide-react';
import type { UserRole } from '../../types';
import { isSupabaseConfigured } from '../../lib/supabase';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('citizen@aquaguard.gov.in');
  const [password, setPassword] = useState('password123');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const getDashboardForRole = (role: UserRole): string => {
    switch (role) {
      case 'Authority':
        return '/authority/dashboard';
      case 'Field Officer':
        return '/field-officer/dashboard';
      case 'Admin':
        return '/admin/dashboard';
      case 'Citizen':
      default:
        return '/citizen/dashboard';
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success && res.user) {
      navigate(getDashboardForRole(res.user.role));
    } else {
      setErrorMsg(res.message || 'Invalid credentials or user account does not exist.');
    }
  };

  const handleQuickDemoLogin = async (demoEmail: string) => {
    setIsSubmitting(true);
    const res = await login(demoEmail, 'password123');
    setIsSubmitting(false);
    if (res.success && res.user) {
      navigate(getDashboardForRole(res.user.role));
    } else {
      setErrorMsg(res.message || 'Demo user login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full elevation-raised rounded-ag-lg bg-white p-8 border border-slate-200 shadow-modal space-y-6">
        {/* Brand logo header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-ag-lg bg-navy-700 text-cyan-400 flex items-center justify-center mx-auto shadow-subtle">
            <Droplet className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-xl font-extrabold text-navy-700">AquaGuard System Sign In</h1>
          <p className="text-xs text-agText-secondary">
            Access your civic water complaint tracking or operational console
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-ag-md bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="space-y-4">
          <FormField label="Email Address" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@aquaguard.gov.in"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />
          </FormField>

          <FormField label="Password" required>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
              required
            />
          </FormField>

          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 text-agText-secondary cursor-pointer">
              <input type="checkbox" className="rounded border-slate-300 text-cyan-600 focus:ring-cyan-500" defaultChecked />
              <span>Remember session</span>
            </label>
            <Link to="/forgot-password" className="text-cyan-600 hover:text-cyan-700 font-medium">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" className="w-full" isLoading={isSubmitting}>
            Authenticate Account
          </Button>
        </form>

        {/* Demo Fast Login for Offline / Dev Verification */}
        {(!isSupabaseConfigured || import.meta.env.DEV) && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              <span>Fast Demo Account Login:</span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('citizen@aquaguard.gov.in')}
                className="flex items-center gap-2 p-2 rounded bg-slate-50 hover:bg-cyan-50 border border-slate-200 hover:border-cyan-300 text-left transition-colors text-xs"
              >
                <User className="w-4 h-4 text-cyan-600 shrink-0" />
                <div>
                  <p className="font-semibold text-agText-primary leading-none">Citizen</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Report & Track</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('authority@aquaguard.gov.in')}
                className="flex items-center gap-2 p-2 rounded bg-slate-50 hover:bg-navy-50 border border-slate-200 hover:border-navy-300 text-left transition-colors text-xs"
              >
                <Building2 className="w-4 h-4 text-navy-700 shrink-0" />
                <div>
                  <p className="font-semibold text-agText-primary leading-none">Authority</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Queue & Assign</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('officer@aquaguard.gov.in')}
                className="flex items-center gap-2 p-2 rounded bg-slate-50 hover:bg-amber-50 border border-slate-200 hover:border-amber-300 text-left transition-colors text-xs"
              >
                <Wrench className="w-4 h-4 text-amber-600 shrink-0" />
                <div>
                  <p className="font-semibold text-agText-primary leading-none">Field Officer</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Resolve & Update</p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleQuickDemoLogin('admin@aquaguard.gov.in')}
                className="flex items-center gap-2 p-2 rounded bg-slate-50 hover:bg-purple-50 border border-slate-200 hover:border-purple-300 text-left transition-colors text-xs"
              >
                <Shield className="w-4 h-4 text-purple-600 shrink-0" />
                <div>
                  <p className="font-semibold text-agText-primary leading-none">Admin</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">System Config</p>
                </div>
              </button>
            </div>
          </div>
        )}

        <div className="text-center text-xs text-agText-muted pt-2 border-t border-slate-100">
          New citizen user?{' '}
          <Link to="/register" className="text-cyan-600 hover:text-cyan-700 font-semibold">
            Register Citizen Account
          </Link>
        </div>
      </div>
    </div>
  );
};
