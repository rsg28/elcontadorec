import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faSearch, faDollarSign, faFilter } from '@fortawesome/free-solid-svg-icons';
import useItems from '../hooks/useItems';
import { useAllServicios } from '../hooks/useServicios';
import useCategorias from '../hooks/useCategorias';
import useSubcategorias from '../hooks/useSubcategorias';
import useNotifications from '../hooks/useNotifications';
import './CategoriaPage.css';
import displayDefault from '../assets/display1.jpeg';

const CategoriaPage = () => {
  const { categoriaId } = useParams(); // Obtiene el ID de la categoría de la URL
  const navigate = useNavigate();
  const { success, error: showError, warning, info, ToastContainer } = useNotifications();
  
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
  
  // Loading and error states
  const loading = itemsLoading || serviciosLoading || categoriasLoading || subcategoriasLoading;
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
  
  // Handle subcategoria selection
  const handleSubcategoriaChange = (servicioId, subcategoriaId, items) => {
    console.log('DEBUG - servicioId:', servicioId, 'type:', typeof servicioId);
    console.log('DEBUG - subcategoriaId:', subcategoriaId, 'type:', typeof subcategoriaId);
    console.log('DEBUG - items:', items);

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
      
      console.log('DEBUG - Comparing:', {
        itemServicioId,
        servicioIdNum,
        itemSubcategoriaId,
        subcategoriaIdNum,
        matches: itemServicioId === servicioIdNum && itemSubcategoriaId === subcategoriaIdNum
      });
      
      return itemServicioId === servicioIdNum && itemSubcategoriaId === subcategoriaIdNum;
    });

    console.log('DEBUG - Matching item:', matchingItem);

    // Update price
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

      if (servicioItems.length === 0) return null;

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

      return {
        servicio,
        items: servicioItems,
        subcategorias: subcategoriasWithItems,
        serviceInfo: {
          nombre: servicioItems[0].servicio_nombre,
          descripcion: servicioItems[0].descripcion,
          imagen_url: servicioItems[0].imagen_url
        }
      };
    }).filter(Boolean);
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
  
  // Initialize prices to 0 only when the category changes
  useEffect(() => {
    const initialPrices = {};
    categoryServices.forEach(servicio => {
      initialPrices[servicio.id_servicio] = 0;
    });
    setSelectedPrices(initialPrices);
  }, [categoriaId]);
  
  // Load data when component mounts or category changes
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        // Only fetch if we have a valid categoriaId
        if (!categoriaId || isNaN(parseInt(categoriaId))) {
          return;
        }

        // Fetch data in parallel
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
    getServicesWithItems().forEach(({ servicio, items, subcategorias }) => {
      if (
        subcategorias.length === 1 &&
        (!selectedPrices[servicio.id_servicio] || selectedPrices[servicio.id_servicio] === 0)
      ) {
        handleSubcategoriaChange(
          servicio.id_servicio,
          subcategorias[0].id_subcategoria,
          items
        );
      }
    });
    // eslint-disable-next-line
  }, [filteredItems, allSubcategorias]);
  
  if (loading) {
    return (
      <div className="categoria-page-container">
        <div className="loading-indicator">Cargando...</div>
      </div>
    );
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
              <div className="service-card-left">
                <h2 className="service-card-title">{serviceInfo.nombre}</h2>
                <p className="service-card-desc">{serviceInfo.descripcion}</p>
                {serviceInfo.imagen_url ? (
                  <img src={serviceInfo.imagen_url} alt={serviceInfo.nombre} className="service-card-img" />
                ) : (
                  <img src={displayDefault} alt="Imagen por defecto" className="service-card-img" />
                )}
                <button className="service-card-btn small">VER MÁS</button>
              </div>
              <div className="service-card-right">
                <label className="service-card-label">Seleccione una subcategoría para ver el precio</label>
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
                <div className="service-card-precio-row">
                  <span className="service-card-precio-label">PRECIO:</span>
                  <span className="service-card-precio">
                    ${formatPrice(selectedPrices[servicio.id_servicio] || 0)}
                  </span>
                  <button className="service-card-cart-btn">
                    <i className="fa fa-shopping-cart" style={{ color: '#ff0000' }}></i>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default CategoriaPage; 