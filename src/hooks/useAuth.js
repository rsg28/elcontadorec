// Verificado

import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api.js';

/**
 * Hook personalizado para manejar autenticación de usuarios
 * @returns {Object} - Objeto con funciones y estados de autenticación
 */
const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [adminStatus, setAdminStatus] = useState(false);
  const [adminStatusVerified, setAdminStatusVerified] = useState(false);

  // Verificar si hay un usuario en localStorage al cargar
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        // We'll verify admin status separately with the server
        verifyAdminStatus();
      } catch (err) {
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
      }
    }
    setLoading(false);
  }, []);

  /**
   * Verifica el estado de administrador con el servidor
   * @returns {Promise<boolean>} - true si el usuario es administrador según el servidor
   */
  const verifyAdminStatus = async () => {
    try {
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        setAdminStatus(false);
        setAdminStatusVerified(true);
        return false;
      }

      const response = await fetch(`${API_BASE_URL}/users/verify-admin`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        setAdminStatus(false);
        setAdminStatusVerified(true);
        return false;
      }

      const data = await response.json();
      setAdminStatus(data.isAdmin === true);
      setAdminStatusVerified(true);
      return data.isAdmin === true;
    } catch (err) {
      console.error('Error verifying admin status:', err);
      setAdminStatus(false);
      setAdminStatusVerified(true);
      return false;
    }
  };

  /**
   * Iniciar sesión con correo y contraseña
   * @param {Object} credentials - Credenciales (correo y password)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const login = async (credentials) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/users/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al iniciar sesión');
      }

      // Guardar token y datos de usuario
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      
      // Verify admin status immediately after login
      await verifyAdminStatus();

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Registrar un nuevo usuario
   * @param {Object} userData - Datos del nuevo usuario
   * @returns {Promise<Object>} - Resultado de la operación
   */
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`${API_BASE_URL}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al registrar usuario');
      }

      // Guardar token y datos de usuario
      localStorage.setItem('authToken', data.token);
      localStorage.setItem('user', JSON.stringify(data));
      setUser(data);
      
      // Verify admin status immediately after registration
      await verifyAdminStatus();

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  /**
   * Cerrar sesión
   */
  const logout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setAdminStatus(false);
    setAdminStatusVerified(false);
  };

  /**
   * Verificar si el usuario está autenticado
   * @returns {boolean} - true si hay un usuario autenticado
   */
  const isAuthenticated = () => {
    return !!localStorage.getItem('authToken');
  };

  /**
   * Verificar si el usuario es administrador
   * @returns {Promise<boolean>} - true si el usuario es administrador
   */
  const isAdmin = async () => {
    // If not authenticated, not an admin
    if (!isAuthenticated()) {
      return false;
    }
    
    // If admin status hasn't been verified yet, verify it now
    if (!adminStatusVerified) {
      return await verifyAdminStatus();
    }
    
    // Return the verified admin status
    return adminStatus;
  };

  /**
   * Obtener el perfil del usuario
   * @returns {Promise<Object>} - Datos del perfil del usuario
   */
  const getUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al obtener perfil');
      }
      
      // Update admin status after profile fetch
      if (data.isAdmin !== undefined) {
        setAdminStatus(data.isAdmin === true);
        setAdminStatusVerified(true);
      }

      return { success: true, data };
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    isAdmin,
    getUserProfile,
    refreshAdminStatus: verifyAdminStatus
  };
};

export default useAuth; 