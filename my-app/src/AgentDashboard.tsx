import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '/src/citizen/api.js';
import ChangeEtat from './changeEtat';
import Button from './Button';

export default function AgentDashboard(){
  const [reports, setReports] = useState([]);
  const navigate = useNavigate();

  useEffect(()=>{ fetchAssigned(); }, []);

  async function fetchAssigned(){
    try{
      const token = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
      const res = await api.get('/api/reclamations/assigned/', { headers: { Authorization: `Bearer ${token}` } });
      setReports(res.data || []);
    }catch(err){
      console.error('Failed to fetch assigned', err);
      setReports([]);
    }
  }

  async function handleStatusChange(id:number, newStatus:string){
    // Agents can only change status (backend enforces). Map label to backend value similar to AdminSection
    const LABEL_TO_VALUE: any = { 'suspendu': 'nouvelle', 'En cours de': 'en progress', 'Résolue': 'solved' };
    const backendStatus = LABEL_TO_VALUE[newStatus];
    if(!backendStatus) return alert('Statut invalide');
    try{
      const token = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
      const res = await api.patch(`/api/reclamations/${id}/`, { status: backendStatus }, { headers: { Authorization: `Bearer ${token}` } });
      if(res.status === 200 || res.status === 204 || res.status === 201) {
        fetchAssigned();
      }
    }catch(err){ console.error('Failed to update', err); alert('Erreur lors de la mise à jour'); }
  }

  return (
    <div className="agent-dashboard-wrapper">
      {/* Top bar with Accueil (left) and Déconnecter (right), outside the white card */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 12, paddingLeft: 16, paddingRight: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div className="Acceuilbtn" style={{ paddingTop: 8 }}><Button name="Accueil" onClick={() => navigate('/')} /></div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center' }}>
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

      <div className="background" style={{ marginTop: 18 }}>
        <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center'}}>
          <div style={{display:'flex', alignItems:'center', gap:12}}>
            <h3 style={{ paddingRight: 24, paddingLeft: 20, color: '#58A0C8', margin: 0 }}>Mes réclamations assignées</h3>
          </div>
        </div>
      <div style={{marginTop:12}}>
        {reports.length === 0 ? <p>Aucune réclamation assignée.</p> : (
          reports.map((r:any) => (
            <div key={r.id} style={{marginBottom:12}}>
              <ChangeEtat
                id={r.id}
                etat={r.status}
                photo={r.photo}
                location={r.location}
                type={r.type}
                custom_type={r.custom_type}
                content={r.content}
                author={r.author_username}
                created_at={r.created_at}
                rating={r.rating}
                rating_comment={r.rating_comment}
                rating_submitted_at={r.rating_submitted_at}
                admin={false}
                editable={true}
                isAgentView={true}
                onStatusChange={newStatus => handleStatusChange(r.id, newStatus)}
              />
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
