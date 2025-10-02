import React from "react";
import { useState, useEffect } from "react";
import api from "../api";
import Reclamation from "../components/Reclamation";
import '../styles/makeReport.css';
import '../styles/formRegister.css';
import { useLocation, useNavigate } from 'react-router-dom';
 function MakeReport() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const [reclamations, setReclamation] = useState([]);
  // status is controlled by admin; default on server will be 'suspendu' or 'nouvelle'
  const [type, setType] = useState("autre");
  const [content, setContent] = useState("");
  const [photoFile, setPhotoFile] = useState(null);
  const [loc, setLoc] = useState("");
  const [locLoading, setLocLoading] = useState(false);
  const [customType, setCustomType] = useState("");

    // keep customType as a free text field but do not add dynamic select options.
    // The select will always keep the server-expected choices, including 'autre'.
    useEffect(() => {
      // if user clears customType while select is not 'autre', we don't auto-change the select.
      // No dynamic option creation here — keep UX simple: select stays as chosen and 'autre' remains available.
    }, [customType]);

  useEffect(() => { getReclamations(); }, []);

  // Route guard: only allow access for authenticated non-admin users
  useEffect(() => {
    const checkAccess = async () => {
      const token = localStorage.getItem('access') || localStorage.getItem('access_token') || localStorage.getItem('accessToken');
  // allow quick entry when navigated from the second page via the "Nouvelle Reclamation" control
  if (routeLocation && routeLocation.state && routeLocation.state.fromSecondPage) return;
      if (!token) {
        navigate('/connect');
        return;
      }
      try {
        const res = await api.get('/api/users/me/', { headers: { Authorization: `Bearer ${token}` } });
        const data = res.data || {};
        const isAdmin = data.is_staff || data.is_superuser || data.is_admin || data.role === 'admin';
        if (isAdmin) {
          navigate('/admin');
          return;
        }
        // else allowed: user stays on make-report
      } catch (err) {
        // token invalid or endpoint missing -> treat as unauthenticated
        navigate('/connect');
      }
    };
    checkAccess();
  }, [navigate]);

  const statusChoices = [ { value: "nouvelle", label: "Nouvelle" }, { value: "en progress", label: "En Progress" }, { value: "solved", label: "Solved" } ];
  const [typeChoices, setTypeChoices] = useState([
    { value: "déchets", label: "Déchets" },
    { value: "éclairage défectueux", label: "Éclairage Défectueux" },
    { value: "nids-de-poule", label: "Nids-de-poule" },
    { value: "autre", label: "Autre" }
  ]);

  const getReclamations = async () => {
    const token = localStorage.getItem('access');
    const res = await api.get('/api/reclamations/list/', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.data)
      .then((data) => { setReclamation(data); console.log(data); })
      .catch((err) => alert(err));
  };

  const deleteReclamation = (id) => {
    api.delete(`/api/reclamations/delete/${id}/`).then((res) => { if (res.status === 204) alert("Reclamation deleted!"); else alert("Failed to delete reclamation."); getReclamations(); }).catch((error) => alert(error));
  };

  const createReclamation = async (e) => {
  if (!photoFile) { alert('Veuillez ajouter une photo du problème.'); return; }
  if (!loc) { alert('Veuillez fournir votre emplacement (utilisez le bouton "Ma position").'); return; }
    if (!content || content.trim().length === 0) { alert('Veuillez fournir une description du problème.'); return; }
    const token = localStorage.getItem('access');
  const fd = new FormData();
  fd.append('content', content);
  // Determine whether the selected type is a custom label (not one of the server's choice values)
  const serverChoiceValues = ['déchets', 'éclairage défectueux', 'nids-de-poule', 'autre'];
  // Always submit the select's value for `type`. If the user entered a free-text `customType`, send it in `custom_type`.
  // Backend expects choice values for `type` so keep those intact; when user wants a custom label they should leave select on 'autre'.
  fd.append('type', type);
  if (customType && customType.trim().length) fd.append('custom_type', customType.trim());
  fd.append('photo', photoFile);
  fd.append('location', loc);
  try {
    const res = await api.post('/api/reclamations/', fd, { headers: { Authorization: `Bearer ${token}` } });
  if (res.status === 201) {
      alert('Reclamation created!');
      // After the user dismisses the alert, navigate back to the second page
      navigate('/secondpage');
      // reset other fields but keep the select value as the user left it
      setContent(''); setPhotoFile(null); setLoc(''); setCustomType('');
      getReclamations();
    } else {
      alert('Failed to make reclamation.');
    }
  } catch (err) {
    alert(err);
  }
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) { alert('Geolocation not supported by your browser.'); return; }
    setLocLoading(true);
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
      setLoc(coords);
      setLocLoading(false);
    }, (err) => { alert('Failed to get location: ' + err.message); setLocLoading(false); }, { enableHighAccuracy: true, timeout: 10000 });
  };

  return (
  
    <div className="make-report">
      <div className="mr-root">
        <div className="reclamations-list">
          <h2>Reclamations</h2>
          {reclamations.map((rec) => (
            <Reclamation Reclamation={rec} onDelete={deleteReclamation} key={rec.id} />
          ))}
        </div>

        <div className="mr-container">
          <div className="mr-form">
            <h2>Soumettre une réclamation</h2>

            {/* status removed from user form - admin controls status */}

            <div className="mr-field">
              <label>Type</label>
              <select value={type} onChange={(e) => { setType(e.target.value); if (e.target.value !== 'autre') setCustomType(''); }}>
                {typeChoices.map((choice) => (<option key={choice.value} value ={choice.value}>{choice.label}</option>))}
              </select>
            </div>

            {type === 'autre' && (
              <div className="mr-field">
                <label>Précisez le type</label>
                <input type="text" value={customType} onChange={(e) => setCustomType(e.target.value)} placeholder="Ex: branche cassée, mobilier urbain" />
              </div>
            )}

            <div className="mr-field">
              <label>Photo</label>
              <input type="file" accept="image/*" onChange={(e) => setPhotoFile(e.target.files && e.target.files[0])} />
            </div>

            <div className="mr-field">
              <label>Contenu</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} />
            </div>

            <div className="mr-field location-field">
              <label>Emplacement</label>
              <div style={{display:'flex', gap:8, alignItems:'center'}}>
                <input type="text" value={loc} readOnly placeholder="Latitude,Longitude" />
                <button type="button" className="btn-location" onClick={useMyLocation}>{locLoading ? 'Localisation...' : 'Utiliser ma position actuelle'}</button>
              </div>
            </div>

            <div className="mr-actions mr-actions-center">
              <button className="mr-submit" onClick={() => { createReclamation(); }}>Soumettre</button>
            </div>
          </div>
            <div className="rwimg-container">
              <p className="rimg-text-blue">Votre Voix,</p>
              <p className="rimg-text-white"> Notre Action.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
export default MakeReport;
