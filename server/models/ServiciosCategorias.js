import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const ServiciosCategorias = sequelize.define('Servicios_Categorias', {
  id_categoria: {
    type: DataTypes.STRING(45),
    primaryKey: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: true
  }
}, {
  tableName: 'Servicios_Categorias',
  timestamps: false
});

export default ServiciosCategorias; 