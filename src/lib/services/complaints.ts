import { supabase, isSupabaseConfigured } from '../supabase';
import { INITIAL_COMPLAINTS, INITIAL_STATUS_EVENTS, INITIAL_NOTES } from '../mockDataService';
import type { Complaint, ComplaintStatus, ComplaintSeverity, ComplaintStatusEvent, Note } from '../../types';
import { validateStateTransition } from '../stateMachine';

export interface CreateComplaintInput {
  citizenId: string;
  citizenName?: string;
  categoryId: string;
  categoryName?: string;
  description: string;
  severity: ComplaintSeverity;
  address: string;
  pincode: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
}

export async function fetchComplaints(params?: {
  citizenId?: string;
  assignedOfficerId?: string;
  authorityId?: string;
  status?: ComplaintStatus;
  severity?: ComplaintSeverity;
}): Promise<Complaint[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      let query = supabase
        .from('complaints')
        .select(`
          *,
          categories(name),
          users!complaints_citizen_id_fkey(name, phone)
        `)
        .order('created_at', { ascending: false });

      if (params?.citizenId) {
        query = query.eq('citizen_id', params.citizenId);
      }
      if (params?.assignedOfficerId) {
        query = query.eq('assigned_officer_id', params.assignedOfficerId);
      }
      if (params?.authorityId) {
        query = query.eq('authority_id', params.authorityId);
      }
      if (params?.status) {
        query = query.eq('status', params.status);
      }
      if (params?.severity) {
        query = query.eq('severity', params.severity);
      }

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          complaintCode: item.complaint_code,
          citizenId: item.citizen_id,
          citizenName: item.users?.name || 'Citizen',
          citizenPhone: item.users?.phone || '',
          categoryId: item.category_id,
          categoryName: item.categories?.name || 'Water Problem',
          severity: item.severity as ComplaintSeverity,
          status: item.status as ComplaintStatus,
          address: item.address,
          city: item.city,
          state: item.state,
          pincode: item.pincode,
          latitude: item.latitude ? Number(item.latitude) : undefined,
          longitude: item.longitude ? Number(item.longitude) : undefined,
          description: item.description,
          authorityId: item.authority_id,
          assignedOfficerId: item.assigned_officer_id,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }
    } catch (e) {
      console.warn('Error fetching complaints from Supabase, falling back to mock state:', e);
    }
  }

  // Fallback mock filtering
  let filtered = [...INITIAL_COMPLAINTS];
  if (params?.citizenId) {
    filtered = filtered.filter((c) => c.citizenId === params.citizenId);
  }
  if (params?.assignedOfficerId) {
    filtered = filtered.filter((c) => c.assignedOfficerId === params.assignedOfficerId);
  }
  if (params?.status) {
    filtered = filtered.filter((c) => c.status === params.status);
  }
  if (params?.severity) {
    filtered = filtered.filter((c) => c.severity === params.severity);
  }
  return filtered;
}

export async function fetchComplaintById(id: string): Promise<Complaint | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('complaints')
        .select(`
          *,
          categories(name),
          users!complaints_citizen_id_fkey(name, phone)
        `)
        .eq('id', id)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          complaintCode: data.complaint_code,
          citizenId: data.citizen_id,
          citizenName: data.users?.name || 'Citizen',
          citizenPhone: data.users?.phone || '',
          categoryId: data.category_id,
          categoryName: data.categories?.name || 'Water Problem',
          severity: data.severity as ComplaintSeverity,
          status: data.status as ComplaintStatus,
          address: data.address,
          city: data.city,
          state: data.state,
          pincode: data.pincode,
          latitude: data.latitude ? Number(data.latitude) : undefined,
          longitude: data.longitude ? Number(data.longitude) : undefined,
          description: data.description,
          authorityId: data.authority_id,
          assignedOfficerId: data.assigned_officer_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (e) {
      console.warn('Error fetching complaint by ID from Supabase:', e);
    }
  }

  return INITIAL_COMPLAINTS.find((c) => c.id === id) || null;
}

