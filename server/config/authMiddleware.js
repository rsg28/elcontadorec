import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import Usuarios from '../models/Usuarios.js';

dotenv.config();

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Get token from header
      token = req.headers.authorization.split(' ')[1];

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get user from database (without password)
      const usuario = await Usuarios.findByPk(decoded.id, {
        attributes: { exclude: ['password'] }
      });

      if (!usuario) {
        return res.status(401).json({ message: 'User not found' });
      }

      // Add user data to request
      req.user = { 
        id: usuario.idUsuarios,
        isAdmin: usuario.isAdmind === '1'
      };

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  } else if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

export const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
}; 