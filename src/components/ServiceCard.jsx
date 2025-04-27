import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faShoppingCart, faBug } from '@fortawesome/free-solid-svg-icons';
import defaultImage from '../assets/empresas/display1.jpeg';
import useSubcategorias from '../hooks/useSubcategorias';

const ServiceCard = ({ 
  title, 
  description, 
  image, 
  count, 
  onCountChange, 
  price: defaultPrice,
  detailsPath,
  servicioId
}) => {
  const navigate = useNavigate();
  const { subcategorias, loading: loadingSubcategorias, error: subcategoriasError } = useSubcategorias(servicioId);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState('');
  const [price, setPrice] = useState(defaultPrice);
  const [debugMode, setDebugMode] = useState(false);

  useEffect(() => {
    if (subcategoriasError) {
      console.error('Error loading subcategorias:', subcategoriasError);
    }
  }, [subcategoriasError]);

  // Efecto para establecer la primera subcategoría como seleccionada cuando se cargan
  useEffect(() => {
    if (subcategorias && subcategorias.length > 0 && !selectedSubcategoria) {
      console.log('Setting first subcategoria:', subcategorias[0]);
      setSelectedSubcategoria(subcategorias[0].id_subcategoria);
      
      // Si la subcategoría tiene un precio, actualizarlo
      if (subcategorias[0].PreciosServicios && subcategorias[0].PreciosServicios.length > 0) {
        const precio = subcategorias[0].PreciosServicios[0]?.precio;
        if (precio) {
          setPrice(`$${precio}`);
        }
      }
    }
  }, [subcategorias, selectedSubcategoria]);

  // Handler para cambiar la subcategoría seleccionada
  const handleSubcategoriaChange = (e) => {
    const selected = e.target.value;
    setSelectedSubcategoria(selected);
    
    // Encontrar el precio correspondiente a la subcategoría seleccionada
    const selectedSubcat = subcategorias.find(sub => sub.id_subcategoria === selected);
    if (selectedSubcat && selectedSubcat.PreciosServicios && selectedSubcat.PreciosServicios.length > 0) {
      const precio = selectedSubcat.PreciosServicios[0]?.precio;
      if (precio) {
        setPrice(`$${precio}`);
      } else {
        setPrice(defaultPrice);
      }
    } else {
      setPrice(defaultPrice);
    }
  };

  // Handler para increasing or decreasing quantity
  const handleCount = (operation) => {
    if (operation === 'increase') {
      onCountChange(count + 1);
    } else if (operation === 'decrease' && count > 1) {
      onCountChange(count - 1);
    }
  };
  
  // Handler para agregar al carrito
  const handleAddToCart = () => {
    // Aquí se implementaría la lógica para agregar al carrito
    const subcategoriaNombre = selectedSubcategoria ? 
      subcategorias.find(sub => sub.id_subcategoria === selectedSubcategoria)?.nombre : 
      'No seleccionada';
    
    alert(`Servicio: ${title}\nSubcategoría: ${subcategoriaNombre}\nCantidad: ${count}\nPrecio: ${price}\nAgregado al carrito`);
  };

  // Función para cambiar al modo de depuración
  const toggleDebugMode = () => {
    setDebugMode(!debugMode);
  };

  // Usar imagen por defecto si no hay imagen
  const imageToShow = image || defaultImage;

  return (
    <div className="service-card">
      <div className="service-info">
        <h2 className="service-title">{title}</h2>
        <p className="service-description">{description}</p>
        <img src={imageToShow} alt={title} className="service-image" />
        {detailsPath ? (
          <Link to={detailsPath} className="ver-mas-btn">VER MÁS</Link>
        ) : (
          <button className="ver-mas-btn">VER MÁS</button>
        )}
        <button 
          onClick={toggleDebugMode} 
          className="debug-btn"
          style={{ marginTop: '10px', padding: '5px', fontSize: '12px', backgroundColor: '#f0f0f0', border: '1px solid #ccc' }}
        >
          <FontAwesomeIcon icon={faBug} /> {debugMode ? 'Ocultar Info Debug' : 'Mostrar Info Debug'}
        </button>
        
        {debugMode && (
          <div className="debug-info" style={{ marginTop: '10px', padding: '10px', backgroundColor: '#f8f8f8', border: '1px solid #ddd', fontSize: '12px' }}>
            <p><strong>Servicio ID:</strong> {servicioId}</p>
            <p><strong>Loading:</strong> {loadingSubcategorias ? 'Sí' : 'No'}</p>
            <p><strong>Error:</strong> {subcategoriasError || 'Ninguno'}</p>
            <p><strong>Subcategorías:</strong> {subcategorias ? subcategorias.length : 0}</p>
            {subcategorias && subcategorias.length > 0 && (
              <div>
                <p><strong>Datos primera subcategoría:</strong></p>
                <pre>{JSON.stringify(subcategorias[0], null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="service-pricing">
        <div className="pricing-selector">
          <label>Seleccione un rango de ventas mensuales para obtener un precio</label>
          <div className="select-wrapper">
            {loadingSubcategorias ? (
              <p className="loading-subcategorias">Cargando opciones...</p>
            ) : subcategoriasError ? (
              <p className="error-subcategorias">Error: {subcategoriasError}</p>
            ) : subcategorias.length === 0 ? (
              <p className="no-subcategorias">No hay opciones disponibles</p>
            ) : (
              <select 
                className="ventas-range"
                value={selectedSubcategoria}
                onChange={handleSubcategoriaChange}
              >
                {subcategorias.map(subcategoria => (
                  <option 
                    key={subcategoria.id_subcategoria} 
                    value={subcategoria.id_subcategoria}
                  >
                    {subcategoria.nombre}
                  </option>
                ))}
              </select>
            )}
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
            <button className="add-to-cart-btn" onClick={handleAddToCart}>
              <FontAwesomeIcon icon={faShoppingCart} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceCard; 