import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUpload, faTimes, faImage, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import './BannerUploadModal.css';

const BannerUploadModal = ({ isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  // Image dimension requirements
  const REQUIRED_WIDTH = 1200;
  const REQUIRED_HEIGHT = 400;
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

  const validateImage = (file) => {
    return new Promise((resolve, reject) => {
      // Check file type
      if (!file.type.startsWith('image/')) {
        reject('Por favor selecciona un archivo de imagen válido');
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        reject('El archivo es demasiado grande. Máximo 5MB permitido');
        return;
      }

      // Check image dimensions
      const img = new Image();
      img.onload = () => {
        if (img.width !== REQUIRED_WIDTH || img.height !== REQUIRED_HEIGHT) {
          reject(`Las dimensiones de la imagen deben ser exactamente ${REQUIRED_WIDTH}x${REQUIRED_HEIGHT} píxeles. Dimensiones actuales: ${img.width}x${img.height}`);
          return;
        }
        resolve(true);
      };
      img.onerror = () => reject('Error al cargar la imagen');
      img.src = URL.createObjectURL(file);
    });
  };

  const handleFileSelect = async (file) => {
    try {
      setError('');
      await validateImage(file);
      
      setSelectedFile(file);
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);
    } catch (err) {
      setError(err);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Por favor selecciona una imagen');
      return;
    }

    try {
      setUploading(true);
      setError('');

      const formData = new FormData();
      formData.append('banner', selectedFile);

      const response = await fetch('/api/upload/banner', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al subir la imagen');
      }

      onSuccess && onSuccess(data);
      handleClose();
      
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    setError('');
    setUploading(false);
    setDragActive(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="banner-modal-overlay">
      <div className="banner-modal">
        <div className="banner-modal-header">
          <h2>
            <FontAwesomeIcon icon={faImage} />
            Subir Banner
          </h2>
          <button 
            className="banner-modal-close"
            onClick={handleClose}
            disabled={uploading}
          >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </div>

        <div className="banner-modal-content">
          <div className="banner-requirements">
            <h3>Requisitos de la imagen:</h3>
            <ul>
              <li><strong>Dimensiones:</strong> {REQUIRED_WIDTH} x {REQUIRED_HEIGHT} píxeles (exactas)</li>
              <li><strong>Formato:</strong> JPG, PNG, GIF, WEBP</li>
              <li><strong>Tamaño máximo:</strong> 5MB</li>
              <li><strong>Tipo:</strong> Banner rectangular para páginas de servicios</li>
              <li><strong>Nota:</strong> El banner anterior será reemplazado automáticamente</li>
            </ul>
          </div>

          <div 
            className={`banner-upload-area ${dragActive ? 'drag-active' : ''}`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {previewUrl ? (
              <div className="banner-preview">
                <img src={previewUrl} alt="Preview" />
                <div className="banner-preview-info">
                  <p><strong>Archivo:</strong> {selectedFile.name}</p>
                  <p><strong>Tamaño:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
              </div>
            ) : (
              <div className="banner-upload-placeholder">
                <FontAwesomeIcon icon={faUpload} size="3x" />
                <h3>Arrastra tu imagen aquí</h3>
                <p>o haz clic para seleccionar</p>
                <p className="banner-dimensions-hint">
                  {REQUIRED_WIDTH} x {REQUIRED_HEIGHT} píxeles
                </p>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="banner-file-input"
              disabled={uploading}
            />
          </div>

          {error && (
            <div className="banner-error">
              <FontAwesomeIcon icon={faExclamationTriangle} />
              {error}
            </div>
          )}
        </div>

        <div className="banner-modal-footer">
          <button 
            className="banner-btn banner-btn-cancel"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancelar
          </button>
          <button 
            className="banner-btn banner-btn-upload"
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            {uploading ? 'Subiendo...' : 'Reemplazar Banner'}
            {!uploading && <FontAwesomeIcon icon={faUpload} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BannerUploadModal; 