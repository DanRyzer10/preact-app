export function validateCardNumber(cardNumber) {
    const regex = /^\d{16}$/;
    return regex.test(cardNumber) ? '' : 'Invalid card number';
  }
  
  export function validateExpiryDate(expiryDate) {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    return regex.test(expiryDate) ? '' : 'Invalid expiry date';
  }
  
  export function validateCVV(cvv) {
    const regex = /^\d{3,4}$/;
    return regex.test(cvv) ? '' : 'Invalid CVV';
}