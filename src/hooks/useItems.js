import { useState, useEffect, useCallback } from 'react';
import { useAllServicios } from './useServicios';
import useSubcategorias from './useSubcategorias';

// URL base de la API
const API_BASE_URL = '/api';

/**
 * Hook personalizado para obtener items con información relacionada
 * @returns {Object} - Objeto con los items, servicios, subcategorias, estado de carga y error
 */
const useItems = () => {
  const [items, setItems] = useState([]);
  const [itemsWithDetails, setItemsWithDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { 
    servicios: allServicios, 
    loading: serviciosLoading,
    createServicio 
  } = useAllServicios();
  const { 
    subcategorias: allSubcategorias,
    createSubcategoria 
  } = useSubcategorias();

  // Function to fetch items into the items state
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/items`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setItems(data);
      setError(null);
      
      // Return success to let callers know items were refreshed
      return { success: true };
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.message);
      setItems([]);
      
      // Return failure to let callers know refresh failed
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  
  // Obtener todos los items cuando el componente se monta
  useEffect(() => {
    fetchItems();
  }, []); // fetchItems is stable due to useCallback with empty deps

  // Whenever items or servicios change, update the itemsWithDetails
  // This ensures we have the most up-to-date information
  useEffect(() => {
    // Only proceed if we have items
    if (items.length) {
      // Combine item data with servicio and subcategoria details
      const enrichedItems = items.map(item => {
        // Find the corresponding servicio for this item
        const servicio = allServicios.find(s => s.id_servicio === item.id_servicio);
        
        // Find the corresponding subcategoria for this item
        let subcategoriaNombre = 'Desconocido';
        if (item.subcategoria_nombre) {
          // If item already has subcategoria_nombre, use it
          subcategoriaNombre = item.subcategoria_nombre;
        } else if (allSubcategorias && allSubcategorias.length) {
          // Try to find it in allSubcategorias
          const subcategoria = allSubcategorias.find(s => s.id_subcategoria === item.id_subcategoria);
          if (subcategoria) {
            subcategoriaNombre = subcategoria.nombre;
          } 
        }
        
        // Return combined data
        return {
          ...item,
          // Add an alias for id_items as id_item to handle both field names
          id_item: item.id_items || item.id_item,
          // Include servicio details if available
          servicio_nombre: servicio ? servicio.nombre : 'Desconocido',
          // Use subcategoria name determined above
          subcategoria_nombre: subcategoriaNombre,
          // Include categoria details if available
          id_categoria: servicio ? servicio.id_categoria : null,
        };
      });
      
      setItemsWithDetails(enrichedItems);
    }
  }, [items, allServicios, allSubcategorias]);

  /**
   * Agregar un nuevo item
   * @param {Object} newItem - Datos del nuevo item a agregar
   * @returns {Promise<Object>} - Objeto con el resultado de la operación
   */
  const addItem = async (newItem) => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      // Check if we need to create a new servicio or subcategoria
      let servicioId = newItem.id_servicio;
      let subcategoriaId = newItem.id_subcategoria;
      
      // If servicio is a string (name), create a new servicio
      if (typeof servicioId === 'string' && isNaN(parseInt(servicioId))) {
        const servicioResult = await createServicio({ nombre: servicioId });
        
        if (!servicioResult.success) {
          throw new Error(`No se pudo crear el servicio: ${servicioResult.error}`);
        }
        
        servicioId = servicioResult.data.id_servicio;
      }
      
      // If subcategoria is a string (name), create a new subcategoria
      if (typeof subcategoriaId === 'string' && isNaN(parseInt(subcategoriaId))) {
        const subcategoriaResult = await createSubcategoria({ 
          nombre: subcategoriaId
        });
        
        if (!subcategoriaResult.success) {
          throw new Error(`No se pudo crear la subcategoría: ${subcategoriaResult.error}`);
        }
        
        subcategoriaId = subcategoriaResult.data.id_subcategoria;
      }
      
      // Crear una copia del objeto con los IDs actualizados
      const itemData = {
        nombre: newItem.nombre,
        precio: newItem.precio,
        id_servicio: servicioId,
        id_subcategoria: subcategoriaId
      };
      
      const response = await fetch(`${API_BASE_URL}/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const addedItem = await response.json();
      
      // Actualizar la lista de items localmente
      setItems(prevItems => [...prevItems, addedItem]);
      
      return { success: true, data: addedItem };
    } catch (err) {
      console.error('Error adding item:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar un item existente
   * @param {number} itemId - ID del item a actualizar
   * @param {Object} updatedData - Datos actualizados del item
   * @returns {Promise<Object>} - Objeto con el resultado de la operación
   */
  const updateItem = async (itemId, updatedData) => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }

      // Check if we need to create a new servicio or subcategoria
      let servicioId = updatedData.id_servicio;
      let subcategoriaId = updatedData.id_subcategoria;

      // If servicio is a string (name), check if exists or create new
      if (typeof servicioId === 'string' && isNaN(parseInt(servicioId))) {
        // Check if servicio exists in current data
        const existingServicio = allServicios.find(s => s.nombre.toLowerCase() === servicioId.toLowerCase());

        if (existingServicio) {
          servicioId = existingServicio.id_servicio;
        } else {
          // Create new servicio if not found
          const servicioResult = await createServicio({ nombre: servicioId });
          
          if (!servicioResult.success) {
            throw new Error(`Error con el servicio: ${servicioResult.error}`);
          }
          
          servicioId = servicioResult.data.id_servicio;
        }
      }
      
      // If subcategoria is a string (name), check if exists or create new
      if (typeof subcategoriaId === 'string' && isNaN(parseInt(subcategoriaId))) {
        // Check if subcategoria exists in current data
        const existingSubcategoria = allSubcategorias.find(s => s.nombre.toLowerCase() === subcategoriaId.toLowerCase());

        if (existingSubcategoria) {
          subcategoriaId = existingSubcategoria.id_subcategoria;
        } else {
          // Create new subcategoria if not found
          const subcategoriaResult = await createSubcategoria({ 
            nombre: subcategoriaId
          });
          
          if (!subcategoriaResult.success) {
            throw new Error(`Error con la subcategoría: ${subcategoriaResult.error}`);
          }
          
          subcategoriaId = subcategoriaResult.data.id_subcategoria;
        }
      }
      
      // Create object with only the fields in the database
      const itemData = {
        precio: updatedData.precio,
        id_servicio: servicioId,
        id_subcategoria: subcategoriaId
      };
      
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const updatedItem = await response.json();
      
      // Update items list locally
      setItems(prevItems => 
        prevItems.map(item => 
          item.id_item === itemId ? { ...item, ...updatedItem } : item
        )
      );
      
      return { success: true, data: updatedItem };
    } catch (err) {
      console.error('Error updating item:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar un item existente
   * @param {number} itemId - ID del item a eliminar
   * @returns {Promise<Object>} - Objeto con el resultado de la operación
   */
  const deleteItem = async (itemId) => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        console.error('Delete response not OK:', response.status, response.statusText);
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Actualizar la lista de items localmente
      setItems(prevItems => prevItems.filter(item => item.id_items !== itemId && item.id_item !== itemId));
      
      return { success: true, message: 'Item eliminado correctamente' };
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar localmente los items para reflejar cambios sin necesidad de refrescar desde el servidor
   * @param {Function} updateFn - Función que recibe los items actuales y devuelve los items actualizados
   */
  const updateLocalItems = (updateFn) => {
    // Update the raw items
    setItems(prevItems => {
      const newItems = updateFn(prevItems);
      return newItems;
    });
    
    // Also directly update the enriched items for immediate UI reflection
    setItemsWithDetails(prevItems => {
      const newItems = updateFn(prevItems);
      return newItems;
    });
  };

  // Return the refreshItems function so components can trigger a refresh
  return { 
    items: itemsWithDetails, 
    rawItems: items,
    loading: loading || serviciosLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshItems: fetchItems,
    updateLocalItems
  };
};

export default useItems;