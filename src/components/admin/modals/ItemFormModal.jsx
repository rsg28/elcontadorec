import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faPlus, faEdit, faSearch, faDollarSign, faFilter, 
  faTimes, faSave, faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../../pages/AdminPanel.module.css';

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
  const servicioInputRef = useRef(null);
  const subcategoriaInputRef = useRef(null);
  
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
        onClose();
      }
    }

    if (show) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [show, onClose]);
  
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
  
  // Render the modal
  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '900px', minWidth: '800px', width: '90vw' }}>
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
          <div className={styles['modal-body']} style={{ padding: '45px 50px' }}>
            <div className={styles['form-grid']}>
              <div className={styles['form-group']} style={{ marginBottom: '40px' }}>
                <label htmlFor="categoria" className={styles['form-label']} style={{ fontSize: '16px', marginBottom: '10px' }}>
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
                    style={{ padding: '12px 16px', fontSize: '15px' }}
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
            
              <div className={styles['form-group']} style={{ marginBottom: '40px' }}>
                <label htmlFor="servicio" className={styles['form-label']} style={{ fontSize: '16px', marginBottom: '10px' }}>
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
                      style={{ padding: '12px 16px', fontSize: '15px' }}
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
            
              <div className={styles['form-group']} style={{ marginBottom: '40px' }}>
                <label htmlFor="subcategoria" className={styles['form-label']} style={{ fontSize: '16px', marginBottom: '10px' }}>
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
                      style={{ padding: '12px 16px', fontSize: '15px' }}
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

              <div className={styles['form-group']} style={{ marginBottom: '40px' }}>
                <label htmlFor="precio" className={styles['form-label']} style={{ fontSize: '16px', marginBottom: '10px' }}>
                  <FontAwesomeIcon icon={faDollarSign} className={styles['field-icon']} /> 
                  Precio <span className={styles['required-mark']}>*</span>
                </label>
                <div className={styles['form-control-wrapper']}>
                  <input
                    id="precio"
                    type="text"
                    name="precio"
                    value={formData.precio}
                    onChange={handleChange}
                    required
                    placeholder="0.00"
                    inputMode="decimal"
                    className={styles['form-control']}
                    style={{ padding: '12px 16px', fontSize: '15px' }}
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className={styles['form-actions']} style={{ padding: '30px 50px', borderTop: '1px solid #eee' }}>
            <button type="button" className={styles['cancel-button']} style={{ padding: '12px 24px', fontSize: '15px' }} onClick={onClose}>
              <FontAwesomeIcon icon={faTimes} style={{ marginRight: '8px' }} /> Cancelar
            </button>
            <button type="submit" className={styles['save-button']} style={{ padding: '12px 24px', fontSize: '15px' }}>
              <FontAwesomeIcon icon={faSave} style={{ marginRight: '8px' }} /> {editItem ? 'Actualizar' : 'Guardar'} Ítem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ItemFormModal; 