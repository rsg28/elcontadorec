import React from 'react';
import styles from '../../../pages/AdminPanel.module.css';

const AssignCaracteristicaModal = ({ show, onClose, onSave, allServicios, allCaracteristicas }) => {
  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>Asignar Característica a Servicio</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        
        <div className={styles['modal-body']}>
          <p>AssignCaracteristicaModal - To be implemented</p>
          <p>This modal will allow assigning características to servicios.</p>
          <p>Available servicios: {allServicios?.length || 0}</p>
          <p>Available características: {allCaracteristicas?.length || 0}</p>
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

export default AssignCaracteristicaModal; 