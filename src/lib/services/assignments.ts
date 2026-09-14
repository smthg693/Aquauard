import { supabase, isSupabaseConfigured } from '../supabase';

export async function assignOfficerToComplaint(
  complaintId: string,
  officerId: string
): Promise<{ success: boolean; message?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error: complaintErr } = await supabase
        .from('complaints')
        .update({
          assigned_officer_id: officerId,
          status: 'Assigned',
          updated_at: new Date().toISOString(),
        })
        .eq('id', complaintId);

      if (complaintErr) {
        return { success: false, message: complaintErr.message };
      }

      const userRes = await supabase.auth.getUser();
      const currentUserId = userRes.data.user?.id;

      if (currentUserId) {
        await supabase.from('assignments').insert({
          complaint_id: complaintId,
          officer_id: officerId,
          assigned_by: currentUserId,
        });
      }

      return { success: true };
    } catch (e: any) {
      return { success: false, message: e.message || 'Failed to assign officer' };
    }
  }

  return { success: true };
}
