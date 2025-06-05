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
  faHeart, faThumbsUp, faBell, faImage
} from '@fortawesome/free-solid-svg-icons';
import { useNavigate } from 'react-router-dom';

// Import custom hooks
import useItems from '../hooks/useItems';
import { useAllServicios } from '../hooks/useServicios';
import useSubcategorias from '../hooks/useSubcategorias';
import useCategorias from '../hooks/useCategorias';
import useAuth from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';
import useCaracteristicas from '../hooks/useCaracteristicas';

// Import extracted components and utilities
import { useAdminPanelState } from '../components/admin/hooks/useAdminPanelState';
import { useItemOperations } from '../components/admin/hooks/useItemOperations';
import { useServiceOperations } from '../components/admin/hooks/useServiceOperations';
import { useCategoryOperations } from '../components/admin/hooks/useCategoryOperations';
import { 
  ItemFormModal, 
  CreateCategoryModal, 
  DeleteServiceModal,
  ColorPickerModal,
  DeleteCategoryModal,
  DeleteItemModal,
  CreateCaracteristicaModal,
  AssignCaracteristicaModal,
  DeleteCaracteristicaModal,
  VerCaracteristicasModal,
  EditServiceDescriptionModal,
  ServiceImageModal
} from '../components/admin/modals';
import { filterItems, isFilterActive, highlightText, formatPrice } from '../components/admin/utils/filterUtils.jsx';
import { commonIcons, DEFAULT_CATEGORY_COLOR } from '../components/admin/utils/commonIcons.jsx';

// Import styles and other components
import 'react-toastify/dist/ReactToastify.css';
import styles from './AdminPanel.module.css';
import LoadingAnimation from '../components/loadingAnimation';

