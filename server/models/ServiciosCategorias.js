import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const ServiciosCategorias = sequelize.define('Servicios_Categorias', {
  id_categoria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(45),
    allowNull: false
  }
}, {
  tableName: 'servicios_categorias',
  timestamps: true
});

export default ServiciosCategorias; 