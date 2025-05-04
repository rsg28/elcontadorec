import { useState, useEffect } from 'react';
import { useAllServicios } from './useServicios';

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

  // Obtener todos los items
  useEffect(() => {
    const fetchItems = async () => {
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
    };

    fetchItems();
  }, []);

  // Enriquecer los items con nombres de servicios y subcategorías
  useEffect(() => {
    if (items.length > 0 && !serviciosLoading && allServicios.length > 0) {
      // Crear un mapa de servicios por ID para acceso rápido
      const serviciosMap = new Map();
      const subcategoriasMap = new Map();
      
      // Mapear todos los servicios y subcategorías por sus IDs
      allServicios.forEach(servicio => {
        serviciosMap.set(servicio.id_servicio, servicio);
        
        // Mapear subcategorías de este servicio
        servicio.subcategorias.forEach(subcategoria => {
          subcategoriasMap.set(subcategoria.id_subcategoria, {
            ...subcategoria,
            servicio: servicio
          });
        });
      });
      
      // Enriquecer cada item con detalles de servicio y subcategoría
      const enrichedItems = items.map(item => {
        const subcategoria = subcategoriasMap.get(item.id_subcategoria);
        const servicio = subcategoria?.servicio || serviciosMap.get(item.id_servicio);
        
        return {
          ...item,
          servicio_nombre: servicio?.nombre || 'Servicio no encontrado',
          subcategoria_nombre: subcategoria?.nombre || 'Subcategoría no encontrada',
          servicio: servicio || null,
          subcategoria: subcategoria || null
        };
      });
      
      setItemsWithDetails(enrichedItems);
    }
  }, [items, allServicios, serviciosLoading]);

  /**
   * Agregar un nuevo item
   * @param {Object} newItem - Datos del nuevo item a agregar
   * @returns {Promise<Object>} - Objeto con el resultado de la operación
   */
  const addItem = async (newItem) => {
    try {
      setLoading(true);
      
      // Crear una copia del objeto sin incluir descripción
      const itemData = {
        nombre: newItem.nombre,
        precio: newItem.precio,
        id_servicio: newItem.id_servicio,
        id_subcategoria: newItem.id_subcategoria
      };
      
      const response = await fetch(`${API_BASE_URL}/api/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
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
      
      // Crear una copia del objeto sin incluir descripción
      const itemData = {
        nombre: updatedData.nombre,
        precio: updatedData.precio,
        id_servicio: updatedData.id_servicio,
        id_subcategoria: updatedData.id_subcategoria
      };
      
      const response = await fetch(`${API_BASE_URL}/api/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(itemData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const updatedItem = await response.json();
      
      // Actualizar la lista de items localmente
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
   * Eliminar un item por su ID
   * @param {number} itemId - ID del item a eliminar
   * @returns {Promise<Object>} - Objeto con el resultado de la operación
   */
  const deleteItem = async (itemId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/items/${itemId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Actualizar la lista de items localmente eliminando el item
      setItems(prevItems => prevItems.filter(item => item.id_item !== itemId));
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting item:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { 
    items: itemsWithDetails, 
    rawItems: items,
    loading: loading || serviciosLoading,
    error,
    addItem,
    updateItem,
    deleteItem
  };
};

export default useItems; 