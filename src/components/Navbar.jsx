import React from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faShoppingCart } from '@fortawesome/free-solid-svg-icons';

const Navbar = () => {
  return (
    <nav className="main-nav">
      <ul className="nav-list">
        <li className="nav-item"><Link to="/">Personas</Link></li>
        <li className="nav-item"><Link to="/empresas">Empresas</Link></li>
        <li className="nav-item"><Link to="/auditoria-externa">Auditoría Externa</Link></li>
        <li className="nav-item"><Link to="/legales">Legales</Link></li>
        <li className="nav-item"><Link to="/devolucion-impuestos">Devolución Impuestos</Link></li>
        <li className="nav-item"><Link to="/supercias">Supercias</Link></li>
        <li className="nav-item"><Link to="/iess-mit">IESS y MIT</Link></li>
        <li className="nav-item"><Link to="/planes">Planes</Link></li>
        <li className="nav-item cart-item">
          <Link to="/carrito">
            <FontAwesomeIcon icon={faShoppingCart} /> Carrito
          </Link>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar; 