import React from 'react';
import styles from '../../../pages/AdminPanel.module.css';

const EditServiceDescriptionModal = ({ show, onClose, onSave, servicioName, initialDescription }) => {
  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>Editar Descripción del Servicio</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        
        <div className={styles['modal-body']}>
          <p>EditServiceDescriptionModal - To be implemented</p>
          <p>Service: <strong>{servicioName}</strong></p>
          <p>Current description: {initialDescription || 'No description'}</p>
        </div>
        
        <div className={styles['modal-footer']}>
          <button className={styles['cancel-button']} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles['save-button']} onClick={() => onSave('New description')}>
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditServiceDescriptionModal; 