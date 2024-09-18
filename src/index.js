import {h,render} from 'preact';

import { useState, useEffect } from 'preact/hooks';
import { validateCardNumber,validateExpiryDate,validateCVV } from './validations';
import {CardNumberInput} from './components/CardNumberInputs.jsx'
import {ExpiryDateInput} from './components/ExpiryDateInput.jsx'
import {CVVInput} from './components/CvvInput.jsx'

function PaymentButton({ config }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({ cardNumber: '', expiryDate: '', cvv: '' });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const cardNumberError = validateCardNumber(cardNumber);
    const expiryDateError = validateExpiryDate(expiryDate);
    const cvvError = validateCVV(cvv);

    if (cardNumberError || expiryDateError || cvvError) {
      setErrors({ cardNumber: cardNumberError, expiryDate: expiryDateError, cvv: cvvError });
      return;
    }

    setProcessing(true);
    console.log('Registrando tarjeta', cardNumber, expiryDate, cvv, config.currency);
    await new Promise(resolve => setTimeout(resolve, 1000)); 
    setProcessing(false);
    setCardNumber('');
    setExpiryDate('');
    setCvv('');
    setErrors({ cardNumber: '', expiryDate: '', cvv: '' });
  };

  return (
    <div>
    <div>
      valor a pagar {config.amount || '0.00'}
    </div>
    <div>
      Descripción {config.description || 'Pago de servicios'}
    </div>
          <form className="card-registration-form" onSubmit={handleSubmit}>
      <CardNumberInput
        value={cardNumber}
        onInput={e => setCardNumber(e.target.value)}
        error={errors.cardNumber}
      />
      <ExpiryDateInput
        value={expiryDate}
        onInput={e => setExpiryDate(e.target.value)}
        error={errors.expiryDate}
      />
      <CVVInput
        value={cvv}
        onInput={e => setCvv(e.target.value)}
        error={errors.cvv}
      />
      <button type="submit" className="submit-button" disabled={processing}>
        {processing ? 'Processing...' : `Register Card (${config.currency})`}
      </button>
    </form>
    </div>

  );
}

class ISSPaymentButton {
  constructor(config) {
    this.config = {
      apiKey: '',
      currency: 'USD',
      amount:'34,32',
      description:'Pago de servicios',
      ...config
    };
    this.container = document.getElementById('iss-checkout');
    if (!this.container) {
      console.error('Container #iss-checkout not found');
      return;
    }
    this.render();
  }

  render() {
    render(<PaymentButton config={this.config} />, this.container);
  }
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.render();
  }
}

window.ISSPaymentButton = ISSPaymentButton;