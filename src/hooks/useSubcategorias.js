import { useState, useEffect } from 'react';

// URL base de la API
import { API_BASE_URL } from '../config/api.js';

/**
 * Hook personalizado para obtener todas las subcategorías
 * @returns {Object} - Objeto con las subcategorías, estado de carga y error, y funciones para manipular subcategorías
 */
const useSubcategorias = () => {
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener todas las subcategorías
  const fetchAllSubcategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/subcategorias`, {
        credentials: 'include' // Include cookies for authentication
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      setSubcategorias(data);
      setError(null);
      return data;
    } catch (err) {
      console.error('Error fetching all subcategorias:', err);
      setError(err.message);
      setSubcategorias([]);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Función para crear una nueva subcategoría
  const createSubcategoria = async (nuevaSubcategoria) => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/subcategorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevaSubcategoria)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Agregar la nueva subcategoría al estado local
      setSubcategorias(prevSubcategorias => [...prevSubcategorias, data]);
      
      setError(null);
      return { success: true, data };
    } catch (err) {
      console.error('Error creating subcategoria:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para eliminar una subcategoría
  const deleteSubcategoria = async (id) => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/subcategorias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      // Eliminar la subcategoría del estado local
      setSubcategorias(prevSubcategorias => 
        prevSubcategorias.filter(sub => sub.id_subcategoria !== parseInt(id))
      );
      
      setError(null);
      return { success: true };
    } catch (err) {
      console.error('Error deleting subcategoria:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Función para actualizar una subcategoría
  const updateSubcategoria = async (id, datosActualizados) => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/subcategorias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(datosActualizados)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      
      // Actualizar la subcategoría en el estado local si existe
      setSubcategorias(prevSubcategorias => 
        prevSubcategorias.map(sub => 
          sub.id_subcategoria === parseInt(id) ? { ...sub, ...data } : sub
        )
      );
      
      setError(null);
      return { success: true, data };
    } catch (err) {
      console.error('Error updating subcategoria:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Cargar todas las subcategorías al montar el componente
  useEffect(() => {
    fetchAllSubcategorias();
  }, []);

  return { 
    subcategorias, 
    loading, 
    error,
    fetchAllSubcategorias,
    createSubcategoria,
    deleteSubcategoria,
    updateSubcategoria
  };
};

/**
 * Hook especializado para obtener subcategorías de un servicio específico
 * @param {string|number} servicioId - ID del servicio
 * @returns {Object} - Objeto con las subcategorías, estado de carga y error
 */
export const useSubcategoriasByServicio = (servicioId) => {
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener subcategorías por servicio
  const fetchSubcategorias = async () => {
    if (!servicioId) {
      setSubcategorias([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/subcategorias/servicio/${servicioId}`);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      setSubcategorias(data);
      
    } catch (err) {
      console.error(`Error fetching subcategorias for servicio ${servicioId}:`, err);
      setError(err.message);
      setSubcategorias([]);
    } finally {
      setLoading(false);
    }
  };

  // Refrescar subcategorías cuando cambie el servicioId
  useEffect(() => {
    fetchSubcategorias();
  }, [servicioId]);

  return { 
    subcategorias, 
    loading, 
    error,
    refetch: fetchSubcategorias
  };
};

export default useSubcategorias; 