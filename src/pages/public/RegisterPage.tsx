import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Droplet, User, Mail, Phone, Lock, ShieldCheck, ShieldAlert } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    const result = await register(name, email, phone, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/citizen/dashboard');
    } else {
      setErrorMsg(result.message || 'Registration failed.');
    }
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-center items-center p-4 py-10">
      <div className="max-w-md w-full elevation-raised rounded-ag-lg bg-white p-8 border border-slate-200 shadow-modal space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-ag-lg bg-navy-700 text-cyan-400 flex items-center justify-center mx-auto shadow-subtle">
            <Droplet className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-xl font-extrabold text-navy-700">Citizen Registration</h1>
          <p className="text-xs text-agText-secondary">
            Create an account to report water shortages, leaks, or quality issues
          </p>
        </div>

        {/* Security Rule Warning */}
        <div className="p-3 bg-cyan-50 border border-cyan-200 rounded-ag-md text-xs text-cyan-900 flex items-start gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
          <p className="leading-normal">
            <strong>Citizen Account Provisioning:</strong> Public registration is restricted strictly to the <strong>Citizen</strong> role. Water Authority, Field Officer, and Admin credentials are provisioned securely by system administrators.
          </p>
        </div>

        {errorMsg && (
          <div className="p-3 rounded-ag-md bg-red-50 border border-red-200 text-xs text-red-800 flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <FormField label="Full Name" required>
            <Input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Aarav Patel"
              leftIcon={<User className="w-4 h-4 text-slate-400" />}
              required
            />
          </FormField>

          <FormField label="Email Address" required>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="aarav.patel@example.com"
              leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
              required
            />
          </FormField>

          <FormField label="Mobile Phone Number" required>
            <Input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              leftIcon={<Phone className="w-4 h-4 text-slate-400" />}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

            <FormField label="Confirm Password" required>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4 text-slate-400" />}
                required
              />
            </FormField>
          </div>

          <FormField label="Assigned System Role">
            <Input
              type="text"
              value="Citizen (Default Security Tier)"
              disabled
              className="bg-slate-100 font-semibold text-navy-700"
            />
          </FormField>

          <Button type="submit" variant="secondary" className="w-full" isLoading={isSubmitting}>
            Create Citizen Account
          </Button>
        </form>

        <div className="text-center text-xs text-agText-muted pt-2 border-t border-slate-100">
          Already registered?{' '}
          <Link to="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold">
            Sign In Here
          </Link>
        </div>
      </div>
    </div>
  );
};
