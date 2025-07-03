import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faShoppingCart, 
  faMinus, 
  faPlus, 
  faLock,
  faCreditCard,
  faFileInvoice,
  faMoneyBill
} from '@fortawesome/free-solid-svg-icons';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import './Carrito.css';
import displayImage from '../assets/display1.jpeg';
import Cards from '../components/Cards';

// Validation Schema
const validationSchema = Yup.object().shape({
  nombres: Yup.string()
    .required('Los nombres son requeridos')
    .min(2, 'Los nombres deben tener al menos 2 caracteres'),
  apellidos: Yup.string()
    .required('Los apellidos son requeridos')
    .min(2, 'Los apellidos deben tener al menos 2 caracteres'),
  cedula: Yup.string()
    .required('La cédula o RUC es requerido')
    .matches(/^[0-9]{10,13}$/, 'La cédula o RUC debe tener entre 10 y 13 dígitos'),
  telefono: Yup.string()
    .required('El teléfono es requerido')
    .matches(/^[0-9]{10}$/, 'El teléfono debe tener 10 dígitos')
});

const Carrito = () => {
  const [activeSection, setActiveSection] = useState('form'); // 'form' or 'payment'
  const [isFormValid, setIsFormValid] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
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

  // Initial form values
  const initialValues = {
    nombres: '',
    apellidos: '',
    cedula: '',
    telefono: ''
  };

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

  // Handle form submission
  const handleSubmit = (values, { setSubmitting }) => {
    console.log('Form submitted:', values);
    setSubmitting(false);
    // Store form values for payment
    setFacturaFormValues(values);
  };
  
  // State to hold validated form values for payment
  const [facturaFormValues, setFacturaFormValues] = useState(null);
  
  // Handle payment errors
  const [paymentError, setPaymentError] = useState(null);

  // Handle payment submission
  const handlePaymentSubmit = (paymentResult) => {
    if (paymentResult.success) {
      // Handle successful payment
      console.log('Payment successful:', paymentResult);
      // Could redirect to success page or show success message
    } else {
      // Handle payment error
      setPaymentError(paymentResult.error || 'Error en el proceso de pago');
    }
  };

  // Handle form validation
  const handleFormValidation = (isValid) => {
    setIsFormValid(isValid);
  };

  // Handle section toggle
  const handleSectionToggle = (section) => {
    if (section === 'payment' && !isFormValid) {
      alert('Por favor complete todos los campos del formulario antes de proceder al pago');
      return;
    }
    setActiveSection(section);
  };

  // Payment error styles
  const paymentErrorStyles = {
    backgroundColor: 'rgba(220, 53, 69, 0.1)',
    border: '1px solid rgba(220, 53, 69, 0.2)',
    borderRadius: '8px',
    padding: '12px 16px',
    marginBottom: '20px',
    textAlign: 'center',
    color: '#dc3545',
    fontSize: '14px',
    fontWeight: '500',
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
          
          <div className="section-toggle-buttons">
            <button 
              className={`toggle-button ${activeSection === 'form' ? 'active' : ''}`}
              onClick={() => handleSectionToggle('form')}
              style={{fontSize: '15px'}}
            >
              <FontAwesomeIcon icon={faFileInvoice} />
              Detalles para la factura
            </button>
            <div 
              className="payment-button-container"
              onMouseEnter={() => !isFormValid && setShowTooltip(true)}
              onMouseLeave={() => setShowTooltip(false)}
            >
              <button 
                className={`toggle-button ${activeSection === 'payment' ? 'active' : ''} ${!isFormValid ? 'disabled' : ''}`}
                onClick={() => handleSectionToggle('payment')}
                style={{fontSize: '15px'}}
                disabled={!isFormValid}
              >
                <FontAwesomeIcon icon={faMoneyBill} />
                Pagar
              </button>
              {showTooltip && !isFormValid && (
                <div className="tooltip">
                  Complete todos los campos del formulario para proceder al pago
                </div>
              )}
            </div>
          </div>

          <div className="factura-content">
            <div className={`factura-form ${activeSection === 'form' ? 'active' : ''}`}>
              <Formik
                initialValues={initialValues}
                validationSchema={validationSchema}
                onSubmit={handleSubmit}
                validateOnChange={true}
                validateOnBlur={true}
              >
                {({ isSubmitting, isValid, dirty }) => {
                  // Update form validation state whenever form validity changes
                  React.useEffect(() => {
                    handleFormValidation(isValid && dirty);
                  }, [isValid, dirty]);

                  return (
                    <Form>
                      <div className="form-group">
                        <label htmlFor="nombres">Nombres</label>
                        <Field
                          type="text"
                          id="nombres"
                          name="nombres"
                          className="form-input"
                        />
                        <ErrorMessage name="nombres" component="div" className="carrito-error-message" />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="apellidos">Apellidos</label>
                        <Field
                          type="text"
                          id="apellidos"
                          name="apellidos"
                          className="form-input"
                        />
                        <ErrorMessage name="apellidos" component="div" className="carrito-error-message" />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="cedula">Cédula o RUC</label>
                        <Field
                          type="text"
                          id="cedula"
                          name="cedula"
                          className="form-input"
                        />
                        <ErrorMessage name="cedula" component="div" className="carrito-error-message" />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="telefono">Número de teléfono</label>
                        <Field
                          type="text"
                          id="telefono"
                          name="telefono"
                          className="form-input"
                        />
                        <ErrorMessage name="telefono" component="div" className="carrito-error-message" />
                      </div>
                    </Form>
                  );
                }}
              </Formik>
            </div>
            <div className={`pago-section ${activeSection === 'payment' ? 'active' : ''}`}>
              {paymentError && (
                <div style={paymentErrorStyles}>
                  {paymentError}
                </div>
              )}
              <Cards 
                facturaFormValues={facturaFormValues} 
                onPaymentSubmit={handlePaymentSubmit}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Carrito; 