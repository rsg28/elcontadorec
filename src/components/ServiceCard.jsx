import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faMinus, faShoppingCart } from '@fortawesome/free-solid-svg-icons';
import defaultImage from '../assets/empresas/display1.jpeg';
import { useSubcategoriasByServicio } from '../hooks/useSubcategorias';
import useItems from '../hooks/useItems';

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
  const { items } = useItems();
  const { subcategorias, loading: loadingSubcategorias, error: subcategoriasError } = useSubcategoriasByServicio(servicioId);
  const [selectedSubcategoria, setSelectedSubcategoria] = useState('');

  // Find the price from items for the selected service and subcategory
  let price = defaultPrice;
  if (servicioId && selectedSubcategoria) {
    const matchedItem = items.find(
      item => String(item.id_servicio) === String(servicioId) && String(item.id_subcategoria) === String(selectedSubcategoria)
    );
    if (matchedItem && matchedItem.precio !== undefined && matchedItem.precio !== null) {
      const total = Number(matchedItem.precio) * count;
      price = `$${total}`;
    }
  }

  useEffect(() => {
    if (subcategorias && subcategorias.length > 0 && !selectedSubcategoria) {
      setSelectedSubcategoria(subcategorias[0].id_subcategoria);
    }
  }, [subcategorias, selectedSubcategoria]);

  // Handler para cambiar la subcategoría seleccionada
  const handleSubcategoriaChange = (e) => {
    setSelectedSubcategoria(e.target.value);
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

  // Usar imagen por defecto si no hay imagen
  const imageToShow = image || defaultImage;

  return (
    <div className="service-card horizontal">
      <div className="service-left">
        <h2 className="service-title">
          {detailsPath ? (
            <Link to={detailsPath} className="service-title-link">{title}</Link>
          ) : title}
        </h2>
        <p className="service-description ellipsis">{description}</p>
        <img src={imageToShow} alt={title} className="service-image" />
        <div className="service-link-row">
          {detailsPath ? (
            <Link to={detailsPath} className="ver-mas-btn">VER MAS</Link>
          ) : (
            <button className="ver-mas-btn">VER MAS</button>
          )}
        </div>
      </div>
      <div className="service-right">
        <div className="service-dropdown-row">
          <label className="dropdown-label">Seleccione un rango de ventas mensuales para obtener un precio</label>
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
        <div className="quantity-selector horizontal-qty">
          <button 
            className="qty-btn minus-btn" 
            onClick={() => handleCount('decrease')}
            disabled={count <= 1}
            title="Disminuir cantidad"
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
            title="Aumentar cantidad"
          >
            <FontAwesomeIcon icon={faPlus} />
          </button>
        </div>
        <div className="price-section horizontal-price">
          <span className="price-label">PRECIO:</span>
          <span className="price-amount">{price}</span>
          <button className="add-to-cart-btn horizontal-cart" onClick={handleAddToCart} title="Agregar al carrito">
            <FontAwesomeIcon icon={faShoppingCart} />
          </button>
        </div>
        <div className="iva-note" style={{ fontSize: '0.92em', color: '#888', marginTop: '2px' }}>
          Incluye IVA
        </div>
      </div>
    </div>
  );
};

export default ServiceCard; 