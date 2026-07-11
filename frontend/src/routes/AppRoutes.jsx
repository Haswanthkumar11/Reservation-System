import { Routes, Route } from 'react-router-dom';
import Landing from '../pages/Landing';
import Login from '../pages/Login';
import Register from '../pages/Register';
import CustomerDashboard from '../pages/CustomerDashboard';
import CreateReservation from '../pages/CreateReservation';
import MyReservations from '../pages/MyReservations';
import AdminDashboard from '../pages/AdminDashboard';
import ReservationManagement from '../pages/ReservationManagement';
import TableManagement from '../pages/TableManagement';
import NotFound from '../pages/NotFound';
import ProtectedRoute from './ProtectedRoute';

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute role="customer">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations/new"
        element={
          <ProtectedRoute role="customer">
            <CreateReservation />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reservations/my"
        element={
          <ProtectedRoute role="customer">
            <MyReservations />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin"
        element={
          <ProtectedRoute role="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reservations"
        element={
          <ProtectedRoute role="admin">
            <ReservationManagement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/tables"
        element={
          <ProtectedRoute role="admin">
            <TableManagement />
          </ProtectedRoute>
        }
      />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
