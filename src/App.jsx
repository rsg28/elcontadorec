import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
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
import Empresas from './pages/Empresas';
import DeclaracionesDetalles from './pages/DeclaracionesDetalles';
import Perfil from './pages/Perfil';
import Carrito from './pages/Carrito';
import Personas from './pages/Personas';
import AuditoriaExterna from './pages/AuditoriaExterna';
import Legales from './pages/Legales';
import DevolucionImpuestos from './pages/DevolucionImpuestos';
import Supercias from './pages/Supercias';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import ThankYou from './pages/ThankYou';
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
  const isNextButtonVisible = currentPage < maxPages - 1;

  // Handler for category card clicks
  const handleCategoryClick = (categoryId) => {
    switch(categoryId) {
      case 1: // Personas
        navigate('/personas');
        break;
      case 2: // Empresas
        navigate('/empresas');
        break;
      case 3: // Auditoría Externa
        navigate('/auditoria-externa');
        break;
      case 4: // Legales
        navigate('/legales');
        break;
      case 5: // Devolución Impuestos
        navigate('/devolucion-impuestos');
        break;
      case 6: // Supercias
        navigate('/supercias');
        break;
      case 7: // Planes Empresas
        navigate('/planes-empresas');
        break;
      case 8: // Planes Personas
        navigate('/planes-personas');
        break;
      case 9: // Firma Electrónica
        navigate('/firma-electronica');
        break;
      case 10: // IESS y MT
        navigate('/iess-mt');
        break;
      default:
        navigate('/');
    }
  };

  // Category data
  const categories = [
    { id: 1, title: 'Personas', icon: faUser, color: '#4d9de0' },
    { id: 2, title: 'Empresas', icon: faBuilding, color: '#3d7eac' },
    { id: 3, title: 'Auditoría Externa', icon: faFileAlt, color: '#00b9f2' },
    { id: 4, title: 'Legales', icon: faBalanceScale, color: '#4d9de0' },
    { id: 5, title: 'Devolución Impuestos', icon: faMoneyCheckAlt, color: '#3d7eac' },
    { id: 6, title: 'Supercias', icon: faUserTie, color: '#00b9f2' },
    { id: 7, title: 'Planes Empresas', icon: faBuilding, color: '#4d9de0' },
    { id: 8, title: 'Planes Personas', icon: faUser, color: '#3d7eac' },
    { id: 9, title: 'Firma Electrónica', icon: faIdCard, color: '#00b9f2' },
    { id: 10, title: 'IESS y MT', icon: faFileAlt, color: '#4d9de0' }
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
                style={{ borderColor: category.color }}
                onClick={() => handleCategoryClick(category.id)}
              >
                <div className="category-icon" style={{ backgroundColor: category.color }}>
                  <FontAwesomeIcon icon={category.icon} />
                </div>
                <h3 className="category-title">{category.title}</h3>
                <div className="category-overlay">
                  <button className="category-button">
                    <FontAwesomeIcon icon={faPlusCircle} />
                    <span>Ver más</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {isNextButtonVisible && (
            <button 
              className="carousel-button next" 
              onClick={handleNextPage}
              aria-label="Categorías siguientes"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          )}
          
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

      <section className="featured-services">
        <h2 className="section-title">Servicios Destacados</h2>
        <div className="featured-grid">
          <div className="featured-card">
            <div className="featured-icon">
              <FontAwesomeIcon icon={faCalculator} />
            </div>
            <h3>Declaraciones Mensuales</h3>
            <p>Mantén al día tus obligaciones fiscales mensuales con nuestro servicio profesional.</p>
            <Link to="/empresas" className="featured-link">
              Ver detalles
              <FontAwesomeIcon icon={faChevronRight} className="featured-arrow" />
            </Link>
          </div>
          
          <div className="featured-card">
            <div className="featured-icon">
              <FontAwesomeIcon icon={faUser} />
            </div>
            <h3>Declaración de Impuesto a la Renta</h3>
            <p>Optimiza tu declaración anual y maximiza las deducciones legales posibles.</p>
            <Link to="/personas" className="featured-link">
              Ver detalles
              <FontAwesomeIcon icon={faChevronRight} className="featured-arrow" />
            </Link>
          </div>
          
          <div className="featured-card">
            <div className="featured-icon">
              <FontAwesomeIcon icon={faMoneyCheckAlt} />
            </div>
            <h3>Devolución de Impuestos</h3>
            <p>Recupera los valores pagados en exceso con nuestro servicio especializado.</p>
            <Link to="/devolucion-impuestos" className="featured-link">
              Ver detalles
              <FontAwesomeIcon icon={faChevronRight} className="featured-arrow" />
            </Link>
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
          <>
            <Link to="/perfil" className="user-button">
              <div className="button-content">
                <FontAwesomeIcon icon={faUser} className="user-icon" />
                <span>{user?.nombres?.split(' ')[0] || 'Perfil'}</span>
              </div>
            </Link>
            <Link to="/carrito" className="cart-button">
              <div className="button-content">
                <FontAwesomeIcon icon={faShoppingCart} className="cart-icon" />
                <span>Carrito</span>
              </div>
            </Link>
            <button onClick={handleLogout} className="logout-button">
              <div className="button-content">
                <FontAwesomeIcon icon={faSignOutAlt} className="logout-icon" />
                <span>Salir</span>
              </div>
            </button>
          </>
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
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/personas" element={<Personas />} />
          <Route path="/auditoria-externa" element={<AuditoriaExterna />} />
          <Route path="/legales" element={<Legales />} />
          <Route path="/devolucion-impuestos" element={<DevolucionImpuestos />} />
          <Route path="/supercias" element={<Supercias />} />
          <Route path="/declaraciones-mensuales" element={<DeclaracionesDetalles />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/carrito" element={<Carrito />} />
          <Route path="/admin-panel" element={<AdminPanel />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/thank-you" element={<ThankYou />} />
          {/* Add more routes for other pages as they are created */}
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
                  <Link to="/empresas">Declaraciones Mensuales</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/empresas">Declaraciones Anuales</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/personas">Impuesto a la Renta</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/devolucion-impuestos">Devoluciones SRI</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/auditoria-externa">Auditoría Externa</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/legales">Servicios Legales</Link>
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
