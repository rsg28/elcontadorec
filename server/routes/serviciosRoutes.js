import express from 'express';
import { 
  getAllServicios, 
  getServicioById, 
  createServicio, 
  updateServicio, 
  deleteServicio, 
  getServiciosByCategoria 
} from '../controllers/serviciosController.js';
import { protect, admin } from '../config/authMiddleware.js';

const router = express.Router();

// Obtener servicios por categoría - DEBE IR ANTES DE LA RUTA CON :id
router.get('/categoria/:id', getServiciosByCategoria);

// Get all services and create a new service
router.route('/')
  .get(getAllServicios)
  .post(protect, admin, createServicio);

// Get, update, and delete service by ID
router.route('/:id')
  .get(protect, getServicioById) //erase the protect later
  .put(protect, admin, updateServicio)
  .delete(admin, deleteServicio);

export default router; 