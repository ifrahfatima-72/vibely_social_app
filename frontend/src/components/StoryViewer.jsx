import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiX, FiTrash2, FiChevronLeft, FiChevronRight, FiEye } from 'react-icons/fi';

function StoryViewer({ groups, startIndex, onClose, onDeleted }) {
  const [groupIndex, setGroupIndex] = useState(startIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [showViewers, setShowViewers] = useState(false);
  const [viewers, setViewers] = useState([]);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const timerRef = useRef();

  const group = groups[groupIndex];
  const story = group?.stories[storyIndex];
  const isOwner = story && story.userId === user.id;

  const markViewed = async (id) => {
    try {
      await axios.post(`http://localhost:5000/api/stories/${id}/view`, {},
        { headers: { Authorization: `Bearer ${token}` } });
    } catch (e) {}
  };

  useEffect(() => {
    if (!story) return;
    setProgress(0);
    setShowViewers(false);
    markViewed(story.id);

    const duration = 5000;
    const step = 50;
    let elapsed = 0;
    timerRef.current = setInterval(() => {
      elapsed += step;
      setProgress(elapsed / duration);
      if (elapsed >= duration) {
        clearInterval(timerRef.current);
        goNext();
      }
    }, step);

    return () => clearInterval(timerRef.current);
  }, [groupIndex, storyIndex]);

  const goNext = () => {
    if (storyIndex < group.stories.length - 1) {
      setStoryIndex(i => i + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(i => i + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const goPrev = () => {
    if (storyIndex > 0) {
      setStoryIndex(i => i - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(i => i - 1);
      setStoryIndex(groups[groupIndex - 1].stories.length - 1);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this story?')) return;
    clearInterval(timerRef.current);
    await axios.delete(`http://localhost:5000/api/stories/${story.id}`,
      { headers: { Authorization: `Bearer ${token}` } });
    onDeleted();
    onClose();
  };

  const loadViewers = async () => {
    clearInterval(timerRef.current);
    const res = await axios.get(`http://localhost:5000/api/stories/${story.id}/viewers`,
      { headers: { Authorization: `Bearer ${token}` } });
    setViewers(res.data);
    setShowViewers(true);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const h = Math.floor(diff / 3600000);
    if (h < 1) return `${Math.floor(diff / 60000)}m`;
    return `${h}h`;
  };

  if (!story) return null;

  return (
    <div style={styles.overlay}>
      <div style={styles.container}>

        {/* Progress bars */}
        <div style={styles.progressRow}>
          {group.stories.map((s, i) => (
            <div key={s.id} style={styles.progressTrack}>
              <div style={{
                ...styles.progressFill,
                width: i < storyIndex ? '100%' : i === storyIndex ? `${progress * 100}%` : '0%'
              }} />
            </div>
          ))}
        </div>

        {/* Header */}
        <div style={styles.header}>
          <Link to={`/profile/${group.user.id}`} style={styles.userInfo} onClick={onClose}>
            {group.user.avatar
              ? <img src={`http://localhost:5000${group.user.avatar}`} style={styles.avatar} />
              : <div style={styles.avatarPlaceholder}>{group.user.username[0].toUpperCase()}</div>
            }
            <span style={styles.username}>{group.user.username}</span>
            <span style={styles.time}>{timeAgo(story.createdAt)}</span>
          </Link>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {isOwner && (
              <button style={styles.iconBtn} onClick={handleDelete}><FiTrash2 size={20} /></button>
            )}
            <button style={styles.iconBtn} onClick={onClose}><FiX size={24} /></button>
          </div>
        </div>

        {/* Image */}
        <img src={`http://localhost:5000${story.image}`} style={styles.image} alt="story" />

        {/* Nav zones */}
        <div style={styles.navLeft} onClick={goPrev} />
        <div style={styles.navRight} onClick={goNext} />

        {/* Arrows (desktop) */}
        {(groupIndex > 0 || storyIndex > 0) && (
          <button style={{ ...styles.arrow, left: '12px' }} onClick={goPrev}><FiChevronLeft size={24} /></button>
        )}
        <button style={{ ...styles.arrow, right: '12px' }} onClick={goNext}><FiChevronRight size={24} /></button>

        {/* Viewers (owner only) */}
        {isOwner && (
          <button style={styles.viewersBtn} onClick={loadViewers}>
            <FiEye size={16} /> Seen
          </button>
        )}

        {showViewers && (
          <div style={styles.viewersPanel} onClick={e => e.stopPropagation()}>
            <div style={styles.viewersPanelHeader}>
              <span>Viewed by {viewers.length}</span>
              <button style={styles.iconBtn} onClick={() => setShowViewers(false)}><FiX size={18} /></button>
            </div>
            <div style={styles.viewersList}>
              {viewers.length === 0 ? (
                <p style={{ color: 'var(--subtext)', fontSize: '13px', padding: '12px 0' }}>No views yet</p>
              ) : (
                viewers.map(v => (
                  <div key={v.id} style={styles.viewerRow}>
                    {v.viewer?.avatar
                      ? <img src={`http://localhost:5000${v.viewer.avatar}`} style={styles.viewerAvatar} />
                      : <div style={styles.viewerAvatarPlaceholder}>{v.viewer?.username[0].toUpperCase()}</div>
                    }
                    <span style={{ fontSize: '13px', color: 'var(--text)' }}>{v.viewer?.username}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.95)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center' },
  container: { position: 'relative', width: '100%', maxWidth: '420px', height: '90vh', maxHeight: '760px', background: '#000', borderRadius: '12px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  progressRow: { position: 'absolute', top: '8px', left: '8px', right: '8px', display: 'flex', gap: '4px', zIndex: 10 },
  progressTrack: { flex: 1, height: '3px', background: 'rgba(255,255,255,0.3)', borderRadius: '2px', overflow: 'hidden' },
  progressFill: { height: '100%', background: 'white', transition: 'width 0.05s linear' },
  header: { position: 'absolute', top: '20px', left: '12px', right: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', zIndex: 10 },
  userInfo: { display: 'flex', alignItems: 'center', gap: '8px' },
  avatar: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '13px' },
  username: { color: 'white', fontWeight: 600, fontSize: '14px' },
  time: { color: 'rgba(255,255,255,0.7)', fontSize: '12px' },
  iconBtn: { background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex' },
  image: { width: '100%', height: '100%', objectFit: 'contain' },
  navLeft: { position: 'absolute', left: 0, top: 0, width: '30%', height: '100%', cursor: 'pointer', zIndex: 5 },
  navRight: { position: 'absolute', right: 0, top: 0, width: '30%', height: '100%', cursor: 'pointer', zIndex: 5 },
  arrow: { position: 'absolute', top: '50%', transform: 'translateY(-50%)', background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', cursor: 'pointer', zIndex: 10 },
  viewersBtn: { position: 'absolute', bottom: '16px', left: '16px', background: 'rgba(0,0,0,0.5)', border: 'none', borderRadius: '20px', padding: '8px 14px', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', zIndex: 10 },
  viewersPanel: { position: 'absolute', bottom: 0, left: 0, right: 0, background: 'var(--card)', borderRadius: '16px 16px 0 0', maxHeight: '50%', display: 'flex', flexDirection: 'column', zIndex: 20, boxShadow: '0 -4px 20px rgba(0,0,0,0.3)' },
  viewersPanelHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 16px', borderBottom: '1px solid var(--border)', fontWeight: 700, fontSize: '14px', color: 'var(--text)' },
  viewersList: { overflowY: 'auto', padding: '8px 16px' },
  viewerRow: { display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 0' },
  viewerAvatar: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' },
  viewerAvatarPlaceholder: { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '12px' }
};

export default StoryViewer;