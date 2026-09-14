import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserRole } from '../types';
import { MOCK_USERS } from '../lib/mockDataService';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isLoading: boolean;
  login: (email: string, role?: UserRole) => Promise<boolean>;
  register: (name: string, email: string, phone: string) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Default logged in user to Citizen for smooth immediate preview, but can switch anytime
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('aquaguard_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return MOCK_USERS[0]; // Aarav Patel (Citizen)
  });

  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('aquaguard_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aquaguard_user');
    }
  }, [user]);

  const login = async (email: string, overrideRole?: UserRole): Promise<boolean> => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured && supabase) {
        // Supabase authentication logic if configured
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: 'password123',
        });
        if (!error && data.user) {
          // Fetch role from users table
          const { data: userData } = await supabase
            .from('users')
            .select('*')
            .eq('id', data.user.id)
            .single();
            
          if (userData) {
            setUser({
              id: userData.id,
              name: userData.name,
              email: userData.email,
              phone: userData.phone,
              role: userData.role,
              accountStatus: userData.account_status,
              createdAt: userData.created_at,
              updatedAt: userData.updated_at,
            });
            setIsLoading(false);
            return true;
          }
        }
      }

      // Fallback mock login for fast offline demo
      const matched = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
      if (matched) {
        setUser(matched);
        setIsLoading(false);
        return true;
      } else if (overrideRole) {
        // Generate role-specific session for testing
        const newDemoUser: User = {
          id: `demo-${Date.now()}`,
          name: `${overrideRole} User`,
          email: email || `${overrideRole.toLowerCase().replace(' ', '')}@aquaguard.gov.in`,
          role: overrideRole,
          accountStatus: 'active',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        setUser(newDemoUser);
        setIsLoading(false);
        return true;
      }

      setIsLoading(false);
      return false;
    } catch (err) {
      setIsLoading(false);
      return false;
    }
  };

  const register = async (name: string, email: string, phone: string): Promise<{ success: boolean; message?: string }> => {
    setIsLoading(true);
    // STRICT SECURITY RULE: Public registration can ONLY assign 'Citizen' role.
    const newUser: User = {
      id: `user-cit-${Date.now()}`,
      name,
      email,
      phone,
      role: 'Citizen', // Hardcoded security boundary
      accountStatus: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('users').insert({
        name,
        email,
        phone,
        role: 'Citizen', // RLS & DB Trigger enforces this
      });
      if (error) {
        setIsLoading(false);
        return { success: false, message: error.message };
      }
    }

    setUser(newUser);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    if (isSupabaseConfigured && supabase) {
      supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem('aquaguard_user');
  };

  const switchRole = (newRole: UserRole) => {
    const roleUser = MOCK_USERS.find(u => u.role === newRole) || {
      id: `user-${newRole.toLowerCase().replace(' ', '')}`,
      name: `${newRole} Official`,
      email: `${newRole.toLowerCase().replace(' ', '')}@aquaguard.gov.in`,
      role: newRole,
      accountStatus: 'active',
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
