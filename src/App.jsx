import React from 'react';
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
  faChevronRight
} from '@fortawesome/free-solid-svg-icons';
// Import logo
import fullLogoImage from './assets/EL CONTADOR TEXTO A LA DERECHA.png';
// Import pages
import Empresas from './pages/Empresas';
import DeclaracionesDetalles from './pages/DeclaracionesDetalles';
import Perfil from './pages/Perfil';
import Carrito from './pages/Carrito';
// Import components
import Navbar from './components/Navbar';

// Home component for the landing page
const Home = () => {
  const navigate = useNavigate();

  // Handler for category card clicks
  const handleCategoryClick = (categoryId) => {
    switch(categoryId) {
      case 1: // Personas
        navigate('/');
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
    { id: 6, title: 'Supercias', icon: faUserTie, color: '#00b9f2' }
  ];

  return (
    <main className="main-content">
      <section className="categories-section">
        <h2 className="section-title">Todas las Categorías</h2>
        
        <div className="categories-grid">
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
      </section>
    </main>
  );
};

// NavbarWrapper component to conditionally render the navbar
const NavbarWrapper = () => {
  const location = useLocation();
  // Only show navbar if we're not on the homepage
  return location.pathname !== '/' && <Navbar />;
};

function App() {
  return (
    <Router>
      <div className="app">
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
            <Link to="/perfil" className="user-button">
              <div className="button-content">
                <FontAwesomeIcon icon={faUser} className="user-icon" />
                <span>Perfil</span>
              </div>
            </Link>
            <Link to="/carrito" className="cart-button">
              <div className="button-content">
                <FontAwesomeIcon icon={faShoppingCart} className="cart-icon" />
                <span>Carrito</span>
              </div>
            </Link>
          </div>
        </header>
        
        <NavbarWrapper />
        
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/empresas" element={<Empresas />} />
          <Route path="/declaraciones-mensuales" element={<DeclaracionesDetalles />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/carrito" element={<Carrito />} />
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
                  <Link to="/empresas">Declaraciones de IVA</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/auditoria-externa">Auditoría Externa</Link>
                </li>
                <li>
                  <FontAwesomeIcon icon={faChevronRight} className="footer-icon" />
                  <Link to="/devolucion-impuestos">Devolución de Impuestos</Link>
                </li>
              </ul>
            </div>
            
            <div className="footer-column footer-contact">
              <h4 className="footer-title">Contáctenos</h4>
              <div className="contact-item">
                <FontAwesomeIcon icon={faMapMarkerAlt} className="footer-icon" />
                <p>Av. Principal 123, Quito, Ecuador</p>
              </div>
              <div className="contact-item">
                <FontAwesomeIcon icon={faPhone} className="footer-icon" />
                <p>+593 98 765 4321</p>
              </div>
              <div className="contact-item">
                <FontAwesomeIcon icon={faEnvelope} className="footer-icon" />
                <p>info@elcontadorec.com</p>
              </div>
              <div className="contact-item">
                <FontAwesomeIcon icon={faClock} className="footer-icon" />
                <p>Lun - Vie: 9:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; {new Date().getFullYear()} El Contador EC. Todos los derechos reservados.</p>
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
