import React, { useState } from "react";

export default function ShareLink({ url, rawUrl }) {
  const [copied, setCopied] = useState(false);

  async function copyToClipboard(text) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      // Reset message after 2s
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
      alert("Failed to copy");
    }
  }

  return (
    <div style={styles.container}>
      <h3>Share your paste</h3>

      {/* Normal Link */}
      <div style={styles.row}>
        <input
          type="text"
          readOnly
          value={url}
          style={styles.input}
        />
        <button
          onClick={() => copyToClipboard(url)}
          style={styles.button}
        >
          Copy
        </button>
      </div>

      {/* Raw Link */}
      <div style={styles.row}>
        <input
          type="text"
          readOnly
          value={rawUrl}
          style={styles.input}
        />
        <button
          onClick={() => copyToClipboard(rawUrl)}
          style={styles.button}
        >
          Copy Raw
        </button>
      </div>

      {/* Feedback */}
      {copied && <p style={styles.success}>Copied!</p>}
    </div>
  );
}

/* Simple inline styling */
const styles = {
  container: {
    marginTop: "20px",
    padding: "15px",
    border: "1px solid #ddd",
    borderRadius: "6px",
    maxWidth: "600px"
  },
  row: {
    display: "flex",
    gap: "8px",
    marginBottom: "10px"
  },
  input: {
    flex: 1,
    padding: "8px",
    fontSize: "14px"
  },
  button: {
    padding: "8px 12px",
    cursor: "pointer"
  },
  success: {
    color: "green",
    fontSize: "14px"
  }
};
