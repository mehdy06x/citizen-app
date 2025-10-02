import React, { useState } from "react";
import "../styles/Rec.css"

function Reclamation({ Reclamation, onDelete }) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const formattedDate = new Date(Reclamation.created_at).toLocaleDateString("en-US")

    const openPreview = () => setPreviewOpen(true);
    const closePreview = () => setPreviewOpen(false);

        // normalize photo URL: API may return a string or an object with `url`
        const rawPhoto = Reclamation.photo;
        let photoUrl = null;
        if (rawPhoto) {
            if (typeof rawPhoto === 'string') photoUrl = rawPhoto;
            else if (rawPhoto.url) photoUrl = rawPhoto.url;
            // if relative path, prefix with API base
            if (photoUrl && !/^https?:\/\//.test(photoUrl)) {
                const base = import.meta.env.VITE_API_URL || 'http://localhost:8000';
                photoUrl = base.replace(/\/$/, '') + '/' + photoUrl.replace(/^\//, '');
            }
        }

    // prefer to display custom_type when backend stored it
    const displayType = Reclamation.custom_type && Reclamation.custom_type.length ? Reclamation.custom_type : Reclamation.type;
    return (
    <div className="Reclamation-container">
            <p className="Reclamation-type">{displayType}</p>
                        {photoUrl && (
                                <img src={photoUrl} alt="reclamation" className="Reclamation-photo" onClick={openPreview} />
                        )}
            <p className="Reclamation-content">{Reclamation.content}</p>
            <p className="Reclamation-status">{Reclamation.status}</p>
            <p className="Reclamation-date">{formattedDate}</p>
            <button className="delete-button" onClick={() => onDelete(Reclamation.id)}>
                Delete
            </button>

            {previewOpen && photoUrl && (
                <div className="image-preview-overlay" onClick={closePreview}>
                    <div className="image-preview-card" onClick={(e) => e.stopPropagation()}>
                        <button className="image-preview-close" onClick={closePreview}>×</button>
                        <img src={photoUrl} alt="preview" className="image-preview-img" />
                    </div>
                </div>
            )}
        </div>
    );
}

export default Reclamation
