import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function ViewPaste() {
  const { id } = useParams();
  const [paste, setPaste] = useState();
  const backend = import.meta.env.VITE_API_ORIGIN || 'https://pastebin-zvgm.onrender.com';

  useEffect(() => {
    (async () => {
      const res = await fetch(`${backend}/api/pastes/${id}`);
      if (res.status === 200) {
        const data = await res.json();
        setPaste(data);
      } else if (res.status === 410) {
        setPaste({ error: 'This paste has expired.' });
      } else {
        setPaste({ error: 'Not found or server error.' });
      }
    })();
  }, [id]);

  if (!paste) return <div>Loading...</div>;
  if (paste.error) return <div>{paste.error}</div>;
  return (
    <div>
      <h2>Paste {paste.id}</h2>
      <pre style={{ whiteSpace:'pre-wrap' }}>{paste.content}</pre>
      <p>Remaining views: {paste.remaining_views ?? 'unlimited'}</p>
      <p>Expires at: {paste.expires_at ?? 'never'}</p>
    </div>
  );
}
