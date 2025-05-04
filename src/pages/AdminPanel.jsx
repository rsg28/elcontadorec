import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faChevronDown, faChevronRight, faSearch, faDollarSign, faFilter, faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import useItems from '../hooks/useItems';
import { useAllServicios } from '../hooks/useServicios';
import useSubcategorias from '../hooks/useSubcategorias';
import './AdminPanel.css';

// Item form modal component
const ItemFormModal = ({ show, onClose, onSave, servicios, allSubcategorias, editItem = null }) => {
  // Initialize form state
  const [formData, setFormData] = useState({
    precio: '',
    servicio: '',
    subcategoria: ''
  });

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
        // Fill form with existing item data if editing
        setFormData({
          precio: editItem.precio?.toString() || '',
          servicio: editItem.servicio_nombre || '',
          subcategoria: editItem.subcategoria_nombre || ''
        });
      } else {
        // Reset form for new item
        setFormData({
          precio: '',
          servicio: '',
          subcategoria: ''
        });
      }
      // Clear suggestions
      setSuggestions({
        servicios: [],
        subcategorias: []
      });
    }
  }, [show, editItem]);

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
        const filteredServicios = servicios
          .filter(s => s.nombre.toLowerCase().includes(value.toLowerCase()))
          .map(s => s.nombre);
        setSuggestions(prev => ({ ...prev, servicios: filteredServicios }));
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
    setFormData(prev => ({ ...prev, [type]: value }));
    setSuggestions(prev => ({ ...prev, [type + 's']: [] }));
    
    // Focus on the next field
    if (type === 'servicio' && subcategoriaInputRef.current) {
      subcategoriaInputRef.current.querySelector('input').focus();
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Find or create servicio ID
    let servicioId = null;
    const existingServicio = servicios.find(s => 
      s.nombre.toLowerCase() === formData.servicio.toLowerCase()
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
      subcategoria_nombre: formData.subcategoria
    };
    
    onSave(processedData, editItem?.id_item);
  };

  // Handle key event for navigating between fields
  const handleKeyDown = (e, fieldName) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      if (fieldName === 'servicio' && subcategoriaInputRef.current) {
        subcategoriaInputRef.current.querySelector('input').focus();
      } else if (fieldName === 'subcategoria') {
        // Trigger form submission
        handleSubmit(e);
      }
    }
  };
  
  if (!show) return null;
  
  return (
    <div className="modal-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editItem ? 'Editar Ítem' : 'Agregar Nuevo Ítem'}</h2>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-layout">
            <div className="form-group">
              <label htmlFor="servicio">
                Servicio <span className="required-mark">*</span>
              </label>
              <div className="autocomplete-container" ref={servicioInputRef}>
                <input
                  id="servicio"
                  type="text"
                  name="servicio"
                  value={formData.servicio}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'servicio')}
                  required
                  placeholder="Escriba para buscar o agregar servicio"
                  className="form-control"
                  autoFocus
                />
                {suggestions.servicios.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.servicios.map((suggestion, index) => (
                      <li 
                        key={index}
                        onClick={() => handleSuggestionSelect('servicio', suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="subcategoria">
                Subcategoría <span className="required-mark">*</span>
              </label>
              <div className="autocomplete-container" ref={subcategoriaInputRef}>
                <input
                  id="subcategoria"
                  type="text"
                  name="subcategoria"
                  value={formData.subcategoria}
                  onChange={handleChange}
                  onKeyDown={(e) => handleKeyDown(e, 'subcategoria')}
                  required
                  placeholder="Escriba para buscar o agregar subcategoría"
                  className="form-control"
                />
                {suggestions.subcategorias.length > 0 && (
                  <ul className="suggestions-list">
                    {suggestions.subcategorias.map((suggestion, index) => (
                      <li 
                        key={index}
                        onClick={() => handleSuggestionSelect('subcategoria', suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="precio">
                Precio <span className="required-mark">*</span>
              </label>
              <div className="enhanced-price-input">
                <span className="currency-symbol">$</span>
                <input
                  id="precio"
                  type="text"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                  inputMode="decimal"
                  className="form-control price-control"
                />
              </div>
            </div>
          </div>
          
          <div className="form-actions">
            <button type="button" className="cancel-button" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="save-button">
              <FontAwesomeIcon icon={faSave} /> {editItem ? 'Actualizar' : 'Guardar'} Ítem
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const AdminPanel = () => {
  const { items, loading: itemsLoading, error: itemsError, deleteItem, addItem, updateItem } = useItems();
  const { servicios, loading: serviciosLoading, error: serviciosError } = useAllServicios();
  const { subcategorias: allSubcategorias, loading: subcategoriasLoading, error: subcategoriasError, createSubcategoria } = useSubcategorias();
  
  const [expandedItems, setExpandedItems] = useState({});
  const [showItemForm, setShowItemForm] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    minPrice: '',
    maxPrice: '',
    filterType: 'all' // 'all', 'service', 'subcategory', 'item'
  });
  
  // Loading and error states
  const loading = itemsLoading || serviciosLoading || subcategoriasLoading;
  const error = itemsError || serviciosError || subcategoriasError;
  
  // Use useMemo to calculate filtered items only when dependencies change
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // If no filters are applied, show all items
      if (filters.searchTerm === '' && filters.minPrice === '' && filters.maxPrice === '' && filters.filterType === 'all') {
        return true;
      }
      
      const searchTermLower = filters.searchTerm.toLowerCase().trim();
      
      // Filter by item name
      const matchesItemName = item.nombre?.toLowerCase().includes(searchTermLower);
      
      // Filter by service name
      const matchesServiceName = item.servicio_nombre?.toLowerCase().includes(searchTermLower);
      
      // Filter by subcategory name
      const matchesSubcategoryName = item.subcategoria_nombre?.toLowerCase().includes(searchTermLower);
      
      // Filter by price
      const price = parseFloat(item.precio || 0);
      const minPrice = filters.minPrice !== '' ? parseFloat(filters.minPrice) : 0;
      const maxPrice = filters.maxPrice !== '' ? parseFloat(filters.maxPrice) : Infinity;
      const matchesPrice = price >= minPrice && price <= maxPrice;
      
      // Apply filters based on filterType
      if (filters.filterType === 'service') {
        return matchesServiceName && matchesPrice;
      } else if (filters.filterType === 'subcategory') {
        return matchesSubcategoryName && matchesPrice;
      } else if (filters.filterType === 'item') {
        return matchesItemName && matchesPrice;
      } else if (filters.minPrice !== '' || filters.maxPrice !== '') {
        return matchesPrice && (searchTermLower === '' || matchesItemName || matchesServiceName || matchesSubcategoryName);
      } else {
        return matchesItemName || matchesServiceName || matchesSubcategoryName;
      }
    });
  }, [items, filters]);

  // Auto-expand first few items when search term is applied
  useEffect(() => {
    if (filters.searchTerm.trim() !== '') {
      // Expand first 3 items in search results if not already expanded
      const newExpandedItems = { ...expandedItems };
      
      filteredItems.slice(0, 3).forEach(item => {
        if (item.id_item && !newExpandedItems[item.id_item]) {
          newExpandedItems[item.id_item] = true;
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
      filterType: 'all'
    });
  };
  
  // Count total filtered results
  const filteredCount = filteredItems.length;
  const totalCount = items.length;

  // Handler for adding a new item
  const handleAddItem = () => {
    setCurrentEditItem(null);
    setShowItemForm(true);
  };
  
  // Handler for editing an item
  const handleEdit = (type, id) => {
    if (type === 'item') {
      const itemToEdit = items.find(item => item.id_item === id);
      if (itemToEdit) {
        setCurrentEditItem(itemToEdit);
        setShowItemForm(true);
      }
    } else {
      alert(`Editar ${type} con ID: ${id}`);
    }
  };
  
  // Handler for saving or updating an item
  const handleSaveItem = async (itemData, itemId) => {
    // If new subcategory needs to be created
    if (typeof itemData.id_subcategoria === 'string' && isNaN(parseInt(itemData.id_subcategoria))) {
      // Try to create the subcategory first
      try {
        const result = await createSubcategoria({ 
          nombre: itemData.subcategoria_nombre,
          id_servicio: itemData.id_servicio
        });
        
        if (result.success) {
          // Update the item data with the new subcategory ID
          itemData.id_subcategoria = result.data.id_subcategoria;
        } else {
          alert(`Error al crear subcategoría: ${result.error}`);
          return;
        }
      } catch (error) {
        alert(`Error al crear subcategoría: ${error.message}`);
        return;
      }
    }
    
    // Now proceed with item creation/update
    if (itemId) {
      updateItem(itemId, itemData)
        .then(result => {
          if (result.success) {
            alert("Ítem actualizado correctamente");
            setShowItemForm(false);
            setCurrentEditItem(null);
          } else {
            alert(`Error al actualizar ítem: ${result.error}`);
          }
        });
    } else {
      addItem(itemData)
        .then(result => {
          if (result.success) {
            alert("Ítem agregado correctamente");
            setShowItemForm(false);
          } else {
            alert(`Error al agregar ítem: ${result.error}`);
          }
        });
    }
  };

  // Handler for deleting an item
  const handleDelete = (type, id) => {
    if (type === 'item' && window.confirm(`¿Está seguro que desea eliminar el ítem con ID: ${id}?`)) {
      // Call the deleteItem function from useItems hook
      deleteItem(id)
        .then(result => {
          if (result.success) {
            alert("Ítem eliminado correctamente");
          } else {
            alert(`Error al eliminar ítem: ${result.error}`);
          }
        });
    } else {
      alert(`Eliminar ${type} con ID: ${id}`);
    }
  };

  // Filter is active if any filter has a value
  const isFilterActive = filters.searchTerm !== '' || 
                         filters.minPrice !== '' || 
                         filters.maxPrice !== '' || 
                         filters.filterType !== 'all';

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

  return (
    <div className="admin-panel-container">
      <h1 className="admin-panel-title">Panel de Administración</h1>
      
      <div className="search-filters">
        <div className="search-filters-content">
          <div className="search-row">
            <div className="search-field">
              <div className="search-group">
                <label>
                  <FontAwesomeIcon icon={faSearch} className="label-icon" /> 
                  Buscar
                </label>
                <div className="search-input-container">
                  <input
                    type="text"
                    name="searchTerm"
                    placeholder="Nombre de ítem, servicio o subcategoría..."
                    value={filters.searchTerm}
                    onChange={handleFilterChange}
                    className="search-input"
                    autoFocus
                  />
                  {filters.searchTerm && (
                    <FontAwesomeIcon 
                      icon={faTimes} 
                      className="clear-input-icon" 
                      onClick={() => setFilters(prev => ({...prev, searchTerm: ''}))}
                    />
                  )}
                </div>
              </div>
            </div>
            
            <div className="search-field">
              <div className="search-group">
                <label>
                  <FontAwesomeIcon icon={faDollarSign} className="label-icon" /> 
                  Precio mínimo
                </label>
                <div className="price-input-container">
                  <span className="price-symbol">$</span>
                  <input
                    type="text"
                    name="minPrice"
                    placeholder=""
                    value={filters.minPrice}
                    onChange={handlePriceChange}
                    className="price-input"
                    inputMode="decimal"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="search-row">
            <div className="search-field">
              <div className="search-group">
                <label>
                  <FontAwesomeIcon icon={faFilter} className="label-icon" /> 
                  Filtrar por
                </label>
                <div className="filter-select-container">
                  <select 
                    name="filterType" 
                    value={filters.filterType} 
                    onChange={handleFilterChange}
                    className="filter-select"
                  >
                    <option value="all">Todos</option>
                    <option value="item">Solo Ítems</option>
                    <option value="service">Solo Servicios</option>
                    <option value="subcategory">Solo Subcategorías</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="search-field">
              <div className="search-group">
                <label>
                  <FontAwesomeIcon icon={faDollarSign} className="label-icon" /> 
                  Precio máximo
                </label>
                <div className="price-input-container">
                  <span className="price-symbol">$</span>
                  <input
                    type="text"
                    name="maxPrice"
                    placeholder=""
                    value={filters.maxPrice}
                    onChange={handlePriceChange}
                    className="price-input"
                    inputMode="decimal"
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className="actions-row">
            <button 
              className={`clear-filters-btn ${isFilterActive ? 'active' : ''}`}
              onClick={clearFilters}
              disabled={!isFilterActive}
            >
              <FontAwesomeIcon icon={faTimes} /> Limpiar filtros
            </button>
          </div>
        </div>
        
        {isFilterActive && (
          <div className="search-results-info">
            Mostrando {filteredCount} de {totalCount} ítems
          </div>
        )}
      </div>
      
      <div className="admin-content">
        <div className="admin-header">
          <button 
            className="add-button"
            onClick={handleAddItem}
          >
            <FontAwesomeIcon icon={faPlus} /> Agregar Ítem
          </button>
        </div>
        
        {loading ? (
          <div className="loading-indicator">Cargando...</div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : (
          <div className="items-list">
            {filteredItems.length === 0 ? (
              <p className="no-data">No hay ítems que coincidan con los criterios de búsqueda</p>
            ) : (
              filteredItems.map(item => (
                <div key={item.id_item} className="item-card">
                  <div 
                    className="item-header"
                    onClick={() => toggleItemExpansion(item.id_item)}
                  >
                    <FontAwesomeIcon 
                      icon={expandedItems[item.id_item] ? faChevronDown : faChevronRight} 
                      className="expand-icon"
                    />
                    <div className="item-info">
                      <span className="item-id">ID: {item.id_item}</span>
                      <h3 className="item-name">
                        {highlightText(item.nombre || 'Sin nombre')}
                      </h3>
                      <div className="item-price">
                        <span className="price">${formatPrice(item.precio)}</span>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button 
                        className="action-button edit"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEdit('item', item.id_item);
                        }}
                      >
                        <FontAwesomeIcon icon={faEdit} />
                      </button>
                      <button 
                        className="action-button delete"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete('item', item.id_item);
                        }}
                      >
                        <FontAwesomeIcon icon={faTrash} />
                      </button>
                    </div>
                  </div>
                  
                  <div className={`item-details ${expandedItems[item.id_item] ? 'expanded' : ''}`}>
                    <div className="item-section">
                      <div className="item-section-row">
                        <div className="item-detail">
                          <span className="detail-label">Servicio:</span>
                          <span className="detail-value">{highlightText(item.servicio_nombre)}</span>
                        </div>
                        <div className="item-detail">
                          <span className="detail-label">Subcategoría:</span>
                          <span className="detail-value">{highlightText(item.subcategoria_nombre)}</span>
                        </div>
                      </div>
                      
                      <div className="item-section-row">
                        <div className="item-detail">
                          <span className="detail-label">Descripción:</span>
                          <span className="detail-value">{item.descripcion || 'Sin descripción'}</span>
                        </div>
                      </div>
                      
                      {item.opciones && (
                        <div className="item-section-row">
                          <div className="item-detail">
                            <span className="detail-label">Opciones:</span>
                            <span className="detail-value">{item.opciones}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
      
      {/* Modal form for adding or editing items */}
      <ItemFormModal 
        show={showItemForm}
        onClose={() => {
          setShowItemForm(false);
          setCurrentEditItem(null);
        }}
        onSave={handleSaveItem}
        servicios={servicios}
        allSubcategorias={allSubcategorias}
        editItem={currentEditItem}
      />
    </div>
  );
};

export default AdminPanel; 