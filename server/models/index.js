import { sequelize } from '../config/db.js';
import ServiciosCategorias from './ServiciosCategorias.js';
import Servicios from './Servicios.js';
import Subcategorias from './Subcategorias.js';
import Items from './Items.js';
import Usuarios from './Usuarios.js';

// All associations are defined in the individual model files
// This ensures proper loading order and prevents circular dependencies

const models = {
  Usuarios,
  ServiciosCategorias,
  Servicios,
  Subcategorias,
  Items,
  sequelize
};

export default models; 