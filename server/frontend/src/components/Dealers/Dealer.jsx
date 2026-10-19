import React, { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import Header from '../Header/Header';
import './Dealers.css';

const mood = sentiment => sentiment === 'positive' ? 'Positive' : sentiment === 'negative' ? 'Negative' : 'Neutral';
function Dealer() {
  const { id } = useParams();
  const location = useLocation();
  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => {
    let active = true;
    Promise.all([
      fetch(`/djangoapp/dealer/${id}`).then(r => {if(!r.ok) throw new Error('Dealer not found');return r.json();}),
      fetch(`/djangoapp/reviews/dealer/${id}`).then(r => {if(!r.ok) throw new Error('Could not load reviews');return r.json();}),
      fetch('/djangoapp/session', {credentials:'same-origin'}).then(r=>r.json()),
    ]).then(([detail, rev, session]) => {
      if(!active) return;
      setDealer((detail.dealer || [])[0] || null);
      setReviews(rev.reviews || []);
      setUserName(session.authenticated ? session.userName : '');
    }).catch(err => {if(active) setError(err.message);}).finally(() => {if(active) setLoading(false);});
    return () => {active=false;};
  }, [id]);
  return <div className="cd-page"><Header />
    <main className="cd-shell cd-main">
      <Link className="cd-back" to="/">← Back to all dealerships</Link>
      {location.search.includes('review_added=1') && <div className="cd-notice cd-notice-success" role="status">✓ Your review has been successfully submitted and is displayed below.</div>}
      {error && <div className="cd-notice cd-notice-error" role="alert">{error}</div>}
      {loading ? <div className="cd-loading">Loading dealership details…</div> : dealer && <>
        <div className="cd-detail-top">
          <div className="cd-detail-identity"><div className="cd-large-logo">{dealer.full_name[0]}</div><div><span className="cd-eyebrow">DEALERSHIP PROFILE · ID #{dealer.id}</span><h1>{dealer.full_name}</h1><p>⌖ {dealer.address}, {dealer.city}, {dealer.state} {dealer.zip}</p></div></div>
          {userName ? <Link className="cd-btn cd-btn-primary" to={`/postreview/${id}`}>✎ Review Dealer</Link> : <Link className="cd-btn cd-btn-primary" to="/login">Log in to review</Link>}
        </div>
        <div className="cd-review-heading"><div><span className="cd-eyebrow">CUSTOMER EXPERIENCES</span><h2>Customer reviews <span className="cd-review-count">{reviews.length}</span></h2></div><p>Learn what customers are saying about this dealership.</p></div>
        {reviews.length ? <div className="cd-review-grid">{reviews.map(review => <article className="cd-review-card" key={review.id || review._id}>
          <div className="cd-review-card-top"><span className="cd-review-stars">★★★★★</span><span className={`cd-sentiment cd-${mood(review.sentiment).toLowerCase()}`}>{mood(review.sentiment)} sentiment</span></div>
          <blockquote>“{review.review}”</blockquote>
          <div className="cd-review-card-bottom"><div className="cd-small-avatar">{(review.name || 'C')[0].toUpperCase()}</div><div><strong>{review.name}</strong><small>{review.car_make} {review.car_model} · {review.car_year}</small></div></div>
        </article>)}</div> : <div className="cd-empty">No reviews yet. Be the first to share your experience.</div>}
      </>}
    </main>
  </div>;
}
export default Dealer;
