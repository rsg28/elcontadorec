import express from 'express';
import {
  getAllSubcategorias,
  getSubcategoriaById,
  getSubcategoriasByServicio,
  createSubcategoria,
  updateSubcategoria,
  deleteSubcategoria
} from '../controllers/subcategoriasController.js';
import { protect, admin } from '../config/authMiddleware.js';

const router = express.Router();

// Obtener subcategorías por servicio
router.get('/servicio/:id', getSubcategoriasByServicio);

// Obtener todas las subcategorías y crear una nueva
router.route('/')
  .get(getAllSubcategorias)
  .post(protect, admin, createSubcategoria);

// Obtener, actualizar y eliminar subcategoría por ID
router.route('/:id')
  .get(getSubcategoriaById)
  .put(protect, admin, updateSubcategoria)
  .delete(protect, admin, deleteSubcategoria);

export default router; 