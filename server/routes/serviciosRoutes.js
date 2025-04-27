import express from 'express';
import { 
  getAllServicios, 
  getServicioById, 
  createServicio, 
  updateServicio, 
  deleteServicio 
} from '../controllers/serviciosController.js';
import { protect, admin } from '../config/authMiddleware.js';

const router = express.Router();

// Get all services and create a new service
router.route('/')
  .get(getAllServicios)
  .post(protect, admin, createServicio);

// Get, update, and delete service by ID
router.route('/:id')
  .get(getServicioById)
  .put(protect, admin, updateServicio)
  .delete(protect, admin, deleteServicio);

export default router; 