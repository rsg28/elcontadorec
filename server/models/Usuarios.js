import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';

const Usuarios = sequelize.define('Usuarios', {
  idUsuarios: {
    type: DataTypes.STRING(45),
    primaryKey: true,
    allowNull: false
  },
  tipo_documento: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  numero_documento: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nombre_apellidos: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  telefono: {
    type: DataTypes.STRING(45),
    allowNull: true
  },
  correo: {
    type: DataTypes.STRING(45),
    allowNull: true
  }
}, {
  tableName: 'Usuarios',
  timestamps: false
});

export default Usuarios; 