const AdminPanel = () => {
  const { isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
  // Data hooks
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
    deleteServicio,
    updateServicio,
    fetchAllServicios,
    setServicios: setAllServicios 
  } = useAllServicios();
  
  const { 
    subcategorias: allSubcategorias, 
    loading: subcategoriasLoading, 
    error: subcategoriasError,
    createSubcategoria,
    deleteSubcategoria
  } = useSubcategorias();
  
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
  
  // Use extracted state management hook
  const {
    adminChecking,
    setAdminChecking,
    isAdminUser,
    setIsAdminUser,
    expandedItems,
    setExpandedItems,
    expandedServices,
    setExpandedServices,
    updatedServiceNames,
    setUpdatedServiceNames,
    updatedSubcategoryNames,
    setUpdatedSubcategoryNames,
    updatedPrices,
    setUpdatedPrices,
    showItemForm,
    setShowItemForm,
    currentEditItem,
    setCurrentEditItem,
    filters,
    setFilters,
    deleteServiceState,
    setDeleteServiceState,
    deleteItemState,
    setDeleteItemState,
    createCategoryState,
    setCreateCategoryState,
    colorPickerState,
    setColorPickerState,
    deleteCategoryState,
    setDeleteCategoryState,
    createCaracteristicaState,
    setCreateCaracteristicaState,
    assignCaracteristicaState,
    setAssignCaracteristicaState,
    deleteCaracteristicaState,
    setDeleteCaracteristicaState,
    verCaracteristicasState,
    setVerCaracteristicasState,
    editDescriptionState,
    setEditDescriptionState,
    serviceImageState,
    setServiceImageState,
    isInitialLoadRef
  } = useAdminPanelState();
  
  // Use extracted business logic hooks
  const { handleSaveItem, confirmDeleteItem, forceRefresh, cleanupUnusedSubcategorias } = useItemOperations({
    addItem,
    updateItem,
    deleteItem,
    refreshItems,
    updateLocalItems,
    allServicios,
    allSubcategorias,
    itemsWithDetails,
    createServicio,
    createSubcategoria,
    deleteSubcategoria,
    deleteServicio,
    fetchAllServicios,
    expandedServices,
    setExpandedServices,
    filters,
    setFilters,
    success,
    showError,
    warning
  });

  const { handleDeleteService, confirmDeleteService, cancelDeleteService } = useServiceOperations({
    deleteServicio,
    fetchAllServicios,
    refreshItems,
    allServicios,
    itemsWithDetails,
    expandedServices,
    setExpandedServices,
    cleanupUnusedSubcategorias,
    success,
    showError
  });

  const { 
    handleCreateCategory, 
    handleOpenColorPicker, 
    handleSaveColor, 
    handleDeleteCategory, 
    confirmDeleteCategory, 
    cancelDeleteCategory 
  } = useCategoryOperations({
    createCategoria,
    updateCategoria,
    deleteCategoria,
    deleteServicio,
    refreshItems,
    itemsWithDetails,
    allServicios,
    cleanupUnusedSubcategorias,
    success,
    showError
  });
  
  // Loading and error states
  const loading = itemsLoading || 
                 caracteristicasLoading ||
                 ((!itemsWithDetails || itemsWithDetails.length === 0) && !itemsError) || 
                 (allServicios.length === 0 && !serviciosError) ||
                 (allCategorias.length === 0 && !categoriasError);
  const error = itemsError || serviciosError || subcategoriasError || categoriasError || caracteristicasError;
  
  // Use extracted filter utility
  const filteredItems = useMemo(() => {
    try {
      // Ensure we have valid data before filtering
      if (!Array.isArray(itemsWithDetails) || !Array.isArray(allServicios)) {
        return [];
      }
      
      return filterItems(itemsWithDetails, filters, allServicios);
    } catch (error) {
      console.error('Error filtering items:', error);
      return itemsWithDetails || [];
    }
  }, [itemsWithDetails, filters, allServicios]);
  
  // Check if user is authenticated and admin - run only once on mount
  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      try {
        if (!isAuthenticated()) {
          alert('Acceso restringido. Debe iniciar sesión.');
          navigate('/');
          return;
        }

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
  }, []); // Empty dependency array - run only once on mount

  // Initialize expanded services based on allServicios data - only on first load
  useEffect(() => {
    if (isInitialLoadRef.current && allServicios.length > 0) {
      setExpandedServices({});
      isInitialLoadRef.current = false;
    }
  }, [allServicios]);

  // Auto-expand first few items when search term is applied
  useEffect(() => {
    if (filters.searchTerm.trim() !== '') {
      setExpandedItems(prevExpandedItems => {
        const newExpandedItems = { ...prevExpandedItems };
        let hasChanges = false;
        
        filteredItems.slice(0, 3).forEach(item => {
          const itemId = item.id_items || item.id_item;
          if (itemId && !newExpandedItems[itemId]) {
            newExpandedItems[itemId] = true;
            hasChanges = true;
          }
        });
        
        // Only update if there are actual changes
        return hasChanges ? newExpandedItems : prevExpandedItems;
      });
    }
  }, [filters.searchTerm, filteredItems]); // Removed expandedItems from dependencies to prevent infinite loop

  // Toggle item expansion
  const toggleItemExpansion = (itemId) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemId]: !prev[itemId]
    }));
  };

  // Handle real-time filter change
  const handleFilterChange = (e) => {
    try {
      const { name, value } = e.target;
      
      // Validate input
      if (typeof name !== 'string' || typeof value !== 'string') {
        console.error('Invalid filter input:', { name, value });
        return;
      }
      
      setFilters(prev => ({
        ...prev,
        [name]: value
      }));
    } catch (error) {
      console.error('Error in handleFilterChange:', error);
    }
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

  // Toggle service expansion
  const toggleServiceExpansion = (serviceId) => {
            setExpandedServices(prev => ({
              ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };

  // Caracteristica handlers
  const handleCreateCaracteristica = async (caracteristicaData) => {
    try {
      const result = await createCaracteristica(caracteristicaData);
      
      if (result.success) {
        success('Característica creada correctamente');
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

  const handleAssignCaracteristica = async (servicioId, caracteristicaId) => {
    try {
      const result = await addCaracteristicaToServicio(servicioId, caracteristicaId);
      
      if (result.success) {
        success('Característica asignada correctamente al servicio');
        setAssignCaracteristicaState({
          show: false,
          isLoading: false
        });
        await fetchAllServicios();
      } else {
        showError(`Error al asignar característica: ${result.error}`);
      }
    } catch (error) {
      console.error('Error assigning caracteristica:', error);
      showError('Error inesperado al asignar la característica');
    }
  };

  const handleDeleteCaracteristica = (caracteristicaId, caracteristicaName) => {
    setDeleteCaracteristicaState({
      show: true,
      caracteristicaId,
      caracteristicaName,
      serviciosCount: 0,
      isLoading: false
    });
  };

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
      setDeleteCaracteristicaState({
        show: false,
        caracteristicaId: null,
        caracteristicaName: '',
        serviciosCount: 0,
        isLoading: false
      });
    }
  };

  const cancelDeleteCaracteristica = () => {
    setDeleteCaracteristicaState({
      show: false,
      caracteristicaId: null,
      caracteristicaName: '',
      serviciosCount: 0,
      isLoading: false
    });
  };

  // Service description handler
  const handleSaveServiceDescription = async (description) => {
    try {
      const { servicioId } = editDescriptionState;
      const result = await updateServicio(servicioId, { descripcion: description });
      
      if (result.success) {
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

  // Service image handlers
  const handleOpenServiceImageModal = (servicio, categoria) => {
    setServiceImageState({
      show: true,
      servicio,
      categoria,
      isLoading: false
    });
  };

  const handleServiceImageUpdated = (servicioId, imageUrl) => {
    // Update the local servicios state
    setAllServicios(prev => prev.map(s => 
      s.id_servicio === servicioId 
        ? { ...s, imagen: imageUrl }
        : s
    ));
    
    // Update the serviceImageState
    setServiceImageState(prev => ({
      ...prev,
      servicio: prev.servicio ? { ...prev.servicio, imagen: imageUrl } : null
    }));
    
    if (imageUrl) {
      success('Imagen del servicio actualizada correctamente');
    } else {
      success('Imagen del servicio eliminada correctamente');
    }
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
      handleDeleteService(id, setDeleteServiceState);
    } else {
      showError(`Operación no soportada: eliminar ${type} con ID: ${id}`);
    }
  };

  // Check if any filter is active - use imported function
  const isAnyFilterActive = isFilterActive(filters);

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
                  className={`${styles['clear-filters-btn']} ${isAnyFilterActive ? styles['active'] : ''}`}
                  onClick={clearFilters}
                  disabled={!isAnyFilterActive}
                >
                  <FontAwesomeIcon icon={faTimes} /> Limpiar filtros
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {isAnyFilterActive && (
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
                        onClick={(e) => handleOpenColorPicker(e, category.id, category.name, category.color, setColorPickerState)}
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
                          handleDeleteCategory(category.id, category.name, category.services.length, setDeleteCategoryState);
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
                    {category.services.map((servicio, serviceIndex) => {
                      // Get items for this service
                      const servicioItems = filteredItems.filter(item => item.id_servicio === servicio.id_servicio);
                      
                      return (
                        <div key={`service-${servicio.id_servicio}-${category.id}-${serviceIndex}`} className={styles['service-group']}>
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
                                  handleOpenServiceImageModal(servicio, category);
                                }}
                                title="Gestionar imagen del servicio"
                              >
                                <FontAwesomeIcon icon={faImage} />
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
                            {servicioItems.map((item, itemIndex) => (
                              <div key={`item-${item.id_items || item.id_item}-${servicio.id_servicio}-${itemIndex}`} className={styles['item-card']} style={{ borderLeft: `4px solid ${category.color}` }}>
                                <div className={styles['item-header']}>
                                  <div className={styles['item-main-info']}>
                                    <div className={styles['item-service']}>
                                      <span className={styles['service-label']}>Servicio:</span>
                                      <span className={styles['service-name']}>
                                        {(() => {
                                          try {
                                            return highlightText(item.servicio_nombre, filters.searchTerm, styles);
                                          } catch (error) {
                                            console.error('Error highlighting service name:', error);
                                            return item.servicio_nombre;
                                          }
                                        })()}
                                      </span>
                                    </div>
                                    
                                    <div className={styles['item-subcategory']}>
                                      <span className={styles['subcategory-label']}>Subcategoría:</span>
                                      <span className={styles['subcategory-name']}>
                                        {(() => {
                                          try {
                                            return highlightText(item.subcategoria_nombre, filters.searchTerm, styles);
                                          } catch (error) {
                                            console.error('Error highlighting subcategory name:', error);
                                            return item.subcategoria_nombre;
                                          }
                                        })()}
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
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete('item', item.id_items || item.id_item);
                                        }}
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
          onSave={async (itemData, itemId) => {
            const result = await handleSaveItem(itemData, itemId);
            if (result && result.success) {
              setShowItemForm(false);
              setCurrentEditItem(null);
            }
          }}
          servicios={allServicios}
          allSubcategorias={allSubcategorias}
          allCategorias={allCategorias}
          editItem={currentEditItem}
        />
      )}
      
      {deleteServiceState.show && (
        <DeleteServiceModal
          show={deleteServiceState.show}
          onClose={() => cancelDeleteService(setDeleteServiceState)}
          onConfirm={() => confirmDeleteService(deleteServiceState, setDeleteServiceState)}
          servicioName={deleteServiceState.servicioName}
          itemCount={deleteServiceState.itemCount}
          subcategoriaCount={deleteServiceState.subcategoriaCount}
        />
      )}
      
      {deleteItemState.show && (
        <DeleteItemModal
          show={deleteItemState.show}
          onClose={() => {
            setDeleteItemState({
              show: false,
              itemId: null,
              servicioId: null,
              itemName: '',
              isLastItem: false,
              isLoading: false
            });
          }}
          onConfirm={() => confirmDeleteItem(deleteItemState, setDeleteItemState)}
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
          onSave={(categoriaId, colorData) => handleSaveColor(categoriaId, colorData, setColorPickerState)}
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
          onSave={async (categoryData) => {
            const result = await handleCreateCategory(categoryData);
            if (result && result.success) {
              setCreateCategoryState({ show: false, isLoading: false });
            }
          }}
          allCategorias={allCategorias}
        />
      )}
      
      {deleteCategoryState.show && (
        <DeleteCategoryModal
          show={deleteCategoryState.show}
          onClose={() => cancelDeleteCategory(setDeleteCategoryState)}
          onConfirm={() => confirmDeleteCategory(deleteCategoryState, setDeleteCategoryState)}
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
      
      {serviceImageState.show && (
        <ServiceImageModal
          show={serviceImageState.show}
          onClose={() => setServiceImageState({
            show: false,
            servicio: null,
            categoria: null,
            isLoading: false
          })}
          onImageUpdated={handleServiceImageUpdated}
          servicio={serviceImageState.servicio}
          categoria={serviceImageState.categoria}
        />
      )}
      
      <ToastContainer />
    </div>
  );
};

export default AdminPanel; 