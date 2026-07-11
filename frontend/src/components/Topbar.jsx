import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from './icons';
import NotificationBell from './NotificationBell';

export default function Topbar({ title, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = (user?.name || '?').trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

  return (
    <header className="topbar">
      <div className="topbar-left">
        <button className="icon-btn topbar-menu" onClick={onMenuClick} aria-label="Toggle menu">
          <Icon.Menu width={20} height={20} />
        </button>
        <h1 className="topbar-title">{title}</h1>
      </div>
      <div className="topbar-right">
        <div className="topbar-search">
          <Icon.Search width={16} height={16} />
          <input type="text" placeholder="Search…" disabled />
        </div>
        <NotificationBell />
        <div className="topbar-profile">
          <span className="avatar">{initials}</span>
          <div className="topbar-profile-meta">
            <strong>{user?.name}</strong>
            <small>{user?.role === 'admin' ? 'Administrator' : 'Customer'}</small>
          </div>
        </div>
        <button className="icon-btn" onClick={handleLogout} aria-label="Log out" title="Log out">
          <Icon.LogOut width={18} height={18} />
        </button>
      </div>
    </header>
  );
}
