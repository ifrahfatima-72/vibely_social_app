import { useState, useRef } from 'react';
import axios from 'axios';
import { FiImage, FiX } from 'react-icons/fi';

function CreatePost({ onPost }) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handlePost = async () => {
    if (!content.trim() && !image) return;
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('content', content);
      if (image) formData.append('image', image);
      await axios.post('http://localhost:5000/api/posts', formData, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
      });
      setContent('');
      setImage(null);
      setPreview(null);
      onPost();
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  return (
    <div style={styles.card}>
      <div style={styles.top}>
        {user.avatar
          ? <img src={`http://localhost:5000${user.avatar}`} style={styles.avatar} />
          : <div style={styles.avatarPlaceholder}>{user.username?.[0]?.toUpperCase()}</div>
        }
        <textarea
          style={styles.textarea}
          placeholder="Share a moment..."
          value={content}
          onChange={e => setContent(e.target.value)}
          rows={2}
        />
      </div>

      {preview && (
        <div style={styles.previewWrap}>
          <img src={preview} style={styles.preview} />
          <button style={styles.removeImg} onClick={() => { setImage(null); setPreview(null); }}>
            <FiX size={16} />
          </button>
        </div>
      )}

      <div style={styles.bottom}>
        <button style={styles.imgBtn} onClick={() => fileRef.current.click()}>
          <FiImage size={20} color="#0095f6" />
          <span style={{ color: '#0095f6', fontSize: '14px', fontWeight: 600 }}>Photo</span>
        </button>
        <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleImage} />
        <button style={styles.postBtn} onClick={handlePost} disabled={loading || (!content.trim() && !image)}>
          {loading ? 'Posting...' : 'Share'}
        </button>
      </div>
    </div>
  );
}

const styles = {
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' },
  top: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  avatar: { width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 },
  avatarPlaceholder: { width: '42px', height: '42px', borderRadius: '50%', background: 'linear-gradient(135deg, #f09433, #bc1888)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px', flexShrink: 0 },
  textarea: { flex: 1, border: 'none', outline: 'none', resize: 'none', fontSize: '15px', background: 'transparent', color: 'var(--text)', lineHeight: 1.5 },
  previewWrap: { position: 'relative', borderRadius: '12px', overflow: 'hidden' },
  preview: { width: '100%', maxHeight: '400px', objectFit: 'cover', borderRadius: '12px', display: 'block' },
  removeImg: { position: 'absolute', top: '8px', right: '8px', background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' },
  bottom: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border)', paddingTop: '12px' },
  imgBtn: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 10px', borderRadius: '8px' },
  postBtn: { padding: '8px 20px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '20px', fontWeight: 700, fontSize: '14px', cursor: 'pointer', opacity: 1, transition: 'opacity 0.2s' }
};

export default CreatePost;