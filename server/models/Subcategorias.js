import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Subcategorias = sequelize.define('Subcategorias', {
  id_subcategoria: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  }
}, {
  tableName: 'subcategorias',
  timestamps: true
});

export default Subcategorias; 