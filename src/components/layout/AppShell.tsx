import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { DemoRoleSwitcher } from './DemoRoleSwitcher';
import { isSupabaseConfigured } from '../../lib/supabase';

export const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-surface-bg flex flex-col font-sans text-agText-primary">
      {/* Dev-only offline preview banner (Disabled in production & Live Supabase mode) */}
      {import.meta.env.DEV && !isSupabaseConfigured && <DemoRoleSwitcher />}

      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />

        {/* Main Application Column */}
        <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
          <TopBar onOpenMobileMenu={() => setMobileMenuOpen(true)} />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};
