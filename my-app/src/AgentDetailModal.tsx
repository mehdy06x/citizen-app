import { useEffect, useState } from 'react';
import api from '/src/citizen/api.js';

type Agent = { id:number, user: { id:number, username:string, email:string, first_name?:string, last_name?:string }, cin?:string, phone_number?:string };
type Reclamation = { id:number, content?:string, type?:string, status?:string, created_at?:string, assigned_to?:number };

export default function AgentDetailModal({ agent, token, onClose } : { agent: Agent, token: string | null, onClose: ()=>void }){
  const [loading, setLoading] = useState(false);
  const [recs, setRecs] = useState<Reclamation[]>([]);
  const [counts, setCounts] = useState<Record<string,number>>({});

  useEffect(()=>{ if (!token) return; fetch(); }, [agent, token]);

  async function fetch(){
    setLoading(true);
    try{
      const res = await api.get('/api/reclamations/all/', { headers: { Authorization: `Bearer ${token}` } });
      const data: Reclamation[] = res.data || [];
      // assigned_to in reclamation is likely a user id; filter where assigned_to === agent.user.id
      const assigned = data.filter(r => r.assigned_to === agent.user.id);
      setRecs(assigned);
      const map: Record<string,number> = {};
      for (const r of assigned){
        const rr: any = r;
        const s = rr.status || rr.state || rr.state_name || 'unknown';
        map[s] = (map[s]||0) + 1;
      }
      setCounts(map);
    }catch(err){
      console.error('Failed to fetch reclamations for agent', err);
    }finally{ setLoading(false); }
  }

  const total = recs.length;
  const recent = recs.slice(0,5);

  return (
    <div style={{ position: 'fixed', left:0, top:0, right:0, bottom:0, background:'rgba(0,0,0,0.45)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:12000 }}>
      <div style={{ width: '95%', maxWidth: 820, background:'#fff', borderRadius:8, padding:16 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 style={{ margin:0 }}>{agent.user.username} — Détails</h3>
          <button onClick={onClose} style={{ background:'transparent', border:'none', fontSize:20 }}>×</button>
        </div>

        <div style={{ marginTop:12, display:'flex', gap:12 }}>
          <div style={{ flex:1 }}>
            <div style={{ display:'flex', gap:12, marginBottom:12 }}>
              <div style={{ padding:12, borderRadius:8, background:'#f3f7fb' }}>
                <div style={{ fontSize:20, fontWeight:700 }}>{total}</div>
                <div style={{ fontSize:12, color:'#555' }}>Total réclamations assignées</div>
              </div>
              <div style={{ padding:12, borderRadius:8, background:'#fff3f2' }}>
                <div style={{ fontSize:20, fontWeight:700 }}>{counts['solved'] || counts['resolved'] || 0}</div>
                <div style={{ fontSize:12, color:'#555' }}>Résolues</div>
              </div>
              <div style={{ padding:12, borderRadius:8, background:'#fff8e6' }}>
                <div style={{ fontSize:20, fontWeight:700 }}>{counts['en progress'] || counts['in_progress'] || counts['in progress'] || 0}</div>
                <div style={{ fontSize:12, color:'#555' }}>En cours</div>
              </div>
            </div>

            <h4 style={{ margin: '8px 0' }}>Dernières réclamations</h4>
            {loading ? <div>Chargement...</div> : (
              recent.length ? (
                <ul>
                  {recent.map(r => (
                    <li key={r.id} style={{ marginBottom:6 }}>
                      <strong>#{r.id}</strong> — {r.type || r.content?.slice(0,40) || '—'} <span style={{ color:'#666' }}>({r.status||'—'})</span>
                    </li>
                  ))}
                </ul>
              ) : <div>Aucune réclamation assignée.</div>
            )}
          </div>

          <div style={{ width:240, borderLeft:'1px solid #eee', paddingLeft:12 }}>
            <h4 style={{ marginTop:0 }}>Contact</h4>
            <div><strong>Email:</strong> {agent.user.email}</div>
            <div><strong>Téléphone:</strong> {agent.phone_number || '—'}</div>
            <div style={{ marginTop:12 }}>
              <button onClick={() => { /* future: implement message or reassign */ }} className="mr-submit">Voir les réclamations</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
