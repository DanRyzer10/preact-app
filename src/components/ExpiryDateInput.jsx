import { useState } from 'preact/hooks';
import { h } from 'preact';
export function ExpiryDateInput({ value, onInput, error }) {
  const handleInput = (e) => {
    const input = e.target.value.replace(/\D/g, ''); // Remove non-numeric characters
    let formattedInput = input;
    if (input.length > 2) {
      formattedInput = `${input.slice(0, 2)}/${input.slice(2, 4)}`;
    }
    onInput({ target: { value: formattedInput } });
  };

  return (
    <div className="input-group">
      <input
        type="text"
        value={value}
        onInput={handleInput}
        placeholder="Expiry Date (MM/YY)"
        className={`card-input ${error ? 'input-error' : ''}`}
        required
      />
      {error && <span className="error-message">{error}</span>}
    </div>
  );
}