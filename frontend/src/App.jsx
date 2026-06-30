import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Feed from './pages/Feed';
import Profile from './pages/Profile';
import Navbar from './components/Navbar';
import Notifications from './pages/Notifications';

function App() {
  const token = localStorage.getItem('token');
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'transparent' }}>        
        <Routes>
          <Route path="/" element={token ? <Feed /> : <Navigate to="/login" />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile/:id" element={<Profile />} />
          <Route path="/notifications" element={<Notifications />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;