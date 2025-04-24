import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faEdit, faUserTie, faLock, faShoppingCart, faTag, faPercentage, faCalculator } from '@fortawesome/free-solid-svg-icons';
import './DeclaracionesDetalles.css';

const DeclaracionesDetalles = () => {
  const [count, setCount] = useState(1);
  const [selectedRange, setSelectedRange] = useState('0-5000');
  
  // Datos de servicios
  const servicios = [
    {
      id: 1,
      icon: faFileAlt,
      title: 'RECOPILACIÓN Y REVISIÓN DOCUMENTAL',
      description: 'Descarga y análisis de los documentos electrónicos que constan en la base de datos del SRI y reposan en el buzón del contribuyente'
    },
    {
      id: 2,
      icon: faEdit,
      title: 'ELABORACIÓN DE DECLARACION IVA MENSUAL',
      description: 'Descarga y análisis de los documentos electrónicos que constan en la base de datos del SRI y reposan en el buzón del contribuyente'
    },
    {
      id: 3,
      icon: faUserTie,
      title: 'PRESENTACIÓN AL SRI',
      description: 'Presentamos electronicamente la declaración de IVA mensual ante la autoridad tributaria, cumpliendo con todos los plazos establecidos.'
    },
    {
      id: 4,
      icon: faLock,
      title: 'CONFIDENCIALIDAD',
      description: 'Protegemos la información de nuestros clientes con los más altos estándares de seguridad.'
    }
  ];

  // Datos de rangos de ventas
  const rangosVentas = [
    { value: '0-5000', label: 'VENTAS MES DE $0 A $5,000', price: 10 },
    { value: '5001-10000', label: 'VENTAS MES DE $5,001 A $10,000', price: 15 },
    { value: '10001-20000', label: 'VENTAS MES DE $10,001 A $20,000', price: 20 },
    { value: '20001-50000', label: 'VENTAS MES DE $20,001 A $50,000', price: 30 }
  ];
  
  // Handler para aumentar o disminuir cantidad
  const handleCount = (operation) => {
    if (operation === 'increase') {
      setCount(prevCount => prevCount + 1);
    } else if (operation === 'decrease' && count > 1) {
      setCount(prevCount => prevCount - 1);
    }
  };

  // Obtener precio basado en el rango seleccionado
  const getPriceByRange = (range) => {
    const selectedRango = rangosVentas.find(rango => rango.value === range);
    return selectedRango ? selectedRango.price : 10;
  };
  
  // Calcular precio total
  const price = getPriceByRange(selectedRange);
  const totalPrice = price * count;
  
  return (
    <div className="declaraciones-detalles">
      <h1 className="detalles-title">Declaraciones de Impuestos mensuales</h1>
      
      <div className="detalles-container">
        <div className="detalles-descripcion">
          <p className="detalles-text">
            Con nuestro software de última tecnología generamos un reporte 
            consolidando ventas, compras y retenciones del periodo contratado, 
            cumpliendo con la normativa vigente
          </p>
          
          <div className="servicios-list">
            {servicios.map(servicio => (
              <div key={servicio.id} className="servicio-item">
                <div className="servicio-icon">
                  <FontAwesomeIcon icon={servicio.icon} />
                </div>
                <div className="servicio-info">
                  <h3>{servicio.title}</h3>
                  <p>{servicio.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="detalles-pricing">
          <div className="detalles-pricing-card">
            <div className="pricing-header">
              <FontAwesomeIcon icon={faTag} className="pricing-icon" />
              <h2>Opciones de Servicio</h2>
            </div>
            
            <div className="pricing-section">
              <label htmlFor="ventas-range" className="pricing-label">
                <FontAwesomeIcon icon={faCalculator} className="input-icon" /> 
                Seleccione un rango de ventas mensuales:
              </label>
              <div className="select-wrapper">
                <select 
                  id="ventas-range"
                  className="ventas-range"
                  value={selectedRange}
                  onChange={(e) => setSelectedRange(e.target.value)}
                >
                  {rangosVentas.map(rango => (
                    <option key={rango.value} value={rango.value}>
                      {rango.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
            <div className="pricing-section">
              <label className="pricing-label">
                <FontAwesomeIcon icon={faPercentage} className="input-icon" />
                Cantidad:
              </label>
              <div className="quantity-controls">
                <button 
                  className="qty-btn minus-btn" 
                  onClick={() => handleCount('decrease')}
                  disabled={count <= 1}
                >
                  −
                </button>
                <input 
                  type="text" 
                  className="qty-input" 
                  value={count} 
                  readOnly 
                />
                <button 
                  className="qty-btn plus-btn" 
                  onClick={() => handleCount('increase')}
                >
                  +
                </button>
              </div>
            </div>
            
            <div className="pricing-summary">
              <div className="pricing-row">
                <span>Precio unitario:</span>
                <span>${price.toFixed(2)}</span>
              </div>
              <div className="pricing-row">
                <span>Cantidad:</span>
                <span>{count}</span>
              </div>
              <div className="pricing-row total">
                <span>Total:</span>
                <span>${totalPrice.toFixed(2)}</span>
              </div>
            </div>
            
            <button className="add-to-cart-button">
              <FontAwesomeIcon icon={faShoppingCart} className="button-icon" />
              Agregar al Carrito
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeclaracionesDetalles; 