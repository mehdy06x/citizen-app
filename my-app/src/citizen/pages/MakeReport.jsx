import React from "react";
import { useState, useEffect } from "react";
import api from "../api";
import Reclamation from "../components/Reclamation";
import '../styles/makeReport.css';
import '../styles/formRegister.css';
function MakeReport() {
  const [reclamations, setReclamation] = useState([]);
  const [status, setStatus] = useState("nouvelle");
  const [type, setType] = useState("autre");
  const [content, setContent] = useState("");

  useEffect(() => { getReclamations(); }, []);

  const statusChoices = [ { value: "nouvelle", label: "Nouvelle" }, { value: "en progress", label: "En Progress" }, { value: "solved", label: "Solved" } ];
  const typeChoices = [ { value: "déchets", label: "Déchets" }, { value: "éclairage défectueux", label: "Éclairage Défectueux" }, { value: "nids-de-poule", label: "Nids-de-poule" }, { value: "autre", label: "Autre" } ];

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

  const createReclamation = (e) => {
    api.post("/api/reclamations/", { content, type, status }).then((res) => { if (res.status === 201) alert("Reclamation created!"); else alert("Failed to make reclamation."); getReclamations(); }).catch((err) => alert(err));
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

            <div className="mr-field">
              <label>Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                {statusChoices.map((choice) => (<option key={choice.value} value={choice.value}>{choice.label}</option>))}
              </select>
            </div>

            <div className="mr-field">
              <label>Type</label>
              <select value={type} onChange={(e) => setType(e.target.value)}>
                {typeChoices.map((choice) => (<option key={choice.value} value ={choice.value}>{choice.label}</option>))}
              </select>
            </div>
            <div className="mr-field">
              <label>Contenu</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)} />
            </div>

            <div className="mr-actions">
              <button className="mr-submit" onClick={() => { createReclamation(); }}>Soumettre</button>
              <button className="mr-reset" onClick={() => { setContent(''); setType('autre'); setStatus('nouvelle'); }}>Réinitialiser</button>
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
