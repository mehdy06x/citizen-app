import React from "react";
import { useState, useEffect } from "react";
import api from "../api";
import Reclamation from "../components/Reclamation";
//import "../styles/Home.css"

function Home() {
  // State for form fields
  const [reclamations, setReclamation] = useState([]);
  const [status, setStatus] = useState("nouvelle"); // default
  const [type, setType] = useState("autre");        // default
  const [content, setContent] = useState("");


  useEffect(() => {
        getReclamations();
    }, []);
  // Choices for dropdowns
  const statusChoices = [
    { value: "nouvelle", label: "Nouvelle" },
    { value: "en progress", label: "En Progress" },
    { value: "solved", label: "Solved" }
  ];

  const typeChoices = [
    { value: "déchets", label: "Déchets" },
    { value: "éclairage défectueux", label: "Éclairage Défectueux" },
    { value: "nids-de-poule", label: "Nids-de-poule" },
    { value: "autre", label: "Autre" }
  ];


const getReclamations = async () => {
        const token = localStorage.getItem('access');
            const res = await api.get('/api/reclamations/list/', {
            headers: { Authorization: `Bearer ${token}` } })
                                  .then((res) => res.data)
                                  .then((data) => {
                                      setReclamation(data);
                                      console.log(data);
                                  })
                  .catch((err) => alert(err));
    };





  const deleteReclamation = (id) => {
        api
            .delete(`/api/reclamations/delete/${id}/`)
            .then((res) => {
                if (res.status === 204) alert("Reclamation deleted!");
                else alert("Failed to delete reclamation.");
                getReclamations();
            })
            .catch((error) => alert(error));
    };





 const createReclamation = (e) => {
        
        api
            .post("/api/reclamations/", { content, type, status })
            .then((res) => {
                if (res.status === 201) alert("Reclamation created!");
                else alert("Failed to make reclamation.");
                getReclamations();
            })
            .catch((err) => alert(err));
    };
  return (
    <div>
      {/*Show reclamations*/}
            <div>
                <h2>Reclamations</h2>
                {reclamations.map((rec) => (
                    <Reclamation Reclamation={rec} onDelete={deleteReclamation} key={rec.id} />
                ))}
            </div>



            <div> 
            {/* Status Select */}
            <label>Status:</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {statusChoices.map((choice) => (
                <option key={choice.value} value={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>

            {/* Type Select */}
            <label>Type:</label>
            <select value={type} onChange={(e) => setType(e.target.value)}>
              {typeChoices.map((choice) => (
                <option key={choice.value} value ={choice.value}>
                  {choice.label}
                </option>
              ))}
            </select>

            {/* Content Textarea */}
            <label>Content:</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />

            <button
              onClick={() => {
                console.log({ status, type, content });
                createReclamation();
              }}
            >
              Submit
            </button>
          </div>   
          
    </div>
  );
}
export default Home