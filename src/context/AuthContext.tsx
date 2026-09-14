import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { MOCK_USERS } from '../lib/mockDataService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { fetchUserProfile } from '../lib/services/users';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  register: (name: string, email: string, phone: string, password?: string) => Promise<{ success: boolean; user?: User; message?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole) => void;
  resetPassword: (email: string) => Promise<{ success: boolean; message?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const resolveUserProfile = async (supabaseUser: any): Promise<User> => {
    let profile = await fetchUserProfile(supabaseUser.id);
    
    // If trigger insertion was slightly delayed, retry after brief pause
    if (!profile) {
      await new Promise((r) => setTimeout(r, 400));
      profile = await fetchUserProfile(supabaseUser.id);
    }

    // Construct metadata fallback profile if DB row fetch is pending
    if (!profile) {
      const fallbackName = supabaseUser.user_metadata?.name || 
        supabaseUser.user_metadata?.full_name || 
        supabaseUser.email?.split('@')[0] || 
        'Citizen';
      
      const fallbackProfile: User = {
        id: supabaseUser.id,
        name: fallbackName,
        email: supabaseUser.email || '',
        phone: supabaseUser.user_metadata?.phone || '',
        role: 'Citizen', // SECURITY MANDATE: Metadata fallback role is strictly Citizen
        accountStatus: 'active',
        createdAt: supabaseUser.created_at || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      // Ensure public.users table has the record
      if (isSupabaseConfigured && supabase) {
        try {
          await supabase.from('users').upsert({
            id: fallbackProfile.id,
            name: fallbackProfile.name,
            email: fallbackProfile.email,
            phone: fallbackProfile.phone,
            role: fallbackProfile.role,
            account_status: 'active',
          }, { onConflict: 'id' });
        } catch (e) {
          console.warn('Fallback profile database upsert notice:', e);
        }
      }

      profile = fallbackProfile;
    }

    return profile;
  };

  // Authoritative Session & Profile Initialization
  useEffect(() => {
    let mounted = true;

    async function initSession() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const profile = await resolveUserProfile(session.user);
            if (mounted) setUser(profile);
          }
        } catch (err) {
          console.warn('Session restoration failed:', err);
        }
      } else {
        // Dev offline fallback check
        const saved = localStorage.getItem('aquaguard_user');
        if (saved) {
          try {
            const parsed = JSON.parse(saved);
            if (mounted) setUser(parsed);
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
      if (mounted) setIsLoading(false);
    }

    initSession();

    if (isSupabaseConfigured && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if ((event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') && session?.user) {
          const profile = await resolveUserProfile(session.user);
          if (mounted) setUser(profile);
        } else if (event === 'SIGNED_OUT') {
          if (mounted) setUser(null);
          localStorage.removeItem('aquaguard_user');
        }
      });

      return () => {
        mounted = false;
        subscription.unsubscribe();
      };
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured && user) {
      localStorage.setItem('aquaguard_user', JSON.stringify(user));
    } else if (!isSupabaseConfigured && !user) {
      localStorage.removeItem('aquaguard_user');
    }
  }, [user]);

  const login = async (
    email: string,
    password = 'password123'
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) {
          setIsLoading(false);
          const lowerMsg = error.message.toLowerCase();
          if (lowerMsg.includes('email not confirmed')) {
            return {
              success: false,
              message: 'Account email has not been confirmed. Please check your inbox for the confirmation link.',
            };
          }
          return { success: false, message: error.message };
        }

        if (data?.user) {
          const profile = await resolveUserProfile(data.user);
          setUser(profile);
          setIsLoading(false);
          return { success: true, user: profile };
        }
      }

      // Offline demo login fallback (Only active when Supabase is unconfigured)
      const matched = MOCK_USERS.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
      if (matched) {
        setUser(matched);
        setIsLoading(false);
        return { success: true, user: matched };
      }

      setIsLoading(false);
      return { success: false, message: 'Invalid credentials. Please check your email and password.' };
    } catch (err: any) {
      setIsLoading(false);
      return { success: false, message: err.message || 'Login attempt failed' };
    }
  };

  const register = async (
    name: string,
    email: string,
    phone: string,
    password = 'password123'
  ): Promise<{ success: boolean; user?: User; message?: string }> => {
    setIsLoading(true);
    const citizenRole: UserRole = 'Citizen';

    if (isSupabaseConfigured && supabase) {
      try {
        const cleanEmail = email.trim();
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              name: name.trim(),
              phone: phone.trim(),
              role: citizenRole,
            },
          },
        });

        if (error) {
          setIsLoading(false);
          return { success: false, message: error.message };
        }

        if (data.user) {
          const profile = await resolveUserProfile(data.user);
          setUser(profile);
          setIsLoading(false);
          return { success: true, user: profile };
        }
      } catch (err: any) {
        setIsLoading(false);
        return { success: false, message: err.message || 'Registration failed' };
      }
    }

    // Demo local registration fallback
    const mockNewUser: User = {
      id: `user-cit-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      role: citizenRole,
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(mockNewUser);
    setIsLoading(false);
    return { success: true, user: mockNewUser };
  };

  const logout = async () => {
    setIsLoading(true);
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('aquaguard_user');
    setIsLoading(false);
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; message?: string }> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) return { success: false, message: error.message };
    }
    return { success: true, message: 'Password reset link sent to your email.' };
  };

  const switchRole = (newRole: UserRole) => {
    if (isSupabaseConfigured) {
      console.warn('Security alert: Role switching is disabled in production Supabase RBAC mode.');
      return;
    }
    const roleUser = MOCK_USERS.find((u) => u.role === newRole) || {
      id: `user-${newRole.toLowerCase().replace(/\s+/g, '')}`,
      name: `${newRole} Official`,
      email: `${newRole.toLowerCase().replace(/\s+/g, '')}@aquaguard.gov.in`,
      role: newRole,
      accountStatus: 'active' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setUser(roleUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        isLoading,
        login,
        register,
        logout,
        switchRole,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
