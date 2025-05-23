import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faEdit, faTrash, faChevronDown, faChevronRight, 
  faSearch, faDollarSign, faFilter, faTimes, faSave, 
  faSpinner, faExclamationTriangle, faPalette, faListAlt, 
  faLink, faFolder, faFileInvoice, faPaperPlane, faLock, 
  faShieldAlt, faUsers, faCalculator, faChartLine, 
  faMoneyBill, faReceipt, faHandHoldingDollar, faWallet, 
  faCoins, faCreditCard, faPercentage, faCheck, faStar, 
  faHeart, faThumbsUp, faBell 
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import useItems from '../hooks/useItems';
import { useAllServicios } from '../hooks/useServicios';
import useSubcategorias from '../hooks/useSubcategorias';
import useCategorias from '../hooks/useCategorias';
import useAuth from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';
import 'react-toastify/dist/ReactToastify.css';
import styles from './AdminPanel.module.css';
import LoadingAnimation from '../components/loadingAnimation';
import useCaracteristicas from '../hooks/useCaracteristicas';

// Hook para gestionar características ya importado desde hooks/useCaracteristicas

// Lista de iconos comunes para elegir con sus referencias - definida globalmente
const commonIcons = [
  { name: 'folder', icon: faFolder },
  { name: 'file-invoice', icon: faFileInvoice },
  { name: 'paper-plane', icon: faPaperPlane },
  { name: 'lock', icon: faLock },
  { name: 'shield-alt', icon: faShieldAlt },
  { name: 'users', icon: faUsers },
  { name: 'calculator', icon: faCalculator },
  { name: 'chart-line', icon: faChartLine },
  { name: 'money-bill', icon: faMoneyBill },
  { name: 'receipt', icon: faReceipt },
  { name: 'hand-holding-dollar', icon: faHandHoldingDollar },
  { name: 'wallet', icon: faWallet },
  { name: 'coins', icon: faCoins },
  { name: 'credit-card', icon: faCreditCard },
  { name: 'percentage', icon: faPercentage },
  { name: 'check', icon: faCheck },
  { name: 'star', icon: faStar },
  { name: 'heart', icon: faHeart },
  { name: 'thumbs-up', icon: faThumbsUp },
  { name: 'bell', icon: faBell }
];

// Item form modal component
const ItemFormModal = ({ show, onClose, onSave, servicios, allSubcategorias, allCategorias, editItem = null }) => {
  // Initialize form state
  const [formData, setFormData] = useState({
    precio: '',
    servicio: '',
    subcategoria: '',
    categoria: '' // Add categoria field
  });

  // State for filtered services based on selected category
  const [filteredServicios, setFilteredServicios] = useState([]);

  // State for autocomplete suggestions
  const [suggestions, setSuggestions] = useState({
    servicios: [],
    subcategorias: []
  });

  // References for input elements
  const servicioInputRef = React.useRef(null);
  const subcategoriaInputRef = React.useRef(null);
  
  // Reset form when modal is opened/closed or editItem changes
  useEffect(() => {
    if (show) {
      if (editItem) {
        // Find service to get its category
        const service = servicios.find(s => s.id_servicio === editItem.id_servicio);
        const categoryId = service ? service.id_categoria : '';
        
        // Fill form with existing item data if editing
        setFormData({
          precio: editItem.precio?.toString() || '',
          servicio: editItem.servicio_nombre || '',
          subcategoria: editItem.subcategoria_nombre || '',
          categoria: categoryId?.toString() || ''
        });
        
        // Filter services by the selected category
        if (categoryId) {
          const filtered = servicios.filter(s => s.id_categoria === categoryId);
          setFilteredServicios(filtered);
        } else {
          setFilteredServicios([]);
        }
      } else {
        // Reset form for new item
        setFormData({
          precio: '',
          servicio: '',
          subcategoria: '',
          categoria: ''
        });
        setFilteredServicios([]);
      }
      // Clear suggestions
      setSuggestions({
        servicios: [],
        subcategorias: []
      });
    }
  }, [show, editItem, servicios]);

  // Update filtered services when category changes
  useEffect(() => {
    if (formData.categoria) {
      const categoryId = parseInt(formData.categoria);
      const filtered = servicios.filter(s => s.id_categoria === categoryId);
      setFilteredServicios(filtered);
      
      // Clear servicio if the selected servicio doesn't belong to the new category
      if (formData.servicio) {
        const servicioExists = filtered.some(s => 
          s.nombre.toLowerCase() === formData.servicio.toLowerCase()
        );
        
        if (!servicioExists) {
          setFormData(prev => ({ ...prev, servicio: '' }));
        }
      }
    } else {
      setFilteredServicios([]);
      
      // Clear servicio when no category is selected
      if (formData.servicio) {
        setFormData(prev => ({ ...prev, servicio: '' }));
      }
    }
  }, [formData.categoria, servicios]);

  // Handle click outside for suggestion dropdowns
  useEffect(() => {
    function handleClickOutside(event) {
      if (servicioInputRef.current && !servicioInputRef.current.contains(event.target)) {
        setSuggestions(prev => ({ ...prev, servicios: [] }));
      }
      if (subcategoriaInputRef.current && !subcategoriaInputRef.current.contains(event.target)) {
        setSuggestions(prev => ({ ...prev, subcategorias: [] }));
      }
    }

    // Handle ESC key press
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setSuggestions({ servicios: [], subcategorias: [] });
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);
  
  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Special validation for precio (only numbers and decimal point)
    if (name === 'precio') {
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setFormData(prev => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));

      // Update suggestions for servicio and subcategoria inputs
      if (name === 'servicio') {
        // Get filtered suggestions based on the selected category
        const servicioSuggestions = filteredServicios
          .filter(s => s.nombre.toLowerCase().includes(value.toLowerCase()))
          .map(s => ({
            id: s.id_servicio,
            nombre: s.nombre,
            categoria: s.id_categoria
          }));
        
        // Check if we have services with same name in other categories
        if (value.trim() !== '') {
          // Find services with same name in other categories
          const servicesInOtherCategories = servicios
            .filter(s => 
              s.nombre.toLowerCase().includes(value.toLowerCase()) && 
              s.id_categoria !== parseInt(formData.categoria)
            )
            .map(s => {
              // Find category name
              const cat = allCategorias.find(c => c.id_categoria === s.id_categoria);
              return {
                id: s.id_servicio,
                nombre: s.nombre,
                categoria: s.id_categoria,
                categoriaName: cat ? cat.nombre : 'Otra categoría'
              };
            });
        }
        
        setSuggestions(prev => ({ ...prev, servicios: servicioSuggestions }));
      } else if (name === 'subcategoria') {
        const filteredSubcategorias = allSubcategorias
          .filter(s => s.nombre.toLowerCase().includes(value.toLowerCase()))
          .map(s => s.nombre);
        setSuggestions(prev => ({ ...prev, subcategorias: filteredSubcategorias }));
      }
    }
  };

  // Handle selection from suggestions
  const handleSuggestionSelect = (type, value) => {
    if (type === 'servicio') {
      // Find the service and ensure it matches the selected category
      const selectedService = filteredServicios.find(s => s.nombre === value);
      if (selectedService) {
        setFormData(prev => ({ ...prev, [type]: value }));
      } else {
        // If not found in current category, check if it exists in another category
        const serviceInOtherCategory = servicios.find(s => 
          s.nombre === value && s.id_categoria !== parseInt(formData.categoria)
        );
        
        if (serviceInOtherCategory) {
          // Warn user about duplicate service name in another category
          alert(`Nota: "${value}" ya existe en otra categoría. Creando nuevo servicio en la categoría actual.`);
        }
        setFormData(prev => ({ ...prev, [type]: value }));
      }
    } else {
      setFormData(prev => ({ ...prev, [type]: value }));
    }
    
    setSuggestions(prev => ({ ...prev, [type + 's']: [] }));
    
    // Focus on the next field
    if (type === 'servicio' && subcategoriaInputRef.current) {
      subcategoriaInputRef.current.querySelector('input').focus();
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validar que tengamos datos requeridos
    if (!formData.categoria) {
      alert('Por favor seleccione una categoría');
      return;
    }
    
    if (!formData.servicio || !formData.servicio.trim()) {
      alert('Por favor ingrese un servicio');
      return;
    }
    
    if (!formData.subcategoria || !formData.subcategoria.trim()) {
      alert('Por favor ingrese una subcategoría');
      return;
    }
    
    if (!formData.precio || isNaN(parseFloat(formData.precio)) || parseFloat(formData.precio) < 0) {
      alert('Por favor ingrese un precio válido');
      return;
    }
    
    // Find or create servicio ID
    let servicioId = null;
    const existingServicio = servicios.find(s => 
      s.nombre.toLowerCase() === formData.servicio.toLowerCase() &&
      s.id_categoria === parseInt(formData.id_categoria || formData.categoria)
    );
    
    if (existingServicio) {
      servicioId = existingServicio.id_servicio;
      
    } else {
      // We'll need to create a new servicio on the backend
      // For now, we'll pass the name and handle creation in the backend
      servicioId = formData.servicio;
      
    }
    
    // Find or create subcategoria ID
    let subcategoriaId = null;
    const existingSubcategoria = allSubcategorias.find(s => 
      s.nombre.toLowerCase() === formData.subcategoria.toLowerCase()
    );
    
    if (existingSubcategoria) {
      subcategoriaId = existingSubcategoria.id_subcategoria;
      
    } else {
      // We'll need to create a new subcategoria on the backend
      // For now, we'll pass the name and handle creation in the backend
      subcategoriaId = formData.subcategoria;
      
    }
    
    // Convert precio to number and process data
    const processedData = {
      nombre: formData.subcategoria, // Use subcategoria as the nombre
      precio: parseFloat(formData.precio) || 0,
      id_servicio: servicioId,
      id_subcategoria: subcategoriaId,
      servicio_nombre: formData.servicio,
      subcategoria_nombre: formData.subcategoria,
      id_categoria: formData.categoria // Pass the selected category ID
    };
    
    
    onSave(processedData, editItem?.id_item);
  };

  // Handle key event for navigating between fields
  const handleKeyDown = (e, fieldName) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      if (fieldName === 'categoria') {
        if (servicioInputRef.current) {
          servicioInputRef.current.querySelector('input').focus();
        }
      } else if (fieldName === 'servicio' && subcategoriaInputRef.current) {
        subcategoriaInputRef.current.querySelector('input').focus();
      } else if (fieldName === 'subcategoria') {
        // Trigger form submission
        handleSubmit(e);
      }
    }
  };
  
  // Inside ItemFormModal component, add an effect for keydown events
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    // Only add the event listener when the modal is shown
    if (show) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, onClose]);
  
  // Render the modal
  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '550px' }}>
        <div className={styles['modal-header']} style={{ borderRadius: '8px 8px 0 0' }}>
          <h2>
            {editItem ? (
              <><FontAwesomeIcon icon={faEdit} className={styles['modal-header-icon']} /> Editar Ítem</>
            ) : (
              <><FontAwesomeIcon icon={faPlus} className={styles['modal-header-icon']} /> Agregar Nuevo Ítem</>
            )}
          </h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className={styles['modal-body']} style={{ padding: '25px 30px' }}>
            <div className={styles['form-grid']}>
              <div className={styles['form-group']} style={{ marginBottom: '25px' }}>
                <label htmlFor="categoria" className={styles['form-label']}>
                  <FontAwesomeIcon icon={faFilter} className={styles['field-icon']} /> 
                Categoría <span className={styles['required-mark']}>*</span>
              </label>
                <div className={styles['form-control-wrapper']}>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'categoria')}
                required
                className={styles['form-control']}
              >
                <option value="">Seleccione una categoría</option>
                {allCategorias.map(categoria => (
                      <option 
                        key={categoria.id_categoria} 
                        value={categoria.id_categoria}
                        style={{ color: '#333' }}
                      >
                    {categoria.nombre}
                  </option>
                ))}
              </select>
                </div>
            </div>
            
              <div className={styles['form-group']} style={{ marginBottom: '25px' }}>
                <label htmlFor="servicio" className={styles['form-label']}>
                  <FontAwesomeIcon icon={faEdit} className={styles['field-icon']} /> 
                Servicio <span className={styles['required-mark']}>*</span>
              </label>
              <div className={styles['autocomplete-container']} ref={servicioInputRef}>
                  <div className={styles['form-control-wrapper']}>
                <input
                  id="servicio"
                  type="text"
                  name="servicio"
                  value={formData.servicio}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'servicio')}
                  required
                  placeholder={formData.categoria ? "Escriba para buscar o agregar servicio" : "Seleccione primero una categoría"}
                  className={styles['form-control']}
                  disabled={!formData.categoria}
                  autoComplete="off"
                />
                    {!formData.servicio && formData.categoria && 
                      <FontAwesomeIcon icon={faSearch} className={styles['input-icon']} />
                    }
                  </div>
                {suggestions.servicios.length > 0 && (
                  <ul className={styles['suggestions-list']}>
                    {suggestions.servicios.map((suggestion, index) => (
                      <li 
                        key={index}
                        onClick={() => handleSuggestionSelect('servicio', suggestion.nombre)}
                      >
                          <FontAwesomeIcon icon={faEdit} className={styles['suggestion-icon']} />
                        {suggestion.nombre}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {!formData.categoria && (
                  <div className={styles['field-description']}>
                    <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '5px', fontSize: '12px', color: '#f39c12' }} />
                    Primero seleccione una categoría para ver servicios disponibles
                  </div>
              )}
            </div>
            
              <div className={styles['form-group']} style={{ marginBottom: '25px' }}>
                <label htmlFor="subcategoria" className={styles['form-label']}>
                  <FontAwesomeIcon icon={faFilter} className={styles['field-icon']} /> 
                Subcategoría <span className={styles['required-mark']}>*</span>
              </label>
              <div className={styles['autocomplete-container']} ref={subcategoriaInputRef}>
                  <div className={styles['form-control-wrapper']}>
                <input
                  id="subcategoria"
                  type="text"
                  name="subcategoria"
                  value={formData.subcategoria}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'subcategoria')}
                  required
                  placeholder="Escriba para buscar o agregar subcategoría"
                  className={styles['form-control']}
                  autoComplete="off"
                />
                    {!formData.subcategoria && 
                      <FontAwesomeIcon icon={faSearch} className={styles['input-icon']} />
                    }
                  </div>
                {suggestions.subcategorias.length > 0 && (
                  <ul className={styles['suggestions-list']}>
                    {suggestions.subcategorias.map((suggestion, index) => (
                      <li 
                        key={index}
                        onClick={() => handleSuggestionSelect('subcategoria', suggestion)}
                      >
                          <FontAwesomeIcon icon={faFilter} className={styles['suggestion-icon']} />
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

              <div className={styles['form-group']} style={{ marginBottom: '25px' }}>
                <label htmlFor="precio" className={styles['form-label']}>
                  <FontAwesomeIcon icon={faDollarSign} className={styles['field-icon']} /> 
                Precio <span className={styles['required-mark']}>*</span>
              </label>
              <div className={styles['enhanced-price-input']}>
                <span className={styles['currency-symbol']}>$</span>
                <input
                  id="precio"
                  type="text"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  inputMode="decimal"
                  className={`${styles['form-control']} ${styles['price-control']}`}
                  autoComplete="off"
                />
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles['form-actions']} style={{ padding: '20px 30px', borderTop: '1px solid #eee' }}>
            <button type="button" className={styles['cancel-button']} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} /> Cancelar
            </button>
            <button type="submit" className={styles['save-button']}>
              <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} /> {editItem ? 'Actualizar' : 'Guardar'} Ítem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para confirmar la eliminación de un servicio
const DeleteServiceModal = ({ show, onClose, onConfirm, servicioName, itemCount, subcategoriaCount }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  // Add effect for escape key
  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      }
    }

    // Only add the event listener when the modal is shown
    if (show) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    // Clean up
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, onClose, isLoading]);
  
  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };
  
  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        {isLoading && <LoadingAnimation />}
        <div className={styles['modal-header']}>
          <h2>Eliminar Servicio</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        <div className={styles['modal-body']}>
          <div className={styles['warning-icon']}>
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" color="#e74c3c" />
          </div>
          <p className={styles['warning-message']}>
            Está a punto de eliminar el servicio <strong>{servicioName}</strong> y todos sus elementos asociados.
          </p>
          <p className={styles['warning-details']}>
            Esta acción eliminará:
          </p>
          <ul className={styles['warning-items']}>
            <li>{subcategoriaCount} subcategoría(s)</li>
            <li>{itemCount} ítem(s)</li>
          </ul>
          <p className={styles['warning-permanent']}>
            Esta acción no se puede deshacer. ¿Está seguro que desea continuar?
          </p>
        </div>
        
        <div className={styles['modal-footer']}>
          <button 
            className={styles['cancel-button']} 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className={styles['delete-button']} 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 
              <><FontAwesomeIcon icon={faSpinner} spin /> Eliminando...</> : 
              <><FontAwesomeIcon icon={faTrash} /> Eliminar Servicio</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// Add DeleteItemModal component after DeleteServiceModal
