import React from "react";
import "./ConfirmationModal.css";

const ConfirmationModal = ({ isOpen, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h3>Confirmer la promotion</h3>
        <p>
          ⚠️ La promotion de ce bien durera <strong>7 jours</strong> et
          prélèvera <strong>10 tokens</strong> de votre solde.
        </p>
        <div className="modal-buttons">
          <button className="confirm-btn" onClick={onConfirm}>
            Oui, continuer
          </button>
          <button className="cancel-btn" onClick={onCancel}>
            Annuler
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
