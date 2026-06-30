import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiPlus } from 'react-icons/fi';
import StoryViewer from './StoryViewer';

function StoryBar() {
  const [groups, setGroups] = useState([]);
  const [viewingGroupIndex, setViewingGroupIndex] = useState(null);
  const fileRef = useRef();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchStories = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/stories', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => { fetchStories(); }, []);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('image', file);
    try {
      await axios.post('http://localhost:5000/api/stories', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      fetchStories();
    } catch (err) {
      console.error(err);
    }
    e.target.value = '';
  };

  const myGroupIndex = groups.findIndex(g => g.user.id === user.id);
  const otherGroups = groups.filter(g => g.user.id !== user.id);
  const myGroup = myGroupIndex !== -1 ? groups[myGroupIndex] : null;

  return (
    <div style={styles.bar}>
      <div style={styles.scroll}>
        {/* My story / add story */}
        <div style={styles.item}>
          <div
            style={{ ...styles.ring, background: myGroup ? 'var(--accent-grad)' : 'var(--border)' }}
            onClick={() => myGroup ? setViewingGroupIndex(myGroupIndex) : fileRef.current.click()}
          >
            <div style={styles.ringInner}>
              {user.avatar
                ? <img src={`http://localhost:5000${user.avatar}`} style={styles.avatar} />
                : <div style={styles.avatarPlaceholder}>{user.username?.[0]?.toUpperCase()}</div>
              }
            </div>
            <button
              style={styles.plusBtn}
              onClick={(e) => { e.stopPropagation(); fileRef.current.click(); }}
            >
              <FiPlus size={12} color="white" />
            </button>
          </div>
          <span style={styles.label}>Your story</span>
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUpload} />
        </div>

        {/* Other users' stories */}
        {otherGroups.map((group) => (
          <div key={group.user.id} style={styles.item}
            onClick={() => setViewingGroupIndex(groups.findIndex(g => g.user.id === group.user.id))}>
            <div style={styles.ring}>
              <div style={styles.ringInner}>
                {group.user.avatar
                  ? <img src={`http://localhost:5000${group.user.avatar}`} style={styles.avatar} />
                  : <div style={styles.avatarPlaceholder}>{group.user.username[0].toUpperCase()}</div>
                }
              </div>
            </div>
            <span style={styles.label}>{group.user.username}</span>
          </div>
        ))}
      </div>

      {viewingGroupIndex !== null && (
        <StoryViewer
          groups={groups}
          startIndex={viewingGroupIndex}
          onClose={() => setViewingGroupIndex(null)}
          onDeleted={fetchStories}
        />
      )}
    </div>
  );
}

const styles = {
  bar: { maxWidth: '600px', margin: '0 auto', padding: '16px 16px 4px' },
  scroll: { display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px' },
  item: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px', cursor: 'pointer', flexShrink: 0, width: '68px' },
  ring: { width: '64px', height: '64px', borderRadius: '50%', padding: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  ringInner: { width: '100%', height: '100%', borderRadius: '50%', background: 'var(--card)', padding: '2px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  avatar: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: { width: '100%', height: '100%', borderRadius: '50%', background: 'var(--accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '20px' },
  plusBtn: { position: 'absolute', bottom: 0, right: 0, width: '20px', height: '20px', borderRadius: '50%', background: 'var(--teal)', border: '2px solid var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' },
  label: { fontSize: '11px', color: 'var(--text)', textAlign: 'center', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', width: '100%' }
};

export default StoryBar;