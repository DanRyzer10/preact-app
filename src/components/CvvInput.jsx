import { useState } from 'preact/hooks';
import { h } from 'preact';
export function CVVInput({ value, onInput, error }) {
  const handleInput = (e) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    if (input.length <= 4) {
      onInput({ target: { value: input } });
    }
  };

  return (
    <div className="input-group">
      <label htmlFor="expired-date">Vencimiento</label>
      <input
        type="password"
        value={value}
        onInput={handleInput}
        placeholder="CVV"
        className={`card-input ${error ? 'input-error' : ''}`}
        required
        id='expired-date'
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}