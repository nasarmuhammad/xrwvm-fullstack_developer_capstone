import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let active = true;
    const refresh = () => {
      fetch('/djangoapp/session', { credentials: 'same-origin' })
        .then(r => r.ok ? r.json() : null)
        .then(data => {
          if (active) {
            setUser(data && data.authenticated ? data : null);
            if (!data || !data.authenticated) sessionStorage.removeItem('username');
          }
        }).catch(() => { if (active) setUser(null); });
    };
    refresh();
    window.addEventListener('capstone-auth-changed', refresh);
    return () => { active = false; window.removeEventListener('capstone-auth-changed', refresh); };
  }, []);

  const logout = async () => {
    setBusy(true);
    try {
      const response = await fetch('/djangoapp/logout', {
        method: 'POST', credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' }, body: '{}',
      });
      if (!response.ok) throw new Error('Unable to log out');
      sessionStorage.removeItem('username');
      sessionStorage.removeItem('firstname');
      sessionStorage.removeItem('lastname');
      setUser(null);
      window.dispatchEvent(new Event('capstone-auth-changed'));
      navigate('/');
    } catch (error) { alert(error.message); }
    finally { setBusy(false); }
  };

  return <header className="cd-header">
    <nav className="cd-nav cd-shell" aria-label="Main navigation">
      <Link to="/" className="cd-brand"><span className="cd-brand-icon" aria-hidden="true">◆</span><span>Cars<span className="cd-brand-light">Dealership</span></span></Link>
      <div className="cd-nav-links">
        <Link to="/">Dealerships</Link>
        <Link to="/about">About</Link>
        <Link to="/contact">Contact</Link>
      </div>
      <div className="cd-nav-account">
        {user ? <>
          <span className="cd-welcome" title={user.userName}><span className="cd-avatar">{user.userName.slice(0,1).toUpperCase()}</span><strong>{user.userName}</strong></span>
          <button type="button" disabled={busy} onClick={logout} className="cd-btn cd-btn-outline cd-nav-button">{busy ? 'Signing out…' : 'Logout'}</button>
        </> : <>
          <Link className="cd-nav-signin" to="/login">Log in</Link>
          <Link className="cd-btn cd-btn-primary cd-nav-button" to="/register">Create account</Link>
        </>}
      </div>
    </nav>
  </header>;
};
export default Header;
