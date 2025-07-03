import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faShoppingBag, 
  faTools, 
  faUserCog, 
  faEnvelope, 
  faIdCard, 
  faPhone, 
  faStar, 
  faCalendarAlt, 
  faEdit,
  faCheckCircle,
  faTimes,
  faSpinner,
  faShield,
  faCreditCard
} from '@fortawesome/free-solid-svg-icons';
import { Link, Navigate } from 'react-router-dom';
import './Perfil.css';
// Importar las imágenes directamente
import displayImage from '../assets/display1.jpeg';
import useAuth from '../hooks/useAuth';

const Perfil = () => {
  const { user, isAuthenticated, isAdmin, loading, logout, getUserProfile } = useAuth();
  const [isEditMode, setIsEditMode] = useState(false);
  const [editData, setEditData] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    correo: '',
    numero_documento: '',
    ciudad: ''
  });
  const [editing, setEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const [fullUserProfile, setFullUserProfile] = useState(null);
  
  // Check admin status and fetch full profile on component mount
  useEffect(() => {
    const checkAdminStatus = async () => {
      if (isAuthenticated()) {
        try {
          const adminStatus = await isAdmin();
          setIsUserAdmin(adminStatus);
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsUserAdmin(false);
        }
      }
    };
    
    const fetchFullProfile = async () => {
      if (isAuthenticated()) {
        try {
          const profileResult = await getUserProfile();
          if (profileResult.success) {
            setFullUserProfile(profileResult.data);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      }
    };
    
    checkAdminStatus();
    fetchFullProfile();
  }, []); // Empty dependency array - run only once on mount

  // Redirect if not authenticated
  if (!isAuthenticated() && !loading) {
    return <Navigate to="/login" />;
  }

  // Datos de pedidos simulados (normalmente vendrían de una API)
  const [pedidos] = useState([
    {
      id: 1,
      fecha: 'Abril 22, 2023',
      total: '$91.48',
      cantidad: 3,
      servicio: 'Declaraciones de Impuestos mensuales',
      descripcion: 'Con nuestro software de última tecnología generamos un reporte consolidando ventas, compras y retenciones del periodo contratado, cumpliendo con la normativa vigente del SRI.',
      imagen: displayImage,
      estado: 'Completado'
    },
  ]);

  useEffect(() => {
    if (fullUserProfile) {
      setEditData({
        nombres: fullUserProfile.nombres || '',
        apellidos: fullUserProfile.apellidos || '',
        telefono: fullUserProfile.telefono || '',
        correo: fullUserProfile.correo || '',
        numero_documento: fullUserProfile.numero_documento || '',
        ciudad: fullUserProfile.ciudad || ''
      });
    }
  }, [fullUserProfile]);

  const handleEditClick = () => {
    setIsEditMode(true);
  };

  const handleCancel = () => {
    setIsEditMode(false);
    // Reset all fields to original values
    if (fullUserProfile) {
    setEditData({
        nombres: fullUserProfile.nombres || '',
        apellidos: fullUserProfile.apellidos || '',
        telefono: fullUserProfile.telefono || '',
        correo: fullUserProfile.correo || '',
        numero_documento: fullUserProfile.numero_documento || '',
        ciudad: fullUserProfile.ciudad || ''
    });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  const handleSave = async () => {
    try {
    setEditing(true);
      setErrorMessage('');
      
      const token = localStorage.getItem('authToken');
      
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(editData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Error al actualizar perfil');
      }

      // Update the full profile with new data
      setFullUserProfile(data);
      setIsEditMode(false);
      setSuccessMessage('Perfil actualizado correctamente');
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
      
    } catch (err) {
      setErrorMessage(err.message);
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    } finally {
      setEditing(false);
    }
  };

  const getFieldLabel = (field) => {
    switch(field) {
      case 'nombres': return 'nombres';
      case 'apellidos': return 'apellidos';
      case 'telefono': return 'teléfono';
      case 'correo': return 'correo electrónico';
      default: return field;
    }
  };

  // Format full name from user data
  const formatFullName = () => {
    if (!user) return 'Usuario';
    
    const nombres = user.nombres || '';
    const apellidos = user.apellidos || '';
    
    if (nombres && apellidos) {
      return `${apellidos} ${nombres}`;
    } else if (nombres) {
      return nombres;
    } else if (apellidos) {
      return apellidos;
    }
    
    return 'Usuario';
  };

  if (loading) {
    return (
      <div className="perfil-loading">
        <FontAwesomeIcon icon={faSpinner} spin />
        <p>Cargando información de perfil...</p>
      </div>
    );
  }

  return (
    <div className="perfil-main-layout">
      <div className="perfil-main-card">
        <aside className="perfil-sidebar">
          <ul>
            <li className="sidebar-active">
              <div className="sidebar-icon-circle">
                <FontAwesomeIcon icon={faUser} />
              </div>
              Mi perfil
            </li>
            <li className="has-sub">
              <div className="sidebar-icon-circle-gray">
                <FontAwesomeIcon icon={faShoppingBag} />
              </div>
              Mis pedidos
            </li>
            <ul className="sidebar-sub">
              <li>Pedidos pendientes</li>
              <li>Pedidos completados</li>
            </ul>
            <li className="sidebar-logout">
              <button type="button" className="logout-btn" onClick={() => { logout(); window.location.href = '/'; }}>
                <div className="sidebar-icon-circle-logout">
                  <FontAwesomeIcon icon={faTools} />
                </div>
                Cerrar sesión
                  </button>
            </li>
            {isUserAdmin && (
              <li className="sidebar-admin">
                <Link to="/admin" className="admin-panel-link">
                  <div className="admin-icon">
                    <FontAwesomeIcon icon={faUserCog} />
                  </div>
                  Panel de Administración
                </Link>
              </li>
            )}
          </ul>
        </aside>
        <div className="perfil-content">
          <h2 className="perfil-title">Mi perfil</h2>
          <p className="perfil-subtitle">Aquí podrás actualizar la información de tu cuenta</p>
          
          {successMessage && (
            <div className="perfil-success-message">
              {successMessage}
            </div>
          )}
          
          {errorMessage && (
            <div className="perfil-error-message">
              {errorMessage}
            </div>
          )}
          <div className="perfil-card-outer">
            <div className="perfil-card">
              <div className="perfil-avatar-big">
                <img src={displayImage} alt="avatar" />
                <button className="perfil-avatar-edit">Editar</button>
              </div>
              <div className="perfil-card-info">
                <div className="perfil-card-header">
                  <span className="perfil-card-name">{formatFullName()}</span>
                  {!isEditMode ? (
                    <button className="perfil-card-edit-btn" onClick={handleEditClick}>Editar</button>
                  ) : (
                    <button className="perfil-card-edit-btn" onClick={handleCancel}>Cancelar</button>
                  )}
                </div>
                <div className="perfil-card-sub">Apellidos y Nombre</div>
                <div className="perfil-card-fields">
                <div>
                    {isEditMode ? (
                      <input
                        type="email"
                        name="correo"
                        value={editData.correo}
                        onChange={handleChange}
                        className="perfil-field-input"
                        placeholder="Email"
                      />
                    ) : (
                      <div className={!fullUserProfile?.correo ? 'perfil-field-na' : ''}>{fullUserProfile?.correo || 'NA'}</div>
                    )}
                    <div className="perfil-card-label">Email</div>
                  </div>
                  <div>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="numero_documento"
                        value={editData.numero_documento}
                        onChange={handleChange}
                        className="perfil-field-input"
                        placeholder="Cédula/RUC"
                      />
                    ) : (
                      <div className={!fullUserProfile?.numero_documento ? 'perfil-field-na' : ''}>{fullUserProfile?.numero_documento || 'NA'}</div>
                    )}
                    <div className="perfil-card-label">Cédula/RUC</div>
                  </div>
                  <div>
                    {isEditMode ? (
                      <input
                        type="tel"
                        name="telefono"
                        value={editData.telefono}
                        onChange={handleChange}
                        className="perfil-field-input"
                        placeholder="Celular"
                      />
                    ) : (
                      <div className={!fullUserProfile?.telefono ? 'perfil-field-na' : ''}>{fullUserProfile?.telefono || 'NA'}</div>
                    )}
                    <div className="perfil-card-label">Celular</div>
                  </div>
                  <div>
                    {isEditMode ? (
                      <input
                        type="text"
                        name="ciudad"
                        value={editData.ciudad}
                        onChange={handleChange}
                        className="perfil-field-input"
                        placeholder="Ciudad"
                      />
                    ) : (
                      <div className={!fullUserProfile?.ciudad ? 'perfil-field-na' : ''}>{fullUserProfile?.ciudad || 'NA'}</div>
                    )}
                    <div className="perfil-card-label">Ciudad</div>
                  </div>
                </div>
                {isEditMode && (
                  <button 
                    className="perfil-card-save-btn" 
                    onClick={handleSave}
                    disabled={editing}
                  >
                    {editing ? 'Guardando...' : 'Guardar'} <FontAwesomeIcon icon={faCheckCircle} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil; 