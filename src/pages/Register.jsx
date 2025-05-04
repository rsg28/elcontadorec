import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faEnvelope, 
  faLock, 
  faIdCard, 
  faPhone,
  faUserPlus,
  faSpinner,
  faCheckCircle 
} from '@fortawesome/free-solid-svg-icons';
import useAuth from '../hooks/useAuth';
import './Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    tipo_documento: 'cedula', // Default value
    numero_documento: '',
    telefono: '',
    correo: '',
    password: '',
    confirmPassword: ''
  });
  
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerSuccess, setRegisterSuccess] = useState('');
  const [isRegistrationComplete, setIsRegistrationComplete] = useState(false);
  
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Only check authentication on initial component mount
  useEffect(() => {
    // Skip redirect if we're in the process of registering
    if (isAuthenticated() && !isRegistrationComplete) {
      navigate('/');
    }
  }, []);  // Empty dependency array means this only runs once on mount

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
    
    // Names validation
    if (!formData.nombres.trim()) {
      errors.nombres = 'El nombre es requerido';
    }
    
    if (!formData.apellidos.trim()) {
      errors.apellidos = 'El apellido es requerido';
    }
    
    // Document validation
    if (!formData.numero_documento.trim()) {
      errors.numero_documento = 'El número de documento es requerido';
    } else if (!/^\d+$/.test(formData.numero_documento)) {
      errors.numero_documento = 'El número de documento debe contener solo dígitos';
    }
    
    // Phone validation
    if (!formData.telefono.trim()) {
      errors.telefono = 'El teléfono es requerido';
    } else if (!/^\d{7,15}$/.test(formData.telefono.replace(/\D/g, ''))) {
      errors.telefono = 'El teléfono debe tener entre 7 y 15 dígitos';
    }
    
    // Email validation
    if (!formData.correo) {
      errors.correo = 'El correo electrónico es requerido';
    } else if (!/\S+@\S+\.\S+/.test(formData.correo)) {
      errors.correo = 'El correo electrónico no es válido';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (formData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      setIsSubmitting(true);
      setRegisterError('');
      setRegisterSuccess('');
      
      // Remove confirmPassword as it's not needed in the API
      const { confirmPassword, ...userData } = formData;
      
      try {
        const result = await register(userData);
        
        if (!result.success) {
          setRegisterError(result.error || 'Error al registrar usuario. Inténtalo de nuevo.');
        } else {
          // Mark registration as complete to prevent automatic redirect
          setIsRegistrationComplete(true);
          
          // Show success message
          setRegisterSuccess(`¡Registro exitoso! Bienvenido/a ${userData.nombres}`);
          
          // Wait 2 seconds before redirecting to thank you page
          setTimeout(() => {
            navigate('/thank-you', { state: { userData } });
          }, 2000);
        }
      } catch (error) {
        setRegisterError('Error al conectar con el servidor. Inténtalo de nuevo.');
        console.error('Register error:', error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card register-card">
        <div className="auth-header">
          <h2>Crear Cuenta</h2>
          <p>Complete el formulario para registrarse</p>
        </div>
        
        {registerError && (
          <div className="error-message">
            {registerError}
          </div>
        )}
        
        {registerSuccess && (
          <div className="success-message">
            <FontAwesomeIcon icon={faCheckCircle} /> {registerSuccess}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="nombres">
                <FontAwesomeIcon icon={faUser} /> Nombres
              </label>
              <input
                type="text"
                id="nombres"
                name="nombres"
                value={formData.nombres}
                onChange={handleChange}
                placeholder="Nombres"
                className={formErrors.nombres ? 'error' : ''}
              />
              {formErrors.nombres && <div className="field-error">{formErrors.nombres}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="apellidos">
                <FontAwesomeIcon icon={faUser} /> Apellidos
              </label>
              <input
                type="text"
                id="apellidos"
                name="apellidos"
                value={formData.apellidos}
                onChange={handleChange}
                placeholder="Apellidos"
                className={formErrors.apellidos ? 'error' : ''}
              />
              {formErrors.apellidos && <div className="field-error">{formErrors.apellidos}</div>}
            </div>
          </div>
          
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="tipo_documento">
                <FontAwesomeIcon icon={faIdCard} /> Tipo de Documento
              </label>
              <select
                id="tipo_documento"
                name="tipo_documento"
                value={formData.tipo_documento}
                onChange={handleChange}
                className={formErrors.tipo_documento ? 'error' : ''}
              >
                <option value="cedula">Cédula</option>
                <option value="pasaporte">Pasaporte</option>
                <option value="ruc">RUC</option>
              </select>
              {formErrors.tipo_documento && <div className="field-error">{formErrors.tipo_documento}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="numero_documento">
                <FontAwesomeIcon icon={faIdCard} /> Número de Documento
              </label>
              <input
                type="text"
                id="numero_documento"
                name="numero_documento"
                value={formData.numero_documento}
                onChange={handleChange}
                placeholder="Número de documento"
                className={formErrors.numero_documento ? 'error' : ''}
              />
              {formErrors.numero_documento && <div className="field-error">{formErrors.numero_documento}</div>}
            </div>
          </div>
          
          <div className="form-group">
            <label htmlFor="telefono">
              <FontAwesomeIcon icon={faPhone} /> Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Teléfono"
              className={formErrors.telefono ? 'error' : ''}
            />
            {formErrors.telefono && <div className="field-error">{formErrors.telefono}</div>}
          </div>
          
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
          
          <div className="form-row">
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
                placeholder="Contraseña"
                className={formErrors.password ? 'error' : ''}
                autoComplete="new-password"
              />
              {formErrors.password && <div className="field-error">{formErrors.password}</div>}
            </div>
            
            <div className="form-group">
              <label htmlFor="confirmPassword">
                <FontAwesomeIcon icon={faLock} /> Confirmar Contraseña
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirmar contraseña"
                className={formErrors.confirmPassword ? 'error' : ''}
                autoComplete="new-password"
              />
              {formErrors.confirmPassword && <div className="field-error">{formErrors.confirmPassword}</div>}
            </div>
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
                <FontAwesomeIcon icon={faUserPlus} /> Registrarse
              </>
            )}
          </button>
        </form>
        
        <div className="auth-footer">
          <p>¿Ya tienes una cuenta? <Link to="/login">Iniciar Sesión</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Register; 