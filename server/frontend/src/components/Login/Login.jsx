import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../Header/Header';
import '../Dealers/Dealers.css';

function Login() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');
  const [password, setPassword] = useState('');
  const [busy,setBusy] = useState(false);
  const [error,setError] = useState('');
  async function login(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try {
      const res = await fetch('/djangoapp/login', {
        method:'POST', credentials:'same-origin',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({userName, password}),
      });
      const data = await res.json();
      if(!res.ok || data.status !== 'Authenticated') throw new Error('Invalid username or password');
      sessionStorage.setItem('username',data.userName);
      window.dispatchEvent(new Event('capstone-auth-changed'));
      navigate('/');
    } catch(err) {setError(err.message);} finally {setBusy(false);}
  }
  return <div className="cd-page"><Header /><main className="cd-shell cd-login-layout">
    <section className="cd-review-intro"><span className="cd-eyebrow">WELCOME BACK</span><h1>Good to see you again.</h1><p>Sign in to browse dealerships, compare reviews, and share your own experience.</p></section>
    <section className="cd-form-card cd-login-card"><h2>Log in to Cars Dealership</h2><p>Enter your account credentials to continue.</p>
      <form onSubmit={login}><label htmlFor="login-user">Username</label><input id="login-user" name="username" required autoComplete="username" value={userName} onChange={e=>setUserName(e.target.value)} placeholder="Your username" />
        <label htmlFor="login-password">Password</label><input id="login-password" name="password" type="password" required autoComplete="current-password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Your password" />
        {error && <div className="cd-notice cd-notice-error" role="alert">{error}</div>}
        <button type="submit" disabled={busy} className="cd-btn cd-btn-primary cd-submit-btn">{busy?'Signing in…':'Log in →'}</button>
      </form><p className="cd-form-footnote">New here? <Link to="/register">Create an account</Link></p>
    </section>
  </main></div>;
}
export default Login;
