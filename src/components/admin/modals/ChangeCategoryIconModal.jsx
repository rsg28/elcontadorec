import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faImage, faSave, faSpinner, faTimes, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../../pages/AdminPanel.module.css';
import { commonIcons } from '../utils/commonIcons.jsx';

const ChangeCategoryIconModal = ({ show, onClose, onSave, categoriaId, categoriaName, currentIcon, isLoading = false }) => {
  const [selectedIcon, setSelectedIcon] = useState(currentIcon || 'folder');
  const [error, setError] = useState('');

  // Reset form when modal opens/closes
  useEffect(() => {
    if (show) {
      setSelectedIcon(currentIcon || 'folder');
      setError('');
    }
  }, [show, currentIcon]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedIcon) {
      setError('Debe seleccionar un icono');
      return;
    }

    try {
      await onSave(categoriaId, { imagen: selectedIcon });
    } catch (error) {
      console.error('Error updating category icon:', error);
      setError('Error al actualizar el icono de la categoría');
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && !isLoading) {
      onClose();
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, isLoading]);

  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className={styles['modal-header']}>
          <h2>
            <FontAwesomeIcon icon={faImage} className={styles['modal-header-icon']} />
            Cambiar Icono de Categoría
          </h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles['modal-body']} style={{ padding: '20px' }}>
            {/* Category Info */}
            <div style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              backgroundColor: '#f8f9fa', 
              borderRadius: '8px',
              border: '1px solid #e9ecef'
            }}>
              <div style={{ fontSize: '14px', color: '#666', marginBottom: '8px' }}>
                Categoría seleccionada:
              </div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: '#333' }}>
                {categoriaName}
              </div>
            </div>

            {/* Icon Selection */}
            <div className={styles['form-group']} style={{ marginBottom: '25px' }}>
              <label className={styles['form-label']} style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
                Seleccionar Nuevo Icono <span className={styles['required-mark']}>*</span>
              </label>
              
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', 
                gap: '12px',
                maxHeight: '400px',
                overflowY: 'auto',
                padding: '15px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                {commonIcons.map(({ name, icon }) => (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedIcon(name)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '12px 8px',
                      border: selectedIcon === name ? '2px solid #4a6cf7' : '2px solid #e9ecef',
                      borderRadius: '8px',
                      backgroundColor: selectedIcon === name ? '#f0f4ff' : 'white',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      minHeight: '80px',
                      justifyContent: 'center'
                    }}
                    onMouseOver={(e) => {
                      if (selectedIcon !== name) {
                        e.currentTarget.style.borderColor = '#4a6cf7';
                        e.currentTarget.style.backgroundColor = '#f8f9ff';
                      }
                    }}
                    onMouseOut={(e) => {
                      if (selectedIcon !== name) {
                        e.currentTarget.style.borderColor = '#e9ecef';
                        e.currentTarget.style.backgroundColor = 'white';
                      }
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={icon} 
                      style={{ 
                        fontSize: '24px', 
                        color: selectedIcon === name ? '#4a6cf7' : '#666'
                      }} 
                    />
                    <span style={{ 
                      fontSize: '11px', 
                      color: selectedIcon === name ? '#4a6cf7' : '#666',
                      textAlign: 'center',
                      fontWeight: selectedIcon === name ? '600' : '400'
                    }}>
                      {name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Preview */}
            <div className={styles['form-group']} style={{ marginBottom: '25px' }}>
              <label className={styles['form-label']} style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600' }}>
                Vista Previa del Icono Seleccionado
              </label>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '15px',
                padding: '20px',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                border: '1px solid #e9ecef'
              }}>
                <div style={{ 
                  width: '60px',
                  height: '60px',
                  backgroundColor: '#4285F4',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }}>
                  <FontAwesomeIcon 
                    icon={commonIcons.find(item => item.name === selectedIcon)?.icon || commonIcons[0].icon} 
                    style={{ 
                      fontSize: '28px', 
                      color: 'white'
                    }} 
                  />
                </div>
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#333', marginBottom: '4px' }}>
                    {categoriaName}
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Icono: {selectedIcon}
                  </div>
                </div>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className={styles['error-message']} style={{ marginBottom: '20px', padding: '12px 16px', fontSize: '14px', borderRadius: '6px' }}>
                <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '8px' }} />
                {error}
              </div>
            )}
          </div>
          
          {/* Action Buttons */}
          <div style={{ 
            padding: '15px 20px', 
            borderTop: '1px solid #eee',
            backgroundColor: '#ffffff',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '15px'
          }}>
            <button 
              type="button" 
              onClick={onClose}
              disabled={isLoading}
              style={{ 
                padding: '12px 24px', 
                fontSize: '15px', 
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#6c757d',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isLoading ? 'not-allowed' : 'pointer'
              }}
            >
              <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} />
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isLoading || !selectedIcon}
              style={{ 
                padding: '12px 24px', 
                fontSize: '15px', 
                fontWeight: '500',
                display: 'flex',
                alignItems: 'center',
                backgroundColor: isLoading || !selectedIcon ? '#dc3545' : '#28a745',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                opacity: isLoading || !selectedIcon ? 0.7 : 1,
                cursor: isLoading || !selectedIcon ? 'not-allowed' : 'pointer'
              }}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                  Actualizando...
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} />
                  Actualizar Icono
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChangeCategoryIconModal; 