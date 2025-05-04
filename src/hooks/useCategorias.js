import { useState, useEffect } from 'react';

// URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Hook personalizado para obtener todas las categorías de servicios
 * @returns {Object} - Objeto con las categorías, estado de carga, error y funciones CRUD
 */
const useCategorias = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/api/categorias`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setCategorias(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching categorias:', err);
        setError(err.message);
        setCategorias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  /**
   * Crear una nueva categoría (requiere autenticación de administrador)
   * @param {Object} categoriaData - Datos de la categoría a crear
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const createCategoria = async (categoriaData) => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/categorias`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoriaData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const newCategoria = await response.json();
      
      // Actualizar la lista de categorías localmente
      setCategorias(prevCategorias => [...prevCategorias, newCategoria]);
      
      return { success: true, data: newCategoria };
    } catch (err) {
      console.error('Error creating categoria:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar una categoría existente (requiere autenticación de administrador)
   * @param {number} id - ID de la categoría a actualizar
   * @param {Object} categoriaData - Nuevos datos de la categoría
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const updateCategoria = async (id, categoriaData) => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/categorias/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(categoriaData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const updatedCategoria = await response.json();
      
      // Actualizar la lista de categorías localmente
      setCategorias(prevCategorias => 
        prevCategorias.map(cat => 
          cat.id_categoria === id ? updatedCategoria : cat
        )
      );
      
      return { success: true, data: updatedCategoria };
    } catch (err) {
      console.error('Error updating categoria:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar una categoría (requiere autenticación de administrador)
   * @param {number} id - ID de la categoría a eliminar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const deleteCategoria = async (id) => {
    try {
      setLoading(true);
      
      // Get authentication token
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/api/categorias/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Actualizar la lista de categorías localmente
      setCategorias(prevCategorias => 
        prevCategorias.filter(cat => cat.id_categoria !== id)
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error deleting categoria:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { 
    categorias, 
    loading, 
    error, 
    createCategoria, 
    updateCategoria, 
    deleteCategoria 
  };
};

export default useCategorias; 