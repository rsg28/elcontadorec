import Subcategorias from '../models/Subcategorias.js';
import Servicios from '../models/Servicios.js';
import Items from '../models/Items.js';

// @desc    Obtener todas las subcategorías
// @route   GET /api/subcategorias
// @access  Public
export const getAllSubcategorias = async (req, res) => {
  try {
    const subcategorias = await Subcategorias.findAll({
      include: [{
        model: Items,
        include: [{
          model: Servicios,
          attributes: ['nombre']
        }]
      }]
    });
    
    res.json(subcategorias);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Obtener subcategoría por ID
// @route   GET /api/subcategorias/:id
// @access  Public
export const getSubcategoriaById = async (req, res) => {
  try {
    const subcategoria = await Subcategorias.findByPk(req.params.id, {
      include: [{
        model: Items,
        include: [{
          model: Servicios,
          attributes: ['nombre']
        }]
      }]
    });
    
    if (!subcategoria) {
      return res.status(404).json({ message: 'Subcategoría no encontrada' });
    }
    
    res.json(subcategoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Obtener subcategorías por servicio
// @route   GET /api/subcategorias/servicio/:id
// @access  Public
export const getSubcategoriasByServicio = async (req, res) => {
  try {
    console.log(`Buscando subcategorías para el servicio con ID: ${req.params.id}`);
    
    // Find all subcategories that have an item with the specified service ID
    const subcategorias = await Subcategorias.findAll({
      include: [
        {
          model: Items,
          required: true,
          where: {
            id_servicio: req.params.id
          },
          attributes: ['precio']
        }
      ]
    });
    
    console.log(`Subcategorías encontradas: ${subcategorias.length}`);
    if (subcategorias.length > 0) {
      console.log('Primera subcategoría:', JSON.stringify(subcategorias[0], null, 2));
    }
    
    res.json(subcategorias);
  } catch (error) {
    console.error('Error al obtener subcategorías:', error);
    res.status(500).json({ 
      message: 'Error del servidor', 
      error: error.message,
      stack: process.env.NODE_ENV === 'production' ? '🥞' : error.stack
    });
  }
};

// @desc    Crear una subcategoría
// @route   POST /api/subcategorias
// @access  Private/Admin
export const createSubcategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    
    // Crear subcategoría
    const subcategoria = await Subcategorias.create({
      nombre
    });
    
    res.status(201).json(subcategoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Actualizar una subcategoría
// @route   PUT /api/subcategorias/:id
// @access  Private/Admin
export const updateSubcategoria = async (req, res) => {
  try {
    const { nombre } = req.body;
    
    // Buscar subcategoría por ID
    const subcategoria = await Subcategorias.findByPk(req.params.id);
    
    if (!subcategoria) {
      return res.status(404).json({ message: 'Subcategoría no encontrada' });
    }
    
    // Actualizar subcategoría
    await subcategoria.update({
      nombre: nombre || subcategoria.nombre
    });
    
    res.json(subcategoria);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
};

// @desc    Eliminar una subcategoría
// @route   DELETE /api/subcategorias/:id
// @access  Private/Admin
export const deleteSubcategoria = async (req, res) => {
  try {
    // Buscar subcategoría por ID
    const subcategoria = await Subcategorias.findByPk(req.params.id);
    
    if (!subcategoria) {
      return res.status(404).json({ message: 'Subcategoría no encontrada' });
    }
    
    // Eliminar subcategoría
    await subcategoria.destroy();
    
    res.json({ message: 'Subcategoría eliminada' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error del servidor' });
  }
}; 