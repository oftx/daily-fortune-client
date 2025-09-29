// src/components/Modal.jsx

import React from 'react';

// --- MODIFIED: Added backdropClosable prop with a default value of true ---
const Modal = ({ isOpen, onClose, title, children, backdropClosable = true }) => {
  if (!isOpen) {
    return null;
  }

  // --- NEW: Handler for backdrop click ---
  const handleBackdropClick = () => {
    // Only close the modal if backdrop closing is enabled
    if (backdropClosable) {
      onClose();
    }
  };

  return (
    // --- MODIFIED: Use the new handler for the backdrop's onClick event ---
    <div className="modal-backdrop" onClick={handleBackdropClick}>
      {/* Modal Content: stopPropagation prevents backdrop click from firing when clicking inside the content */}
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3 className="modal-title">{title}</h3>
          <button onClick={onClose} className="modal-close-btn">&times;</button>
        </div>
        <div className="modal-body">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;