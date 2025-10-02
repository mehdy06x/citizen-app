import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './header';
import Footer from './footer';
import api from '/src/citizen/api.js';
import AgentCreateForm from './AgentCreateForm';
import AgentDetailModal from './AgentDetailModal';
import './adminpage.css';

type Agent = {
  id: number;
  user: { id:number, username:string, email:string, first_name?:string, last_name?:string };
  cin?: string;
  phone_number?: string;
}

export default function AdminAgentsPage(){
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);
  // form state removed: use modal AgentCreateForm instead
  const [token, setToken] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<any>(null);
  const [pendingDelete, setPendingDelete] = useState<Agent | null>(null);
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();

  useEffect(()=>{
    const access = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
    if (!access) { navigate('/connect'); return; }
    setToken(access);
  }, [navigate]);

  useEffect(()=>{ if (token) fetchAgents(); }, [token]);

  async function fetchAgents(){
    setLoading(true);
    try{
      const res = await api.get('/api/agents/', { headers: { Authorization: `Bearer ${token}` } });
      setAgents(res.data || []);
    }catch(err){
      console.error('Failed to fetch agents', err);
      alert('Failed to fetch agents');
    }finally{ setLoading(false); }
  }

  // createAgent handled by AgentCreateForm modal

  // formatDate removed (not used)

  return (
    <div>
      <Header />
      <div className="background admin-background">
        <div className="admin-dashboard">
          <div className="admin-stats">
            <div className="users-hero">
              <div>
                <h1>Gestion des agents</h1>
                <p className="muted">Créez et gérez les agents qui interviendront sur le terrain.</p>
              </div>

              <div className="users-hero-top">
                <input className="user-search" placeholder="Rechercher un agent par nom ou email..." onChange={e => {
                  const q = e.target.value.toLowerCase().trim();
                  if (!q) return fetchAgents();
                  setAgents(prev => prev.filter(a => ((a.user.username||'') + (a.user.email||'') + (a.user.first_name||'') + (a.user.last_name||'')).toLowerCase().includes(q)));
                }} />
              </div>

              <div className="users-hero-actions">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <button className="secondary" onClick={() => navigate('/admin')}>← Dashboard</button>
                  <button className="primary" onClick={() => setShowCreate(true)}>Créer un agent</button>
                  <button className="primary" onClick={() => {
                    ['access','access_token','refresh','refresh_token','accessToken'].forEach(k => localStorage.removeItem(k));
                    try { window.dispatchEvent(new Event('auth-changed')); } catch (e) {}
                    navigate('/connect');
                  }}>Déconnecter</button>
                </div>
              </div>
            </div>

            <div>
              {loading ? (
                <div style={{ textAlign: 'center', padding: 40 }}><p>Chargement des agents...</p></div>
              ) : (
                <>
                  <div className="stat-cards" style={{ marginBottom: 20 }}>
                    <div className="stat-card">
                      <div className="stat-number">{agents.length}</div>
                      <div className="stat-label">Total Agents</div>
                    </div>
                    
                  </div>

                  {showCreate && (
                    <div style={{ position: 'fixed', left:0, top:0, right:0, bottom:0, background: 'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex: 9999 }}>
                      <div style={{ width: '95%', maxWidth: 920, background: '#fff', borderRadius: 8, padding: 12 }}>
                        <button onClick={() => setShowCreate(false)} style={{ float: 'right' }}>Fermer</button>
                        <AgentCreateForm token={token} onClose={() => { setShowCreate(false); fetchAgents(); }} onCreated={() => fetchAgents()} />
                      </div>
                    </div>
                  )}

                  {/* Inline create form removed: use modal AgentCreateForm triggered by "Créer un agent" button above */}

                  <div className="users-table">
                    <div className="table-header">
                      <div className="table-row">
                        <div className="table-cell"><strong>#</strong></div>
                        <div className="table-cell"><strong>Identifiant</strong></div>
                        <div className="table-cell"><strong>Nom de l'agent</strong></div>
                        <div className="table-cell"><strong>Email</strong></div>
                        <div className="table-cell"><strong>CIN</strong></div>
                        <div className="table-cell"><strong>Téléphone</strong></div>
                        <div className="table-cell"><strong>Nom complet</strong></div>
                        <div className="table-cell"><strong>Actions</strong></div>
                      </div>
                    </div>
                    <div className="table-body">
                      {agents.map((a, idx) => (
                        <div key={a.id} className="table-row">
                          <div className="table-cell">{idx + 1}</div>
                          <div className="table-cell id-cell">
                            <div className="avatar">{(a.user.first_name||a.user.last_name)?((a.user.first_name||'')[0] + (a.user.last_name||'')[0]).toUpperCase() : (a.user.username||'A')[0].toUpperCase()}</div>
                            <div className="id-value">{a.id}</div>
                          </div>
                          <div className="table-cell">{a.user.username}</div>
                          <div className="table-cell">{a.user.email}</div>
                          <div className="table-cell">{a.cin || '—'}</div>
                          <div className="table-cell">{a.phone_number || '—'}</div>
                          <div className="table-cell">{(a.user.first_name||'') + ' ' + (a.user.last_name||'')}</div>
                          <div className="table-cell">
                            <div className="actions-cell">
                              <button className="action-btn primary details-btn" onClick={() => setSelectedAgent(a)}>Details</button>
                                <button className="action-btn danger" onClick={() => setPendingDelete(a)} disabled={deleting}>Supprimer</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  {selectedAgent && (
                    <AgentDetailModal agent={selectedAgent} token={token} onClose={()=>setSelectedAgent(null)} />
                  )}

                  {pendingDelete && (
                    <div className="confirm-overlay">
                      <div className="confirm-box">
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <h3>Supprimer l'agent</h3>
                            <p style={{ margin: 0 }}>Voulez-vous vraiment supprimer <strong>{pendingDelete.user.username}</strong> ? Cette action est irréversible.</p>
                          </div>
                          <div style={{ marginLeft: 12 }}>
                            <div className="avatar" style={{ width:48, height:48, fontSize:18 }}>{(pendingDelete.user.first_name||pendingDelete.user.last_name)?((pendingDelete.user.first_name||'')[0] + (pendingDelete.user.last_name||'')[0]).toUpperCase() : (pendingDelete.user.username||'A')[0].toUpperCase()}</div>
                          </div>
                        </div>
                        <div className="confirm-actions">
                          <button className="action-btn ghost" onClick={() => setPendingDelete(null)} disabled={deleting}>Annuler</button>
                          <button className="action-btn danger" onClick={async () => {
                            if (!token) return alert('Vous devez être connecté');
                            try {
                              setDeleting(true);
                              await api.delete(`/api/agents/${pendingDelete.id}/`, { headers: { Authorization: `Bearer ${token}` } });
                              setPendingDelete(null);
                              fetchAgents();
                            } catch(err:any) {
                              console.error('Delete failed', err);
                              alert((err?.response?.data && JSON.stringify(err.response.data)) || 'Erreur suppression');
                            } finally { setDeleting(false); }
                          }} disabled={deleting}>{deleting ? 'Suppression...' : 'Supprimer'}</button>
                        </div>
                      </div>
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
