import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import './Perfil.css';
// Importar las imágenes directamente
import displayImage from '../assets/empresas/display1.jpeg';
import sub2Image from '../assets/empresas/sub2.jpeg';

const Perfil = () => {
  // Datos de usuario simulados (normalmente vendrían de un contexto o API)
  const [userData, setUserData] = useState({
    apellidosNombres: 'Arias Navia Fernando David',
    email: 'ariasfernando11@gmail.com',
    cedulaRuc: '0914915749'
  });

  // Datos de pedidos simulados (normalmente vendrían de una API)
  const [pedidos, setPedidos] = useState([
    {
      id: 1,
      fecha: 'Abril 22, 2023',
      total: '$91.48',
      cantidad: 3,
      servicio: 'Declaraciones de Impuestos mensuales',
      descripcion: 'Con nuestro software de última tecnología generamos un reporte consolidando ventas, compras y retenciones del periodo contratado, cumpliendo con la normativa vigente del SRI.',
      imagen: displayImage
    },
    {
      id: 2,
      fecha: 'Abril 22, 2023',
      total: '$91.48',
      cantidad: 2,
      servicio: 'Declaraciones de Impuestos mensuales',
      descripcion: 'Elaboramos y presentamos declaraciones de IVA mensual de forma oportuna, analizando documentos y optimizando su carga tributaria con el respaldo de expertos contables.',
      imagen: sub2Image
    }
  ]);

  return (
    <div className="perfil-container">
      <div className="perfil-grid">
        {/* Sección de información personal */}
        <div className="perfil-seccion info-personal">
          <div className="seccion-header">
            <FontAwesomeIcon icon={faUser} className="seccion-icono" />
            <h2>Tu Perfil</h2>
          </div>
          
          <div className="campo-perfil">
            <div className="campo-label">Apellidos y Nombres</div>
            <div className="campo-valor">{userData.apellidosNombres}</div>
            <button className="editar-btn">Editar</button>
          </div>
          
          <div className="campo-perfil">
            <div className="campo-label">Email</div>
            <div className="campo-valor">{userData.email}</div>
            <button className="editar-btn">Editar</button>
          </div>
          
          <div className="campo-perfil">
            <div className="campo-label">Cedula/RUC</div>
            <div className="campo-valor">{userData.cedulaRuc}</div>
            <button className="editar-btn">Editar</button>
          </div>
        </div>
        
        {/* Sección de pedidos */}
        <div className="perfil-seccion pedidos">
          <div className="seccion-header">
            <FontAwesomeIcon icon={faShoppingBag} className="seccion-icono" />
            <h2>Tus Pedidos</h2>
          </div>
          
          {pedidos.map(pedido => (
            <div key={pedido.id} className="pedido-card">
              <div className="pedido-header">
                <div className="pedido-info">
                  <div className="info-grupo">
                    <span className="info-label">FECHA DEL PEDIDO</span>
                    <span className="info-valor">{pedido.fecha}</span>
                  </div>
                  <div className="info-grupo">
                    <span className="info-label">TOTAL</span>
                    <span className="info-valor">{pedido.total}</span>
                  </div>
                  <div className="info-grupo">
                    <span className="info-label">CANTIDAD</span>
                    <span className="info-valor">{pedido.cantidad}</span>
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
          ))}
        </div>
      </div>
    </div>
  );
};

export default Perfil; 