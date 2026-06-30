import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiX } from 'react-icons/fi';

function FollowListModal({ userId, type, onClose }) {
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const res = await axios.get(`http://localhost:5000/api/users/${userId}/${type}`);
      setList(res.data);
      setLoading(false);
    };
    fetch();
  }, [userId, type]);

  const getUser = (item) => type === 'followers' ? item.followerUser : item.followingUser;

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <div style={styles.header}>
          <h3 style={styles.title}>{type === 'followers' ? 'Followers' : 'Following'}</h3>
          <button style={styles.closeBtn} onClick={onClose}><FiX size={20} /></button>
        </div>
        <div style={styles.list}>
          {loading ? (
            <p style={styles.empty}>Loading...</p>
          ) : list.length === 0 ? (
            <p style={styles.empty}>
              {type === 'followers' ? 'No followers yet' : 'Not following anyone yet'}
            </p>
          ) : (
            list.map(item => {
              const u = getUser(item);
              if (!u) return null;
              return (
                <Link key={u.id} to={`/profile/${u.id}`} style={styles.row} onClick={onClose}>
                  {u.avatar
                    ? <img src={`http://localhost:5000${u.avatar}`} style={styles.avatar} />
                    : <div style={styles.avatarPlaceholder}>{u.username[0].toUpperCase()}</div>
                  }
                  <div>
                    <p style={styles.username}>{u.username}</p>
                    {u.bio && <p style={styles.bio}>{u.bio}</p>}
                  </div>
                </Link>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal: { background: 'var(--card)', borderRadius: '16px', width: '100%', maxWidth: '380px', maxHeight: '70vh', display: 'flex', flexDirection: 'column', boxShadow: 'var(--shadow-lg)' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', borderBottom: '1px solid var(--border)' },
  title: { fontSize: '16px', fontWeight: 700, color: 'var(--text)' },
  closeBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)' },
  list: { overflowY: 'auto', padding: '8px' },
  empty: { textAlign: 'center', color: 'var(--subtext)', padding: '40px 20px', fontSize: '14px' },
  row: { display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', borderRadius: '10px', transition: 'background 0.15s' },
  avatar: { width: '44px', height: '44px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  avatarPlaceholder: { width: '44px', height: '44px', borderRadius: '50%', background: 'var(--accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 },
  username: { fontWeight: 600, fontSize: '14px', color: 'var(--text)' },
  bio: { fontSize: '12px', color: 'var(--subtext)' }
};

export default FollowListModal;