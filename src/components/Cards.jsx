import React, { useState, useEffect } from 'react';
import TokenizationForm from './TokenizationForm';
import usePaymentez from '../hooks/usePaymentez';
import { FaWallet, FaCreditCard } from 'react-icons/fa';
import LoadingAnimation from './loadingAnimation';

// Card types with their respective brands and styles
const CARD_BRANDS = {
    vi: { 
        name: 'Visa',
        style: {
            background: 'linear-gradient(135deg, #0165b0 0%, #00579f 100%)',
            color: 'white',
        }
    },
    mc: { 
        name: 'Mastercard',
        style: {
            background: 'linear-gradient(135deg, #eb001b 0%, #ff5f00 50%, #f79e1b 100%)',
            color: 'white',
        }
    },
    ax: { 
        name: 'American Express',
        style: {
            background: 'linear-gradient(135deg, #2671b5 0%, #00adef 100%)',
            color: 'white',
        }
    },
    di: { 
        name: 'Diners',
        style: {
            background: 'linear-gradient(135deg, #0079be 0%, #004a97 100%)',
            color: 'white',
        }
    },
    dc: { 
        name: 'Discover',
        style: {
            background: 'linear-gradient(135deg, #f58220 0%, #ed1c2e 100%)',
            color: 'white',
        }
    },
    ms: { 
        name: 'Maestro',
        style: {
            background: 'linear-gradient(135deg, #0099df 0%, #e32328 100%)',
            color: 'white',
        }
    },
    cs: { 
        name: 'Credisensa',
        style: {
            background: 'linear-gradient(135deg, #fe764a 0%, #cc0001 100%)',
            color: 'white',
        }
    },
    so: { 
        name: 'Solidario',
        style: {
            background: 'linear-gradient(135deg, #3aaa35 0%, #009cde 100%)',
            color: 'white',
        }
    },
    up: { 
        name: 'Union Pay',
        style: {
            background: 'linear-gradient(135deg, #0064ad 0%, #e21836 100%)',
            color: 'white',
        }
    },
    // Default for unknown card types
    default: {
        name: 'Card',
        style: {
            background: 'linear-gradient(135deg, #ffffff 0%, #f5f5f5 100%)',
            color: '#333',
        }
    }
};

const cardsDummy = {
    "cards": [
        {
            "bin": "511915",
            "status": "review",
            "token": "17121538682542236138",
            "holder_name": "citlali calderon",
            "expiry_year": "2020",
            "expiry_month": "9",
            "transaction_reference": "CI-473",
            "type": "vi",
            "number": "7991"
        },
        {
            "bin": "422023",
            "status": "valid",
            "token": "15363681013452573066",
            "holder_name": "citlali calderon",
            "expiry_year": "2020",
            "expiry_month": "9",
            "transaction_reference": null,
            "type": "mc",
            "number": "8431"
        },
        {
            "bin": "453254",
            "status": "valid",
            "token": "10135134879450157925",
            "holder_name": "citlali calderon",
            "expiry_year": "2020",
            "expiry_month": "9",
            "transaction_reference": null,
            "type": "vi",
            "number": "8311"
        }
    ],
    "result_size": 3
}

