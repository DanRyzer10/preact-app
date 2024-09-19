import AES from 'crypto-js/aes';
import Base64 from 'crypto-js/enc-base64';
import ECB from 'crypto-js/mode-ecb';
import Pkcs7 from 'crypto-js/pad-pkcs7';

export default class Encryptor {
  #key;

  constructor(key) {
    this.#key = key;
  }

  encrypt(plaintText) {
    const key = Base64.parse(this.#key); // Decodifica la clave desde base64
    const encrypted = AES.encrypt(plaintText, key, {
      mode: ECB,
      padding: Pkcs7
    });

    return encrypted.toString();
  }
  deofuscate(key){
    
  }
}
