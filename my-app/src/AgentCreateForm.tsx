import { useState, useEffect, useRef } from 'react';
import api from '/src/citizen/api.js';
import { showToast } from './Toast';
import './citizen/styles/makeReport.css';
import './citizen/styles/formRegister.css';

type Props = {
  onClose: () => void;
  onCreated?: () => void;
  token: string | null;
}

export default function AgentCreateForm({ onClose, onCreated, token }: Props){
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  
  const [cin, setCin] = useState('');
  const [phone, setPhone] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string,string>>({});
  const emailRef = useRef<HTMLInputElement | null>(null);

  async function submit(e?: any){
    if (e && e.preventDefault) e.preventDefault();
  const nextErrors: Record<string,string> = {};
  // Require all fields
  if (!username) { nextErrors.username = 'Nom d\'utilisateur requis'; showToast({ type: 'error', message: 'Nom d\'utilisateur requis' }); }
  if (!email) { nextErrors.email = 'Email requis'; showToast({ type: 'error', message: 'Email requis' }); }
  else if (!/^\S+@\S+\.\S+$/.test(email)) { nextErrors.email = 'Email invalide'; showToast({ type: 'error', message: 'Email invalide' }); }
  if (!password) { nextErrors.password = 'Mot de passe requis'; showToast({ type: 'error', message: 'Mot de passe requis' }); }
  if (!firstName) { nextErrors.firstName = 'Prénom requis'; showToast({ type: 'error', message: 'Prénom requis' }); }
  if (!cin) { nextErrors.cin = 'CIN requis'; showToast({ type: 'error', message: 'CIN requis' }); }
  if (!phone) { nextErrors.phone = 'Téléphone requis'; showToast({ type: 'error', message: 'Téléphone requis' }); }
  if (Object.keys(nextErrors).length) { setErrors(nextErrors); return; }
    setErrors({});
    setSubmitting(true);
    try{
      const payload = {
        user: { username: username || email, email: email, password: password, first_name: firstName },
        cin: cin,
        phone_number: phone
      };
  await api.post('/api/agents/', payload, { headers: { Authorization: `Bearer ${token}` } });
      showToast({ type: 'success', message: 'Agent créé avec succès' });
      // call parent callbacks to refresh and close modal
      if (typeof onCreated === 'function') onCreated();
      // small delay so toast is visible
      setTimeout(()=> onClose(), 200);
    }catch(err){
      console.error('create agent error', err);
      // Try to parse DRF-style validation errors
      try{
        const eany: any = err;
        const data = eany?.response?.data || eany?.data || null;
        if (data && typeof data === 'object'){
          const next: Record<string,string> = {};
          if (data.non_field_errors) next.form = data.non_field_errors.join(' ');
          for (const k of ['user','email','password','cin','phone_number']){
            if (data[k]) next[k] = Array.isArray(data[k]) ? data[k].join(' ') : String(data[k]);
          }
          // DRF nested user errors
          if (data.user && typeof data.user === 'object'){
            for (const [uk, uv] of Object.entries(data.user)) next[uk] = Array.isArray(uv) ? uv.join(' ') : String(uv);
          }
          setErrors(next);
          if (next.form) showToast({ type: 'error', message: next.form });
          else showToast({ type: 'error', message: 'Erreur lors de la création de l\'agent' });
          return;
        }
      }catch(parseErr){ console.error('parse error', parseErr); }

      setErrors({ form: 'Erreur lors de la création de l\'agent' });
      showToast({ type: 'error', message: 'Erreur lors de la création de l\'agent' });
    }finally{ setSubmitting(false); }
  }

  useEffect(()=>{ if (emailRef.current) emailRef.current.focus(); }, []);

  return (
    <div className="make-report" style={{ maxWidth: 920, margin: '18px auto', position: 'relative' }}>
      {submitting && (
        <div style={{ position: 'absolute', left:0, top:0, right:0, bottom:0, background: 'rgba(255,255,255,0.7)', zIndex: 40, display:'flex', alignItems:'center', justifyContent:'center', borderRadius: 8 }}>
          <div style={{ padding: 12, background: '#fff', borderRadius: 8, boxShadow: '0 8px 28px rgba(0,0,0,0.08)' }}>Création...</div>
        </div>
      )}
      <div className="mr-root">
        <div className="mr-container">
          <div className="mr-form" style={{ padding: '18px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2>Créer un agent</h2>
              <button onClick={onClose} style={{ background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer' }} aria-label="Fermer">×</button>
            </div>

          
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 8 }}>
              <div className="mr-field" style={{ marginBottom: 6 }}>
                <label>Nom </label>
                <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Nom" />
              </div>

              <div className="mr-field" style={{ marginBottom: 6 }}>
                <label>Prénom</label>
                <input value={firstName} onChange={e=>setFirstName(e.target.value)} placeholder="Prénom" />
              </div>

              <div className="mr-field" style={{ marginBottom: 6 }}>
                <label>Email</label>
                <input ref={emailRef} value={email} onChange={e=>setEmail(e.target.value)} placeholder="email@domaine.tn" />
                {errors.email && <div style={{ color: 'crimson', marginTop: 6 }}>{errors.email}</div>}
              </div>

              <div className="mr-field" style={{ marginBottom: 6 }}>
                <label>Mot de passe</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Mot de passe " />
                {errors.password && <div style={{ color: 'crimson', marginTop: 6 }}>{errors.password}</div>}
              </div>

              {/* last name removed - use single first name field for agent */}

              <div className="mr-field" style={{ marginBottom: 6 }}>
                <label>CIN</label>
                <input value={cin} onChange={e=>setCin(e.target.value)} placeholder="CIN (ex: 01234567)" />
              </div>

              <div className="mr-field" style={{ marginBottom: 6 }}>
                <label>Téléphone</label>
                <input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="+216 xx xxx xxxx" />
              </div>
            </div>

            {errors.form && <div style={{ color: 'crimson', marginBottom: 8 }}>{errors.form}</div>}

            <div className="mr-actions mr-actions-center">
              <button className="mr-submit" onClick={submit} disabled={submitting}>{submitting ? 'Création...' : 'Créer l\'agent'}</button>
              <button className="mr-reset" onClick={onClose} disabled={submitting}>Annuler</button>
            </div>
          </div>

          <div className="rwimg-container" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', paddingLeft: 24 }}>
            <p className="rimg-text-white">Création d'agent</p>
            
           
            </div>
          </div>
        </div>
            </div>
  );
}
