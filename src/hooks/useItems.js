import { useState, useEffect, useCallback } from 'react';
import { useAllServicios } from './useServicios';
import useSubcategorias from './useSubcategorias';

// URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Hook personalizado para obtener items con información relacionada
 * @returns {Object} - Objeto con los items, servicios, subcategorias, estado de carga y error
 */
const useItems = () => {
  const [items, setItems] = useState([]);
  const [itemsWithDetails, setItemsWithDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { servicios: allServicios, loading: serviciosLoading } = useAllServicios();
  const { subcategorias: allSubcategorias } = useSubcategorias();

  // Function to fetch items that can be called on demand
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/items`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setItems(data);
      setError(null);
    } catch (err) {
      console.error('Error fetching items:', err);
      setError(err.message);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Obtener todos los items cuando el componente se monta
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

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
        try {
          const servicioResponse = await fetch(`${API_BASE_URL}/api/servicios`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ nombre: servicioId }),
          });
          
          if (!servicioResponse.ok) {
            throw new Error(`Error creating servicio: ${servicioResponse.status}`);
          }
          
          const newServicio = await servicioResponse.json();
          servicioId = newServicio.id_servicio;
        } catch (err) {
          console.error('Error creating new servicio:', err);
          throw new Error(`No se pudo crear el servicio: ${err.message}`);
        }
      }
      
      // If subcategoria is a string (name), create a new subcategoria
      if (typeof subcategoriaId === 'string' && isNaN(parseInt(subcategoriaId))) {
        try {
          const subcategoriaResponse = await fetch(`${API_BASE_URL}/api/subcategorias`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ 
              nombre: subcategoriaId,
              id_servicio: servicioId
            }),
          });
          
          if (!subcategoriaResponse.ok) {
            throw new Error(`Error creating subcategoria: ${subcategoriaResponse.status}`);
          }
          
          const newSubcategoria = await subcategoriaResponse.json();
          subcategoriaId = newSubcategoria.id_subcategoria;
        } catch (err) {
          console.error('Error creating new subcategoria:', err);
          throw new Error(`No se pudo crear la subcategoría: ${err.message}`);
        }
      }
      
      // Crear una copia del objeto con los IDs actualizados
      const itemData = {
        nombre: newItem.nombre,
        precio: newItem.precio,
        id_servicio: servicioId,
        id_subcategoria: subcategoriaId
      };
      
      const response = await fetch(`${API_BASE_URL}/api/items`, {
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
        try {
          // First check if servicio exists
          const serviciosResponse = await fetch(`${API_BASE_URL}/api/servicios`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!serviciosResponse.ok) {
            throw new Error(`Error fetching servicios: ${serviciosResponse.status}`);
          }

          const servicios = await serviciosResponse.json();
          const existingServicio = servicios.find(s => s.nombre.toLowerCase() === servicioId.toLowerCase());

          if (existingServicio) {
            servicioId = existingServicio.id_servicio;
          } else {
            // Create new servicio if not found
            const servicioResponse = await fetch(`${API_BASE_URL}/api/servicios`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ nombre: servicioId }),
            });
            
            if (!servicioResponse.ok) {
              throw new Error(`Error creating servicio: ${servicioResponse.status}`);
            }
            
            const newServicio = await servicioResponse.json();
            servicioId = newServicio.id_servicio;
          }
        } catch (err) {
          console.error('Error handling servicio:', err);
          throw new Error(`Error con el servicio: ${err.message}`);
        }
      }
      
      // If subcategoria is a string (name), check if exists or create new
      if (typeof subcategoriaId === 'string' && isNaN(parseInt(subcategoriaId))) {
        try {
          // First check if subcategoria exists
          const subcategoriasResponse = await fetch(`${API_BASE_URL}/api/subcategorias`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (!subcategoriasResponse.ok) {
            throw new Error(`Error fetching subcategorias: ${subcategoriasResponse.status}`);
          }

          const subcategorias = await subcategoriasResponse.json();
          const existingSubcategoria = subcategorias.find(s => s.nombre.toLowerCase() === subcategoriaId.toLowerCase());

          if (existingSubcategoria) {
            subcategoriaId = existingSubcategoria.id_subcategoria;
          } else {
            // Create new subcategoria if not found
            const subcategoriaResponse = await fetch(`${API_BASE_URL}/api/subcategorias`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
              },
              body: JSON.stringify({ 
                nombre: subcategoriaId,
                id_servicio: servicioId
              }),
            });
            
            if (!subcategoriaResponse.ok) {
              throw new Error(`Error creating subcategoria: ${subcategoriaResponse.status}`);
            }
            
            const newSubcategoria = await subcategoriaResponse.json();
            subcategoriaId = newSubcategoria.id_subcategoria;
          }
        } catch (err) {
          console.error('Error handling subcategoria:', err);
          throw new Error(`Error con la subcategoría: ${err.message}`);
        }
      }
      
      // Create object with only the fields in the database
      const itemData = {
        precio: updatedData.precio,
        id_servicio: servicioId,
        id_subcategoria: subcategoriaId
      };
      
      const response = await fetch(`${API_BASE_URL}/api/items/${itemId}`, {
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
      
      // Log the itemId for debugging
      console.log('Deleting item with ID:', itemId);
      
      const response = await fetch(`${API_BASE_URL}/api/items/${itemId}`, {
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

  // Return the refreshItems function so components can trigger a refresh
  return { 
    items: itemsWithDetails, 
    rawItems: items,
    loading: loading || serviciosLoading,
    error,
    addItem,
    updateItem,
    deleteItem,
    refreshItems: fetchItems
  };
};

export default useItems; 