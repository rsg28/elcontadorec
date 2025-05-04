import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faChevronDown, faChevronRight, faSearch, faDollarSign, faFilter, faTimes, faSave, faCheck, faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import useItems from '../hooks/useItems';
import { useAllServicios } from '../hooks/useServicios';
import useSubcategorias from '../hooks/useSubcategorias';
import useCategorias from '../hooks/useCategorias';
import useAuth from '../hooks/useAuth';
import './AdminPanel.css';

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
        const service = servicios.find(s => s.servicio_nombre === editItem.servicio_nombre);
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
        const servicioSuggestions = filteredServicios
          .filter(s => s.nombre.toLowerCase().includes(value.toLowerCase()))
          .map(s => s.nombre);
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
    
    if (!formData.categoria) {
      alert('Por favor seleccione una categoría');
      return;
    }
    
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
              <label htmlFor="categoria">
                Categoría <span className="required-mark">*</span>
              </label>
              <select
                id="categoria"
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                onKeyDown={(e) => handleKeyDown(e, 'categoria')}
                required
                className="form-control"
              >
                <option value="">Seleccione una categoría</option>
                {allCategorias.map(categoria => (
                  <option key={categoria.id_categoria} value={categoria.id_categoria}>
                    {categoria.nombre}
                  </option>
                ))}
              </select>
            </div>
            
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
                  placeholder={formData.categoria ? "Escriba para buscar o agregar servicio" : "Seleccione primero una categoría"}
                  className="form-control"
                  disabled={!formData.categoria}
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
              {!formData.categoria && (
                <div className="field-description">Primero seleccione una categoría para ver servicios disponibles</div>
              )}
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

