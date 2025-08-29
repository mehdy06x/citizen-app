import './secondpage.css';
import { useState } from 'react';

type ChangeEtatProps = {
  id?: number;
  etat: string;
  type?: string;
  content?: string;
  author?: string;
  onStatusChange: (newStatus: string) => void | Promise<void>;
  editable?: boolean;
};

export default function ChangeEtat(props: ChangeEtatProps) {
  const { etat, status, type, content, author, onStatusChange, editable = true } = props as any;
  const rawEtat = etat ?? status ?? '';
  // if backend returns an object for status (e.g. { label, name }), extract a sensible string
  let etatValue: string;
  if (rawEtat && typeof rawEtat === 'object') {
    etatValue = (rawEtat.label || rawEtat.name || rawEtat.state || rawEtat.status || '').toString();
  } else {
    etatValue = (rawEtat ?? '').toString();
  }
  const [showOptions, setShowOptions] = useState(false);
  const options = ["En cours de", "Résolue", "Pas encore"];
  // normalize many possible backend values to friendly French labels
  const VALUE_TO_LABEL: Record<string,string> = {
    'nouvelle': 'Pas encore',
    'new': 'Pas encore',
    'pas encore': 'Pas encore',
    'pas_encore': 'Pas encore',
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
          <h4 style={{fontWeight:700}}>{type ?? 'Lampadaire'}</h4>
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
              // render the same visual as the interactive button but disabled for read-only user view
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

  <p>{content ?? 'Avenue Oak, Près du Parc'}</p>
  {author && <p><strong>Par:</strong> {author}</p>}
  <p><span className='bold'>Dernière Mise à Jour</span></p>

      </div>
    </div>
  );
}
