import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { listUsers, setUserBlocked } from '../services/adminApi';
import { listEvents, deleteEvent } from '../services/eventsApi';
import './AdminPage.css';

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = async () => {
    try {
      setLoading(true);
      setError('');
      const [usersData, eventsData] = await Promise.all([listUsers(), listEvents()]);
      setUsers(usersData);
      setEvents(eventsData);
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadData();
    }
  }, [user?.role]);

  const handleBlockToggle = async (targetUser) => {
    try {
      const updated = await setUserBlocked(targetUser._id, !targetUser.isBlocked);
      setUsers((prev) => prev.map((u) => (u._id === updated._id ? updated : u)));
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to update user');
    }
  };

  const handleDeleteEvent = async (eventId) => {
    const confirmed = window.confirm('Delete this event?');
    if (!confirmed) return;
    try {
      await deleteEvent(eventId);
      setEvents((prev) => prev.filter((event) => event._id !== eventId));
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to delete event');
    }
  };

  if (user?.role !== 'admin') {
    return <div className="admin-page"><p className="admin-error">Admin access required.</p></div>;
  }

  return (
    <motion.div className="admin-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="admin-header">
        <h1>Admin Panel</h1>
      </div>

      {error && <p className="admin-error">{error}</p>}
      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          <section className="admin-section">
            <h2>Users</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id}>
                      <td>{u.firstName} {u.lastName}</td>
                      <td>{u.email}</td>
                      <td>{u.role || 'user'}</td>
                      <td>{u.isBlocked ? 'Blocked' : 'Active'}</td>
                      <td>
                        {u.role !== 'admin' ? (
                          <button className="admin-btn" onClick={() => handleBlockToggle(u)}>
                            {u.isBlocked ? 'Unblock' : 'Block'}
                          </button>
                        ) : (
                          <span>-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <section className="admin-section">
            <h2>Events</h2>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Category</th>
                    <th>Creator</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((event) => (
                    <tr key={event._id}>
                      <td>{event.title}</td>
                      <td>{event.category || 'other'}</td>
                      <td>{event.createdByEmail}</td>
                      <td>
                        <button className="admin-btn danger" onClick={() => handleDeleteEvent(event._id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}
    </motion.div>
  );
}
