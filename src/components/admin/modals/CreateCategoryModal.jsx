import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faEdit, faPalette, faListAlt, faTimes, faSave, 
  faSpinner, faExclamationTriangle, faFolder 
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../../pages/AdminPanel.module.css';
import { commonIcons } from '../utils/commonIcons.jsx';

// Function to normalize text by removing accents/tildes
const normalizeText = (text) => {
  return text
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
    .trim();
};

const CreateCategoryModal = ({ show, onClose, onSave, allCategorias }) => {
  const [categoryData, setCategoryData] = useState({
    nombre: '',
    color: '#4285F4', // Color azul por defecto
    imagen: 'folder' // Icono por defecto (debe coincidir con uno de los nombres en commonIcons)
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
    }

    if (show) {
      document.addEventListener('keydown', handleKeyDown);
      // Reset error when modal opens
      setError('');
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, onClose, isLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCategoryData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (name === 'nombre') {
      setError('');
    }
  };

  const handleColorChange = (e) => {
    setCategoryData(prev => ({
      ...prev,
      color: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Check if category name is empty
    if (!categoryData.nombre.trim()) {
      setError('El nombre de la categoría es requerido');
      return;
    }

    // Check if category name already exists (considering accents as equal)
    const normalizedInputName = normalizeText(categoryData.nombre);
    const categoryExists = allCategorias.some(
      cat => normalizeText(cat.nombre) === normalizedInputName
    );

    if (categoryExists) {
      setError('Ya existe una categoría con este nombre');
      return;
    }

    setIsLoading(true);
    try {
      await onSave(categoryData);
    } catch (error) {
      console.error('Error saving category:', error);
      setError('Error al guardar la categoría');
    } finally {
      setIsLoading(false);
    }
  };

  if (!show) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '450px' }}>
        <div className={styles['modal-header']}>
          <h2><FontAwesomeIcon icon={faPlus} className={styles['modal-header-icon']} /> Nueva Categoría</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles['modal-body']}>
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>
                <FontAwesomeIcon icon={faEdit} className={styles['field-icon']} /> 
                Nombre de Categoría <span className={styles['required-mark']}>*</span>
              </label>
              <div className={styles['form-control-wrapper']}>
                <input 
                  type="text" 
                  name="nombre"
                  value={categoryData.nombre} 
                  onChange={handleInputChange} 
                  className={`${styles['form-control']} ${error ? styles['error-input'] : ''}`}
                  placeholder="Ej: Empresas, Personas, Contabilidad..."
                  required
                  autoFocus
                  disabled={isLoading}
                  autoComplete="off"
                />
                {error && (
                  <div className={styles['error-message']}>
                    <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '5px' }} />
                    {error}
                  </div>
                )}
              </div>
            </div>
            
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>
                <FontAwesomeIcon icon={faPalette} className={styles['field-icon']} /> 
                Color
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <input 
                  type="color" 
                  value={categoryData.color} 
                  onChange={handleColorChange} 
                  style={{ width: '80px', height: '40px', cursor: 'pointer' }}
                  disabled={isLoading}
                />
                <input 
                  type="text" 
                  name="color"
                  value={categoryData.color} 
                  onChange={handleInputChange}
                  className={styles['form-control']}
                  style={{ width: '120px' }}
                  disabled={isLoading}
                  autoComplete="off"
                />
                <div 
                  style={{ 
                    width: '60px', 
                    height: '40px', 
                    backgroundColor: categoryData.color, 
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    boxShadow: 'inset 0 0 0 1px rgba(0,0,0,0.1)'
                  }} 
                />
              </div>
            </div>

            <div className={styles['form-group']}>
              <label className={styles['form-label']}>
                <FontAwesomeIcon icon={faListAlt} className={styles['field-icon']} /> 
                Ícono
              </label>
              <div className={styles['form-control-wrapper']}>
                <select
                  name="imagen"
                  value={categoryData.imagen}
                  onChange={handleInputChange}
                  className={styles['form-control']}
                  disabled={isLoading}
                >
                  {commonIcons.map(({name, icon}) => (
                    <option key={name} value={name}>{name}</option>
                  ))}
                </select>
                <div className={styles['icon-preview']} style={{ marginTop: '10px' }}>
                  <div 
                    style={{ 
                      width: '40px',
                      height: '40px',
                      backgroundColor: categoryData.color,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={commonIcons.find(item => item.name === categoryData.imagen)?.icon || faFolder} 
                      style={{ 
                        fontSize: '20px', 
                        color: 'white'
                      }} 
                    />
                  </div>
                  <span style={{ marginLeft: '10px' }}>Vista previa del ícono</span>
                </div>
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
              <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} /> Cancelar
            </button>
            <button 
              type="submit" 
              className={styles['save-button']}
              disabled={isLoading || !categoryData.nombre.trim() || !!error}
            >
              {isLoading ? 
                <><FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} /> Guardando...</> : 
                <><FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} /> Guardar Categoría</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCategoryModal; 