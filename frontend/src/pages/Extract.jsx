import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = 'http://localhost:5000';

const SAMPLE_TRANSCRIPT = `We do CNC machining — high-precision components for automotive and aerospace. Revenue is about 140 crore, we're growing maybe 15% year on year. We have about 320 people across two plants in Pune.

The thing that keeps me up at night is conversion. We get plenty of inquiries — maybe 40-50 a month — but our conversion to confirmed orders is terrible. Maybe 8 out of 50 actually convert. That's a 16% conversion rate. I want that at 30% within a year.

If our conversion hits 30%, we don't even need more leads. That alone takes us past 200 crore. And at 200 crore, we can justify the investment in the new 5-axis machines that open up the aerospace segment properly.

I've been running this company for 18 years. I'm an IIT Bombay mechanical engineer. My son Arjun joined two years ago after his MBA from ISB — he heads sales now. He's sharp, but he inherited a sales process that's basically a spreadsheet and phone calls.

We have SAP in production — runs well, took us three years to implement. But sales is still on Excel and gut feel. No CRM, no pipeline tracking, no structured follow-up. When I ask Arjun why we lost a quote, he can't tell me because nobody tracks it.

We actually tried to fix this a year ago. We bought a CRM — Zoho — and it sat unused for six months. The sales team said it was too much data entry. The real problem was we didn't have shorter review cycles — we set it up, told people to use it, and checked back three months later when nothing had changed. By then everyone had given up.

I need someone who can actually design how our quoting-to-conversion process should work. We're not missing technology — we tried that with Zoho and it didn't help. We're missing the process itself. Someone needs to sit with Arjun and his team and figure out where quotes die, why follow-ups don't happen, and build a system that makes the right behavior automatic.

The person doing this needs to be dedicated to it. Arjun can't do it — he's in customer meetings all day. I can't do it — I'm on the shop floor managing the 5-axis installation. We need someone whose only job for six months is to figure out our conversion process and make it run.

If we get this right, I can finally step back from the day-to-day. I want to focus on strategy — the aerospace play, the European certifications. But right now I'm chasing production schedules and quoting approvals. That's not where I should be spending my time.`;

export default function Extract() {
  const navigate = useNavigate();
  const [transcript, setTranscript] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [extractedData, setExtractedData] = useState(null);
  const [savedAccountId, setSavedAccountId] = useState(null);
  const [error, setError] = useState('');

  const handleExtract = async () => {
    setLoading(true);
    setError('');
    setExtractedData(null);
    setSavedAccountId(null);
    try {
      const { data } = await axios.post(`${API_BASE}/api/extract`, { transcript });
      if (data.success) {
        setExtractedData(data.data);
      } else {
        setError(data.error || 'Extraction failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Extraction failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    try {
      const { data } = await axios.post(
        `${API_BASE}/api/accounts/from-extraction`,
        extractedData
      );
      if (data.success) {
        setSavedAccountId(data.accountId);
        navigate(`/charter/${data.accountId}`);
      } else {
        setError(data.error || 'Save failed');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="extract-container">
      <h1>Extract Nodes from Transcript</h1>
      <p>
        Paste a founder conversation transcript below. The AI will classify it
        into CRM nodes and generate a Growth Charter.
      </p>

      <textarea
        value={transcript}
        onChange={(e) => setTranscript(e.target.value)}
        placeholder="Paste transcript here..."
      />

      <div style={{ marginTop: '12px', marginBottom: '16px' }}>
        <button
          type="button"
          className="btn-primary"
          onClick={() => setTranscript(SAMPLE_TRANSCRIPT)}
        >
          Load Sample Transcript
        </button>
      </div>

      <button
        type="button"
        className="btn-primary"
        onClick={handleExtract}
        disabled={loading || !transcript.trim()}
      >
        Extract Nodes
      </button>

      {loading && <p style={{ marginTop: '16px' }}>Extracting nodes with AI...</p>}
      {error && <div className="error-msg">{error}</div>}

      {extractedData && (
        <div style={{ marginTop: '32px' }}>
          <h2>Extracted Node Values — Review Before Saving</h2>
          <p>
            <strong>{extractedData.account?.companyName}</strong>
          </p>
          <p style={{ color: '#555' }}>{extractedData.account?.businessDescription}</p>

          <table className="node-review-table">
            <thead>
              <tr>
                <th>Node</th>
                <th>Value</th>
                <th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(extractedData.nodes || {})
                .filter(([, node]) => node != null && node.value != null)
                .map(([nodeId, node]) => (
                  <tr key={nodeId}>
                    <td>{nodeId}</td>
                    <td>{node.value}</td>
                    <td>{node.evidence}</td>
                  </tr>
                ))}
            </tbody>
          </table>

          <button
            type="button"
            className="btn-primary"
            style={{ marginTop: '20px' }}
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save and Generate Charter'}
          </button>
        </div>
      )}
    </div>
  );
}
