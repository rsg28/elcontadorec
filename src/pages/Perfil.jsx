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
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
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
    <div className="perfil-container">
      {successMessage && (
        <div className="perfil-success-message">
          <FontAwesomeIcon icon={faCheckCircle} />
          <span>{successMessage}</span>
        </div>
      )}
      
      {errorMessage && (
        <div className="perfil-error-message">
          <FontAwesomeIcon icon={faTimes} />
          <span>{errorMessage}</span>
        </div>
      )}
      
      <div className="perfil-header">
        <div className="perfil-avatar">
          <div className="avatar-initials">
            {user?.nombres?.charAt(0) || ''}
            {user?.apellidos?.charAt(0) || ''}
          </div>
        </div>
        <div className="perfil-welcome">
          <h1>Bienvenido, {user?.nombres?.split(' ')[0] || 'Usuario'}</h1>
          <p>Gestiona tu información personal y visualiza tus servicios contratados</p>
        </div>
      </div>
      
      <div className="perfil-grid">
        {/* Sección de información personal */}
        <div className="perfil-seccion info-personal">
          <div className="seccion-header">
            <FontAwesomeIcon icon={faUser} className="seccion-icono" />
            <h2>Tu Perfil</h2>
          </div>
          
          <div className="campo-perfil">
            <div className="campo-label">Nombres</div>
            {editMode.nombres ? (
              <div className="campo-edit">
                <input
                  type="text"
                  name="nombres"
                  value={editData.nombres}
                  onChange={handleChange}
                  className="edit-input"
                />
                <div className="edit-actions">
                  <button 
                    className="save-btn" 
                    onClick={() => handleSave('nombres')} 
                    disabled={editing}
                  >
                    {editing ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Guardar'}
                  </button>
                  <button 
                    className="cancel-btn" 
                    onClick={() => handleCancel('nombres')}
                    disabled={editing}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="campo-valor">{user?.nombres || 'No especificado'}</div>
                <button className="editar-btn" onClick={() => handleEdit('nombres')}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </button>
              </>
            )}
          </div>
          
          <div className="campo-perfil">
            <div className="campo-label">Apellidos</div>
            {editMode.apellidos ? (
              <div className="campo-edit">
                <input
                  type="text"
                  name="apellidos"
                  value={editData.apellidos}
                  onChange={handleChange}
                  className="edit-input"
                />
                <div className="edit-actions">
                  <button 
                    className="save-btn" 
                    onClick={() => handleSave('apellidos')} 
                    disabled={editing}
                  >
                    {editing ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Guardar'}
                  </button>
                  <button 
                    className="cancel-btn" 
                    onClick={() => handleCancel('apellidos')}
                    disabled={editing}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="campo-valor">{user?.apellidos || 'No especificado'}</div>
                <button className="editar-btn" onClick={() => handleEdit('apellidos')}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </button>
              </>
            )}
          </div>
          
          <div className="campo-perfil">
            <div className="campo-label">Email</div>
            {editMode.correo ? (
              <div className="campo-edit">
                <input
                  type="email"
                  name="correo"
                  value={editData.correo}
                  onChange={handleChange}
                  className="edit-input"
                />
                <div className="edit-actions">
                  <button 
                    className="save-btn" 
                    onClick={() => handleSave('correo')} 
                    disabled={editing}
                  >
                    {editing ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Guardar'}
                  </button>
                  <button 
                    className="cancel-btn" 
                    onClick={() => handleCancel('correo')}
                    disabled={editing}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="campo-valor">{user?.correo || 'No especificado'}</div>
                <button className="editar-btn" onClick={() => handleEdit('correo')}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </button>
              </>
            )}
          </div>
          
          <div className="campo-perfil">
            <div className="campo-label">Teléfono</div>
            {editMode.telefono ? (
              <div className="campo-edit">
                <input
                  type="tel"
                  name="telefono"
                  value={editData.telefono}
                  onChange={handleChange}
                  className="edit-input"
                />
                <div className="edit-actions">
                  <button 
                    className="save-btn" 
                    onClick={() => handleSave('telefono')} 
                    disabled={editing}
                  >
                    {editing ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Guardar'}
                  </button>
                  <button 
                    className="cancel-btn" 
                    onClick={() => handleCancel('telefono')}
                    disabled={editing}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="campo-valor">{user?.telefono || 'No especificado'}</div>
                <button className="editar-btn" onClick={() => handleEdit('telefono')}>
                  <FontAwesomeIcon icon={faEdit} /> Editar
                </button>
              </>
            )}
          </div>
          
          <div className="campo-perfil">
            <div className="campo-label">Tipo/Número de Documento</div>
            <div className="campo-valor">
              {user?.tipo_documento ? `${user.tipo_documento.toUpperCase()}: ` : ''} 
              {user?.numero_documento || 'No especificado'}
            </div>
          </div>
          
          {/* Botón de Panel de Administración solo para administradores */}
          {isUserAdmin && (
            <div className="admin-panel-access">
              <div className="admin-panel-info">
                <FontAwesomeIcon icon={faUserCog} className="admin-icon" />
                <div>
                  <h3>Panel de Administración</h3>
                  <p>Accede a la gestión de servicios, subcategorías y precios</p>
                </div>
              </div>
              <Link to="/admin" className="admin-panel-btn">
                <FontAwesomeIcon icon={faTools} /> Gestionar
              </Link>
            </div>
          )}
          
          {/* Sección de Seguridad */}
          <div className="security-section">
            <h3 className="section-subtitle">
              <FontAwesomeIcon icon={faShield} /> Seguridad
            </h3>
            <div className="security-actions">
              <button className="security-btn">
                <FontAwesomeIcon icon={faEdit} /> Cambiar Contraseña
              </button>
              <button className="security-btn">
                <FontAwesomeIcon icon={faCreditCard} /> Gestionar Métodos de Pago
              </button>
            </div>
          </div>
        </div>
        
        {/* Sección de pedidos */}
        <div className="perfil-seccion pedidos">
          <div className="seccion-header">
            <FontAwesomeIcon icon={faShoppingBag} className="seccion-icono" />
            <h2>Tus Servicios Contratados</h2>
          </div>
          
          {pedidos.length > 0 ? (
            pedidos.map(pedido => (
              <div key={pedido.id} className="pedido-card">
                <div className="pedido-header">
                  <div className="pedido-info">
                    <div className="info-grupo">
                      <span className="info-label">FECHA</span>
                      <span className="info-valor">{pedido.fecha}</span>
                    </div>
                    <div className="info-grupo">
                      <span className="info-label">TOTAL</span>
                      <span className="info-valor">{pedido.total}</span>
                    </div>
                    <div className="info-grupo">
                      <span className="info-label">ESTADO</span>
                      <span className={`info-valor estado-${pedido.estado.toLowerCase().replace(' ', '-')}`}>
                        {pedido.estado}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="pedido-detalles">
                  <div className="servicio-info">
                    <h3>{pedido.servicio}</h3>
                    <p>{pedido.descripcion}</p>
                  </div>
                  <div className="servicio-imagen">
                    <img src={pedido.imagen} alt={pedido.servicio} />
                  </div>
                  <div className="acciones-pedido">
                    <button className="accion-btn">Detalles del servicio</button>
                    <button className="accion-btn">Contactar con un asesor</button>
                    <button className="accion-btn">Volver a comprar</button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-pedidos">
              <p>No has contratado ningún servicio todavía.</p>
              <Link to="/" className="browse-services-btn">
                <FontAwesomeIcon icon={faShoppingBag} /> Explorar Servicios
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Perfil; 