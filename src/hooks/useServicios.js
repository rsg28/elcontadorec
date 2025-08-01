import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api.js';

/**
 * Hook personalizado para obtener servicios por categoría
 * @param {string} categoriaId - ID de la categoría a buscar
 * @returns {Object} - Objeto con los servicios, estado de carga y error
 */
const useServicios = (categoriaId) => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchServicios = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/servicios/categoria/${categoriaId}`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setServicios(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching servicios:', err);
        setError(err.message);
        setServicios([]);
      } finally {
        setLoading(false);
      }
    };

    if (categoriaId) {
      fetchServicios();
    }
  }, [categoriaId]);

  return { servicios, loading, error };
};

/**
 * Hook personalizado para obtener todos los servicios con sus subcategorías
 * @returns {Object} - Objeto con los servicios, estado de carga y error
 */
export const useAllServicios = () => {
  const [servicios, setServicios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Función para obtener todos los servicios con sus subcategorías
  const fetchAllServicios = async () => {
    try {
      setLoading(true);
      
      // Get all services (already includes Items with Subcategoria data)
      const serviciosResponse = await fetch(`${API_BASE_URL}/servicios`);
      if (!serviciosResponse.ok) {
        throw new Error(`Error fetching services: ${serviciosResponse.status}`);
      }
      const serviciosData = await serviciosResponse.json();
      
      // Process services to extract subcategories from Items
      const serviciosWithDetails = serviciosData.map((servicio) => {
        // Extract unique subcategories from the Items array
        const subcategorias = [];
        const seenSubcategoryIds = new Set();
        
        if (servicio.Items && Array.isArray(servicio.Items)) {
          servicio.Items.forEach(item => {
            if (item.Subcategoria && !seenSubcategoryIds.has(item.Subcategoria.id_subcategoria)) {
              subcategorias.push({
                id_subcategoria: item.Subcategoria.id_subcategoria,
                nombre: item.Subcategoria.nombre,
                id_servicio: servicio.id_servicio
              });
              seenSubcategoryIds.add(item.Subcategoria.id_subcategoria);
            }
          });
        }
        
        return { 
          ...servicio, 
          subcategorias: subcategorias
        };
      });
      
      setServicios(serviciosWithDetails);
      setError(null);
      
      // Return success for chaining
      return { success: true, data: serviciosWithDetails };
    } catch (err) {
      console.error('Error fetching all services:', err);
      setError(err.message);
      setServicios([]);
      
      // Return failure for error handling
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };
  
  // Cargar servicios cuando se monta el componente
  useEffect(() => {
    fetchAllServicios();
  }, []);

  /**
   * Crear un nuevo servicio (requiere autenticación de administrador)
   * @param {Object} servicioData - Datos del servicio a crear
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const createServicio = async (servicioData) => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/servicios`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(servicioData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const newServicio = await response.json();
      
      // Actualizar la lista de servicios localmente
      setServicios(prevServicios => [...prevServicios, {...newServicio, subcategorias: []}]);
      
      return { success: true, data: newServicio };
    } catch (err) {
      console.error('Error creating servicio:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar un servicio y todas sus subcategorías e ítems relacionados
   * @param {number} servicioId - ID del servicio a eliminar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const deleteServicio = async (servicioId) => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      // Call the backend to delete the service and all related records in a transaction
      const deleteResponse = await fetch(`${API_BASE_URL}/servicios/${servicioId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!deleteResponse.ok) {
        const errorData = await deleteResponse.json().catch(() => ({}));
        throw new Error(`Error al eliminar servicio: ${deleteResponse.status} - ${errorData.message || deleteResponse.statusText}`);
      }
      
      const result = await deleteResponse.json();
      
      // Update local state ONLY when server deletion was successful
      setServicios(prevServicios => prevServicios.filter(servicio => servicio.id_servicio !== servicioId));
      
      return { 
        success: true, 
        message: result.message || 'Servicio eliminado correctamente',
        data: result
      };
    } catch (err) {
      console.error('Error eliminando servicio:', err);
      setError(err.message);
      
      // Do NOT update local state if server deletion failed
      // This way UI will stay in sync with the actual server state
      
      return { 
        success: false, 
        error: err.message
      };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar un servicio existente
   * @param {number} servicioId - ID del servicio a actualizar
   * @param {Object} updateData - Datos a actualizar (nombre y/o descripcion)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const updateServicio = async (servicioId, updateData) => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      // Update the service in the backend
      const response = await fetch(`${API_BASE_URL}/servicios/${servicioId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const updatedServicio = await response.json();
      
      // Update local state
      setServicios(prevServicios => 
        prevServicios.map(s => 
          s.id_servicio === servicioId 
            ? { ...s, ...updateData }
            : s
        )
      );
      
      return { success: true, data: updatedServicio };
    } catch (error) {
      console.error('Error updating service:', error);
      return { success: false, error: error.message };
    } finally {
      setLoading(false);
    }
  };

  return { 
    servicios, 
    loading, 
    error, 
    createServicio, 
    deleteServicio,
    updateServicio,
    fetchAllServicios,
    setServicios
  };
};

export default useServicios; 