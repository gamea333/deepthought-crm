import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import { renderCharter } from '../utils/renderCharter.js';

const API_BASE = 'http://localhost:5000';

export default function Charter() {
  const { id } = useParams();
  const [html, setHtml] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCharter = async () => {
      try {
        const [accountRes, renderMapRes] = await Promise.all([
          axios.get(`${API_BASE}/api/accounts/${id}`),
          fetch('/render-map.json'),
        ]);

        const { account, nodes } = accountRes.data;
        const renderMap = await renderMapRes.json();
        const markdown = renderCharter(account, nodes, renderMap);
        setHtml(marked.parse(markdown));
      } catch (err) {
        setError(err.response?.data?.error || err.message || 'Failed to load charter');
      } finally {
        setLoading(false);
      }
    };

    loadCharter();
  }, [id]);

  if (loading) {
    return (
      <div className="home-container">
        <p>Loading charter...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <Link to="/">← Back to Accounts</Link>
        <p style={{ color: 'red' }}>{error}</p>
      </div>
    );
  }

  return (
    <div>
      <div className="home-container" style={{ marginBottom: 0 }}>
        <Link to="/">← Back to Accounts</Link>
      </div>
      <div
        className="charter-container"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}
