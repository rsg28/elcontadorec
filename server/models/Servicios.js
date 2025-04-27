import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import ServiciosCategorias from './ServiciosCategorias.js';

const Servicios = sequelize.define('Servicios', {
  id_servicio: {
    type: DataTypes.STRING(45),
    primaryKey: true,
    allowNull: false
  },
  id_categoria: {
    type: DataTypes.STRING(45),
    allowNull: false,
    references: {
      model: ServiciosCategorias,
      key: 'id_categoria'
    }
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: true
  }
}, {
  tableName: 'Servicios',
  timestamps: false
});

// Define relationship
Servicios.belongsTo(ServiciosCategorias, { foreignKey: 'id_categoria' });
ServiciosCategorias.hasMany(Servicios, { foreignKey: 'id_categoria' });

export default Servicios; 