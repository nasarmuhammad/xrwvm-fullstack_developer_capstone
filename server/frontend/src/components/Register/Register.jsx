import React, { useState } from 'react';
import Header from '../Header/Header';
import './Register.css';

const initialForm = {
  userName: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
};

function Register() {
  const [form, setForm] = useState(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const update = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({ ...previous, [name]: value }));
    setError('');
  };

  const register = async (event) => {
    event.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError('');
    try {
      const response = await fetch('/djangoapp/register', {
        method: 'POST',
        credentials: 'same-origin',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 'Registered') {
        throw new Error(data.message || 'Registration failed. Please try again.');
      }
      setSuccess(true);
      setForm(initialForm);
    } catch (err) {
      setError(err.message || 'Could not register. Check your connection and retry.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="registration-page">
      <Header />
      <main className="registration-layout">
        <section className="registration-intro" aria-label="Welcome to Cars Dealership">
          <span className="registration-eyebrow">YOUR NEXT DRIVE STARTS HERE</span>
          <h1>Find the right dealership. <em>Drive with confidence.</em></h1>
          <p>Create your free account to explore local dealerships, save time, and share your experiences.</p>
          <div className="registration-feature"><span aria-hidden="true">✓</span> Discover dealerships by state</div>
          <div className="registration-feature"><span aria-hidden="true">✓</span> Read trusted customer reviews</div>
          <div className="registration-feature"><span aria-hidden="true">✓</span> Tell others about your experience</div>
        </section>
        <section className="registration-card" aria-labelledby="registration-heading">
          {success ? (
            <div className="registration-success" role="status">
              <div className="registration-success-icon" aria-hidden="true">✓</div>
              <h2 id="registration-heading">You're registered!</h2>
              <p>Your account was created successfully. Sign in to start reviewing dealerships.</p>
              <a className="registration-submit" href="/login">Continue to login</a>
            </div>
          ) : (
            <>
              <div className="registration-card-header">
                <span className="registration-card-tag">CREATE ACCOUNT</span>
                <h2 id="registration-heading">Join Cars Dealership</h2>
                <p>Fill in your details to get started.</p>
              </div>
              <form onSubmit={register} className="registration-form">
                <label htmlFor="register-username">Username</label>
                <input id="register-username" name="userName" type="text" autoComplete="username" minLength={3} maxLength={150} required value={form.userName} onChange={update} placeholder="Choose a username" />
                <div className="registration-name-row">
                  <div>
                    <label htmlFor="register-firstname">First Name</label>
                    <input id="register-firstname" name="firstName" type="text" autoComplete="given-name" maxLength={150} required value={form.firstName} onChange={update} placeholder="First name" />
                  </div>
                  <div>
                    <label htmlFor="register-lastname">Last Name</label>
                    <input id="register-lastname" name="lastName" type="text" autoComplete="family-name" maxLength={150} required value={form.lastName} onChange={update} placeholder="Last name" />
                  </div>
                </div>
                <label htmlFor="register-email">Email</label>
                <input id="register-email" name="email" type="email" autoComplete="email" required value={form.email} onChange={update} placeholder="you@example.com" />
                <label htmlFor="register-password">Password</label>
                <input id="register-password" name="password" type="password" autoComplete="new-password" minLength={8} required value={form.password} onChange={update} placeholder="At least 8 characters" />
                <p className="registration-hint">Use at least 8 characters for your password.</p>
                {error && <p className="registration-error" role="alert">{error}</p>}
                <button className="registration-submit" type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Creating account…' : 'Register'}
                </button>
                <p className="registration-login">Already have an account? <a href="/login">Log in</a></p>
              </form>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

export default Register;