export async function createComplaint(input: CreateComplaintInput): Promise<{ success: boolean; complaint?: Complaint; message?: string }> {
  const codeSeq = Math.floor(100000 + Math.random() * 900000);
  const complaintCode = `AQ-2026-${codeSeq}`;

  if (isSupabaseConfigured && supabase) {
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      const citizenId = authUser?.id || input.citizenId;

      if (!citizenId) {
        return { success: false, message: 'User session unauthenticated. Please log in.' };
      }

      const { data, error } = await supabase
        .from('complaints')
        .insert({
          complaint_code: complaintCode,
          citizen_id: citizenId,
          category_id: input.categoryId,
          description: input.description,
          severity: input.severity,
          address: input.address,
          pincode: input.pincode,
          city: input.city || 'Metropolis Central',
          state: input.state || 'State Water Board',
          latitude: input.latitude || 19.0760,
          longitude: input.longitude || 72.8777,
          status: 'Submitted',
        })
        .select()
        .single();

      if (!error && data) {
        const newRecord: Complaint = {
          id: data.id,
          complaintCode: data.complaint_code,
          citizenId: data.citizen_id,
          citizenName: input.citizenName || 'Citizen',
          categoryId: data.category_id,
          categoryName: input.categoryName || 'Water Problem',
          severity: data.severity,
          status: data.status,
          address: data.address,
          pincode: data.pincode,
          description: data.description,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
        return { success: true, complaint: newRecord };
      } else if (error) {
        return { success: false, message: error.message };
      }
    } catch (e: any) {
      return { success: false, message: e.message || 'Database error creating complaint' };
    }
  }

  // Fallback memory creation
  const mockNew: Complaint = {
    id: `cmp-${Date.now()}`,
    complaintCode,
    citizenId: input.citizenId,
    citizenName: input.citizenName || 'Aarav Patel',
    categoryId: input.categoryId,
    categoryName: input.categoryName || 'Water Issue',
    severity: input.severity,
    status: 'Submitted',
    address: input.address,
    pincode: input.pincode,
    description: input.description,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  INITIAL_COMPLAINTS.unshift(mockNew);
  return { success: true, complaint: mockNew };
}

export async function updateComplaintStatus(
  complaintId: string,
  targetStatus: ComplaintStatus,
  userRole: any,
  noteText?: string
): Promise<{ success: boolean; message?: string }> {
  const current = await fetchComplaintById(complaintId);
  if (!current) {
    return { success: false, message: 'Complaint not found' };
  }

  const check = validateStateTransition(current.status, targetStatus, userRole);
  if (!check.allowed) {
    return { success: false, message: check.reason };
  }

  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('complaints')
        .update({
          status: targetStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', complaintId);

      if (error) {
        return { success: false, message: error.message };
      }

      if (noteText) {
        await addComplaintNote({
          complaintId,
          noteText,
          isInternal: false,
        });
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to update complaint status' };
    }
  }

  // Mock state fallback update
  current.status = targetStatus;
  current.updatedAt = new Date().toISOString();
  return { success: true };
}

export async function fetchComplaintEvents(complaintId: string): Promise<ComplaintStatusEvent[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('complaint_status_events')
        .select(`*, users(name)`)
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          complaintId: item.complaint_id,
          status: item.status as ComplaintStatus,
          toStatus: item.status as ComplaintStatus,
          note: item.note,
          reasonNotes: item.note,
          updatedBy: item.updated_by,
          updatedByName: item.users?.name || 'System',
          createdAt: item.created_at,
        }));
      }
    } catch (e) {
      console.warn('Error fetching status events from Supabase:', e);
    }
  }

  return INITIAL_STATUS_EVENTS.filter((e) => e.complaintId === complaintId);
}

export async function fetchComplaintNotes(complaintId: string): Promise<Note[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select(`*, users(name, role)`)
        .eq('complaint_id', complaintId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          complaintId: item.complaint_id,
          authorId: item.author_id,
          authorName: item.users?.name || 'Official',
          authorRole: item.users?.role,
          noteText: item.note_text,
          isInternal: item.is_internal,
          createdAt: item.created_at,
        }));
      }
    } catch (e) {
      console.warn('Error fetching notes from Supabase:', e);
    }
  }

  return INITIAL_NOTES.filter((n) => n.complaintId === complaintId);
}

export async function addComplaintNote(params: {
  complaintId: string;
  noteText: string;
  isInternal?: boolean;
}): Promise<{ success: boolean; note?: Note; message?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id;
      if (!userId) return { success: false, message: 'User unauthenticated' };

      const { data, error } = await supabase
        .from('notes')
        .insert({
          complaint_id: params.complaintId,
          author_id: userId,
          note_text: params.noteText,
          is_internal: params.isInternal || false,
        })
        .select(`*, users(name, role)`)
        .single();

      if (!error && data) {
        return {
          success: true,
          note: {
            id: data.id,
            complaintId: data.complaint_id,
            authorId: data.author_id,
            authorName: data.users?.name || 'Author',
            authorRole: data.users?.role,
            noteText: data.note_text,
            isInternal: data.is_internal,
            createdAt: data.created_at,
          },
        };
      }
    } catch (e: any) {
      return { success: false, message: e.message || 'Error adding note' };
    }
  }

  const mockNote: Note = {
    id: `note-${Date.now()}`,
    complaintId: params.complaintId,
    authorId: 'user-off-1',
    authorName: 'Officer Rajesh Kumar',
    authorRole: 'Field Officer',
    noteText: params.noteText,
    isInternal: params.isInternal || false,
    createdAt: new Date().toISOString(),
  };

  INITIAL_NOTES.unshift(mockNote);
  return { success: true, note: mockNote };
}
