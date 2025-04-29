import express from 'express';
import userRoutes from './userRoutes.js';
import serviciosRoutes from './serviciosRoutes.js';
import subcategoriasRoutes from './subcategoriasRoutes.js';
import itemsRoutes from './itemsRoutes.js';

const router = express.Router();

// User routes
router.use('/users', userRoutes);

// Servicios routes
router.use('/servicios', serviciosRoutes);

// Subcategorias routes
router.use('/subcategorias', subcategoriasRoutes);

// Items routes
router.use('/items', itemsRoutes);

// Add other routes here
// Example: router.use('/subcategorias', subcategoriasRoutes);

export default router; 