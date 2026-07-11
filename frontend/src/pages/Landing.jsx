import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/icons';

export default function Landing() {
  const { user } = useAuth();

  return (
    <div className="public-shell">
      <Navbar />
      <div className="page-center">
        <span className="eyebrow"><Icon.UtensilsIcon width={14} height={14} /> Table management, simplified</span>
        <h1>Welcome to The Reservation Table</h1>
        <p>Book a table in seconds. We automatically find the best table for your party.</p>
        {!user && (
          <div className="cta-row">
            <Link className="btn" to="/register">Get Started</Link>
            <Link className="btn btn-outline" to="/login">Login</Link>
          </div>
        )}
        {user && user.role === 'customer' && <Link className="btn" to="/reservations/new">Book a Table</Link>}
        {user && user.role === 'admin' && <Link className="btn" to="/admin">Go to Admin Dashboard</Link>}
      </div>
      <Footer />
    </div>
  );
}
