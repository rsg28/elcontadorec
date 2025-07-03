import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faListAlt, faEdit, faTrash, faPlus, faTimes, 
  faSearch, faExclamationTriangle
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../../pages/AdminPanel.module.css';
import { commonIcons } from '../utils/commonIcons.jsx';

const VerCaracteristicasModal = ({ show, onClose, caracteristicas, onDelete, onCreateNew, onEdit }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCaracteristicas, setFilteredCaracteristicas] = useState([]);

  // Filter characteristics based on search term
  useEffect(() => {
    if (!caracteristicas) {
      setFilteredCaracteristicas([]);
      return;
    }

    if (!searchTerm.trim()) {
      setFilteredCaracteristicas(caracteristicas);
    } else {
      const filtered = caracteristicas.filter(caracteristica =>
        caracteristica.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (caracteristica.descripcion && caracteristica.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredCaracteristicas(filtered);
    }
  }, [caracteristicas, searchTerm]);

  // Reset search when modal closes
  useEffect(() => {
    if (!show) {
      setSearchTerm('');
    }
  }, [show]);

  // Get icon component from string name
  const getIconComponent = (iconName) => {
    const iconData = commonIcons.find(item => item.name === iconName);
    return iconData ? iconData.icon : commonIcons[0].icon; // Default to first icon if not found
  };

  const handleEdit = (caracteristica) => {
    if (onEdit) {
      onEdit(caracteristica);
    }
  };

  const handleDelete = (caracteristicaId, caracteristicaName) => {
    if (onDelete) {
      onDelete(caracteristicaId, caracteristicaName);
    }
  };

  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '800px', minHeight: '600px' }}>
        <div className={styles['modal-header']}>
          <h2>
            <FontAwesomeIcon icon={faListAlt} className={styles['modal-header-icon']} />
            Gestionar Características
          </h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        
        <div className={styles['modal-body']}>
          {/* Search bar */}
          <div className={styles['form-group']} style={{ marginBottom: '20px' }}>
            <label className={styles['form-label']}>
              <FontAwesomeIcon icon={faSearch} className={styles['field-icon']} />
              Buscar características
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
              className={styles['form-control']}
              style={{ paddingLeft: '40px' }}
            />
          </div>

          {/* Characteristics count */}
          <div style={{ marginBottom: '16px', color: '#666', fontSize: '0.9rem' }}>
            {filteredCaracteristicas.length === caracteristicas?.length ? (
              <>Mostrando todas las {caracteristicas?.length || 0} características</>
            ) : (
              <>Mostrando {filteredCaracteristicas.length} de {caracteristicas?.length || 0} características</>
            )}
          </div>

          {/* Characteristics list */}
          {(!caracteristicas || caracteristicas.length === 0) ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: '#666',
              border: '1px dashed #ddd',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <FontAwesomeIcon icon={faExclamationTriangle} size="2x" style={{ marginBottom: '16px', color: '#999' }} />
              <p style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '500' }}>
                No hay características creadas
              </p>
              <p style={{ margin: '0', fontSize: '0.9rem' }}>
                Haz clic en "Nueva Característica" para crear la primera
              </p>
            </div>
          ) : filteredCaracteristicas.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              padding: '40px 20px', 
              color: '#666',
              border: '1px dashed #ddd',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <FontAwesomeIcon icon={faSearch} size="2x" style={{ marginBottom: '16px', color: '#999' }} />
              <p style={{ margin: '0 0 8px 0', fontSize: '1.1rem', fontWeight: '500' }}>
                No se encontraron características
              </p>
              <p style={{ margin: '0', fontSize: '0.9rem' }}>
                Intenta con otros términos de búsqueda
              </p>
            </div>
          ) : (
            <div className={styles['caracteristicas-list']}>
              {filteredCaracteristicas.map(caracteristica => (
                <div key={caracteristica.id_caracteristicas} className={styles['caracteristica-item']}>
                  <div className={styles['caracteristica-info']}>
                    <div 
                      className={styles['caracteristica-icon-container']} 
                      style={{ 
                        backgroundColor: caracteristica.color || '#4285F4',
                        width: '48px',
                        height: '48px',
                        minWidth: '48px'
                      }}
                    >
                      <FontAwesomeIcon 
                        icon={getIconComponent(caracteristica.imagen)} 
                        style={{ fontSize: '20px', color: 'white' }}
                      />
                    </div>
                    <div className={styles['caracteristica-details']}>
                      <h3>{caracteristica.nombre}</h3>
                      <p>{caracteristica.descripcion || 'Sin descripción'}</p>
                      <div style={{ 
                        marginTop: '8px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '12px', 
                        fontSize: '0.8rem', 
                        color: '#888' 
                      }}>
                        <span>Color: {caracteristica.color || '#4285F4'}</span>
                        <span>•</span>
                        <span>Ícono: {caracteristica.imagen || 'folder'}</span>
                      </div>
                    </div>
                  </div>
                  <div className={styles['caracteristica-actions']}>
                    <button 
                      className={styles['edit-button']}
                      onClick={() => handleEdit(caracteristica)}
                      title="Editar característica"
                      style={{
                        backgroundColor: '#4285F4',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#3367d6';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#4285F4';
                      }}
                    >
                      <FontAwesomeIcon icon={faEdit} />
                    </button>
                    <button 
                      className={styles['delete-button']}
                      onClick={() => handleDelete(caracteristica.id_caracteristicas, caracteristica.nombre)}
                      title="Eliminar característica"
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        padding: '8px 12px',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontSize: '14px',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.backgroundColor = '#c82333';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.backgroundColor = '#dc3545';
                      }}
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={styles['form-actions']} style={{ borderTop: '1px solid #eee', paddingTop: '20px' }}>
          <button 
            type="button"
            className={styles['cancel-button']} 
            onClick={onClose}
          >
            <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} />
            Cerrar
          </button>
          <button 
            type="button"
            className={styles['save-button']} 
            onClick={onCreateNew}
            style={{
              background: 'linear-gradient(90deg, #28a745 0%, #20c997 100%)',
              border: 'none'
            }}
          >
            <FontAwesomeIcon icon={faPlus} style={{ marginRight: '8px' }} />
            Nueva Característica
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerCaracteristicasModal; 