import {h,render} from 'preact';

import { useState, useEffect } from 'preact/hooks';
import { validateCardNumber,validateExpiryDate,validateCVV } from './validations';
import {CardNumberInput} from './components/CardNumberInputs.jsx';
import {ExpiryDateInput} from './components/ExpiryDateInput.jsx';
import {CVVInput} from './components/CvvInput.jsx';
import Encryptor from './utils/encryptor.js';
import handleForm from './utils/handleForm.js';

function PaymentButton({ config,services }) {
  const [cardNumber, setCardNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvv, setCvv] = useState('');
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({ cardNumber: '', expiryDate: '', cvv: '' });
  const [key, setKey] = useState('');
  
  useEffect(() => {
    if(!services.service_key) return;
    fetch(services.service_key,{
    })
      .then(response => response.json())
      .then(data =>setKey(data.key));
  }, []);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    const cardNumberError = validateCardNumber(cardNumber);
    const expiryDateError = validateExpiryDate(expiryDate);
    const cvvError = validateCVV(cvv);
    if (cardNumberError || expiryDateError || cvvError) {
      setErrors({ cardNumber: cardNumberError, expiryDate: expiryDateError, cvv: cvvError });
      return;
    }
    const [expiryMonth, expiryYear] = expiryDate.split('/');
    const rawKey = handleForm(key);
    const encryptor = new Encryptor(btoa(rawKey));
    const cardNumberEnc = encryptor.encrypt(cardNumber);
    const expiryMonthEncrypt = encryptor.encrypt(expiryMonth);
    const expiryYearEncrypt = encryptor.encrypt(expiryYear);
    const cvvEnc = encryptor.encrypt(cvv);
    setProcessing(true);
    // await new Promise(resolve => setTimeout(resolve, 1000)); 
    const response = await fetch(services.service_bridge,{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        card:{
          number: cardNumberEnc,
          expirationMonth: expiryMonthEncrypt,
          expirationYear: expiryYearEncrypt,
          cvv: cvvEnc
        }
      })
    });
    const data = await response.json();
    console.log(data);
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
    this.services = {
      service_key:'http://localhost:3000/api/key',
      service_bridge:'http://localhost:3000/api/webcheckout/bridge-data'
    }
    if (!this.container) {
      console.error('Container #iss-checkout not found');
      return;
    }
    this.render();
  }

  render() {
    render(<PaymentButton config={this.config} services={this.services}/>, this.container);
  }
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.render();
  }
}

window.ISSPaymentButton = ISSPaymentButton;