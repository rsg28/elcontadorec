import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import './index.css';
// Import FontAwesome components
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faUser, 
  faShoppingCart, 
  faSearch, 
  faUserTie, 
  faBuilding, 
  faFileAlt, 
  faBalanceScale, 
  faMoneyCheckAlt, 
  faIdCard, 
  faPlusCircle,
  faMapMarkerAlt,
  faPhone,
  faEnvelope,
  faClock,
  faFax,
  faGlobe,
  faChevronRight,
  faChevronLeft,
  faCalculator,
  faSignInAlt,
  faUserPlus,
  faSignOutAlt,
  faCircle
} from '@fortawesome/free-solid-svg-icons';
// Import logo
import fullLogoImage from './assets/EL CONTADOR TEXTO A LA DERECHA.png';
// Import pages

import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import ThankYou from './pages/ThankYou';
import CategoriaPage from './pages/CategoriaPage';
import Carrito from './pages/Carrito';
import Perfil from './pages/Perfil';
import ServicioPage from './pages/ServicioPage';
// Import components
import Navbar from './components/Navbar';
// Import hooks
import useAuth from './hooks/useAuth';

// Home component for the landing page
const Home = () => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const maxPages = 2; // Total number of pages in carousel
  
  // Helper to determine if buttons should be visible
  const isPrevButtonVisible = currentPage > 0;

  // Handler for category card clicks
  const handleCategoryClick = (categoryId) => {
    navigate(`/categoria/${categoryId}`);
  };

  // Category data
  const categories = [
    { id: 1, title: 'Auditoría Externa', icon: faFileAlt, color: '#00b9f2' },
    { id: 2, title: 'Devolución de impuestos', icon: faMoneyCheckAlt, color: '#3d7eac' },
    { id: 3, title: 'Empresas', icon: faBuilding, color: '#3d7eac' },
    { id: 4, title: 'Firma Electrónica', icon: faIdCard, color: '#00b9f2' },
    { id: 5, title: 'IESS y MT', icon: faFileAlt, color: '#4d9de0' },
    { id: 6, title: 'Legales', icon: faBalanceScale, color: '#4d9de0' },
    { id: 7, title: 'Personas', icon: faUser, color: '#4d9de0' },
    { id: 8, title: 'Planes Empresas', icon: faBuilding, color: '#4d9de0' },
    { id: 9, title: 'Planes Personas', icon: faUser, color: '#3d7eac' },
    { id: 10, title: 'Supercias', icon: faUserTie, color: '#00b9f2' }
  ];

  // Improved navigation handlers with transition effect
  const handleNextPage = () => {
    if (!isTransitioning && currentPage < maxPages - 1) {
      setIsTransitioning(true);
      setCurrentPage(prev => prev + 1);
      setTimeout(() => setIsTransitioning(false), 500); // Match transition time in CSS
    }
  };

  const handlePrevPage = () => {
    if (!isTransitioning && currentPage > 0) {
      setIsTransitioning(true);
      setCurrentPage(prev => prev - 1);
      setTimeout(() => setIsTransitioning(false), 500); // Match transition time in CSS
    }
  };

  return (
    <main className="main-content">
      <section className="categories-section">
        <h2 className="section-title">Todas las Categorías</h2>
        
        <div className="categories-container">
          {isPrevButtonVisible && (
            <button 
              className="carousel-button prev" 
              onClick={handlePrevPage}
              aria-label="Categorías anteriores"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
          )}
          
          <div className="categories-grid" style={{ transform: `translateX(-${currentPage * 41}%)` }}>
            {categories.map(category => (
              <div 
                key={category.id} 
                className="category-card" 
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="category-icon" style={{ backgroundColor: category.color }}>
                  <FontAwesomeIcon icon={category.icon} />
                </div>
                <h3 className="category-title">{category.title}</h3>
              </div>
            ))}
          </div>
          
          <div className="carousel-dots">
            {Array.from({ length: maxPages }).map((_, index) => (
              <button 
                key={index}
                className={`carousel-dot ${currentPage === index ? 'active' : ''}`}
                onClick={() => {
                  if (!isTransitioning && currentPage !== index) {
                    setIsTransitioning(true);
                    setCurrentPage(index);
                    setTimeout(() => setIsTransitioning(false), 500);
                  }
                }}
                aria-label={`Ir a página ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      
    </main>
  );
};

// NavbarWrapper component to conditionally render the navbar
const NavbarWrapper = () => {
  const location = useLocation();
  // Only show navbar if we're not on the homepage, login, register, or thank-you page
  const excludePaths = ['/', '/login', '/register', '/thank-you'];
  return !excludePaths.includes(location.pathname) && <Navbar />;
};

// Header component with authentication awareness
const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isUserLoggedIn, setIsUserLoggedIn] = useState(false);
  
  // Check authentication status when component mounts and when auth state changes
  useEffect(() => {
    // Check for auth token directly to ensure we catch the latest state
    const authToken = localStorage.getItem('authToken');
    const userObj = localStorage.getItem('user');
    
    // If we have both token and user data, consider user logged in
    setIsUserLoggedIn(!!authToken && !!userObj);
  }, [isAuthenticated, user, location.pathname]); // Re-run when location changes (after registration redirect)
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  // Force true on thank-you page since we know user just registered
  const forceAuthenticated = location.pathname === '/thank-you' || isUserLoggedIn;
  
  return (
    <header className="header">
      <div className="logo-container">
        <Link to="/">
          <img src={fullLogoImage} alt="El Contador EC" className="full-logo" />
        </Link>
      </div>
      <div className="search-container">
        <input type="text" placeholder="Busca en nuestro contenido..." className="search-input" />
        <button className="search-button">
          <FontAwesomeIcon icon={faSearch} className="search-icon" />
        </button>
      </div>
      <div className="user-actions">
        {forceAuthenticated ? (
          <div className="user-actions-row">
            <Link to="/carrito" className="orders-link">
              <span>Mis órdenes</span>
              <FontAwesomeIcon icon={faShoppingCart} className="cart-icon" />
            </Link>
            <span className="user-divider">|</span>
            <Link to="/perfil" className="user-greeting">
              <span>Hola,</span>
              <span className="user-name">{user?.nombres?.split(' ')[0] || 'Jefferson'}</span>
              <span className="user-avatar">
                <FontAwesomeIcon icon={faUser} />
              </span>
            </Link>
            <button onClick={handleLogout} className="logout-link" title="Salir">
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </div>
        ) : (
          <>
            <Link to="/login" className="user-button">
              <div className="button-content">
                <FontAwesomeIcon icon={faSignInAlt} className="user-icon" />
                <span>Ingresar</span>
              </div>
            </Link>
            <Link to="/register" className="register-button">
              <div className="button-content">
                <FontAwesomeIcon icon={faUserPlus} className="register-icon" />
                <span>Registrarse</span>
              </div>
            </Link>
          </>
        )}
      </div>
    </header>
  );
};

function App() {
  return (
    <Router>
      <div className="app">
        <Header />
        
        <NavbarWrapper />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/categoria/:categoriaId" element={<CategoriaPage />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/register" element={<Register />} />
          <Route path="/thank-you" element={<ThankYou />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/login" element={<Login />} />
          <Route path="/servicio/:id_servicio" element={<ServicioPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <footer className="footer">
          <div className="footer-top-wave"></div>
          <div className="footer-content">
            <div className="footer-column footer-about">
              <div className="footer-logo">
                <img src={fullLogoImage} alt="El Contador EC" className="logo-small" />
              </div>
              <p className="footer-description">
                Somos expertos en servicios contables y tributarios, ofreciendo soluciones personalizadas para individuos y empresas en Ecuador.
              </p>
              <div className="footer-social">
                <a href="#" className="social-icon facebook"><i className="fab fa-facebook-f"></i></a>
                <a href="#" className="social-icon twitter"><i className="fab fa-twitter"></i></a>
                <a href="#" className="social-icon instagram"><i className="fab fa-instagram"></i></a>
                <a href="#" className="social-icon linkedin"><i className="fab fa-linkedin-in"></i></a>
              </div>
            </div>
            
            <div className="footer-column footer-links">
              <h4 className="footer-title">Enlaces Rápidos</h4>
              <ul>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/">Inicio</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/servicios">Servicios</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/nosotros">Nosotros</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/planes">Planes y Precios</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/faq">Preguntas Frecuentes</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/contacto">Contacto</Link>
                </li>
              </ul>
            </div>
            
            <div className="footer-column footer-services">
              <h4 className="footer-title">Nuestros Servicios</h4>
              <ul>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/categoria/2">Declaraciones Mensuales</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/categoria/2">Declaraciones Anuales</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/categoria/1">Impuesto a la Renta</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/categoria/5">Devoluciones SRI</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/categoria/3">Auditoría Externa</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/categoria/4">Servicios Legales</Link>
                </li>
              </ul>
            </div>
            
            <div className="footer-column footer-contact">
              <h4 className="footer-title">Contáctanos</h4>
              <div className="contact-info">
                <p>
                  <FontAwesomeIcon icon={faMapMarkerAlt} className="contact-icon" />
                  <span>Quito, Ecuador</span>
                </p>
                <p>
                  <FontAwesomeIcon icon={faPhone} className="contact-icon" />
                  <span>+593 98 765 4321</span>
                </p>
                <p>
                  <FontAwesomeIcon icon={faEnvelope} className="contact-icon" />
                  <span>info@elcontadorec.com</span>
                </p>
                <p>
                  <FontAwesomeIcon icon={faClock} className="contact-icon" />
                  <span>Lun - Vie: 9:00 - 17:00</span>
                </p>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <div className="copyright">
              &copy; {new Date().getFullYear()} El Contador EC. Todos los derechos reservados.
            </div>
            <div className="footer-bottom-links">
              <Link to="/terminos">Términos y Condiciones</Link>
              <Link to="/privacidad">Política de Privacidad</Link>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
