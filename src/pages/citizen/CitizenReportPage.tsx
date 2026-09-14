import React, { useState, useEffect } from 'react';
import { PageHeader } from '../../components/layout/PageHeader';
import { FormField } from '../../components/ui/FormField';
import { Input } from '../../components/ui/Input';
import { Select } from '../../components/ui/Select';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { fetchCategories } from '../../lib/services/categories';
import { createComplaint } from '../../lib/services/complaints';
import { uploadEvidenceFile } from '../../lib/services/evidence';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/ui/Toast';
import { useNavigate } from 'react-router-dom';
import { MapPin, Upload, CheckCircle2, FileText } from 'lucide-react';
import { TicketCode } from '../../components/ui/TicketCode';
import type { Category, ComplaintSeverity } from '../../types';

export const CitizenReportPage: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { user } = useAuth();

  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [severity, setSeverity] = useState<ComplaintSeverity>('Medium');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('400012');
  const [description, setDescription] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generatedTicket, setGeneratedTicket] = useState<string | null>(null);

  useEffect(() => {
    async function loadCats() {
      const data = await fetchCategories();
      setCategories(data);
      if (data.length > 0) {
        setCategoryId(data[0].id);
      }
    }
    loadCats();
  }, []);

  const categoryOptions = categories.map((c) => ({ value: c.id, label: c.name }));
  const severityOptions = [
    { value: 'Low', label: 'Low — Minor issue or scheduled query' },
    { value: 'Medium', label: 'Medium — Moderate inconvenience' },
    { value: 'High', label: 'High — Severe disruption to domestic supply' },
    { value: 'Critical', label: 'Critical — Major pipe burst, heavy leak, contamination hazard' },
  ];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        addToast('File too large', 'Maximum file upload size is 10MB.', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      addToast('Session Expired', 'Please log in to submit a complaint.', 'error');
      return;
    }

    setIsSubmitting(true);
    const selectedCategoryName = categories.find((c) => c.id === categoryId)?.name || 'Water Issue';

    const result = await createComplaint({
      citizenId: user.id,
      citizenName: user.name,
      categoryId,
      categoryName: selectedCategoryName,
      description,
      severity,
      address,
      pincode,
    });

    if (!result.success || !result.complaint) {
      setIsSubmitting(false);
      addToast('Submission Failed', result.message || 'Error saving complaint.', 'error');
      return;
    }

    // Upload evidence photo if provided
    if (selectedFile) {
      await uploadEvidenceFile(result.complaint.id, selectedFile);
    }

    setIsSubmitting(false);
    setGeneratedTicket(result.complaint.complaintCode);
    addToast('Water Issue Report Filed', `Ticket Code ${result.complaint.complaintCode} assigned.`, 'success');
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
                onChange={(e) => setSeverity(e.target.value as ComplaintSeverity)}
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

          <FormField label="Problem Description" required helperText="Provide details like duration, timing, water odor, or leak velocity">
            <Textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the water problem in detail..."
              required
            />
          </FormField>

          {/* Evidence File Upload */}
          <div className="p-4 border border-dashed border-slate-300 rounded-ag-md bg-slate-50 text-center space-y-2 relative">
            <input
              type="file"
              accept="image/*,application/pdf"
              onChange={handleFileChange}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            {selectedFile ? (
              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-emerald-700">
                <FileText className="w-5 h-5 text-emerald-600" />
                <span>Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(0)} KB)</span>
              </div>
            ) : (
              <>
                <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                <p className="text-xs font-semibold text-agText-primary">Attach Photo or Document Evidence (Optional)</p>
                <p className="text-[11px] text-agText-muted">JPEG, PNG, WEBP, or PDF up to 10MB</p>
              </>
            )}
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
