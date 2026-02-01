import React, { useState } from 'react';

export default function CreatePaste() {
  const [content, setContent] = useState('');
  const [views, setViews] = useState('');
  const [ttl, setTtl] = useState('');
  const [result, setResult] = useState(null);
  const backend = import.meta.env.VITE_API_ORIGIN || 'https://pastebin-zvgm.onrender.com';

  async function handleSubmit(e) {
    e.preventDefault();
    const payload = { content };
    if (views) payload.expireAfterViews = parseInt(views, 10);
    if (ttl) payload.expireAfterSeconds = parseInt(ttl, 10);
    const res = await fetch(`${backend}/api/pastes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (res.ok) setResult(data);
    else setResult({ error: data });
  }

  return (
    <div>
      <h2>Create paste</h2>
      <form onSubmit={handleSubmit}>
        <textarea value={content} onChange={e=>setContent(e.target.value)} />
        <input placeholder="Expire after views (optional)" value={views} onChange={e=>setViews(e.target.value)} />
        <input placeholder="Expire after seconds (optional)" value={ttl} onChange={e=>setTtl(e.target.value)} />
        <button>Create</button>
      </form>

      {result && result.url && (
        <div>
          <p>Shareable link:</p>
          <a href={result.url} target="_blank" rel="noreferrer">{result.url}</a>
          <p>Raw: <a href={result.raw_url}>{result.raw_url}</a></p>
        </div>
      )}

      {result?.error && <pre>{JSON.stringify(result.error, null, 2)}</pre>}
    </div>
  );
}
