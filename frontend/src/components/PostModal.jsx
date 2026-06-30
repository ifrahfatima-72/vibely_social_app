import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FiX, FiHeart, FiMessageCircle } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';

function PostModal({ post, onClose, onUpdate }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [likes, setLikes] = useState(post.likes);
  const [likers, setLikers] = useState([]);
  const [showLikers, setShowLikers] = useState(false);
  const [busy, setBusy] = useState(false);
  const token = localStorage.getItem('token');

  const fetchComments = async () => {
    const res = await axios.get(`http://localhost:5000/api/comments/${post.id}`);
    setComments(res.data);
  };

  const fetchLikers = async () => {
    const res = await axios.get(`http://localhost:5000/api/posts/${post.id}/likes`);
    setLikers(res.data);
  };

  useEffect(() => {
    fetchComments();
    fetchLikers();
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = 'auto'; };
  }, [post.id]);

  const likePost = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${post.id}/like`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setLiked(res.data.likedByMe);
      setLikes(res.data.likes);
      fetchLikers();
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error(err);
    }
    setBusy(false);
  };

  const addComment = async () => {
    if (!text.trim()) return;
    await axios.post(`http://localhost:5000/api/comments/${post.id}`,
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setText('');
    fetchComments();
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date);
    const m = Math.floor(diff / 60000);
    if (m < 1) return 'just now';
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={e => e.stopPropagation()}>
        <button style={styles.closeBtn} onClick={onClose}><FiX size={24} /></button>

        <div style={styles.left}>
          {post.image ? (
            <img src={`http://localhost:5000${post.image}`} style={styles.image} alt="post" />
          ) : (
            <div style={styles.textContent}>
              <p style={styles.textPost}>{post.content}</p>
            </div>
          )}
        </div>

        <div style={styles.right}>
          <div style={styles.header}>
            <Link to={`/profile/${post.userId}`} style={styles.userInfo} onClick={onClose}>
              {post.User?.avatar
                ? <img src={`http://localhost:5000${post.User.avatar}`} style={styles.avatar} />
                : <div style={styles.avatarPlaceholder}>{post.User?.username?.[0]?.toUpperCase()}</div>
              }
              <div>
                <p style={styles.username}>{post.User?.username}</p>
                <p style={styles.time}>{timeAgo(post.createdAt)}</p>
              </div>
            </Link>
          </div>

          {post.content && post.image && (
            <div style={styles.caption}>
              <span style={styles.captionUser}>{post.User?.username} </span>
              <span style={styles.captionText}>{post.content}</span>
            </div>
          )}

          <div style={styles.comments}>
            {comments.length === 0 ? (
              <p style={styles.noComments}>No comments yet. Be the first!</p>
            ) : (
              comments.map(c => (
                <div key={c.id} style={styles.comment}>
                  <Link to={`/profile/${c.userId}`} onClick={onClose}>
                    {c.User?.avatar
                      ? <img src={`http://localhost:5000${c.User.avatar}`} style={styles.commentAvatar} />
                      : <div style={styles.commentPlaceholder}>{c.User?.username?.[0]?.toUpperCase()}</div>
                    }
                  </Link>
                  <div style={styles.commentBubble}>
                    <span style={styles.commentUser}>{c.User?.username} </span>
                    <span style={styles.commentText}>{c.text}</span>
                    <p style={styles.commentTime}>{timeAgo(c.createdAt)}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div style={styles.actions}>
            <button style={styles.actionBtn} onClick={likePost} disabled={busy}>
              {liked
                ? <AiFillHeart size={26} color="#ed4956" />
                : <FiHeart size={26} />
              }
            </button>
            <button style={styles.actionBtn}>
              <FiMessageCircle size={26} />
            </button>
          </div>

          <p style={styles.likesCount} onClick={() => setShowLikers(!showLikers)}>
            {likes} {likes === 1 ? 'like' : 'likes'}
          </p>

          {showLikers && (
            <div style={styles.likersBox}>
              {likers.length === 0 ? (
                <p style={styles.noComments}>No likes yet</p>
              ) : (
                likers.map(l => (
                  <Link key={l.id} to={`/profile/${l.User.id}`} style={styles.likerRow} onClick={onClose}>
                    {l.User?.avatar
                      ? <img src={`http://localhost:5000${l.User.avatar}`} style={styles.commentAvatar} />
                      : <div style={styles.commentPlaceholder}>{l.User?.username?.[0]?.toUpperCase()}</div>
                    }
                    <span style={styles.commentUser}>{l.User?.username}</span>
                  </Link>
                ))
              )}
            </div>
          )}

          <div style={styles.commentInput}>
            <input
              style={styles.input}
              placeholder="Add a comment..."
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addComment()}
            />
            <button
              style={{ ...styles.postBtn, opacity: text.trim() ? 1 : 0.4 }}
              onClick={addComment}
              disabled={!text.trim()}
            >
              Post
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  modal: { background: 'var(--card)', borderRadius: '12px', display: 'flex', width: '100%', maxWidth: '900px', maxHeight: '90vh', overflow: 'hidden', position: 'relative' },
  closeBtn: { position: 'fixed', top: '20px', right: '20px', background: 'none', border: 'none', color: 'white', cursor: 'pointer', zIndex: 1001 },
  left: { flex: '1.2', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' },
  image: { width: '100%', height: '100%', objectFit: 'contain', maxHeight: '90vh' },
  textContent: { padding: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' },
  textPost: { fontSize: '20px', color: 'white', textAlign: 'center', lineHeight: 1.6 },
  right: { width: '340px', display: 'flex', flexDirection: 'column', flexShrink: 0 },
  header: { padding: '16px', borderBottom: '1px solid var(--border)' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' },
  avatar: { width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: { width: '38px', height: '38px', borderRadius: '50%', background: 'var(--accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px', flexShrink: 0 },
  username: { fontWeight: 700, fontSize: '14px', color: 'var(--text)' },
  time: { fontSize: '12px', color: 'var(--subtext)' },
  caption: { padding: '12px 16px', borderBottom: '1px solid var(--border)' },
  captionUser: { fontWeight: 700, fontSize: '14px', color: 'var(--text)' },
  captionText: { fontSize: '14px', color: 'var(--text)' },
  comments: { flex: 1, overflowY: 'auto', padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  noComments: { textAlign: 'center', color: 'var(--subtext)', fontSize: '14px', padding: '20px 0' },
  comment: { display: 'flex', gap: '8px', alignItems: 'flex-start' },
  commentAvatar: { width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  commentPlaceholder: { width: '32px', height: '32px', borderRadius: '50%', background: 'var(--accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '12px', flexShrink: 0 },
  commentBubble: { flex: 1 },
  commentUser: { fontWeight: 700, fontSize: '13px', color: 'var(--text)' },
  commentText: { fontSize: '13px', color: 'var(--text)' },
  commentTime: { fontSize: '11px', color: 'var(--subtext)', marginTop: '2px' },
  actions: { padding: '8px 12px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px' },
  actionBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', display: 'flex', alignItems: 'center', padding: '4px' },
  likesCount: { padding: '0 16px 8px', fontWeight: 700, fontSize: '14px', color: 'var(--text)', cursor: 'pointer' },
  likersBox: { padding: '0 16px 8px', display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '140px', overflowY: 'auto', borderBottom: '1px solid var(--border)', paddingBottom: '12px' },
  likerRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  commentInput: { padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', gap: '8px', alignItems: 'center' },
  input: { flex: 1, border: 'none', outline: 'none', fontSize: '14px', background: 'transparent', color: 'var(--text)' },
  postBtn: { background: 'none', border: 'none', color: 'var(--teal)', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }
};

export default PostModal;