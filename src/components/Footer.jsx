import React from 'react';
import logoSmall from '../assets/logo-small.png';
import { FaFacebookF, FaTwitter, FaInstagram, FaLinkedinIn, FaMapMarkerAlt, FaPhone, FaEnvelope, FaClock, FaAngleRight } from 'react-icons/fa';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="footer">
      <div className="footer-top-wave"></div>
      <div className="footer-content">
        <div className="footer-column footer-about">
          <div className="footer-logo">
            <img src={logoSmall} alt="El Contador EC Logo" className="logo-small" />
          </div>
          <p className="footer-description">
            Brindamos servicios contables profesionales y personalizados para empresas y personas naturales. Nuestra misión es simplificar la contabilidad con soluciones eficientes y confiables.
          </p>
          <div className="footer-social">
            <a href="https://facebook.com" className="social-icon" target="_blank" rel="noopener noreferrer">
              <FaFacebookF />
            </a>
            <a href="https://twitter.com" className="social-icon" target="_blank" rel="noopener noreferrer">
              <FaTwitter />
            </a>
            <a href="https://instagram.com" className="social-icon" target="_blank" rel="noopener noreferrer">
              <FaInstagram />
            </a>
            <a href="https://linkedin.com" className="social-icon" target="_blank" rel="noopener noreferrer">
              <FaLinkedinIn />
            </a>
          </div>
        </div>
        
        <div className="footer-column footer-links">
          <h3 className="footer-title">Enlaces Rápidos</h3>
          <ul>
            <li>
              <FaAngleRight className="footer-icon" />
              <a href="/">Inicio</a>
            </li>
            <li>
              <FaAngleRight className="footer-icon" />
              <a href="/nosotros">Sobre Nosotros</a>
            </li>
            <li>
              <FaAngleRight className="footer-icon" />
              <a href="/servicios">Servicios</a>
            </li>
            <li>
              <FaAngleRight className="footer-icon" />
              <a href="/blog">Blog</a>
            </li>
            <li>
              <FaAngleRight className="footer-icon" />
              <a href="/contacto">Contacto</a>
            </li>
          </ul>
        </div>
        
        <div className="footer-column footer-services">
          <h3 className="footer-title">Nuestros Servicios</h3>
          <ul>
            <li>
              <FaAngleRight className="footer-icon" />
              <a href="/servicios/contabilidad">Contabilidad Empresarial</a>
            </li>
            <li>
              <FaAngleRight className="footer-icon" />
              <a href="/servicios/declaraciones">Declaraciones Tributarias</a>
            </li>
            <li>
              <FaAngleRight className="footer-icon" />
              <a href="/servicios/asesoria">Asesoría Fiscal</a>
            </li>
            <li>
              <FaAngleRight className="footer-icon" />
              <a href="/servicios/nomina">Gestión de Nómina</a>
            </li>
            <li>
              <FaAngleRight className="footer-icon" />
              <a href="/servicios/consultoria">Consultoría Financiera</a>
            </li>
          </ul>
        </div>
        
        <div className="footer-column footer-contact">
          <h3 className="footer-title">Contáctanos</h3>
          <div className="contact-item">
            <FaMapMarkerAlt className="footer-icon" />
            <p>Av. Francisco de Orellana y Juan Tanca Marengo, Guayaquil, Ecuador</p>
          </div>
          <div className="contact-item">
            <FaPhone className="footer-icon" />
            <p>+593 98 765 4321</p>
          </div>
          <div className="contact-item">
            <FaEnvelope className="footer-icon" />
            <p>info@elcontadorec.com</p>
          </div>
          <div className="contact-item">
            <FaClock className="footer-icon" />
            <p>Lunes - Viernes: 8:30 AM - 5:30 PM</p>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; {currentYear} El Contador EC. Todos los derechos reservados.</p>
        <div className="footer-bottom-links">
          <a href="/terminos">Términos y Condiciones</a>
          <a href="/privacidad">Política de Privacidad</a>
          <a href="/cookies">Política de Cookies</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 