import { useState, useRef } from 'react';

/**
 * Centralized state management hook for AdminPanel
 * Manages all UI states, modal states, filters, and expanded states
 */
export const useAdminPanelState = () => {
  // Admin authentication state
  const [adminChecking, setAdminChecking] = useState(true);
  const [isAdminUser, setIsAdminUser] = useState(false);
  
  // Expanded state for items and services
  const [expandedItems, setExpandedItems] = useState({});
  const [expandedServices, setExpandedServices] = useState({});
  
  // Updated service and subcategory names
  const [updatedServiceNames, setUpdatedServiceNames] = useState({});
  const [updatedSubcategoryNames, setUpdatedSubcategoryNames] = useState({});
  const [updatedPrices, setUpdatedPrices] = useState({});
  
  // Item form modal state
  const [showItemForm, setShowItemForm] = useState(false);
  const [currentEditItem, setCurrentEditItem] = useState(null);
  
  // Filter state
  const [filters, setFilters] = useState({
    searchTerm: '',
    minPrice: '',
    maxPrice: '',
    servicioId: 'all',
    categoriaId: 'all'
  });
  
  // Service deletion modal state
  const [deleteServiceState, setDeleteServiceState] = useState({
    show: false,
    servicioId: null,
    servicioName: '',
    itemCount: 0,
    subcategoriaCount: 0,
    isLoading: false
  });
  
  // Item deletion modal state  
  const [deleteItemState, setDeleteItemState] = useState({
    show: false,
    itemId: null,
    servicioId: null,
    itemName: '',
    isLastItem: false,
    isLoading: false
  });
  
  // Category creation modal state
  const [createCategoryState, setCreateCategoryState] = useState({
    show: false,
    isLoading: false
  });

  // Color picker modal state
  const [colorPickerState, setColorPickerState] = useState({
    show: false,
    categoriaId: null,
    categoriaName: '',
    currentColor: '',
    isLoading: false
  });

  // Delete category modal state
  const [deleteCategoryState, setDeleteCategoryState] = useState({
    show: false,
    categoryId: null,
    categoryName: '',
    serviceCount: 0,
    isLoading: false
  });
  
  // Create caracteristica modal state
  const [createCaracteristicaState, setCreateCaracteristicaState] = useState({
    show: false,
    isLoading: false
  });

  // Assign caracteristica modal state
  const [assignCaracteristicaState, setAssignCaracteristicaState] = useState({
    show: false,
    isLoading: false
  });

  // Delete caracteristica modal state
  const [deleteCaracteristicaState, setDeleteCaracteristicaState] = useState({
    show: false,
    caracteristicaId: null,
    caracteristicaName: '',
    serviciosCount: 0,
    isLoading: false
  });

  // Ver caracteristicas modal state
  const [verCaracteristicasState, setVerCaracteristicasState] = useState({
    show: false
  });

  // Edit service description modal state
  const [editDescriptionState, setEditDescriptionState] = useState({
    show: false,
    servicioId: null,
    servicioName: '',
    currentDescription: '',
    isLoading: false
  });

  // Service image modal state
  const [serviceImageState, setServiceImageState] = useState({
    show: false,
    servicio: null,
    categoria: null,
    isLoading: false
  });
  
  // Initial load reference to prevent unnecessary re-renders
  const isInitialLoadRef = useRef(true);
  
  return {
    // Admin authentication
    adminChecking,
    setAdminChecking,
    isAdminUser,
    setIsAdminUser,
    
    // Expanded states
    expandedItems,
    setExpandedItems,
    expandedServices,
    setExpandedServices,
    
    // Updated names and prices
    updatedServiceNames,
    setUpdatedServiceNames,
    updatedSubcategoryNames,
    setUpdatedSubcategoryNames,
    updatedPrices,
    setUpdatedPrices,
    
    // Item form
    showItemForm,
    setShowItemForm,
    currentEditItem,
    setCurrentEditItem,
    
    // Filters
    filters,
    setFilters,
    
    // Modal states
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
    
    // Refs
    isInitialLoadRef
  };
}; 