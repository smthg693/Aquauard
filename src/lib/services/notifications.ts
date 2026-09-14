import { supabase, isSupabaseConfigured } from '../supabase';
import { INITIAL_NOTIFICATIONS } from '../mockDataService';
import type { NotificationItem } from '../../types';

export async function fetchUserNotifications(userId: string): Promise<NotificationItem[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          userId: item.user_id,
          title: item.title,
          message: item.message,
          type: item.type,
          isRead: item.is_read,
          createdAt: item.created_at,
        }));
      }
    } catch (e) {
      console.warn('Error fetching notifications from Supabase:', e);
    }
  }

  return INITIAL_NOTIFICATIONS.filter((n) => n.userId === userId || n.userId === 'user-cit-1');
}

export async function markNotificationAsRead(id: string): Promise<boolean> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('id', id);

      return !error;
    } catch (e) {
      return false;
    }
  }
  return true;
}
