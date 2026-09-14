import { supabase, isSupabaseConfigured } from '../supabase';
import { MOCK_USERS, MOCK_AUTHORITIES, MOCK_OFFICERS } from '../mockDataService';
import type { User, Authority, Officer, UserRole } from '../../types';

export async function fetchUserProfile(userId: string): Promise<User | null> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          role: data.role as UserRole,
          accountStatus: data.account_status,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
        };
      }
    } catch (e) {
      console.warn('Error fetching user profile from Supabase:', e);
    }
  }
  return MOCK_USERS.find((u) => u.id === userId) || null;
}

export async function fetchAllUsers(): Promise<User[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          email: item.email,
          phone: item.phone,
          role: item.role as UserRole,
          accountStatus: item.account_status,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));
      }
    } catch (e) {
      console.warn('Error fetching users from Supabase:', e);
    }
  }
  return MOCK_USERS;
}

export async function fetchAuthorities(): Promise<Authority[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('authorities')
        .select('*')
        .order('name');

      if (!error && data && data.length > 0) {
        return data.map((item) => ({
          id: item.id,
          name: item.name,
          jurisdictionArea: item.jurisdiction_area,
          contactInfo: item.contact_info,
          createdAt: item.created_at,
        }));
      }
    } catch (e) {
      console.warn('Error fetching authorities from Supabase:', e);
    }
  }
  return MOCK_AUTHORITIES;
}

export async function fetchOfficers(): Promise<Officer[]> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase
        .from('officers')
        .select('*, users(name, email)')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id,
          userId: item.user_id,
          authorityId: item.authority_id,
          userName: item.users?.name || 'Officer',
          userEmail: item.users?.email || '',
          area: item.area,
          status: item.status,
          currentWorkload: item.current_workload,
          createdAt: item.created_at,
        }));
      }
    } catch (e) {
      console.warn('Error fetching officers from Supabase:', e);
    }
  }
  return MOCK_OFFICERS;
}
