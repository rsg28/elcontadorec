// Utility functions for filtering and searching items in the admin panel

/**
 * Filter items based on search criteria
 * @param {Array} itemsWithDetails - Array of items to filter
 * @param {Object} filters - Filter criteria object
 * @param {Array} allServicios - Array of all services for category matching
 * @returns {Array} - Filtered items array
 */
export const filterItems = (itemsWithDetails, filters, allServicios) => {
  return itemsWithDetails.filter(item => {
    // If no filters are applied, show all items
    if (filters.searchTerm === '' && filters.minPrice === '' && filters.maxPrice === '' && 
        filters.servicioId === 'all' && filters.categoriaId === 'all') {
      return true;
    }
    
    const searchTermLower = filters.searchTerm.toLowerCase().trim();
    
    // Filter by service name
    const matchesServiceName = item.servicio_nombre?.toLowerCase().includes(searchTermLower);
    
    // Filter by subcategory name
    const matchesSubcategoryName = item.subcategoria_nombre?.toLowerCase().includes(searchTermLower);
    
    // Filter by price
    const price = parseFloat(item.precio || 0);
    const minPrice = filters.minPrice !== '' ? parseFloat(filters.minPrice) : 0;
    const maxPrice = filters.maxPrice !== '' ? parseFloat(filters.maxPrice) : Infinity;
    const matchesPrice = price >= minPrice && price <= maxPrice;
    
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
    const matchesSearch = searchTermLower === '' || 
                         matchesServiceName || 
                         matchesSubcategoryName;
    
    return matchesSearch && matchesPrice && matchesSelectedService && matchesSelectedCategoria;
  });
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
 * @returns {JSX.Element|string} - Highlighted text or original text
 */
export const highlightText = (text, searchTerm) => {
  if (!searchTerm || !searchTerm.trim()) return text;
  
  try {
    const searchTermNormalized = searchTerm.trim();
    // Escape special regex characters
    const escapedSearchTerm = searchTermNormalized.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedSearchTerm})`, 'gi');
    
    // Split into parts but keep the original spacing
    const parts = [];
    let lastIndex = 0;
    let match;
    
    // Using exec to iterate through all matches while preserving positions
    while ((match = regex.exec(text)) !== null) {
      // Add text before this match if exists
      if (match.index > lastIndex) {
        parts.push({
          text: text.substring(lastIndex, match.index),
          highlight: false
        });
      }
      
      // Add the matched text
      parts.push({
        text: match[0], // Use the exact matched text to preserve original case and spacing
        highlight: true
      });
      
      lastIndex = match.index + match[0].length;
    }
    
    // Add any remaining text after the last match
    if (lastIndex < text.length) {
      parts.push({
        text: text.substring(lastIndex),
        highlight: false
      });
    }
    
    // Return the array of parts with proper highlights
    return (
      <>
        {parts.map((part, i) => 
          part.highlight 
            ? <span key={i} className="highlight-text">{part.text}</span> 
            : part.text
        )}
      </>
    );
  } catch (e) {
    // If there's any error with regex or otherwise, return the original text
    console.error("Error highlighting text:", e);
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