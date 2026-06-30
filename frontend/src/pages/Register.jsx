import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Register() {
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!form.username || !form.email || !form.password)
      return setError('Fill all fields');
    setLoading(true);
    try {
      await axios.post('http://localhost:5000/api/auth/register', form);
      alert('Account created successfully! Please login.');
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed');
    }
    setLoading(false);
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h1 style={styles.logo}>𝜗ৎ Vibely</h1>
        <p style={styles.sub}>Sign up to see photos from your friends</p>
        {error && <div style={styles.error}>{error}</div>}
        <input style={styles.input} placeholder="Username"
          value={form.username} onChange={e => setForm({ ...form, username: e.target.value })} />
        <input style={styles.input} placeholder="Email" type="email"
          value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input style={styles.input} placeholder="Password" type="password"
          value={form.password} onChange={e => setForm({ ...form, password: e.target.value })}
          onKeyDown={e => e.key === 'Enter' && handleSubmit()} />
        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? 'Creating...' : 'Sign Up'}
        </button>
        <p style={styles.switch}>
          Have an account? <Link to="/login" style={styles.link}>Log in</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent' },
  card: { background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '12px', padding: '40px 32px', width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '12px' },
 logo: {
  textAlign: 'center',
  fontSize: '34px',
  fontWeight: 800,
  fontFamily: "'Poppins', sans-serif",
  marginBottom: '4px',
  background: 'var(--accent-grad)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
  letterSpacing: '-0.5px'
},
  sub: { textAlign: 'center', color: 'var(--subtext)', fontSize: '14px', fontWeight: 600 },
  error: { background: '#fff3f3', border: '1px solid #ffcdd2', color: '#c62828', padding: '10px', borderRadius: '8px', fontSize: '13px', textAlign: 'center' },
  input: { width: '100%', padding: '10px 14px', border: '1px solid var(--border)', borderRadius: '8px', fontSize: '14px', background: 'var(--bg)', color: 'var(--text)', outline: 'none' },
  btn: { width: '100%', padding: '11px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer', marginTop: '4px' },
  switch: { textAlign: 'center', fontSize: '14px', color: 'var(--subtext)' },
  link: { color: 'var(--primary)', fontWeight: 600 }
};

export default Register;
