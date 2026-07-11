import { useEffect, useRef, useState } from 'react';
import { Icon } from './icons';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../services/notificationApi';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const ref = useRef(null);

  const load = () => listNotifications().then(setItems).catch(() => {});

  useEffect(() => {
    load();
    const interval = setInterval(load, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const unread = items.filter((n) => !n.isRead).length;

  const handleOpen = () => setOpen((o) => !o);

  const handleRead = async (n) => {
    if (!n.isRead) {
      await markNotificationRead(n._id);
      setItems((prev) => prev.map((i) => (i._id === n._id ? { ...i, isRead: true } : i)));
    }
  };

  const handleReadAll = async () => {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((i) => ({ ...i, isRead: true })));
  };

  return (
    <div className="notif-wrap" ref={ref}>
      <button className="icon-btn" aria-label="Notifications" onClick={handleOpen}>
        <Icon.Bell width={19} height={19} />
        {unread > 0 && <span className="notif-dot notif-pulse" />}
      </button>
      {open && (
        <div className="notif-panel">
          <div className="notif-panel-head">
            <strong>Notifications</strong>
            {unread > 0 && <button className="link-btn" onClick={handleReadAll}>Mark all read</button>}
          </div>
          <div className="notif-panel-list">
            {items.length === 0 && <p className="empty-state">No notifications yet.</p>}
            {items.map((n) => (
              <button key={n._id} className={`notif-item ${n.isRead ? '' : 'notif-item-unread'}`} onClick={() => handleRead(n)}>
                <span className="notif-item-title">{n.title}</span>
                <span className="notif-item-msg">{n.message}</span>
                <span className="notif-item-time">{new Date(n.createdAt).toLocaleString()}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
