import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Search,
  Bell,
  Plus,
  Menu,
  X,
  Compass,
  CircleDot,
  CheckSquare,
  Users2,
  Cpu,
  GitBranch,
  History,
  Boxes,
  Settings,
  ChevronDown,
  Radio
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { RouteId } from '../../types';

export const TopNav: React.FC = () => {
  const {
    activeRoute,
    setActiveRoute,
    setShowSearchModal,
    showNotifications,
    setShowNotifications,
    setShowCreateModal,
    notifications,
    user,
    issues,
    apiOnline
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

  // Monitor scroll for subtle elevation and scroll indicator
  useEffect(() => {
    const handleScroll = () => {
      const top = window.scrollY;
      setScrolled(top > 18);

      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (totalHeight > 0) {
        const progress = Math.min(100, Math.max(0, (top / totalHeight) * 100));
        setScrollProgress(progress);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;
  const openIssuesCount = issues.filter(i => !['RESOLVED', 'CLOSED'].includes(i.status)).length;

  const navLinks: { id: RouteId; label: string; icon: React.ReactNode; badge?: string | number }[] = [
    { id: 'overview', label: 'Overview', icon: <Compass size={14} /> },
    { id: 'issues', label: 'Issues', icon: <CircleDot size={14} />, badge: openIssuesCount },
    { id: 'my-tasks', label: 'My Tasks', icon: <CheckSquare size={14} /> },
    { id: 'teams', label: 'Teams', icon: <Users2 size={14} /> },
    { id: 'intelligence', label: 'Intelligence', icon: <Cpu size={14} /> },
    { id: 'releases', label: 'Releases', icon: <GitBranch size={14} /> },
    { id: 'activity', label: 'Activity', icon: <History size={14} /> },
    { id: 'integrations', label: 'Integrations', icon: <Boxes size={14} /> },
    { id: 'settings', label: 'Settings', icon: <Settings size={14} /> },
  ];

  const handleNavClick = (id: RouteId) => {
    setActiveRoute(id);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <>
      <header className={`top-nav-container ${scrolled ? 'is-scrolled' : ''}`}>
        {/* Scroll Progress Bar for storytelling */}
        <div 
          className="scroll-progress-line" 
          style={{ width: `${scrollProgress}%` }}
          aria-hidden="true" 
        />

        <div className="top-nav-inner">
          {/* Brand Mark */}
          <div className="nav-brand-group">
            <button 
              className="brand-logo-btn" 
              onClick={() => handleNavClick('overview')}
              aria-label="IssueFlow Home"
            >
              <div className="brand-icon-editorial">
                <span className="brand-glyph">✦</span>
              </div>
              <div className="brand-text-lockup">
                <span className="brand-title">IssueFlow</span>
                <span className="brand-subtitle">ENGINEERING STORY</span>
              </div>
            </button>

            {/* Subtle workspace pill */}
            <div className="workspace-pill-nav">
              <span className="workspace-dot" />
              <span className="workspace-name">Acme Core</span>
              <span className="env-tag">{apiOnline ? 'LIVE' : 'DEMO'}</span>
            </div>
          </div>

          {/* Desktop Primary Navigation */}
          <nav className="desktop-nav-links" aria-label="Primary Navigation">
            {navLinks.map(link => {
              const isActive = activeRoute === link.id;
              return (
                <button
                  key={link.id}
                  className={`nav-tab-btn ${isActive ? 'is-active' : ''}`}
                  onClick={() => handleNavClick(link.id)}
                  aria-current={isActive ? 'page' : undefined}
                >
                  <span className="nav-icon">{link.icon}</span>
                  <span className="nav-label">{link.label}</span>
                  {link.badge !== undefined && (
                    <span className="nav-badge-pill">{link.badge}</span>
                  )}
                  {isActive && <span className="nav-active-pip" />}
                </button>
              );
            })}
          </nav>

          {/* Right Controls & Utilities */}
          <div className="nav-actions-group">
            {/* Global Search Button */}
            <button
              className="nav-search-btn"
              onClick={() => setShowSearchModal(true)}
              title="Search issues, teams, releases (⌘K)"
              aria-label="Search issues, teams, releases"
            >
              <Search size={14} className="search-icon" />
              <span className="search-placeholder">Search workspace...</span>
              <kbd className="search-kbd">⌘K</kbd>
            </button>

            {/* Notification Bell */}
            <button
              className={`nav-icon-btn ${unreadCount > 0 ? 'has-unread' : ''}`}
              onClick={() => setShowNotifications(!showNotifications)}
              title="Notifications"
              aria-label="Notifications"
              aria-expanded={showNotifications}
            >
              <Bell size={16} />
              {unreadCount > 0 && (
                <span className="unread-dot-badge">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Create Issue Primary CTA */}
            <button
              className="nav-cta-create"
              onClick={() => setShowCreateModal(true)}
              aria-label="Create Issue"
            >
              <Plus size={15} />
              <span className="create-text">Create issue</span>
            </button>

            {/* User Avatar Chip */}
            <button 
              className="user-profile-chip"
              onClick={() => handleNavClick('settings')}
              title={`Signed in as ${user.name} (${user.role})`}
              aria-label="User settings"
            >
              <div className="user-avatar-circle">{user.avatar || 'DE'}</div>
            </button>

            {/* Mobile Menu Toggle Button */}
            <button
              className="mobile-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="mobile-menu-overlay" onClick={() => setMobileMenuOpen(false)}>
          <div className="mobile-menu-drawer" onClick={e => e.stopPropagation()}>
            <div className="mobile-menu-header">
              <div className="mobile-brand-title">IssueFlow Navigation</div>
              <button 
                className="close-drawer-btn" 
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mobile-search-row">
              <button 
                className="mobile-search-trigger"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowSearchModal(true);
                }}
              >
                <Search size={15} />
                <span>Quick search (⌘K)</span>
              </button>
            </div>

            <div className="mobile-links-list">
              {navLinks.map(link => {
                const isActive = activeRoute === link.id;
                return (
                  <button
                    key={link.id}
                    className={`mobile-nav-item ${isActive ? 'is-active' : ''}`}
                    onClick={() => handleNavClick(link.id)}
                  >
                    <div className="item-left">
                      <span className="item-icon">{link.icon}</span>
                      <span className="item-title">{link.label}</span>
                    </div>
                    {link.badge !== undefined && (
                      <span className="item-badge">{link.badge}</span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="mobile-menu-footer">
              <button
                className="mobile-create-action"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setShowCreateModal(true);
                }}
              >
                <Plus size={16} />
                <span>Create New Issue</span>
              </button>
              <div className="mobile-user-row">
                <div className="user-avatar-circle">{user.avatar || 'DE'}</div>
                <div className="user-details">
                  <strong>{user.name}</strong>
                  <small>{user.email}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
