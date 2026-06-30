import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import { FiEdit2, FiGrid, FiHeart, FiMessageCircle } from 'react-icons/fi';
import PostCard from '../components/PostCard';
import FollowListModal from '../components/FollowListModal';
import PostModal from '../components/PostModal';

function Profile() {
  const { id } = useParams();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [requestStatus, setRequestStatus] = useState('none');
  const [requestId, setRequestId] = useState(null);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState('');
  const [website, setWebsite] = useState('');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [listModal, setListModal] = useState(null); // 'followers' | 'following' | null
  const [selectedPost, setSelectedPost] = useState(null);
  const fileRef = useRef();
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const isOwner = currentUser.id === parseInt(id);

  const fetchProfile = async () => {
    const res = await axios.get(`http://localhost:5000/api/users/${id}`);
    setProfile(res.data);
    setBio(res.data.bio || '');
    setWebsite(res.data.website || '');
  };

  const fetchPosts = async () => {
    const res = await axios.get('http://localhost:5000/api/posts', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    setPosts(res.data.filter(p => p.userId === parseInt(id)));
  };

  const checkFollowing = async () => {
    if (!token || isOwner) return;
    const res = await axios.get(`http://localhost:5000/api/users/${id}/isfollowing`,
      { headers: { Authorization: `Bearer ${token}` } });
    setIsFollowing(res.data.following);
  };

  const checkRequestStatus = async () => {
    if (!token || isOwner) return;
    const res = await axios.get(
      `http://localhost:5000/api/follow/status/${id}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    setRequestStatus(res.data.status);
    setRequestId(res.data.requestId);
  };

  useEffect(() => {
    fetchProfile();
    fetchPosts();
    checkFollowing();
    checkRequestStatus();
  }, [id]);

  const handleFollow = async () => {
  try {
    console.log("Clicked Follow");

    if (isFollowing) {
      await axios.delete(
        `http://localhost:5000/api/users/${id}/unfollow`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setIsFollowing(false);
      setRequestStatus("none");
      fetchProfile();
      return;
    }

if (requestStatus === 'pending') {
  alert('Follow request already sent! Waiting for approval.');
  return;
}
const res = await axios.post(
  `http://localhost:5000/api/follow/send/${id}`, {},
  { headers: { Authorization: `Bearer ${token}` } }
);

    console.log(res.data);

    setRequestStatus("pending");
    alert("Follow request sent!");
  } catch (err) {
    console.log(err.response?.data);
    alert(err.response?.data?.error || err.message);
  }
};
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const saveProfile = async () => {
    const formData = new FormData();
    formData.append('bio', bio);
    formData.append('website', website);
    if (avatarFile) formData.append('avatar', avatarFile);
    const res = await axios.put('http://localhost:5000/api/users/profile/update', formData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
    });
    localStorage.setItem('user', JSON.stringify({ ...currentUser, avatar: res.data.avatar }));
    setEditing(false);
    setAvatarFile(null);
    setAvatarPreview(null);
    fetchProfile();
  };

  if (!profile) return <div style={styles.loading}>Loading...</div>;

  const avatarSrc = avatarPreview || (profile.avatar ? `http://localhost:5000${profile.avatar}` : null);

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div style={styles.avatarWrap}>
          {avatarSrc
            ? <img src={avatarSrc} style={styles.avatar} />
            : <div style={styles.avatarPlaceholder}>{profile.username?.[0]?.toUpperCase()}</div>
          }
          {editing && (
            <button style={styles.changeAvatar} onClick={() => fileRef.current.click()}>
              <FiEdit2 size={12} />
            </button>
          )}
          <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
        </div>

        <div style={styles.info}>
          <div style={styles.topRow}>
            <h2 style={styles.username}>{profile.username}</h2>

            {isOwner ? (
              editing ? (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={styles.editBtn} onClick={saveProfile}>Save</button>
                  <button style={{ ...styles.editBtn, background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }} onClick={() => setEditing(false)}>Cancel</button>
                </div>
              ) : (
                <button style={styles.editBtn} onClick={() => setEditing(true)}>
                  <FiEdit2 size={14} /> Edit Profile
                </button>
              )
            ) : (
              <button
                style={{
                  ...styles.editBtn,
                  background: isFollowing ? 'var(--bg)'
                    : requestStatus === 'pending' ? '#FF9E20'
                    : 'var(--accent-grad)',
                  color: isFollowing ? 'var(--text)' : 'white',
                  border: isFollowing ? '1px solid var(--border)' : 'none'
                }}
                onClick={handleFollow}
              >
                {isFollowing ? 'Unfollow'
                  : requestStatus === 'pending' ? '⏳ Requested'
                  : '➕ Follow'}
              </button>
            )}
          </div>

          <div style={styles.stats}>
            <div style={styles.stat}><strong>{posts.length}</strong> posts</div>
            <div style={styles.stat} onClick={() => setListModal('followers')}>
              <strong>{profile.followers}</strong> followers
            </div>
            <div style={styles.stat} onClick={() => setListModal('following')}>
              <strong>{profile.following}</strong> following
            </div>
          </div>

          {editing ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <textarea style={styles.bioInput} placeholder="Bio..." value={bio}
                onChange={e => setBio(e.target.value)} rows={2} />
              <input style={styles.bioInput} placeholder="Website..." value={website}
                onChange={e => setWebsite(e.target.value)} />
            </div>
          ) : (
            <div>
              {profile.bio && <p style={styles.bio}>{profile.bio}</p>}
              {profile.website && <a href={profile.website} style={styles.website} target="_blank">{profile.website}</a>}
            </div>
          )}
        </div>
      </div>

      <div style={styles.postsHeader}>
        <FiGrid size={16} /> <span>POSTS</span>
      </div>
      <div style={styles.grid}>
        {posts.length === 0 ? (
          <div style={styles.noPosts}>
            <p style={{ fontSize: '32px' }}>.✦ ݁˖</p>
            <p style={{ fontWeight: 600 }}>No Posts Yet</p>
          </div>
        ) : (
          posts.map(post => (
            post.image ? (
              <div
                key={post.id}
                className="profile-grid-item"
                style={styles.gridItem}
                onClick={() => setSelectedPost(post)}
              >
                <img src={`http://localhost:5000${post.image}`} style={styles.gridImg} />
                <div className="profile-grid-overlay" style={styles.gridOverlay}>
                  <span style={styles.gridStat}><FiHeart size={16} fill="white" /> {post.likes}</span>
                  <span style={styles.gridStat}><FiMessageCircle size={16} fill="white" /></span>
                </div>
              </div>
            ) : (
              <div
                key={post.id}
                className="profile-grid-item"
                style={{ ...styles.gridItem, ...styles.textPost }}
                onClick={() => setSelectedPost(post)}
              >
                <p style={styles.textContent}>{post.content}</p>
                <div className="profile-grid-overlay" style={styles.gridOverlay}>
                  <span style={styles.gridStat}><FiHeart size={16} fill="white" /> {post.likes}</span>
                </div>
              </div>
            )
          ))
        )}
      </div>

      {listModal && (
        <FollowListModal userId={id} type={listModal} onClose={() => setListModal(null)} />
      )}

      {selectedPost && (
        <PostModal
          post={selectedPost}
          onClose={() => setSelectedPost(null)}
          onUpdate={fetchPosts}
        />
      )}
    </div>
  );
}

