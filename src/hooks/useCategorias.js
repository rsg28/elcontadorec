// Verificado

import { useState, useEffect } from 'react';

// URL base de la API
import { API_BASE_URL } from '../config/api.js';

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
        const response = await fetch(`${API_BASE_URL}/categorias`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        // If any category doesn't have a color property, add default black
        const dataWithColors = data.map(categoria => {
          if (!categoria.color) {
            return {
              ...categoria,
              color: '#000000' // Default black color
            };
          }
          return categoria;
        });
        
        setCategorias(dataWithColors);
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
      
      // If no color is provided, use default black
      if (!categoriaData.color) {
        categoriaData.color = '#000000'; // Default black color
      }
      
      const response = await fetch(`${API_BASE_URL}/categorias`, {
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
      
      // Ensure the new categoria has a color
      if (!newCategoria.color) {
        newCategoria.color = '#000000'; // Default black color
      }
      
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
      
      // If not updating color, keep the existing one
      if (!categoriaData.color) {
        const existingCategoria = categorias.find(c => c.id_categoria === id);
        if (existingCategoria && existingCategoria.color) {
          categoriaData.color = existingCategoria.color;
        } else {
          categoriaData.color = '#000000'; // Default black color
        }
      }
      
      const response = await fetch(`${API_BASE_URL}/categorias/${id}`, {
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
      
      // Ensure the updated categoria has a color
      if (!updatedCategoria.color) {
        updatedCategoria.color = '#000000'; // Default black color
      }
      
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
      
      // Ensure ID is a number
      const categoryId = parseInt(id);
      if (isNaN(categoryId)) {
        throw new Error('ID de categoría inválido');
      }
      
      const response = await fetch(`${API_BASE_URL}/categorias/${categoryId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        // Try to get more detailed error information from the response
        let errorMessage = `Error: ${response.status} ${response.statusText}`;
        try {
          const errorData = await response.text();
          if (errorData) {
            // Try to parse as JSON first
            try {
              const jsonError = JSON.parse(errorData);
              if (jsonError.error) {
                errorMessage = jsonError.error;
              } else if (jsonError.message) {
                errorMessage = jsonError.message;
              }
            } catch {
              // If not JSON, use the text as is
              errorMessage = errorData;
            }
          }
        } catch (parseError) {
          console.error('Error parsing server response:', parseError);
        }
        throw new Error(errorMessage);
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