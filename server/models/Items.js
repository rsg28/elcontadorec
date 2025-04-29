import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Servicios from './Servicios.js';
import Subcategorias from './Subcategorias.js';

const Items = sequelize.define('Items', {
  id_items: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_servicio: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Servicios,
      key: 'id_servicio'
    }
  },
  id_subcategoria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Subcategorias,
      key: 'id_subcategoria'
    }
  },
  precio: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
}, {
  tableName: 'items',
  timestamps: true
});

// Define relationships
Items.belongsTo(Servicios, { foreignKey: 'id_servicio' });
Items.belongsTo(Subcategorias, { foreignKey: 'id_subcategoria' });
Servicios.hasMany(Items, { foreignKey: 'id_servicio' });
Subcategorias.hasMany(Items, { foreignKey: 'id_subcategoria' });

export default Items; 