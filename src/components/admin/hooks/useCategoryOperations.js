import { useCallback } from 'react';

/**
 * Custom hook for handling category operations (CRUD)
 * Extracts category-related business logic from AdminPanel component
 */
export const useCategoryOperations = ({
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
}) => {

  // Handle category creation
  const handleCreateCategory = useCallback(async (categoryData) => {
    try {
      const result = await createCategoria(categoryData);
      
      if (result.success) {
        success('Categoría creada correctamente');
        return { success: true };
      } else {
        showError(`Error al crear categoría: ${result.error}`);
        return { success: false };
      }
    } catch (error) {
      console.error('Error creating category:', error);
      showError('Error inesperado al crear la categoría');
      return { success: false };
    }
  }, [createCategoria, success, showError]);

  // Handle color picker opening
  const handleOpenColorPicker = useCallback((e, categoriaId, categoriaName, currentColor, setColorPickerState) => {
    e.stopPropagation();
    setColorPickerState({
      show: true,
      categoriaId,
      categoriaName,
      currentColor,
      isLoading: false
    });
  }, []);

  // Handle color saving
  const handleSaveColor = useCallback(async (categoriaId, colorData, setColorPickerState) => {
    try {
      const result = await updateCategoria(categoriaId, colorData);
      
      if (result.success) {
        success('Color de categoría actualizado correctamente');
        setColorPickerState({
          show: false,
          categoriaId: null,
          categoriaName: '',
          currentColor: '',
          isLoading: false
        });
        return { success: true };
      } else {
        showError(`Error al actualizar color: ${result.error}`);
        return { success: false };
      }
    } catch (error) {
      console.error('Error saving color:', error);
      showError('Error inesperado al guardar el color');
      return { success: false };
    }
  }, [updateCategoria, success, showError]);

  // Handle category deletion
  const handleDeleteCategory = useCallback((categoryId, categoryName, serviceCount, setDeleteCategoryState) => {
    setDeleteCategoryState({
      show: true,
      categoryId,
      categoryName,
      serviceCount,
      isLoading: false
    });
  }, []);

  // Confirm category deletion
  const confirmDeleteCategory = useCallback(async (deleteCategoryState, setDeleteCategoryState) => {
    try {
      setDeleteCategoryState(prev => ({ ...prev, isLoading: true }));
      
      const { categoryId } = deleteCategoryState;
      
      // Before deleting the category, collect all items in this category for subcategoria cleanup
      const itemsInThisCategory = itemsWithDetails.filter(item => item.id_categoria === categoryId);
      
      // Get all services in this category
      const servicesInCategory = allServicios.filter(service => service.id_categoria === categoryId);
      
      // Delete category with associated services and items
      
      // First, delete all services in this category (which will delete their items)
      for (const service of servicesInCategory) {
        // Delete service and its items
        const serviceResult = await deleteServicio(service.id_servicio);
        if (!serviceResult.success) {
          throw new Error(`Error al eliminar servicio "${service.nombre}": ${serviceResult.error}`);
        }
      }
      
      // Now delete the category itself (should succeed since all services are gone)
      const result = await deleteCategoria(categoryId);
      
      setDeleteCategoryState({
        show: false,
        categoryId: null,
        categoryName: '',
        serviceCount: 0,
        isLoading: false
      });
      
      if (result.success) {
        await refreshItems();
        success(`Categoría eliminada correctamente junto con ${servicesInCategory.length} servicio(s) y ${itemsInThisCategory.length} ítem(s)`);
        
        // Cleanup unused subcategorias from the deleted category
        if (itemsInThisCategory.length > 0 && cleanupUnusedSubcategorias) {
          await cleanupUnusedSubcategorias(itemsInThisCategory);
        }
      } else {
        showError(`Error al eliminar categoría: ${result.error}`);
      }
    } catch (error) {
      console.error('Error in confirmDeleteCategory:', error);
      showError(`Error inesperado: ${error.message}`);
      
      setDeleteCategoryState({
        show: false,
        categoryId: null,
        categoryName: '',
        serviceCount: 0,
        isLoading: false
      });
    }
  }, [deleteCategoria, deleteServicio, itemsWithDetails, allServicios, cleanupUnusedSubcategorias, refreshItems, success, showError]);

  // Cancel category deletion
  const cancelDeleteCategory = useCallback((setDeleteCategoryState) => {
    setDeleteCategoryState({
      show: false,
      categoryId: null,
      categoryName: '',
      serviceCount: 0,
      isLoading: false
    });
  }, []);

  return {
    handleCreateCategory,
    handleOpenColorPicker,
    handleSaveColor,
    handleDeleteCategory,
    confirmDeleteCategory,
    cancelDeleteCategory
  };
}; 