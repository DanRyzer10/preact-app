import { h, render } from "preact";
import "preact/debug";
import { useState, useEffect } from "preact/hooks";
import {
  validateCardNumber,
  validateExpiryDate,
  validateCVV,
} from "./validations";
import { CardNumberInput } from "./components/CardNumberInputs.jsx";
import { ExpiryDateInput } from "./components/ExpiryDateInput.jsx";
import { CVVInput } from "./components/CvvInput.jsx";
import { OtpModal } from "./components/Modal.jsx";
import Encryptor from "./utils/encryptor.js";
import handleForm from "./utils/handleForm.js";

function PaymentButton({ config, services }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [processing, setProcessing] = useState(false);
  const [errors, setErrors] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
  });
  const [otpDetails, setOtpDetails] = useState({});
  const [key, setKey] = useState("");
  const [isVisibleModal, setIsVisibleModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [payload, setPayload] = useState({});
  const fetchKey = async () => {
    const response = await fetch(services.service_key);
    const data = await response.json();
    return data.key;
  };
  useEffect(() => {
    fetchKey().then((data) => setKey(data));
  }, []);
  const handleOtpChange = (otp) => {
    setOtp(otp);
  };
  useEffect(async () => {
    if (otp.length === 6) {
      const payloadWithOtp = {
        ...payload,
        paramsOtp:{
          ...otpDetails,
          otpCode:otp
        }
      }
      await postData(
        services.service_bridge,
        payloadWithOtp,
        setIsVisibleModal,
        setProcessing,
        setCardNumber,
        setExpiryDate,
        setCvv,
        setErrors
      )
    }
  }, [otp]);

  useEffect(async () => {
    if (Object.keys(payload).length > 0) {
      await postData(
        services.service_bridge,
        payload,
        setIsVisibleModal,
        setProcessing,
        setCardNumber,
        setExpiryDate,
        setCvv,
        setErrors
      );
    }
  }, [payload]);

  const postData = async (url, payload, setIsVisibleModal, setProcessing, setCardNumber, setExpiryDate, setCvv, setErrors) => {
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (data.code === 100) {
        setIsVisibleModal(true);
        setOtpDetails(data.detail)
      }
      if(data.code === 0){
        config.onRedirect(data.detail)
      }
      console.log(data);
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setProcessing(false);
      setCardNumber("");
      setExpiryDate("");
      setCvv("");
      setErrors({ cardNumber: "", expiryDate: "", cvv: "" });
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    //validacion de campos
    const cardNumberError = validateCardNumber(cardNumber);
    const expiryDateError = validateExpiryDate(expiryDate);
    const cvvError = validateCVV(cvv);
    if (cardNumberError || expiryDateError || cvvError) {
      setErrors({
        cardNumber: cardNumberError,
        expiryDate: expiryDateError,
        cvv: cvvError,
      });
      return;
    }
    const [expiryMonth, expiryYear] = expiryDate.split("/");
    //encriptacion de datos
    const rawKey = handleForm(key);
    console.log(rawKey);
    const encryptor = new Encryptor(btoa(rawKey));
    const cardNumberEnc = encryptor.encrypt(cardNumber);
    const expiryMonthEncrypt = encryptor.encrypt(expiryMonth);
    const expiryYearEncrypt = encryptor.encrypt(expiryYear);
    const cvvEnc = encryptor.encrypt(cvv);
    setPayload({
      card: {
        number: cardNumberEnc,
        expirationMonth: expiryMonthEncrypt,
        expirationYear: expiryYearEncrypt,
        cvv: cvvEnc,
      },
    });
    setProcessing(true);
  };

  return (
    <div>
      <OtpModal
        open={isVisibleModal}
        onAction={() => {}}
        onOtpChange={handleOtpChange}
      />
      <div>valor a pagar {config.amount || "0.00"}</div>
      <div>Descripción {config.description || "Pago de servicios"}</div>
      <form className="card-registration-form" onSubmit={handleSubmit}>
        <CardNumberInput
          value={cardNumber}
          onInput={(e) => setCardNumber(e.target.value)}
          error={errors.cardNumber}
        />
        <ExpiryDateInput
          value={expiryDate}
          onInput={(e) => setExpiryDate(e.target.value)}
          error={errors.expiryDate}
        />
        <CVVInput
          value={cvv}
          onInput={(e) => setCvv(e.target.value)}
          error={errors.cvv}
        />
        <button type="submit" className="submit-button" disabled={processing}>
          {processing ? "Processing..." : `Register Card (${config.currency})`}
        </button>
      </form>
    </div>
  );
}

class ISSPaymentButton {
  constructor(config) {
    this.config = {
      apiKey: "",
      currency: "USD",
      amount: "34,32",
      description: "Pago de servicios",
      ...config,
    };
    this.container = document.getElementById("iss-checkout");
    this.services = {
      service_key: "http://localhost:3000/api/key",
      service_bridge: "http://localhost:3000/api/webcheckout/bridge-data",
    };
    if (!this.container) {
      console.error("Container #iss-checkout not found");
      return;
    }
    this.render();
  }

  render() {
    render(
      <PaymentButton config={this.config} services={this.services} />,
      this.container
    );
  }
  updateConfig(newConfig) {
    this.config = { ...this.config, ...newConfig };
    this.render();
  }
}

window.ISSPaymentButton = ISSPaymentButton;
