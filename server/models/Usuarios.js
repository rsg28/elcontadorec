import { DataTypes } from 'sequelize';
import { sequelize } from '../config/db.js';
import bcrypt from 'bcryptjs';

const Usuarios = sequelize.define('Usuarios', {
  idUsuarios: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false
  },
  nombres: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  apellidos: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  tipo_documento: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  numero_documento: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true
  },
  telefono: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  correo: {
    type: DataTypes.STRING(45),
    allowNull: false
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  isAdmind: {
    type: DataTypes.STRING(3),
    allowNull: false,
    defaultValue: '0'
  }
}, {
  tableName: 'usuarios',
  timestamps: true,
  hooks: {
    beforeCreate: async (usuario) => {
      if (usuario.password) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    },
    beforeUpdate: async (usuario) => {
      if (usuario.changed('password')) {
        const salt = await bcrypt.genSalt(10);
        usuario.password = await bcrypt.hash(usuario.password, salt);
      }
    }
  }
});

// Instance method to check if entered password matches the hashed password
Usuarios.prototype.matchPassword = async function(enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export default Usuarios; 