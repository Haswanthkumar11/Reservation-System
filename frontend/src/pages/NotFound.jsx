import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

export default function NotFound() {
  return (
    <div className="public-shell">
      <Navbar />
      <div className="page-center">
        <h1 className="not-found-code">404</h1>
        <p>We couldn't find that page.</p>
        <Link className="btn" to="/">Back to home</Link>
      </div>
      <Footer />
    </div>
  );
}
