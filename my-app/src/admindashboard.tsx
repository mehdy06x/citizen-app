import { useEffect, useState } from "react";
import Footer from "./footer";
import Header from "./header";
import './App.css';
import AdminSection from "./adminsection";
import './adminpage.css';
import { useNavigate } from 'react-router-dom';

const API_BASE = 'http://localhost:8000/api';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [verifying, setVerifying] = useState(true);
  const [stats, setStats] = useState({ total: 0, nouvelle: 0, in_progress: 0, solved: 0 });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    // verify that the stored access token actually grants access to the admin-only endpoint.
    // if not, redirect to the public connect page. This prevents non-admin users from
    // seeing the admin UI even briefly.
    const run = async () => {
      const access = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
      if (!access) {
        navigate('/connect');
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/reclamations/all/`, { headers: { Authorization: `Bearer ${access}` } });
        if (!res.ok) {
          // token not accepted for admin resources
          navigate('/connect');
          return;
        }
        // token is valid for admin endpoint
        setVerifying(false);
      } catch (err) {
        // network or other error — treat as no access for safety
        console.error('Admin verification failed', err);
        navigate('/connect');
      }
    };
    run();
  }, [navigate]);

  // fetch admin reports to compute dashboard stats
  useEffect(() => {
    const loadStats = async () => {
      setLoadingStats(true);
      const access = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
      if (!access) {
        setLoadingStats(false);
        return;
      }
      try {
        const res = await fetch(`${API_BASE}/reclamations/all/`, { headers: { Authorization: `Bearer ${access}` } });
        if (!res.ok) {
          setLoadingStats(false);
          return;
        }
        const data = await res.json();
        const totals = { total: 0, nouvelle: 0, in_progress: 0, solved: 0 };
        totals.total = Array.isArray(data) ? data.length : 0;
        if (Array.isArray(data)) {
          for (const r of data) {
            const s = (r.status || r.etat || '').toString().toLowerCase();
            if (s.includes('nouv') || s.includes('new') || s.includes('pas')) totals.nouvelle++;
            else if (s.includes('en') || s.includes('progress') || s.includes('encours') || s.includes('in_progress')) totals.in_progress++;
            else if (s.includes('solve') || s.includes('resol') || s.includes('résol')) totals.solved++;
          }
        }
        setStats(totals);
      } catch (err) {
        console.error('Failed to load admin stats', err);
      } finally {
        setLoadingStats(false);
      }
    };
    loadStats();
  }, [verifying]);

  // while verifying, render nothing (avoid exposing admin UI briefly)
  if (verifying) return null;

  return (
    <div>
      <Header/>
      <div className="admin-dashboard">
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px 16px', width: '100%' }}>
          <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end' }}>
            <button className="primary" onClick={() => {
            ['access','access_token','refresh','refresh_token','accessToken'].forEach(k => localStorage.removeItem(k));
            localStorage.removeItem('user_email');
            localStorage.removeItem('username');
            localStorage.removeItem('email');
            try { localStorage.removeItem('is_admin'); } catch (e) {}
            try { localStorage.removeItem('auth_checked'); } catch (e) {}
            try { window.dispatchEvent(new Event('auth-changed')); } catch (e) {}
            navigate('/connect');
            }}>Déconnecter</button>
          </div>
        </div>
        <div className="admin-stats">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <h2>Tableau de bord</h2>
          </div>
          <div className="stat-cards">
            <div className="stat-card">
              <div className="stat-number">{loadingStats ? '...' : stats.total}</div>
              <div className="stat-label">Total réclamations</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{loadingStats ? '...' : stats.nouvelle}</div>
              <div className="stat-label">Nouvelles</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{loadingStats ? '...' : stats.in_progress}</div>
              <div className="stat-label">En cours</div>
            </div>
            <div className="stat-card">
              <div className="stat-number">{loadingStats ? '...' : stats.solved}</div>
              <div className="stat-label">Résolues</div>
            </div>
          </div>
          <div className="admin-button-row" style={{ marginTop: 16 }}>
            <button className="primary" onClick={() => {
              // scroll to reports list inside AdminSection
              const el = document.getElementById('admin-reports-list');
              if (el) el.scrollIntoView({ behavior: 'smooth' });
              else window.location.hash = '#admin-reports-list';
            }}>Voir toutes les réclamations</button>
            <button className="secondary" onClick={() => navigate('/admin/users')}>
              Liste des utilisateurs
            </button>
            <button className="secondary" onClick={() => navigate('/admin/agents')}>
              Gestion des agents
            </button>
          </div>
        </div>
      </div>
      <AdminSection/>
      <Footer/>
    </div>
  )
}

