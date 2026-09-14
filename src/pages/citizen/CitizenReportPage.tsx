import React, { useState } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { INITIAL_CATEGORIES } from '../../lib/mockDataService';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, CheckCircle2 } from 'lucide-react';
import { TicketCode } from '../../components/ui/TicketCode';

export const CitizenReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [categoryId, setCategoryId] = useState(INITIAL_CATEGORIES[0].id);
  const [severity, setSeverity] = useState('Medium');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('400012');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<string | null>(null);

  const categoryOptions = INITIAL_CATEGORIES.map((c) => ({ value: c.id, label: c.name }));
  const severityOptions = [
    { value: 'Low', label: 'Low — Minor issue or scheduled query' },
    { value: 'Medium', label: 'Medium — Moderate inconvenience' },
    { value: 'High', label: 'High — Severe disruption to domestic supply' },
    { value: 'Critical', label: 'Critical — Major pipe burst, heavy leak, contamination hazard' },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const ticketCode = `AQ-2026-${Math.floor(100000 + Math.random() * 900000)}`;

    setTimeout(() => {
      setIsSubmitting(false);
      setGeneratedTicket(ticketCode);
      addToast('Water Issue Report Filed', `Ticket Code ${ticketCode} assigned to your record.`, 'success');
    }, 1000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader
        title="Report a Water Problem"
        description="Provide details regarding water shortages, pipeline leakage, pressure drop, or contamination in your ward"
      />

      {generatedTicket ? (
        <div className="elevation-raised rounded-ag-lg bg-white p-8 text-center space-y-5 border border-emerald-200 shadow-modal">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-bold text-navy-700">Report Successfully Submitted</h2>
            <p className="text-xs text-agText-secondary max-w-md mx-auto">
              Your ticket has been dispatched to the Central Water Utility Board. You can track progress in real time using your unique code.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-ag-md border border-slate-200 inline-block">
            <p className="text-xs text-agText-muted mb-1 font-medium">Assigned Ticket Reference:</p>
            <TicketCode code={generatedTicket} size="lg" />
          </div>

          <div className="pt-2 flex justify-center gap-3">
            <Button variant="outline" onClick={() => setGeneratedTicket(null)}>
              File Another Issue
            </Button>
            <Button variant="primary" onClick={() => navigate('/citizen/complaints')}>
              Go to My Complaints Tracker
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="elevation-raised rounded-ag-lg bg-white p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Problem Category" required>
              <Select
                options={categoryOptions}
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
              />
            </FormField>

            <FormField label="Perceived Severity" required>
              <Select
                options={severityOptions}
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              />
            </FormField>
          </div>

          <FormField label="Street Address / Ward / Landmark" required helperText="Specify exact location for field technician dispatch">
            <Input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Cross Road 4, Sector 7, Ward 14"
              leftIcon={<MapPin className="w-4 h-4 text-slate-400" />}
              required
            />
          </FormField>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormField label="Pincode" required>
              <Input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="400012"
                required
              />
            </FormField>

            <FormField label="City / Region">
              <Input type="text" value="Metropolis Central" disabled className="bg-slate-100" />
            </FormField>
          </div>

          <FormField label="Problem Description" required helperText="Provide any relevant details like timing, duration, water odor, or leak speed">
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the water problem in detail..."
              required
            />
          </FormField>

          <div className="p-4 border border-dashed border-slate-300 rounded-ag-md bg-slate-50 text-center space-y-2">
            <Upload className="w-6 h-6 text-slate-400 mx-auto" />
            <p className="text-xs font-semibold text-agText-primary">Attach Photo or Video Evidence (Optional)</p>
            <p className="text-[11px] text-agText-muted">JPEG, PNG, MP4 up to 10MB</p>
          </div>

          <div className="pt-2 flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={() => navigate('/citizen/dashboard')}>
              Cancel
            </Button>
            <Button type="submit" variant="secondary" isLoading={isSubmitting}>
              Submit Water Complaint Report
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
