import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faMinus, 
  faPlus, 
  faLock,
  faCreditCard
} from '@fortawesome/free-solid-svg-icons';
import './Carrito.css';
import displayImage from '../assets/empresas/display1.jpeg';
import TokenizationForm from '../components/TokenizationForm';
const Carrito = () => {
  // Estado para los items del carrito
  const [cartItems, setCartItems] = useState([
    {
      id: 1,
      nombre: 'Declaraciones de Impuestos mensuales',
      imagen: displayImage,
      cantidad: 1,
      ventas: 'VENTAS MES DE $0 A $5,000',
      subtotal: 30.00
    },
    {
      id: 2,
      nombre: 'Declaraciones de Impuestos mensuales',
      imagen: displayImage,
      cantidad: 1,
      ventas: 'VENTAS MES DE $0 A $5,000',
      subtotal: 90.00
    }
  ]);

  // Estado para el formulario de información de factura
  const [formData, setFormData] = useState({
    nombres: '',
    apellidos: '',
    cedula: '',
    telefono: '',
    metodoPago: 'tarjeta',
    numeroTarjeta: '',
    fechaExpiracion: '',
    codigoSeguridad: ''
  });

  // Función para actualizar la cantidad de un producto
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.id === id ? { ...item, cantidad: newQuantity } : item
      )
    );
  };

  // Calcular subtotal, IVA y total
  const subtotal = cartItems.reduce((total, item) => total + item.subtotal * item.cantidad, 0);
  const iva = subtotal * 0.15; // IVA del 15%
  const total = subtotal + iva;

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Manejar cambio de método de pago
  const handlePaymentMethodChange = (method) => {
    setFormData({
      ...formData,
      metodoPago: method
    });
  };

  return (
    <div className="carrito-container">
      <div className="carrito-grid">
        {/* Columna izquierda - Carrito */}
        <div className="carrito-items-container">
          <div className="carrito-header">
            <FontAwesomeIcon icon={faShoppingCart} className="carrito-icon" />
            <h2>Mi Carrito</h2>
          </div>
          
          {cartItems.map(item => (
            <div key={item.id} className="carrito-item">
              <div className="item-imagen">
                <img src={item.imagen} alt={item.nombre} />
              </div>
              <div className="item-detalles">
                <h3 className="item-nombre">{item.nombre}</h3>
                <div className="item-metadata">
                  <div className="item-cantidad">
                    <span className="meta-label">CANTIDAD:</span>
                    <div className="cantidad-controls">
                      <button 
                        className="cantidad-btn"
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <input 
                        type="text" 
                        value={item.cantidad} 
                        readOnly 
                        className="cantidad-input"
                      />
                      <button 
                        className="cantidad-btn"
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                      >
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </div>
                  <div className="item-ventas">
                    <span className="meta-label">VENTAS:</span>
                    <span className="meta-value">{item.ventas}</span>
                  </div>
                </div>
                <div className="item-subtotal">
                  <span className="meta-label">SUBTOTAL DEL SERVICIO:</span>
                  <span className="meta-value">USD ${item.subtotal.toFixed(2)}</span>
                </div>
              </div>
            </div>
          ))}
          
          <div className="carrito-totales">
            <div className="total-row">
              <span className="total-label">SUBTOTAL:</span>
              <span className="total-value">USD ${subtotal.toFixed(2)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">IVA 15%:</span>
              <span className="total-value">USD ${iva.toFixed(2)}</span>
            </div>
            <div className="total-row total-final">
              <span className="total-label">TOTAL:</span>
              <span className="total-value">USD ${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
        
        {/* Columna derecha - Información de factura */}
        <div className="factura-container">
          <h2 className="factura-title">Información de la factura</h2>
          
          <div className="factura-form">
            <div className="form-group">
              <label htmlFor="nombres">Nombres</label>
              <input 
                type="text" 
                id="nombres" 
                name="nombres" 
                value={formData.nombres}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="apellidos">Apellidos</label>
              <input 
                type="text" 
                id="apellidos" 
                name="apellidos" 
                value={formData.apellidos}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="cedula">Cédula o RUC</label>
              <input 
                type="text" 
                id="cedula" 
                name="cedula" 
                value={formData.cedula}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="telefono">Número de teléfono</label>
              <input 
                type="text" 
                id="telefono" 
                name="telefono" 
                value={formData.telefono}
                onChange={handleInputChange}
                className="form-input"
              />
            </div>
            
            <div className="pago-section">
              <div className="pago-header">
                <h3>Forma de pago</h3>
                <div className="seguro-badge">
                  <FontAwesomeIcon icon={faLock} />
                  <span>Seguro</span>
                </div>
              </div>
              
              <div className="pago-metodos">
                <div 
                  className={`pago-metodo ${formData.metodoPago === 'tarjeta' ? 'active' : ''}`}
                  onClick={() => handlePaymentMethodChange('tarjeta')}
                >
                  <FontAwesomeIcon icon={faCreditCard} className="metodo-icon" />
                  <span>Tarjeta</span>
                </div>
                <div 
                  className={`pago-metodo ${formData.metodoPago === 'efectivo' ? 'active' : ''}`}
                  onClick={() => handlePaymentMethodChange('efectivo')}
                >
                  <span className="metodo-icon">$</span>
                  <span>Cash App Pay</span>
                </div>
                <div 
                  className={`pago-metodo ${formData.metodoPago === 'google' ? 'active' : ''}`}
                  onClick={() => handlePaymentMethodChange('google')}
                >
                  <span className="metodo-icon">G</span>
                  <span>Google Pay</span>
                </div>
              </div>
              {/* todo bien hasta este punto */}
              {formData.metodoPago === 'tarjeta' && (
                <TokenizationForm />
              )}
              
              <div className="paypal-option">
                <img src="https://www.paypalobjects.com/webstatic/mktg/logo/pp_cc_mark_37x23.jpg" alt="PayPal" className="paypal-logo" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito; 