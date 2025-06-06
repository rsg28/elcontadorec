import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLink, faSearch, faTimes, faSave, faSpinner, 
  faExclamationTriangle, faListAlt, faServer,
  faCheckCircle, faInfoCircle, faChevronDown, faUnlink,
  faToggleOn, faToggleOff, faTrash
} from '@fortawesome/free-solid-svg-icons';
import styles from '../../../pages/AdminPanel.module.css';
import { commonIcons } from '../utils/commonIcons.jsx';

const AssignCaracteristicaModal = ({ show, onClose, onSave, onUnlink, allServicios, allCaracteristicas }) => {
  const [mode, setMode] = useState('assign'); // 'assign' or 'unlink'
  const [formData, setFormData] = useState({
    servicioId: '',
    caracteristicaId: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Autocomplete states for services
  const [servicioInput, setServicioInput] = useState('');
  const [servicioSuggestions, setServicioSuggestions] = useState([]);
  const [showServicioSuggestions, setShowServicioSuggestions] = useState(false);
  const [selectedServicioIndex, setSelectedServicioIndex] = useState(-1);
  
  // Autocomplete states for characteristics
  const [caracteristicaInput, setCaracteristicaInput] = useState('');
  const [caracteristicaSuggestions, setCaracteristicaSuggestions] = useState([]);
  const [showCaracteristicaSuggestions, setShowCaracteristicaSuggestions] = useState(false);
  const [selectedCaracteristicaIndex, setSelectedCaracteristicaIndex] = useState(-1);
  
  // Refs for managing focus and clicks
  const servicioInputRef = useRef(null);
  const caracteristicaInputRef = useRef(null);
  const servicioSuggestionsRef = useRef(null);
  const caracteristicaSuggestionsRef = useRef(null);

  // Filter services based on input
  useEffect(() => {
    if (!allServicios || !servicioInput.trim()) {
      setServicioSuggestions([]);
      return;
    }

    const filtered = allServicios.filter(servicio =>
      servicio.nombre.toLowerCase().includes(servicioInput.toLowerCase())
    ).slice(0, 1); // Limit suggestions to 1 item
    
    setServicioSuggestions(filtered);
    setSelectedServicioIndex(-1);
  }, [allServicios, servicioInput]);

  // Filter characteristics based on input and mode
  useEffect(() => {
    if (!allCaracteristicas || !caracteristicaInput.trim()) {
      setCaracteristicaSuggestions([]);
      return;
    }

    let filtered = [];
    
    if (mode === 'assign') {
      // For assign mode, show all characteristics
      filtered = allCaracteristicas.filter(caracteristica =>
        caracteristica.nombre.toLowerCase().includes(caracteristicaInput.toLowerCase()) ||
        (caracteristica.descripcion && caracteristica.descripcion.toLowerCase().includes(caracteristicaInput.toLowerCase()))
      );
    } else if (mode === 'unlink' && formData.servicioId) {
      // For unlink mode, only show characteristics assigned to the selected service
      const selectedServicio = allServicios?.find(s => s.id_servicio === parseInt(formData.servicioId));
      const servicioCaracteristicas = selectedServicio?.caracteristicas || selectedServicio?.Caracteristicas || [];
      
      console.log('Filtering for unlink mode:');
      console.log('Selected servicio:', selectedServicio);
      console.log('Servicio características:', servicioCaracteristicas);
      console.log('Search input:', caracteristicaInput);
      
      if (servicioCaracteristicas && servicioCaracteristicas.length > 0) {
        const assignedCaracteristicas = servicioCaracteristicas.filter(caracteristica =>
          caracteristica.nombre.toLowerCase().includes(caracteristicaInput.toLowerCase()) ||
          (caracteristica.descripcion && caracteristica.descripcion.toLowerCase().includes(caracteristicaInput.toLowerCase()))
        );
        console.log('Filtered assigned características:', assignedCaracteristicas);
        filtered = assignedCaracteristicas;
      } else {
        console.log('No características found for this servicio');
        filtered = [];
      }
    }
    
    console.log('Final filtered características:', filtered);
    setCaracteristicaSuggestions(filtered.slice(0, 1)); // Limit suggestions to 1 item
    setSelectedCaracteristicaIndex(-1);
  }, [allCaracteristicas, caracteristicaInput, mode, formData.servicioId, allServicios]);

  // Reset form when modal opens/closes or mode changes
  useEffect(() => {
    if (show) {
      setFormData({
        servicioId: '',
        caracteristicaId: ''
      });
      setError('');
      setServicioInput('');
      setCaracteristicaInput('');
      setShowServicioSuggestions(false);
      setShowCaracteristicaSuggestions(false);
      setSelectedServicioIndex(-1);
      setSelectedCaracteristicaIndex(-1);
    }
  }, [show]);

  // Reset characteristic selection when mode changes
  useEffect(() => {
    setFormData(prev => ({ ...prev, caracteristicaId: '' }));
    setCaracteristicaInput('');
    setError('');
  }, [mode]);

  // Handle clicks outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (servicioSuggestionsRef.current && !servicioSuggestionsRef.current.contains(event.target) &&
          servicioInputRef.current && !servicioInputRef.current.contains(event.target)) {
        setShowServicioSuggestions(false);
      }
      
      if (caracteristicaSuggestionsRef.current && !caracteristicaSuggestionsRef.current.contains(event.target) &&
          caracteristicaInputRef.current && !caracteristicaInputRef.current.contains(event.target)) {
        setShowCaracteristicaSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get icon component from string name
  const getIconComponent = (iconName) => {
    const iconData = commonIcons.find(item => item.name === iconName);
    return iconData ? iconData.icon : commonIcons[0].icon;
  };

  // Get selected service and characteristic details
  const selectedServicio = allServicios?.find(s => s.id_servicio === parseInt(formData.servicioId));
  
  // Debug logging
  useEffect(() => {
    if (selectedServicio) {
      console.log('Selected servicio:', selectedServicio);
      console.log('Servicio características (caracteristicas):', selectedServicio.caracteristicas);
      console.log('Servicio características (Caracteristicas):', selectedServicio.Caracteristicas);
      console.log('Mode:', mode);
    }
  }, [selectedServicio, mode]);
  
  const selectedCaracteristica = allCaracteristicas?.find(c => c.id_caracteristicas === parseInt(formData.caracteristicaId));

  // Get características from servicio (handle both possible property names)
  const servicioCaracteristicas = selectedServicio?.caracteristicas || selectedServicio?.Caracteristicas || [];

  // Check if the characteristic is already assigned to the selected service
  const isAlreadyAssigned = selectedServicio && selectedCaracteristica && 
    servicioCaracteristicas?.some(c => c.id_caracteristicas === selectedCaracteristica.id_caracteristicas);

  // For unlink mode, check if characteristic is actually assigned
  const canUnlink = mode === 'unlink' && selectedServicio && selectedCaracteristica &&
    servicioCaracteristicas?.some(c => c.id_caracteristicas === selectedCaracteristica.id_caracteristicas);

  // Handle service input change
  const handleServicioInputChange = (e) => {
    const value = e.target.value;
    setServicioInput(value);
    setShowServicioSuggestions(true);
    
    // Clear selection if input doesn't match selected service
    if (selectedServicio && !selectedServicio.nombre.toLowerCase().includes(value.toLowerCase())) {
      setFormData(prev => ({ ...prev, servicioId: '' }));
    }
    setError('');
  };

  // Handle characteristic input change
  const handleCaracteristicaInputChange = (e) => {
    const value = e.target.value;
    setCaracteristicaInput(value);
    setShowCaracteristicaSuggestions(true);
    
    // Clear selection if input doesn't match selected characteristic
    if (selectedCaracteristica && !selectedCaracteristica.nombre.toLowerCase().includes(value.toLowerCase())) {
      setFormData(prev => ({ ...prev, caracteristicaId: '' }));
    }
    setError('');
  };

  // Handle service selection
  const handleServicioSelect = (servicio) => {
    setServicioInput(servicio.nombre);
    setFormData(prev => ({ ...prev, servicioId: servicio.id_servicio }));
    setShowServicioSuggestions(false);
    setError('');
  };

  // Handle characteristic selection
  const handleCaracteristicaSelect = (caracteristica) => {
    setCaracteristicaInput(caracteristica.nombre);
    setFormData(prev => ({ ...prev, caracteristicaId: caracteristica.id_caracteristicas }));
    setShowCaracteristicaSuggestions(false);
    setError('');
  };

  // Handle keyboard navigation for services
  const handleServicioKeyDown = (e) => {
    if (!showServicioSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedServicioIndex(prev => 
          prev < servicioSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedServicioIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedServicioIndex >= 0 && servicioSuggestions[selectedServicioIndex]) {
          handleServicioSelect(servicioSuggestions[selectedServicioIndex]);
        }
        break;
      case 'Escape':
        setShowServicioSuggestions(false);
        setSelectedServicioIndex(-1);
        break;
    }
  };

  // Handle keyboard navigation for characteristics
  const handleCaracteristicaKeyDown = (e) => {
    if (!showCaracteristicaSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedCaracteristicaIndex(prev => 
          prev < caracteristicaSuggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedCaracteristicaIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedCaracteristicaIndex >= 0 && caracteristicaSuggestions[selectedCaracteristicaIndex]) {
          handleCaracteristicaSelect(caracteristicaSuggestions[selectedCaracteristicaIndex]);
        }
        break;
      case 'Escape':
        setShowCaracteristicaSuggestions(false);
        setSelectedCaracteristicaIndex(-1);
        break;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.servicioId) {
      setError('Debe seleccionar un servicio');
      return;
    }

    if (!formData.caracteristicaId) {
      setError('Debe seleccionar una característica');
      return;
    }

    if (mode === 'assign' && isAlreadyAssigned) {
      setError('Esta característica ya está asignada al servicio seleccionado');
      return;
    }

    if (mode === 'unlink' && !canUnlink) {
      setError('Esta característica no está asignada al servicio seleccionado');
      return;
    }

    setIsLoading(true);
    try {
      if (mode === 'assign') {
        await onSave(parseInt(formData.servicioId), parseInt(formData.caracteristicaId));
      } else {
        await onUnlink(parseInt(formData.servicioId), parseInt(formData.caracteristicaId));
      }
    } catch (error) {
      console.error(`Error ${mode === 'assign' ? 'assigning' : 'unlinking'} caracteristica:`, error);
      setError(`Error al ${mode === 'assign' ? 'asignar' : 'desasignar'} la característica`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && !isLoading && !showServicioSuggestions && !showCaracteristicaSuggestions) {
      onClose();
    }
  };

  useEffect(() => {
    if (show) {
      document.addEventListener('keydown', handleKeyDown);
    }
    
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [show, isLoading, showServicioSuggestions, showCaracteristicaSuggestions]);

  if (!show) return null;
  
  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-content']} style={{ maxWidth: '650px', display: 'flex', flexDirection: 'column' }}>
        <div className={styles['modal-header']}>
          <h2>
            <FontAwesomeIcon icon={mode === 'assign' ? faLink : faUnlink} className={styles['modal-header-icon']} />
            {mode === 'assign' ? 'Asignar' : 'Desasignar'} Característica {mode === 'assign' ? 'a' : 'de'} Servicio
          </h2>
          <button className={styles['close-button']} onClick={onClose} aria-label="Cerrar" disabled={isLoading}>×</button>
        </div>
        
        {/* Mode Toggle */}
        <div style={{ 
          padding: '20px 30px 10px', 
          borderBottom: '1px solid #eee',
          backgroundColor: '#f8f9fa'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', justifyContent: 'center' }}>
            <button
              type="button"
              onClick={() => setMode('assign')}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: mode === 'assign' ? '2px solid #28a745' : '2px solid #ddd',
                backgroundColor: mode === 'assign' ? '#28a745' : 'white',
                color: mode === 'assign' ? 'white' : '#666',
                fontWeight: '600',
                fontSize: '15px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}
            >
              <FontAwesomeIcon icon={faLink} />
              Asignar
            </button>
            <button
              type="button"
              onClick={() => setMode('unlink')}
              disabled={isLoading}
              style={{
                padding: '12px 24px',
                borderRadius: '8px',
                border: mode === 'unlink' ? '2px solid #dc3545' : '2px solid #ddd',
                backgroundColor: mode === 'unlink' ? '#dc3545' : 'white',
                color: mode === 'unlink' ? 'white' : '#666',
                fontWeight: '600',
                fontSize: '15px',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                transition: 'all 0.2s ease'
              }}
            >
              <FontAwesomeIcon icon={faUnlink} />
              Desasignar
            </button>
          </div>
          <div style={{ 
            textAlign: 'center', 
            marginTop: '15px', 
            fontSize: '14px', 
            color: '#666',
            fontStyle: 'italic'
          }}>
            {mode === 'assign' 
              ? 'Seleccione un servicio y una característica para asignar'
              : 'Seleccione un servicio y una característica asignada para desasignar'
            }
          </div>
        </div>
        
        <div className={styles['modal-body']} style={{ padding: '30px', paddingBottom: '20px', flex: 1 }}>
          {/* Service Selection with Autocomplete */}
          <div className={styles['form-group']} style={{ marginBottom: '35px' }}>
            <label className={styles['form-label']} style={{ marginBottom: '14px', fontSize: '16px', fontWeight: '600' }}>
              <FontAwesomeIcon icon={faServer} className={styles['field-icon']} />
              Seleccionar Servicio <span className={styles['required-mark']}>*</span>
            </label>
            
            <div className={styles['form-control-wrapper']} style={{ position: 'relative', marginBottom: '15px' }}>
              <div style={{ position: 'relative' }} ref={servicioInputRef}>
                <input
                  type="text"
                  placeholder="Escriba para buscar un servicio..."
                  value={servicioInput}
                  onChange={handleServicioInputChange}
                  onKeyDown={handleServicioKeyDown}
                  onFocus={() => {
                    if (servicioSuggestions.length > 0) {
                      setShowServicioSuggestions(true);
                    }
                  }}
                  className={`${styles['form-control']} ${error && !formData.servicioId ? styles['error-input'] : ''}`}
                  disabled={isLoading}
                  autoComplete="off"
                  style={{ height: '50px', fontSize: '16px', padding: '12px 50px 12px 16px' }}
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  style={{ 
                    position: 'absolute', 
                    right: '18px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#999',
                    fontSize: '18px',
                    pointerEvents: 'none'
                  }} 
                />
              </div>
              
              {/* Service Suggestions */}
              {showServicioSuggestions && servicioSuggestions.length > 0 && (
                <div 
                  ref={servicioSuggestionsRef}
                  style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderTop: 'none',
                    borderRadius: '0 0 8px 8px',
                    maxHeight: '280px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 8px 16px rgba(0,0,0,0.15)'
                  }}
                >
                  {servicioSuggestions.map((servicio, index) => (
                    <div
                      key={servicio.id_servicio}
                      onClick={() => handleServicioSelect(servicio)}
                      style={{
                        padding: '18px 20px',
                        cursor: 'pointer',
                        backgroundColor: index === selectedServicioIndex ? '#f0f0f0' : 'white',
                        borderBottom: index < servicioSuggestions.length - 1 ? '1px solid #eee' : 'none'
                      }}
                      onMouseEnter={() => setSelectedServicioIndex(index)}
                    >
                      <div style={{ fontWeight: '600', marginBottom: '8px', fontSize: '16px' }}>
                        {servicio.nombre}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Show current characteristics for selected service */}
            {selectedServicio && selectedServicio.caracteristicas && selectedServicio.caracteristicas.length > 0 && (
              <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px', border: '1px solid #e9ecef' }}>
                <div style={{ fontSize: '14px', color: '#666', marginBottom: '14px', fontWeight: '600' }}>
                  Características actuales del servicio:
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                  {selectedServicio.caracteristicas.map(caract => (
                    <div key={caract.id_caracteristicas} className={styles['caracteristica-tag']} style={{ fontSize: '13px', padding: '8px 12px' }}>
                      <div 
                        className={styles['caracteristica-icon-container']} 
                        style={{ 
                          backgroundColor: caract.color || '#4285F4',
                          width: '24px',
                          height: '24px'
                        }}
                      >
                        <FontAwesomeIcon 
                          icon={getIconComponent(caract.imagen)} 
                          style={{ fontSize: '12px', color: 'white' }}
                        />
                      </div>
                      <span>{caract.nombre}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Characteristic Selection with Autocomplete */}
          <div className={styles['form-group']} style={{ marginBottom: '35px' }}>
            <label className={styles['form-label']} style={{ marginBottom: '14px', fontSize: '16px', fontWeight: '600' }}>
              <FontAwesomeIcon icon={faListAlt} className={styles['field-icon']} />
              Seleccionar Característica <span className={styles['required-mark']}>*</span>
            </label>
            
            <div className={styles['form-control-wrapper']} style={{ position: 'relative' }}>
              <div style={{ position: 'relative' }} ref={caracteristicaInputRef}>
                <input
                  type="text"
                  placeholder="Escriba para buscar una característica..."
                  value={caracteristicaInput}
                  onChange={handleCaracteristicaInputChange}
                  onKeyDown={handleCaracteristicaKeyDown}
                  onFocus={() => {
                    if (caracteristicaSuggestions.length > 0) {
                      setShowCaracteristicaSuggestions(true);
                    }
                  }}
                  className={`${styles['form-control']} ${error && !formData.caracteristicaId ? styles['error-input'] : ''}`}
                  disabled={isLoading}
                  autoComplete="off"
                  style={{ height: '50px', fontSize: '16px', padding: '12px 50px 12px 16px' }}
                />
                <FontAwesomeIcon 
                  icon={faSearch} 
                  style={{ 
                    position: 'absolute', 
                    right: '18px', 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    color: '#999',
                    fontSize: '18px',
                    pointerEvents: 'none'
                  }} 
                />
              </div>
              
              {/* Characteristic Suggestions */}
              {showCaracteristicaSuggestions && caracteristicaSuggestions.length > 0 && (
                <div 
                  ref={caracteristicaSuggestionsRef}
                  style={{
                    position: 'absolute',
                    bottom: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderBottom: 'none',
                    borderRadius: '8px 8px 0 0',
                    maxHeight: '300px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 -8px 16px rgba(0,0,0,0.15)'
                  }}
                >
                  {caracteristicaSuggestions.map((caracteristica, index) => (
                    <div
                      key={caracteristica.id_caracteristicas}
                      onClick={() => handleCaracteristicaSelect(caracteristica)}
                      style={{
                        padding: '18px 20px',
                        cursor: 'pointer',
                        backgroundColor: index === selectedCaracteristicaIndex ? '#f0f0f0' : 'white',
                        borderBottom: index < caracteristicaSuggestions.length - 1 ? '1px solid #eee' : 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px'
                      }}
                      onMouseEnter={() => setSelectedCaracteristicaIndex(index)}
                    >
                      <div 
                        className={styles['caracteristica-icon-container']} 
                        style={{ 
                          backgroundColor: caracteristica.color || '#4285F4',
                          width: '40px',
                          height: '40px'
                        }}
                      >
                        <FontAwesomeIcon 
                          icon={getIconComponent(caracteristica.imagen)} 
                          style={{ fontSize: '18px', color: 'white' }}
                        />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '600', marginBottom: '6px', fontSize: '16px' }}>
                          {caracteristica.nombre}
                        </div>
                        <div style={{ fontSize: '14px', color: '#666', lineHeight: '1.4' }}>
                          {caracteristica.descripcion || 'Sin descripción'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Preview of selected characteristic */}
          {selectedCaracteristica && (
            <div className={styles['form-group']} style={{ marginBottom: '30px' }}>
              <label className={styles['form-label']} style={{ marginBottom: '14px', fontSize: '16px', fontWeight: '600' }}>
                Vista Previa de la {mode === 'assign' ? 'Asignación' : 'Desasignación'}
              </label>
              <div style={{ 
                padding: '25px', 
                backgroundColor: '#f8f9fa', 
                borderRadius: '10px',
                border: mode === 'assign' 
                  ? `3px solid ${isAlreadyAssigned ? '#dc3545' : '#28a745'}`
                  : '3px solid #dc3545',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                  <div 
                    className={styles['caracteristica-icon-container']} 
                    style={{ 
                      backgroundColor: selectedCaracteristica.color || '#4285F4',
                      width: '60px',
                      height: '60px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                    }}
                  >
                    <FontAwesomeIcon 
                      icon={getIconComponent(selectedCaracteristica.imagen)} 
                      style={{ fontSize: '26px', color: 'white' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 style={{ margin: '0 0 8px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
                      {selectedCaracteristica.nombre}
                    </h4>
                    <p style={{ margin: '0 0 12px 0', color: '#666', fontSize: '15px', lineHeight: '1.5' }}>
                      {selectedCaracteristica.descripcion || 'Sin descripción'}
                    </p>
                    {selectedServicio && (
                      <div style={{ fontSize: '14px', color: '#555', padding: '8px 12px', backgroundColor: '#fff', borderRadius: '6px', border: '1px solid #e9ecef' }}>
                        <strong>Servicio:</strong> {selectedServicio.nombre}
                      </div>
                    )}
                  </div>
                  <div>
                    {mode === 'assign' ? (
                      isAlreadyAssigned ? (
                        <div style={{ color: '#dc3545', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                          <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
                          Ya asignada
                        </div>
                      ) : (
                        <div style={{ color: '#28a745', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                          <FontAwesomeIcon icon={faCheckCircle} size="lg" />
                          Disponible
                        </div>
                      )
                    ) : (
                      canUnlink ? (
                        <div style={{ color: '#dc3545', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                          <FontAwesomeIcon icon={faTrash} size="lg" />
                          Desasignar
                        </div>
                      ) : (
                        <div style={{ color: '#6c757d', fontSize: '16px', display: 'flex', alignItems: 'center', gap: '10px', fontWeight: '600' }}>
                          <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
                          No asignada
                        </div>
                      )
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className={styles['error-message']} style={{ marginBottom: '25px', padding: '16px 20px', fontSize: '15px', borderRadius: '8px' }}>
              <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '10px' }} />
              {error}
            </div>
          )}

          {/* Info about assignment */}
          {(!allServicios || allServicios.length === 0) && (
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#e3f2fd', 
              border: '1px solid #2196f3', 
              borderRadius: '8px',
              color: '#1976d2',
              marginBottom: '25px',
              fontSize: '15px'
            }}>
              <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '12px' }} />
              No hay servicios disponibles para asignar características.
            </div>
          )}

          {(!allCaracteristicas || allCaracteristicas.length === 0) && (
            <div style={{ 
              padding: '20px', 
              backgroundColor: '#fff3e0', 
              border: '1px solid #ff9800', 
              borderRadius: '8px',
              color: '#f57c00',
              marginBottom: '25px',
              fontSize: '15px'
            }}>
              <FontAwesomeIcon icon={faInfoCircle} style={{ marginRight: '12px' }} />
              No hay características disponibles. Crear características primero.
            </div>
          )}
        </div>
        
        {/* Action Buttons - ALWAYS VISIBLE */}
        <div style={{ 
          padding: '25px 30px', 
          borderTop: '1px solid #eee',
          backgroundColor: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '15px',
          flexShrink: 0
        }}>
          <button 
            type="button" 
            onClick={onClose}
            disabled={isLoading}
            style={{ 
              padding: '14px 28px', 
              fontSize: '16px', 
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: '#6c757d',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: isLoading ? 'not-allowed' : 'pointer'
            }}
          >
            <FontAwesomeIcon icon={faTimes} style={{ marginRight: '10px' }} />
            Cancelar
          </button>
          <button 
            type="button"
            onClick={handleSubmit}
            disabled={
              isLoading || 
              !formData.servicioId || 
              !formData.caracteristicaId || 
              (mode === 'assign' && isAlreadyAssigned) ||
              (mode === 'unlink' && !canUnlink) ||
              !!error
            }
            style={{ 
              padding: '14px 28px', 
              fontSize: '16px', 
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              backgroundColor: (isLoading || !formData.servicioId || !formData.caracteristicaId || (mode === 'assign' && isAlreadyAssigned) || (mode === 'unlink' && !canUnlink) || !!error) 
                ? '#dc3545' 
                : (mode === 'assign' ? '#28a745' : '#dc3545'),
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              opacity: (isLoading || !formData.servicioId || !formData.caracteristicaId || (mode === 'assign' && isAlreadyAssigned) || (mode === 'unlink' && !canUnlink) || !!error) ? 0.7 : 1,
              cursor: (isLoading || !formData.servicioId || !formData.caracteristicaId || (mode === 'assign' && isAlreadyAssigned) || (mode === 'unlink' && !canUnlink) || !!error) ? 'not-allowed' : 'pointer'
            }}
            title={
              mode === 'assign' ? (
                isAlreadyAssigned ? 'Esta característica ya está asignada al servicio seleccionado' :
                !formData.servicioId ? 'Seleccione un servicio primero' :
                !formData.caracteristicaId ? 'Seleccione una característica primero' :
                error ? error :
                'Hacer clic para asignar la característica al servicio'
              ) : (
                !canUnlink ? 'Esta característica no está asignada al servicio seleccionado' :
                !formData.servicioId ? 'Seleccione un servicio primero' :
                !formData.caracteristicaId ? 'Seleccione una característica primero' :
                error ? error :
                'Hacer clic para desasignar la característica del servicio'
              )
            }
          >
            {isLoading ? (
              <>
                <FontAwesomeIcon icon={faSpinner} spin style={{ marginRight: '10px' }} />
                {mode === 'assign' ? 'Asignando...' : 'Desasignando...'}
              </>
            ) : mode === 'assign' ? (
              isAlreadyAssigned ? (
                <>
                  <FontAwesomeIcon icon={faExclamationTriangle} style={{ marginRight: '10px' }} />
                  Ya Asignada
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faSave} style={{ marginRight: '10px' }} />
                  Asignar Característica
                </>
              )
            ) : (
              <>
                <FontAwesomeIcon icon={faUnlink} style={{ marginRight: '10px' }} />
                Desasignar Característica
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignCaracteristicaModal; 