import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faHome } from '@fortawesome/free-solid-svg-icons';
import useAuth from '../hooks/useAuth';
import './Auth.css';

const ThankYou = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isFromRegistration, setIsFromRegistration] = useState(false);

  // Get user data from location state if available
  const userData = location.state?.userData || {};
  
  // Check if we have data from registration process
  useEffect(() => {
    // If we have userData from state, mark this as coming from registration
    if (location.state?.userData) {
      setIsFromRegistration(true);
    } 
    // If not authenticated and not coming from registration, redirect to login
    else if (!isAuthenticated() && !isFromRegistration) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate, location.state]);

  // Extract first name - prioritize data from useAuth, then navigation state
  const firstName = user?.nombres?.split(' ')[0] || userData?.nombres?.split(' ')[0] || 'Usuario';

  return (
    <div className="auth-container">
      <div className="auth-card thank-you-card">
        <div className="thank-you-icon">
          <FontAwesomeIcon icon={faCheckCircle} />
        </div>
        
        <div className="auth-header">
          <h2>¡Registro Exitoso!</h2>
          <p>Gracias por unirte a El Contador EC</p>
        </div>
        
        <div className="thank-you-message">
          <p>¡Hola <strong>{firstName}</strong>! Tu cuenta ha sido creada exitosamente.</p>
          <p>Ahora puedes acceder a todos nuestros servicios contables y tributarios personalizados.</p>
        </div>
        
        <div className="thank-you-actions">
          <Link to="/" className="auth-button main-button">
            <FontAwesomeIcon icon={faHome} />
            <span>Ir a la Página Principal</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYou; 