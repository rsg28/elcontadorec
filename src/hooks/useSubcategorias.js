import { useState, useEffect } from 'react';

// URL base de la API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

/**
 * Hook personalizado para obtener subcategorías por servicio
 * @param {string} servicioId - ID del servicio
 * @returns {Object} - Objeto con las subcategorías, estado de carga y error
 */
const useSubcategorias = (servicioId) => {
  const [subcategorias, setSubcategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubcategorias = async () => {
      if (!servicioId) {
        setSubcategorias([]);
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        console.log(`Fetching subcategorias for service ID: ${servicioId}`);
        console.log(`URL: ${API_BASE_URL}/api/subcategorias/servicio/${servicioId}`);
        
        const response = await fetch(`${API_BASE_URL}/api/subcategorias/servicio/${servicioId}`);
        
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Error: ${response.status} ${response.statusText} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log(`Received ${data.length} subcategorías:`, data);
        setSubcategorias(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching subcategorias:', err);
        setError(err.message);
        setSubcategorias([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSubcategorias();
  }, [servicioId]);

  return { subcategorias, loading, error };
};

export default useSubcategorias; 