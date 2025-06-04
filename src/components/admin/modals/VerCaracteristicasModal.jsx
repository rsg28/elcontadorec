import React from 'react';
import styles from '../../../pages/AdminPanel.module.css';

const VerCaracteristicasModal = ({ show, onClose, caracteristicas, onDelete, onCreateNew }) => {
  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '600px' }}>
        <div className={styles['modal-header']}>
          <h2>Gestionar Características</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        
        <div className={styles['modal-body']}>
          <p>VerCaracteristicasModal - To be implemented</p>
          <p>This modal will show all características ({caracteristicas?.length || 0}) with options to edit/delete.</p>
        </div>
        
        <div className={styles['modal-footer']}>
          <button className={styles['cancel-button']} onClick={onClose}>
            Cerrar
          </button>
          <button className={styles['add-button']} onClick={onCreateNew}>
            Nueva Característica
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerCaracteristicasModal; 