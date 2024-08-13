// src/pages/Donate.jsx
import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './Donate.css'; // Import the CSS file
import logo from '../assets/tp-logo.png'; // Update the path to the logo

const stripePromise = loadStripe('your-public-stripe-key-here'); // Replace with your Stripe public key

const DonationForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cardName, setCardName] = useState('');
  const [amount, setAmount] = useState(''); // New state for donation amount

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !amount) {
      return;
    }

    setLoading(true);

    const cardElement = elements.getElement(CardElement);

    try {
      // Create Payment Intent on the server
      const response = await fetch('/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: parseFloat(amount) * 100 }), // Convert dollars to cents
      });

      const { clientSecret } = await response.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: cardName,
          },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else {
        if (result.paymentIntent.status === 'succeeded') {
          alert('Thank you for your donation!');
        }
      }
    } catch (err) {
      setError(err.message);
    }

    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="donation-form">
      <h2 className="donation-title">Donate to Support Our Mission</h2>
      <div className="form-group">
        <label htmlFor="cardName">Name on the Card</label>
        <input
          type="text"
          id="cardName"
          value={cardName}
          onChange={(e) => setCardName(e.target.value)}
          required
          className="input-field"
        />
      </div>
      <div className="form-group">
        <label htmlFor="amount">Donation Amount ($)</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          required
          className="input-field"
          min="1" // Ensures the amount is at least $1
        />
      </div>
      <div className="form-group card-element-container">
        <label htmlFor="cardElement">Card Details</label>
        <CardElement id="cardElement" className="card-element" />
      </div>
      <button type="submit" disabled={!stripe || loading} className="donation-button">
        {loading ? 'Processing...' : `Submit $${amount} Donation`}
      </button>
      {error && <div className="error-message">{error}</div>}
    </form>
  );
};

const DonatePage = () => (
  <div className="donate-page">
    <div className="logo-container">
      <img src={logo} alt="Trash Panda Logo" className="tp-logo" />
      <div className="thought-bubble">
        <p>Pwetty please</p>
      </div>
    </div>
    <Elements stripe={stripePromise}>
      <DonationForm />
    </Elements>
  </div>
);

export default DonatePage;
