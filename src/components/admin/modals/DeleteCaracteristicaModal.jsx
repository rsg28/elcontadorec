import React from 'react';
import styles from '../../../pages/AdminPanel.module.css';

const DeleteCaracteristicaModal = ({ show, onClose, onConfirm, caracteristicaName, serviciosCount }) => {
  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        <div className={styles['modal-header']}>
          <h2>Eliminar Característica</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        
        <div className={styles['modal-body']}>
          <p>DeleteCaracteristicaModal - To be implemented</p>
          <p>This modal will confirm deletion of característica: <strong>{caracteristicaName}</strong></p>
          <p>Affects {serviciosCount} servicio(s)</p>
        </div>
        
        <div className={styles['modal-footer']}>
          <button className={styles['cancel-button']} onClick={onClose}>
            Cancelar
          </button>
          <button className={styles['delete-button']} onClick={onConfirm}>
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCaracteristicaModal; 