import React from 'react';
import styles from '../../../pages/AdminPanel.module.css';

const CreateCaracteristicaModal = ({ show, onClose, onSave }) => {
  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>Crear Nueva Característica</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        
        <div className={styles['modal-body']}>
          <p>CreateCaracteristicaModal - To be implemented</p>
          <p>This modal will allow creating new características with name, color, and icon.</p>
        </div>
        
        <div className={styles['modal-footer']}>
          <button className={styles['cancel-button']} onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCaracteristicaModal; 