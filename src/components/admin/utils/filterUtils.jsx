// Utility functions for filtering and searching items in the admin panel

/**
 * Normalize text by removing accents and diacritics
 * @param {string} text - Text to normalize
 * @returns {string} - Normalized text without accents
 */
const normalizeText = (text) => {
  if (!text || typeof text !== 'string') return '';
  
  return text
    .normalize('NFD') // Decompose characters into base + diacritical marks
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritical marks
    .toLowerCase()
    .trim();
};

/**
 * Filter items based on search criteria
 * @param {Array} itemsWithDetails - Array of items to filter
 * @param {Object} filters - Filter criteria object
 * @param {Array} allServicios - Array of all services for category matching
 * @returns {Array} - Filtered items array
 */
export const filterItems = (itemsWithDetails, filters, allServicios) => {
  try {
    // Validate inputs
    if (!Array.isArray(itemsWithDetails)) {
      console.error('filterItems: itemsWithDetails is not an array');
      return [];
    }
    
    if (!filters || typeof filters !== 'object') {
      console.error('filterItems: filters is not a valid object');
      return itemsWithDetails;
    }
    
    if (!Array.isArray(allServicios)) {
      console.error('filterItems: allServicios is not an array');
      return itemsWithDetails;
    }

    return itemsWithDetails.filter(item => {
      try {
        // If no filters are applied, show all items
        if (filters.searchTerm === '' && filters.minPrice === '' && filters.maxPrice === '' && 
            filters.servicioId === 'all' && filters.categoriaId === 'all') {
          return true;
        }
        
        const searchTermNormalized = normalizeText(filters.searchTerm || '');
        
        // Filter by service name (normalized)
        const matchesServiceName = item.servicio_nombre ? 
          normalizeText(item.servicio_nombre).includes(searchTermNormalized) : false;
        
        // Filter by subcategory name (normalized)
        const matchesSubcategoryName = item.subcategoria_nombre ? 
          normalizeText(item.subcategoria_nombre).includes(searchTermNormalized) : false;
        
        // Filter by price
        const price = parseFloat(item.precio || 0);
        const minPrice = filters.minPrice !== '' ? parseFloat(filters.minPrice) : 0;
        const maxPrice = filters.maxPrice !== '' ? parseFloat(filters.maxPrice) : Infinity;
        const matchesPrice = !isNaN(price) && price >= minPrice && price <= maxPrice;
        
        // Filter by selected service
        const matchesSelectedService = filters.servicioId === 'all' || 
                                      item.id_servicio === parseInt(filters.servicioId);
        
        // Filter by selected categoria
        let matchesSelectedCategoria = true;
        if (filters.categoriaId !== 'all') {
          // Find the service for this item
          const service = allServicios.find(s => s.id_servicio === item.id_servicio);
          // Check if the service's categoria matches the selected one
          matchesSelectedCategoria = service && service.id_categoria === parseInt(filters.categoriaId);
        }
        
        // Combine all filters
        const matchesSearch = searchTermNormalized === '' || 
                             matchesServiceName || 
                             matchesSubcategoryName;
        
        return matchesSearch && matchesPrice && matchesSelectedService && matchesSelectedCategoria;
      } catch (itemError) {
        console.error('Error filtering individual item:', itemError, item);
        return true; // Include item in results if there's an error
      }
    });
  } catch (error) {
    console.error('Error in filterItems function:', error);
    return itemsWithDetails || [];
  }
};

/**
 * Check if any filter is active
 * @param {Object} filters - Filter criteria object
 * @returns {boolean} - True if any filter is active
 */
export const isFilterActive = (filters) => {
  return filters.searchTerm !== '' || 
         filters.minPrice !== '' || 
         filters.maxPrice !== '' || 
         filters.servicioId !== 'all' ||
         filters.categoriaId !== 'all';
};

/**
 * Highlight text in search results
 * @param {string} text - Text to highlight
 * @param {string} searchTerm - Search term to highlight
 * @param {Object} styles - CSS modules styles object (optional)
 * @returns {JSX.Element|string} - Highlighted text or original text
 */
export const highlightText = (text, searchTerm, styles = null) => {
  // Handle edge cases
  if (!text || typeof text !== 'string') return text || '';
  if (!searchTerm || typeof searchTerm !== 'string' || !searchTerm.trim()) return text;
  
  try {
    const searchTermNormalized = normalizeText(searchTerm);
    if (searchTermNormalized.length === 0) return text;
    
    // Use CSS modules class if styles object is provided, otherwise use global class
    const highlightClass = styles ? styles['highlight-text'] : 'highlight-text';
    
    // Find matches by comparing normalized versions but keep original text
    const textNormalized = normalizeText(text);
    const parts = [];
    let lastIndex = 0;
    
    // Find all occurrences of the search term in the normalized text
    let searchIndex = textNormalized.indexOf(searchTermNormalized);
    while (searchIndex !== -1) {
      // Add text before the match
      if (searchIndex > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, searchIndex),
          highlight: false
        });
      }
      
      // Add the matched text (from original text to preserve formatting)
      parts.push({
        text: text.substring(searchIndex, searchIndex + searchTermNormalized.length),
        highlight: true
      });
      
      lastIndex = searchIndex + searchTermNormalized.length;
      searchIndex = textNormalized.indexOf(searchTermNormalized, lastIndex);
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        highlight: false
      });
    }
    
    // If no matches found, return original text
    if (parts.length === 0) return text;
    
    // Build the result array
    return (
      <>
        {parts.map((part, index) => {
          if (part.highlight) {
            return <span key={index} className={highlightClass}>{part.text}</span>;
          }
          return part.text;
        })}
      </>
    );
  } catch (error) {
    // If there's any error, return the original text
    console.error("Error highlighting text:", error);
    return text;
  }
};

/**
 * Format price with 2 decimal places
 * @param {number|string} price - Price to format
 * @returns {string} - Formatted price
 */
export const formatPrice = (price) => {
  return parseFloat(price || 0).toFixed(2);
}; 