const styles = {
  page: { maxWidth: '935px', margin: '0 auto', padding: '30px 20px' },
  loading: { textAlign: 'center', padding: '80px', color: 'var(--subtext)' },
  header: { display: 'flex', gap: '40px', marginBottom: '40px', alignItems: 'flex-start' },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: { width: '120px', height: '120px', borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--border)' },
  avatarPlaceholder: { width: '120px', height: '120px', borderRadius: '50%', background: 'linear-gradient(135deg, #FF9E20, #215E61)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '42px' },
  changeAvatar: { position: 'absolute', bottom: 4, right: 4, background: '#215E61', border: 'none', borderRadius: '50%', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'white' },
  info: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  topRow: { display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  username: { fontSize: '24px', fontWeight: 300, color: 'var(--text)' },
  editBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 18px', border: 'none', borderRadius: '10px', background: 'var(--accent-grad)', color: 'white', cursor: 'pointer', fontWeight: 600, fontSize: '14px', boxShadow: 'var(--shadow-sm)' },
  stats: { display: 'flex', gap: '32px' },
  stat: { fontSize: '15px', color: 'var(--text)', cursor: 'pointer' },
  bio: { fontSize: '14px', color: 'var(--text)', lineHeight: 1.5 },
  website: { fontSize: '14px', color: '#215E61', fontWeight: 600 },
  bioInput: { padding: '8px 12px', border: '1px solid var(--border)', borderRadius: '8px', background: 'var(--bg)', color: 'var(--text)', fontSize: '14px', outline: 'none', resize: 'none', width: '100%' },
  postsHeader: { display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', padding: '12px', borderTop: '1px solid var(--border)', fontSize: '13px', fontWeight: 700, color: 'var(--text)', letterSpacing: '1px', marginBottom: '4px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '4px' },
  gridItem: { aspectRatio: '1', overflow: 'hidden', background: 'var(--card)', cursor: 'pointer', position: 'relative', border: '1px solid var(--border)' },
  gridImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  gridOverlay: { position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', color: 'white', fontWeight: 700, fontSize: '14px', opacity: 0, transition: 'opacity 0.2s' },
  gridStat: { display: 'flex', alignItems: 'center', gap: '5px' },
  textPost: { background: 'var(--card)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '12px' },
  textContent: { fontSize: '13px', color: 'var(--text)', textAlign: 'center', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical' },
  noPosts: { gridColumn: '1/-1', textAlign: 'center', padding: '60px', color: 'var(--subtext)', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }
};

export default Profile;