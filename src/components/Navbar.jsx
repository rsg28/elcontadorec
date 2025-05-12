import React, { useRef } from 'react';
import { NavLink } from 'react-router-dom';
import useCategorias from '../hooks/useCategorias';

const Navbar = () => {
  const { categorias, loading, error } = useCategorias();
  const listRef = useRef();

  const scroll = (direction) => {
    if (listRef.current) {
      const amount = direction === 'left' ? -150 : 150;
      listRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <nav className="main-nav nav-carousel">
      <button className="nav-arrow left" onClick={() => scroll('left')}>&lt;</button>
      <ul className="nav-list" ref={listRef}>
        {loading && <li className="nav-item">Loading...</li>}
        {error && <li className="nav-item">Error loading categories</li>}
        {!loading && !error && categorias.map(cat => (
          <li className="nav-item" key={cat.id_categoria}>
            <NavLink
              to={`/categoria/${cat.id_categoria}`}
              className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
            >
              {cat.nombre}
            </NavLink>
          </li>
        ))}
      </ul>
      <button className="nav-arrow right" onClick={() => scroll('right')}>&gt;</button>
    </nav>
  );
};

export default Navbar; 