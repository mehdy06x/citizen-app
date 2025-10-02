import './secondpage.css';
import { useState } from 'react';
import api from '/src/citizen/api.js';
import { showToast } from './Toast';

type ChangeEtatProps = {
  id?: number;
  etat: string;
  photo?: any;
  type?: string;
  custom_type?: string;
  content?: string;
  author?: string;
  location?: string;
  created_at?: string;
  admin?: boolean;
  assigned_agent_email?: string;
  onStatusChange: (newStatus: string) => void | Promise<void>;
  editable?: boolean;
  rating?: number;
  rating_comment?: string;
  rating_submitted_at?: string;
  isAgentView?: boolean; // new prop: when true, hide the rating submission UI (agent view)
  onDelete?: (id: number) => void;
};

export default function ChangeEtat(props: ChangeEtatProps) {
  const { etat, status, type, content, author, location, created_at, onStatusChange, editable = true, photo, custom_type, rating, rating_comment, rating_submitted_at, onDelete } = props as any;
  
  // Rating state for user input
  const [ratingValue, setRatingValue] = useState(rating || 0);
  const [ratingComment, setRatingComment] = useState(rating_comment || '');
  const [submittingRating, setSubmittingRating] = useState(false);
  // normalize photo similar to other components
  let photoUrl: string | null = null;
  try {
    const raw = photo;
    if (raw) {
      if (typeof raw === 'string') photoUrl = raw;
      else if (raw.url) photoUrl = raw.url;
      if (photoUrl && !/^https?:\/\//.test(photoUrl)) {
        const base = (import.meta.env && import.meta.env.VITE_API_URL) || 'http://localhost:8000';
        photoUrl = base.replace(/\/$/, '') + '/' + photoUrl.replace(/^\//, '');
      }
    }
  } catch (e) { photoUrl = null; }
  const rawEtat = etat ?? status ?? '';
  // if backend returns an object for status (e.g. { label, name }), extract a sensible string
  let etatValue: string;
  if (rawEtat && typeof rawEtat === 'object') {
    etatValue = (rawEtat.label || rawEtat.name || rawEtat.state || rawEtat.status || '').toString();
  } else {
    etatValue = (rawEtat ?? '').toString();
  }
  const [showOptions, setShowOptions] = useState(false);
  const [showAssign, setShowAssign] = useState(false);
  const [agents, setAgents] = useState<any[]>([]);
  // assignment in-progress state not required currently
  const [selectedAgent, setSelectedAgent] = useState<number | null>(null);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [assignedLocal, setAssignedLocal] = useState<number | null>(null);
  const [assignedLocalLabel, setAssignedLocalLabel] = useState<string | null>(props.assigned_agent_email || null);
  const options = ["En cours de", "Résolue", "suspendu"];
  // normalize many possible backend values to friendly French labels
  const VALUE_TO_LABEL: Record<string,string> = {
  'nouvelle': 'suspendu',
  'new': 'suspendu',
  'pas encore': 'suspendu',
  'pas_encore': 'suspendu',
    'encours': 'En cours de',
    'en cours': 'En cours de',
    'en_cours': 'En cours de',
    'in_progress': 'En cours de',
    'en progress': 'En cours de',
    'solved': 'Résolue',
    'resolue': 'Résolue',
    'résolue': 'Résolue',
    'resolved': 'Résolue'
  };
  const key = (etatValue || '').toString().toLowerCase().trim();
  const currentLabel = (VALUE_TO_LABEL[key] ?? etatValue ?? 'État du report')?.toString();

  // derive a canonical category for styling and button logic
  const resolvedKeys = new Set(['solved','resolue','résolue','resolved']);
  const inProgressKeys = new Set(['encours','en cours','en_cours','in_progress','en progress','enprogress','en-cours']);
  const notYetKeys = new Set(['nouvelle','new','pas encore','pas_encore','pasencore','not_yet']);
  let statusCategory: 'resolved'|'in_progress'|'not_yet'|'unknown' = 'unknown';
  if (resolvedKeys.has(key)) statusCategory = 'resolved';
  else if (inProgressKeys.has(key)) statusCategory = 'in_progress';
  else if (notYetKeys.has(key)) statusCategory = 'not_yet';

  function handleSelect(option: string) {
    onStatusChange(option);
    setShowOptions(false);
  }

    return (
    <div className='bgcolor'>
      <div className="lamptout">
        <div className='lampbutton'>
          <h4 style={{fontWeight:700}}>{(custom_type && custom_type.length) ? custom_type : (type ?? 'Lampadaire')}</h4>
          <div style={{ position: "relative" }}>
            {editable ? (
              <>
                <button
                  style={{
                    padding: "8px 20px",
                    borderRadius: 20,
                    background:
                      statusCategory === 'resolved' ? "#B1FAB3" :
                      statusCategory === 'in_progress' ? "#FFD580" :
                      statusCategory === 'not_yet' ? "#FFB3B3" :
                      currentLabel === 'État du report' ? "#eee" : "#fff",
                    color:
                      statusCategory === 'resolved' ? "#217a2c" :
                      statusCategory === 'in_progress' ? "#b26a00" :
                      statusCategory === 'not_yet' ? "#a80000" :
                      currentLabel === 'État du report' ? "#888" : "#58A0C8",
                    fontWeight: 500,
                    cursor: "pointer",
                    minWidth: 120,
                    transition: "background 0.2s, color 0.2s",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    textAlign: "center"
                  }}
                  onClick={() => setShowOptions((v) => !v)}
                >
                  {statusCategory === 'unknown' ? "État du report (à définir)" : currentLabel}
                </button>
                {showOptions && (
                  <div style={{
                    position: "absolute", top: "110%", left: 0, background: "#fff", borderRadius: 10, boxShadow: "0 2px 8px rgba(0,0,0,0.08)", zIndex: 10
                  }}>
                    {options.map(option => (
                      <div
                        key={option}
                        style={{ padding: "8px 24px", cursor: "pointer", color: "#2D2B2B", fontWeight: 500 }}
                        onClick={() => handleSelect(option)}
                        onMouseDown={e => e.preventDefault()}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <button
                disabled
                aria-disabled
                style={{
                  padding: "8px 20px",
                  borderRadius: 20,
                  minWidth: 120,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  textAlign: "center",
                  background:
                    statusCategory === 'resolved' ? "#B1FAB3" :
                    statusCategory === 'in_progress' ? "#FFD580" :
                    statusCategory === 'not_yet' ? "#FFB3B3" :
                    currentLabel === 'État du report' ? "#eee" : "#fff",
                  color:
                    statusCategory === 'resolved' ? "#217a2c" :
                    statusCategory === 'in_progress' ? "#b26a00" :
                    statusCategory === 'not_yet' ? "#a80000" :
                    currentLabel === 'État du report' ? "#888" : "#58A0C8",
                  fontWeight: 500,
                  cursor: "default",
                  border: "none"
                }}
              >
                {statusCategory === 'unknown' ? "État du report (à définir)" : currentLabel}
              </button>
            )}
          </div>
        </div>

        {photoUrl && (
          <div style={{display:'flex', justifyContent:'flex-start', alignItems: 'flex-start', marginTop:12, marginBottom:12}}>
            <img src={photoUrl} alt="mini" className="card-thumb" />
          </div>
        )}

        <p style={{marginTop:8}}>{content ?? 'Avenue Oak, Près du Parc'}</p>
        {/* show author above date */}
        <p><strong>Par :</strong> {author ?? '—'}</p>
        <p><span className='bold'>date :</span> {created_at ? new Date(created_at).toLocaleString(undefined, {year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit'}) : ''}</p>
        {/* assigned label is shown on the main assign button now (removed inline paragraph) */}
        {/* admin view: show location separately; otherwise keep previous behaviour */}
        {props.admin ? (
          <p><strong>Localisation :</strong> {location ?? '—'}</p>
        ) : (
          <p><strong>Localisation :</strong> {location ?? '—'}</p>
        )}

        {/* Admin-only: Assign button */}
        {props.admin && (
          <div style={{ marginTop: 8 }}>
            <button className={"assign-main-btn" + (assignedLocalLabel ? ' assigned' : '')} onClick={async () => {
              setShowAssign(true);
              try {
                const token = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
                const res = await api.get('/api/agents/', { headers: { Authorization: `Bearer ${token}` } });
                setAgents(res.data || []);
              } catch (err) {
                console.error('Failed to fetch agents', err);
                showToast({ type: 'error', message: 'Erreur lors du chargement des agents' });
                setAgents([]);
              }
            }}>{assignedLocalLabel ? `Assigné à : ${assignedLocalLabel}` : 'Assigner à un agent'}</button>
          </div>
        )}

  {/* Rating section for resolved reclamations (only show to non-admin non-agent author view) */}
  {statusCategory === 'resolved' && !props.admin && !props.isAgentView && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed #ddd' }}>
            <p style={{ marginBottom: 8, fontWeight: 600 }}>Évaluer cette réclamation :</p>
            <div style={{ display: 'flex', gap: 6, marginBottom: 8, marginLeft: 26 }}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRatingValue(star)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    fontSize: 22,
                    cursor: 'pointer',
                    color: star <= ratingValue ? '#f5b301' : '#bbb'
                  }}
                >
                  ★
                </button>
              ))}
            </div>
            <textarea
              value={ratingComment}
              onChange={(e) => setRatingComment(e.target.value)}
              placeholder="Laisser un commentaire (facultatif)"
              style={{
                width: '100%',
                minHeight: 80,
                marginBottom: 8,
                padding: 8,
                border: '1px solid #ddd',
                borderRadius: 4
              }}
            />
            <button
              disabled={submittingRating}
              onClick={async () => {
                setSubmittingRating(true);
                try {
                  const token = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
                  await api.patch(`/api/reclamations/${props.id}/rating/`, {
                    rating: ratingValue,
                    rating_comment: ratingComment
                  }, {
                    headers: { Authorization: `Bearer ${token}` }
                  });
                  alert('Merci pour votre évaluation !');
                } catch (error) {
                  console.error('Error submitting rating:', error);
                  alert('Erreur lors de l\'envoi de l\'évaluation');
                } finally {
                  setSubmittingRating(false);
                }
              }}
              style={{
                background: '#58a0c8',
                color: '#fff',
                border: 'none',
                padding: '8px 12px',
                borderRadius: 6,
                cursor: submittingRating ? 'not-allowed' : 'pointer',
                opacity: submittingRating ? 0.6 : 1
              }}
            >
              {submittingRating ? 'Envoi...' : 'Soumettre l\'évaluation'}
            </button>
          </div>
        )}

        {/* Admin view: always display an evaluation section (show content if available) */}
        {props.admin && (
          <div style={{ marginTop: 16, paddingTop: 12, borderTop: '1px dashed #ddd' }}>
            <p style={{ fontWeight: 600 }}>Évaluation client :</p>
            {rating ? (
              <>
                <div style={{ display: 'flex', gap: 2, marginBottom: 4, marginLeft: 26 }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} style={{ color: star <= rating ? '#f5b301' : '#bbb', fontSize: 18 }}>★</span>
                  ))}
                  <span style={{ marginLeft: 8, color: '#666' }}>({rating}/5)</span>
                </div>
                {rating_comment && <p style={{ fontStyle: 'italic', color: '#666' }}>&quot;{rating_comment}&quot;</p>}
                {rating_submitted_at ? (
                  <p style={{ fontSize: 12, color: '#999' }}>
                    Évalué le {new Date(rating_submitted_at).toLocaleString(undefined, { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </p>
                ) : null}
              </>
            ) : (
              <p style={{ color: '#666', fontStyle: 'italic' }}>Aucune évaluation.</p>
            )}
            {/* debug block removed */}
          </div>
        )}
        {/* Prominent bottom-right delete button for admins */}
        {props.admin && props.id && (
          <div style={{ position: 'absolute', bottom: 8, right: 8 }}>
            <DeleteButton id={props.id} onDelete={onDelete} />
          </div>
        )}
        {/* Assign modal */}
        {showAssign && (
          <div className="assign-overlay">
            <div className="assign-box">
              <h4>Assigner la réclamation</h4>
              <div style={{ marginTop: 8 }}>
                {agents.length === 0 ? <p>Aucun agent trouvé.</p> : (
                  <ul className="assign-list">
                    {agents.map(a => (
                      <li key={a.id}>
                        <div className="agent-meta">
                          <strong>{a.user.username}</strong>
                          <small>{a.user.email} {a.cin ? '— ' + a.cin : ''}</small>
                        </div>
                        <div className="agent-actions">
                          <button
                            className={("agent-select-btn " + (selectedAgent === a.user.id ? 'selected' : '')) + (assignedLocal !== null && String(assignedLocal) === String(a.user.id) ? ' assigned' : '')}
                            onClick={async () => {
                              // Immediately show assigned locally when selecting an agent
                              setAssignedLocal(a.user.id);
                              setAssignedLocalLabel(a.user.email || a.user.username || String(a.user.id));
                              setSelectedAgent(a.user.id);
                              try {
                                setAssigningId(a.user.id);
                                const token = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
                                await api.patch(`/api/reclamations/${props.id}/`, { assigned_to: a.user.id }, { headers: { Authorization: `Bearer ${token}` } });
                                // show toast and keep assignedLocal so the button reflects assignment immediately
                                showToast({ type: 'success', message: 'Assignation réussie' });
                                // small delay so user sees the 'Assigné' label before modal closes
                                await new Promise(res => setTimeout(res, 450));
                                setShowAssign(false);
                                // reload to refresh parent lists (keeps original behavior)
                                window.location.reload();
                              } catch (err) {
                                console.error('Assign error', err);
                                // revert immediate visual change on error
                                setAssignedLocal(null);
                                showToast({ type: 'error', message: 'Erreur lors de l\'assignation' });
                              } finally {
                                setAssigningId(null);
                              }
                            }}
                            disabled={assigningId !== null}
                          >
                            {String(assignedLocal) === String(a.user.id) ? 'Assigné' : (assigningId === a.user.id ? 'Assignation...' : 'Sélectionner')}
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="assign-footer">
                <button className="assign-close-btn" onClick={() => setShowAssign(false)}>Fermer</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function DeleteButton({ id, onDelete }: { id: number, onDelete?: (id:number)=>void }){
  const [deleting, setDeleting] = useState(false);
  return (
    <button
      className="delete-btn"
      aria-label="Supprimer la réclamation"
      title="Supprimer la réclamation"
      disabled={deleting}
      onClick={async () => {
        if (!confirm('Confirmer la suppression de cette réclamation ?')) return;
        setDeleting(true);
        try {
          const token = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
          await api.delete(`/api/reclamations/delete/${id}/`, { headers: { Authorization: `Bearer ${token}` } });
          alert('Réclamation supprimée');
          if (typeof onDelete === 'function') onDelete(id);
        } catch (err) {
          console.error('Delete error', err);
          alert('Erreur lors de la suppression');
        } finally {
          setDeleting(false);
        }
      }}
      style={{
        // inline fallback styles; main styling in adminpage.css
      }}
    >
      {deleting ? (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" opacity="0.2"/>
        </svg>
      ) : (
        // trash SVG
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 6h18" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M8 6v12a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M10 11v6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M14 11v6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}
