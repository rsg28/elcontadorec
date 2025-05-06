import React, { useState, useEffect, useMemo, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faEdit, faTrash, faChevronDown, faChevronRight, faSearch, faDollarSign, faFilter, faTimes, faSave, faCheck, faSpinner, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';
import useItems from '../hooks/useItems';
import { useAllServicios } from '../hooks/useServicios';
import useSubcategorias from '../hooks/useSubcategorias';
import useCategorias from '../hooks/useCategorias';
import useAuth from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';
import './AdminPanel.css';
import 'react-toastify/dist/ReactToastify.css';

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
          
          // Add warning for duplicate names in other categories
          if (servicesInOtherCategories.length > 0) {
            console.log('Servicios con mismo nombre en otras categorías:', servicesInOtherCategories);
          }
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
      console.log(`Usando servicio existente: ${existingServicio.nombre} (ID: ${servicioId})`);
    } else {
      // We'll need to create a new servicio on the backend
      // For now, we'll pass the name and handle creation in the backend
      servicioId = formData.servicio;
      console.log(`Se creará un nuevo servicio: ${formData.servicio}`);
    }
    
    // Find or create subcategoria ID
    let subcategoriaId = null;
    const existingSubcategoria = allSubcategorias.find(s => 
      s.nombre.toLowerCase() === formData.subcategoria.toLowerCase()
    );
    
    if (existingSubcategoria) {
      subcategoriaId = existingSubcategoria.id_subcategoria;
      console.log(`Usando subcategoría existente: ${existingSubcategoria.nombre} (ID: ${subcategoriaId})`);
    } else {
      // We'll need to create a new subcategoria on the backend
      // For now, we'll pass the name and handle creation in the backend
      subcategoriaId = formData.subcategoria;
      console.log(`Se creará una nueva subcategoría: ${formData.subcategoria}`);
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
    
    console.log('Enviando datos de ítem para guardar:', processedData);
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
    <div className="modal-overlay" onClick={(e) => {
      // Prevent closing when clicking outside
      // Commented out to prevent modal from closing when clicking outside
      // if (e.target === e.currentTarget) {
      //   onClose();
      // }
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
                        onClick={() => handleSuggestionSelect('servicio', suggestion.nombre)}
                      >
                        {suggestion.nombre}
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

// Modal para confirmar la eliminación de un servicio
const DeleteServiceModal = ({ show, onClose, onConfirm, servicioName, itemCount, subcategoriaCount }) => {
  // Add effect for escape key
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
  
  if (!show) return null;
  
  return (
    <div className="modal-overlay" onClick={(e) => {
      // Prevent closing when clicking outside
      // if (e.target === e.currentTarget) {
      //   onClose();
      // }
    }}>
      <div className="modal-content">
        <div className="modal-header">
          <h2>Eliminar Servicio</h2>
          <button className="close-button" onClick={onClose} aria-label="Cerrar">×</button>
        </div>
        
        <div className="modal-body">
          <div className="warning-icon">
            <FontAwesomeIcon icon={faExclamationTriangle} size="3x" color="#e74c3c" />
          </div>
          <p className="warning-message">
            Está a punto de eliminar el servicio <strong>{servicioName}</strong> y todos sus elementos asociados.
          </p>
          <p className="warning-details">
            Esta acción eliminará:
          </p>
          <ul className="warning-items">
            <li>{subcategoriaCount} subcategoría(s)</li>
            <li>{itemCount} ítem(s)</li>
          </ul>
          <p className="warning-permanent">
            Esta acción no se puede deshacer. ¿Está seguro que desea continuar?
          </p>
        </div>
        
        <div className="modal-footer">
          <button 
            className="cancel-button" 
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="delete-button" 
            onClick={onConfirm}
          >
            <FontAwesomeIcon icon={faTrash} /> Eliminar Servicio
          </button>
        </div>
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
  const { categorias: allCategorias, loading: categoriasLoading, error: categoriasError } = useCategorias();
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
    isLoading: false
  });
  
  // Add a new state to track expanded services
  const [expandedServices, setExpandedServices] = useState({});
  
  // Add a state to track the most recently updated service names
  const [updatedServiceNames, setUpdatedServiceNames] = useState({});
  
  // Add states to track updated subcategory names and prices
  const [updatedSubcategoryNames, setUpdatedSubcategoryNames] = useState({});
  const [updatedPrices, setUpdatedPrices] = useState({});
  
  // Add a ref to track if this is the initial load
  const isInitialLoadRef = useRef(true);
  
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
  const handleAddItem = async () => {
    try {
      // Save current expanded services state
      const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
      console.log('Saving expanded state before add item:', currentExpandedState);
      
      // Asegurarse de que tenemos los datos más actualizados
      console.log('Actualizando listas antes de mostrar el formulario de ítem');
      
      // Actualizar la lista de servicios primero
      await fetchAllServicios();
      
      // Restore the expanded services state exactly as it was
      console.log('Restoring expanded state after fetch:', currentExpandedState);
      setExpandedServices(currentExpandedState);
      
      // Luego configurar el estado para mostrar el formulario
      setCurrentEditItem(null);
      setShowItemForm(true);
    } catch (error) {
      console.error('Error al preparar formulario de ítem:', error);
      alert('Hubo un problema al preparar el formulario. Por favor, intente nuevamente.');
    }
  };
  
  // Handler for editing an item
  const handleEdit = async (type, id) => {
    if (type === 'item') {
      try {
        // Refrescar datos primero
        console.log('Actualizando listas antes de editar ítem');
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
      console.log('Guardando ítem con datos:', itemData);
      
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
        console.log('Creando nuevo servicio:', itemData.servicio_nombre);
        
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
              console.log('Servicio creado con ID:', result.data.id_servicio);
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
        
        console.log('Creando nueva subcategoría:', itemData.subcategoria_nombre);
        
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
              console.log('Subcategoría creada con ID:', result.data.id_subcategoria);
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
        console.log('Actualizando ítem existente con ID:', itemId);
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
          
          console.log('Item actualizado correctamente');
          success('Item actualizado correctamente');
        } else {
          showError(`Error al actualizar ítem: ${result.error}`);
        }
      } else {
        console.log('Creando nuevo ítem');
        const result = await addItem(itemData);
        if (result.success) {
          setShowItemForm(false);
          
          // Store the new item's service name for immediate display
          if (result.data && result.data.id_servicio) {
            // Update updatedServiceNames to ensure the UI shows the correct name immediately
            setUpdatedServiceNames(prev => ({
              ...prev,
              [result.data.id_servicio]: itemData.servicio_nombre
            }));
            
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
          
          console.log('Item creado correctamente');
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
      
      console.log('Eliminando servicio con ID:', deleteServiceState.servicioId);
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
      console.log(`Attempting to delete item with ID: ${id}`);
      
      // Find the item to get its service ID
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
        (item.id_items !== id && item.id_item !== id) // Exclude the item being deleted
      );
      
      const isLastItemForService = itemsForService.length === 0;
      
      if (isLastItemForService) {
        // If it's the last item, ask if they want to delete the entire service
        if (window.confirm(`Este es el último ítem para este servicio. ¿Desea eliminar el servicio completo?`)) {
          console.log(`Deleting the last item and the entire service with ID: ${servicioId}`);
          // Call the deleteServicio function instead
          deleteServicio(servicioId)
            .then(result => {
              if (result.success) {
                // Show toast notification
                success('Servicio y todos sus ítems eliminados correctamente');
                
                // Save current expanded state with deep copy
                const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
                
                // Refresh items and services to update the UI
                refreshItems()
                  .then(() => {
                    fetchAllServicios()
                      .then(() => {
                        // Restore expanded state exactly as it was
                        setExpandedServices(currentExpandedState);
                      });
                  });
              } else {
                console.error("Delete service error:", result.error);
                showError(`Error al eliminar servicio: ${result.error}`);
              }
            })
            .catch(error => {
              console.error("Unhandled error in delete service:", error);
              showError(`Error inesperado: ${error.message}`);
            });
        } else {
          // User chose not to delete the service, proceed with just deleting the item
          deleteItem(id)
            .then(result => {
              if (result.success) {
                // Show toast notification
                success('Ítem eliminado correctamente');
                
                // Save current expanded state with deep copy
                const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
                
                // Refresh items to update the list immediately
                refreshItems()
                  .then(() => {
                    // Restore expanded state exactly as it was
                    setExpandedServices(currentExpandedState);
                  });
              } else {
                console.error("Delete error:", result.error);
                showError(`Error al eliminar ítem: ${result.error}`);
              }
            })
            .catch(error => {
              console.error("Unhandled error in delete:", error);
              showError(`Error inesperado: ${error.message}`);
            });
        }
      } else {
        // Not the last item, proceed normally with just item deletion
        if (window.confirm(`¿Está seguro que desea eliminar este ítem?`)) {
          // Call the deleteItem function from useItems hook
          deleteItem(id)
            .then(result => {
              if (result.success) {
                // Show toast notification
                success('Ítem eliminado correctamente');
                
                // Save current expanded state with deep copy
                const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
                
                // Refresh items to update the list immediately
                refreshItems()
                  .then(() => {
                    // Restore expanded state exactly as it was
                    setExpandedServices(currentExpandedState);
                  });
              } else {
                console.error("Delete error:", result.error);
                showError(`Error al eliminar ítem: ${result.error}`);
              }
            })
            .catch(error => {
              console.error("Unhandled error in delete:", error);
              showError(`Error inesperado: ${error.message}`);
            });
        }
      }
    } else if (type === 'servicio') {
      handleDeleteService(id);
    } else {
      showError(`Operación no soportada: eliminar ${type} con ID: ${id}`);
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

  // Add state for dropdowns
  const [inlineEditOptions, setInlineEditOptions] = useState([]);

  // Update handleDoubleClick to allow free-text entry for services
  const handleDoubleClick = (itemId, field, value) => {
    // For service field, we'll use text input instead of dropdown
    if (field === 'servicio') {
      setEditingState({
        itemId,
        field,
        value: value || '',
        isLoading: false,
        originalValue: value // Store the original value for comparison
      });
    } 
    // For subcategoria, we still use dropdown
    else if (field === 'subcategoria') {
      const options = allSubcategorias.map(s => ({
        id: s.id_subcategoria,
        name: s.nombre
      }));
      
      setInlineEditOptions(options);
      setEditingState({
        itemId,
        field,
        value: value || '',
        isLoading: false
      });
    }
    // For price, we use the existing text input
    else {
      setEditingState({
        itemId,
        field,
        value: value || '',
        isLoading: false
      });
    }
  };

  // Update handleDropdownChange for subcategory selection
  const handleDropdownChange = (e) => {
    const newValue = e.target.value;
    
    // Update the state
    setEditingState({
      ...editingState,
      value: newValue
    });
    
    // Only auto-save for subcategory dropdown, not for service (which is now a text input)
    if (editingState.field === 'subcategoria') {
      setEditingState(prev => ({
        ...prev,
        value: newValue,
        isLoading: true
      }));
      
      // Auto-save after a brief delay to allow state update
      setTimeout(() => {
        handleInlineEditSave();
      }, 100);
    }
  };

  // Update handleInlineEditSave to track all updated fields
  const handleInlineEditSave = async () => {
    const { itemId, field, value, originalValue } = editingState;
    if (!value.trim()) return;
    
    setEditingState({
      ...editingState,
      isLoading: true
    });
    
    try {
      const itemToUpdate = itemsWithDetails.find(item => item.id_items === itemId || item.id_item === itemId);
      if (!itemToUpdate) return;
      
      // Handle service name editing differently
      if (field === 'servicio') {
        // Only proceed if the name has changed
        if (value === originalValue) {
          setEditingState({
            itemId: null,
            field: null,
            value: '',
            isLoading: false
          });
          return;
        }
        
        // Find the service to get its ID and category
        const currentService = allServicios.find(s => s.id_servicio === itemToUpdate.id_servicio);
        if (!currentService) {
          showError('No se pudo encontrar el servicio actual');
          setEditingState({
            ...editingState,
            isLoading: false
          });
          return;
        }
        
        const categoryId = currentService.id_categoria;
        const servicioId = currentService.id_servicio;
        
        // Check if another service with the same name exists in this category
        const serviceWithSameNameInCategory = allServicios.find(s => 
          s.nombre.toLowerCase() === value.toLowerCase() && 
          s.id_categoria === categoryId &&
          s.id_servicio !== itemToUpdate.id_servicio
        );
        
        if (serviceWithSameNameInCategory) {
          warning(`Ya existe un servicio con el nombre "${value}" en la categoría "${categoryId}". Por favor, use un nombre diferente.`);
          setEditingState({
            ...editingState,
            isLoading: false
          });
          return;
        }
        
        // Update the service name in the backend
        const updateResult = await updateServicio(itemToUpdate.id_servicio, value);
        
        if (updateResult.success) {
          // First, store the updated service name for UI consistency
          setUpdatedServiceNames(prev => ({
            ...prev,
            [servicioId]: value
          }));
          
          // Update both data models first before resetting the editing state
          
          // 1. Update all items that reference this service ID
          updateLocalItems(items => {
            return items.map(item => {
              if (item.id_servicio === servicioId) {
                return { 
                  ...item, 
                  servicio_nombre: value,
                  // Make sure all references to the service name are updated
                  servicio: value
                };
              }
              return item;
            });
          });
          
          // 2. Update the services list in memory
          const updatedServicios = allServicios.map(s => {
            if (s.id_servicio === servicioId) {
              return { ...s, nombre: value };
            }
            return s;
          });
          setAllServicios(updatedServicios);
          
          // Only after updating the UI state, clear the editing state
          setEditingState({
            itemId: null,
            field: null,
            value: '',
            isLoading: false
          });
          
          // Save current expanded state with deep copy
          const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
          
          // Also refresh services from the server to ensure consistency
          await fetchAllServicios();
          
          // Restore expanded state
          setExpandedServices(currentExpandedState);
          
          success('Nombre de servicio actualizado correctamente');
        } else {
          showError(`Error al actualizar servicio: ${updateResult.error}`);
          setEditingState({
            ...editingState,
            isLoading: false
          });
        }
        
        return;
      }
      
      // For other fields (precio, subcategoria), continue with the existing logic
      const updatedItem = { ...itemToUpdate };
      
      if (field === 'precio') {
        // Validate that the price is a valid number
        const price = parseFloat(value);
        if (isNaN(price) || price < 0) {
          warning('Por favor ingrese un precio válido (número mayor o igual a 0)');
          setEditingState({
            ...editingState,
            isLoading: false
          });
          return;
        }
        updatedItem.precio = price;
      } 
      else if (field === 'subcategoria') {
        // For subcategory, we still use the dropdown selection
        const selectedSubcategory = allSubcategorias.find(s => s.nombre === value || s.id_subcategoria.toString() === value);
        
        if (!selectedSubcategory) {
          warning('Por favor seleccione una subcategoría válida');
          setEditingState({
            ...editingState,
            isLoading: false
          });
          return;
        }
        
        // Check if this item already has this subcategory name
        if (itemToUpdate.subcategoria_nombre === selectedSubcategory.nombre) {
          // No change needed
          setEditingState({
            itemId: null,
            field: null,
            value: '',
            isLoading: false
          });
          return;
        }
        
        // Check if another item in the same service already has this subcategory
        const itemsWithSameService = itemsWithDetails.filter(item => 
          item.id_servicio === itemToUpdate.id_servicio &&
          (item.id_items !== itemId && item.id_item !== itemId)
        );
        
        const duplicateSubcategory = itemsWithSameService.find(item => 
          item.subcategoria_nombre.toLowerCase() === selectedSubcategory.nombre.toLowerCase()
        );
        
        if (duplicateSubcategory) {
          warning(`La subcategoría "${selectedSubcategory.nombre}" ya está en uso en este servicio. Por favor, seleccione otra subcategoría.`);
          setEditingState({
            ...editingState,
            isLoading: false
          });
          return;
        }
        
        updatedItem.subcategoria_nombre = selectedSubcategory.nombre;
        updatedItem.id_subcategoria = selectedSubcategory.id_subcategoria;
      }
      
      // Use the correct id for updating, preferring id_items
      const idToUse = itemToUpdate.id_items || itemToUpdate.id_item;
      
      // Save the updated item to the database
      const result = await updateItem(idToUse, updatedItem);
      
      if (result.success) {
        // Store updated values for UI consistency
        if (field === 'precio') {
          setUpdatedPrices(prev => ({
            ...prev,
            [idToUse]: value
          }));
          
          // Update local items for immediate UI reflection
          updateLocalItems(items => {
            return items.map(item => {
              if ((item.id_items === idToUse) || (item.id_item === idToUse)) {
                return { ...item, precio: parseFloat(value) };
              }
              return item;
            });
          });
        } 
        else if (field === 'subcategoria') {
          setUpdatedSubcategoryNames(prev => ({
            ...prev,
            [idToUse]: selectedSubcategory.nombre
          }));
          
          // Update local items for immediate UI reflection
          updateLocalItems(items => {
            return items.map(item => {
              if ((item.id_items === idToUse) || (item.id_item === idToUse)) {
                return { 
                  ...item, 
                  subcategoria_nombre: selectedSubcategory.nombre,
                  id_subcategoria: selectedSubcategory.id_subcategoria 
                };
              }
              return item;
            });
          });
        }
        
        // Reset editing state
        setEditingState({
          itemId: null,
          field: null,
          value: '',
          isLoading: false
        });
        
        // Clear options
        setInlineEditOptions([]);
        
        // Save current expanded state with deep copy
        const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
        
        // Refresh the items data to show the updated value immediately
        await refreshItems();
        
        // Restore expanded state
        setExpandedServices(currentExpandedState);
        
        success(`${field === 'subcategoria' ? 'Subcategoría' : 'Precio'} actualizado correctamente`);
      } else {
        showError(`Error al actualizar: ${result.error}`);
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
      showError('Error al guardar los cambios');
    }
  };

  // Update handleInlineEditCancel to clear options
  const handleInlineEditCancel = () => {
    setEditingState({
      itemId: null,
      field: null,
      value: '',
      isLoading: false
    });
    setInlineEditOptions([]);
  };

  // Add a function to toggle service expansion
  const toggleServiceExpansion = (serviceId) => {
    setExpandedServices(prev => {
      // Create a copy of the previous state
      const newState = { ...prev };
      
      // Toggle the state for this service
      newState[serviceId] = !newState[serviceId];
      
      // For debugging
      console.log(`Toggled service ${serviceId} to ${newState[serviceId] ? 'expanded' : 'collapsed'}`);
      
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
  const handleInlineEditKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleInlineEditSave();
    } else if (e.key === 'Escape') {
      handleInlineEditCancel();
    }
  };

  // Add back handleInlineEditChange for price editing
  const handleInlineEditChange = (e) => {
    // Special handling for price - only allow numbers and decimal point
    if (editingState.field === 'precio') {
      const value = e.target.value;
      if (value === '' || /^\d*\.?\d*$/.test(value)) {
        setEditingState({
          ...editingState,
          value: value
        });
      }
    } else {
      setEditingState({
        ...editingState,
        value: e.target.value
      });
    }
  };

  // Add a useEffect to handle clicks outside the edit field
  useEffect(() => {
    // Only add the handler if we're in edit mode
    if (editingState.itemId) {
      function handleClickOutside(event) {
        const editField = document.querySelector('.inline-edit-field');
        if (editField && !editField.contains(event.target)) {
          // If we clicked outside and it's not the price field (which needs manual save),
          // cancel editing
          if (editingState.field !== 'precio') {
            handleInlineEditCancel();
          }
        }
      }
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [editingState.itemId, editingState.field]);

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
          {/* Primera fila: barra de búsqueda ocupando todo el ancho */}
          <div className="search-row search-row-full">
            <div className="search-field search-field-full">
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
          </div>
          
          {/* Segunda fila: opciones de filtrado alineadas */}
          <div className="search-row filter-options-row">
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
            
            <div className="search-field actions-field">
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
              // Reorganize to group by category first, then by service
              Object.values(
                // First, group all services by category ID
                allServicios.reduce((categories, service) => {
                  // Skip services that don't match our filters
                  if (filters.servicioId !== 'all' && service.id_servicio !== parseInt(filters.servicioId)) {
                    return categories;
                  }
                  
                  // Skip if no items match this service
                  const hasMatchingItems = filteredItems.some(item => item.id_servicio === service.id_servicio);
                  if (!hasMatchingItems) {
                    return categories;
                  }
                  
                  // Get category info
                  const categoryId = service.id_categoria;
                  const category = allCategorias.find(c => c.id_categoria === categoryId);
                  
                  // Skip if we're filtering by category and this doesn't match
                  if (filters.categoriaId !== 'all' && categoryId !== parseInt(filters.categoriaId)) {
                    return categories;
                  }
                  
                  // Add category if it doesn't exist yet
                  if (!categories[categoryId]) {
                    categories[categoryId] = {
                      id: categoryId,
                      name: category ? category.nombre : 'Sin categoría',
                      color: getCategoryColor(categoryId),
                      services: []
                    };
                  }
                  
                  // Add this service to the category
                  categories[categoryId].services.push(service);
                  return categories;
                }, {})
              ).map(category => (
                <div key={`category-${category.id}`} className="category-group">
                  <div className="category-header" style={{ backgroundColor: category.color }}>
                    <h2 className="category-name">{category.name}</h2>
                    <div className="category-stats">
                      {category.services.length} servicio(s)
                    </div>
                  </div>
                  
                  <div className="category-services">
                    {category.services.map(servicio => {
                      // Get items for this service
                      const servicioItems = filteredItems.filter(item => item.id_servicio === servicio.id_servicio);
                      
                      return (
                        <div key={servicio.id_servicio} className="service-group">
                          <div 
                            className={`service-header ${expandedServices[servicio.id_servicio] ? 'expanded' : ''}`}
                            style={{ borderLeft: `4px solid ${category.color}` }}
                            onClick={() => toggleServiceExpansion(servicio.id_servicio)}
                          >
                            <FontAwesomeIcon 
                              icon={expandedServices[servicio.id_servicio] ? faChevronDown : faChevronRight} 
                              className="expand-icon" 
                            />
                            <div className="service-info">
                              <h3 className="service-name">{updatedServiceNames[servicio.id_servicio] || servicio.nombre}</h3>
                              <div className="service-category">{category.name}</div>
                            </div>
                            <div className="service-stats">
                              <span className="service-items-count">{servicioItems.length} ítem(s)</span>
                            </div>
                            <div className="service-actions">
                              <button 
                                className="action-button delete"
                                onClick={(e) => {
                                  e.stopPropagation(); // Prevent triggering the header click
                                  handleDelete('servicio', servicio.id_servicio);
                                }}
                                title="Eliminar servicio completo"
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </button>
                            </div>
                          </div>
                          
                          <div className={`service-items ${expandedServices[servicio.id_servicio] ? 'expanded' : ''}`}>
                            {servicioItems.map(item => (
                              <div key={item.id_items || item.id_item} className="item-card" style={{ borderLeft: `4px solid ${category.color}` }}>
                                <div className="item-header">
                                  <div className="item-main-info">
                                    <div className="item-service">
                                      <span className="service-label">Servicio:</span>
                                      {editingState.itemId === item.id_item && editingState.field === 'servicio' ? (
                                        <div className="inline-edit-field">
                                          <input
                                            type="text"
                                            value={editingState.value}
                                            onChange={(e) => setEditingState({...editingState, value: e.target.value})}
                                            onKeyDown={(e) => {
                                              if (e.key === 'Enter') handleInlineEditSave();
                                              if (e.key === 'Escape') handleInlineEditCancel();
                                            }}
                                            className="inline-edit-input"
                                            autoFocus
                                            placeholder="Nombre del servicio"
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
                                          onDoubleClick={() => handleDoubleClick(item.id_item, 'servicio', updatedServiceNames[item.id_servicio] || item.servicio_nombre)}
                                          title="Doble clic para editar"
                                        >
                                          {highlightText(updatedServiceNames[item.id_servicio] || item.servicio_nombre)}
                                        </span>
                                      )}
                                    </div>
                                    
                                    <div className="item-subcategory">
                                      <span className="subcategory-label">Subcategoría:</span>
                                      {editingState.itemId === item.id_item && editingState.field === 'subcategoria' ? (
                                        <div className="inline-edit-field">
                                          <select
                                            value={editingState.value}
                                            onChange={handleDropdownChange}
                                            className="inline-edit-select"
                                            autoFocus
                                          >
                                            <option value="">Seleccione una subcategoría</option>
                                            {inlineEditOptions.map(option => (
                                              <option key={option.id} value={option.name}>
                                                {option.name}
                                              </option>
                                            ))}
                                          </select>
                                          {editingState.isLoading && (
                                            <div className="loading-indicator-small">
                                              <FontAwesomeIcon icon={faSpinner} spin />
                                            </div>
                                          )}
                                        </div>
                                      ) : (
                                        <span 
                                          className="subcategory-name editable" 
                                          onDoubleClick={() => handleDoubleClick(item.id_item, 'subcategoria', updatedSubcategoryNames[item.id_item] || item.subcategoria_nombre)}
                                          title="Doble clic para editar"
                                        >
                                          {highlightText(updatedSubcategoryNames[item.id_item] || item.subcategoria_nombre)}
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
                                              placeholder="0.00"
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
                                        </div>
                                      ) : (
                                        <span 
                                          className="price-value editable" 
                                          onDoubleClick={() => handleDoubleClick(item.id_item, 'precio', updatedPrices[item.id_item] || item.precio)}
                                          title="Doble clic para editar"
                                        >
                                          ${formatPrice(updatedPrices[item.id_item] || item.precio)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  
                                  <div className="item-category-indicator" 
                                    style={{ backgroundColor: category.color }}
                                    title={`Categoría: ${category.name}`}
                                  >
                                    {category.name}
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
      
      <ToastContainer />
    </div>
  );
};

export default AdminPanel; 