import { useState, useEffect } from 'react';
import axios from 'axios';
import PostCard from '../components/PostCard';
import CreatePost from '../components/CreatePost';
import StoryBar from '../components/StoryBar';

function Feed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPosts = async () => {
  const token = localStorage.getItem('token');
  try {
    const res = await axios.get('http://localhost:5000/api/posts', {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    });
    setPosts(res.data);
  } catch (err) {
    console.error(err);
  }
  setLoading(false);
};

  useEffect(() => { fetchPosts(); }, []);

  return (
  <div style={styles.page}>
    <StoryBar />
    <div style={styles.feed}>
      <CreatePost onPost={fetchPosts} />
        {loading ? (
          <div style={styles.loading}>Loading posts...</div>
        ) : posts.length === 0 ? (
          <div style={styles.empty}>
            <p style={{ fontSize: '48px' }}>𝜗ৎ</p>
            <p style={{ fontWeight: 600, fontSize: '18px' }}>No posts yet</p>
            <p style={{ color: 'var(--subtext)' }}>Be the first to share something!</p>
          </div>
        ) : (
          posts.map(post => <PostCard key={post.id} post={post} onUpdate={fetchPosts} />)
        )}
      </div>
    </div>
  );
}

const styles = {
  page: { background: 'transparent', minHeight: '100vh', paddingBottom: '40px' },
  feed: {
  maxWidth: '600px',
  margin: '0 auto',
  padding: '24px 16px',
  display: 'flex',
  flexDirection: 'column',
  gap: '16px',

  // Add these
  background: 'rgba(199, 199, 199, 0.29)',
  border: '1px solid rgba(255, 255, 255, 0.87)',
  borderRadius: '14px',
  boxShadow: '0 8px 25px rgba(0, 0, 0, 0.71)',
  backdropFilter: 'blur(20px)'
},

loading: {
  textAlign: 'center',
  color: 'var(--subtext)',
  padding: '40px'
},

empty: {
  textAlign: 'center',
  padding: '60px 20px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '8px'
}
};

export default Feed;