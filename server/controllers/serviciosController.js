import Servicios from '../models/Servicios.js';
import ServiciosCategorias from '../models/ServiciosCategorias.js';
import Subcategorias from '../models/Subcategorias.js';

// @desc    Get all services
// @route   GET /api/servicios
// @access  Public
export const getAllServicios = async (req, res) => {
  try {
    const servicios = await Servicios.findAll({
      include: [
        {
          model: ServiciosCategorias,
          attributes: ['nombre']
        },
        {
          model: Subcategorias,
          attributes: ['id_subcategoria', 'nombre']
        }
      ]
    });
    
    res.json(servicios);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get service by ID
// @route   GET /api/servicios/:id
// @access  Public
export const getServicioById = async (req, res) => {
  try {
    const servicio = await Servicios.findByPk(req.params.id, {
      include: [
        {
          model: ServiciosCategorias,
          attributes: ['nombre']
        },
        {
          model: Subcategorias,
          attributes: ['id_subcategoria', 'nombre']
        }
      ]
    });
    
    if (!servicio) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    res.json(servicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new service
// @route   POST /api/servicios
// @access  Private/Admin
export const createServicio = async (req, res) => {
  try {
    const { id_servicio, id_categoria, nombre } = req.body;
    
    // Check if service already exists
    const servicioExists = await Servicios.findByPk(id_servicio);
    
    if (servicioExists) {
      return res.status(400).json({ message: 'Service already exists' });
    }
    
    // Check if category exists
    const categoriaExists = await ServiciosCategorias.findByPk(id_categoria);
    
    if (!categoriaExists) {
      return res.status(400).json({ message: 'Category does not exist' });
    }
    
    // Create service
    const servicio = await Servicios.create({
      id_servicio,
      id_categoria,
      nombre
    });
    
    res.status(201).json(servicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update a service
// @route   PUT /api/servicios/:id
// @access  Private/Admin
export const updateServicio = async (req, res) => {
  try {
    const { nombre, id_categoria } = req.body;
    
    // Find service by ID
    const servicio = await Servicios.findByPk(req.params.id);
    
    if (!servicio) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Check if category exists if provided
    if (id_categoria) {
      const categoriaExists = await ServiciosCategorias.findByPk(id_categoria);
      
      if (!categoriaExists) {
        return res.status(400).json({ message: 'Category does not exist' });
      }
    }
    
    // Update service
    await servicio.update({
      nombre: nombre || servicio.nombre,
      id_categoria: id_categoria || servicio.id_categoria
    });
    
    res.json(servicio);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete a service
// @route   DELETE /api/servicios/:id
// @access  Private/Admin
export const deleteServicio = async (req, res) => {
  try {
    // Find service by ID
    const servicio = await Servicios.findByPk(req.params.id);
    
    if (!servicio) {
      return res.status(404).json({ message: 'Service not found' });
    }
    
    // Delete service
    await servicio.destroy();
    
    res.json({ message: 'Service deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get servicios by categoria
// @route   GET /api/servicios/categoria/:id
// @access  Public
export const getServiciosByCategoria = async (req, res) => {
  try {
    console.log(`Buscando servicios para la categoría: ${req.params.id}`);
    const servicios = await Servicios.findAll({
      where: {
        id_categoria: req.params.id
      }
    });
    
    console.log(`Servicios encontrados: ${servicios.length}`);
    res.json(servicios);
  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({ 
      message: 'Server Error', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack 
    });
  }
};

// Alias para getAllServicios para evitar duplicación de código
export const getServicios = getAllServicios; 