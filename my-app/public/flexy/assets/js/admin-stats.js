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
      const total = Array.isArray(data) ? data.length : 0;
      let nouvelle = 0, enprogress = 0, solved = 0;
      if (Array.isArray(data)) data.forEach(r => {
        const s = (r.status || '').toLowerCase();
        if (s.includes('nouv') || s.includes('new') || s.includes('pas')) nouvelle++;
        else if (s.includes('en') || s.includes('progress') || s.includes('encours') || s.includes('in_progress')) enprogress++;
        else if (s.includes('solve') || s.includes('resol') || s.includes('résol')) solved++;
      });
      const totalEl = document.getElementById('stat-total');
      if (totalEl) totalEl.textContent = total;
      const nouvEl = document.getElementById('stat-nouvelle');
      if (nouvEl) nouvEl.textContent = nouvelle;
      const inEl = document.getElementById('stat-enprogress');
      if (inEl) inEl.textContent = enprogress;
      const solEl = document.getElementById('stat-solved');
      if (solEl) solEl.textContent = solved;
    } catch (err) {
      console.error('admin-stats load error', err);
    }
  }

  // retry loading a few times in case SPA hasn't mounted or token set yet
  function startRetries(attemptsLeft) {
    loadStats();
    if (attemptsLeft > 0) {
      setTimeout(() => startRetries(attemptsLeft - 1), 1500);
    }
  }

  document.addEventListener('DOMContentLoaded', function() {
    startRetries(3);
  });
})();
