import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../pages/AdminPanel.module.css';

const EditServiceDescriptionModal = ({ show, onClose, onSave, servicioName, initialDescription }) => {
  const [description, setDescription] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize description when modal opens
  useEffect(() => {
    if (show) {
      setDescription(initialDescription || '');
      setError('');
      setHasChanges(false);
    }
  }, [show, initialDescription]);

  // Track changes
  useEffect(() => {
    setHasChanges(description !== (initialDescription || ''));
  }, [description, initialDescription]);

  // Handle ESC key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isLoading) {
        handleClose();
      }
    }

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, isLoading]);

  const handleClose = () => {
    if (isLoading) return;
    
    if (hasChanges) {
      const confirmClose = window.confirm(
        '¿Está seguro de que desea cerrar? Los cambios no guardados se perderán.'
      );
      if (!confirmClose) return;
    }
    
    onClose();
  };

  const handleSave = async () => {
    if (isLoading) return;
    
    // Validate description length
    if (description.length > 1000) {
      setError('La descripción no puede exceder 1000 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave(description.trim());
      // onClose will be called by the parent component if save is successful
    } catch (error) {
      console.error('Error saving description:', error);
      setError('Error al guardar la descripción. Intente nuevamente.');
      setIsLoading(false);
    }
  };

  const handleTextareaChange = (e) => {
    setDescription(e.target.value);
    setError(''); // Clear error when user starts typing
  };

  const characterCount = description.length;
  const maxLength = 1000;
  const isOverLimit = characterCount > maxLength;

  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '600px' }}>
        {isLoading && <div className={styles['loading-overlay']}><div className={styles['loading-spinner']}></div></div>}
        
        <div className={styles['modal-header']}>
          <h2>
            <FontAwesomeIcon icon={faEdit} className={styles['modal-header-icon']} />
            Editar Descripción del Servicio
          </h2>
          <button 
            className={styles['close-button']} 
            onClick={handleClose} 
            aria-label="Cerrar"
            disabled={isLoading}
          >
            ×
          </button>
        </div>
        
        <div className={styles['modal-body']}>
          <div className={styles['form-group']}>
            <label htmlFor="serviceDescription" className={styles['form-label']}>
              Descripción del Servicio: <strong>{servicioName}</strong>
            </label>
            <textarea
              id="serviceDescription"
              className={`${styles['form-textarea']} ${isOverLimit ? styles['error'] : ''}`}
              value={description}
              onChange={handleTextareaChange}
              placeholder="Escriba una descripción detallada del servicio..."
              rows={6}
              disabled={isLoading}
              autoFocus
            />
            <div className={styles['character-counter']}>
              <span className={isOverLimit ? styles['error-text'] : ''}>
                {characterCount}/{maxLength} caracteres
              </span>
            </div>
          </div>

          {error && (
            <div className={styles['error-message']}>
              <FontAwesomeIcon icon={faExclamationTriangle} />
              {error}
            </div>
          )}
        </div>
        
        <div className={styles['modal-footer']}>
          <button 
            className={styles['cancel-button']} 
            onClick={handleClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className={styles['save-button']} 
            onClick={handleSave}
            disabled={isLoading || !hasChanges || isOverLimit}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Guardando...
              </>
            ) : (
              'Guardar Descripción'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditServiceDescriptionModal; 