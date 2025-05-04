import React, { useState, useEffect, useMemo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faChevronDown, faChevronRight, faSearch, faDollarSign, faFilter, faTimes, faSave } from '@fortawesome/free-solid-svg-icons';
import useItems from '../hooks/useItems';
import { useAllServicios } from '../hooks/useServicios';
import './AdminPanel.css';

// Item form modal component
const ItemFormModal = ({ show, onClose, onSave, servicios, editItem = null }) => {
  // Initialize form state
  const [formData, setFormData] = useState({
    nombre: '',
    precio: '',
    id_servicio: '',
    id_subcategoria: ''
  });
  
  // State for available subcategories based on selected service
  const [availableSubcategorias, setAvailableSubcategorias] = useState([]);
  
  // Reset form when modal is opened/closed or editItem changes
  useEffect(() => {
    if (show) {
      if (editItem) {
        // Fill form with existing item data if editing
        setFormData({
          nombre: editItem.nombre || '',
          precio: editItem.precio?.toString() || '',
          id_servicio: editItem.servicio?.id_servicio?.toString() || '',
          id_subcategoria: editItem.id_subcategoria?.toString() || ''
        });
      } else {
        // Reset form for new item
        setFormData({
          nombre: '',
          precio: '',
          id_servicio: '',
          id_subcategoria: ''
        });
      }
    }
  }, [show, editItem]);
  
  // Update available subcategories when service changes
  useEffect(() => {
    if (formData.id_servicio) {
      const selectedServicio = servicios.find(s => s.id_servicio.toString() === formData.id_servicio);
      if (selectedServicio && selectedServicio.subcategorias) {
        setAvailableSubcategorias(selectedServicio.subcategorias);
      } else {
        setAvailableSubcategorias([]);
      }
      
      // Don't reset subcategory if we're editing and it belongs to this service
      if (!editItem || editItem.servicio?.id_servicio?.toString() !== formData.id_servicio) {
        setFormData(prev => ({ ...prev, id_subcategoria: '' }));
      }
    } else {
      setAvailableSubcategorias([]);
    }
  }, [formData.id_servicio, servicios, editItem]);
  
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
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Convert precio to number and validate required fields
    const processedData = {
      ...formData,
      precio: parseFloat(formData.precio) || 0
    };
    
    onSave(processedData, editItem?.id_item);
  };
  
  if (!show) return null;
  
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>{editItem ? 'Editar Ítem' : 'Agregar Nuevo Ítem'}</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="nombre">Nombre del Ítem *</label>
            <input
              id="nombre"
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              placeholder="Ingrese nombre del ítem"
              className="form-control"
              autoFocus
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="precio">Precio *</label>
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
          
          <div className="form-group">
            <label htmlFor="id_servicio">Servicio *</label>
            <select
              id="id_servicio"
              name="id_servicio"
              value={formData.id_servicio}
              onChange={handleChange}
              required
              className="form-control"
            >
              <option value="">Seleccione un servicio</option>
              {servicios.map(servicio => (
                <option key={servicio.id_servicio} value={servicio.id_servicio}>
                  {servicio.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="id_subcategoria">Subcategoría *</label>
            <select
              id="id_subcategoria"
              name="id_subcategoria"
              value={formData.id_subcategoria}
              onChange={handleChange}
              required
              disabled={!formData.id_servicio}
              className="form-control"
            >
              <option value="">
                {formData.id_servicio 
                  ? "Seleccione una subcategoría" 
                  : "Primero seleccione un servicio"}
              </option>
              {availableSubcategorias.map(subcategoria => (
                <option key={subcategoria.id_subcategoria} value={subcategoria.id_subcategoria}>
                  {subcategoria.nombre}
                </option>
              ))}
            </select>
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
  const loading = itemsLoading || serviciosLoading;
  const error = itemsError || serviciosError;
  
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
  const handleSaveItem = (itemData, itemId) => {
    // If itemId is provided, update existing item
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
      // Otherwise add new item
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
        editItem={currentEditItem}
      />
    </div>
  );
};

export default AdminPanel; 