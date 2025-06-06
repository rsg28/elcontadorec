import React, { useEffect, useRef, useState } from 'react';
import LoadingAnimation from './loadingAnimation';

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
    loading: false,
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

  const userStr = localStorage.getItem('user');
  const user = JSON.parse(userStr);
  
  const userId = user.id;
  const userEmail = user.correo;

  // Load Paymentez script
  const loadScript = async () => {
    const script = document.createElement('script');
    script.src = 'https://cdn.paymentez.com/ccapi/sdk/payment_sdk_stable.min.js';
    script.async = true;
    script.type = 'text/javascript';
    script.charset = 'UTF-8';
    
    script.onload = () => {
      // Paymentez script loaded successfully
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
      id: userId,
      email: userEmail,
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
    try {
      const status = response.card.status;
      
      if (status === 'valid') {
        alert("Tarjeta guardada correctamente");
      } else if (status === "review") {
        // Card under review - handle appropriately
        setState(prev => ({
          ...prev,
          responseText: 'Tarjeta en revisión. Por favor, intente con otra tarjeta.',
          loading: false,
          ui: {
            ...prev.ui,
            isSubmitBtnDisabled: false
          }
        }));
        
        if (submitBtnRef.current) {
          submitBtnRef.current.innerText = 'Guardar tarjeta';
        }
      } else if (status === 403 || status === 404) {
        alert("La tarjeta de crédito no es válida o ya se encuentra registrada.");
      } else {
        alert('Ha ocurrido un error en el servidor. Por favor, inténtelo de nuevo más tarde.');
      }
    } catch (error) {
      console.error('Error processing tokenization response:', error);
      if (error.status === 403 || error.status === 404) {
        alert("La tarjeta de crédito no es válida o ya se encuentra registrada.");
      } else {
        alert('Ha ocurrido un error en el servidor. Por favor, inténtelo de nuevo más tarde.');
      }
    } finally {
      setState(prev => ({ ...prev, loading: false }));
      removeTokenizationForm();
      window.location.reload();
    }
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
      loading: true,
      ui: { ...prev.ui, isSubmitBtnDisabled: true }
    }));

    if (submitBtnRef.current) {
      submitBtnRef.current.innerText = 'Procesando...';
    }
    
    if (state.paymentGateway) {
      try {
        await state.paymentGateway.tokenize();
        // Tokenization successful - handled by callback
      } catch (error) {
        console.error('Tokenization error:', error);
        setState(prev => ({
          ...prev,
          responseText: error.message || 'Error al procesar la tarjeta. Intente nuevamente.',
          loading: false,
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
    <>
      {state.loading && <LoadingAnimation />}
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
            className={`token-btn`}
            style={{ display: state.ui.showSubmitBtn ? 'block' : 'none' }}
          >
            Guardar tarjeta
          </button> 
          <button 
            id="newCard_btn" 
            ref={newCardBtnRef} 
            disabled={state.ui.isNewCardBtnDisabled}
            className={`token-btn`}
            style={{ display: state.ui.showNewCardBtn ? 'block' : 'none' }}
          >
            Agregar tarjeta
          </button>
          <button 
            id="cancel_btn" 
            ref={cancelBtnRef} 
            disabled={state.ui.isCancelBtnDisabled} 
            className={`token-btn cancel`}
            style={{ display: state.ui.showCancelBtn ? 'block' : 'none' }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </>
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
};

/* --- Improved Button Styles --- */
const styleSheet = document.createElement("style");
styleSheet.innerText = `
.token-btn {
  background: linear-gradient(90deg, #3a7bd5 0%, #004e92 100%);
  color: #fff;
  width: 80%;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: bold;
  line-height: 40px;
  box-shadow: 0 2px 8px rgba(58, 123, 213, 0.15);
  text-shadow: 0 1px 2px rgba(0,0,0,0.08);
  cursor: pointer;
  margin-top: 10px;
  transition: all 0.2s cubic-bezier(.4,0,.2,1);
  outline: none;
  display: block;
}
.token-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  filter: grayscale(0.3);
}
.token-btn.cancel {
  background: linear-gradient(90deg, #ff5858 0%, #b90000 100%);
  box-shadow: 0 2px 8px rgba(255, 88, 88, 0.12);
}
.token-btn:hover:not(:disabled),
.token-btn:focus:not(:disabled) {
  filter: brightness(1.08) saturate(1.2);
  transform: translateY(-2px) scale(1.03);
  box-shadow: 0 4px 16px rgba(58, 123, 213, 0.18);
}
.token-btn.cancel:hover:not(:disabled),
.token-btn.cancel:focus:not(:disabled) {
  filter: brightness(1.08) saturate(1.2);
  box-shadow: 0 4px 16px rgba(255, 88, 88, 0.18);
}
`;
document.head.appendChild(styleSheet);

export default TokenizationForm;
