import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.email || !form.password) return setError('Fill all fields');
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', form);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      window.location.href = '/';
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      {/* Left hero panel - hidden on mobile */}
      <div style={styles.heroPanel} className="login-hero-panel">
        <div style={styles.heroGlow1}></div>
        <div style={styles.heroGlow2}></div>
        <div style={styles.heroContent}>
          <h1 style={styles.heroTitle}>𝜗ৎ Vibely</h1>
          <p style={styles.heroSub}>Share moments. Find your people.</p>

          <div style={styles.heroFeatures}>
            <div style={styles.featureRow}>
              <span style={styles.featureIcon}>📸</span>
              <span style={styles.featureText}>Post photos and stories</span>
            </div>
            <div style={styles.featureRow}>
              <span style={styles.featureIcon}>💬</span>
              <span style={styles.featureText}>Comment and react in real time</span>
            </div>
            <div style={styles.featureRow}>
              <span style={styles.featureIcon}>🔒</span>
              <span style={styles.featureText}>Follow requests keep your circle private</span>
            </div>
          </div>

          <div style={styles.heroDots}>
            <span style={{ ...styles.dot, background: '#FF9E20' }}></span>
            <span style={{ ...styles.dot, background: '#fff' }}></span>
            <span style={{ ...styles.dot, background: '#215E61' }}></span>
          </div>
        </div>
      </div>

      {/* Right form panel */}
      <div style={styles.formPanel}>
        <div style={styles.card}>
  <div style={styles.cardBg}></div>
  <div style={styles.cardOverlay}></div>
  <div style={styles.cardContent}>
    <h2 style={styles.cardTitle}>Welcome back</h2>
    <p style={styles.sub}>Sign in to see photos from your friends</p>
    {error && <div style={styles.error}>{error}</div>}
    <input style={styles.input} placeholder="Email" type="email"
      value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
      onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
    <input style={styles.input} placeholder="Password" type="password"
      value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
      onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
    <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
      {loading ? 'Signing in...' : 'Log In'}
    </button>
    <div style={styles.divider}><span>OR</span></div>
    <p style={styles.switch}>
      Don't have an account? <Link to="/register" style={styles.link}>Sign up</Link>
    </p>
  </div>
</div>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex' },
  heroPanel: {
    flex: 1,
    background: 'linear-gradient(150deg, #215E61 0%, #1D2128 70%, #FF9E20 140%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    minHeight: '100vh'
  },
  heroGlow1: { position: 'absolute', width: '380px', height: '380px', borderRadius: '50%', background: '#FF9E20', filter: 'blur(110px)', opacity: 0.3, top: '-60px', right: '-60px' },
  heroGlow2: { position: 'absolute', width: '320px', height: '320px', borderRadius: '50%', background: '#2c7c80', filter: 'blur(100px)', opacity: 0.4, bottom: '-40px', left: '-40px' },
heroContent: { position: 'relative', textAlign: 'left', padding: '40px', maxWidth: '420px' },  heroTitle: { fontSize: '48px', fontWeight: 800, fontFamily: "'Poppins', sans-serif", color: 'white', marginBottom: '12px' },
  heroSub: { fontSize: '17px', color: 'rgba(255,255,255,0.85)', fontWeight: 500, marginBottom: '24px' },
heroDots: { display: 'flex', gap: '8px', justifyContent: 'flex-start' },  dot: { width: '8px', height: '8px', borderRadius: '50%' },
  heroFeatures: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '28px', textAlign: 'left' },
featureRow: { display: 'flex', alignItems: 'center', gap: '12px' },
featureIcon: { fontSize: '22px', width: '40px', height: '40px', borderRadius: '12px', background: 'rgba(255,255,255,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
featureText: { fontSize: '14px', color: 'rgba(255,255,255,0.85)', fontWeight: 500, lineHeight: 1.4 },
formPanel: {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '24px',
  background: 'linear-gradient(160deg, #fdf6ec 0%, #f4ece0 50%, #eef2f1 100%)'
},  card: {
  position: 'relative',
  borderRadius: '20px',
  padding: '44px 36px',
  width: '100%',
  maxWidth: '400px',
  boxShadow: '0 20px 60px rgba(29,33,40,0.18)',
  overflow: 'hidden',
  border: '1px solid var(--border)'
},
cardBg: {
  position: 'absolute',
  inset: 0,
  backgroundImage: 'url(https://images.unsplash.com/photo-1521737711867-e3b97375f902?w=800&q=80)',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  filter: 'blur(18px)',
  transform: 'scale(1.15)',
  zIndex: 0
},
cardOverlay: {
  position: 'absolute',
  inset: 0,
  background: 'rgba(255,255,255,0.82)',
  zIndex: 1
},
cardContent: {
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: '14px'
},
cardTitle: { fontSize: '26px', fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: '#1D2128', textAlign: 'center', marginTop: '8px' }, sub: { textAlign: 'center', color: '#6b7280', fontSize: '14px', fontWeight: 500, marginBottom: '6px' },
  error: { background: '#fff3f3', border: '1px solid #ffcdd2', color: '#c62828', padding: '10px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' },
input: { width: '100%', padding: '12px 14px', border: '1px solid #e5e2e0', borderRadius: '10px', fontSize: '14px', background: 'rgba(255,255,255,0.9)', color: '#1D2128', outline: 'none' },  btn: { width: '100%', padding: '13px', background: 'var(--primary-grad)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '15px', fontWeight: 700, cursor: 'pointer', marginTop: '6px', boxShadow: '0 4px 14px rgba(33,94,97,0.35)' },
  divider: { textAlign: 'center', color: '#6b7280', fontSize: '13px', margin: '4px 0' },
switch: { textAlign: 'center', fontSize: '14px', color: '#6b7280' },
  link: { color: 'var(--teal)', fontWeight: 700 }
};

export default Login;