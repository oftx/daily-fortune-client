// src/components/ConfirmModal.jsx

import React from 'react';
import Modal from './Modal'; // We reuse the base Modal component

const modalActionStyle = {
  display: 'flex',
  justifyContent: 'flex-end',
  gap: '1rem',
  marginTop: '1.5rem',
};

const buttonStyle = {
  padding: '0.5rem 1rem',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontWeight: '500',
};

const confirmButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#d9534f', // Red for destructive actions
  color: 'white',
};

const cancelButtonStyle = {
  ...buttonStyle,
  backgroundColor: '#f0f0f0',
  color: '#333',
};


const ConfirmModal = ({ isOpen, onClose, onConfirm, title, children }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div>{children}</div>
      <div style={modalActionStyle}>
        <button onClick={onClose} style={cancelButtonStyle}>
          Cancel
        </button>
        <button onClick={onConfirm} style={confirmButtonStyle}>
          Confirm
        </button>
      </div>
    </Modal>
  );
};

export default ConfirmModal;