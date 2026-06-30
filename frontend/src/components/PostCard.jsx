import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { FiHeart, FiMessageCircle, FiTrash2 } from 'react-icons/fi';
import { AiFillHeart } from 'react-icons/ai';
import CommentBox from './CommentBox';

function PostCard({ post, onUpdate }) {
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.likedByMe || false);
  const [likes, setLikes] = useState(post.likes);
  const [busy, setBusy] = useState(false);
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const likePost = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const res = await axios.put(`http://localhost:5000/api/posts/${post.id}/like`, {},
        { headers: { Authorization: `Bearer ${token}` } });
      setLiked(res.data.likedByMe);
      setLikes(res.data.likes);
    } catch (err) {
      console.error(err);
    }
    setBusy(false);
  };

  const deletePost = async () => {
    if (!window.confirm('Delete this post?')) return;
    await axios.delete(`http://localhost:5000/api/posts/${post.id}`,
      { headers: { Authorization: `Bearer ${token}` } });
    onUpdate();
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
    <div style={styles.card} className="glass-card fade-in">
      <div style={styles.header}>
        <Link to={`/profile/${post.userId}`} style={styles.userInfo}>
          {post.User?.avatar
            ? <img src={`http://localhost:5000${post.User.avatar}`} style={styles.avatar} />
            : <div style={styles.avatarPlaceholder}>{post.User?.username?.[0]?.toUpperCase()}</div>
          }
          <div>
            <p style={styles.username}>{post.User?.username}</p>
            <p style={styles.time}>{timeAgo(post.createdAt)}</p>
          </div>
        </Link>
        {user.id === post.userId && (
          <button style={styles.deleteBtn} onClick={deletePost}>
            <FiTrash2 size={16} />
          </button>
        )}
      </div>

      {post.content && <p style={styles.content}>{post.content}</p>}

      {post.image && (
        <img src={`http://localhost:5000${post.image}`} style={styles.postImage} alt="post" />
      )}

      <div style={styles.actions}>
        <button style={styles.actionBtn} onClick={likePost} disabled={busy}>
          {liked
            ? <AiFillHeart size={24} color="#ed4956" />
            : <FiHeart size={24} />
          }
          <span style={{ ...styles.count, color: liked ? '#ed4956' : 'var(--text)' }}>{likes}</span>
        </button>
        <button style={styles.actionBtn} onClick={() => setShowComments(!showComments)}>
          <FiMessageCircle size={24} />
          <span style={styles.count}>Comment</span>
        </button>
      </div>

      {showComments && <CommentBox postId={post.id} />}
    </div>
  );
}

const styles = {
  card: { overflow: 'hidden' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px' },
  userInfo: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: { width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: { width: '40px', height: '40px', borderRadius: '50%', background: 'var(--accent-grad)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, flexShrink: 0 },
  username: { fontWeight: 700, fontSize: '14px', color: 'var(--text)' },
  time: { fontSize: '12px', color: 'var(--subtext)' },
  deleteBtn: { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--subtext)', padding: '4px' },
  content: { padding: '0 16px 12px', fontSize: '15px', lineHeight: 1.5, color: 'var(--text)' },
  postImage: { width: '100%', maxHeight: '500px', objectFit: 'cover', display: 'block' },
  actions: { display: 'flex', gap: '16px', padding: '12px 16px', borderTop: '1px solid var(--border)' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '4px' },
  count: { fontSize: '14px', fontWeight: 600 }
};

export default PostCard;