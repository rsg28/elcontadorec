import { sequelize } from '../config/db.js';
import User from './userModel.js';
import ServiciosCategorias from './ServiciosCategorias.js';
import Servicios from './Servicios.js';
import Subcategorias from './Subcategorias.js';
import PreciosServicios from './PreciosServicios.js';
import Usuarios from './Usuarios.js';

// All associations are defined in the individual model files
// This ensures proper loading order and prevents circular dependencies

const models = {
  User,
  ServiciosCategorias,
  Servicios,
  Subcategorias,
  PreciosServicios,
  Usuarios,
  sequelize
};

export default models; 