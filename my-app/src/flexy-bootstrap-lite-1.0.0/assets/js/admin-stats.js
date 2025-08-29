// admin-stats.js
// Fetch admin reclamations and update the stat cards in the Flexy dashboard.
(function() {
  const API_BASE = 'http://localhost:8000/api';
  function readToken() {
    const keys = ['access', 'access_token', 'accessToken'];
    for (const k of keys) {
      const t = localStorage.getItem(k);
      if (t) return t;
    }
    return null;
  }

  async function loadStats() {
    const token = readToken();
    if (!token) return; // not logged in
    try {
      const res = await fetch(`${API_BASE}/reclamations/all/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) return;
      const data = await res.json();
      const total = data.length || 0;
      let nouvelle = 0, enprogress = 0, solved = 0;
      data.forEach(r => {
        const s = (r.status || '').toLowerCase();
        if (s === 'nouvelle') nouvelle++;
        else if (s === 'en progress') enprogress++;
        else if (s === 'solved') solved++;
      });
      document.getElementById('stat-total').textContent = total;
      document.getElementById('stat-nouvelle').textContent = nouvelle;
      document.getElementById('stat-enprogress').textContent = enprogress;
      document.getElementById('stat-solved').textContent = solved;
    } catch (err) {
      // silent fail
      console.error('admin-stats load error', err);
    }
  }

  function wireViewAll() {
    const btn = document.getElementById('admin-view-all');
    if (!btn) return;
    btn.addEventListener('click', function() {
      const target = document.getElementById('admin-reports-list');
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        // If admin reports list is in React route, navigate there
        // If running inside SPA, use window.location to change path
        if (window.location.pathname !== '/admin') {
          window.location.href = '/admin';
        }
      }
    });
  }

  // retry loading a few times in case SPA hasn't mounted or token set yet
  function startRetries(attemptsLeft) {
    loadStats();
    wireViewAll();
    if (attemptsLeft > 0) {
      setTimeout(() => startRetries(attemptsLeft - 1), 1500);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    startRetries(3);
  });
})();
