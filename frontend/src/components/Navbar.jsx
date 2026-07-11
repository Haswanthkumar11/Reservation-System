import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from './icons';

// Public top navigation — used on Landing, Login, Register and 404 only.
// Authenticated pages use Sidebar + Topbar via DashboardShell.
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="brand">
        <span className="sidebar-logo brand-logo"><Icon.UtensilsIcon width={16} height={16} /></span>
        The Reservation Table
      </Link>
      <div className="nav-links">
        {!user && (
          <>
            <Link to="/login">Login</Link>
            <Link className="btn btn-sm" to="/register">Get Started</Link>
          </>
        )}
        {user && user.role === 'customer' && <Link className="btn btn-sm" to="/dashboard">Dashboard</Link>}
        {user && user.role === 'admin' && <Link className="btn btn-sm" to="/admin">Dashboard</Link>}
        {user && (
          <button className="link-btn" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}
