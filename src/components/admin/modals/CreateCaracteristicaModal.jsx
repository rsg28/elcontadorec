import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faEdit, faPalette, faListAlt, faTimes, faSave, 
  faSpinner, faExclamationTriangle, faStar
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../../pages/AdminPanel.module.css';
import { commonIcons } from '../utils/commonIcons.jsx';

const CreateCaracteristicaModal = ({ show, onClose, onSave, caracteristica = null }) => {
  const isEditing = !!caracteristica;
  
  const [caracteristicaData, setCaracteristicaData] = useState({
    nombre: '',
    descripcion: '',
    color: '#4285F4', // Color azul por defecto
    imagen: 'star' // Icono por defecto
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form with existing data when editing
  useEffect(() => {
    if (show) {
      if (isEditing && caracteristica) {
        setCaracteristicaData({
          nombre: caracteristica.nombre || '',
          descripcion: caracteristica.descripcion || '',
          color: caracteristica.color || '#4285F4',
          imagen: caracteristica.imagen || 'star'
        });
      } else {
        setCaracteristicaData({
          nombre: '',
          descripcion: '',
          color: '#4285F4',
          imagen: 'star'
        });
      }
      setError('');
    }
  }, [show, isEditing, caracteristica]);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCaracteristicaData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (name === 'nombre') {
      setError('');
    }
  };

  const handleColorChange = (e) => {
    setCaracteristicaData(prev => ({
      ...prev,
      color: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if caracteristica name is empty
    if (!caracteristicaData.nombre.trim()) {
      setError('El nombre de la característica es requerido');
      return;
    }

    setIsLoading(true);
    try {
      if (isEditing) {
        await onSave(caracteristica.id_caracteristicas, caracteristicaData);
      } else {
        await onSave(caracteristicaData);
      }
    } catch (error) {
      console.error('Error saving caracteristica:', error);
      setError('Error al guardar la característica');
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '500px', display: 'flex', flexDirection: 'column' }}>
        <div className={styles['modal-header']}>
          <h2>
            <FontAwesomeIcon 
              icon={isEditing ? faEdit : faPlus} 
              className={styles['modal-header-icon']} 
            />
            {isEditing ? 'Editar Característica' : 'Nueva Característica'}
          </h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        <div className={styles['modal-body']} style={{ padding: '30px', flex: 1 }}>
          <div className={styles['form-group']} style={{ marginBottom: '25px' }}>
            <label className={styles['form-label']} style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '600' }}>
              <FontAwesomeIcon icon={faEdit} className={styles['field-icon']} /> 
              Nombre de Característica <span className={styles['required-mark']}>*</span>
            </label>
            <div className={styles['form-control-wrapper']}>
              <input 
                type="text" 
                name="nombre"
                value={caracteristicaData.nombre} 
                onChange={handleInputChange} 
                className={`${styles['form-control']} ${error ? styles['error-input'] : ''}`}
                placeholder="Ej: Seguridad, Confiabilidad, Soporte..."
                required
                autoFocus
                disabled={isLoading}
                autoComplete="off"
                style={{ height: '48px', fontSize: '15px', padding: '12px 16px' }}
              />
              {error && (
                <div className={styles['error-message']} style={{ marginTop: '8px', padding: '10px 14px', borderRadius: '6px' }}>
                  <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '8px' }} />
                  {error}
                </div>
              )}
            </div>
          </div>

          <div className={styles['form-group']} style={{ marginBottom: '25px' }}>
            <label className={styles['form-label']} style={{ marginBottom: '10px', fontSize: '16px', fontWeight: '600' }}>
              <FontAwesomeIcon icon={faEdit} className={styles['field-icon']} /> 
              Descripción
            </label>
            <div className={styles['form-control-wrapper']}>
              <textarea 
                name="descripcion"
                value={caracteristicaData.descripcion} 
                onChange={handleInputChange} 
                className={styles['form-control']}
                placeholder="Describe qué beneficio o característica representa..."
                rows="4"
                disabled={isLoading}
                autoComplete="off"
                style={{ fontSize: '15px', padding: '12px 16px', lineHeight: '1.4' }}
              />
            </div>
          </div>
          
          <div className={styles['form-group']} style={{ marginBottom: '25px' }}>
            <label className={styles['form-label']} style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
              <FontAwesomeIcon icon={faPalette} className={styles['field-icon']} /> 
              Color
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
              <input 
                type="color" 
                value={caracteristicaData.color} 
                onChange={handleColorChange} 
                style={{ width: '80px', height: '48px', cursor: 'pointer', border: 'none', borderRadius: '6px' }}
                disabled={isLoading}
              />
              <input 
                type="text" 
                name="color"
                value={caracteristicaData.color} 
                onChange={handleInputChange}
                className={styles['form-control']}
                style={{ width: '140px', height: '48px', fontSize: '14px', fontFamily: 'monospace' }}
                disabled={isLoading}
                autoComplete="off"
                placeholder="#4285F4"
              />
              <div 
                style={{ 
                  width: '80px', 
                  height: '48px', 
                  backgroundColor: caracteristicaData.color, 
                  border: '2px solid #e9ecef',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  position: 'relative'
                }} 
              >
                <div style={{
                  position: 'absolute',
                  bottom: '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  fontSize: '11px',
                  color: '#666',
                  whiteSpace: 'nowrap'
                }}>
                  Vista previa
                </div>
              </div>
            </div>
          </div>

          <div className={styles['form-group']} style={{ marginBottom: '25px' }}>
            <label className={styles['form-label']} style={{ marginBottom: '12px', fontSize: '16px', fontWeight: '600' }}>
              <FontAwesomeIcon icon={faListAlt} className={styles['field-icon']} /> 
              Ícono
            </label>
            <div className={styles['form-control-wrapper']}>
              <select
                name="imagen"
                value={caracteristicaData.imagen}
                onChange={handleInputChange}
                className={styles['form-control']}
                disabled={isLoading}
                style={{ height: '48px', fontSize: '15px', padding: '12px 16px' }}
              >
                {commonIcons.map(({name, icon}) => (
                  <option key={name} value={name}>{name}</option>
                ))}
              </select>
              <div className={styles['icon-preview']} style={{ marginTop: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div 
                  style={{ 
                    width: '60px',
                    height: '60px',
                    backgroundColor: caracteristicaData.color,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 8px rgba(0,0,0,0.15)',
                    border: '3px solid #fff'
                  }}
                >
                  <FontAwesomeIcon 
                    icon={commonIcons.find(item => item.name === caracteristicaData.imagen)?.icon || faStar} 
                    style={{ 
                      fontSize: '24px', 
                      color: 'white'
                    }} 
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '600', marginBottom: '4px', fontSize: '16px' }}>
                    Vista previa final
                  </div>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    Así se verá la característica en la aplicación
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons - ALWAYS VISIBLE */}
        <div style={{ 
          padding: '25px 30px', 
          borderTop: '1px solid #eee',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '15px',
          flexShrink: 0
        }}>
          <button 
            type="button" 
            onClick={onClose}
            disabled={isLoading}
            style={{ 
              padding: '14px 24px', 
              fontSize: '15px', 
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              transition: 'all 0.2s ease'
            }}
          >
            <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} />
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || !caracteristicaData.nombre.trim() || !!error}
            style={{ 
              padding: '14px 24px', 
              fontSize: '15px', 
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: (isLoading || !caracteristicaData.nombre.trim() || !!error) ? '#dc3545' : '#28a745',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              cursor: (isLoading || !caracteristicaData.nombre.trim() || !!error) ? 'not-allowed' : 'pointer',
              opacity: (isLoading || !caracteristicaData.nombre.trim() || !!error) ? 0.7 : 1,
              transition: 'all 0.2s ease'
            }}
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} />
                Guardando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} />
                {isEditing ? 'Actualizar' : 'Guardar'} Característica
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCaracteristicaModal; 