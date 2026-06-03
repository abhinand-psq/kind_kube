import { useState, useEffect } from 'react';

function App() {
  const baseUrl = import.meta.env.BACKEND_URL || 'http://localhost:5000';

  const [apiUrl, setApiUrl] = useState(`${baseUrl}/api/users`);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [status, setStatus] = useState({ state: 'idle', message: 'Ready to fetch data' });

  // Quick templates list
  const templates = [
    { name: 'Get Collections', url: `${baseUrl}/api/collections` },
    { name: 'Get Users', url: `${baseUrl}/api/users` },
    { name: 'Get Communities', url: `${baseUrl}/api/communities` },
    { name: 'Get Shops', url: `${baseUrl}/api/shops` }
  ];

  // Primary fetch handler
  const handleFetch = async (urlToFetch = apiUrl) => {
    setLoading(true);
    setError(null);
    setData(null);
    setStatus({ state: 'loading', message: 'Fetching from server...' });

    try {
      const response = await fetch(urlToFetch);
      const resData = await response.json();

      if (!response.ok) {
        throw new Error(resData?.error || `HTTP error! Status: ${response.status}`);
      }

      setData(resData);
      setStatus({ state: 'success', message: `Fetch successful (Status ${response.status})` });
    } catch (err) {
      setError(err.message);
      setStatus({ state: 'error', message: 'Connection or response failed' });
    } finally {
      setLoading(false);
    }
  };

  // Perform initial fetch on mount
  useEffect(() => {
    handleFetch();
  }, []);

  return (
    <>
      <h1>Mohalla Dynamic Client</h1>
      <p className="subtitle">Query your Express + MongoDB REST API dynamically in real time.</p>

      <div className="card">
        <h3>Server Endpoint Query Configuration</h3>
        
        {/* Templates selector */}
        <div className="templates">
          {templates.map((tpl, i) => (
            <span 
              key={i} 
              className="template-badge"
              onClick={() => {
                setApiUrl(tpl.url);
                handleFetch(tpl.url);
              }}
            >
              {tpl.name}
            </span>
          ))}
        </div>

        {/* Input Bar */}
        <div className="input-group">
          <input 
            type="text" 
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder="Enter API Endpoint (e.g. http://localhost:5000/api/users)"
          />
          <button onClick={() => handleFetch()} disabled={loading}>
            {loading ? 'Fetching...' : 'Query API'}
          </button>
        </div>
      </div>

      <div className="card">
        {/* Connection status header */}
        <div className="status-bar">
          <span>Active Request Status</span>
          <span className={`status-pill ${status.state}`}>
            {status.message}
          </span>
        </div>

        {/* Loading display */}
        {loading && <div className="loading">Retrieving records from cluster...</div>}

        {/* Error display */}
        {error && (
          <div style={{ color: 'var(--text-rose)', background: 'rgba(244, 63, 94, 0.08)', padding: '1rem', borderRadius: '10px', border: '1px solid rgba(244, 63, 94, 0.2)', fontFamily: 'var(--font-mono)' }}>
            Error: {error}
          </div>
        )}

        {/* Results display */}
        {data && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              <span>Data Payload Response</span>
              <span>
                {Array.isArray(data) ? `${data.length} item(s) found` : 'Object payload'}
              </span>
            </div>
            <pre className="results">
              <code>{JSON.stringify(data, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    </>
  );
}

export default App;
