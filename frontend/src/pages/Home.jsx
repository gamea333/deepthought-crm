import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

export default function Home() {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seedMessage, setSeedMessage] = useState(null);
  const [seedError, setSeedError] = useState(null);
  const [seeding, setSeeding] = useState(false);
  const navigate = useNavigate();

  const fetchAccounts = async () => {
    try {
      const { data } = await axios.get(`${API_BASE}/api/accounts`);
      setAccounts(data);
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
      <h1>DeepThought — Growth Charter CRM</h1>

      <div style={{ marginBottom: '24px' }}>
        <button
          type="button"
          className="btn-primary"
          onClick={handleSeed}
          disabled={seeding}
        >
          {seeding ? 'Seeding...' : 'Seed Sample Data'}
        </button>
        {seedMessage && (
          <p style={{ color: 'green', marginTop: '12px' }}>{seedMessage}</p>
        )}
        {seedError && (
          <p style={{ color: 'red', marginTop: '12px' }}>{seedError}</p>
        )}
      </div>

      {loading ? (
        <p>Loading accounts...</p>
      ) : accounts.length === 0 ? (
        <p>No accounts found. Click Seed Sample Data to get started.</p>
      ) : (
        accounts.map((account) => (
          <div key={account._id} className="account-card">
            <div>
              <h2 style={{ margin: '0 0 8px', fontSize: '1.25rem' }}>
                {account.companyName}
              </h2>
              <p style={{ margin: 0, color: '#555' }}>
                {account.businessDescription}
              </p>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate(`/charter/${account._id}`)}
            >
              View Growth Charter
            </button>
          </div>
        ))
      )}
    </div>
  );
}
