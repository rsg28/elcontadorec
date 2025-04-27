import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import Servicios from './Servicios.js';

const Subcategorias = sequelize.define('Subcategorias', {
  id_subcategoria: {
    type: DataTypes.STRING(45),
    primaryKey: true,
    allowNull: false
  },
  id_servicio: {
    type: DataTypes.STRING(45),
    allowNull: false,
    references: {
      model: Servicios,
      key: 'id_servicio'
    }
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: true
  }
}, {
  tableName: 'Subcategorias',
  timestamps: false
});

// Define relationship
Subcategorias.belongsTo(Servicios, { foreignKey: 'id_servicio' });
Servicios.hasMany(Subcategorias, { foreignKey: 'id_servicio' });

export default Subcategorias; 