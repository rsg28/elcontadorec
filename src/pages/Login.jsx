import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSignInAlt, faSpinner, faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import useAuth from '../hooks/useAuth';
import './Auth.css';

const Login = () => {
  const [formData, setFormData] = useState({
    correo: '',
    password: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginSuccess, setLoginSuccess] = useState('');
  const [allowRedirect, setAllowRedirect] = useState(true);
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.correo) {
      errors.correo = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      errors.correo = 'El correo electrónico no es válido';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setLoginError('');
      setLoginSuccess('');
      
      try {
        const result = await login(formData);
        
        if (!result.success) {
          setLoginError(result.error || 'Error al iniciar sesión. Verifica tus credenciales.');
        } else {
          // Block redirect until we're ready
          setAllowRedirect(false);
          
          // Show success message
          setLoginSuccess(`¡Bienvenido/a de nuevo, ${result.data.nombres?.split(' ')[0] || 'Usuario'}!`);
          
          // Wait 2 seconds before allowing redirect
          setTimeout(() => {
            setAllowRedirect(true);
            // Redirect to homepage instead of admin panel
            navigate('/');
          }, 2000);
        }
      } catch (error) {
        setLoginError('Error al conectar con el servidor. Inténtalo de nuevo.');
        console.error('Login error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h2>Iniciar Sesión</h2>
          <p>Ingresa tus credenciales para continuar</p>
        </div>
        
        {loginError && (
          <div className="error-message">
            {loginError}
          </div>
        )}
        
        {loginSuccess && (
          <div className="success-message">
            <FontAwesomeIcon icon={faCheckCircle} /> {loginSuccess}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="correo">
              <FontAwesomeIcon icon={faEnvelope} /> Correo Electrónico
            </label>
            <input
              type="email"
              id="correo"
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="correo@ejemplo.com"
              className={formErrors.correo ? 'error' : ''}
              autoComplete="email"
            />
            {formErrors.correo && <div className="field-error">{formErrors.correo}</div>}
          </div>
          
          <div className="form-group">
            <label htmlFor="password">
              <FontAwesomeIcon icon={faLock} /> Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Tu contraseña"
              className={formErrors.password ? 'error' : ''}
              autoComplete="current-password"
            />
            {formErrors.password && <div className="field-error">{formErrors.password}</div>}
          </div>
          
          <button 
            type="submit" 
            className="auth-button" 
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin /> Procesando...
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faSignInAlt} /> Iniciar Sesión
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>¿No tienes una cuenta? <Link to="/register">Regístrate ahora</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login; 