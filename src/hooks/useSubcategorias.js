import { useState, useEffect } from 'react';

// URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Hook personalizado para obtener subcategorías por servicio
 * @param {string} servicioId - ID del servicio (opcional)
 * @returns {Object} - Objeto con las subcategorías, estado de carga y error, y funciones para manipular subcategorías
 */
const useSubcategorias = (servicioId = null) => {
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para obtener todas las subcategorías
  const fetchAllSubcategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/subcategorias`, {
        credentials: 'include' // Include cookies for authentication
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} subcategorías:`, data);
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

  // Función para obtener subcategorías por ID de servicio
  const fetchSubcategoriasByServicio = async (id) => {
    if (!id) return [];
    
    try {
      setLoading(true);
      console.log(`Fetching subcategorias for service ID: ${id}`);
      console.log(`URL: ${API_BASE_URL}/api/subcategorias/servicio/${id}`);
      
      const response = await fetch(`${API_BASE_URL}/api/subcategorias/servicio/${id}`, {
        credentials: 'include' // Include cookies for authentication
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`Received ${data.length} subcategorías:`, data);
      
      if (id === servicioId) {
        // Solo actualizar el estado si el ID coincide con el ID actual del hook
        setSubcategorias(data);
        setError(null);
      }
      
      return data;
    } catch (err) {
      console.error('Error fetching subcategorias by servicio:', err);
      if (id === servicioId) {
        setError(err.message);
        setSubcategorias([]);
      }
      return [];
    } finally {
      if (id === servicioId) {
        setLoading(false);
      }
    }
  };

  // Función para crear una nueva subcategoría
  const createSubcategoria = async (nuevaSubcategoria) => {
    try {
      setLoading(true);
      
      const response = await fetch(`${API_BASE_URL}/api/subcategorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(nuevaSubcategoria),
        credentials: 'include' // Para enviar cookies de autenticación
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Created subcategoria:', data);
      
      // Si estamos viendo las subcategorías del servicio al que pertenece la nueva, actualizar la lista
      if (servicioId && parseInt(servicioId) === parseInt(nuevaSubcategoria.id_servicio)) {
        setSubcategorias(prevSubcategorias => [...prevSubcategorias, data]);
      }
      
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
      
      const response = await fetch(`${API_BASE_URL}/api/subcategorias/${id}`, {
        method: 'DELETE',
        credentials: 'include' // Para enviar cookies de autenticación
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
      
      const response = await fetch(`${API_BASE_URL}/api/subcategorias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosActualizados),
        credentials: 'include' // Para enviar cookies de autenticación
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

  // Efecto para cargar subcategorías iniciales
  useEffect(() => {
    if (servicioId) {
      fetchSubcategoriasByServicio(servicioId);
    } else {
      fetchAllSubcategorias();
    }
  }, [servicioId]);

  return { 
    subcategorias, 
    loading, 
    error,
    fetchAllSubcategorias,
    fetchSubcategoriasByServicio,
    createSubcategoria,
    deleteSubcategoria,
    updateSubcategoria
  };
};

export default useSubcategorias; 