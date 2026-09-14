import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';
import { Droplet, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full elevation-raised rounded-ag-lg bg-white p-8 border border-slate-200 shadow-modal space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-ag-lg bg-navy-700 text-cyan-400 flex items-center justify-center mx-auto shadow-subtle">
            <Droplet className="w-6 h-6 fill-current" />
          </div>
          <h1 className="text-xl font-extrabold text-navy-700">Account Password Recovery</h1>
          <p className="text-xs text-agText-secondary">
            Enter your registered email address to receive a secure recovery token
          </p>
        </div>

        {submitted ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-ag-md text-center space-y-3">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <h3 className="text-sm font-semibold text-emerald-950">Recovery Instructions Sent</h3>
            <p className="text-xs text-emerald-800 leading-relaxed">
              We sent password reset instructions to <strong>{email}</strong>.
            </p>
            <Link to="/reset-password">
              <Button variant="outline" size="sm" className="mt-2 w-full">
                Proceed to Reset Token Form
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Registered Email" required>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@aquaguard.gov.in"
                leftIcon={<Mail className="w-4 h-4 text-slate-400" />}
                required
              />
            </FormField>

            <Button type="submit" variant="primary" className="w-full">
              Send Password Reset Link
            </Button>
          </form>
        )}

        <div className="text-center text-xs text-agText-muted pt-2 border-t border-slate-100">
          <Link to="/login" className="text-cyan-600 hover:text-cyan-700 font-semibold inline-flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};
