import React, { useRef, useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import useCategorias from '../hooks/useCategorias';

const Navbar = () => {
  const { categorias, loading, error } = useCategorias();
  const listRef = useRef();
  const [showArrows, setShowArrows] = useState(false);

  useEffect(() => {
    const checkOverflow = () => {
      if (listRef.current) {
        setShowArrows(listRef.current.scrollWidth > listRef.current.clientWidth);
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [categorias]);

  const scroll = (direction) => {
    if (listRef.current) {
      const amount = direction === 'left' ? -150 : 150;
      listRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    }
  };

  return (
    <nav className="main-nav nav-flat nav-fixed-height">
      {showArrows && (
      <button className="nav-arrow left" onClick={() => scroll('left')}>&lt;</button>
      )}
      <ul className="nav-list nav-flat-list nav-centered-list" ref={listRef}>
        {loading && <li className="nav-item">Loading...</li>}
        {error && <li className="nav-item">Error loading categories</li>}
        {!loading && !error && categorias.map(cat => (
          <li className="nav-item" key={cat.id_categoria}>
            <NavLink
              to={`/categoria/${cat.id_categoria}`}
              className={({ isActive }) => 'nav-link nav-flat-link' + (isActive ? ' active' : '')}
            >
              {cat.nombre}
            </NavLink>
          </li>
        ))}
      </ul>
      {showArrows && (
      <button className="nav-arrow right" onClick={() => scroll('right')}>&gt;</button>
      )}
    </nav>
  );
};

export default Navbar; 