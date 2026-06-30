import { useState, useEffect } from 'react'; // Added useEffect import
import { Link, useNavigate } from 'react-router-dom';
import { FiHome, FiSearch, FiSun, FiMoon, FiLogOut, FiUser, FiBell } from 'react-icons/fi'; // Added FiBell import
import { useTheme } from '../context/ThemeContext';

function Navbar() {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [search, setSearch] = useState('');
  const [results, setResults] = useState([]);
  
  // ✅ Correctly added state inside the component body
  const [notifCount, setNotifCount] = useState(0);

  // ✅ Correctly added useEffect inside the component body (sitting below token definition)
  useEffect(() => {
    if (!token) return;
    const fetchCount = async () => {
      const res = await fetch('http://localhost:5000/api/follow/count', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      setNotifCount(data.count || 0);
    };
    fetchCount();
    const interval = setInterval(fetchCount, 30000);
    return () => clearInterval(interval);
  }, [token]);

  const handleSearch = async (e) => {
    const q = e.target.value;
    setSearch(q);
    if (q.trim().length < 1) return setResults([]);
    const res = await fetch(`http://localhost:5000/api/users/search?q=${q}`);
    const data = await res.json();
    setResults(data);
  };

  const logout = () => {
    localStorage.clear();
    navigate('/login');
    window.location.reload();
  };

  return (
    <nav style={styles.nav}>
      {/* Logo */}
      <Link to="/" style={styles.logo}>𝜗ৎ Vibely</Link>

      {/* Search */}
      {token && (
        <div style={styles.searchWrap}>
          <div style={styles.searchBox}>
            <FiSearch style={styles.searchIcon} />
            <input
  className="navbar-search-input"
  style={styles.searchInput}
  placeholder="Search users..."
  value={search}
  onChange={handleSearch}
/>
          </div>
          {results.length > 0 && (
            <div style={styles.dropdown}>
              {results.map(u => (
                <div key={u.id} style={styles.dropItem}
                  onClick={() => { navigate(`/profile/${u.id}`); setResults([]); setSearch(''); }}>
                  {u.avatar
                    ? <img src={`http://localhost:5000${u.avatar}`} style={{ ...styles.mini, borderRadius: '50%' }} alt="" />
                    : <div style={{ ...styles.mini, ...styles.miniPlaceholder }}>{u.username[0].toUpperCase()}</div>
                  }
                  <div>
                    <p style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text)' }}>{u.username}</p>
                    <p style={{ fontSize: '12px', color: 'var(--subtext)' }}>{u.bio || 'No bio'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Right Icons */}
      <div style={styles.icons}>
        <div
  style={{
    ...styles.themeToggle,
    justifyContent: theme === 'dark' ? 'flex-end' : 'flex-start'
  }}
  onClick={toggleTheme}
>
  <div style={styles.themeThumb}>
    {theme === 'light' ? (
      <FiSun size={15} color="#FF9E20" />
    ) : (
      <FiMoon size={15} color="#215E61" />
    )}
  </div>
</div>
        {token ? (
  <>
    <Link to="/" style={styles.iconWrap}>
      <div style={styles.iconCircle}><FiHome size={20} /></div>
      <span style={styles.iconLabel}>Home</span>
    </Link>
    <Link to="/notifications" style={styles.iconWrap}>
      <div style={{ ...styles.iconCircle, position: 'relative' }}>
        <FiBell size={20} />
        {notifCount > 0 && <span style={styles.badge}>{notifCount}</span>}
      </div>
      <span style={styles.iconLabel}>Alerts</span>
    </Link>
    <Link to={`/profile/${user.id}`} style={styles.iconWrap}>
      <div style={styles.iconCircle}><FiUser size={20} /></div>
      <span style={styles.iconLabel}>Profile</span>
    </Link>
    <button style={{ ...styles.iconWrap, background: 'none', border: 'none' }} onClick={logout}>
      <div style={styles.iconCircle}><FiLogOut size={20} /></div>
      <span style={styles.iconLabel}>Logout</span>
    </button>
  </>
) : (
          <>
  <Link to="/login" style={{ ...styles.authBtn, background: 'var(--accent-grad)', color: 'white', border: 'none' }}>Log in</Link>
  <Link to="/register" style={styles.authBtn}>Sign up</Link>
</>
        )}
      </div>
    </nav>
  );
}

const styles = {
logo: {
  fontSize: '34px',
  fontWeight: 900,
  fontFamily: "'Space Grotesk', sans-serif",
  color: '#FFFFFF',
  whiteSpace: 'nowrap',
  letterSpacing: '-1px',

  textShadow: `
    0 0 8px rgba(0, 0, 0, 0.88),
    0 0 18px rgba(255, 158, 32, 0.8),
    0 4px 10px rgba(68, 58, 82, 0.56)
  `,

  transition: 'all 0.3s ease',
  cursor: 'pointer'
},
nav: {
  position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, height: '72px',
background: 'linear-gradient(120deg, rgba(31, 153, 143, 0.51) 20%, rgba(29, 37, 51, 0.85) 45%, rgba(18, 43, 44, 0.85) 100%)',  backdropFilter: 'blur(16px)',
  borderBottom: '1px solid var(--border)',
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  padding: '0 24px', gap: '16px',
  boxShadow: '0 4px 20px rgba(0,0,0,0.25)'
},
  searchWrap: { position: 'relative', flex: 1, maxWidth: '280px' },
  searchBox: { display: 'flex', alignItems: 'center', background: 'rgba(244,242,242,0.12)', border: '1px solid rgba(244,242,242,0.25)', borderRadius: '10px', padding: '8px 12px', gap: '8px' },
  searchIcon: { color: 'rgba(244,242,242,0.7)', flexShrink: 0 },
searchInput: { border: 'none', background: 'transparent', outline: 'none', fontSize: '14px', color: '#F4F2F2', width: '100%' },
  dropdown: { 
    position: 'absolute', top: '44px', left: 0, right: 0, background: 'var(--card)', 
    border: '1px solid var(--border)', borderRadius: '12px', boxShadow: '0 8px 24px rgba(0,0,0,0.12)', 
    zIndex: 200, overflow: 'hidden' 
  },
  dropItem: { display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 14px', cursor: 'pointer', borderBottom: '1px solid var(--border)' },
  mini: { width: '36px', height: '36px', objectFit: 'cover', flexShrink: 0 },
  miniPlaceholder: { borderRadius: '50%', background: 'var(--brand-gradient)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '14px' },
  icons: { display: 'flex', alignItems: 'center', gap: '12px' },
themeToggle: {
  width: '58px',
  height: '30px',
  borderRadius: '999px',
  display: 'flex',
  alignItems: 'center',
  padding: '3px',
  cursor: 'pointer',

  background:
    'linear-gradient(135deg, rgba(33,94,97,.95), rgba(255,158,32,.95))',

  transition: 'all .35s ease',

  boxShadow:
    '0 4px 14px rgba(0,0,0,.25), inset 0 0 8px rgba(255,255,255,.15)'
},

themeThumb: {
  width: '24px',
  height: '24px',
  borderRadius: '50%',
  background: '#ffffff',

  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',

  transition: 'all .35s ease',

  boxShadow:
    '0 3px 10px rgba(0,0,0,.30)'
},  authBtn: { padding: '7px 16px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, border: '1px solid rgba(244,242,242,0.3)', color: '#F4F2F2', background: 'transparent', cursor: 'pointer' },
  // Active primary buttons get the absolute premium brand gradient setup
  signUpBtn: {
    padding: '8px 18px', borderRadius: '20px', fontSize: '14px', fontWeight: 600, 
    border: 'none', color: 'white', background: 'var(--brand-gradient)', 
    cursor: 'pointer', textDecoration: 'none', boxShadow: '0 4px 12px rgba(33, 94, 97, 0.2)',
    transition: 'transform 0.2s ease'
  },
  badge: { 
    position: 'absolute', top: '-2px', right: '-2px', background: 'var(--accent-amber)', 
    color: '#1D2128', borderRadius: '50%', width: '18px', height: '18px', 
    fontSize: '11px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 
  },
  iconWrap: {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: '3px',
  cursor: 'pointer',
  padding: '2px 4px'
},
iconCircle: {
  width: '40px',
  height: '40px',
  borderRadius: '50%',
  border: '1.5px solid rgba(255,158,32,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#FF9E20',
  transition: 'background 0.15s, transform 0.15s',
  background: 'rgba(255,158,32,0.08)'
},
iconLabel: {
  fontSize: '11px',
  fontWeight: 600,
  color: '#F4F2F2',
  letterSpacing: '0.2px'
},
};

export default Navbar;