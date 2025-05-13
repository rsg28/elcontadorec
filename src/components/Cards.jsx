import React, { useState } from 'react';
import TokenizationForm from './TokenizationForm';
import getAllCards from '../hooks/paymentezNuvei/getAllCards';
import { FaCreditCard } from 'react-icons/fa';

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

const cards = {
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

const Cards = () => {
    //const { cards, loading, error } = getAllCards();
    const [selectedCardToken, setSelectedCardToken] = useState(null);

    const handleDelete = (token) => {
        // TODO: Implement delete functionality
    };

    const handleSelectCard = (token) => {
        setSelectedCardToken(token);
    };

    // Get brand info based on card type
    const getCardBrand = (type) => {
        return CARD_BRANDS[type] || CARD_BRANDS.default;
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>
                <FaCreditCard style={styles.titleIcon} />
                Pago con tarjeta
            </h1>
            <div style={styles.scrollableContainer}>
                <div style={styles.cardsContainer}>
                    {cards.cards.map((card) => {
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
                                            {isSelected ? 'Selected' : 'Select'}
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(card.token)}
                                            style={styles.deleteButton}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            <TokenizationForm />
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
        boxShadow: '0 6px 24px rgba(20, 40, 101, 0.25)',
        
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
};

export default Cards;
