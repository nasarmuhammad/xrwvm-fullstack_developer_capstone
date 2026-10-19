import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Header from '../Header/Header';
import './Dealers.css';

function PostReview() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [dealer, setDealer] = useState(null);
  const [models, setModels] = useState([]);
  const [authenticated, setAuthenticated] = useState(null);
  const [modelId, setModelId] = useState('');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [review, setReview] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/djangoapp/dealer/${id}`).then(r=>r.json()),
      fetch('/djangoapp/get_cars').then(r=>r.json()),
      fetch('/djangoapp/session',{credentials:'same-origin'}).then(r=>r.json()),
    ]).then(([d,c,s]) => {
      if(!active) return;
      setDealer((d.dealer || [])[0] || null);
      setModels(c.CarModels || []);
      setAuthenticated(Boolean(s.authenticated));
    }).catch(()=>{if(active){setError('Cannot load review form. Confirm Django is running.');setAuthenticated(false);}});
    return () => {active=false;};
  }, [id]);

  async function submit(event) {
    event.preventDefault();
    const car = models.find(m => String(m.id) === String(modelId));
    if (!car || review.trim().length < 5 || !purchaseDate) { setError('Please enter a review, purchase date and car model.'); return; }
    setBusy(true);setError('');
    try {
      const response = await fetch('/djangoapp/add_review', {
        method:'POST', credentials:'same-origin',
        headers:{'Content-Type':'application/json'},
        body:JSON.stringify({
          dealership:Number(id), review:review.trim(), purchase:true, purchase_date:purchaseDate,
          car_make:car.CarMake,car_model:car.CarModel,car_year:car.year,
        }),
      });
      const data = await response.json();
      if (!response.ok || data.status !== 200) throw new Error(data.message || 'Could not submit review');
      navigate(`/dealer/${id}?review_added=1`);
    } catch (err) {setError(err.message);} finally {setBusy(false);}
  }

  return <div className="cd-page"><Header /><main className="cd-shell cd-main cd-form-main">
    <Link className="cd-back" to={`/dealer/${id}`}>← Back to dealership details</Link>
    <div className="cd-form-layout">
      <section className="cd-review-intro"><span className="cd-eyebrow">SHARE YOUR EXPERIENCE</span><h1>Your voice helps others drive with confidence.</h1><p>Tell other car buyers what it was like to work with this dealership.</p><div className="cd-form-dealer"><span className="cd-dealer-logo">{dealer?.full_name?.[0] || 'D'}</span><span><strong>{dealer?.full_name || `Dealership #${id}`}</strong><small>{dealer ? `${dealer.city}, ${dealer.state}` : 'Loading dealership...'}</small></span></div></section>
      <section className="cd-form-card"><h2>Post a Review</h2><p>All fields are required. Your review will appear on this dealer's page.</p>
        {authenticated === false ? <div className="cd-notice cd-notice-error">You must be logged in to post a review. <Link to="/login">Log in</Link></div> : <form onSubmit={submit}>
          <label htmlFor="review-text">Your review</label><textarea id="review-text" required minLength={5} maxLength={2000} value={review} onChange={e=>setReview(e.target.value)} placeholder="Tell us about the service, staff, and your overall experience…" rows={6}/>
          <label htmlFor="purchase-date">Purchase Date</label><input id="purchase-date" type="date" required value={purchaseDate} onChange={e=>setPurchaseDate(e.target.value)} max={new Date().toISOString().slice(0,10)} />
          <label htmlFor="car-model">Car Make and Model</label><select id="car-model" value={modelId} required onChange={e=>setModelId(e.target.value)}><option value="">Select your car</option>{models.map(car=><option key={car.id} value={car.id}>{car.CarMake} {car.CarModel} ({car.year})</option>)}</select>
          {error && <div className="cd-notice cd-notice-error" role="alert">{error}</div>}
          <button disabled={busy || authenticated !== true} type="submit" className="cd-btn cd-btn-primary cd-submit-btn">{busy ? 'Posting your review…' : 'Submit Review →'}</button>
          <p className="cd-form-footnote">Your review is associated with your signed-in account.</p>
        </form>}
      </section>
    </div>
  </main></div>;
}
export default PostReview;
