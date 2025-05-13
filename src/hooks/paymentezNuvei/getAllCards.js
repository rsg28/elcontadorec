import React, { useState, useEffect } from 'react';

// URL base de la API


/**
 * Hook personalizado para manejar autenticación de usuarios
 * @returns {Object} - Objeto con funciones y estados de autenticación
 */
const usePaymentez = () => {
  const API_BASE_URL = '/api/cards';
  const token = localStorage.getItem('authToken');
  const [cards, setCards] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAllCards = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('User not found in localStorage');
      }

      const user = JSON.parse(userStr);
      if (!user.id) {
        throw new Error('Invalid user data');
      }

      const userId = user.id;
      
      const response = await fetch(`${API_BASE_URL}/all/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setCards(data);
    } catch (err) {
      setError(err.message || 'An error occurred while fetching cards');
      setCards(null);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getAllCards();
  }, []);

  
  return {
    cards,
    loading,
    error,
    refetch: getAllCards
  };
};

export default usePaymentez; 