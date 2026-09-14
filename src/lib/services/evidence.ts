import { supabase, isSupabaseConfigured } from '../supabase';
import type { Evidence } from '../../types';

export async function uploadEvidenceFile(
  complaintId: string,
  file: File
): Promise<{ success: boolean; url?: string; evidence?: Evidence; message?: string }> {
  // Validate file size (< 10MB) and type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'application/pdf'];
  if (!allowedTypes.includes(file.type)) {
    return { success: false, message: 'Invalid file format. Please upload JPG, PNG, WEBP, or PDF.' };
  }
  if (file.size > 10 * 1024 * 1024) {
    return { success: false, message: 'File size exceeds maximum allowed size of 10MB.' };
  }

  const fileName = `${complaintId}/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;

      // 1. Upload to Supabase Storage evidence bucket
      const { data: storageData, error: storageError } = await supabase.storage
        .from('evidence')
        .upload(fileName, file, { upsert: true });

      let publicUrl = '';
      if (!storageError && storageData) {
        const { data: urlData } = supabase.storage.from('evidence').getPublicUrl(fileName);
        publicUrl = urlData.publicUrl;
      } else {
        // Fallback placeholder URL if bucket isn't publicly configured
        publicUrl = `https://aquaguard-storage.placeholder/${fileName}`;
      }

      // 2. Insert record into evidence table
      if (userId) {
        const { data: evRecord, error: evError } = await supabase
          .from('evidence')
          .insert({
            complaint_id: complaintId,
            file_url: publicUrl,
            file_type: file.type,
            uploaded_by: userId,
          })
          .select(`*, users(name)`)
          .single();

        if (!evError && evRecord) {
          return {
            success: true,
            url: publicUrl,
            evidence: {
              id: evRecord.id,
              complaintId: evRecord.complaint_id,
              fileUrl: evRecord.file_url,
              fileType: evRecord.file_type,
              uploadedBy: evRecord.uploaded_by,
              uploadedByName: evRecord.users?.name || 'User',
              uploadedAt: evRecord.created_at || evRecord.uploaded_at,
            },
          };
        }
      }

      return { success: true, url: publicUrl };
    } catch (e: any) {
      return { success: false, message: e.message || 'Evidence upload failed' };
    }
  }

  // Fallback demo upload mock response
  const demoUrl = URL.createObjectURL(file);
  return {
    success: true,
    url: demoUrl,
    evidence: {
      id: `ev-${Date.now()}`,
      complaintId,
      fileUrl: demoUrl,
      fileType: file.type,
      uploadedBy: 'demo-user',
      uploadedByName: 'Field Officer',
      uploadedAt: new Date().toISOString(),
    },
  };
}

export async function fetchComplaintEvidence(complaintId: string): Promise<Evidence[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('evidence')
        .select(`*, users(name)`)
        .eq('complaint_id', complaintId)
        .order('uploaded_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          complaintId: item.complaint_id,
          fileUrl: item.file_url,
          fileType: item.file_type,
          uploadedBy: item.uploaded_by,
          uploadedByName: item.users?.name || 'User',
          uploadedAt: item.uploaded_at,
        }));
      }
    } catch (e) {
      console.warn('Error fetching evidence from Supabase:', e);
    }
  }

  return [];
}