const Cards = ({ facturaFormValues, onPaymentSubmit }) => {
    const { loading, error, getAllCards, deleteCard, debitPaymentWithToken } = usePaymentez();
    const [selectedCardToken, setSelectedCardToken] = useState(null);
    const [cards, setCards] = useState({cards: []});
    const [localError, setLocalError] = useState(null);
    const [loadingNewCard, setLoadingNewCard] = useState(false);
    const [loadingCards, setLoadingCards] = useState(false);
    
    const loadCards = async () => {
        try {
            console.log("Loading cards...");
            setLocalError(null);
            const response = await getAllCards();
            // Ensure we always have a valid cards object structure
            setCards(response && typeof response === 'object' ? response : { cards: [] });
            console.log("Cards loaded:", response);
        } catch (err) {
            console.error('Error loading cards:', err);
            setLocalError('Error al cargar las tarjetas. Por favor, intente nuevamente.');
            setCards({ cards: [] });
        }
    };

    const handleDelete = async (token) => {
        try {
            setLocalError(null);
            await deleteCard(token);
            await loadCards();
        } catch (err) {
            console.error('Error deleting card:', err);
            setLocalError('Error al eliminar la tarjeta. Por favor, intente nuevamente.');
        }
    };

    const handleSelectCard = (token) => {
        setSelectedCardToken(token);
    };

    // Get brand info based on card type
    const getCardBrand = (type) => {
        return CARD_BRANDS[type] || CARD_BRANDS.default;
    };

    const handlePay = async () => {
        if (!selectedCardToken) {
            setLocalError('Por favor seleccione una tarjeta');
            return;
        }

        
        try {
            // in theis section create a new item in the order table 
            // and get the id of the new item


            // Payment logic will be implemented here
            console.log('Payment initiated with card token:', selectedCardToken);
            console.log('Using form data:', facturaFormValues);
            const order = {
                
                description: facturaFormValues.description,
                dev_reference: "dummy value, create ordeer item",
                vat: parseFloat((facturaFormValues.amount * 0.15).toFixed(2)),
                installments: "value, create list of installments",
                amount: facturaFormValues.amount,
                tax_percentage: 12, //check with nuvei
            };

            const card = {
                token: selectedCardToken,
            }

            const response = await debitPaymentWithToken(order, card);

            console.log("Payment response:", response);

            // in this section create a new item in the 
            // payments table

            // in this section update the payment status of the order item
            
            // Here you would make the actual API call to process the payment
            // For now, simulate success
            if (onPaymentSubmit) {
                onPaymentSubmit({
                    success: true,
                    token: selectedCardToken,
                    data: facturaFormValues
                });
            }
        } catch (error) {
            console.error('Payment error:', error);
            setLocalError('Error al procesar el pago. Por favor, intente nuevamente.');
            
            if (onPaymentSubmit) {
                onPaymentSubmit({
                    success: false,
                    error: 'Error al procesar el pago'
                });
            }
        }
    };

    // Load cards when loadingCards state changes
    useEffect(() => {
        if (loadingCards) {
            loadCards()
                .then(() => {
                    setLoadingCards(false);
                })
                .catch(err => {
                    console.error("Error loading cards:", err);
                    setLoadingCards(false);
                    setLocalError('Error al cargar las tarjetas. Por favor, intente nuevamente.');
                });
        }
    }, [loadingCards]);

    // Load cards on component mount
    useEffect(() => {
        loadCards().catch(err => {
            console.error("Error during initial card load:", err);
            setLocalError('Error al cargar las tarjetas. Por favor, intente nuevamente.');
        });
    }, []);

    return (
        <div style={styles.container}>
            {(loading || loadingNewCard) && <LoadingAnimation />}
            {(error || localError) && (
                <div style={styles.errorContainer}>
                    <p style={styles.errorText}>{error || localError}</p>
                </div>
            )}
            <h1 style={styles.title}>
                <FaCreditCard style={styles.titleIcon} />
                Pago con tarjeta
            </h1>
            <div style={styles.scrollableContainer}>
                <div style={styles.cardsContainer}>
                    {(!cards || !Array.isArray(cards.cards) || cards.cards.length === 0) ? (
                        <div style={styles.noCardsContainer}>
                            <FaWallet style={styles.noCardsIcon} />
                            <p style={styles.noCardsText}>No hay tarjetas guardadas</p>
                            <p style={styles.noCardsSubtext}>Agrega una tarjeta usando el boton de abajo</p>
                        </div>
                    ) : (
                        cards.cards.map((card) => {
                            const brandInfo = getCardBrand(card.type);
                            const isSelected = selectedCardToken === card.token;
                            
                            return (
                                <div key={card.token} style={styles.cardWrapper}>
                                    <div style={{
                                        ...styles.card,
                                        ...brandInfo.style,
                                        ...(isSelected ? styles.selectedCard : {})
                                    }}>
                                        <div style={styles.cardInfo}>
                                            <p style={styles.cardType}>
                                                {brandInfo.name.toUpperCase()}
                                            </p>
                                            <p style={styles.cardNumber}>•••• •••• •••• {card.number}</p>
                                            <p style={styles.cardHolder}>{card.holder_name}</p>
                                            <p style={styles.cardExpiry}>Expires: {card.expiry_month}/{card.expiry_year}</p>
                                        </div>
                                        <div style={styles.buttonContainer}>
                                            <button 
                                                onClick={() => handleSelectCard(card.token)}
                                                style={{
                                                    ...styles.selectButton,
                                                    ...(isSelected ? styles.selectedButton : {})
                                                }}
                                            >
                                                {isSelected ? 'Eligida' : 'Elegir'}
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(card.token)}
                                                style={styles.deleteButton}
                                            >
                                                Borrar
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
            <TokenizationForm 
                setLoadingNewCard={setLoadingNewCard} 
                setLoadCards={setLoadingCards}
                />
            <div style={styles.paymentButtonContainer}>
                <button 
                    onClick={handlePay}
                    disabled={!selectedCardToken || cards.cards.length === 0}
                    style={{
                        ...styles.paymentButton,
                        opacity: (!selectedCardToken || cards.cards.length === 0) ? 0.6 : 1,
                        cursor: (!selectedCardToken || cards.cards.length === 0) ? 'not-allowed' : 'pointer'
                    }}
                >
                    Pagar
                </button>
            </div>
        </div>
    )
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
        background: 'transparent',
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
        color: '#e0e6f7',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
    },
    titleIcon: {
        color: '#4d94ff',
        fontSize: '28px',
    },
    scrollableContainer: {
        width: '420px',
        height: '220px',
        overflowY: 'auto',
        border: 'none',
        borderRadius: '15px',
        padding: '15px',
        display: 'flex',
        justifyContent: 'center',
        //boxShadow: '0 6px 24px rgba(20, 40, 101, 0.25)',
        scrollbarWidth: 'thin',
        scrollbarColor: '#4d94ff #1a2657',
        transition: 'all 0.3s ease',
        marginTop: '15px',
        marginBottom: '15px',
    },
    cardsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        width: '100%',
        alignItems: 'center',
        paddingBottom: '10px',
    },
    cardWrapper: {
        width: '350px',
        display: 'flex',
        justifyContent: 'center',
    },
    card: {
        height: '160px',
        width: '100%',
        borderRadius: '12px',
        padding: '15px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden',
    },
    cardInfo: {
        flex: 1,
        position: 'relative',
        zIndex: 1,
    },
    cardType: {
        fontSize: '13px',
        fontWeight: 'bold',
        margin: '0 0 10px 0',
        letterSpacing: '1px',
        color: 'inherit',
    },
    cardNumber: {
        fontSize: '16px',
        margin: '0 0 10px 0',
        color: 'inherit',
        fontFamily: 'monospace',
        letterSpacing: '1px',
    },
    cardHolder: {
        fontSize: '14px',
        margin: '0 0 5px 0',
        color: 'inherit',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    cardExpiry: {
        fontSize: '12px',
        margin: '0',
        color: 'inherit',
        opacity: 0.85,
    },
    deleteButton: {
        backgroundColor: 'rgba(220, 53, 69, 0.9)',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s',
        fontWeight: '500',
        zIndex: 2,
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        position: 'relative',
    },
    buttonContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '8px',
        zIndex: 2,
    },
    selectButton: {
        backgroundColor: 'rgba(13, 110, 253, 0.9)',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'all 0.2s',
        fontWeight: '500',
        boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
        position: 'relative',
    },
    selectedButton: {
        backgroundColor: '#4d94ff',
        fontWeight: '600',
    },
    selectedCard: {
        transform: 'scale(1.03)',
        boxShadow: '0 8px 25px rgba(77, 148, 255, 0.3)',
        border: '3px solid #4d94ff',
        position: 'relative',
    },
    noCardsContainer: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        textAlign: 'center',
        height: '100%',
        width: '100%',
        color: '#e0e6f7',
    },
    noCardsIcon: {
        fontSize: '48px',
        color: '#4d94ff',
        marginBottom: '15px',
        opacity: 0.8,
    },
    noCardsText: {
        fontSize: '18px',
        fontWeight: '600',
        marginBottom: '8px',
        color: '#e0e6f7',
    },
    noCardsSubtext: {
        fontSize: '14px',
        color: '#a0a8c0',
        maxWidth: '250px',
        lineHeight: '1.4',
    },
    paymentButtonContainer: {
        display: 'flex',
        justifyContent: 'center',
        marginTop: '10px',
        width: '100%'
    },
    errorContainer: {
        backgroundColor: 'rgba(220, 53, 69, 0.1)',
        border: '1px solid rgba(220, 53, 69, 0.2)',
        borderRadius: '8px',
        padding: '12px 16px',
        marginBottom: '20px',
        textAlign: 'center',
    },
    errorText: {
        color: '#dc3545',
        fontSize: '14px',
        margin: 0,
        fontWeight: '500',
    },
    paymentButton: {
        background: 'linear-gradient(90deg, #2ecc71 0%, #27ae60 100%)',
        color: '#fff',
        width: '80%',
        maxWidth: '400px',
        border: 'none',
        borderRadius: '8px',
        fontSize: '18px',
        fontWeight: 'bold',
        lineHeight: '40px',
        boxShadow: '0 2px 8px rgba(46, 204, 113, 0.15)',
        textShadow: '0 1px 2px rgba(0,0,0,0.08)',
        transition: 'all 0.2s cubic-bezier(.4,0,.2,1)',
        outline: 'none',
        '&:hover:not(:disabled)': {
            filter: 'brightness(1.08) saturate(1.2)',
            transform: 'translateY(-2px) scale(1.03)',
            boxShadow: '0 4px 16px rgba(6, 245, 106, 0.18)',
        },
        '&:disabled': {
            filter: 'grayscale(0.3)',
        }
    }
};

export default Cards;
