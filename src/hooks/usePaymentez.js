import React, { useState } from 'react';

// URL base de la API


/**
 * Hook personalizado para manejar autenticación de usuarios
 * @returns {Object} - Objeto con funciones y estados de autenticación
 */
const usePaymentez = () => {
  const API_BASE_URL = '/api/cards';
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cards, setCards] = useState([]);

  const loadUserToken = () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const userStr = localStorage.getItem('user');
      if (!userStr) {
        throw new Error('User not found in localStorage');
      }
      return { user: JSON.parse(userStr), token };
    } catch (err) {
      setError(err.message);
      throw err; // Re-throw to handle in getAllCards
    }
  };

  const getAllCards = async () => {
    try {
      setLoading(true);
      setError(null);

      const { user, token } = loadUserToken();
      
      if (!user.id) {
        throw new Error('Invalid user data');
      }

      const response = await fetch(`${API_BASE_URL}/all/${user.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      setCards(data);
      return data;
    } catch (error) {
      // Error loading cards - handle silently or with proper error state
      setCards([]);
      setError(error.message || 'An error occurred while fetching cards');
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCard = async (cardToken) => {
    try {
      setLoading(true);
      setError(null);

      const { user, token } = loadUserToken();

      const response = await fetch(`${API_BASE_URL}/deleteCard`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ cardToken: cardToken, userID: user.id })
      });


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (err) {
      setError(err.message || 'An error occurred while deleting the card');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const debitPaymentWithToken = async (order, card) => {
    try {
      setLoading(true);
      setError(null);

      const { user, token } = loadUserToken();

      const response = await fetch(`${API_BASE_URL}/debitWithToken`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ order: order, user: user, card: card })
      });


      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return response.json();
    } catch (err) {
      setError(err.message || 'An error occurred submitting the payment');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  

  return {
    loading,
    error,
    getAllCards,
    deleteCard,
    debitPaymentWithToken
  };
};

export default usePaymentez; 