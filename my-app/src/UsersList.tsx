import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from "./header";
import Footer from "./footer";
import './adminpage.css';

type User = {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  is_staff: boolean;
  is_superuser: boolean;
  date_joined?: string;
  // optional phone fields (backend may expose different names)
  phone?: string;
  phone_number?: string;
  phoneNum?: string;
  profile?: { phone?: string } | null;
};

const API_BASE = 'http://localhost:8000/api';

export default function UsersList() {
  const [users, setUsers] = useState<User[]>([]);
  const [agentUserIds, setAgentUserIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is admin and get token
    const access = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    if (!access) {
      navigate('/connect');
      return;
    }
    setToken(access);
  }, [navigate]);

  useEffect(() => {
    if (token) {
      fetchUsers();
      fetchAgents();
    }
  }, [token]);

  async function fetchAgents() {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE}/agents/`, { headers: { Authorization: `Bearer ${token}` } });
      if (!res.ok) return;
      const data = await res.json();
      const ids = (data || []).map((a:any) => a.user?.id).filter((n:any) => typeof n === 'number');
      setAgentUserIds(ids);
    } catch (e) {
      console.error('Failed to fetch agents', e);
    }
  }

  // Try to refresh access token using refresh token. Returns true when refreshed.
  async function refreshAccessToken(): Promise<boolean> {
    const refresh = localStorage.getItem('refresh') || localStorage.getItem('refresh_token');
    if (!refresh) return false;

    try {
      const res = await fetch(`${API_BASE}/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh })
      });
      if (!res.ok) {
        console.warn('Refresh token invalid, forcing logout', res.status);
        // remove tokens and return false so caller can force re-login
        ['access','access_token','refresh','refresh_token','accessToken'].forEach(k => localStorage.removeItem(k));
        try { localStorage.removeItem('is_admin'); } catch (e) {}
        try { window.dispatchEvent(new Event('auth-changed')); } catch (e) {}
        return false;
      }
      const data = await res.json();
      if (data && data.access) {
        localStorage.setItem('access', data.access);
        try { window.dispatchEvent(new Event('auth-changed')); } catch (e) {}
        setToken(data.access);
        return true;
      }
    } catch (e) {
      console.error('Failed to refresh token', e);
    }
    return false;
  }

  // Fetch users, attempt one refresh+retry when receiving 401
  async function fetchUsers(attempts = 0) {
    if (!token) return;

    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/users/all/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setUsers(data);
        return;
      }

      // handle non-ok responses
      if (res.status === 401 && attempts === 0) {
        // try refresh once
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          // retry once with new token
          return fetchUsers(attempts + 1);
        }
      }

      const txt = await res.text();
      console.error('Failed to fetch users', res.status, txt);
      if (res.status === 401 || res.status === 403) {
        alert('Accès non autorisé. Seuls les administrateurs peuvent voir cette page.');
        navigate('/connect');
      } else {
        alert(`Erreur lors du chargement des utilisateurs: ${res.status}`);
      }
    } catch (err) {
      console.error('Fetch error', err);
      alert('Erreur réseau lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserRole = (user: User) => {
    if (user.is_superuser) return 'Super Admin';
    if (user.is_staff) return 'Admin';
    if (agentUserIds.includes(user.id)) return 'Agent';
    return 'Utilisateur';
  };

  const getRoleColor = (user: User) => {
    if (user.is_superuser) return '#e74c3c';
    if (user.is_staff) return '#f39c12';
    if (agentUserIds.includes(user.id)) return '#2D9CDB';
    return '#27ae60';
  };

  return (
    <div>
      <Header />
  <div className="background admin-background">
        <div className="admin-dashboard">
          <div className="admin-stats">
            <div className="users-hero">
              <div>
                <h1>Utilisateurs</h1>
                <p className="muted">Gérez les comptes inscrits sur la plateforme — recherchez, filtrez et consultez les détails.</p>
              </div>

              <div className="users-hero-top">
                <input className="user-search" placeholder="Rechercher un utilisateur par nom ou email..." onChange={e => {
                  const q = e.target.value.toLowerCase().trim();
                  if (!q) return fetchUsers();
                  setUsers(prev => prev.filter(u => (u.username+u.email+u.first_name+u.last_name).toLowerCase().includes(q)));
                }} />
              </div>

              <div className="users-hero-actions">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button className="secondary" onClick={() => navigate('/admin')}>← Dashboard</button>
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
            </div>

            {/* users content (stats + table) */}
            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <p>Chargement des utilisateurs...</p>
                </div>
              ) : (
                <>
                  <div className="stat-cards" style={{ marginBottom: 20 }}>
                    <div className="stat-card">
                      <div className="stat-number">{users.length}</div>
                      <div className="stat-label">Total Utilisateurs</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{users.filter(u => u.is_staff || u.is_superuser).length}</div>
                      <div className="stat-label">Administrateurs</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{users.filter(u => !u.is_staff && !u.is_superuser).length}</div>
                      <div className="stat-label">Utilisateurs</div>
                    </div>
                  </div>

                  <div className="users-table">
                    <div className="table-header">
                      <div className="table-row">
                        <div className="table-cell"><strong>#</strong></div>
                        <div className="table-cell"><strong>ID</strong></div>
                        <div className="table-cell"><strong>Nom d'utilisateur</strong></div>
                        <div className="table-cell"><strong>Email</strong></div>
                        <div className="table-cell"><strong>Téléphone</strong></div>
                        <div className="table-cell"><strong>Nom complet</strong></div>
                        <div className="table-cell"><strong>Rôle</strong></div>
                        <div className="table-cell"><strong>Date d'inscription</strong></div>
                      </div>
                    </div>
                    <div className="table-body">
                      {users.map((user, idx) => (
                        <div key={user.id} className="table-row">
                          <div className="table-cell">{idx + 1}</div>
                          <div className="table-cell id-cell">
                            <div className="avatar">{(user.first_name||user.last_name)?((user.first_name||'')[0] + (user.last_name||'')[0]).toUpperCase() : (user.username||'U')[0].toUpperCase()}</div>
                            <div className="id-value">{user.id}</div>
                          </div>
                          <div className="table-cell">{user.username}</div>
                          <div className="table-cell">{user.email}</div>
                          <div className="table-cell">{user.phone || (user as any).profile?.phone || (user as any).phone_number || (user as any).phoneNum || '—'}</div>
                          <div className="table-cell">
                            {user.first_name || user.last_name 
                              ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
                              : '—'
                            }
                          </div>
                          <div className="table-cell">
                            <span 
                              style={{ 
                                color: getRoleColor(user),
                                fontWeight: 600,
                                padding: '4px 8px',
                                borderRadius: 4,
                                backgroundColor: getRoleColor(user) + '20'
                              }}
                            >
                              {getUserRole(user)}
                            </span>
                          </div>
                          <div className="table-cell">{formatDate(user.date_joined)}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {users.length === 0 && (
                    <div style={{ textAlign: 'center', padding: 40 }}>
                      <p>Aucun utilisateur trouvé.</p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}