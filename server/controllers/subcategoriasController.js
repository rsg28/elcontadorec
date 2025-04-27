import Subcategorias from '../models/Subcategorias.js';
import Servicios from '../models/Servicios.js';
import PreciosServicios from '../models/PreciosServicios.js';

// @desc    Obtener todas las subcategorías
// @route   GET /api/subcategorias
// @access  Public
export const getAllSubcategorias = async (req, res) => {
  try {
    const subcategorias = await Subcategorias.findAll({
      include: [{
        model: Servicios,
        attributes: ['nombre']
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
        model: Servicios,
        attributes: ['nombre']
      }, {
        model: PreciosServicios,
        attributes: ['precio']
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
    
    const subcategorias = await Subcategorias.findAll({
      where: {
        id_servicio: req.params.id
      },
      include: [
        {
          model: PreciosServicios,
          required: false,
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
    const { id_subcategoria, id_servicio, nombre } = req.body;
    
    // Verificar si la subcategoría ya existe
    const subcategoriaExistente = await Subcategorias.findByPk(id_subcategoria);
    
    if (subcategoriaExistente) {
      return res.status(400).json({ message: 'La subcategoría ya existe' });
    }
    
    // Verificar si el servicio existe
    const servicioExistente = await Servicios.findByPk(id_servicio);
    
    if (!servicioExistente) {
      return res.status(400).json({ message: 'El servicio no existe' });
    }
    
    // Crear subcategoría
    const subcategoria = await Subcategorias.create({
      id_subcategoria,
      id_servicio,
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
    const { nombre, id_servicio } = req.body;
    
    // Buscar subcategoría por ID
    const subcategoria = await Subcategorias.findByPk(req.params.id);
    
    if (!subcategoria) {
      return res.status(404).json({ message: 'Subcategoría no encontrada' });
    }
    
    // Verificar si el servicio existe, si se proporciona
    if (id_servicio) {
      const servicioExistente = await Servicios.findByPk(id_servicio);
      
      if (!servicioExistente) {
        return res.status(400).json({ message: 'El servicio no existe' });
      }
    }
    
    // Actualizar subcategoría
    await subcategoria.update({
      nombre: nombre || subcategoria.nombre,
      id_servicio: id_servicio || subcategoria.id_servicio
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