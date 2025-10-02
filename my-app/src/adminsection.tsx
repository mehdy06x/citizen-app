
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangeEtat from './changeEtat';
import './secondpage.css';
import './adminpage.css';

type RemoteReport = {
  id: number;
  status: string;
  type?: string;
  content: string;
  author_username?: string;
  created_at?: string;
  created?: string;
};

const API_BASE = 'http://localhost:8000/api';

export default function AdminSection() {
  const [reports, setReports] = useState<RemoteReport[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // read token from localStorage on mount
    if (!token) {
      const possibleKeys = ['access', 'access_token', 'accessToken'];
      for (const k of possibleKeys) {
        const t = localStorage.getItem(k);
        if (t) {
          setToken(t);
          return;
        }
      }
    } else {
      fetchReports();
    }
  }, [token]);

  // keep token state in sync with storage and auth events
  useEffect(() => {
    function onAuthChanged() {
      const possibleKeys = ['access', 'access_token', 'accessToken'];
      let found: string | null = null;
      for (const k of possibleKeys) {
        const t = localStorage.getItem(k);
        if (t) { found = t; break; }
      }
      setToken(found);
    }
    window.addEventListener('storage', onAuthChanged);
    window.addEventListener('auth-changed', onAuthChanged);
    return () => {
      window.removeEventListener('storage', onAuthChanged);
      window.removeEventListener('auth-changed', onAuthChanged);
    };
  }, []);

  async function fetchReports() {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/reclamations/all/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      } else {
        const txt = await res.text();
        console.error('Failed to fetch reports', res.status, txt);
        alert(`Failed to fetch reports: ${res.status} - ${txt}`);
        // if unauthorized, redirect to login
        if (res.status === 401 || res.status === 403) navigate('/connect');
      }
    } catch (err) {
      console.error('Fetch error', err);
      alert('Network error while fetching reports');
    }
  }

  const STATUS_LABELS: Record<string, string> = {
  'nouvelle': 'suspendu',
    'en progress': 'En cours de',
    'solved': 'Résolue'
  };
  const LABEL_TO_VALUE: Record<string, string> = {
  'suspendu': 'nouvelle',
    'En cours de': 'en progress',
    'Résolue': 'solved'
  };

  async function handleStatusChange(id: number, newDisplayStatus: string) {
    if (!token) return alert('Please login as admin first');
    const backendStatus = LABEL_TO_VALUE[newDisplayStatus];
    if (!backendStatus) return alert('Invalid status selected');
    try {
      const res = await fetch(`${API_BASE}/reclamations/${id}/`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: backendStatus })
      });
      if (res.ok) {
        const updated = await res.json();
        setReports(rs => rs.map(r => r.id === id ? { ...r, status: updated.status } : r));
      } else {
        const txt = await res.text();
        console.error('Failed to update status', res.status, txt);
        alert(`Failed to update status: ${res.status} - ${txt}`);
      }
    } catch (err) {
      console.error('Network error', err);
      alert('Network error while updating status');
    }
  }

  // logout is handled by the global AuthButton

  const filteredReports = filter === 'all' ? reports.slice() : reports.filter(r => r.status === filter);
  // no sorting UI — keep original fetch order or server-provided ordering

  return (
    <>
      <div className="background">
        <div className="nrecltitle">
          <h4>Les Reclamations :</h4>
          <p> l'état des demandes soumises </p>
        </div>

        {!token && (
          <div style={{ marginBottom: 16 }}>
            <p>Vous n'êtes pas connecté. Seuls les administrateurs autorisés peuvent voir cette page.</p>
            <button onClick={() => navigate('/connect')}>Aller à la page de connexion admin</button>
          </div>
        )}

  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="filter-reports">
            <button className={"filter-tout" + (filter === "all" ? " active" : "")} onClick={() => setFilter("all")}>Tout</button>
            <button className={"filter-encours" + (filter === "en progress" ? " active" : "")} onClick={() => setFilter("en progress")}>{STATUS_LABELS['en progress']}</button>
            <button className={"filter-resolue" + (filter === "solved" ? " active" : "")} onClick={() => setFilter("solved")}>{STATUS_LABELS['solved']}</button>
            <button className={"filter-pasencore" + (filter === "nouvelle" ? " active" : "")} onClick={() => setFilter("nouvelle")}>{STATUS_LABELS['nouvelle']}</button>
          </div>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div>
              {/* auth control removed per request */}
            </div>
          </div>
        </div>

  <div id="admin-reports-list">
    {filteredReports.map(r => (
  <ChangeEtat
        key={r.id}
        id={r.id}
        etat={r.status}
  type={r.type}
  custom_type={(r as any).custom_type}
        content={r.content}
        // @ts-ignore
        author={r.author_username}
        photo={(r as any).photo}
        location={(r as any).location}
        rating={(r as any).rating}
        rating_comment={(r as any).rating_comment}
        rating_submitted_at={(r as any).rating_submitted_at}
        admin={true}
        assigned_agent_email={(r as any).assigned_agent_email}
        onDelete={(id:number) => setReports(rs => rs.filter(x => x.id !== id))}
        created_at={r.created_at || r.created}
        onStatusChange={newStatus => handleStatusChange(r.id, newStatus)}
      />
    ))}
  </div>

  <div className='show-all-reports-button-container'>
          <button className="show-all-reports-button" onClick={fetchReports}>
            afficher toutes les réclamations
          </button>
        </div>
      </div>
    </>
  );
}
