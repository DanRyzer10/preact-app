export function validateCardNumber(cardNumber) {
    const regex = /^\d{14,16}$/;
    return regex.test(cardNumber) ? '' : 'Número de tarjeta inválido';
  }
  
  export function validateExpiryDate(expiryDate) {
    const regex = /^(0[1-9]|1[0-2])\/\d{2}$/;
    return regex.test(expiryDate) ? '' : 'Fecha de expiracion inválido';
  }
  
  export function validateCVV(cvv) {
    const regex = /^\d{3,4}$/;
    return regex.test(cvv) ? '' : 'CVV inválido';
}