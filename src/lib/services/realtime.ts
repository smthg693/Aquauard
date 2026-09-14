import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '../supabase';

export function useComplaintsRealtime(onUpdate: () => void) {
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    const client = supabase;

    const channel = client
      .channel('public:complaints_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'complaints' },
        () => {
          onUpdate();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [onUpdate]);
}

export function useNotificationsRealtime(userId: string | undefined, onNewNotification: () => void) {
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase || !userId) return;
    const client = supabase;

    const channel = client
      .channel(`public:notifications_${userId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'notifications', filter: `user_id=eq.${userId}` },
        () => {
          onNewNotification();
        }
      )
      .subscribe();

    return () => {
      client.removeChannel(channel);
    };
  }, [userId, onNewNotification]);
}
