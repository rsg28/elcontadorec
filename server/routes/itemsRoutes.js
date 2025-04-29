import express from 'express';
import {
  getAllItems,
  getItemById,
  createItem,
  updateItem,
  deleteItem,
  getItemsByServicio,
  getItemsBySubcategoria
} from '../controllers/itemsController.js';
import { protect, admin } from '../config/authMiddleware.js';

const router = express.Router();

// Get all items or create a new item
router.route('/')
  .get(getAllItems)
  .post(protect, admin, createItem);

// Get items by service
router.route('/servicio/:id')
  .get(getItemsByServicio);

// Get items by subcategory
router.route('/subcategoria/:id')
  .get(getItemsBySubcategoria);

// Get, update, or delete a specific item
router.route('/:id')
  .get(getItemById)
  .put(protect, admin, updateItem)
  .delete(protect, admin, deleteItem);

export default router; 