const DeleteItemModal = ({ show, onClose, onConfirm, itemName, isLastItem }) => {
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };
  
  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        {isLoading && <LoadingAnimation />}
        <div className={styles['modal-header']}>
          <h2>Eliminar Ítem</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        <div className={styles['modal-body']}>
          <div className={styles['warning-icon']}>
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" color="#e74c3c" />
          </div>
          <p className={styles['warning-message']}>
            ¿Está seguro que desea eliminar este ítem?
          </p>
          {isLastItem && (
            <div className={styles['warning-details']}>
              <p className={styles['warning-text']}>
                <FontAwesomeIcon icon={faExclamationTriangle} className={styles['warning-icon-small']} />
                Este es el último ítem de este servicio. Al eliminarlo, también se eliminará el servicio completo.
              </p>
            </div>
          )}
          <p className={styles['warning-permanent']}>
            Esta acción no se puede deshacer.
          </p>
        </div>
        
        <div className={styles['modal-footer']}>
          <button 
            className={styles['cancel-button']} 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className={styles['delete-button']} 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 
              <><FontAwesomeIcon icon={faSpinner} spin /> Eliminando...</> : 
              <><FontAwesomeIcon icon={faTrash} /> Eliminar {isLastItem ? 'Servicio' : 'Ítem'}</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};



// Add ColorPickerModal component
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

  const handleColorChange = (e) => {
    setColor(e.target.value);
  };

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
                  onChange={handleColorChange} 
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

