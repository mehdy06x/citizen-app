import React from "react";
import "../styles/Rec.css"

function Reclamation({ Reclamation, onDelete }) {
    const formattedDate = new Date(Reclamation.created_at).toLocaleDateString("en-US")

    return (
        <div className="Reclamation-container">
            <p className="Reclamation-type">{Reclamation.type}</p>
            <p className="Reclamation-status">{Reclamation.status}</p>
            <p className="Reclamation-content">{Reclamation.content}</p>
            <p className="Reclamation-date">{formattedDate}</p>
            <button className="delete-button" onClick={() => onDelete(Reclamation.id)}>
                Delete
            </button>
        </div>
    );
}

export default Reclamation