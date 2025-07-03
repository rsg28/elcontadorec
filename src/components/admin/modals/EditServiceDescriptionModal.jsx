import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../pages/AdminPanel.module.css';

const EditServiceDescriptionModal = ({ show, onClose, onSave, servicioName, initialDescription }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize form data when modal opens
  useEffect(() => {
    if (show) {
      setFormData({
        nombre: servicioName || '',
        descripcion: initialDescription || ''
      });
      setError('');
      setHasChanges(false);
    }
  }, [show, servicioName, initialDescription]);

  // Track changes
  useEffect(() => {
    const nameChanged = formData.nombre !== (servicioName || '');
    const descriptionChanged = formData.descripcion !== (initialDescription || '');
    setHasChanges(nameChanged || descriptionChanged);
  }, [formData, servicioName, initialDescription]);

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
    
    // Validate service name
    if (!formData.nombre || formData.nombre.trim().length === 0) {
      setError('El nombre del servicio es obligatorio');
      return;
    }
    
    if (formData.nombre.trim().length > 100) {
      setError('El nombre del servicio no puede exceder 100 caracteres');
      return;
    }
    
    // Validate description length
    if (formData.descripcion.length > 1000) {
      setError('La descripción no puede exceder 1000 caracteres');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await onSave({
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim()
      });
      // onClose will be called by the parent component if save is successful
    } catch (error) {
      console.error('Error saving service:', error);
      setError('Error al guardar los datos del servicio. Intente nuevamente.');
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(''); // Clear error when user starts typing
  };

  const characterCount = formData.descripcion.length;
  const maxLength = 1000;
  const isOverLimit = characterCount > maxLength;
  const nameLength = formData.nombre.length;
  const maxNameLength = 100;
  const isNameOverLimit = nameLength > maxNameLength;

  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '600px' }}>
        {isLoading && <div className={styles['loading-overlay']}><div className={styles['loading-spinner']}></div></div>}
        
        <div className={styles['modal-header']}>
          <h2>
            <FontAwesomeIcon icon={faEdit} className={styles['modal-header-icon']} />
            Editar Servicio
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
          <div className={styles['form-group']} style={{ marginBottom: '20px' }}>
            <label htmlFor="serviceName" className={styles['form-label']}>
              Nombre del Servicio <span className={styles['required-mark']}>*</span>
            </label>
            <input
              id="serviceName"
              type="text"
              className={`${styles['form-control']} ${isNameOverLimit ? styles['error'] : ''}`}
              value={formData.nombre}
              onChange={handleInputChange}
              name="nombre"
              placeholder="Escriba el nombre del servicio..."
              disabled={isLoading}
              autoFocus
              style={{ 
                padding: '12px 16px', 
                fontSize: '15px',
                marginBottom: '5px'
              }}
            />
            <div className={styles['character-counter']}>
              <span className={isNameOverLimit ? styles['error-text'] : ''}>
                {nameLength}/{maxNameLength} caracteres
              </span>
            </div>
          </div>

          <div className={styles['form-group']}>
            <label htmlFor="serviceDescription" className={styles['form-label']}>
              Descripción del Servicio
            </label>
            <textarea
              id="serviceDescription"
              className={`${styles['form-textarea']} ${isOverLimit ? styles['error'] : ''}`}
              value={formData.descripcion}
              onChange={handleInputChange}
              name="descripcion"
              placeholder="Escriba una descripción detallada del servicio..."
              rows={6}
              disabled={isLoading}
              style={{ 
                padding: '12px 16px', 
                fontSize: '15px',
                marginBottom: '5px'
              }}
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
            disabled={isLoading || !hasChanges || isOverLimit || isNameOverLimit}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Guardando...
              </>
            ) : (
              'Guardar Cambios'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditServiceDescriptionModal; 