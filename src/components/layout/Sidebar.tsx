import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Droplet,
  LayoutDashboard,
  PlusCircle,
  FileText,
  User,
  MapPin,
  Users,
  BarChart3,
  ShieldCheck,
  Building2,
  ListFilter,
  CheckSquare
} from 'lucide-react';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onCloseMobile }) => {
  const { role } = useAuth();

  const getNavLinks = () => {
    switch (role) {
      case 'Citizen':
        return [
          { to: '/citizen/dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
          { to: '/citizen/report', label: 'Report Water Issue', icon: <PlusCircle className="w-4 h-4" /> },
          { to: '/citizen/complaints', label: 'My Complaints', icon: <FileText className="w-4 h-4" /> },
          { to: '/citizen/profile', label: 'My Profile', icon: <User className="w-4 h-4" /> },
        ];
      case 'Authority':
        return [
          { to: '/authority/dashboard', label: 'Overview', icon: <LayoutDashboard className="w-4 h-4" /> },
          { to: '/authority/complaints', label: 'Complaint Queue', icon: <FileText className="w-4 h-4" /> },
          { to: '/authority/map', label: 'GIS Wards & Map', icon: <MapPin className="w-4 h-4" /> },
          { to: '/authority/officers', label: 'Field Officers', icon: <Users className="w-4 h-4" /> },
          { to: '/authority/analytics', label: 'Analytics', icon: <BarChart3 className="w-4 h-4" /> },
        ];
      case 'Field Officer':
        return [
          { to: '/field-officer/dashboard', label: 'My Workload', icon: <LayoutDashboard className="w-4 h-4" /> },
          { to: '/field-officer/complaints', label: 'Assigned Complaints', icon: <CheckSquare className="w-4 h-4" /> },
          { to: '/field-officer/profile', label: 'Officer Profile', icon: <User className="w-4 h-4" /> },
        ];
      case 'Admin':
        return [
          { to: '/admin/dashboard', label: 'Control Center', icon: <LayoutDashboard className="w-4 h-4" /> },
          { to: '/admin/users', label: 'User Directory', icon: <Users className="w-4 h-4" /> },
          { to: '/admin/authorities', label: 'Water Authorities', icon: <Building2 className="w-4 h-4" /> },
          { to: '/admin/officers', label: 'Officers Roster', icon: <ShieldCheck className="w-4 h-4" /> },
          { to: '/admin/categories', label: 'Categories', icon: <ListFilter className="w-4 h-4" /> },
        ];
      default:
        return [];
    }
  };

  const navLinks = getNavLinks();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-navy-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Navigation Panel */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-navy-700 text-white border-r border-navy-800 flex flex-col transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 px-6 flex items-center gap-3 border-b border-navy-800 shrink-0">
          <div className="w-9 h-9 rounded-ag-md bg-cyan-500 flex items-center justify-center text-white shadow-subtle">
            <Droplet className="w-5 h-5 fill-current" />
          </div>
          <div>
            <h1 className="text-base font-bold text-white tracking-tight leading-none">
              Aqua<span className="text-cyan-400">Guard</span>
            </h1>
            <p className="text-[10px] text-cyan-200/80 font-medium tracking-wide uppercase mt-0.5">
              Water Scarcity System
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
            {role || 'Menu'} Space
          </div>
          {navLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-ag-md text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-cyan-500 text-white font-semibold shadow-subtle'
                    : 'text-slate-300 hover:bg-navy-800 hover:text-white'
                }`
              }
            >
              {link.icon}
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer info badge */}
        <div className="p-4 border-t border-navy-800 text-[11px] text-slate-400 bg-navy-800/50">
          <p className="font-semibold text-slate-200">State Water Security</p>
          <p className="text-[10px] text-slate-400">v1.0.0 — Foundation Build</p>
        </div>
      </aside>
    </>
  );
};