// Add a function to get color based on category
const getCategoryColor = (categoryId) => {
  // Map category IDs to specific colors - you can customize these colors
  const colorMap = {
    1: '#4285F4', // Blue for Empresas
    2: '#EA4335', // Red for Personas
    3: '#FBBC05', // Yellow/Orange for Contabilidad
    4: '#34A853', // Green for Impuestos
    5: '#9C27B0', // Purple for Asesoría
    6: '#FF9800', // Orange for Capacitación
    7: '#795548', // Brown for Otros servicios
    8: '#00BCD4', // Cyan for another category
    9: '#607D8B', // Blue Grey for another category
    10: '#009688', // Teal for another category
  };
  
  // If category ID is not in the map, generate a color based on the ID
  if (!colorMap[categoryId]) {
    // Generate a color based on the category ID
    const hue = (categoryId * 137) % 360; // Use golden ratio to spread colors
    return `hsl(${hue}, 70%, 45%)`; // Good saturation and lightness for readability
  }
  
  return colorMap[categoryId] || '#757575'; // Default gray if category is null
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
    refreshItems 
  } = useItems();
  const { 
    servicios: allServicios, 
    loading: serviciosLoading, 
    error: serviciosError, 
    createServicio, 
    createSubcategoria 
  } = useAllServicios();
  const { subcategorias: allSubcategorias, loading: subcategoriasLoading, error: subcategoriasError } = useSubcategorias();
  const { categorias: allCategorias, loading: categoriasLoading, error: categoriasError } = useCategorias();
  
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
  
  // Add state for tracking which field is being edited
  const [editingState, setEditingState] = useState({
    itemId: null,
    field: null,
    value: '',
    isLoading: false
  });
  
  // Loading and error states - be less restrictive to prevent infinite loading
  const loading = itemsLoading && (!itemsWithDetails || itemsWithDetails.length === 0);
  const error = itemsError || serviciosError || subcategoriasError || categoriasError;
  
  // Check if user is authenticated and admin
  useEffect(() => {
    let isMounted = true; // Flag to prevent state updates after unmount

    const checkAccess = async () => {
      try {
        // Check authentication first
        if (!isAuthenticated()) {
          console.log('User not authenticated, redirecting');
          alert('Acceso restringido. Debe iniciar sesión.');
          navigate('/');
          return;
        }

        console.log('User authenticated, checking admin status...');
        
        // Now check admin status (properly awaiting the async function)
        const adminStatus = await isAdmin();
        console.log('Admin check result:', adminStatus);
        
        if (isMounted) {
          if (!adminStatus) {
            console.log('User is not an admin, redirecting');
            alert('Acceso restringido. Solo los administradores pueden acceder a esta página.');
            navigate('/');
          } else {
            console.log('Admin access granted');
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
    setCurrentEditItem(null);
    setShowItemForm(true);
  };
  
  // Handler for editing an item
  const handleEdit = (type, id) => {
    if (type === 'item') {
      const itemToEdit = itemsWithDetails.find(item => (item.id_items === id || item.id_item === id));
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
    try {
      // If new service needs to be created
      if (typeof itemData.id_servicio === 'string' && isNaN(parseInt(itemData.id_servicio))) {
        const result = await createServicio({ 
          nombre: itemData.id_servicio,
          id_categoria: parseInt(itemData.id_categoria) // Use the selected category ID
        });
        
        if (result.success) {
          // Update the item data with the new service ID
          itemData.id_servicio = result.data.id_servicio;
        } else {
          alert(`Error al crear servicio: ${result.error}`);
          return;
        }
      }
      
      // If new subcategory needs to be created
      if (typeof itemData.id_subcategoria === 'string' && isNaN(parseInt(itemData.id_subcategoria))) {
        // Try to create the subcategory first
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
          alert(`Error al crear subcategoría: ${result.error}`);
          return;
        }
      }
      
      // Now proceed with item creation/update
      if (itemId) {
        const result = await updateItem(itemId, itemData);
        if (result.success) {
          setShowItemForm(false);
          setCurrentEditItem(null);
          // Refresh items to show changes immediately
          await refreshItems();
        } else {
          alert(`Error al actualizar ítem: ${result.error}`);
        }
      } else {
        const result = await addItem(itemData);
        if (result.success) {
          setShowItemForm(false);
          // Refresh items to show the new item immediately
          await refreshItems();
        } else {
          alert(`Error al agregar ítem: ${result.error}`);
        }
      }
    } catch (error) {
      console.error('Error in handleSaveItem:', error);
      alert(`Error inesperado: ${error.message}`);
    }
  };

  // Handler for deleting an item
  const handleDelete = (type, id) => {
    if (type === 'item') {
      console.log(`Attempting to delete item with ID: ${id}`);
      if (window.confirm(`¿Está seguro que desea eliminar este ítem?`)) {
        // Call the deleteItem function from useItems hook
        deleteItem(id)
          .then(result => {
            if (result.success) {
              // Refresh items to update the list immediately
              refreshItems();
            } else {
              console.error("Delete error:", result.error);
              alert(`Error al eliminar ítem: ${result.error}`);
            }
          })
          .catch(error => {
            console.error("Unhandled error in delete:", error);
            alert(`Error inesperado: ${error.message}`);
          });
      }
    } else {
      alert(`Eliminar ${type} con ID: ${id}`);
    }
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

  // Handler for double-click on editable fields
  const handleDoubleClick = (itemId, field, value) => {
    setEditingState({
      itemId,
      field,
      value: value || '',
      isLoading: false
    });
  };
  
  // Handler for inline edit change
  const handleInlineEditChange = (e) => {
    setEditingState({
      ...editingState,
      value: e.target.value
    });
  };
  
  // Handler for saving inline edits
  const handleInlineEditSave = async () => {
    const { itemId, field, value } = editingState;
    if (!value.trim()) return;
    
    setEditingState({
      ...editingState,
      isLoading: true
    });
    
    try {
      const itemToUpdate = itemsWithDetails.find(item => item.id_items === itemId || item.id_item === itemId);
      if (!itemToUpdate) return;
      
      const updatedItem = { ...itemToUpdate };
      
      // Handle different fields
      if (field === 'precio') {
        // Validate that the price is a valid number
        const price = parseFloat(value);
        if (isNaN(price) || price < 0) {
          alert('Por favor ingrese un precio válido');
          setEditingState({
            ...editingState,
            isLoading: false
          });
          return;
        }
        updatedItem.precio = price;
      } 
      else if (field === 'servicio') {
        updatedItem.servicio_nombre = value;
        
        // Check if this service already exists
        const existingService = allServicios.find(s => 
          s.nombre.toLowerCase() === value.toLowerCase()
        );
        
        if (existingService) {
          updatedItem.id_servicio = existingService.id_servicio;
        } else {
          // Will create a new service on save
          updatedItem.id_servicio = value;
        }
      } 
      else if (field === 'subcategoria') {
        updatedItem.subcategoria_nombre = value;
        
        // Check if this subcategory already exists
        const existingSubcategory = allSubcategorias.find(s => 
          s.nombre.toLowerCase() === value.toLowerCase()
        );
        
        if (existingSubcategory) {
          updatedItem.id_subcategoria = existingSubcategory.id_subcategoria;
        } else {
          // Will create a new subcategory on save
          updatedItem.id_subcategoria = value;
        }
      }
      
      // Use the correct id for updating, preferring id_items
      const idToUse = itemToUpdate.id_items || itemToUpdate.id_item;
      
      // Save the updated item to the database
      const result = await updateItem(idToUse, updatedItem);
      
      if (result.success) {
        // Reset editing state
        setEditingState({
          itemId: null,
          field: null,
          value: '',
          isLoading: false
        });
        
        // Refresh the items data to show the updated value immediately
        await refreshItems();
      } else {
        alert(`Error al actualizar: ${result.error}`);
        setEditingState({
          ...editingState,
          isLoading: false
        });
      }
    } catch (error) {
      console.error('Error saving inline edit:', error);
      setEditingState({
        ...editingState,
        isLoading: false
      });
      alert('Error al guardar los cambios');
    }
  };
  
  // Handler for canceling inline edit
  const handleInlineEditCancel = () => {
    setEditingState({
      itemId: null,
      field: null,
      value: '',
      isLoading: false
    });
  };
  
  // Event handler for key press in inline edit field
  const handleInlineEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInlineEditSave();
    } else if (e.key === 'Escape') {
      handleInlineEditCancel();
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
                  Filtrar por Categoría
                </label>
                <div className="filter-select-container">
                  <select 
                    name="categoriaId" 
                    value={filters.categoriaId} 
                    onChange={handleFilterChange}
                    className="filter-select"
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
            
            <div className="search-field">
              <div className="search-group">
                <label>
                  <FontAwesomeIcon icon={faFilter} className="label-icon" /> 
                  Filtrar por Servicio
                </label>
                <div className="filter-select-container">
                  <select 
                    name="servicioId" 
                    value={filters.servicioId} 
                    onChange={handleFilterChange}
                    className="filter-select"
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
          </div>
          
          <div className="search-row">
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
            
            <div className="search-field">
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
            <FontAwesomeIcon icon={faPlus} /> Agregar Item
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
              filteredItems.map(item => {
                // Find service to get its category
                const service = allServicios.find(s => s.id_servicio === item.id_servicio);
                const categoryId = service ? service.id_categoria : null;
                const categoryColor = getCategoryColor(categoryId);
                
                // Find category name
                const category = allCategorias.find(c => c.id_categoria === categoryId);
                const categoryName = category ? category.nombre : 'Sin categoría';
                
                return (
                  <div key={item.id_items || item.id_item} className="item-card" style={{ borderLeft: `4px solid ${categoryColor}` }}>
                    <div className="item-header">
                      <div className="item-main-info">
                        <div className="item-service">
                          <span className="service-label">Servicio:</span>
                          {editingState.itemId === item.id_item && editingState.field === 'servicio' ? (
                            <div className="inline-edit-field">
                              <input
                                type="text"
                                value={editingState.value}
                                onChange={handleInlineEditChange}
                                onKeyDown={handleInlineEditKeyDown}
                                className="inline-edit-input"
                                autoFocus
                              />
                              <div className="inline-edit-actions">
                                {editingState.isLoading ? (
                                  <FontAwesomeIcon icon={faSpinner} spin className="inline-edit-icon" />
                                ) : (
                                  <>
                                    <button 
                                      className="inline-edit-button save" 
                                      onClick={handleInlineEditSave}
                                      title="Guardar"
                                    >
                                      <FontAwesomeIcon icon={faCheck} />
                                    </button>
                                    <button 
                                      className="inline-edit-button cancel" 
                                      onClick={handleInlineEditCancel}
                                      title="Cancelar"
                                    >
                                      <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span 
                              className="service-name editable" 
                              onDoubleClick={() => handleDoubleClick(item.id_item, 'servicio', item.servicio_nombre)}
                              title="Doble clic para editar"
                            >
                              {highlightText(item.servicio_nombre)}
                            </span>
                          )}
                        </div>
                        
                        <div className="item-subcategory">
                          <span className="subcategory-label">Subcategoría:</span>
                          {editingState.itemId === item.id_item && editingState.field === 'subcategoria' ? (
                            <div className="inline-edit-field">
                              <input
                                type="text"
                                value={editingState.value}
                                onChange={handleInlineEditChange}
                                onKeyDown={handleInlineEditKeyDown}
                                className="inline-edit-input"
                                autoFocus
                              />
                              <div className="inline-edit-actions">
                                {editingState.isLoading ? (
                                  <FontAwesomeIcon icon={faSpinner} spin className="inline-edit-icon" />
                                ) : (
                                  <>
                                    <button 
                                      className="inline-edit-button save" 
                                      onClick={handleInlineEditSave}
                                      title="Guardar"
                                    >
                                      <FontAwesomeIcon icon={faCheck} />
                                    </button>
                                    <button 
                                      className="inline-edit-button cancel" 
                                      onClick={handleInlineEditCancel}
                                      title="Cancelar"
                                    >
                                      <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span 
                              className="subcategory-name editable" 
                              onDoubleClick={() => handleDoubleClick(item.id_item, 'subcategoria', item.subcategoria_nombre)}
                              title="Doble clic para editar"
                            >
                              {highlightText(item.subcategoria_nombre)}
                            </span>
                          )}
                        </div>
                        
                        <div className="item-price-display">
                          <span className="price-label">Precio:</span>
                          {editingState.itemId === item.id_item && editingState.field === 'precio' ? (
                            <div className="inline-edit-field">
                              <div className="price-edit-container">
                                <span className="price-edit-symbol">$</span>
                                <input
                                  type="text"
                                  value={editingState.value}
                                  onChange={handleInlineEditChange}
                                  onKeyDown={handleInlineEditKeyDown}
                                  className="inline-edit-input"
                                  autoFocus
                                />
                              </div>
                              <div className="inline-edit-actions">
                                {editingState.isLoading ? (
                                  <FontAwesomeIcon icon={faSpinner} spin className="inline-edit-icon" />
                                ) : (
                                  <>
                                    <button 
                                      className="inline-edit-button save" 
                                      onClick={handleInlineEditSave}
                                      title="Guardar"
                                    >
                                      <FontAwesomeIcon icon={faCheck} />
                                    </button>
                                    <button 
                                      className="inline-edit-button cancel" 
                                      onClick={handleInlineEditCancel}
                                      title="Cancelar"
                                    >
                                      <FontAwesomeIcon icon={faTimes} />
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span 
                              className="price-value editable" 
                              onDoubleClick={() => handleDoubleClick(item.id_item, 'precio', item.precio)}
                              title="Doble clic para editar"
                            >
                              ${formatPrice(item.precio)}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="item-category-indicator" 
                        style={{ backgroundColor: categoryColor }}
                        title={`Categoría: ${categoryName}`}
                      >
                        {categoryName}
                      </div>
                      
                      <div className="item-controls">
                        <div className="item-actions">
                          <button 
                            className="action-button delete"
                            onClick={() => handleDelete('item', item.id_items || item.id_item)}
                            title="Eliminar ítem"
                          >
                            <FontAwesomeIcon icon={faTrash} />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    {(item.descripcion || item.opciones) && (
                      <div className={`item-details ${expandedItems[item.id_items || item.id_item] ? 'expanded' : ''}`}>
                        <div className="item-section">
                          <div className="item-section-row">
                            {item.descripcion && (
                              <div className="item-detail">
                                <span className="detail-label">Descripción:</span>
                                <span className="detail-value">{item.descripcion}</span>
                              </div>
                            )}
                            
                            {item.opciones && (
                              <div className="item-detail">
                                <span className="detail-label">Opciones:</span>
                                <span className="detail-value">{item.opciones}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
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
    </div>
  );
};

export default AdminPanel; 