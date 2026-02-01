import React from "react";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";

import CreatePaste from "./pages/CreatePaste";
import ViewPaste from "./pages/ViewPaste";

export default function App() {
  return (
    <BrowserRouter>
      <div style={styles.app}>

        {/* Header */}
        <header style={styles.header}>
          <h2>
            <Link to="/" style={styles.logo}>
              PasteLite
            </Link>
          </h2>
        </header>

        {/* Main Content */}
        <main style={styles.main}>
          <Routes>

            {/* Home → Create */}
            <Route
              path="/"
              element={<CreatePaste />}
            />

            {/* View Paste */}
            <Route
              path="/p/:id"
              element={<ViewPaste />}
            />

            {/* 404 Page */}
            <Route
              path="*"
              element={<NotFound />}
            />

          </Routes>
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <p>PasteLite © 2026</p>
        </footer>

      </div>
    </BrowserRouter>
  );
}

/* 404 Component */
function NotFound() {
  return (
    <div>
      <h3>404 - Page Not Found</h3>
      <Link to="/">Go Home</Link>
    </div>
  );
}

/* Basic styling */
const styles = {
  app: {
    minHeight: "100vh",
    display: "flex",
    flexDirection: "column",
    fontFamily: "Arial, sans-serif"
  },

  header: {
    padding: "12px 20px",
    background: "#222",
    color: "#fff"
  },

  logo: {
    color: "#fff",
    textDecoration: "none"
  },

  main: {
    flex: 1,
    padding: "20px",
    maxWidth: "900px",
    margin: "0 auto"
  },

  footer: {
    textAlign: "center",
    padding: "10px",
    background: "#f2f2f2",
    fontSize: "14px"
  }
};
