import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const ServiceCard = ({ 
  title, 
  description, 
  image, 
  count, 
  onCountChange, 
  price,
  detailsPath
}) => {
  const navigate = useNavigate();

  // Handler for increasing or decreasing quantity
  const handleCount = (operation) => {
    if (operation === 'increase') {
      onCountChange(count + 1);
    } else if (operation === 'decrease' && count > 1) {
      onCountChange(count - 1);
    }
  };

  return (
    <div className="service-card">
      <div className="service-info">
        <h2 className="service-title">{title}</h2>
        <p className="service-description">{description}</p>
        {image && <img src={image} alt={title} className="service-image" />}
        {detailsPath ? (
          <Link to={detailsPath} className="ver-mas-btn">VER MÁS</Link>
        ) : (
          <button className="ver-mas-btn">VER MÁS</button>
        )}
      </div>
      <div className="service-pricing">
        <div className="pricing-selector">
          <label>Seleccione un rango de ventas mensuales para obtener un precio</label>
          <div className="select-wrapper">
            <select className="ventas-range">
              <option value="0-5000">VENTAS MES DE $0 A $5,000</option>
              <option value="5001-10000">VENTAS MES DE $5,001 A $10,000</option>
              <option value="10001-20000">VENTAS MES DE $10,001 A $20,000</option>
              <option value="20001-50000">VENTAS MES DE $20,001 A $50,000</option>
            </select>
          </div>
        </div>
        <div className="quantity-selector">
          <button 
            className="qty-btn minus-btn" 
            onClick={() => handleCount('decrease')}
            disabled={count <= 1}
          >
            <FontAwesomeIcon icon={faMinus} />
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
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <div className="price-section">
          <div style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}>
            <div className="price-label">PRECIO:</div>
            <div className="price-amount-wrapper">
              <input type="text" value={price} readOnly className="price-amount-input" />
            </div>
            <button className="add-to-cart-btn">
              <FontAwesomeIcon icon={faShoppingCart} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard; 