import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ChangeEtat from './changeEtat';
import api from '/src/citizen/api.js';
import './secondpage.css'

export default function Reports() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);

  useEffect(() => { fetchReports(); }, []);

  async function fetchReports() {
    try {
      const res = await api.get('/api/reclamations/list/');
      setReports(res.data || []);
    } catch (err) {
      console.error('Failed to fetch user reports', err);
      setReports([]);
    }
  }

  // users cannot delete reports from this view; delete functionality removed for read-only user list

  return (
    <div className="background">
      <div className="again">
        <div className="nrecltitle">
          <h4>Mes Reclamations :</h4>
          <p>Suivez l'état de vos demandes soumises</p>
        </div>
        <div className="nreclbtn">
          <button onClick={() => navigate('/make-report', { state: { fromSecondPage: true } })} className="custom-link">Nouvelle Reclamation</button>
        </div>
      </div>

      <div className="terc">
        <button onClick={() => fetchReports()}>Actualiser</button>
      </div>

      <div style={{marginTop:16}}>
        {reports.length === 0 ? (
          <p>Aucune réclamation trouvée.</p>
        ) : (
          reports.map((r:any) => (
            <div key={r.id} style={{ marginBottom: 12 }}>
              <ChangeEtat
                id={r.id}
                etat={r.status || r.etat || r.state || r.status_label}
                photo={r.photo}
                location={r.location}
                type={r.type}
                custom_type={(r as any).custom_type}
                content={r.description || r.content}
                author={r.author || r.username}
                created_at={r.created_at || r.created}
                rating={(r as any).rating}
                rating_comment={(r as any).rating_comment}
                rating_submitted_at={(r as any).rating_submitted_at}
                editable={false}
                onStatusChange={async () => { /* no-op */ }}
              />
              {/* read-only: no delete button for users */}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
