import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFolderOpen, faFileAlt, faPaperPlane, faLock, faPlus, faMinus, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import { useAllServicios } from '../hooks/useServicios';
import useCategorias from '../hooks/useCategorias';
import './ServicioPage.css';

const features = [
  {
    icon: faFolderOpen,
    color: '#7c3aed',
    title: 'Recopilación Documental',
    desc: 'Descarga y análisis de los documentos electrónicos que constan en la base de datos del SRI y explican el uso habitual del contribuyente.'
  },
  {
    icon: faFileAlt,
    color: '#ef4444',
    title: 'Elaboración de Declaración IVA mensual',
    desc: 'Descarga y análisis de los documentos electrónicos que constan en la base de datos del SRI y explican el uso habitual del contribuyente.'
  },
  {
    icon: faPaperPlane,
    color: '#f59e42',
    title: 'Presentación al SRI',
    desc: 'Presentación electrónica de la declaración de IVA mensual en la cuenta tributaria del SRI en los plazos establecidos.'
  },
  {
    icon: faLock,
    color: '#0ea5e9',
    title: 'Confidencialidad',
    desc: 'Protegemos la información de nuestros clientes con los más altos estándares de seguridad.'
  }
];

const priceRanges = [
  'Ventas Mensuales de $0 a $5000',
  'Ventas Mensuales de $5001 a $20000',
  'Ventas Mensuales de $20001 a $50000',
  'Ventas Mensuales de $50001 o más'
];

const ServicioPage = () => {
  const { id_servicio } = useParams();
  const [selectedRange, setSelectedRange] = useState(priceRanges[0]);
  const [quantity, setQuantity] = useState(1);

  // Fetch all servicios and categorias
  const { servicios: allServicios, loading: serviciosLoading } = useAllServicios();
  const { categorias: allCategorias, loading: categoriasLoading } = useCategorias();

  // Find the current servicio and its category
  const currentServicio = allServicios.find(s => String(s.id_servicio) === String(id_servicio));
  const currentCategoria = currentServicio && allCategorias.find(c => c.id_categoria === currentServicio.id_categoria);

  // Loading state
  if (serviciosLoading || categoriasLoading) {
    return (
      <div className="servicio-page-container">
        <div className="loading-container">
          Cargando...
        </div>
      </div>
    );
  }

  // Not found state
  if (!currentServicio || !currentCategoria) {
    return (
      <div className="servicio-page-container">
        <div className="error-container">
          Servicio o categoría no encontrada
        </div>
      </div>
    );
  }

  return (
    <div className="servicio-page-container">
      <div className="servicio-category-container">
        <div className="servicio-category-title">
          {currentCategoria.nombre.toUpperCase()}
        </div>
      </div>
      <div className="servicio-card">
        <div className="servicio-header">
          <h1 className="servicio-title">{currentServicio.nombre}</h1>
          <div className="servicio-description">
            {currentServicio.descripcion || 'Con nuestro software de última tecnología generamos un reporte consolidado de ventas y retenciones del periodo contratado, cumpliendo con la normativa vigente'}
          </div>
        </div>
        <div className="servicio-content">
          <div className="servicio-features">
            {features.map((f, i) => (
              <div key={i} className="feature-card">
                <div className="feature-icon-container" style={{ background: f.color }}>
                  <FontAwesomeIcon icon={f.icon} />
                </div>
                <div className="feature-title">{f.title}</div>
                <div className="feature-description">{f.desc}</div>
              </div>
            ))}
          </div>
          <div className="servicio-price-container">
            <div className="price-label">Seleccione un rango de ventas mensuales para obtener un precio</div>
            <select 
              className="price-select"
              value={selectedRange} 
              onChange={e => setSelectedRange(e.target.value)}
            >
              {priceRanges.map((r, i) => <option key={i} value={r}>{r}</option>)}
            </select>
            <div className="quantity-container">
              <span className="quantity-text">necesito</span>
              <button 
                className="quantity-button" 
                onClick={() => setQuantity(q => Math.max(1, q - 1))}
              >
                <FontAwesomeIcon icon={faMinus} />
              </button>
              <input 
                className="quantity-input"
                type="text" 
                value={quantity} 
                readOnly 
              />
              <button 
                className="quantity-button" 
                onClick={() => setQuantity(q => q + 1)}
              >
                <FontAwesomeIcon icon={faPlus} />
              </button>
              <span className="quantity-text">declaración(es)</span>
            </div>
            <button className="add-to-cart-button">
              Agregar al carrito <FontAwesomeIcon icon={faShoppingCart} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServicioPage; 