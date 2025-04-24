import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Empresas.css';
import display1Image from '../assets/empresas/display1.jpeg';
import ServiceCard from '../components/ServiceCard';

function Empresas() {
  // Declaraciones mensuales counter state
  const [countDeclaraciones, setCountDeclaraciones] = useState(1);
  
  // Declaraciones IVA counter state
  const [countIVA, setCountIVA] = useState(1);

  return (
    <div className="empresas-page">
      <h1 className="page-title">Empresas</h1>
      
      <ServiceCard 
        title="Declaraciones de Impuestos mensuales"
        description="Con nuestro software de última tecnología generamos un reporte consolidando ventas, compras y retenciones del periodo contratado, cumpliendo con la normativa vigente"
        image={display1Image}
        count={countDeclaraciones}
        onCountChange={setCountDeclaraciones}
        price="$10"
        detailsPath="/declaraciones-mensuales"
      />
      
      <ServiceCard 
        title="Declaraciones IVA Semestral"
        description="Con nuestro software de última tecnología generamos un reporte consolidando ventas, compras y retenciones del periodo contratado, cumpliendo con la normativa vigente"
        image={null} // No image for this service
        count={countIVA}
        onCountChange={setCountIVA}
        price="$10"
        detailsPath="/declaraciones-iva-semestral" // We'll implement this route later
      />
    </div>
  );
}

export default Empresas; 