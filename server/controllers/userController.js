import jwt from 'jsonwebtoken';
import Usuarios from '../models/Usuarios.js';

// Generate JWT token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: '30d', // Revisar tiempo de expiracion adecuado (practica recomendada)
  });
};

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
export const registerUser = async (req, res) => {
  try {
    const { nombres, apellidos, tipo_documento, numero_documento, telefono, correo, password } = req.body;

    // Check if user exists
    const userExists = await Usuarios.findOne({ where: { correo } });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create user
    const usuario = await Usuarios.create({
      nombres,
      apellidos,
      tipo_documento,
      numero_documento,
      telefono,
      correo,
      password,
      isAdmind: '0'
    });

    if (usuario) {
      res.status(201).json({
        id: usuario.idUsuarios,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        isAdmin: usuario.isAdmind === '1',
        token: generateToken(usuario.idUsuarios),
      });
    } else {
      res.status(400).json({ message: 'Invalid user data' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Auth user & get token
// @route   POST /api/users/login
// @access  Public
export const authUser = async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Check for user email
    const usuario = await Usuarios.findOne({ where: { correo } });

    if (usuario && (await usuario.matchPassword(password))) {
      res.json({
        id: usuario.idUsuarios,
        nombres: usuario.nombres,
        apellidos: usuario.apellidos,
        correo: usuario.correo,
        isAdmin: usuario.isAdmind === '1',
        token: generateToken(usuario.idUsuarios),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const usuario = await Usuarios.findByPk(req.user.id, {
      attributes: { exclude: ['password'] }
    });

    if (!usuario) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(usuario);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
}; 