import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Notifications() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  const fetchRequests = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/follow/received',
        { headers: { Authorization: `Bearer ${token}` } });
      setRequests(res.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleAccept = async (id) => {
    await axios.put(`http://localhost:5000/api/follow/accept/${id}`, {},
      { headers: { Authorization: `Bearer ${token}` } });
    fetchRequests();
  };

  const handleReject = async (id) => {
    await axios.put(`http://localhost:5000/api/follow/reject/${id}`, {},
      { headers: { Authorization: `Bearer ${token}` } });
    fetchRequests();
  };

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h2 style={styles.title}>🔔 Follow Requests</h2>
        {loading ? (
          <p style={styles.empty}>Loading...</p>
        ) : requests.length === 0 ? (
          <div style={styles.emptyBox}>
            <p style={{ fontSize: '48px' }}>🔔</p>
            <p style={{ fontWeight: 600, fontSize: '16px' }}>No pending requests</p>
            <p style={{ color: 'var(--subtext)', fontSize: '14px' }}>When someone requests to follow you, it'll show here</p>
          </div>
        ) : (
          requests.map(req => (
            <div key={req.id} style={styles.card}>
              <Link to={`/profile/${req.sender.id}`} style={styles.userInfo}>
                {req.sender.avatar
                  ? <img src={`http://localhost:5000${req.sender.avatar}`} style={styles.avatar} />
                  : <div style={styles.avatarPlaceholder}>{req.sender.username[0].toUpperCase()}</div>
                }
                <div>
                  <p style={styles.username}>{req.sender.username}</p>
                  <p style={styles.sub}>wants to follow you</p>
                </div>
              </Link>
              <div style={styles.actions}>
                <button style={styles.acceptBtn} onClick={() => handleAccept(req.id)}>
                  ✅ Accept
                </button>
                <button style={styles.rejectBtn} onClick={() => handleReject(req.id)}>
                  ❌ Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: 'var(--bg)', paddingBottom: '40px' },
  container: { maxWidth: '600px', margin: '0 auto', padding: '24px 16px' },
  title: { fontSize: '20px', fontWeight: 700, marginBottom: '20px', color: 'var(--text)' },
  empty: { textAlign: 'center', color: 'var(--subtext)', padding: '40px' },
  emptyBox: { textAlign: 'center', padding: '60px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: 'var(--text)' },
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px', flexWrap: 'wrap' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none' },
  avatar: { width: '50px', height: '50px', borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: { width: '50px', height: '50px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF9E20, #215E61)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '18px', flexShrink: 0 },
  username: { fontWeight: 700, fontSize: '15px', color: 'var(--text)' },
  sub: { fontSize: '13px', color: 'var(--subtext)' },
  actions: { display: 'flex', gap: '8px' },
  acceptBtn: { padding: '8px 18px', background: '#215E61', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' },
  rejectBtn: { padding: '8px 18px', background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }
};

export default Notifications;