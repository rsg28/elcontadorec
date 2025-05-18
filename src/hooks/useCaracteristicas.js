import { useState, useEffect } from 'react';

// URL base de la API
const API_BASE_URL = '/api';

/**
 * Hook personalizado para obtener y gestionar características
 * @returns {Object} - Objeto con las características, estado de carga, error y funciones CRUD
 */
const useCaracteristicas = () => {
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCaracteristicas = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_BASE_URL}/caracteristicas`);
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        setCaracteristicas(data);
        setError(null);
      } catch (err) {
        console.error('Error al obtener características:', err);
        setError(err.message);
        setCaracteristicas([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCaracteristicas();
  }, []);

  /**
   * Obtener una característica por su ID
   * @param {number} id - ID de la característica a obtener
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const getCaracteristicaById = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/caracteristicas/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const caracteristica = await response.json();
      return { success: true, data: caracteristica };
    } catch (err) {
      console.error(`Error al obtener característica #${id}:`, err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener los servicios asociados a una característica
   * @param {number} id - ID de la característica
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const getServiciosByCaracteristica = async (id) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/caracteristicas/${id}/servicios`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const servicios = await response.json();
      return { success: true, data: servicios };
    } catch (err) {
      console.error(`Error al obtener servicios para la característica #${id}:`, err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Crear una nueva característica (requiere autenticación de administrador)
   * @param {Object} caracteristicaData - Datos de la característica a crear
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const createCaracteristica = async (caracteristicaData) => {
    try {
      setLoading(true);
      
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/caracteristicas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(caracteristicaData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const newCaracteristica = await response.json();
      
      // Actualizar la lista de características localmente
      setCaracteristicas(prevCaracteristicas => [...prevCaracteristicas, newCaracteristica]);
      
      return { success: true, data: newCaracteristica };
    } catch (err) {
      console.error('Error al crear característica:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Actualizar una característica existente (requiere autenticación de administrador)
   * @param {number} id - ID de la característica a actualizar
   * @param {Object} caracteristicaData - Nuevos datos de la característica
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const updateCaracteristica = async (id, caracteristicaData) => {
    try {
      setLoading(true);
      
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/caracteristicas/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(caracteristicaData),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const updatedCaracteristica = await response.json();
      
      // Actualizar la lista de características localmente
      setCaracteristicas(prevCaracteristicas => 
        prevCaracteristicas.map(car => 
          car.id_caracteristicas === id ? updatedCaracteristica : car
        )
      );
      
      return { success: true, data: updatedCaracteristica };
    } catch (err) {
      console.error('Error al actualizar característica:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Eliminar una característica (requiere autenticación de administrador)
   * @param {number} id - ID de la característica a eliminar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const deleteCaracteristica = async (id) => {
    try {
      setLoading(true);
      
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/caracteristicas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      // Actualizar la lista de características localmente
      setCaracteristicas(prevCaracteristicas => 
        prevCaracteristicas.filter(car => car.id_caracteristicas !== id)
      );
      
      return { success: true };
    } catch (err) {
      console.error('Error al eliminar característica:', err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Asociar una característica a un servicio (requiere autenticación de administrador)
   * @param {number} servicioId - ID del servicio
   * @param {number} caracteristicaId - ID de la característica
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const addCaracteristicaToServicio = async (servicioId, caracteristicaId) => {
    try {
      setLoading(true);
      
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/servicios/${servicioId}/caracteristicas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id_caracteristicas: caracteristicaId }),
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (err) {
      console.error(`Error al asociar característica #${caracteristicaId} al servicio #${servicioId}:`, err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Remover una característica de un servicio (requiere autenticación de administrador)
   * @param {number} servicioId - ID del servicio
   * @param {number} caracteristicaId - ID de la característica
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const removeCaracteristicaFromServicio = async (servicioId, caracteristicaId) => {
    try {
      setLoading(true);
      
      // Obtener token de autenticación
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No hay token de autenticación. Inicie sesión como administrador.');
      }
      
      const response = await fetch(`${API_BASE_URL}/servicios/${servicioId}/caracteristicas/${caracteristicaId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      return { success: true, data: result };
    } catch (err) {
      console.error(`Error al remover característica #${caracteristicaId} del servicio #${servicioId}:`, err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Obtener todas las características de un servicio
   * @param {number} servicioId - ID del servicio
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const getCaracteristicasByServicio = async (servicioId) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE_URL}/servicios/${servicioId}/caracteristicas`);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status} ${response.statusText}`);
      }
      
      const caracteristicasServicio = await response.json();
      return { success: true, data: caracteristicasServicio };
    } catch (err) {
      console.error(`Error al obtener características del servicio #${servicioId}:`, err);
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return { 
    caracteristicas, 
    loading, 
    error, 
    getCaracteristicaById,
    getServiciosByCaracteristica,
    createCaracteristica, 
    updateCaracteristica, 
    deleteCaracteristica,
    addCaracteristicaToServicio,
    removeCaracteristicaFromServicio,
    getCaracteristicasByServicio
  };
};

export default useCaracteristicas; 