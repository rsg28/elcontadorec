import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Empresas.css';
import ServiceCard from '../components/ServiceCard';
import useServicios from '../hooks/useServicios';

// Función para manejar la carga de imágenes con fallback
const getImageUrl = (imagePath) => {
  try {
    // Si la imagen existe en los assets y comienza con '/'
    if (imagePath && imagePath.startsWith('/')) {
      return imagePath;
    }
    // Si la imagen es una URL completa
    else if (imagePath && (imagePath.startsWith('http://') || imagePath.startsWith('https://'))) {
      return imagePath;
    }
    // En cualquier otro caso, intentar resolver la ruta o devolver null
    return imagePath ? new URL(`../assets/${imagePath}`, import.meta.url).href : null;
  } catch (error) {
    console.error('Error loading image:', error);
    return null;
  }
};

function Empresas() {
  // Obtenemos los servicios de la categoría CAT003
  const { servicios, loading, error } = useServicios('CAT003');
  
  // Estado para manejar la cantidad de cada servicio
  const [serviceCounts, setServiceCounts] = useState({});
  
  // Función para actualizar la cantidad de un servicio específico
  const handleCountChange = (servicioId, newCount) => {
    setServiceCounts(prev => ({
      ...prev,
      [servicioId]: newCount
    }));
  };

  return (
    <div className="empresas-page">
      <h1 className="page-title">Empresas</h1>
      
      {loading ? (
        <p className="loading-message">Cargando servicios...</p>
      ) : error ? (
        <p className="error-message">Error al cargar los servicios: {error}</p>
      ) : servicios.length === 0 ? (
        <p className="no-services-message">No se encontraron servicios en esta categoría</p>
      ) : (
        <div className="services-container">
          {servicios.map(servicio => (
            <ServiceCard 
              key={servicio.id_servicio}
              servicioId={servicio.id_servicio}
              title={servicio.nombre}
              description={servicio.descripcion || 'Con nuestro software de última tecnología generamos un reporte consolidando ventas, compras y retenciones del periodo contratado, cumpliendo con la normativa vigente'}
              image={servicio.imagen}
              count={serviceCounts[servicio.id_servicio] || 1}
              onCountChange={(newCount) => handleCountChange(servicio.id_servicio, newCount)}
              price="$10" // Precio predeterminado, se actualizará según la subcategoría
              detailsPath={`/servicios/${servicio.id_servicio}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default Empresas; 