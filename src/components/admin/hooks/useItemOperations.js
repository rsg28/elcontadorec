import { useCallback } from 'react';

/**
 * Custom hook for handling item operations (CRUD)
 * Extracts complex business logic from AdminPanel component
 */
export const useItemOperations = ({
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
}) => {

  // Force refresh of filtered items
  const forceRefresh = useCallback(() => {
    if (filters.searchTerm) {
      const currentSearch = filters.searchTerm;
      setFilters(prev => ({...prev, searchTerm: currentSearch + ' '}));
      setTimeout(() => {
        setFilters(prev => ({...prev, searchTerm: currentSearch}));
      }, 10);
    } else {
      const currentMinPrice = filters.minPrice;
      setFilters(prev => ({...prev, minPrice: '0'}));
      setTimeout(() => {
        setFilters(prev => ({...prev, minPrice: currentMinPrice}));
      }, 10);
    }
  }, [filters.searchTerm, filters.minPrice, setFilters]);

  // Reusable function to cleanup unused subcategorias
  const cleanupUnusedSubcategorias = useCallback(async (itemsToDelete, excludeServiceIds = []) => {
    // Collect all unique subcategorias from the items being deleted
    const subcategoriasToCheck = [...new Set(itemsToDelete.map(item => ({
      id: item.id_subcategoria,
      nombre: item.subcategoria_nombre
    })).filter(subcat => subcat.id))];

    // Check each subcategoria to see if it's still being used
    for (const subcatInfo of subcategoriasToCheck) {
      // Count remaining items that use this subcategoria (excluding deleted items and services)
      const remainingItemsWithSubcategoria = itemsWithDetails.filter(item => 
        item.id_subcategoria === subcatInfo.id && 
        !itemsToDelete.some(deletedItem => 
          (deletedItem.id_items === item.id_items || deletedItem.id_item === item.id_item)
        ) &&
        !excludeServiceIds.includes(item.id_servicio)
      );
      
      // If no other items use this subcategoria, delete it
      if (remainingItemsWithSubcategoria.length === 0) {
        try {
          const deleteSubcatResult = await deleteSubcategoria(subcatInfo.id);
          
          if (deleteSubcatResult.success) {
            success(`Subcategoría eliminada automáticamente (no estaba siendo utilizada)`);
          } else {
            warning(`No se pudo eliminar la subcategoría: ${deleteSubcatResult.error}`);
          }
        } catch (subcatError) {
          console.error('Error deleting unused subcategoria:', subcatError);
          warning(`Error al eliminar subcategoría no utilizada: ${subcatError.message}`);
        }
      }
    }
  }, [itemsWithDetails, deleteSubcategoria, success, warning]);

  // Handle saving or updating an item
  const handleSaveItem = useCallback(async (itemData, itemId) => {
    try {
      
      // Validate basic data
      if (!itemData.id_categoria) {
        alert('Por favor seleccione una categoría');
        return;
      }
      
      if (!itemData.servicio_nombre || !itemData.subcategoria_nombre) {
        alert('Por favor complete todos los campos requeridos');
        return;
      }
      
      // Handle service creation if needed
      if (typeof itemData.id_servicio === 'string' && isNaN(parseInt(itemData.id_servicio))) {
        try {
          const existingService = allServicios.find(s => 
            s.nombre.toLowerCase() === itemData.id_servicio.toLowerCase() && 
            s.id_categoria === parseInt(itemData.id_categoria)
          );
          
          if (existingService) {
            warning(`Ya existe un servicio con el nombre "${itemData.id_servicio}" en esta categoría. Se usará el servicio existente.`);
            itemData.id_servicio = existingService.id_servicio;
          } else {
            const result = await createServicio({ 
              nombre: itemData.id_servicio,
              id_categoria: parseInt(itemData.id_categoria)
            });
            
            if (result.success) {
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
      
      // Handle subcategory creation if needed
      if (typeof itemData.id_subcategoria === 'string' && isNaN(parseInt(itemData.id_subcategoria))) {
        try {
          const existingSubcategory = allSubcategorias.find(s => 
            s.nombre.toLowerCase() === itemData.id_subcategoria.toLowerCase()
          );
          
          if (existingSubcategory) {
            warning(`Ya existe una subcategoría con el nombre "${itemData.id_subcategoria}". Se usará la subcategoría existente.`);
            itemData.id_subcategoria = existingSubcategory.id_subcategoria;
            itemData.subcategoria_nombre = existingSubcategory.nombre;
          } else {
            const result = await createSubcategoria({ 
              nombre: itemData.id_subcategoria
            });
            
            if (result.success) {
              itemData.id_subcategoria = result.data.id_subcategoria;
              itemData.subcategoria_nombre = result.data.nombre;
              success(`Nueva subcategoría "${result.data.nombre}" creada exitosamente`);
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
      
      // Check for existing item
      const existingItem = itemsWithDetails.find(item => 
        item.id_servicio === itemData.id_servicio &&
        item.id_subcategoria === itemData.id_subcategoria &&
        (itemId ? (item.id_items !== itemId && item.id_item !== itemId) : true)
      );
      
      if (existingItem) {
        warning(`Ya existe un ítem con este servicio (${itemData.servicio_nombre}) y subcategoría (${itemData.subcategoria_nombre}). No se puede crear un duplicado.`);
        return;
      }
      
      // Save or update item
      if (itemId) {
        const result = await updateItem(itemId, itemData);
        if (result.success) {
          const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
          await refreshItems();
          forceRefresh();
          setExpandedServices(currentExpandedState);
          success('Item actualizado correctamente');
          return { success: true };
        } else {
          showError(`Error al actualizar ítem: ${result.error}`);
          return { success: false };
        }
      } else {
        const result = await addItem(itemData);
        if (result.success) {
          if (result.data && result.data.id_servicio) {
            const newItem = {
              ...result.data,
              servicio_nombre: itemData.servicio_nombre,
              subcategoria_nombre: itemData.subcategoria_nombre,
              id_items: result.data.id_items || result.data.id_item,
              id_item: result.data.id_items || result.data.id_item,
              id_categoria: parseInt(itemData.id_categoria)
            };
            
            updateLocalItems(items => [...items, newItem]);
            
            setExpandedServices(prev => ({
              ...prev,
              [result.data.id_servicio]: true
            }));

            // Handle search term matching
            const searchTerm = filters.searchTerm.toLowerCase().trim();
            if (searchTerm && (
                newItem.servicio_nombre.toLowerCase().includes(searchTerm) ||
                newItem.subcategoria_nombre.toLowerCase().includes(searchTerm)
            )) {
              const currentSearch = filters.searchTerm;
              setFilters(prev => ({...prev, searchTerm: currentSearch + ' '}));
              setTimeout(() => {
                setFilters(prev => ({...prev, searchTerm: currentSearch}));
              }, 50);
            }
          }
          
          const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
          await refreshItems();
          forceRefresh();
          setExpandedServices(currentExpandedState);
          
          success('Item creado correctamente');
          return { success: true };
        } else {
          showError(`Error al agregar ítem: ${result.error}`);
          return { success: false };
        }
      }
    } catch (error) {
      console.error('Error in handleSaveItem:', error);
      showError(`Error inesperado: ${error.message}`);
      return { success: false };
    }
  }, [
    addItem, updateItem, allServicios, allSubcategorias, itemsWithDetails,
    createServicio, createSubcategoria, expandedServices, setExpandedServices,
    refreshItems, updateLocalItems, forceRefresh, filters, setFilters,
    success, showError, warning
  ]);

  // Handle item deletion
  const confirmDeleteItem = useCallback(async (deleteItemState, setDeleteItemState) => {
    try {
      setDeleteItemState(prev => ({ ...prev, isLoading: true }));
      
      const { itemId, isLastItem, servicioId } = deleteItemState;
      
      // Find the item being deleted to get its subcategoria
      const itemToDelete = itemsWithDetails.find(item => 
        (item.id_items === itemId || item.id_item === itemId)
      );
      
      if (isLastItem) {
        // Before deleting the service, collect all items in this service for subcategoria cleanup
        const itemsInThisService = itemsWithDetails.filter(item => item.id_servicio === servicioId);
        
        const result = await deleteServicio(servicioId);
        if (result.success) {
          success('Servicio y todos sus ítems eliminados correctamente');
          
          // Cleanup unused subcategorias from the deleted service
          await cleanupUnusedSubcategorias(itemsInThisService, [servicioId]);
        } else {
          showError(`Error al eliminar servicio: ${result.error}`);
        }
      } else {
        const result = await deleteItem(itemId);
        
        if (result.success) {
          success('Ítem eliminado correctamente');
          
          // Cleanup unused subcategorias from the deleted item
          if (itemToDelete) {
            await cleanupUnusedSubcategorias([itemToDelete]);
          }
        } else {
          showError(`Error al eliminar ítem: ${result.error}`);
        }
      }
      
      setDeleteItemState({
        show: false,
        itemId: null,
        servicioId: null,
        itemName: '',
        isLastItem: false,
        isLoading: false
      });
                
      const currentExpandedState = JSON.parse(JSON.stringify(expandedServices));
      await refreshItems();
      if (isLastItem) {
        await fetchAllServicios();
      }
      setExpandedServices(currentExpandedState);
      
    } catch (error) {
      console.error('Error in confirmDeleteItem:', error);
      showError(`Error inesperado: ${error.message}`);
      setDeleteItemState(prev => ({ ...prev, isLoading: false }));
    }
  }, [deleteItem, deleteServicio, itemsWithDetails, cleanupUnusedSubcategorias, refreshItems, fetchAllServicios, expandedServices, setExpandedServices, success, showError]);

  return {
    handleSaveItem,
    confirmDeleteItem,
    forceRefresh,
    cleanupUnusedSubcategorias
  };
}; 