import { Routes, Route, Navigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Register from './components/Register/Register';
import LoginPanel from './components/Login/Login';
import Dealers from './components/Dealers/Dealers';
import Dealer from './components/Dealers/Dealer';
import PostReview from './components/Dealers/PostReview';

function Information({ type }) {
  const about = type === 'about';
  return (
    <div className="cd-page"><Header />
      <main className="cd-shell cd-info"><span className="cd-eyebrow">CARS DEALERSHIP</span>
        <h1>{about ? 'Making dealership decisions easier.' : 'Contact our team.'}</h1>
        <p>{about ? 'Explore real dealership listings, read customer experiences, and share your own review.' : 'Have feedback about Cars Dealership? We would love to hear it.'}</p>
        <a className="cd-btn cd-btn-primary" href="/">Explore dealerships →</a>
      </main>
    </div>
  );
}

function App() {
  return <Routes>
    <Route path="/" element={<Dealers />} />
    <Route path="/dealers" element={<Dealers />} />
    <Route path="/dealer/:id" element={<Dealer />} />
    <Route path="/postreview/:id" element={<PostReview />} />
    <Route path="/login" element={<LoginPanel />} />
    <Route path="/register" element={<Register />} />
    <Route path="/about" element={<Information type="about" />} />
    <Route path="/contact" element={<Information type="contact" />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>;
}
export default App;
