import React from 'react';
import getAllCards from '../hooks/paymentezNuvei/getAllCards';

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

    const handleDelete = (token) => {
        // TODO: Implement delete functionality
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.title}>Cards</h1>
            <div style={styles.scrollableContainer}>
                <div style={styles.cardsContainer}>
                    {cards.cards.map((card) => (
                        <div key={card.token} style={styles.cardWrapper}>
                            <div style={styles.card}>
                                <div style={styles.cardInfo}>
                                    <p style={styles.cardType}>{card.type.toUpperCase()}</p>
                                    <p style={styles.cardNumber}>**** **** **** {card.number}</p>
                                    <p style={styles.cardHolder}>{card.holder_name}</p>
                                    <p style={styles.cardExpiry}>{card.expiry_month}/{card.expiry_year}</p>
                                </div>
                                <button 
                                    onClick={() => handleDelete(card.token)}
                                    style={styles.deleteButton}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

const styles = {
    container: {
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto',
    },
    title: {
        fontSize: '24px',
        marginBottom: '20px',
        color: '#333',
    },
    scrollableContainer: {
        width: '400px',
        height: '150px',
        overflowY: 'auto',
        border: '1px solid #e9ecef',
        borderRadius: '10px',
        padding: '10px',
        display: 'flex',
        justifyContent: 'center',
    },
    cardsContainer: {
        display: 'flex',
        flexDirection: 'column',
        gap: '15px',
        width: '100%',
        alignItems: 'center',
    },
    cardWrapper: {
        width: '350px',
        display: 'flex',
        justifyContent: 'center',
    },
    card: {
        height: '130px',
        width: '100%',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        padding: '15px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        border: '1px solid #e9ecef',
    },
    cardInfo: {
        flex: 1,
    },
    cardType: {
        fontSize: '14px',
        fontWeight: 'bold',
        margin: '0 0 5px 0',
        color: '#495057',
    },
    cardNumber: {
        fontSize: '16px',
        margin: '0 0 5px 0',
        color: '#212529',
    },
    cardHolder: {
        fontSize: '12px',
        margin: '0 0 5px 0',
        color: '#6c757d',
    },
    cardExpiry: {
        fontSize: '12px',
        margin: '0',
        color: '#6c757d',
    },
    deleteButton: {
        backgroundColor: '#dc3545',
        color: 'white',
        border: 'none',
        padding: '8px 12px',
        borderRadius: '5px',
        cursor: 'pointer',
        fontSize: '14px',
        transition: 'background-color 0.2s',
        '&:hover': {
            backgroundColor: '#c82333',
        },
    },
};

export default Cards;
