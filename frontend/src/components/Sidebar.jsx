import { NavLink } from 'react-router-dom';
import { Icon } from './icons';

const customerLinks = [
  { to: '/dashboard', label: 'Overview', icon: Icon.Grid, end: true },
  { to: '/reservations/new', label: 'Quick Book', icon: Icon.Plus },
  { to: '/reservations/my', label: 'My Reservations', icon: Icon.Calendar },
];

const adminLinks = [
  { to: '/admin', label: 'Overview', icon: Icon.Grid, end: true },
  { to: '/admin/reservations', label: 'Reservations', icon: Icon.Calendar },
  { to: '/admin/tables', label: 'Tables', icon: Icon.Table },
];

export default function Sidebar({ role, open, onClose }) {
  const links = role === 'admin' ? adminLinks : customerLinks;

  return (
    <>
      <aside className={`sidebar ${open ? 'sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-logo"><Icon.UtensilsIcon width={18} height={18} /></span>
          <span>Reservation Table</span>
          <button className="sidebar-close" onClick={onClose} aria-label="Close menu">
            <Icon.Close width={18} height={18} />
          </button>
        </div>
        <nav className="sidebar-nav">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) => `sidebar-link ${isActive ? 'sidebar-link-active' : ''}`}
              onClick={onClose}
            >
              <l.icon width={18} height={18} />
              <span>{l.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <span className="sidebar-role-tag">{role === 'admin' ? 'Admin workspace' : 'Customer workspace'}</span>
        </div>
      </aside>
      {open && <div className="sidebar-backdrop" onClick={onClose} />}
    </>
  );
}
