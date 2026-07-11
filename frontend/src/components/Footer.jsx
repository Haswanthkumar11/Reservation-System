export default function Footer() {
  return (
    <footer className="site-footer">
      <span>© {new Date().getFullYear()} The Reservation Table</span>
      <span className="site-footer-dot">•</span>
      <span>Built with React, Express &amp; MongoDB</span>
    </footer>
  );
}
