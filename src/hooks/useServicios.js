import { useState, useEffect } from 'react';

// URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

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
        const response = await fetch(`${API_BASE_URL}/api/servicios/categoria/${categoriaId}`);
        
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

  useEffect(() => {
    const fetchAllServicios = async () => {
      try {
        setLoading(true);
        // Get all services
        const serviciosResponse = await fetch(`${API_BASE_URL}/api/servicios`);
        if (!serviciosResponse.ok) {
          throw new Error(`Error fetching services: ${serviciosResponse.status}`);
        }
        const serviciosData = await serviciosResponse.json();
        
        // Add subcategories to each service
        const serviciosWithDetails = await Promise.all(serviciosData.map(async (servicio) => {
          // Get subcategories for this service
          try {
            const subcategoriasResponse = await fetch(`${API_BASE_URL}/api/subcategorias/servicio/${servicio.id_servicio}`);
            if (subcategoriasResponse.ok) {
              const subcategoriasData = await subcategoriasResponse.json();
              return { 
                ...servicio, 
                subcategorias: subcategoriasData
              };
            }
          } catch (err) {
            console.error(`Error fetching subcategories for service ${servicio.id_servicio}:`, err);
          }
          
          // Return service with empty subcategories if error
          return { 
            ...servicio, 
            subcategorias: []
          };
        }));
        
        setServicios(serviciosWithDetails);
        setError(null);
      } catch (err) {
        console.error('Error fetching all services:', err);
        setError(err.message);
        setServicios([]);
      } finally {
        setLoading(false);
      }
    };

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
      
      const response = await fetch(`${API_BASE_URL}/api/servicios`, {
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
   * Crear una nueva subcategoría (requiere autenticación de administrador)
   * @param {Object} subcategoriaData - Datos de la subcategoría a crear
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const createSubcategoria = async (subcategoriaData) => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/subcategorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(subcategoriaData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const newSubcategoria = await response.json();
      
      // Actualizar la lista de servicios localmente añadiendo la subcategoría
      setServicios(prevServicios => {
        return prevServicios.map(servicio => {
          if (servicio.id_servicio == subcategoriaData.id_servicio) {
            return {
              ...servicio,
              subcategorias: [...servicio.subcategorias, newSubcategoria]
            };
          }
          return servicio;
        });
      });
      
      return { success: true, data: newSubcategoria };
    } catch (err) {
      console.error('Error creating subcategoria:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { 
    servicios, 
    loading, 
    error, 
    createServicio, 
    createSubcategoria 
  };
};

export default useServicios; 