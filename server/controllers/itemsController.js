import Items from '../models/Items.js';
import Servicios from '../models/Servicios.js';
import Subcategorias from '../models/Subcategorias.js';

// @desc    Get all items
// @route   GET /api/items
// @access  Public
export const getAllItems = async (req, res) => {
  try {
    const items = await Items.findAll({
      include: [
        {
          model: Servicios,
          attributes: ['nombre']
        },
        {
          model: Subcategorias,
          attributes: ['nombre']
        }
      ]
    });
    
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get item by ID
// @route   GET /api/items/:id
// @access  Public
export const getItemById = async (req, res) => {
  try {
    const item = await Items.findByPk(req.params.id, {
      include: [
        {
          model: Servicios,
          attributes: ['nombre']
        },
        {
          model: Subcategorias,
          attributes: ['nombre']
        }
      ]
    });
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    res.json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Create a new item
// @route   POST /api/items
// @access  Private/Admin
export const createItem = async (req, res) => {
  try {
    const { id_servicio, id_subcategoria, precio } = req.body;
    
    // Check if service exists
    const servicioExists = await Servicios.findByPk(id_servicio);
    if (!servicioExists) {
      return res.status(400).json({ message: 'Service does not exist' });
    }
    
    // Check if subcategory exists
    const subcategoriaExists = await Subcategorias.findByPk(id_subcategoria);
    if (!subcategoriaExists) {
      return res.status(400).json({ message: 'Subcategory does not exist' });
    }
    
    // Check if this combination already exists
    const existingItem = await Items.findOne({
      where: {
        id_servicio,
        id_subcategoria
      }
    });
    
    if (existingItem) {
      return res.status(400).json({ 
        message: 'An item with this service and subcategory combination already exists' 
      });
    }
    
    // Create item
    const item = await Items.create({
      id_servicio,
      id_subcategoria,
      precio
    });
    
    res.status(201).json(item);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Update an item
// @route   PUT /api/items/:id
// @access  Private/Admin
export const updateItem = async (req, res) => {
  try {
    const { precio, id_servicio, id_subcategoria } = req.body;
    
    // Find item by ID
    const item = await Items.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Check if service exists if provided
    if (id_servicio) {
      const servicioExists = await Servicios.findByPk(id_servicio);
      if (!servicioExists) {
        return res.status(400).json({ message: 'Service does not exist' });
      }
    }
    
    // Check if subcategory exists if provided
    if (id_subcategoria) {
      const subcategoriaExists = await Subcategorias.findByPk(id_subcategoria);
      if (!subcategoriaExists) {
        return res.status(400).json({ message: 'Subcategory does not exist' });
      }
    }
    
    // If changing service or subcategory, check for duplicates
    if (id_servicio || id_subcategoria) {
      const newServiceId = id_servicio || item.id_servicio;
      const newSubcategoryId = id_subcategoria || item.id_subcategoria;
      
      const existingItem = await Items.findOne({
        where: {
          id_servicio: newServiceId,
          id_subcategoria: newSubcategoryId
        }
      });
      
      if (existingItem && existingItem.id_items !== item.id_items) {
        return res.status(400).json({ 
          message: 'An item with this service and subcategory combination already exists' 
        });
      }
    }
    
    // Update item
    const updatedItem = await item.update({
      precio: precio !== undefined ? precio : item.precio,
      id_servicio: id_servicio || item.id_servicio,
      id_subcategoria: id_subcategoria || item.id_subcategoria
    });
    
    res.json(updatedItem);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Delete an item
// @route   DELETE /api/items/:id
// @access  Private/Admin
export const deleteItem = async (req, res) => {
  try {
    // Find item by ID
    const item = await Items.findByPk(req.params.id);
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Delete item
    await item.destroy();
    
    res.json({ message: 'Item deleted' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get items by service ID
// @route   GET /api/items/servicio/:id
// @access  Public
export const getItemsByServicio = async (req, res) => {
  try {
    const items = await Items.findAll({
      where: {
        id_servicio: req.params.id
      },
      include: [
        {
          model: Subcategorias,
          attributes: ['nombre']
        }
      ]
    });
    
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get items by subcategory ID
// @route   GET /api/items/subcategoria/:id
// @access  Public
export const getItemsBySubcategoria = async (req, res) => {
  try {
    const items = await Items.findAll({
      where: {
        id_subcategoria: req.params.id
      },
      include: [
        {
          model: Servicios,
          attributes: ['nombre']
        }
      ]
    });
    
    res.json(items);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 