// Agregar el componente modal para crear categorías después del ColorPickerModal
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

    // Check if category name already exists
    const categoryExists = allCategorias.some(
      cat => cat.nombre.toLowerCase() === categoryData.nombre.toLowerCase().trim()
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
        {isLoading && <LoadingAnimation />}
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

// Add DeleteCategoryModal component
const DeleteCategoryModal = ({ show, onClose, onConfirm, categoryName, serviceCount }) => {
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };
  
  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']}>
        {isLoading && <LoadingAnimation />}
        <div className={styles['modal-header']}>
          <h2>Eliminar Categoría</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        <div className={styles['modal-body']}>
          <div className={styles['warning-icon']}>
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" color="#e74c3c" />
          </div>
          <p className={styles['warning-message']}>
            Está a punto de eliminar la categoría <strong>{categoryName}</strong> y todos sus elementos asociados.
          </p>
          <p className={styles['warning-details']}>
            Esta acción eliminará:
          </p>
          <ul className={styles['warning-items']}>
            <li>{serviceCount} servicio(s) y todos sus ítems</li>
          </ul>
          <p className={styles['warning-permanent']}>
            Esta acción no se puede deshacer. ¿Está seguro que desea continuar?
          </p>
        </div>
        
        <div className={styles['modal-footer']}>
          <button 
            className={styles['cancel-button']} 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className={styles['delete-button']} 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 
              <><FontAwesomeIcon icon={faSpinner} spin /> Eliminando...</> : 
              <><FontAwesomeIcon icon={faTrash} /> Eliminar Categoría</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal para crear una nueva característica
const CreateCaracteristicaModal = ({ show, onClose, onSave }) => {
  const [caracteristicaData, setCaracteristicaData] = useState({
    nombre: '',
    descripcion: '',
    color: '#4285F4', // Color azul por defecto
    imagen: 'star' // Icono por defecto (debe coincidir con uno de los nombres en commonIcons)
  });
  const [isLoading, setIsLoading] = useState(false);
  const formRef = useRef(null);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === 'Escape' && !isLoading) {
        onClose();
      } else if (event.key === 'Enter' && event.ctrlKey && !isLoading) {
        // Submit form with Ctrl+Enter
        formRef.current?.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
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
  };

  const handleColorChange = (e) => {
    setCaracteristicaData(prev => ({
      ...prev,
      color: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!caracteristicaData.nombre.trim()) {
      return; // Don't submit if name is empty
    }
    
    setIsLoading(true);
    try {
      await onSave(caracteristicaData);
      // Form was submitted successfully
    } catch (error) {
      console.error("Error saving characteristic:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // We're using the global commonIcons array defined at the top of this file

  if (!show) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '500px' }}>
        {isLoading && <LoadingAnimation />}
        <div className={styles['modal-header']} style={{ background: '#4a6cf7' }}>
          <h2><FontAwesomeIcon icon={faPlus} className={styles['modal-header-icon']} /> Nueva Característica</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        <form ref={formRef} onSubmit={handleSubmit} autoComplete="off">
          <div className={styles['modal-body']} style={{ maxHeight: '60vh', overflowY: 'auto' }}>
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>
                <FontAwesomeIcon icon={faEdit} className={styles['field-icon']} /> 
                Nombre de Característica <span style={{ color: 'red' }}>*</span>
              </label>
              <div className={styles['form-control-wrapper']}>
                <input 
                  type="text" 
                  name="nombre"
                  value={caracteristicaData.nombre} 
                  onChange={handleInputChange} 
                  className={styles['form-control']}
                  placeholder="Ej: Atención personalizada, Soporte 24/7..."
                  required
                  autoFocus
                  disabled={isLoading}
                  autoComplete="off"
                />
              </div>
            </div>
            
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>
                <FontAwesomeIcon icon={faEdit} className={styles['field-icon']} /> 
                Descripción
              </label>
              <div className={styles['form-control-wrapper']}>
                <textarea 
                  name="descripcion"
                  value={caracteristicaData.descripcion} 
                  onChange={handleInputChange} 
                  className={styles['form-control']}
                  placeholder="Describa esta característica..."
                  rows="3"
                  disabled={isLoading}
                  autoComplete="off"
                />
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
                  value={caracteristicaData.color} 
                  onChange={handleColorChange} 
                  style={{ width: '80px', height: '40px', cursor: 'pointer' }}
                  disabled={isLoading}
                />
                <input 
                  type="text" 
                  name="color"
                  value={caracteristicaData.color} 
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
                    backgroundColor: caracteristicaData.color, 
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
                  value={caracteristicaData.imagen}
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
                      backgroundColor: caracteristicaData.color,
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={commonIcons.find(item => item.name === caracteristicaData.imagen)?.icon || faStar} 
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
          
          <div className={styles['form-actions']} style={{ padding: '20px', gap: '20px' }}>
            <button 
              type="button" 
              className={styles['cancel-button']} 
              onClick={onClose}
              disabled={isLoading}
              style={{ minWidth: '120px', padding: '12px 20px' }}
            >
              <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} /> Cancelar
            </button>
            <button 
              type="submit" 
              className={styles['save-button']}
              disabled={isLoading || !caracteristicaData.nombre.trim()}
              style={{ 
                fontSize: '1rem',
                padding: '12px 24px',
                background: '#4CAF50',
                minWidth: '220px', 
                fontWeight: 'bold',
                boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
              }}
            >
              {isLoading ? 
                <><FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} /> Guardando...</> : 
                <>
                  <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} /> 
                  GUARDAR CARACTERÍSTICA
                </>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Modal para asignar una característica a un servicio
const AssignCaracteristicaModal = ({ show, onClose, onSave, allServicios, allCaracteristicas }) => {
  const [assignData, setAssignData] = useState({
    servicioId: '',
    caracteristicaId: ''
  });
  const [isLoading, setIsLoading] = useState(false);

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
    setAssignData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await onSave(assignData.servicioId, assignData.caracteristicaId);
    setIsLoading(false);
  };

  if (!show) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '500px' }}>
        {isLoading && <LoadingAnimation />}
        <div className={styles['modal-header']}>
          <h2><FontAwesomeIcon icon={faLink} className={styles['modal-header-icon']} /> Asignar Característica a Servicio</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        <form onSubmit={handleSubmit} autoComplete="off">
          <div className={styles['modal-body']}>
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>
                <FontAwesomeIcon icon={faListAlt} className={styles['field-icon']} /> 
                Servicio
              </label>
              <div className={styles['form-control-wrapper']}>
                <select
                  name="servicioId"
                  value={assignData.servicioId}
                  onChange={handleInputChange}
                  className={styles['form-control']}
                  required
                  disabled={isLoading}
                >
                  <option value="">Seleccione un servicio</option>
                  {allServicios.map(servicio => (
                    <option key={servicio.id_servicio} value={servicio.id_servicio}>
                      {servicio.nombre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>
                <FontAwesomeIcon icon={faListAlt} className={styles['field-icon']} /> 
                Característica
              </label>
              <div className={styles['form-control-wrapper']}>
                <select
                  name="caracteristicaId"
                  value={assignData.caracteristicaId}
                  onChange={handleInputChange}
                  className={styles['form-control']}
                  required
                  disabled={isLoading}
                >
                  <option value="">Seleccione una característica</option>
                  {allCaracteristicas.map(caracteristica => (
                    <option key={caracteristica.id_caracteristicas} value={caracteristica.id_caracteristicas}>
                      {caracteristica.nombre}
                    </option>
                  ))}
                </select>
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
              disabled={isLoading || !assignData.servicioId || !assignData.caracteristicaId}
            >
              {isLoading ? 
                <><FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} /> Asignando...</> : 
                <><FontAwesomeIcon icon={faLink} style={{ marginRight: '8px' }} /> Asignar Característica</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Add DeleteCaracteristicaModal component after AssignCaracteristicaModal
const DeleteCaracteristicaModal = ({ show, onClose, onConfirm, caracteristicaName, serviciosCount }) => {
  const [isLoading, setIsLoading] = useState(false);

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

  const handleConfirm = async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
  };

  if (!show) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '450px' }}>
        {isLoading && <LoadingAnimation />}
        <div className={styles['modal-header']}>
          <h2>Eliminar Característica</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        <div className={styles['modal-body']}>
          <div className={styles['warning-icon']}>
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" color="#e74c3c" />
          </div>
          <p className={styles['warning-message']}>
            Está a punto de eliminar la característica <strong>{caracteristicaName}</strong>.
          </p>
          
          {serviciosCount > 0 && (
            <>
              <p className={styles['warning-details']}>
                Esta acción eliminará:
              </p>
              <ul className={styles['warning-items']}>
                <li>La relación con {serviciosCount} servicio(s)</li>
              </ul>
            </>
          )}
          
          <p className={styles['warning-permanent']}>
            Esta acción no se puede deshacer. ¿Está seguro que desea continuar?
          </p>
        </div>
        
        <div className={styles['modal-footer']}>
          <button 
            className={styles['cancel-button']} 
            onClick={onClose}
            disabled={isLoading}
          >
            Cancelar
          </button>
          <button 
            className={styles['delete-button']} 
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? 
              <><FontAwesomeIcon icon={faSpinner} spin /> Eliminando...</> : 
              <><FontAwesomeIcon icon={faTrash} /> Eliminar Característica</>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

// Add a new VerCaracteristicasModal component to list and manage characteristics
const VerCaracteristicasModal = ({ show, onClose, caracteristicas, onDelete, onCreateNew }) => {
  const [isLoading, setIsLoading] = useState(false);
  
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
  
  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '700px' }}>
        {isLoading && <LoadingAnimation />}
        <div className={styles['modal-header']}>
          <h2><FontAwesomeIcon icon={faListAlt} className={styles['modal-header-icon']} /> Gestionar Características</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        <div className={styles['modal-body']} style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {caracteristicas.length === 0 ? (
            <div className={styles['no-data']}>
              No hay características disponibles
            </div>
          ) : (
            <div className={styles['caracteristicas-list']}>
              {caracteristicas.map(caract => (
                <div key={caract.id_caracteristicas} className={styles['caracteristica-item']}>
                  <div className={styles['caracteristica-info']}>
                    <div 
                      className={styles['caracteristica-icon-container']} 
                      style={{ backgroundColor: caract.color || '#4285F4' }}
                    >
                      <FontAwesomeIcon 
                        icon={commonIcons.find(item => item.name === caract.imagen)?.icon || faStar}
                        style={{ color: 'white' }}
                      />
                    </div>
                    <div className={styles['caracteristica-details']}>
                      <h3>{caract.nombre}</h3>
                      {caract.descripcion && <p>{caract.descripcion}</p>}
                    </div>
                  </div>
                  <div className={styles['caracteristica-actions']}>
                    <button 
                      className={styles['action-button']}
                      onClick={() => onDelete(caract.id_caracteristicas, caract.nombre)}
                      title="Eliminar característica"
                    >
                      <FontAwesomeIcon icon={faTrash} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className={styles['modal-footer']}>
          <button 
            className={styles['cancel-button']} 
            onClick={onClose}
          >
            Cerrar
          </button>
          <button 
            className={styles['save-button']}
            onClick={onCreateNew}
            style={{ 
              background: '#4CAF50',
              color: 'white'
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

// Add EditServiceDescriptionModal component after other modal components
const EditServiceDescriptionModal = ({ show, onClose, onSave, servicioName, initialDescription }) => {
  const [description, setDescription] = useState(initialDescription || '');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setDescription(initialDescription || '');
  }, [initialDescription]);

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
    await onSave(description);
    setIsLoading(false);
  };

  if (!show) return null;

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '600px' }}>
        {isLoading && <LoadingAnimation />}
        <div className={styles['modal-header']}>
          <h2><FontAwesomeIcon icon={faEdit} className={styles['modal-header-icon']} /> Editar Descripción del Servicio</h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className={styles['modal-body']}>
            <div className={styles['form-group']}>
              <label className={styles['form-label']}>
                <FontAwesomeIcon icon={faEdit} className={styles['field-icon']} /> 
                Descripción
              </label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)}
                className={styles['form-control']}
                rows="6"
                placeholder="Ingrese la descripción del servicio..."
                disabled={isLoading}
                autoFocus
              />
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
              disabled={isLoading}
            >
              {isLoading ? 
                <><FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '8px' }} /> Guardando...</> : 
                <><FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} /> Guardar Descripción</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { 
    items: itemsWithDetails, 
    loading: itemsLoading, 
    error: itemsError, 
    deleteItem, 
    addItem, 
    updateItem,
    refreshItems,
    updateLocalItems,
    setItemsWithDetails
  } = useItems();
  const { 
    servicios: allServicios, 
    loading: serviciosLoading, 
    error: serviciosError, 
    createServicio, 
    createSubcategoria,
    deleteServicio,
    updateServicio,
    fetchAllServicios,
    setServicios: setAllServicios 
  } = useAllServicios();
  const { subcategorias: allSubcategorias, loading: subcategoriasLoading, error: subcategoriasError } = useSubcategorias();
  const { 
    categorias: allCategorias, 
    loading: categoriasLoading, 
    error: categoriasError, 
    updateCategoria,
    createCategoria,
    deleteCategoria
  } = useCategorias();
  const { 
    caracteristicas: allCaracteristicas, 
    loading: caracteristicasLoading, 
    error: caracteristicasError,
    createCaracteristica,
    assignCaracteristicaToServicio,
    deleteCaracteristica,
    fetchCaracteristicas,
    addCaracteristicaToServicio
  } = useCaracteristicas();
  const { success, error: showError, warning, info, ToastContainer } = useNotifications();
  
  const [adminChecking, setAdminChecking] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  const [expandedItems, setExpandedItems] = useState({});
  const [showItemForm, setShowItemForm] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    minPrice: '',
    maxPrice: '',
    servicioId: 'all',
    categoriaId: 'all'
  });
  
  // Estado para manejar la eliminación de servicios
  const [deleteServiceState, setDeleteServiceState] = useState({
    show: false,
    servicioId: null,
    servicioName: '',
    itemCount: 0,
    subcategoriaCount: 0,
    isLoading: false
  });
  
  // Add state for tracking which field is being edited
  const [editingState, setEditingState] = useState({
    itemId: null,
    field: null,
    value: '',
    isLoading: false,
    originalValue: ''
  });

  // Add other state variables
  const [expandedServices, setExpandedServices] = useState({});
  const [updatedServiceNames, setUpdatedServiceNames] = useState({});
  const [updatedSubcategoryNames, setUpdatedSubcategoryNames] = useState({});
  const [updatedPrices, setUpdatedPrices] = useState({});
  
  // Add a ref to track if this is the initial load
  const isInitialLoadRef = useRef(true);
  
  // Loading and error states
  const loading = itemsLoading || 
                 caracteristicasLoading ||
                 ((!itemsWithDetails || itemsWithDetails.length === 0) && !error) || 
                 (allServicios.length === 0 && !serviciosError) ||
                 (allCategorias.length === 0 && !categoriasError);
  const error = itemsError || serviciosError || subcategoriasError || categoriasError || caracteristicasError;
  
  // Check if user is authenticated and admin
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount

    const checkAccess = async () => {
      try {
        // Check authentication first
        if (!isAuthenticated()) {
          
          alert('Acceso restringido. Debe iniciar sesión.');
          navigate('/');
          return;
        }

        
        
        // Now check admin status (properly awaiting the async function)
        const adminStatus = await isAdmin();
        
        
        if (isMounted) {
          if (!adminStatus) {
            
            alert('Acceso restringido. Solo los administradores pueden acceder a esta página.');
            navigate('/');
          } else {
            
            setIsAdminUser(true);
          }
          setAdminChecking(false);
        }
      } catch (error) {
        console.error('Error checking access:', error);
        if (isMounted) {
          alert('Error al verificar permisos. Por favor, intente nuevamente.');
          navigate('/');
        }
      }
    };
    
    checkAccess();
    
    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, isAdmin, navigate]);

  // Use useMemo to calculate filtered items based on new filter structure
  const filteredItems = useMemo(() => {
    return itemsWithDetails.filter(item => {
      // If no filters are applied, show all items
      if (filters.searchTerm === '' && filters.minPrice === '' && filters.maxPrice === '' && 
          filters.servicioId === 'all' && filters.categoriaId === 'all') {
        return true;
      }
      
      const searchTermLower = filters.searchTerm.toLowerCase().trim();
      
      // Filter by service name
      const matchesServiceName = item.servicio_nombre?.toLowerCase().includes(searchTermLower);
      
      // Filter by subcategory name
      const matchesSubcategoryName = item.subcategoria_nombre?.toLowerCase().includes(searchTermLower);
      
      // Filter by price
      const price = parseFloat(item.precio || 0);
      const minPrice = filters.minPrice !== '' ? parseFloat(filters.minPrice) : 0;
      const maxPrice = filters.maxPrice !== '' ? parseFloat(filters.maxPrice) : Infinity;
      const matchesPrice = price >= minPrice && price <= maxPrice;
      
      // Filter by selected service
      const matchesSelectedService = filters.servicioId === 'all' || 
                                    item.id_servicio === parseInt(filters.servicioId);
      
      // Filter by selected categoria
      let matchesSelectedCategoria = true;
      if (filters.categoriaId !== 'all') {
        // Find the service for this item
        const service = allServicios.find(s => s.id_servicio === item.id_servicio);
        // Check if the service's categoria matches the selected one
        matchesSelectedCategoria = service && service.id_categoria === parseInt(filters.categoriaId);
      }
      
      // Combine all filters
      const matchesSearch = searchTermLower === '' || 
                           matchesServiceName || 
                           matchesSubcategoryName;
      
      return matchesSearch && matchesPrice && matchesSelectedService && matchesSelectedCategoria;
    });
  }, [itemsWithDetails, filters, allServicios]);

  // Auto-expand first few items when search term is applied
  useEffect(() => {
    if (filters.searchTerm.trim() !== '') {
      // Expand first 3 items in search results if not already expanded
      const newExpandedItems = { ...expandedItems };
      
      filteredItems.slice(0, 3).forEach(item => {
        const itemId = item.id_items || item.id_item;
        if (itemId && !newExpandedItems[itemId]) {
          newExpandedItems[itemId] = true;
        }
      });
      
      setExpandedItems(newExpandedItems);
    }
  }, [filters.searchTerm, filteredItems]);

  // Toggle item expansion
  const toggleItemExpansion = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Handle real-time filter change
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Debounced price filter to avoid too many re-renders when typing numbers
  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    // Only allow numbers and a single decimal point
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      minPrice: '',
      maxPrice: '',
      servicioId: 'all',
      categoriaId: 'all'
    });
  };
  
  // Count total filtered results
  const filteredCount = filteredItems.length;
  const totalCount = itemsWithDetails.length;

  // Handler for adding a new item
  const handleAddItem = () => {
    try {
      // First, set the form state to show the modal immediately
      setCurrentEditItem(null);
      setShowItemForm(true);
      
      // Then optionally refresh data (removed await to prevent blocking)
      
      
      // Save current expanded state
      const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
      
      // Update services list in the background
      fetchAllServicios()
        .then(() => {
          // Restore expanded state after fetch
          setExpandedServices(currentExpandedState);
        })
        .catch(error => {
          console.error('Error fetching services:', error);
          // Don't hide the form if this fails
        });
    } catch (error) {
      console.error('Error al preparar formulario de ítem:', error);
      alert('Hubo un problema al preparar el formulario. Por favor, intente nuevamente.');
      // Ensure form shows even if there's an error
      setShowItemForm(true);
    }
  };
  
  // Handler for editing an item
  const handleEdit = async (type, id) => {
    if (type === 'item') {
      try {
        // Refrescar datos primero
        
        await fetchAllServicios();
        
        // Buscar el ítem después de refrescar los datos
        const itemToEdit = itemsWithDetails.find(item => (item.id_items === id || item.id_item === id));
        if (itemToEdit) {
          setCurrentEditItem(itemToEdit);
          setShowItemForm(true);
        } else {
          console.error('No se encontró el ítem a editar con ID:', id);
          alert('No se pudo encontrar el ítem a editar. Por favor, intente nuevamente.');
        }
      } catch (error) {
        console.error('Error al preparar edición de ítem:', error);
        alert('Hubo un problema al preparar la edición. Por favor, intente nuevamente.');
      }
    } else {
      alert(`Editar ${type} con ID: ${id}`);
    }
  };

  // Add a function to force refresh filteredItems
  const forceRefresh = () => {
    // Force a recomputation of filteredItems by toggling a filter value back and forth
    // This is a workaround to ensure newly added items are included in search results
    if (filters.searchTerm) {
      const currentSearch = filters.searchTerm;
      // Add a space to the search term to force a change
      setFilters(prev => ({...prev, searchTerm: currentSearch + ' '}));
      // Then quickly revert back to the original search term
      setTimeout(() => {
        setFilters(prev => ({...prev, searchTerm: currentSearch}));
      }, 10);
    } else {
      // If no search term, briefly toggle min price
      const currentMinPrice = filters.minPrice;
      setFilters(prev => ({...prev, minPrice: '0'}));
      setTimeout(() => {
        setFilters(prev => ({...prev, minPrice: currentMinPrice}));
      }, 10);
    }
  };

  // Handler for saving or updating an item
  const handleSaveItem = async (itemData, itemId) => {
    try {
      
      
      // Validar que tengamos datos básicos
      if (!itemData.id_categoria) {
        alert('Por favor seleccione una categoría');
        return;
      }
      
      if (!itemData.servicio_nombre || !itemData.subcategoria_nombre) {
        alert('Por favor complete todos los campos requeridos');
        return;
      }
      
      // If new service needs to be created
      if (typeof itemData.id_servicio === 'string' && isNaN(parseInt(itemData.id_servicio))) {
        
        
        try {
          // Check if service with same name already exists in this category
          const existingService = allServicios.find(s => 
            s.nombre.toLowerCase() === itemData.id_servicio.toLowerCase() && 
            s.id_categoria === parseInt(itemData.id_categoria)
          );
          
          if (existingService) {
            // We'll use the existing service instead of creating a new one
            warning(`Ya existe un servicio con el nombre "${itemData.id_servicio}" en esta categoría. Se usará el servicio existente.`);
            itemData.id_servicio = existingService.id_servicio;
          } else {
            // Create the new service
            const result = await createServicio({ 
              nombre: itemData.id_servicio,
              id_categoria: parseInt(itemData.id_categoria) // Use the selected category ID
            });
            
            if (result.success) {
              // Update the item data with the new service ID
              itemData.id_servicio = result.data.id_servicio;
              
            } else {
              showError(`Error al crear servicio: ${result.error}`);
              return;
            }
          }
        } catch (serviceError) {
          console.error('Error al crear servicio:', serviceError);
          showError(`Error al crear servicio: ${serviceError.message}`);
          return;
        }
      }
      
      // If new subcategory needs to be created
      if (typeof itemData.id_subcategoria === 'string' && isNaN(parseInt(itemData.id_subcategoria))) {
        // Validar que el servicio exista antes de crear la subcategoría
        if (!itemData.id_servicio || isNaN(parseInt(itemData.id_servicio))) {
          showError('Error: El servicio no existe o no es válido');
          return;
        }
        
        try {
          // Check if subcategory with same name already exists for this service
          const existingSubcategory = allSubcategorias.find(s => 
            s.nombre.toLowerCase() === itemData.id_subcategoria.toLowerCase() &&
            s.id_servicio === itemData.id_servicio
          );
          
          if (existingSubcategory) {
            // Use existing subcategory
            warning(`Ya existe una subcategoría con el nombre "${itemData.id_subcategoria}" para este servicio. Se usará la subcategoría existente.`);
            itemData.id_subcategoria = existingSubcategory.id_subcategoria;
            itemData.subcategoria_nombre = existingSubcategory.nombre;
          } else {
            // Try to create the subcategory
            const result = await createSubcategoria({ 
              nombre: itemData.id_subcategoria,
              id_servicio: itemData.id_servicio
            });
            
            if (result.success) {
              // Update the item data with the new subcategory ID
              itemData.id_subcategoria = result.data.id_subcategoria;
              // Ensure the subcategoria_nombre is set
              itemData.subcategoria_nombre = result.data.nombre;
            } else {
              showError(`Error al crear subcategoría: ${result.error}`);
              return;
            }
          }
        } catch (subcatError) {
          console.error('Error al crear subcategoría:', subcatError);
          showError(`Error al crear subcategoría: ${subcatError.message}`);
          return;
        }
      }
      
      // Check if an item with this combination already exists
      const existingItem = itemsWithDetails.find(item => 
        item.id_servicio === itemData.id_servicio &&
        item.id_subcategoria === itemData.id_subcategoria &&
        (itemId ? (item.id_items !== itemId && item.id_item !== itemId) : true)
      );
      
      if (existingItem) {
        // Show an error message about the duplicate
        warning(`Ya existe un ítem con este servicio (${itemData.servicio_nombre}) y subcategoría (${itemData.subcategoria_nombre}). No se puede crear un duplicado.`);
        return;
      }
      
      // Now proceed with item creation/update
      if (itemId) {
        const result = await updateItem(itemId, itemData);
        if (result.success) {
          setShowItemForm(false);
          setCurrentEditItem(null);
          
          // Save current expanded state with deep copy
          const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
          
          // Refresh items to show changes immediately
          await refreshItems();
          
          // Force a refresh of the filtered items
          forceRefresh();
          
          // Restore expanded state
          setExpandedServices(currentExpandedState);
          
          success('Item actualizado correctamente');
        } else {
          showError(`Error al actualizar ítem: ${result.error}`);
        }
      } else {
        const result = await addItem(itemData);
        if (result.success) {
          setShowItemForm(false);
          
          // Store the new item's service name for immediate display
          if (result.data && result.data.id_servicio) {
            // Update updatedServiceNames to ensure the UI shows the correct name immediately
            // setUpdatedServiceNames(prev => ({...prev, [result.data.id_servicio]: itemData.servicio_nombre}));
            
            // Also update the local items immediately instead of waiting for refresh
            const newItem = {
              ...result.data,
              servicio_nombre: itemData.servicio_nombre,
              subcategoria_nombre: itemData.subcategoria_nombre,
              // Ensure these fields exist for search functionality
              id_items: result.data.id_items || result.data.id_item,
              id_item: result.data.id_items || result.data.id_item,
              id_categoria: parseInt(itemData.id_categoria)
            };
            
            // Update local items to include this new item with correct service name
            updateLocalItems(items => [...items, newItem]);
            
            // Expand the service group for the new item
            setExpandedServices(prev => ({
              ...prev,
              [result.data.id_servicio]: true
            }));
            
            // If there's a search term that should match this item, refresh filters to show it
            const searchTerm = filters.searchTerm.toLowerCase().trim();
            if (searchTerm && (
                enrichedNewItem.servicio_nombre.toLowerCase().includes(searchTerm) ||
                enrichedNewItem.subcategoria_nombre.toLowerCase().includes(searchTerm)
            )) {
              // Force a re-application of filters by slightly changing and restoring the search term
              const currentSearch = filters.searchTerm;
              setFilters(prev => ({...prev, searchTerm: currentSearch + ' '}));
              setTimeout(() => {
                setFilters(prev => ({...prev, searchTerm: currentSearch}));
              }, 50);
            }
          }
          
          // Save current expanded state with deep copy
          const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
          
          // Refresh items to show the new item immediately
          await refreshItems();
          
          // Force a refresh of the filtered items to ensure the new item is searchable
          forceRefresh();
          
          // Restore expanded state
          setExpandedServices(currentExpandedState);
          
          success('Item creado correctamente');
        } else {
          showError(`Error al agregar ítem: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error in handleSaveItem:', error);
      showError(`Error inesperado: ${error.message}`);
    }
  };

  // Handler for deleting a service
  const handleDeleteService = (servicioId) => {
    // Encontrar el servicio que queremos eliminar
    const servicioToDelete = allServicios.find(s => s.id_servicio === servicioId);
    if (!servicioToDelete) return;
    
    // Contar ítems relacionados con este servicio
    const relatedItems = itemsWithDetails.filter(item => item.id_servicio === servicioId);
    
    // Contar subcategorías relacionadas
    const relatedSubcategorias = servicioToDelete.subcategorias || [];
    
    // Mostrar el modal de confirmación
    setDeleteServiceState({
      show: true,
      servicioId: servicioId,
      servicioName: servicioToDelete.nombre,
      itemCount: relatedItems.length,
      subcategoriaCount: relatedSubcategorias.length,
      isLoading: false
    });
  };
  
  // Confirmar eliminación de servicio
  const confirmDeleteService = async () => {
    try {
      setDeleteServiceState(prev => ({ ...prev, isLoading: true }));
      
      
      const result = await deleteServicio(deleteServiceState.servicioId);
      
      // Cerrar el modal primero para mejorar la experiencia del usuario
      setDeleteServiceState({
        show: false,
        servicioId: null,
        servicioName: '',
        itemCount: 0,
        subcategoriaCount: 0,
        isLoading: false
      });
      
      if (result.success) {
        // Save current expanded state with deep copy
        const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
        
        // Refresh the lists to reflect the changes
        await fetchAllServicios();
        await refreshItems();
        
        // Restore expanded state exactly as it was
        setExpandedServices(currentExpandedState);
        
        // Generate success message based on backend response
        let successMessage = 'Servicio eliminado con éxito';
        if (result.data) {
          const { itemsDeleted, subcategoriasDeleted } = result.data;
          if (itemsDeleted !== undefined && subcategoriasDeleted !== undefined) {
            successMessage += ` junto con ${subcategoriasDeleted} subcategorías y ${itemsDeleted} ítems.`;
          }
        }
        
        success(successMessage);
      } else {
        console.error('Error en la operación:', result.error);
        showError(`Error al eliminar servicio: ${result.error}`);
      }
    } catch (error) {
      console.error('Error inesperado en confirmDeleteService:', error);
      showError(`Error inesperado: ${error.message}`);
      
      // Ensure the state of the modal is reset in case of error
      setDeleteServiceState({ 
        show: false, 
        servicioId: null,
        servicioName: '',
        itemCount: 0,
        subcategoriaCount: 0,
        isLoading: false 
      });
    }
  };
  
  // Cancelar eliminación de servicio
  const cancelDeleteService = () => {
    setDeleteServiceState({
      show: false,
      servicioId: null,
      servicioName: '',
      itemCount: 0,
      subcategoriaCount: 0,
      isLoading: false
    });
  };
  
  // Handler for deleting an item
  const handleDelete = (type, id) => {
    if (type === 'item') {
      // Find the item to get its details
      const itemToDelete = itemsWithDetails.find(item => (item.id_items === id || item.id_item === id));
      
      if (!itemToDelete) {
        console.error("Item not found for deletion");
        showError("Error: No se pudo encontrar el ítem para eliminar");
        return;
      }
      
      const servicioId = itemToDelete.id_servicio;
      
      // Check if this is the last item for this service
      const itemsForService = itemsWithDetails.filter(item => 
        item.id_servicio === servicioId && 
        (item.id_items !== id && item.id_item !== id)
      );
      
      const isLastItem = itemsForService.length === 0;
      
      // Show the delete confirmation modal
      setDeleteItemState({
        show: true,
        itemId: id,
        servicioId: servicioId,
        itemName: `${itemToDelete.servicio_nombre} - ${itemToDelete.subcategoria_nombre}`,
        isLastItem,
        isLoading: false
      });
    } else if (type === 'servicio') {
      handleDeleteService(id);
    } else {
      showError(`Operación no soportada: eliminar ${type} con ID: ${id}`);
    }
  };

  // Add confirmDeleteItem function
  const confirmDeleteItem = async () => {
    try {
      setDeleteItemState(prev => ({ ...prev, isLoading: true }));
      
      const { itemId, isLastItem, servicioId } = deleteItemState;
      
      if (isLastItem) {
        // If it's the last item, delete the entire service
        const result = await deleteServicio(servicioId);
        if (result.success) {
          success('Servicio y todos sus ítems eliminados correctamente');
              } else {
                showError(`Error al eliminar servicio: ${result.error}`);
              }
        } else {
        // Just delete the single item
        const result = await deleteItem(itemId);
              if (result.success) {
                success('Ítem eliminado correctamente');
              } else {
                showError(`Error al eliminar ítem: ${result.error}`);
              }
      }
      
      // Close the modal
      setDeleteItemState({
        show: false,
        itemId: null,
        servicioId: null,
        itemName: '',
        isLastItem: false,
        isLoading: false
      });
                
      // Save current expanded state
                const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
                
      // Refresh the data
      await refreshItems();
      if (isLastItem) {
        await fetchAllServicios();
      }
      
      // Restore expanded state
                    setExpandedServices(currentExpandedState);
      
    } catch (error) {
      console.error('Error in confirmDeleteItem:', error);
              showError(`Error inesperado: ${error.message}`);
      setDeleteItemState(prev => ({ ...prev, isLoading: false }));
        }
  };

  // Add cancelDeleteItem function
  const cancelDeleteItem = () => {
    setDeleteItemState({
      show: false,
      itemId: null,
      servicioId: null,
      itemName: '',
      isLastItem: false,
      isLoading: false
    });
  };

  // Filter is active if any filter has a value
  const isFilterActive = filters.searchTerm !== '' || 
                         filters.minPrice !== '' || 
                         filters.maxPrice !== '' || 
                         filters.servicioId !== 'all' ||
                         filters.categoriaId !== 'all';

  // Check if we need to highlight text in search results
  const highlightText = (text) => {
    if (!filters.searchTerm.trim()) return text;
    
    try {
      const searchTerm = filters.searchTerm.trim();
      // Escape special regex characters
      const escapedSearchTerm = searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
      
      // Split into parts but keep the original spacing
      const parts = [];
      let lastIndex = 0;
      let match;
      
      // Using exec to iterate through all matches while preserving positions
      while ((match = regex.exec(text)) !== null) {
        // Add text before this match if exists
        if (match.index > lastIndex) {
          parts.push({
            text: text.substring(lastIndex, match.index),
            highlight: false
          });
        }
        
        // Add the matched text
        parts.push({
          text: match[0], // Use the exact matched text to preserve original case and spacing
          highlight: true
        });
        
        lastIndex = match.index + match[0].length;
      }
      
      // Add any remaining text after the last match
      if (lastIndex < text.length) {
        parts.push({
          text: text.substring(lastIndex),
          highlight: false
        });
      }
      
      // Return the array of parts with proper highlights
      return (
        <>
          {parts.map((part, i) => 
            part.highlight 
              ? <span key={i} className="highlight-text">{part.text}</span> 
              : part.text
          )}
        </>
      );
    } catch (e) {
      // If there's any error with regex or otherwise, return the original text
      console.error("Error highlighting text:", e);
      return text;
    }
  };

  // Format price with 2 decimal places
  const formatPrice = (price) => {
    return parseFloat(price || 0).toFixed(2);
  };

  // Add state for dropdowns
  // const [inlineEditOptions, setInlineEditOptions] = useState([]);

  // Update handleDoubleClick to allow free-text entry for services
  // const handleDoubleClick = (itemId, field, value) => {
  //   // For service field, we'll use text input instead of dropdown
  //   if (field === 'servicio') {
  //     setEditingState({
  //       itemId,
  //       field,
  //       value: value || '',
  //       isLoading: false,
  //       originalValue: value // Store the original value for comparison
  //     });
  //   } 
  //   // For subcategoria, we still use dropdown
  //   else if (field === 'subcategoria') {
  //     const options = allSubcategorias.map(s => ({
  //       id: s.id_subcategoria,
  //       name: s.nombre
  //     }));
  //     
  //     setInlineEditOptions(options);
  //     setEditingState({
  //       itemId,
  //       field,
  //       value: value || '',
  //       isLoading: false
  //     });
  //   }
  //   // For price, we use the existing text input
  //   else {
  //     setEditingState({
  //       itemId,
  //       field,
  //       value: value || '',
  //       isLoading: false
  //     });
  //   }
  // };

  // Update handleDropdownChange for subcategory selection
  // const handleDropdownChange = (e) => {
  //   const newValue = e.target.value;
  //   
  //   // Update the state
  //   setEditingState({
  //     ...editingState,
  //     value: newValue
  //   });
  //   
  //   // Only auto-save for subcategory dropdown, not for service (which is now a text input)
  //   if (editingState.field === 'subcategoria') {
  //     setEditingState(prev => ({
  //       ...prev,
  //       value: newValue,
  //       isLoading: true
  //     }));
  //     
  //     // Auto-save after a brief delay to allow state update
  //     setTimeout(() => {
  //       handleInlineEditSave();
  //     }, 100);
  //   }
  // };

  // Update handleInlineEditSave to track all updated fields
  // const handleInlineEditSave = async () => {
  //   const { itemId, field, value, originalValue } = editingState;
  //   if (!value.trim()) return;
  //   
  //   setEditingState({
  //     ...editingState,
  //     isLoading: true
  //   });
  //   
  //   try {
  //     const itemToUpdate = itemsWithDetails.find(item => item.id_items === itemId || item.id_item === itemId);
  //     if (!itemToUpdate) return;
  //     
  //     // Handle service name editing
  //     if (field === 'servicio') {
  //       // Only proceed if the name has changed
  //       if (value === originalValue) {
  //         setEditingState({
  //           itemId: null,
  //           field: null,
  //           value: '',
  //           isLoading: false
  //         });
  //         return;
  //       }
  //       
  //       // Find the service to get its ID and category
  //       const currentService = allServicios.find(s => s.id_servicio === itemToUpdate.id_servicio);
  //       if (!currentService) {
  //         showError('No se pudo encontrar el servicio actual');
  //         setEditingState({
  //           ...editingState,
  //           isLoading: false
  //         });
  //         return;
  //       }
  //       
  //       const categoryId = currentService.id_categoria;
  //       const servicioId = currentService.id_servicio;
  //       
  //       // Check if another service with the same name exists in this category
  //       const serviceWithSameNameInCategory = allServicios.find(s => 
  //         s.nombre.toLowerCase() === value.toLowerCase() && 
  //         s.id_categoria === categoryId &&
  //         s.id_servicio !== servicioId
  //       );
  //       
  //       if (serviceWithSameNameInCategory) {
  //         warning(`Ya existe un servicio con el nombre "${value}" en esta categoría.`);
  //         setEditingState({
  //           ...editingState,
  //           isLoading: false
  //         });
  //         return;
  //       }
  //       
  //       // Update the service name in the backend
  //       const updateResult = await updateServicio(servicioId, value);
  //       
  //       if (updateResult.success) {
  //         // Update UI state
  //         setUpdatedServiceNames(prev => ({
  //           ...prev,
  //           [servicioId]: value
  //         }));
  //         
  //         // Update local items
  //         updateLocalItems(items => {
  //           return items.map(item => {
  //             if (item.id_servicio === servicioId) {
  //               return { 
  //                 ...item, 
  //                 servicio_nombre: value,
  //                 servicio: value
  //               };
  //             }
  //             return item;
  //           });
  //         });
  //         
  //         // Update services list
  //         const updatedServicios = allServicios.map(s => {
  //           if (s.id_servicio === servicioId) {
  //             return { ...s, nombre: value };
  //           }
  //           return s;
  //         });
  //         setAllServicios(updatedServicios);
  //         
  //         // Clear editing state
  //         setEditingState({
  //           itemId: null,
  //           field: null,
  //           value: '',
  //           isLoading: false
  //         });
  //         
  //         // Save current expanded state
  //         const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
  //         
  //         // Refresh services from server
  //         await fetchAllServicios();
  //         
  //         // Restore expanded state
  //         setExpandedServices(currentExpandedState);
  //         
  //         success('Nombre de servicio actualizado correctamente');
  //       } else {
  //         showError(`Error al actualizar servicio: ${updateResult.error}`);
  //         setEditingState({
  //           ...editingState,
  //           isLoading: false
  //         });
  //       }
  //       
  //       return;
  //     }
  //     
  //     // Handle subcategory editing
  //     if (field === 'subcategoria') {
  //       const selectedSubcategory = allSubcategorias.find(s => s.nombre === value || s.id_subcategoria.toString() === value);
  //       
  //       if (!selectedSubcategory) {
  //         warning('Por favor seleccione una subcategoría válida');
  //         setEditingState({
  //           ...editingState,
  //           isLoading: false
  //         });
  //         return;
  //       }
  //       
  //       // Check if this item already has this subcategory name
  //       if (itemToUpdate.subcategoria_nombre === selectedSubcategory.nombre) {
  //         setEditingState({
  //           itemId: null,
  //           field: null,
  //           value: '',
  //           isLoading: false
  //         });
  //         return;
  //       }
  //       
  //       // Check if another item in the same service already has this subcategory
  //       const itemsWithSameService = itemsWithDetails.filter(item => 
  //         item.id_servicio === itemToUpdate.id_servicio &&
  //         (item.id_items !== itemId && item.id_item !== itemId)
  //       );
  //       
  //       const duplicateSubcategory = itemsWithSameService.find(item => 
  //         item.subcategoria_nombre.toLowerCase() === selectedSubcategory.nombre.toLowerCase()
  //       );
  //       
  //       if (duplicateSubcategory) {
  //         warning(`La subcategoría "${selectedSubcategory.nombre}" ya está en uso en este servicio.`);
  //         setEditingState({
  //           ...editingState,
  //           isLoading: false
  //         });
  //         return;
  //       }
  //       
  //       // Update the item with the new subcategory
  //       const updatedItem = { 
  //         ...itemToUpdate,
  //         subcategoria_nombre: selectedSubcategory.nombre,
  //         id_subcategoria: selectedSubcategory.id_subcategoria
  //       };
  //       
  //       const result = await updateItem(itemToUpdate.id_items || itemToUpdate.id_item, updatedItem);
  //     
  //   if (result.success) {
  //       // Update UI state
  //       setUpdatedSubcategoryNames(prev => ({
  //         ...prev,
  //         [itemId]: selectedSubcategory.nombre
  //       }));
  //       
  //       // Update local items
  //       updateLocalItems(items => {
  //         return items.map(item => {
  //           if ((item.id_items === itemId) || (item.id_item === itemId)) {
  //             return { 
  //               ...item, 
  //               subcategoria_nombre: selectedSubcategory.nombre,
  //               id_subcategoria: selectedSubcategory.id_subcategoria 
  //             };
  //           }
  //           return item;
  //         });
  //       });
  //       
  //       // Clear editing state
  //       setEditingState({
  //         itemId: null,
  //         field: null,
  //         value: '',
  //         isLoading: false
  //       });
  //       
  //       // Save current expanded state
  //       const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
  //       
  //       // Refresh items
  //       await refreshItems();
  //       
  //       // Restore expanded state
  //       setExpandedServices(currentExpandedState);
  //       
  //       success('Subcategoría actualizada correctamente');
  //     } else {
  //       showError(`Error al actualizar subcategoría: ${result.error}`);
  //       setEditingState({
  //         ...editingState,
  //         isLoading: false
  //       });
  //     }
  //     
  //     return;
  //   }
  //   
  //   // Handle price editing
  //   if (field === 'precio') {
  //     // Validate that the price is a valid number
  //     const price = parseFloat(value);
  //     if (isNaN(price) || price < 0) {
  //       warning('Por favor ingrese un precio válido (número mayor o igual a 0)');
  //       setEditingState({
  //         ...editingState,
  //         isLoading: false
  //       });
  //       return;
  //     }
  //     
  //     const updatedItem = { 
  //       ...itemToUpdate,
  //       precio: price
  //     };
  //     
  //     const result = await updateItem(itemToUpdate.id_items || itemToUpdate.id_item, updatedItem);
  //     
  //     if (result.success) {
  //       // Update UI state
  //       setUpdatedPrices(prev => ({
  //         ...prev,
  //         [itemId]: value
  //       }));
  //       
  //       // Update local items
  //       updateLocalItems(items => {
  //         return items.map(item => {
  //           if ((item.id_items === itemId) || (item.id_item === itemId)) {
  //             return { ...item, precio: price };
  //           }
  //           return item;
  //         });
  //       });
  //     
  //     // Clear editing state
  //   setEditingState({
  //     itemId: null,
  //     field: null,
  //     value: '',
  //     isLoading: false
  //   });
  //   
  //   // Save current expanded state
  //   const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
  //   
  //   // Refresh items
  //   await refreshItems();
  //   
  //   // Restore expanded state
  //   setExpandedServices(currentExpandedState);
  //   
  //     success('Precio actualizado correctamente');
  // } else {
  //     showError(`Error al actualizar precio: ${result.error}`);
  //   setEditingState({
  //     ...editingState,
  //     isLoading: false
  //   });
  //   }
  // }
  // } catch (error) {
  //   console.error('Error saving inline edit:', error);
  //   setEditingState({
  //     ...editingState,
  //     isLoading: false
  //   });
  //   showError('Error al guardar los cambios');
  // }
  // };

  // Update handleInlineEditCancel to clear options
  // const handleInlineEditCancel = () => {
  //   setEditingState({
  //     itemId: null,
  //     field: null,
  //     value: '',
  //     isLoading: false
  //   });
  //   setInlineEditOptions([]);
  // };

  // Add a function to toggle service expansion
  const toggleServiceExpansion = (serviceId) => {
    setExpandedServices(prev => {
      // Create a copy of the previous state
      const newState = { ...prev };
      
      // Toggle the state for this service
      newState[serviceId] = !newState[serviceId];
      
      // For debugging
      
      
      return newState;
    });
  };

  // Initialize expanded services based on allServicios data - only on first load
  useEffect(() => {
    // Initialize with all services collapsed - empty object
    if (isInitialLoadRef.current && allServicios.length > 0) {
      // Don't expand any services by default
      setExpandedServices({});
      
      // Set the ref to false so this effect doesn't run again
      isInitialLoadRef.current = false;
    }
  }, [allServicios]);

  // Restore the keydown handler
  // const handleInlineEditKeyDown = (e) => {
  //   if (e.key === 'Enter') {
  //     handleInlineEditSave();
  //   } else if (e.key === 'Escape') {
  //     handleInlineEditCancel();
  //   }
  // };

  // Add back handleInlineEditChange for price editing
  // const handleInlineEditChange = (e) => {
  //   // Special handling for price - only allow numbers and decimal point
  //   if (editingState.field === 'precio') {
  //     const value = e.target.value;
  //     if (value === '' || /^\d*\.?\d*$/.test(value)) {
  //       setEditingState({
  //         ...editingState,
  //         value: value
  //       });
  //     }
  //   } else {
  //     setEditingState({
  //       ...editingState,
  //       value: e.target.value
  //     });
  //   }
  // };

  // Add a useEffect to handle clicks outside the edit field
  // useEffect(() => {
  //   // Only add the handler if we're in edit mode
  //   if (editingState.itemId) {
  //     function handleClickOutside(event) {
  //       const editField = document.querySelector('.inline-edit-field');
  //       if (editField && !editField.contains(event.target)) {
  //         // If we clicked outside and it's not the price field (which needs manual save),
  //         // cancel editing
  //         if (editingState.field !== 'precio') {
  //           handleInlineEditCancel();
  //         }
  //       }
  //     }
  //     
  //     document.addEventListener('mousedown', handleClickOutside);
  //     return () => {
  //       document.removeEventListener('mousedown', handleClickOutside);
  //     };
  //   }
  // }, [editingState.itemId, editingState.field]);

  // Add deleteItemState to state declarations
  const [deleteItemState, setDeleteItemState] = useState({
    show: false,
    itemId: null,
    servicioId: null,
    itemName: '',
    isLastItem: false,
    isLoading: false
  });

  // Add state for color picker modal
  const [colorPickerState, setColorPickerState] = useState({
    show: false,
    categoriaId: null,
    categoriaName: '',
    currentColor: '',
    isLoading: false
  });

  // Dentro del componente AdminPanel, agregar el estado para el modal de creación de categorías
  const [createCategoryState, setCreateCategoryState] = useState({
    show: false,
    isLoading: false
  });

  // Add state for delete category modal
  const [deleteCategoryState, setDeleteCategoryState] = useState({
    show: false,
    categoryId: null,
    categoryName: '',
    serviceCount: 0,
    isLoading: false
  });

  // Agregar la función para manejar la creación de categorías
  const handleCreateCategory = async (categoryData) => {
    try {
      // Llamar a la función del hook para crear la categoría
      const result = await createCategoria(categoryData);
      
      if (result.success) {
        success('Categoría creada correctamente');
        // Cerrar el modal
        setCreateCategoryState({
          show: false,
          isLoading: false
        });
      } else {
        showError(`Error al crear categoría: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showError('Error inesperado al crear la categoría');
    }
  };

  // Add function to handle the color picker
  const handleOpenColorPicker = (e, categoriaId, categoriaName, currentColor) => {
    e.stopPropagation(); // Prevent triggering other click events
    setColorPickerState({
      show: true,
      categoriaId,
      categoriaName,
      currentColor,
      isLoading: false
    });
  };

  // Add function to handle category deletion request
  const handleDeleteCategory = (categoryId, categoryName, serviceCount) => {
    setDeleteCategoryState({
      show: true,
      categoryId,
      categoryName,
      serviceCount,
      isLoading: false
    });
  };

  // Add function to confirm category deletion
  const confirmDeleteCategory = async () => {
    try {
      setDeleteCategoryState(prev => ({ ...prev, isLoading: true }));
      
      const { categoryId } = deleteCategoryState;
      
      // Get all services for this category
      const servicesToDelete = allServicios.filter(s => s.id_categoria === categoryId);
      
      // Delete all services first
      for (const service of servicesToDelete) {
        const serviceResult = await deleteServicio(service.id_servicio);
        if (!serviceResult.success) {
          throw new Error(`Error al eliminar servicio ${service.nombre}: ${serviceResult.error}`);
        }
      }
      
      // Then delete the category itself using the deleteCategoria function
      const result = await deleteCategoria(categoryId);
      
      // Close the modal first for better UX
      setDeleteCategoryState({
        show: false,
        categoryId: null,
        categoryName: '',
        serviceCount: 0,
        isLoading: false
      });
      
      if (result.success) {
        // Refresh data
        await refreshItems();
        
        success('Categoría eliminada correctamente junto con todos sus servicios');
      } else {
        showError(`Error al eliminar categoría: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in confirmDeleteCategory:', error);
      showError(`Error inesperado: ${error.message}`);
      
      // Reset modal state
      setDeleteCategoryState({
        show: false,
        categoryId: null,
        categoryName: '',
        serviceCount: 0,
        isLoading: false
      });
    }
  };
  
  // Add function to cancel category deletion
  const cancelDeleteCategory = () => {
    setDeleteCategoryState({
      show: false,
      categoryId: null,
      categoryName: '',
      serviceCount: 0,
      isLoading: false
    });
  };

  // Add function to save the new color
  const handleSaveColor = async (categoriaId, colorData) => {
    try {
      // Call the updateCategoria function with only the color data
      const result = await updateCategoria(categoriaId, colorData);
      
      if (result.success) {
        success('Color de categoría actualizado correctamente');
        // Close the modal
        setColorPickerState({
          show: false,
          categoriaId: null,
          categoriaName: '',
          currentColor: '',
          isLoading: false
        });
        
        // No need to refresh since the hook already updates the state
      } else {
        showError(`Error al actualizar color: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving color:', error);
      showError('Error inesperado al guardar el color');
    }
  };

  // Constante para color por defecto en caso de que una categoría no tenga color definido
  const DEFAULT_CATEGORY_COLOR = '#4285F4'; // Azul

  // Dentro del componente AdminPanel, agregar el estado para características modales
  const [createCaracteristicaState, setCreateCaracteristicaState] = useState({
    show: false,
    isLoading: false
  });

  const [assignCaracteristicaState, setAssignCaracteristicaState] = useState({
    show: false,
    isLoading: false
  });
  
  // Add state for deleting characteristics
  const [deleteCaracteristicaState, setDeleteCaracteristicaState] = useState({
    show: false,
    caracteristicaId: null,
    caracteristicaName: '',
    serviciosCount: 0,
    isLoading: false
  });

  // Add state for viewing all characteristics
  const [verCaracteristicasState, setVerCaracteristicasState] = useState({
    show: false
  });

  // Añadir la función para manejar la creación de características
  const handleCreateCaracteristica = async (caracteristicaData) => {
    try {
      const result = await createCaracteristica(caracteristicaData);
      
      if (result.success) {
        success('Característica creada correctamente');
        // Cerrar el modal
        setCreateCaracteristicaState({
          show: false,
          isLoading: false
        });
      } else {
        showError(`Error al crear característica: ${result.error}`);
      }
    } catch (error) {
      console.error('Error creating caracteristica:', error);
      showError('Error inesperado al crear la característica');
    }
  };

  // Función para manejar la asignación de características a servicios
  const handleAssignCaracteristica = async (servicioId, caracteristicaId) => {
    try {
      const result = await addCaracteristicaToServicio(servicioId, caracteristicaId);
      
      if (result.success) {
        success('Característica asignada correctamente al servicio');
        // Cerrar el modal
        setAssignCaracteristicaState({
          show: false,
          isLoading: false
        });
        // Refresh the services list to show the new characteristic
        await fetchAllServicios();
      } else {
        showError(`Error al asignar característica: ${result.error}`);
      }
    } catch (error) {
      console.error('Error assigning caracteristica:', error);
      showError('Error inesperado al asignar la característica');
    }
  };

  // Add method to handle iniciating deletion of a characteristic
  const handleDeleteCaracteristica = (caracteristicaId, caracteristicaName) => {
    // Here you would ideally first check how many services use this characteristic
    // For now we'll assume none
    
    setDeleteCaracteristicaState({
      show: true,
      caracteristicaId,
      caracteristicaName,
      serviciosCount: 0,
      isLoading: false
    });
  };

  // Add method to confirm deletion of a characteristic
  const confirmDeleteCaracteristica = async () => {
    try {
      setDeleteCaracteristicaState(prev => ({ ...prev, isLoading: true }));
      
      const { caracteristicaId } = deleteCaracteristicaState;
      const result = await deleteCaracteristica(caracteristicaId);
      
      if (result.success) {
        success('Característica eliminada correctamente');
      } else {
        showError(`Error al eliminar característica: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in confirmDeleteCaracteristica:', error);
      showError(`Error inesperado: ${error.message}`);
    } finally {
      // Close the modal regardless of result
      setDeleteCaracteristicaState({
        show: false,
        caracteristicaId: null,
        caracteristicaName: '',
        serviciosCount: 0,
        isLoading: false
      });
    }
  };

  // Add method to cancel deletion of a characteristic
  const cancelDeleteCaracteristica = () => {
    setDeleteCaracteristicaState({
      show: false,
      caracteristicaId: null,
      caracteristicaName: '',
      serviciosCount: 0,
      isLoading: false
    });
  };

  // Inside the AdminPanel component, add new state for the description modal
  const [editDescriptionState, setEditDescriptionState] = useState({
    show: false,
    servicioId: null,
    servicioName: '',
    currentDescription: '',
    isLoading: false
  });

  // Add handler for saving service description
  const handleSaveServiceDescription = async (description) => {
    try {
      const { servicioId } = editDescriptionState;
      const result = await updateServicio(servicioId, { descripcion: description });
      
      if (result.success) {
        // Update local state
        setAllServicios(prev => prev.map(s => 
          s.id_servicio === servicioId 
            ? { ...s, descripcion: description }
            : s
        ));
        
        success('Descripción del servicio actualizada correctamente');
        setEditDescriptionState({
          show: false,
          servicioId: null,
          servicioName: '',
          currentDescription: '',
          isLoading: false
        });
      } else {
        showError(`Error al actualizar descripción: ${result.error}`);
      }
    } catch (error) {
      console.error('Error saving service description:', error);
      showError('Error inesperado al guardar la descripción');
    }
  };

  if (adminChecking) {
    return (
      <div className="admin-panel-container">
        <div className="loading-indicator">Verificando permisos de administrador...</div>
      </div>
    );
  }

  if (!isAdminUser) {
    return null; // Will redirect in the useEffect, this prevents flash of content
  }

  return (
    <div className={styles['admin-panel-container']}>
      {(deleteCategoryState.isLoading || loading || serviciosLoading || categoriasLoading) && <LoadingAnimation />}
      <h1 className={styles['admin-panel-title']}>Panel de Administración</h1>
      
      <div className={styles['search-filters']}>
        <div className={styles['search-filters-content']}>
          {/* Primera fila: barra de búsqueda ocupando todo el ancho */}
          <div className={styles['search-row']} style={{ width: '100%' }}>
            <div className={styles['search-field']} style={{ width: '100%' }}>
              <div className={styles['search-group']}>
                <label>
                  <FontAwesomeIcon icon={faSearch} className={styles['label-icon']} /> 
                  Buscar
                </label>
                <div className={styles['search-input-container']}>
                  <input
                    type="text"
                    name="searchTerm"
                    placeholder="Nombre servicio o categoría..."
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                    className={styles['search-input']}
                    autoFocus
                    autoComplete="off"
                  />
                  {filters.searchTerm && (
                    <FontAwesomeIcon 
                      icon={faTimes} 
                      className={styles['clear-input-icon']} 
                      onClick={() => setFilters(prev => ({...prev, searchTerm: ''}))}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Segunda fila: opciones de filtrado alineadas */}
          <div className={styles['search-row']}>
            <div className={styles['search-field']}>
              <div className={styles['search-group']}>
                <label>
                  <FontAwesomeIcon icon={faFilter} className={styles['label-icon']} /> 
                  Filtrar por Categoría
                </label>
                <div className={styles['filter-select-container']}>
                  <select 
                    name="categoriaId" 
                    value={filters.categoriaId} 
                    onChange={handleFilterChange}
                    className={styles['filter-select']}
                  >
                    <option value="all">Todas las categorías</option>
                    {allCategorias.map(categoria => (
                      <option key={categoria.id_categoria} value={categoria.id_categoria}>
                        {categoria.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            
            <div className={styles['search-field']}>
              <div className={styles['search-group']}>
                <label>
                  <FontAwesomeIcon icon={faFilter} className={styles['label-icon']} /> 
                  Filtrar por Servicio
                </label>
                <div className={styles['filter-select-container']}>
                  <select 
                    name="servicioId" 
                    value={filters.servicioId} 
                    onChange={handleFilterChange}
                    className={styles['filter-select']}
                  >
                    <option value="all">Todos los servicios</option>
                    {allServicios.map(servicio => (
                      <option key={servicio.id_servicio} value={servicio.id_servicio}>
                        {servicio.nombre}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className={styles['search-field']}>
              <div className={styles['search-group']}>
                <label>
                  <FontAwesomeIcon icon={faDollarSign} className={styles['label-icon']} /> 
                  Precio mínimo
                </label>
                <div className={styles['price-input-container']}>
                  <span className={styles['price-symbol']}>$</span>
                  <input
                    type="text"
                    name="minPrice"
                    placeholder=""
                    value={filters.minPrice}
                    onChange={handlePriceChange}
                    className={styles['price-input']}
                    inputMode="decimal"
                  />
                </div>
              </div>
            </div>
            
            <div className={styles['search-field']}>
              <div className={styles['search-group']}>
                <label>
                  <FontAwesomeIcon icon={faDollarSign} className={styles['label-icon']} /> 
                  Precio máximo
                </label>
                <div className={styles['price-input-container']}>
                  <span className={styles['price-symbol']}>$</span>
                  <input
                    type="text"
                    name="maxPrice"
                    placeholder=""
                    value={filters.maxPrice}
                    onChange={handlePriceChange}
                    className={styles['price-input']}
                    inputMode="decimal"
                  />
                </div>
              </div>
            </div>
            
            <div className={styles['search-field']} style={{ width: '100%' }}>
              <div className={styles['actions-row']}>
                <button 
                  className={`${styles['clear-filters-btn']} ${isFilterActive ? styles['active'] : ''}`}
                  onClick={clearFilters}
                  disabled={!isFilterActive}
                >
                  <FontAwesomeIcon icon={faTimes} /> Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {isFilterActive && (
          <div className={styles['search-results-info']}>
            Mostrando {filteredCount} de {totalCount} ítems
          </div>
        )}
      </div>
      
      <div className={styles['admin-content']}>
        <div className={styles['admin-header']}>
                    <div className={styles['admin-actions']}>
          <button 
            className={styles['add-button']}
            onClick={handleAddItem}
          >
            <FontAwesomeIcon icon={faPlus} /> Agregar Item
          </button>
            <button 
              className={styles['add-category-button']}
              onClick={() => setCreateCategoryState({ show: true, isLoading: false })}
            >
              <FontAwesomeIcon icon={faPlus} /> Nueva Categoría
            </button>
            <button 
              className={styles['assign-caracteristica-button']}
              onClick={() => setAssignCaracteristicaState({ show: true, isLoading: false })}
            >
              <FontAwesomeIcon icon={faLink} /> Asignar Característica
            </button>
            <button 
              className={styles['manage-caracteristicas-button']}
              onClick={() => setVerCaracteristicasState({ show: true })}
            >
              <FontAwesomeIcon icon={faListAlt} /> Gestionar Características
          </button>
          </div>
        </div>
        
        {error ? (
          <div className={styles['error-message']}>{error}</div>
        ) : (
          <div className={styles['items-list']}>
            {filteredItems.length === 0 && filters.categoriaId === 'all' ? (
              <p className={styles['no-data']}>No hay ítems que coincidan con los criterios de búsqueda</p>
            ) : (
              // Start with all categories and add their services
              allCategorias
                .filter(categoria => {
                  // Skip if we're filtering by category and this doesn't match
                  if (filters.categoriaId !== 'all' && categoria.id_categoria !== parseInt(filters.categoriaId)) {
                    return false;
                  }
                  return true;
                })
                .map(categoria => {
                  // Find services for this category
                  const categoryServices = allServicios
                    .filter(service => {
                      // Match service to this category
                      if (service.id_categoria !== categoria.id_categoria) {
                        return false;
                      }
                      
                      // Skip services that don't match service filter
                  if (filters.servicioId !== 'all' && service.id_servicio !== parseInt(filters.servicioId)) {
                        return false;
                  }
                  
                      // Check if it has matching items (only apply this filter if not filtering by categoria)
                      if (filters.categoriaId === 'all') {
                  const hasMatchingItems = filteredItems.some(item => item.id_servicio === service.id_servicio);
                        if (!hasMatchingItems) return false;
                  }
                  
                      return true;
                    });
                  
                  return {
                    id: categoria.id_categoria,
                    name: categoria.nombre,
                    color: categoria.color || DEFAULT_CATEGORY_COLOR,
                    services: categoryServices
                  };
                })
                .map(category => (
                <div key={`category-${category.id}`} className={styles['category-group']}>
                  <div className={styles['category-header']} style={{ backgroundColor: category.color }}>
                    <h2 className={styles['category-name']}>{category.name}</h2>
                    <div className={styles['category-stats']}>
                      {category.services.length} servicio(s)
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button 
                        className={styles['color-picker-button']}
                        onClick={(e) => handleOpenColorPicker(e, category.id, category.name, category.color)}
                        title="Cambiar color de la categoría"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '5px 8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.3)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        }}
                      >
                        <FontAwesomeIcon icon={faPalette} />
                      </button>
                      <button 
                        className={styles['delete-category-button']}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteCategory(category.id, category.name, category.services.length);
                        }}
                        title="Eliminar categoría y todos sus servicios"
                        style={{ 
                          background: 'rgba(255, 255, 255, 0.2)',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '5px 8px',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 0, 0, 0.7)';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={styles['category-services']}>
                    {category.services.map(servicio => {
                      // Get items for this service
                      const servicioItems = filteredItems.filter(item => item.id_servicio === servicio.id_servicio);
                      
                      return (
                        <div key={servicio.id_servicio} className={styles['service-group']}>
                          <div 
                            className={`${styles['service-header']} ${expandedServices[servicio.id_servicio] ? styles['expanded'] : ''}`}
                            style={{ borderLeft: `4px solid ${category.color}` }}
                            onClick={() => toggleServiceExpansion(servicio.id_servicio)}
                          >
                            <FontAwesomeIcon 
                              icon={expandedServices[servicio.id_servicio] ? faChevronDown : faChevronRight} 
                              className={styles['expand-icon']} 
                            />
                            <div className={styles['service-info']}>
                              <h3 className={styles['service-name']}>{updatedServiceNames[servicio.id_servicio] || servicio.nombre}</h3>
                              {servicio.caracteristicas && servicio.caracteristicas.length > 0 && (
                                <div className={styles['caracteristicas-container']} style={{ marginTop: '8px' }}>
                                  {servicio.caracteristicas.map(caract => (
                                    <div key={caract.id_caracteristicas} className={styles['caracteristica-tag']}>
                                      <div 
                                        className={styles['caracteristica-icon-container']} 
                                        style={{ backgroundColor: caract.color || '#4285F4' }}
                                      >
                                        <FontAwesomeIcon 
                                          icon={commonIcons.find(item => item.name === caract.imagen)?.icon || faStar} 
                                        />
                                      </div>
                                      <span>{caract.nombre}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className={styles['service-stats']}>
                              <span className={styles['service-items-count']}>{servicioItems.length} ítem(s)</span>
                            </div>
                            <div className={styles['service-actions']}>
                              <button 
                                className={styles['action-button']}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditDescriptionState({
                                    show: true,
                                    servicioId: servicio.id_servicio,
                                    servicioName: servicio.nombre,
                                    currentDescription: servicio.descripcion || '',
                                    isLoading: false
                                  });
                                }}
                                title="Editar descripción del servicio"
                              >
                                <FontAwesomeIcon icon={faEdit} />
                              </button>
                              <button 
                                className={styles['action-button']}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDelete('servicio', servicio.id_servicio);
                                }}
                                title="Eliminar servicio completo"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                          
                          <div className={`${styles['service-items']} ${expandedServices[servicio.id_servicio] ? styles['expanded'] : ''}`}>
                            {servicioItems.map(item => (
                              <div key={item.id_items || item.id_item} className={styles['item-card']} style={{ borderLeft: `4px solid ${category.color}` }}>
                                <div className={styles['item-header']}>
                                  <div className={styles['item-main-info']}>
                                    <div className={styles['item-service']}>
                                      <span className={styles['service-label']}>Servicio:</span>
                                      <span className={styles['service-name']}>
                                        {highlightText(item.servicio_nombre)}
                                      </span>
                                    </div>
                                    
                                    <div className={styles['item-subcategory']}>
                                      <span className={styles['subcategory-label']}>Subcategoría:</span>
                                      <span className={styles['subcategory-name']}>
                                        {highlightText(item.subcategoria_nombre)}
                                      </span>
                                    </div>
                                    
                                    <div className={styles['item-price-display']}>
                                      <span className={styles['price-label']}>Precio:</span>
                                      <span className={styles['price-value']}>
                                        ${formatPrice(item.precio)}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  <div className={styles['item-controls']}>
                                    <div className={styles['item-actions']}>
                                      <button 
                                        className={styles['action-button']}
                                        onClick={() => {
                                          setCurrentEditItem(item);
                                          setShowItemForm(true);
                                        }}
                                        title="Editar ítem"
                                      >
                                        <FontAwesomeIcon icon={faEdit} />
                                      </button>
                                      <button 
                                        className={styles['action-button']}
                                        onClick={() => handleDelete('item', item.id_items || item.id_item)}
                                        title="Eliminar ítem"
                                      >
                                        <FontAwesomeIcon icon={faTrash} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                                
                                {(item.descripcion || item.opciones) && (
                                  <div className={`${styles['item-details']} ${expandedItems[item.id_items || item.id_item] ? styles['expanded'] : ''}`}>
                                    <div className={styles['item-section']}>
                                      <div className={styles['item-section-row']}>
                                        {item.descripcion && (
                                          <div className={styles['item-detail']}>
                                            <span className={styles['detail-label']}>Descripción:</span>
                                            <span className={styles['detail-value']}>{item.descripcion}</span>
                                          </div>
                                        )}
                                        
                                        {item.opciones && (
                                          <div className={styles['item-detail']}>
                                            <span className={styles['detail-label']}>Opciones:</span>
                                            <span className={styles['detail-value']}>{item.opciones}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {showItemForm && (
        <ItemFormModal
          show={showItemForm}
          onClose={() => {
            setShowItemForm(false);
            setCurrentEditItem(null);
          }}
          onSave={handleSaveItem}
          servicios={allServicios}
          allSubcategorias={allSubcategorias}
          allCategorias={allCategorias}
          editItem={currentEditItem}
        />
      )}
      
      {deleteServiceState.show && (
        <DeleteServiceModal
          show={deleteServiceState.show}
          onClose={cancelDeleteService}
          onConfirm={confirmDeleteService}
          servicioName={deleteServiceState.servicioName}
          itemCount={deleteServiceState.itemCount}
          subcategoriaCount={deleteServiceState.subcategoriaCount}
        />
      )}
      
      {deleteItemState.show && (
        <DeleteItemModal
          show={deleteItemState.show}
          onClose={cancelDeleteItem}
          onConfirm={confirmDeleteItem}
          itemName={deleteItemState.itemName}
          isLastItem={deleteItemState.isLastItem}
        />
      )}
      
      {colorPickerState.show && (
        <ColorPickerModal
          show={colorPickerState.show}
          onClose={() => setColorPickerState({
            show: false,
            categoriaId: null,
            categoriaName: '',
            currentColor: '',
            isLoading: false
          })}
          onSave={handleSaveColor}
          categoriaId={colorPickerState.categoriaId}
          initialColor={colorPickerState.currentColor}
          categoriaName={colorPickerState.categoriaName}
        />
      )}
      
      {createCategoryState.show && (
        <CreateCategoryModal
          show={createCategoryState.show}
          onClose={() => setCreateCategoryState({ 
            show: false, 
            isLoading: false 
          })}
          onSave={handleCreateCategory}
          allCategorias={allCategorias}  // Pass allCategorias to the modal
        />
      )}
      
      {deleteCategoryState.show && (
        <DeleteCategoryModal
          show={deleteCategoryState.show}
          onClose={cancelDeleteCategory}
          onConfirm={confirmDeleteCategory}
          categoryName={deleteCategoryState.categoryName}
          serviceCount={deleteCategoryState.serviceCount}
        />
      )}
      
      {createCaracteristicaState.show && (
        <CreateCaracteristicaModal
          show={createCaracteristicaState.show}
          onClose={() => setCreateCaracteristicaState({ 
            show: false, 
            isLoading: false 
          })}
          onSave={handleCreateCaracteristica}
        />
      )}
      
      {assignCaracteristicaState.show && (
        <AssignCaracteristicaModal
          show={assignCaracteristicaState.show}
          onClose={() => setAssignCaracteristicaState({ 
            show: false, 
            isLoading: false 
          })}
          onSave={handleAssignCaracteristica}
          allServicios={allServicios}
          allCaracteristicas={allCaracteristicas}
        />
      )}
      
      {verCaracteristicasState.show && (
        <VerCaracteristicasModal
          show={verCaracteristicasState.show}
          onClose={() => setVerCaracteristicasState({ show: false })}
          caracteristicas={allCaracteristicas}
          onDelete={handleDeleteCaracteristica}
          onCreateNew={() => {
            setVerCaracteristicasState({ show: false });
            setCreateCaracteristicaState({ show: true, isLoading: false });
          }}
        />
      )}
      
      {deleteCaracteristicaState.show && (
        <DeleteCaracteristicaModal
          show={deleteCaracteristicaState.show}
          onClose={cancelDeleteCaracteristica}
          onConfirm={confirmDeleteCaracteristica}
          caracteristicaName={deleteCaracteristicaState.caracteristicaName}
          serviciosCount={deleteCaracteristicaState.serviciosCount}
        />
      )}
      
      {editDescriptionState.show && (
        <EditServiceDescriptionModal
          show={editDescriptionState.show}
          onClose={() => setEditDescriptionState({
            show: false,
            servicioId: null,
            servicioName: '',
            currentDescription: '',
            isLoading: false
          })}
          onSave={handleSaveServiceDescription}
          servicioName={editDescriptionState.servicioName}
          initialDescription={editDescriptionState.currentDescription}
        />
      )}
      
      <ToastContainer />
    </div>
  );
};

export default AdminPanel; 