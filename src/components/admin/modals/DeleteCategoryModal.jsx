import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faTrash, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../pages/AdminPanel.module.css';
import LoadingAnimation from '../../loadingAnimation';

const DeleteCategoryModal = ({ show, onClose, onConfirm, categoryName, serviceCount }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
    }

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, onClose, isLoading]);
  
  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };
  
  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        {isLoading && <LoadingAnimation />}
        <div className={styles['modal-header']}>
          <h2>Eliminar Categoría</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        <div className={styles['modal-body']}>
          <div className={styles['warning-icon']}>
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" color="#e74c3c" />
          </div>
          <p className={styles['warning-message']}>
            Está a punto de eliminar la categoría <strong>{categoryName}</strong> y todos sus elementos asociados.
          </p>
          <p className={styles['warning-details']}>
            Esta acción eliminará:
          </p>
          <ul className={styles['warning-items']}>
            <li>{serviceCount} servicio(s) y todos sus ítems</li>
          </ul>
          <p className={styles['warning-permanent']}>
            Esta acción no se puede deshacer. ¿Está seguro que desea continuar?
          </p>
        </div>
        
        <div className={styles['modal-footer']}>
          <button 
            className={styles['cancel-button']} 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className={styles['delete-button']} 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 
              <><FontAwesomeIcon icon={faSpinner} spin /> Eliminando...</> : 
              <><FontAwesomeIcon icon={faTrash} /> Eliminar Categoría</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCategoryModal; 