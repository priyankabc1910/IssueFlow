import React from 'react';
import {
  Bell,
  CheckCheck,
  AlertTriangle,
  Info,
  CheckCircle2,
  X,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const NotificationsPopover: React.FC = () => {
  const {
    showNotifications,
    setShowNotifications,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    setActiveRoute,
    setSelectedIssue,
    issues
  } = useApp();

  if (!showNotifications) return null;

  const handleItemClick = (notif: typeof notifications[0]) => {
    markNotificationRead(notif.id);
    setShowNotifications(false);

    if (notif.issueKey) {
      const match = issues.find(i => i.key === notif.issueKey);
      if (match) setSelectedIssue(match);
    } else if (notif.linkRoute) {
      setActiveRoute(notif.linkRoute);
    }
  };

  const getNotifIcon = (type: typeof notifications[0]['type']) => {
    switch (type) {
      case 'alert': return <ShieldAlert size={14} className="text-crimson" />;
      case 'warning': return <AlertTriangle size={14} className="text-amber" />;
      case 'success': return <CheckCircle2 size={14} className="text-emerald" />;
      default: return <Info size={14} className="text-blue" />;
    }
  };

  return (
    <>
      <div 
        className="popover-backdrop-click-catcher" 
        onClick={() => setShowNotifications(false)} 
      />
      <div className="notifications-popover-card" role="region" aria-label="Notifications Panel">
        <div className="notif-header-strip">
          <div className="notif-title-group">
            <Bell size={15} />
            <strong className="notif-heading">Engineering Alerts</strong>
          </div>

          <div className="notif-header-actions">
            <button
              className="mark-all-read-btn"
              onClick={markAllNotificationsRead}
              title="Mark all as read"
            >
              <CheckCheck size={13} />
              <span>Mark all read</span>
            </button>
            <button
              className="popover-close-btn"
              onClick={() => setShowNotifications(false)}
              aria-label="Close notifications"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        <div className="notif-list-container">
          {notifications.map(item => (
            <div
              key={item.id}
              className={`notif-item-row ${!item.read ? 'is-unread' : ''}`}
              onClick={() => handleItemClick(item)}
              role="button"
              tabIndex={0}
            >
              <div className="notif-icon-col">
                {getNotifIcon(item.type)}
              </div>

              <div className="notif-content-col">
                <div className="notif-title-row">
                  <strong className="notif-title-text">{item.title}</strong>
                  <span className="notif-time">{item.timestamp}</span>
                </div>
                <p className="notif-body-desc">{item.description}</p>
              </div>

              {!item.read && <span className="unread-dot-pip" />}
            </div>
          ))}

          {notifications.length === 0 && (
            <div className="notif-empty-state">
              <span>All operational notifications caught up.</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
};
