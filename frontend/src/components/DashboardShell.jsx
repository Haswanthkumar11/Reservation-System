import { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import { useAuth } from '../context/AuthContext';

export default function DashboardShell({ title, children }) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);

  return (
    <div className="shell">
      <Sidebar role={user?.role} open={open} onClose={() => setOpen(false)} />
      <div className="shell-main">
        <Topbar title={title} onMenuClick={() => setOpen((o) => !o)} />
        <main className="shell-content">{children}</main>
      </div>
    </div>
  );
}
