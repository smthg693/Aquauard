import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Droplet, Lock, KeyRound, CheckCircle2 } from 'lucide-react';

export const ResetPasswordPage: React.FC = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleReset = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full elevation-raised rounded-ag-lg bg-white p-8 border border-slate-200 shadow-modal space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-ag-lg bg-navy-700 text-cyan-400 flex items-center justify-center mx-auto shadow-subtle">
            <Droplet className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-xl font-extrabold text-navy-700">Set New Password</h1>
          <p className="text-xs text-agText-secondary">
            Enter your reset token and new account password
          </p>
        </div>

        {isSuccess ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-ag-md text-center space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-semibold text-emerald-950">Password Reset Complete</h3>
            <p className="text-xs text-emerald-800">Redirecting to login page...</p>
          </div>
        ) : (
          <form onSubmit={handleReset} className="space-y-4">
            <FormField label="Security Reset Token" required>
              <Input
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="AQ-RESET-991204"
                leftIcon={<KeyRound className="w-4 h-4 text-slate-400" />}
                required
              />
            </FormField>

            <FormField label="New Password" required>
              <Input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />
            </FormField>

            <Button type="submit" variant="primary" className="w-full">
              Update Credentials
            </Button>
          </form>
        )}

        <div className="text-center text-xs text-agText-muted pt-2 border-t border-slate-100">
          <Link to="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold">
            Return to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
