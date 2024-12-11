import React from 'react';

const Modal = ({ isOpen, onClose, onClaim, rewardAmount }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Réclamer la récompense</h2>
        <p>Le montant de votre récompense est de: {rewardAmount} RECOMPENSE</p>
        <button onClick={onClaim} className="btn-primary">
          Réclamer
        </button>
        <button onClick={onClose} className="btn-secondary">
          Fermer
        </button>
      </div>
    </div>
  );
};

export default Modal;