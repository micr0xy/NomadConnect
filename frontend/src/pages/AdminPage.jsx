import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import useAuthStore from '../store/authStore';
import { listUsers, setUserBlocked, broadcastNotification } from '../services/adminApi';
import { listEvents, deleteEvent } from '../services/eventsApi';
import './AdminPage.css';

export default function AdminPage() {
  const user = useAuthStore((state) => state.user);
  const [users, setUsers] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [notificationForm, setNotificationForm] = useState({
    title: '',
    message: '',
    imageUrl: '',
  });
  const [sendingNotification, setSendingNotification] = useState(false);

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

  const handleBroadcastSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setNotice('');

    const title = String(notificationForm.title || '').trim();
    const message = String(notificationForm.message || '').trim();
    const imageUrl = String(notificationForm.imageUrl || '').trim();

    if (!title || !message) {
      setError('Please provide notification title and message');
      return;
    }

    try {
      setSendingNotification(true);
      const response = await broadcastNotification({ title, message, imageUrl });
      setNotice(response?.message || 'Notification sent successfully');
      setNotificationForm({ title: '', message: '', imageUrl: '' });
    } catch (err) {
      setError(typeof err === 'string' ? err : 'Failed to send notification');
    } finally {
      setSendingNotification(false);
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
      {notice && <p className="admin-notice">{notice}</p>}
      {loading && <p>Loading...</p>}

      {!loading && (
        <>
          <section className="admin-section">
            <h2>Send Notification to All Users</h2>
            <p className="admin-subtext">Recipients: {Math.max(0, users.filter((u) => u.role !== 'admin').length)} users</p>
            <form className="admin-broadcast-form" onSubmit={handleBroadcastSubmit}>
              <input
                type="text"
                value={notificationForm.title}
                onChange={(e) => setNotificationForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="Notification title"
                maxLength={120}
                disabled={sendingNotification}
              />
              <textarea
                value={notificationForm.message}
                onChange={(e) => setNotificationForm((prev) => ({ ...prev, message: e.target.value }))}
                placeholder="Write your custom notification message"
                rows={4}
                maxLength={600}
                disabled={sendingNotification}
              />
              <input
                type="url"
                value={notificationForm.imageUrl}
                onChange={(e) => setNotificationForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="Optional image URL (for ad-style notification)"
                maxLength={1000}
                disabled={sendingNotification}
              />
              <button type="submit" className="admin-btn" disabled={sendingNotification}>
                {sendingNotification ? 'Sending...' : 'Send to All Users'}
              </button>
            </form>
          </section>

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
