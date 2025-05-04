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

  return { servicios, loading, error };
};

export default useServicios; 