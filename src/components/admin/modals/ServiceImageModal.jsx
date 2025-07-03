import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../pages/AdminPanel.module.css';
import ServiceImageUpload from '../ServiceImageUpload';

const ServiceImageModal = ({ show, onClose, servicio, categoria, onImageUpdated }) => {
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

  const handleImageUploaded = (imageUrl, fileData) => {
    if (onImageUpdated) {
      onImageUpdated(servicio.id_servicio, imageUrl);
    }
  };

  const handleImageDeleted = () => {
    if (onImageUpdated) {
      onImageUpdated(servicio.id_servicio, null);
    }
  };

  if (!show || !servicio) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '500px' }}>
        {isLoading && <div className={styles['loading-overlay']}><div className={styles['loading-spinner']}></div></div>}
        
        <div className={styles['modal-header']}>
          <h2>
            <FontAwesomeIcon icon={faImage} className={styles['modal-header-icon']} />
            Gestionar Imagen del Servicio
          </h2>
          <button 
            className={styles['close-button']} 
            onClick={onClose} 
            aria-label="Cerrar" 
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <div className={styles['modal-body']}>
          <div className={styles['service-info-section']}>
            <div className={styles['service-details']}>
              <h3>{servicio.nombre}</h3>
              <p className={styles['service-category']}>
                Categoría: <strong>{categoria?.nombre || 'Sin categoría'}</strong>
              </p>
            </div>
          </div>

          <ServiceImageUpload
            servicioId={servicio.id_servicio}
            servicioName={servicio.nombre}
            currentImageUrl={servicio.imagen}
            onImageUploaded={handleImageUploaded}
            onImageDeleted={handleImageDeleted}
            disabled={isLoading}
          />
        </div>
        
        <div className={styles['modal-footer']}>
          <button 
            className={styles['cancel-button']} 
            onClick={onClose}
            disabled={isLoading}
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default ServiceImageModal; 