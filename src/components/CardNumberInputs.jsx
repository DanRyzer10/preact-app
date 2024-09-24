import { useState } from 'preact/hooks';
import { h } from 'preact';

export function CardNumberInput({ value, onInput, error }) {
  return (
    <div className="input-group">
       <label htmlFor="cardNumber">Número de tarjeta</label>
      <input
        type="text"
        value={value}
        onInput={onInput}
        placeholder="Card Number"
        className={`card-input ${error ? 'input-error' : ''}`}
        required
        id='cardNumber'
      />
     
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}