import { Link, useLocation } from 'react-router-dom';

export default function Header() {
  const location = useLocation();

  return (
    <header className="app-header no-print">
      <div className="app-header-inner">
        <Link to="/" className="app-brand">
          <span className="app-logo">DeepThought</span>
          <span className="app-tagline">Growth Charter CRM</span>
        </Link>
        <nav className="app-nav">
          <Link
            to="/"
            className={location.pathname === '/' ? 'app-nav-link active' : 'app-nav-link'}
          >
            Accounts
          </Link>
          <Link
            to="/extract"
            className={
              location.pathname === '/extract' ? 'app-nav-link active' : 'app-nav-link'
            }
          >
            Extract
          </Link>
        </nav>
      </div>
    </header>
  );
}
