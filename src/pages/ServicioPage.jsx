import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFolderOpen, faFileAlt, faPaperPlane, faLock, 
  faPlus, faMinus, faShoppingCart, faFolder, 
  faFileInvoice, faShieldAlt, faUsers, faCalculator 
} from '@fortawesome/free-solid-svg-icons';
import { useAllServicios } from '../hooks/useServicios';
import useCategorias from '../hooks/useCategorias';
import LoadingAnimation from '../components/loadingAnimation';
import './ServicioPage.css';

// Mapa de iconos para convertir nombres de string a componentes de FontAwesome
const iconMap = {
  'folder': faFolder,
  'file-invoice': faFileInvoice,
  'paper-plane': faPaperPlane,
  'lock': faLock,
  // Añadir más iconos según sea necesario
  'folder-open': faFolderOpen,
  'file-alt': faFileAlt,
  'shield-alt': faShieldAlt,
  'users': faUsers,
  'calculator': faCalculator
};

const ServicioPage = () => {
  const { id_servicio } = useParams();
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [caracteristicas, setCaracteristicas] = useState([]);
  const [servicioItems, setServicioItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bannerImage, setBannerImage] = useState(null);

  // Fetch all servicios and categorias
  const { servicios: allServicios, loading: serviciosLoading } = useAllServicios();
  const { categorias: allCategorias, loading: categoriasLoading } = useCategorias();

  // Fetch caracteristicas for this servicio
  useEffect(() => {
    const fetchCaracteristicas = async () => {
      try {
        setLoading(true);
        // 1. Primero obtener las relaciones de servicio_caracteristicas
        const response = await fetch(`/api/servicios/${id_servicio}/caracteristicas`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setCaracteristicas(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching caracteristicas:', err);
        setError(err.message);
        setCaracteristicas([]);
      } finally {
        setLoading(false);
      }
    };

    if (id_servicio) {
      fetchCaracteristicas();
    }
  }, [id_servicio]);

  // Fetch items (subcategories) for this servicio
  useEffect(() => {
    const fetchServicioItems = async () => {
      try {
        const response = await fetch(`/api/items/servicio/${id_servicio}`);
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        setServicioItems(data);
        
        // Set the first item as selected by default
        if (data.length > 0) {
          setSelectedSubcategory(data[0]);
        }
      } catch (err) {
        console.error('Error fetching servicio items:', err);
        setError(err.message);
        setServicioItems([]);
      }
    };

    if (id_servicio) {
      fetchServicioItems();
    }
  }, [id_servicio]);

  // Fetch random banner image
  useEffect(() => {
    const fetchRandomBanner = async () => {
      try {
        const response = await fetch('/api/banners/random');
        
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setBannerImage(data.data.url);
          }
        }
      } catch (err) {
        console.error('Error fetching banner:', err);
        // Don't set error state for banner failures - just don't show banner
      }
    };

    fetchRandomBanner();
  }, []);

  // Find the current servicio and its category
  const currentServicio = allServicios.find(s => String(s.id_servicio) === String(id_servicio));
  const currentCategoria = currentServicio && allCategorias.find(c => c.id_categoria === currentServicio.id_categoria);

  // Get icon component from string name
  const getIconComponent = (iconName) => {
    return iconMap[iconName] || faFileAlt; // default icon if not found
  };

  // Loading state
  if (serviciosLoading || categoriasLoading || loading) {
    return (
      <div className="servicio-page-container">
        <div className="loading-container">
          <LoadingAnimation />
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="servicio-page-container">
        <div className="error-container">
          Error cargando características: {error}
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
          <div className="servicio-title-section">
            <h1 className="servicio-title">{currentServicio.nombre}</h1>
            <div className="servicio-description">
              {currentServicio.descripcion ? (
                currentServicio.descripcion
              ) : (
                <span className="no-description-message">
                  Este servicio aún no tiene una descripción detallada. Por favor, contáctenos para más información.
                </span>
              )}
            </div>
          </div>
          <div className="servicio-price-container">
            <div className="price-label">
              {servicioItems.length > 0 ? 'Seleccione una subcategoría:' : 'No hay subcategorías disponibles para este servicio'}
            </div>
            {servicioItems.length > 0 ? (
              <>
                <select 
                  className="price-select"
                  value={selectedSubcategory ? selectedSubcategory.id_items : ''} 
                  onChange={e => {
                    const selectedItem = servicioItems.find(item => 
                      String(item.id_items) === String(e.target.value)
                    );
                    setSelectedSubcategory(selectedItem);
                  }}
                >
                  {servicioItems.map((item) => (
                    <option key={item.id_items} value={item.id_items}>
                      {item.Subcategoria?.nombre || 'Sin subcategoría'}
                    </option>
                  ))}
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
                {selectedSubcategory && (
                  <div className="price-display">
                    <div className="selected-price">
                      Precio unitario: <strong>${parseFloat(selectedSubcategory.precio).toFixed(2)}</strong>
                    </div>
                    <div className="total-price">
                      Total: <strong>${(parseFloat(selectedSubcategory.precio) * quantity).toFixed(2)}</strong>
                    </div>
                  </div>
                )}
                <button className="add-to-cart-button">
                  Agregar al carrito <FontAwesomeIcon icon={faShoppingCart} />
                </button>
              </>
            ) : (
              <div className="no-subcategories-message">
                Este servicio aún no tiene subcategorías definidas. Por favor, contáctenos para más información.
              </div>
            )}
          </div>
        </div>
        <div className="servicio-features-wrapper">
          <div className="servicio-features">
            {caracteristicas.length > 0 ? (
              caracteristicas.map((c, i) => (
                <div key={i} className="feature-card">
                  <div className="feature-icon-container" style={{ background: c.color || '#cccccc' }}>
                    <FontAwesomeIcon icon={getIconComponent(c.imagen)} />
                  </div>
                  <div className="feature-title">{c.nombre}</div>
                  <div className="feature-description">{c.descripcion}</div>
                </div>
              ))
            ) : (
              <div className="no-features-message">
                Este servicio aún no tiene características definidas. Por favor, contáctenos para conocer más detalles sobre los beneficios y características específicas de este servicio.
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Banner Section - Outside servicio-card */}
      {bannerImage && (
        <div className="servicio-banner">
          <img 
            src={bannerImage} 
            alt="Banner promocional" 
            className="banner-image"
            onError={(e) => {
              e.target.style.display = 'none';
            }}
          />
        </div>
      )}
    </div>
  );
};

export default ServicioPage; 