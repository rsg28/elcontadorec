import React, { useEffect, useRef, useState } from 'react';

const TokenizationForm = () => {
  // Refs
  const scriptRef = useRef(null);
  const submitBtnRef = useRef(null);
  const newCardBtnRef = useRef(null);
  const responseRef = useRef(null);
  const cancelBtnRef = useRef(null);
  const tokenizeContainerRef = useRef(null);

  // State management
  const [state, setState] = useState({
    loaded: false,
    paymentGateway: null,
    responseText: '',
    ui: {
      showSubmitBtn: false,
      showNewCardBtn: true,
      showCancelBtn: false,
      isSubmitBtnDisabled: true,
      isNewCardBtnDisabled: false,
      isCancelBtnDisabled: true
    }
  });

  // Configuration
  const CONFIG = {
    environment: 'stg',
    application_code: 'TESTECUADORSTG-EC-CLIENT',
    application_key: 'd4pUmVHgVpw2mJ66rWwtfWaO2bAWV6'
  };

  // Load Paymentez script
  const loadScript = async () => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paymentez.com/ccapi/sdk/payment_sdk_stable.min.js';
    script.async = true;
    script.type = 'text/javascript';
    script.charset = 'UTF-8';
    
    script.onload = () => {
      console.log('Paymentez script loaded');
      setState(prev => ({ ...prev, loaded: true }));
    };
    
    script.onerror = () => console.error('Failed to load Paymentez script.');
    
    document.body.appendChild(script);
    scriptRef.current = script;
  };

  // Get tokenization data
  const getTokenizeData = () => ({
    locale: 'es',
    user: {
      //add real user ID and email
      id: String(Math.floor(new Date().getTime() / 1000)),
      email: 'jhon@doe.com',
    },
    configuration: {
      default_country: 'COL',
    },
  });

  // Callback handlers
  const handleNotCompletedForm = (message) => {
    setState(prev => ({
      ...prev,
      responseText: 'Por favor complete el formulario',
      ui: {
        ...prev.ui,
        isSubmitBtnDisabled: false
      }
    }));
    
    if (submitBtnRef.current) {
      submitBtnRef.current.innerText = "Guardar tarjeta";
    }
  };

  const handleTokenizationResponse = (response) => {
    const status = response.card.status;
    console.log("Tokenization status:", status);
    
    if (status === 'valid') {
      alert("Tarjeta guardada correctamente");
    } else if (status === "review") {
      console.log("Tarjeta en revisión");
      alert("Tarjeta en revisión");
    } else {
      alert('Error al procesar la tarjeta. Intente nuevamente.');
    }
    
    removeTokenizationForm();
  };

  // Initialize payment gateway
  useEffect(() => {   
    if (!state.loaded || state.paymentGateway !== null) return;
       
    const pg = new PaymentGateway(
      CONFIG.environment,
      CONFIG.application_code,
      CONFIG.application_key
    );
    
    setState(prev => ({ ...prev, paymentGateway: pg }));
  }, [state.loaded, state.paymentGateway]);

  // Button click handlers
  const handleSubmitClick = async (e) => {
    e.preventDefault();
    setState(prev => ({
      ...prev,
      responseText: '',
      ui: { ...prev.ui, isSubmitBtnDisabled: true }
    }));

    if (submitBtnRef.current) {
      submitBtnRef.current.innerText = 'Procesando...';
    }
    
    if (state.paymentGateway) {
      try {
        await state.paymentGateway.tokenize();
        console.log("Tokenization successful");
      } catch (error) {
        console.error('Tokenization error:', error);
        setState(prev => ({
          ...prev,
          responseText: error.message || 'Error al procesar la tarjeta. Intente nuevamente.',
          ui: { ...prev.ui, isSubmitBtnDisabled: false }
        }));
        
        if (submitBtnRef.current) {
          submitBtnRef.current.innerText = 'Guardar tarjeta';
        }
      }
    }
  };

  const handleNewCardClick = () => {
    if (submitBtnRef.current) {
      submitBtnRef.current.innerText = 'Guardar tarjeta';
    }

    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        showSubmitBtn: true,
        showNewCardBtn: false,
        showCancelBtn: true,
        isSubmitBtnDisabled: false,
        isNewCardBtnDisabled: true,
        isCancelBtnDisabled: false
      }
    }));
    
    if (state.paymentGateway) {
      state.paymentGateway.generate_tokenize(
        getTokenizeData(), 
        '#tokenize_container', 
        handleTokenizationResponse, 
        handleNotCompletedForm
      );
    }
  };

  const removeTokenizationForm = () => {
    if (tokenizeContainerRef.current) {
      tokenizeContainerRef.current.innerHTML = '';
    }
    
    setState(prev => ({
      ...prev,
      ui: {
        ...prev.ui,
        showSubmitBtn: false,
        showNewCardBtn: true,
        showCancelBtn: false,
        isSubmitBtnDisabled: true,
        isNewCardBtnDisabled: false,
        isCancelBtnDisabled: true
      }
    }));
  };

  // Event listeners setup
  useEffect(() => {
    if (!state.loaded || !submitBtnRef.current || !newCardBtnRef.current || !cancelBtnRef.current) {
      return;
    }

    submitBtnRef.current.addEventListener('click', handleSubmitClick);
    newCardBtnRef.current.addEventListener('click', handleNewCardClick);
    cancelBtnRef.current.addEventListener('click', removeTokenizationForm);

    return () => {
      if (submitBtnRef.current) submitBtnRef.current.removeEventListener('click', handleSubmitClick);
      if (newCardBtnRef.current) newCardBtnRef.current.removeEventListener('click', handleNewCardClick);
      if (cancelBtnRef.current) cancelBtnRef.current.removeEventListener('click', removeTokenizationForm);
    };
  }, [state.loaded, state.paymentGateway]);

  // Update response div content
  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.innerHTML = state.responseText;
    }
  }, [state.responseText]);

  // Initial script load
  useEffect(() => {   
    loadScript();
    return () => {
      if (scriptRef.current) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, []);

  return (
    <div style={{...styles.container, ...styles.paymentExampleDiv}} id="payment_example_div">
      <div 
        id="tokenize_container" 
        className="tokenize_container" 
        ref={tokenizeContainerRef} 
        style={styles.tokenizeContainer}
      />
      <div 
        id="response" 
        ref={responseRef}
        style={styles.responseContainer}
      />
      <div style={styles.buttonContainer}>
        <button 
          id="tokenize_btn" 
          ref={submitBtnRef}
          disabled={state.ui.isSubmitBtnDisabled}
          style={{
            ...styles.tokBtn, 
            ...(state.ui.isSubmitBtnDisabled ? styles.tokBtnDisabled : {}),
            display: state.ui.showSubmitBtn ? 'block' : 'none'
          }}
        >
          Guardar tarjeta
        </button> 
        <button 
          id="newCard_btn" 
          ref={newCardBtnRef} 
          disabled={state.ui.isNewCardBtnDisabled}
          style={{
            ...styles.tokBtn,
            ...(state.ui.isNewCardBtnDisabled ? styles.tokBtnDisabled : {}),
            display: state.ui.showNewCardBtn ? 'block' : 'none'
          }}
        >
          Agregar tarjeta
        </button>
        <button 
          id="cancel_btn" 
          ref={cancelBtnRef} 
          disabled={state.ui.isCancelBtnDisabled} 
          style={{
            ...styles.tokBtn,
            ...styles.cancelBtn,
            ...(state.ui.isCancelBtnDisabled ? styles.tokBtnDisabled : {}),
            display: state.ui.showCancelBtn ? 'block' : 'none'
          }}
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '600px',
    minWidth: '400px',
    margin: '10px auto',
    alignItems: 'center',
    justifyContent: 'center',
  },
  paymentExampleDiv: {
    margin: '10px auto',
  },
  tokenizeContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%'
  },
  responseContainer: {
    display: 'flex',
    marginTop: '5px',
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%',
    color: 'red',
  },
  buttonContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%'
  },
  tokBtn: {
    background: 'linear-gradient(to bottom, rgb(65, 107, 197) 0%, rgb(0, 11, 112) 100%)',
    color: '#fff',
    width: '80%',
    border: '1px solid rgba(46, 86, 153, 0.0980392)',
    borderBottomColor: 'rgba(46, 86, 153, 0.4)',
    borderTop: 0,
    borderRadius: '4px',
    fontSize: '17px',
    textShadow: 'rgba(46, 86, 153, 0.298039) 0px -1px 0px',
    lineHeight: '34px',
    WebkitFontSmoothing: 'antialiased',
    fontWeight: 'bold',
    display: 'block',
    cursor: 'pointer',
    marginTop: '5px',
  },
  tokBtnDisabled: {
    opacity: 0.65,
    cursor: 'not-allowed',
  },
  cancelBtn: {
    background: 'linear-gradient(to bottom, rgb(199, 0, 0) 0%, rgb(129, 0, 0) 100%)',
    color: '#fff',
    width: '80%',
    border: '1px solid rgba(46, 86, 153, 0.0980392)',
    borderBottomColor: 'rgba(46, 86, 153, 0.4)',
  },
};

export default TokenizationForm;
