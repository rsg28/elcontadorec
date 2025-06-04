import React, { useState, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage, faUpload, faTrash, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import styles from '../../pages/AdminPanel.module.css';

const ServiceImageUpload = ({ 
  servicioId, 
  servicioName, 
  currentImageUrl, 
  onImageUploaded, 
  onImageDeleted,
  disabled = false 
}) => {
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

  // Handle file selection
  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Handle file upload
  const handleFileUpload = async (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Por favor seleccione solo archivos de imagen');
      return;
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    setUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${API_BASE_URL}/api/upload/service/${servicioId}/image`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        if (onImageUploaded) {
          onImageUploaded(result.service.imageUrl, result.file);
        }
        setError('');
      } else {
        setError(result.message || 'Error al subir la imagen');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setError('Error de conexión al subir la imagen');
    } finally {
      setUploading(false);
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Handle image deletion
  const handleImageDelete = async () => {
    if (!currentImageUrl) return;

    setDeleting(true);
    setError('');

    try {
      const response = await fetch(`${API_BASE_URL}/api/upload/service/${servicioId}/image`, {
        method: 'DELETE'
      });

      const result = await response.json();

      if (result.success) {
        if (onImageDeleted) {
          onImageDeleted();
        }
        setError('');
      } else {
        setError(result.message || 'Error al eliminar la imagen');
      }
    } catch (error) {
      console.error('Delete error:', error);
      setError('Error de conexión al eliminar la imagen');
    } finally {
      setDeleting(false);
    }
  };

  // Trigger file input
  const triggerFileInput = () => {
    if (fileInputRef.current && !uploading && !disabled) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className={styles['service-image-upload']}>
      <div className={styles['image-upload-header']}>
        <h4>Imagen del Servicio</h4>
        <span className={styles['service-name']}>{servicioName}</span>
      </div>

      <div className={styles['image-upload-container']}>
        {currentImageUrl ? (
          <div className={styles['current-image-container']}>
            <img 
              src={currentImageUrl} 
              alt={servicioName}
              className={styles['service-image-preview']}
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
            <div className={styles['image-actions']}>
              <button
                className={styles['upload-button']}
                onClick={triggerFileInput}
                disabled={uploading || disabled}
                title="Cambiar imagen"
              >
                {uploading ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faUpload} />
                )}
                Cambiar
              </button>
              <button
                className={styles['delete-button']}
                onClick={handleImageDelete}
                disabled={deleting || disabled}
                title="Eliminar imagen"
              >
                {deleting ? (
                  <FontAwesomeIcon icon={faSpinner} spin />
                ) : (
                  <FontAwesomeIcon icon={faTrash} />
                )}
                Eliminar
              </button>
            </div>
          </div>
        ) : (
          <div className={styles['no-image-container']}>
            <div className={styles['upload-placeholder']} onClick={triggerFileInput}>
              <FontAwesomeIcon 
                icon={uploading ? faSpinner : faImage} 
                size="3x" 
                className={uploading ? 'fa-spin' : ''}
              />
              <p>
                {uploading ? 'Subiendo imagen...' : 'Haga clic para subir una imagen'}
              </p>
              <small>Formatos: JPG, PNG, GIF (Máx. 10MB)</small>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          disabled={uploading || disabled}
        />
      </div>

      {error && (
        <div className={styles['error-message']}>
          <FontAwesomeIcon icon={faExclamationTriangle} />
          {error}
        </div>
      )}
    </div>
  );
};

export default ServiceImageUpload; 