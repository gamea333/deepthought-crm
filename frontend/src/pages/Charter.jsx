import { useEffect, useState } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import axios from 'axios';
import { marked } from 'marked';
import { renderCharter } from '../utils/renderCharter.js';

const API_BASE = 'http://localhost:5000';

export default function Charter() {
  const { id } = useParams();
  const location = useLocation();
  const [html, setHtml] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [generatedDate, setGeneratedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fromExtract = location.state?.fromExtract === true;

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
        setCompanyName(account.companyName || 'Growth Charter');
        setGeneratedDate(
          new Date().toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          })
        );
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
        <div className="loading-block">
          <div className="spinner" aria-label="Loading" />
          <p>Loading charter...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="home-container">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <p className="error-msg">{error}</p>
      </div>
    );
  }

  return (
    <div className="charter-page">
      <div className="charter-toolbar no-print">
        <Link to="/" className="back-link">
          ← Back
        </Link>
        <h1 className="charter-toolbar-title">{companyName}</h1>
        <div className="charter-toolbar-actions">
          {fromExtract && (
            <Link to="/extract" className="btn-secondary btn-link">
              ← Extract Another
            </Link>
          )}
          <button
            type="button"
            className="btn-primary"
            onClick={() => window.print()}
          >
            Print / Save as PDF
          </button>
        </div>
      </div>

      <div className="charter-wrapper">
        <div className="charter-generated-badge no-print">
          Generated on {generatedDate}
        </div>
        <div
          className="charter-container"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
    </div>
  );
}
