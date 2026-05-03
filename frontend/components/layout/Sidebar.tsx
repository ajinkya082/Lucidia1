import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { getNavLinks } from '../../constants';
import { UserRole } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ArrowLeftOnRectangleIcon } from '../icons/Icons';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const SidebarContent: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, logout } = useAuthStore();
  const navLinks = getNavLinks(user?.role || UserRole.PATIENT);
  const activeLinkStyle = { backgroundColor: '#C7D2FE', color: '#334155' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 24px', borderBottom: '1px solid #f1f5f9' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#6366F1', letterSpacing: '-0.05em', margin: 0 }}>Lucidia</h1>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', padding: '4px' }}>
          <XMarkIcon />
        </button>
      </div>

      {/* Nav links */}
      <nav style={{ flex: 1, padding: '16px', overflowY: 'auto' }}>
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {navLinks.map(link => (
            <li key={link.href} style={{ marginBottom: '4px' }}>
              <NavLink
                to={link.href}
                onClick={onClose}
                style={({ isActive }) => ({
                  display: 'flex',
                  alignItems: 'center',
                  padding: '10px 12px',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  color: isActive ? '#334155' : '#64748b',
                  backgroundColor: isActive ? '#C7D2FE' : 'transparent',
                  transition: 'all 0.2s',
                })}
                onMouseEnter={e => { if (!(e.currentTarget as any)._active) (e.currentTarget as HTMLElement).style.backgroundColor = '#EEF2FF'; }}
                onMouseLeave={e => { if (!(e.currentTarget as any)._active) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                <span style={{ width: '20px', height: '20px', marginRight: '12px', flexShrink: 0 }}>{link.icon}</span>
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Profile + Logout */}
      <div style={{ padding: '16px', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ marginBottom: '12px', padding: '0 12px' }}>
          <p style={{ fontSize: '0.65rem', fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 2px' }}>Profile</p>
          <p style={{ fontWeight: 700, color: '#334155', fontSize: '0.875rem', margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
          <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0, textTransform: 'capitalize' }}>{user?.role}</p>
        </div>
        <button
          onClick={logout}
          style={{ width: '100%', display: 'flex', alignItems: 'center', padding: '10px 12px', borderRadius: '12px', border: 'none', background: 'none', cursor: 'pointer', color: '#64748b', fontWeight: 700, fontSize: '0.875rem', transition: 'all 0.2s' }}
          onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = '#FEF2F2'; (e.currentTarget as HTMLElement).style.color = '#B91C1C'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; (e.currentTarget as HTMLElement).style.color = '#64748b'; }}
        >
          <span style={{ width: '20px', height: '20px', marginRight: '12px' }}><ArrowLeftOnRectangleIcon /></span>
          Logout
        </button>
      </div>
    </div>
  );
};

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  useEffect(() => {
    const handler = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  const sidebarStyle: React.CSSProperties = {
    width: '256px',
    backgroundColor: '#ffffff',
    boxShadow: '1px 0 4px rgba(0,0,0,0.06)',
    flexShrink: 0,
    height: '100vh',
    position: 'sticky',
    top: 0,
    display: 'flex',
    flexDirection: 'column',
  };

  // Desktop — always visible
  if (isDesktop) {
    return (
      <aside style={sidebarStyle}>
        <SidebarContent onClose={() => {}} />
      </aside>
    );
  }

  // Mobile — slide in overlay
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', zIndex: 30 }}
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'tween', duration: 0.25 }}
            style={{ ...sidebarStyle, position: 'fixed', top: 0, left: 0, zIndex: 40, height: '100vh' }}
          >
            <SidebarContent onClose={() => setIsOpen(false)} />
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default Sidebar;
