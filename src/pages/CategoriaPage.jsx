import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faSearch, faDollarSign, faFilter, faSignInAlt, faUserPlus, faTimes } from '@fortawesome/free-solid-svg-icons';
import useItems from '../hooks/useItems';
import { useAllServicios } from '../hooks/useServicios';
import useCategorias from '../hooks/useCategorias';
import useSubcategorias from '../hooks/useSubcategorias';
import useNotifications from '../hooks/useNotifications';
import useAuth from '../hooks/useAuth';
import LoadingAnimation from '../components/loadingAnimation';
import './CategoriaPage.css';
import displayDefault from '../assets/display1.jpeg';

const CategoriaPage = () => {
  const { categoriaId } = useParams(); // Obtiene el ID de la categoría de la URL
  const navigate = useNavigate();
  const { success, error: showError, warning, info, ToastContainer } = useNotifications();
  const { isAuthenticated } = useAuth();
  
  // Add state for button loading
  const [isNavigating, setIsNavigating] = useState(false);
  
  // State for auth modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  
  // State for image loading
  const [imagesLoading, setImagesLoading] = useState(true);
  const [loadedImages, setLoadedImages] = useState(new Set());
  
  // Hooks for data
  const { 
    items: itemsWithDetails, 
    loading: itemsLoading, 
    error: itemsError,
    refreshItems 
  } = useItems();

  const { 
    servicios: allServicios, 
    loading: serviciosLoading, 
    error: serviciosError,
    fetchAllServicios 
  } = useAllServicios();

  const { 
    categorias: allCategorias, 
    loading: categoriasLoading, 
    error: categoriasError 
  } = useCategorias();
  
  const {
    subcategorias: allSubcategorias,
    loading: subcategoriasLoading,
    error: subcategoriasError
  } = useSubcategorias();
  
  // State for expanded services
  const [expandedServices, setExpandedServices] = useState({});
  
  // Add state for selected prices
  const [selectedPrices, setSelectedPrices] = useState({});
  
  // Add state for quantities
  const [quantities, setQuantities] = useState({});
  
  // Loading and error states
  const loading = itemsLoading || serviciosLoading || categoriasLoading || subcategoriasLoading || imagesLoading;
  const error = itemsError || serviciosError || categoriasError || subcategoriasError;
  
  // Get current category
  const currentCategory = allCategorias.find(c => c.id_categoria === parseInt(categoriaId));
  
  // Filter items based on category
  const filteredItems = itemsWithDetails.filter(item => {
    const service = allServicios.find(s => s.id_servicio === item.id_servicio);
    return service && service.id_categoria === parseInt(categoriaId);
  });
  
  // Get services for current category
  const categoryServices = allServicios.filter(s => s.id_categoria === parseInt(categoriaId));
  
  // Add ref to track if initial prices have been set
  const initialPricesSet = useRef({});
  
  // Handle subcategoria selection
  const handleSubcategoriaChange = (servicioId, subcategoriaId, items) => {
    // Reset to 0 if no subcategoria selected
    if (!subcategoriaId || subcategoriaId === "") {
      setSelectedPrices(prev => ({
        ...prev,
        [servicioId]: 0
      }));
      return;
    }

    // Convert IDs to numbers for comparison
    const servicioIdNum = Number(servicioId);
    const subcategoriaIdNum = Number(subcategoriaId);

    // Find the matching item
    const matchingItem = items.find(item => {
      const itemServicioId = Number(item.id_servicio);
      const itemSubcategoriaId = Number(item.id_subcategoria);
      
      return itemServicioId === servicioIdNum && itemSubcategoriaId === subcategoriaIdNum;
    });

    // Update price
    // you can put a function in a setState to consider the previous state (which is the argument)
    setSelectedPrices(prev => ({
      ...prev,
      [servicioId]: matchingItem ? matchingItem.precio : 0
    }));
  };
  
  // Get services for current category with their items grouped
  const getServicesWithItems = () => {
    return categoryServices.map(servicio => {
      // Get items for this service
      const servicioItems = filteredItems.filter(item => 
        Number(item.id_servicio) === Number(servicio.id_servicio)
      );

      // Get subcategorias that have items
      const subcategoriasWithItems = servicioItems.reduce((acc, item) => {
        const subcategoria = allSubcategorias.find(sub => 
          Number(sub.id_subcategoria) === Number(item.id_subcategoria)
        );
        if (subcategoria && !acc.some(s => s.id_subcategoria === subcategoria.id_subcategoria)) {
          acc.push(subcategoria);
        }
        return acc;
      }, []);

      // If no items, still show the service but with minimal info
      if (servicioItems.length === 0) {
        return {
          servicio,
          items: [],
          subcategorias: [],
          serviceInfo: {
            nombre: servicio.nombre || 'Servicio sin nombre',
            descripcion: servicio.descripcion || 'Sin descripción disponible',
            imagen_url: servicio.imagen || null
          }
        };
      }

      // Get the first item's details for the service info
      const firstItem = servicioItems[0];
      return {
        servicio,
        items: servicioItems,
        subcategorias: subcategoriasWithItems,
        serviceInfo: {
          nombre: firstItem.servicio_nombre || servicio.nombre || 'Servicio sin nombre',
          descripcion: firstItem.descripcion || servicio.descripcion || 'Sin descripción disponible',
          imagen_url: servicio.imagen || null
        }
      };
    });
  };
  
  // Toggle service expansion
  const toggleServiceExpansion = (serviceId) => {
    setExpandedServices(prev => ({
      ...prev,
      [serviceId]: !prev[serviceId]
    }));
  };
  
  // Format price
  const formatPrice = (price) => {
    return parseFloat(price || 0).toFixed(2);
  };
  
  // Handle add to cart click
  const handleAddToCart = (servicioId) => {
    if (!isAuthenticated()) {
      setShowAuthModal(true);
      return;
    }
    
    // Check if price is selected for authenticated users
    if (!selectedPrices[servicioId] || selectedPrices[servicioId] <= 0) {
      showError('Por favor seleccione una subcategoría para obtener el precio');
      return;
    }
    
    // TODO: Implement actual add to cart logic
    success('Producto agregado al carrito');
  };
  
  // Handle login redirect
  const handleLoginRedirect = () => {
    setShowAuthModal(false);
    navigate('/login');
  };
  
  // Handle register redirect
  const handleRegisterRedirect = () => {
    setShowAuthModal(false);
    navigate('/register');
  };
  
  // Handle close auth modal
  const handleCloseAuthModal = () => {
    setShowAuthModal(false);
  };
  
  // Function to preload images
  const preloadImages = async (imageUrls) => {
    const imagePromises = imageUrls.map((url) => {
      return new Promise((resolve, reject) => {
        if (!url || loadedImages.has(url)) {
          resolve(url);
          return;
        }
        
        const img = new Image();
        img.onload = () => {
          setLoadedImages(prev => new Set([...prev, url]));
          resolve(url);
        };
        img.onerror = () => {
          // Even if image fails to load, resolve to continue
          // The component will handle fallback in the onError event
          resolve(url);
        };
        img.src = url;
      });
    });

    try {
      await Promise.all(imagePromises);
    } catch (error) {
      console.error('Error preloading images:', error);
    }
  };

  // Initialize prices to 0 and reset image loading when category changes
  useEffect(() => {
    const initialPrices = {};
    categoryServices.forEach(servicio => {
      initialPrices[servicio.id_servicio] = 0;
    });
    setSelectedPrices(initialPrices);
    
    // Reset image loading state for new category
    setImagesLoading(true);
    setLoadedImages(new Set());
  }, [categoriaId]);

  // Preload images when services data is ready
  useEffect(() => {
    let isMounted = true;
    
    if (!serviciosLoading && categoryServices.length > 0) {
      const imageUrls = [];
      
      // Add default image
      imageUrls.push(displayDefault);
      
      // Add service images
      categoryServices.forEach(servicio => {
        if (servicio.imagen) {
          imageUrls.push(servicio.imagen);
        }
      });

      // Remove duplicates
      const uniqueImageUrls = [...new Set(imageUrls)];
      
      preloadImages(uniqueImageUrls).then(() => {
        if (isMounted) {
          setImagesLoading(false);
        }
      });
    } else if (!serviciosLoading && categoryServices.length === 0) {
      // If no services, don't wait for images
      if (isMounted) {
        setImagesLoading(false);
      }
    }

    return () => {
      isMounted = false;
    };
  }, [serviciosLoading, categoryServices]);
  
  // Load data when component mounts or category changes
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Only fetch if we have a valid categoriaId
        if (!categoriaId || isNaN(parseInt(categoriaId))) {
          return;
        }

        // Fetch data in parallel. Promise.all allows to run multiple processes in parallel.
        const [serviciosResult, itemsResult] = await Promise.all([
          fetchAllServicios(),
          refreshItems()
        ]);

        // Only update state if component is still mounted
        if (isMounted) {
          if (serviciosResult.error) {
            showError('Error al cargar los servicios');
          }
          if (itemsResult.error) {
            showError('Error al cargar los ítems');
          }
        }
      } catch (error) {
        console.error('Error loading data:', error);
        if (isMounted) {
          showError('Error al cargar los datos');
        }
      }
    };
    
    loadData();

    // Cleanup function to prevent state updates after unmount
    return () => {
      isMounted = false;
    };
  }, [categoriaId]); // Only depend on categoriaId

  // Reset expanded services when category changes
  useEffect(() => {
    setExpandedServices({});
  }, [categoriaId]);
  
  // Actualiza automáticamente el precio si solo hay una subcategoría
  useEffect(() => {
    const servicesWithItems = getServicesWithItems();
    servicesWithItems.forEach(({ servicio, items, subcategorias }) => {
      const servicioId = servicio.id_servicio;
      
      // Skip if we've already set the price for this service
      if (initialPricesSet.current[servicioId]) {
        return;
      }

      // Only update if there's exactly one subcategoria
      if (subcategorias.length === 1) {
        const subcategoriaId = subcategorias[0].id_subcategoria;
        const matchingItem = items.find(item => 
          Number(item.id_servicio) === Number(servicioId) && 
          Number(item.id_subcategoria) === Number(subcategoriaId)
        );
        
        if (matchingItem) {
          setSelectedPrices(prev => ({
            ...prev,
            [servicioId]: matchingItem.precio
          }));
          // Mark this service as having its initial price set
          initialPricesSet.current[servicioId] = true;
        }
      }
    });
  }, [filteredItems, allSubcategorias]); // Remove selectedPrices from dependencies

  // Reset the initialPricesSet ref when category changes
  useEffect(() => {
    initialPricesSet.current = {};
  }, [categoriaId]);
  
  // Handler for quantity change
  const handleQuantityChange = (servicioId, delta) => {
    setQuantities(prev => {
      const current = prev[servicioId] || 1;
      const next = Math.max(1, current + delta);
      return { ...prev, [servicioId]: next };
    });
  };
  
  // Handler for Ver Más button
  const handleVerMas = (servicioId) => {
    setIsNavigating(true);
    setTimeout(() => {
      navigate(`/servicio/${servicioId}`);
    }, 300); // Small delay to show loading animation
  };
  
  if (loading || isNavigating) {
    return <LoadingAnimation />;
  }
  
  if (error) {
    return (
      <div className="categoria-page-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }
  
  if (!currentCategory) {
    return (
      <div className="categoria-page-container">
        <div className="error-message">Categoría no encontrada</div>
      </div>
    );
  }
  
  return (
    <div className="categoria-page-container">
      <h1 className="categoria-title-centered">{currentCategory.nombre}</h1>
      <div className="services-list">
        {categoryServices.length === 0 ? (
          <p className="no-data">No hay servicios disponibles en esta categoría</p>
        ) : (
          getServicesWithItems().map(({ servicio, items, subcategorias, serviceInfo }) => (
            <div key={servicio.id_servicio} className="service-card">
              {/* Column 1: Image */}
              <div className="service-card-image">
                  {serviceInfo.imagen_url ? (
                    <img 
                      src={serviceInfo.imagen_url} 
                      alt={serviceInfo.nombre} 
                      className="service-card-img"
                      onError={(e) => {
                        e.target.src = displayDefault;
                        e.target.alt = "Imagen por defecto";
                      }}
                    />
                  ) : (
                    <img 
                      src={displayDefault} 
                      alt="Imagen por defecto" 
                      className="service-card-img" 
                    />
                  )}
                </div>
              
              {/* Column 2: Details */}
              <div className="service-card-details">
                <h2 className="service-card-title">{serviceInfo.nombre}</h2>
                <p className="service-card-desc">{serviceInfo.descripcion}</p>
                <button className="service-card-link" onClick={() => handleVerMas(servicio.id_servicio)}>Ver más</button>
              </div>

              {/* Column 3: Actions */}
              <div className="service-card-actions">
                <label className="service-card-label">Seleccione un rango de ventas mensuales para obtener un precio</label>
                <select
                  className="service-card-select"
                  defaultValue={subcategorias.length === 1 ? subcategorias[0].id_subcategoria : ""}
                  onChange={(e) => {
                    handleSubcategoriaChange(
                      servicio.id_servicio,
                      e.target.value,
                      items
                    );
                  }}
                >
                  {subcategorias.length > 1 && (
                    <option value="">Seleccione una subcategoría</option>
                  )}
                  {subcategorias.map(sub => (
                    <option key={sub.id_subcategoria} value={sub.id_subcategoria}>
                      {sub.nombre}
                    </option>
                  ))}
                </select>
                <div className="service-card-qty-row">
                  <span className="qty-label">necesito</span>
                  <div className="qty-controls">
                    <button className="qty-btn" onClick={() => handleQuantityChange(servicio.id_servicio, -1)} disabled={(quantities[servicio.id_servicio] || 1) <= 1}>-</button>
                    <input className="qty-input" type="text" value={quantities[servicio.id_servicio] || 1} readOnly />
                    <button className="qty-btn" onClick={() => handleQuantityChange(servicio.id_servicio, 1)}>+</button>
                  </div>
                  <span>declaración(es)</span>
                </div>
                <button 
                  className="service-card-cart-btn"
                  onClick={() => handleAddToCart(servicio.id_servicio)}
                  disabled={isAuthenticated() && (!selectedPrices[servicio.id_servicio] || selectedPrices[servicio.id_servicio] <= 0)}
                >
                    Agregar al carrito <i className="fa fa-shopping-cart"></i>
                  </button>
              </div>
            </div>
          ))
        )}
      </div>
      
      {/* Auth Modal */}
      {showAuthModal && (
        <div className="auth-modal-overlay" onClick={handleCloseAuthModal}>
          <div className="auth-modal" onClick={(e) => e.stopPropagation()}>
            <div className="auth-modal-header">
              <h2>Iniciar Sesión Requerido</h2>
              <button className="auth-modal-close" onClick={handleCloseAuthModal}>
                <FontAwesomeIcon icon={faTimes} />
              </button>
            </div>
            <div className="auth-modal-content">
              <p>Para agregar productos al carrito necesitas tener una cuenta en nuestra plataforma.</p>
              <div className="auth-modal-buttons">
                <button className="auth-modal-btn login-btn" onClick={handleLoginRedirect}>
                  <FontAwesomeIcon icon={faSignInAlt} />
                  Iniciar Sesión
                </button>
                <button className="auth-modal-btn register-btn" onClick={handleRegisterRedirect}>
                  <FontAwesomeIcon icon={faUserPlus} />
                  Registrarse
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ToastContainer />
    </div>
  );
};

export default CategoriaPage; 