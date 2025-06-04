import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSave, faSpinner } from '@fortawesome/free-solid-svg-icons';
import styles from '../../../pages/AdminPanel.module.css';
import LoadingAnimation from '../../loadingAnimation';

const ColorPickerModal = ({ show, onClose, onSave, categoriaId, initialColor, categoriaName }) => {
  const [color, setColor] = useState(initialColor || '#000000');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setColor(initialColor || '#000000');
  }, [initialColor]);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onSave(categoriaId, { color });
    setIsLoading(false);
  };

  if (!show) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '400px' }}>
        {isLoading && <LoadingAnimation />}
        <div className={styles['modal-header']}>
          <h2>Cambiar Color de Categoría</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles['modal-body']}>
            <div className={styles['form-group']}>
              <label>Categoría</label>
              <input 
                type="text" 
                value={categoriaName} 
                readOnly 
                className={styles['form-control']} 
                disabled
              />
            </div>
            
            <div className={styles['form-group']}>
              <label>Color</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <input 
                  type="color" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)} 
                  style={{ width: '80px', height: '40px', cursor: 'pointer' }}
                  disabled={isLoading}
                />
                <input 
                  type="text" 
                  value={color} 
                  onChange={(e) => setColor(e.target.value)}
                  className={styles['form-control']}
                  style={{ width: '100px' }}
                  disabled={isLoading}
                />
                <div 
                  style={{ 
                    width: '60px', 
                    height: '40px', 
                    backgroundColor: color, 
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                  }} 
                />
              </div>
            </div>
          </div>
          
          <div className={styles['form-actions']}>
            <button 
              type="button" 
              className={styles['cancel-button']} 
              onClick={onClose}
              disabled={isLoading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className={styles['save-button']}
              disabled={isLoading}
            >
              {isLoading ? 
                <><FontAwesomeIcon icon={faSpinner} spin /> Guardando...</> : 
                <><FontAwesomeIcon icon={faSave} /> Guardar</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ColorPickerModal; 