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
  const { user, isAuthenticated, isAdmin, loading, logout } = useAuth();
  const [editMode, setEditMode] = useState({
    nombres: false,
    apellidos: false,
    telefono: false,
    correo: false
  });
  const [editData, setEditData] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
    correo: ''
  });
  const [editing, setEditing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  
  // Check admin status on component mount
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
    
    checkAdminStatus();
  }, [isAuthenticated, isAdmin]);

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
    if (user) {
      setEditData({
        nombres: user.nombres || '',
        apellidos: user.apellidos || '',
        telefono: user.telefono || '',
        correo: user.correo || ''
      });
    }
  }, [user]);

  const handleEdit = (field) => {
    setEditMode({
      ...editMode,
      [field]: true
    });
  };

  const handleCancel = (field) => {
    setEditMode({
      ...editMode,
      [field]: false
    });
    // Reset the field to original value
    setEditData({
      ...editData,
      [field]: user[field] || ''
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData({
      ...editData,
      [name]: value
    });
  };

  const handleSave = (field) => {
    // Here you would typically call an API to update the user data
    setEditing(true);
    
    // Simulate an API call
    setTimeout(() => {
      setEditMode({
        ...editMode,
        [field]: false
      });
      setSuccessMessage(`Se ha actualizado tu ${getFieldLabel(field)} correctamente.`);
      setEditing(false);
      
      // Clear success message after a few seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);
    }, 1000);
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
          <div className="perfil-card-outer">
            <div className="perfil-card">
              <div className="perfil-avatar-big">
                <img src={displayImage} alt="avatar" />
                <button className="perfil-avatar-edit">Editar</button>
              </div>
              <div className="perfil-card-info">
                <div className="perfil-card-header">
                  <span className="perfil-card-name">{formatFullName()}</span>
                  <button className="perfil-card-edit-btn">Editar</button>
                </div>
                <div className="perfil-card-sub">Apellidos y Nombre</div>
                <div className="perfil-card-fields">
                <div>
                    <div>{user?.correo}</div>
                    <div className="perfil-card-label">Email</div>
                  </div>
                  <div>
                    <div>{user?.numero_documento}</div>
                    <div className="perfil-card-label">Cédula/RUC</div>
                  </div>
                  <div>
                    <div>{user?.telefono}</div>
                    <div className="perfil-card-label">Celular</div>
                  </div>
                  <div>
                    <div>{user?.ciudad}</div>
                    <div className="perfil-card-label">Ciudad</div>
                  </div>
                </div>
                <button className="perfil-card-save-btn">Guardar <FontAwesomeIcon icon={faCheckCircle} /></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Perfil; 