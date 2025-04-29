import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import ServiciosCategorias from './ServiciosCategorias.js';

const Servicios = sequelize.define('Servicios', {
  id_servicio: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  id_categoria: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: ServiciosCategorias,
      key: 'id_categoria'
    }
  },
  nombre: {
    type: DataTypes.STRING(150),
    allowNull: false
  }
}, {
  tableName: 'servicios',
  timestamps: true
});

// Define relationship
Servicios.belongsTo(ServiciosCategorias, { foreignKey: 'id_categoria' });
ServiciosCategorias.hasMany(Servicios, { foreignKey: 'id_categoria', onDelete: 'CASCADE' });

export default Servicios; 