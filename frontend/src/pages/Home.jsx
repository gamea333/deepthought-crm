import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

function formatAddedDate(dateStr) {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [nodeCounts, setNodeCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [seedMessage, setSeedMessage] = useState(null);
  const [seedError, setSeedError] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

  const fetchAccounts = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/accounts`);
      setAccounts(data);

      const counts = {};
      await Promise.all(
        data.map(async (account) => {
          try {
            const { data: detail } = await axios.get(
              `${API_BASE}/api/accounts/${account._id}`
            );
            counts[account._id] = detail.nodes?.length ?? 0;
          } catch {
            counts[account._id] = 0;
          }
        })
      );
      setNodeCounts(counts);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleSeed = async () => {
    setSeeding(true);
    setSeedMessage(null);
    setSeedError(null);
    try {
      await axios.post(`${API_BASE}/api/seed`);
      setSeedMessage('Sureflow Formulations seeded successfully');
      await fetchAccounts();
    } catch (err) {
      setSeedError(err.response?.data?.error || err.message || 'Seed failed');
    } finally {
      setSeeding(false);
    }
  };

  return (
    <div className="home-container">
      <section className="home-actions">
        <h1 className="page-title">Accounts</h1>
        <div className="home-actions-buttons">
          <button
            type="button"
            className="btn-primary"
            onClick={handleSeed}
            disabled={seeding}
          >
            {seeding ? 'Seeding...' : 'Seed Sample Data'}
          </button>
          <Link to="/extract" className="btn-primary btn-link">
            Extract from Transcript
          </Link>
        </div>
        {seedMessage && <div className="success-msg">{seedMessage}</div>}
        {seedError && <div className="error-msg">{seedError}</div>}
      </section>

      <hr className="section-divider" />

      {loading ? (
        <p className="loading-text">Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon" aria-hidden="true">
            <svg viewBox="0 0 120 120" width="120" height="120" fill="none">
              <rect x="20" y="30" width="80" height="60" rx="4" stroke="#ccc" strokeWidth="2" />
              <line x1="32" y1="48" x2="88" y2="48" stroke="#ddd" strokeWidth="2" />
              <line x1="32" y1="62" x2="72" y2="62" stroke="#ddd" strokeWidth="2" />
              <line x1="32" y1="76" x2="60" y2="76" stroke="#ddd" strokeWidth="2" />
              <circle cx="90" cy="85" r="18" stroke="#1a1a1a" strokeWidth="2" />
              <line x1="102" y1="97" x2="112" y2="107" stroke="#1a1a1a" strokeWidth="2" />
            </svg>
          </div>
          <h2>No accounts yet</h2>
          <p>
            Get started by seeding sample data or extracting nodes from a founder
            transcript.
          </p>
        </div>
      ) : (
        <div className="accounts-list">
          {accounts.map((account) => (
            <div key={account._id} className="account-card">
              <div className="account-card-body">
                <h2 className="account-card-title">{account.companyName}</h2>
                <p className="account-card-desc">{account.businessDescription}</p>
                <div className="account-card-meta">
                  <span className="badge badge-nodes">
                    Nodes scored: {nodeCounts[account._id] ?? '—'}
                  </span>
                  <span className="account-date">
                    Added: {formatAddedDate(account.createdAt)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-primary btn-charter"
                onClick={() => navigate(`/charter/${account._id}`)}
              >
                View Growth Charter
                <span className="btn-arrow" aria-hidden="true">
                  →
                </span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
