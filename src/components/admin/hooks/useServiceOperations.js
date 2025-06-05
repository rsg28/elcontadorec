import { useCallback } from 'react';

/**
 * Custom hook for handling service operations (CRUD)
 * Extracts service-related business logic from AdminPanel component
 */
export const useServiceOperations = ({
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
}) => {

  // Handle service deletion
  const handleDeleteService = useCallback((servicioId, setDeleteServiceState) => {
    const servicioToDelete = allServicios.find(s => s.id_servicio === servicioId);
    if (!servicioToDelete) return;
    
    const relatedItems = itemsWithDetails.filter(item => item.id_servicio === servicioId);
    const relatedSubcategorias = servicioToDelete.subcategorias || [];
    
    setDeleteServiceState({
      show: true,
      servicioId: servicioId,
      servicioName: servicioToDelete.nombre,
      itemCount: relatedItems.length,
      subcategoriaCount: relatedSubcategorias.length,
      isLoading: false
    });
  }, [allServicios, itemsWithDetails]);

  // Confirm service deletion
  const confirmDeleteService = useCallback(async (deleteServiceState, setDeleteServiceState) => {
    try {
      setDeleteServiceState(prev => ({ ...prev, isLoading: true }));
      
      const { servicioId } = deleteServiceState;
      
      // Before deleting the service, collect all items in this service for subcategoria cleanup
      const itemsInThisService = itemsWithDetails.filter(item => item.id_servicio === servicioId);
      
      const result = await deleteServicio(servicioId);
      
      setDeleteServiceState({
        show: false,
        servicioId: null,
        servicioName: '',
        itemCount: 0,
        subcategoriaCount: 0,
        isLoading: false
      });
      
      if (result.success) {
        const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
        
        await fetchAllServicios();
        await refreshItems();
        
        setExpandedServices(currentExpandedState);
        
        let successMessage = 'Servicio eliminado con éxito';
        if (result.data) {
          const { itemsDeleted, subcategoriasDeleted } = result.data;
          if (itemsDeleted !== undefined && subcategoriasDeleted !== undefined) {
            successMessage += ` junto con ${subcategoriasDeleted} subcategorías y ${itemsDeleted} ítems.`;
          }
        }
        
        success(successMessage);
        
        // Cleanup unused subcategorias from the deleted service
        if (itemsInThisService.length > 0 && cleanupUnusedSubcategorias) {
          await cleanupUnusedSubcategorias(itemsInThisService, [servicioId]);
        }
      } else {
        console.error('Error en la operación:', result.error);
        showError(`Error al eliminar servicio: ${result.error}`);
      }
    } catch (error) {
      console.error('Error inesperado en confirmDeleteService:', error);
      showError(`Error inesperado: ${error.message}`);
      
      setDeleteServiceState({ 
        show: false, 
        servicioId: null,
        servicioName: '',
        itemCount: 0,
        subcategoriaCount: 0,
        isLoading: false 
      });
    }
  }, [deleteServicio, itemsWithDetails, cleanupUnusedSubcategorias, fetchAllServicios, refreshItems, expandedServices, setExpandedServices, success, showError]);

  // Cancel service deletion
  const cancelDeleteService = useCallback((setDeleteServiceState) => {
    setDeleteServiceState({
      show: false,
      servicioId: null,
      servicioName: '',
      itemCount: 0,
      subcategoriaCount: 0,
      isLoading: false
    });
  }, []);

  return {
    handleDeleteService,
    confirmDeleteService,
    cancelDeleteService
  };
}; 