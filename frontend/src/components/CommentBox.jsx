import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function CommentBox({ postId }) {
  const [comments, setComments] = useState([]);
  const [text, setText] = useState('');
  const token = localStorage.getItem('token');

  const fetchComments = async () => {
    const res = await axios.get(`http://localhost:5000/api/comments/${postId}`);
    setComments(res.data);
  };

  useEffect(() => { fetchComments(); }, [postId]);

  const addComment = async () => {
    if (!text.trim()) return;
    await axios.post(`http://localhost:5000/api/comments/${postId}`,
      { text },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setText('');
    fetchComments();
  };

  return (
    <div style={styles.box}>
      {comments.map(c => (
        <div key={c.id} style={styles.comment}>
          <Link to={`/profile/${c.userId}`}>
            {c.User?.avatar
              ? <img src={`http://localhost:5000${c.User.avatar}`} style={styles.avatar} />
              : <div style={styles.placeholder}>{c.User?.username?.[0]?.toUpperCase()}</div>
            }
          </Link>
          <div style={styles.bubble}>
            <span style={styles.name}>{c.User?.username} </span>
            <span style={styles.text}>{c.text}</span>
          </div>
        </div>
      ))}
      <div style={styles.inputRow}>
        <input style={styles.input} placeholder="Add a comment..."
          value={text} onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && addComment()} />
        <button style={styles.btn} onClick={addComment}>Post</button>
      </div>
    </div>
  );
}

const styles = {
  box: { padding: '12px 16px', borderTop: '1px solid var(--border)', display: 'flex', flexDirection: 'column', gap: '10px' },
  comment: { display: 'flex', gap: '8px', alignItems: 'flex-start' },
  avatar: { width: '30px', height: '30px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  placeholder: { width: '30px', height: '30px', borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '12px', flexShrink: 0 },
  bubble: { background: 'var(--bg)', padding: '8px 12px', borderRadius: '16px', flex: 1 },
  name: { fontWeight: 700, fontSize: '13px', color: 'var(--text)' },
  text: { fontSize: '13px', color: 'var(--text)' },
  inputRow: { display: 'flex', gap: '8px', marginTop: '4px' },
  input: { flex: 1, padding: '9px 14px', border: '1px solid var(--border)', borderRadius: '20px', background: 'var(--bg)', color: 'var(--text)', fontSize: '13px', outline: 'none' },
  btn: { padding: '9px 16px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }
};

export default CommentBox;