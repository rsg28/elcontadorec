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

    // Validate image dimensions
    try {
      const dimensions = await validateImageDimensions(file);
      const { width, height } = dimensions;
      
      // Define minimum and maximum dimensions
      const MIN_WIDTH = 400;
      const MIN_HEIGHT = 400;
      const MAX_WIDTH = 1200;
      const MAX_HEIGHT = 1200;
      
      if (width < MIN_WIDTH || height < MIN_HEIGHT) {
        setError(`La imagen es muy pequeña. Mínimo: ${MIN_WIDTH}x${MIN_HEIGHT} píxeles. Actual: ${width}x${height} píxeles`);
        return;
      }
      
      if (width > MAX_WIDTH || height > MAX_HEIGHT) {
        setError(`La imagen es muy grande. Máximo: ${MAX_WIDTH}x${MAX_HEIGHT} píxeles. Actual: ${width}x${height} píxeles`);
        return;
      }
      
      // Check for square aspect ratio (recommended for service cards)
      const aspectRatio = width / height;
      if (aspectRatio < 0.8 || aspectRatio > 1.25) {
        setError(`Se recomienda una imagen cuadrada o casi cuadrada. Actual: ${aspectRatio.toFixed(2)}:1. Recomendado: entre 0.8:1 y 1.25:1 para mejor visualización en las tarjetas de servicio`);
        return;
      }
      
    } catch (dimensionError) {
      setError('Error al validar las dimensiones de la imagen');
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

  // Validate image dimensions
  const validateImageDimensions = (file) => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      
      img.onload = () => {
        URL.revokeObjectURL(url);
        resolve({
          width: img.width,
          height: img.height
        });
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        reject(new Error('No se pudo cargar la imagen'));
      };
      
      img.src = url;
    });
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
              <small>Dimensiones: 400x400 - 1200x1200 píxeles (preferiblemente cuadradas)</small>
              <small>Las imágenes cuadradas se ven mejor en las tarjetas de servicio</small>
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