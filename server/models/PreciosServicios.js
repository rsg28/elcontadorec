import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Servicios from './Servicios.js';
import Subcategorias from './Subcategorias.js';

const PreciosServicios = sequelize.define('PreciosServicios', {
  id_subcategoria: {
    type: DataTypes.STRING(45),
    primaryKey: true,
    allowNull: false,
    references: {
      model: Subcategorias,
      key: 'id_subcategoria'
    }
  },
  id_servicio: {
    type: DataTypes.STRING(45),
    primaryKey: true,
    allowNull: false,
    references: {
      model: Servicios,
      key: 'id_servicio'
    }
  },
  precio: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'PreciosServicios',
  timestamps: false
});

// Define relationships
PreciosServicios.belongsTo(Subcategorias, { foreignKey: 'id_subcategoria' });
PreciosServicios.belongsTo(Servicios, { foreignKey: 'id_servicio' });
Subcategorias.hasMany(PreciosServicios, { foreignKey: 'id_subcategoria' });
Servicios.hasMany(PreciosServicios, { foreignKey: 'id_servicio' });

export default PreciosServicios; 