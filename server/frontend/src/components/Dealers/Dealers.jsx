import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../Header/Header';
import './Dealers.css';

function Dealers() {
  const [dealers, setDealers] = useState([]);
  const [states, setStates] = useState([]);
  const [selectedState, setSelectedState] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    let active = true;
    fetch('/djangoapp/session', { credentials: 'same-origin' })
      .then(r => r.json())
      .then(d => { if(active) setUserName(d.authenticated ? d.userName : ''); })
      .catch(() => { if(active) setUserName(''); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    fetch('/djangoapp/get_dealers')
      .then(r => { if(!r.ok) throw new Error('Could not load dealership states'); return r.json(); })
      .then(d => { if(active) setStates(Array.from(new Set((d.dealers || []).map(x => x.state))).sort()); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true); setError('');
    const url = selectedState === 'All' ? '/djangoapp/get_dealers' : `/djangoapp/get_dealers/${encodeURIComponent(selectedState)}`;
    fetch(url)
      .then(r => { if(!r.ok) throw new Error('Unable to fetch dealerships. Confirm Express and MongoDB are running.'); return r.json(); })
      .then(d => { if(active) setDealers(d.dealers || []); })
      .catch(err => { if(active) setError(err.message); })
      .finally(() => { if(active) setLoading(false); });
    return () => { active = false; };
  }, [selectedState]);

  const visible = useMemo(() => dealers.filter(d => `${d.full_name} ${d.city} ${d.address} ${d.state}`.toLowerCase().includes(search.toLowerCase())), [dealers, search]);

  return <div className="cd-page">
    <Header />
    <section className="cd-hero">
      <div className="cd-shell cd-hero-content">
        <span className="cd-eyebrow cd-eyebrow-light">EXPLORE • COMPARE • REVIEW</span>
        <h1>Find a dealership <span>you can trust.</span></h1>
        <p>Explore dealerships across the United States, compare locations, and discover real customer experiences.</p>
        <div className="cd-hero-stats">
          <span><strong>50</strong> Dealerships</span><span className="cd-dot">•</span><span><strong>Customer</strong> reviews</span><span className="cd-dot">•</span><span><strong>All</strong> in one place</span>
        </div>
      </div>
    </section>
    <main className="cd-shell cd-main">
      <div className="cd-section-heading">
        <div><span className="cd-eyebrow">DEALERSHIP DIRECTORY</span><h2>Explore dealerships</h2><p>Browse dealers or filter by state to narrow your search.</p></div>
        {userName && <div className="cd-signedin" role="status">✓ Logged in as <strong>{userName}</strong> · You can review dealers</div>}
      </div>
      <div className="cd-filterbar">
        <label className="cd-search"><span aria-hidden="true">⌕</span><input aria-label="Search dealerships" placeholder="Search dealership or city..." value={search} onChange={e => setSearch(e.target.value)} /></label>
        <label className="cd-state-select"><span>State</span><select id="state-filter" aria-label="Filter dealerships by state" value={selectedState} onChange={e => setSelectedState(e.target.value)}><option value="All">All States</option>{states.map(state => <option value={state} key={state}>{state}</option>)}</select></label>
        <div className="cd-filtercount"><strong>{visible.length}</strong> dealerships</div>
      </div>
      {error && <div className="cd-notice cd-notice-error" role="alert">{error}</div>}
      {loading ? <div className="cd-loading">Loading dealerships…</div> :
        <div className="cd-table-wrap">
          <table className="cd-table"><thead><tr><th>DEALERSHIP</th><th>CITY</th><th>STATE</th><th>ADDRESS</th><th>ACTION</th></tr></thead><tbody>
            {visible.map(dealer => <tr key={dealer.id}>
              <td><Link className="cd-dealername" to={`/dealer/${dealer.id}`}><span className="cd-dealer-logo">{dealer.full_name.slice(0,1)}</span><span><strong>{dealer.full_name}</strong><small>Dealer #{String(dealer.id).padStart(3,'0')}</small></span></Link></td>
              <td>{dealer.city}</td><td><span className="cd-state-badge">{dealer.state}</span></td>
              <td>{dealer.address}<small className="cd-address-zip">{dealer.zip}</small></td>
              <td><div className="cd-actions"><Link to={`/dealer/${dealer.id}`} className="cd-row-link">View Details →</Link>{userName && <Link to={`/postreview/${dealer.id}`} className="cd-review-link">Review Dealer</Link>}</div></td>
            </tr>)}
          </tbody></table>
          {!visible.length && <div className="cd-empty">No dealerships match your search. Try a different state or keyword.</div>}
        </div>}
      <p className="cd-footer-note">Dealership information supplied for the IBM Cars Dealership Capstone.</p>
    </main>
  </div>;
}
export default Dealers;
